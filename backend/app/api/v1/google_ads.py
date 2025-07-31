from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from datetime import datetime

from app.services.google_ads_service import google_ads_service, CampaignData
from app.services.ai_agent_service import ai_agent_service, AIInsight
from app.core.config import get_settings

settings = get_settings()


router = APIRouter(prefix="/google-ads", tags=["Google Ads"])


# Pydantic Models
class GoogleAdsConfig(BaseModel):
    client_id: str
    client_secret: str
    developer_token: str
    customer_id: str


class CampaignCreate(BaseModel):
    name: str
    budget: float
    start_date: str
    end_date: Optional[str] = None
    campaign_type: str = "SEARCH"


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None


class AdGroupCreate(BaseModel):
    name: str
    campaign_id: str
    cpc_bid: float


class KeywordCreate(BaseModel):
    text: str
    match_type: str = "BROAD"
    ad_group_id: str
    cpc_bid: float


class OptimizationRequest(BaseModel):
    optimization_type: str
    campaign_ids: Optional[List[str]] = None
    auto_apply: bool = False


# Authentication & Setup Endpoints
@router.get("/auth/url")
async def get_auth_url():
    """Get Google OAuth authorization URL"""
    try:
        auth_url = google_ads_service.get_authorization_url()
        return {"auth_url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class OAuthCallbackRequest(BaseModel):
    code: str

@router.post("/auth/callback")
async def handle_auth_callback(request: OAuthCallbackRequest):
    """Handle OAuth callback and store tokens"""
    try:
        tokens = await google_ads_service.handle_oauth_callback(request.code)
        return {"success": True, "tokens": tokens}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/auth/token")
async def get_refresh_token():
    """Get the current refresh token (for debugging/setup purposes)"""
    return {
        "refresh_token": google_ads_service.refresh_token,
        "has_token": bool(google_ads_service.refresh_token),
        "client_initialized": bool(google_ads_service.client)
    }


@router.get("/status")
async def get_client_status():
    """Get Google Ads client initialization status"""
    return {
        "client_initialized": bool(google_ads_service.client),
        "has_refresh_token": bool(google_ads_service.refresh_token),
        "developer_token_configured": bool(settings.google_ads_developer_token)
    }

@router.get("/customers")
async def get_accessible_customers():
    """Get list of accessible Google Ads customers"""
    try:
        customers = await google_ads_service.get_accessible_customers()
        return {"customers": customers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Campaign Management Endpoints
@router.get("/campaigns")
async def get_campaigns(
    customer_id: str = Query(..., description="Google Ads Customer ID")
):
    """Get all campaigns for a customer"""
    try:
        campaigns = await google_ads_service.get_campaigns(customer_id)
        return {
            "campaigns": [
                {
                    "id": c.id,
                    "name": c.name,
                    "status": c.status,
                    "budget_amount": c.budget_amount,
                    "start_date": c.start_date,
                    "end_date": c.end_date,
                    "currency": c.currency,
                    "metrics": {
                        "impressions": c.impressions,
                        "clicks": c.clicks,
                        "conversions": c.conversions,
                        "cost": c.cost,
                        "ctr": c.ctr,
                        "cpc": c.cpc,
                        "conversion_rate": c.conversion_rate
                    }
                }
                for c in campaigns
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/campaigns")
async def create_campaign(
    customer_id: str = Query(..., description="Google Ads Customer ID"),
    campaign: CampaignCreate = None
):
    """Create a new campaign"""
    try:
        campaign_data = {
            "name": campaign.name,
            "budget": campaign.budget,
            "start_date": campaign.start_date,
            "end_date": campaign.end_date
        }
        
        campaign_id = await google_ads_service.create_campaign(customer_id, campaign_data)
        return {"success": True, "campaign_id": campaign_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/campaigns/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    customer_id: str = Query(..., description="Google Ads Customer ID"),
    updates: CampaignUpdate = None
):
    """Update an existing campaign"""
    try:
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        success = await google_ads_service.update_campaign(customer_id, campaign_id, update_data)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    customer_id: str = Query(..., description="Google Ads Customer ID")
):
    """Delete a campaign"""
    try:
        success = await google_ads_service.delete_campaign(customer_id, campaign_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Ad Groups Endpoints
@router.get("/ad-groups")
async def get_ad_groups(
    customer_id: str = Query(..., description="Google Ads Customer ID"),
    campaign_id: Optional[str] = Query(None, description="Filter by campaign ID")
):
    """Get ad groups"""
    try:
        ad_groups = await google_ads_service.get_ad_groups(customer_id, campaign_id)
        return {
            "ad_groups": [
                {
                    "id": ag.id,
                    "name": ag.name,
                    "campaign_id": ag.campaign_id,
                    "status": ag.status,
                    "cpc_bid": ag.cpc_bid,
                    "metrics": {
                        "impressions": ag.impressions,
                        "clicks": ag.clicks,
                        "conversions": ag.conversions,
                        "cost": ag.cost
                    }
                }
                for ag in ad_groups
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Keywords Endpoints
@router.get("/keywords")
async def get_keywords(
    customer_id: str = Query(..., description="Google Ads Customer ID"),
    ad_group_id: Optional[str] = Query(None, description="Filter by ad group ID")
):
    """Get keywords"""
    try:
        keywords = await google_ads_service.get_keywords(customer_id, ad_group_id)
        return {
            "keywords": [
                {
                    "id": kw.id,
                    "text": kw.text,
                    "match_type": kw.match_type,
                    "ad_group_id": kw.ad_group_id,
                    "status": kw.status,
                    "cpc_bid": kw.cpc_bid,
                    "quality_score": kw.quality_score,
                    "metrics": {
                        "impressions": kw.impressions,
                        "clicks": kw.clicks,
                        "conversions": kw.conversions,
                        "cost": kw.cost
                    }
                }
                for kw in keywords
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# AI Agent Endpoints
@router.get("/insights")
async def get_ai_insights(
    customer_id: str = Query(..., description="Google Ads Customer ID"),
    campaign_id: Optional[str] = Query(None, description="Filter by campaign ID")
):
    """Get AI-generated insights and recommendations"""
    try:
        # Get campaign data
        campaigns = await google_ads_service.get_campaigns(customer_id)
        
        if campaign_id:
            campaigns = [c for c in campaigns if c.id == campaign_id]
        
        # Generate insights
        insights = await ai_agent_service.analyze_campaigns(customer_id, campaigns)
        
        return {
            "insights": [
                {
                    "id": insight.id,
                    "type": insight.type,
                    "title": insight.title,
                    "description": insight.description,
                    "impact": insight.impact,
                    "confidence": insight.confidence,
                    "campaign_id": insight.campaign_id,
                    "actionable": insight.actionable,
                    "action_type": insight.action_type,
                    "action_data": insight.action_data,
                    "created_at": insight.created_at,
                    "priority": insight.priority
                }
                for insight in insights
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights/keywords")
async def get_keyword_insights(
    customer_id: str = Query(..., description="Google Ads Customer ID"),
    ad_group_id: Optional[str] = Query(None, description="Filter by ad group ID")
):
    """Get keyword-specific AI insights"""
    try:
        keywords = await google_ads_service.get_keywords(customer_id, ad_group_id)
        insights = await ai_agent_service.analyze_keywords(customer_id, keywords)
        
        return {
            "insights": [
                {
                    "id": insight.id,
                    "type": insight.type,
                    "title": insight.title,
                    "description": insight.description,
                    "impact": insight.impact,
                    "confidence": insight.confidence,
                    "ad_group_id": insight.ad_group_id,
                    "actionable": insight.actionable,
                    "action_type": insight.action_type,
                    "action_data": insight.action_data,
                    "priority": insight.priority
                }
                for insight in insights
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/keyword-suggestions")
async def get_keyword_suggestions(
    customer_id: str = Query(..., description="Google Ads Customer ID"),
    campaign_id: str = Query(..., description="Campaign ID"),
):
    """Get AI-generated keyword suggestions"""
    try:
        # Get existing keywords
        keywords = await google_ads_service.get_keywords(customer_id)
        existing_keywords = [kw.text for kw in keywords]
        
        suggestions = await ai_agent_service.generate_keyword_suggestions(
            customer_id, campaign_id, existing_keywords
        )
        
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize")
async def optimize_campaigns(
    customer_id: str = Query(..., description="Google Ads Customer ID"),
    optimization: OptimizationRequest = None,
    background_tasks: BackgroundTasks = None
):
    """Trigger AI-powered campaign optimization"""
    try:
        results = []
        
        campaign_ids = optimization.campaign_ids or []
        if not campaign_ids:
            # Get all campaigns if none specified
            campaigns = await google_ads_service.get_campaigns(customer_id)
            campaign_ids = [c.id for c in campaigns]
        
        for campaign_id in campaign_ids:
            if optimization.auto_apply:
                # Apply optimizations automatically
                result = await ai_agent_service.auto_optimize_campaign(
                    customer_id, campaign_id, optimization.optimization_type
                )
                results.append({
                    "campaign_id": campaign_id,
                    "result": result
                })
            else:
                # Generate recommendations only
                campaigns = await google_ads_service.get_campaigns(customer_id)
                campaign = next((c for c in campaigns if c.id == campaign_id), None)
                if campaign:
                    insights = await ai_agent_service.analyze_campaigns(customer_id, [campaign])
                    results.append({
                        "campaign_id": campaign_id,
                        "recommendations": len(insights),
                        "insights": [
                            {
                                "title": insight.title,
                                "description": insight.description,
                                "impact": insight.impact,
                                "action_type": insight.action_type
                            }
                            for insight in insights[:5]  # Top 5 recommendations
                        ]
                    })
        
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def get_google_recommendations(
    customer_id: str = Query(..., description="Google Ads Customer ID"),
    campaign_id: str = Query(..., description="Campaign ID")
):
    """Get Google's built-in recommendations"""
    try:
        recommendations = await google_ads_service.get_campaign_recommendations(customer_id, campaign_id)
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance-summary")
async def get_performance_summary(
    customer_id: str = Query(..., description="Google Ads Customer ID")
):
    """Get optimized performance summary with real Google Ads data"""
    try:
        # Use the optimized performance summary method
        summary_data = await google_ads_service.get_performance_summary(customer_id)
        
        # Generate simple insights based on real data
        insights_count = {
            "campaign_insights": summary_data["active_campaigns"],
            "high_priority": 0,
            "actionable": 0
        }
        
        top_insights = []
        
        # CTR insights
        if summary_data["avg_ctr"] < 0.02:
            insights_count["high_priority"] += 1
            insights_count["actionable"] += 1
            top_insights.append({
                "title": "Low CTR Alert",
                "description": f"Average CTR is {summary_data['avg_ctr']:.3f}% - consider optimizing ad copy and targeting",
                "impact": "high",
                "type": "optimization",
                "priority": 1
            })
        
        # Helper function to format currency
        def format_currency(amount: float, currency: str) -> str:
            currency_symbols = {
                'USD': '$', 'AED': 'د.إ', 'SAR': 'ر.س', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
            }
            symbol = currency_symbols.get(currency, currency)
            formatted_amount = f"{amount:,.2f}"
            if currency in ['AED', 'SAR']:
                return f"{formatted_amount} {symbol}"
            else:
                return f"{symbol}{formatted_amount}"
        
        # CPC insights
        if summary_data["avg_cpc"] > 1.0:
            insights_count["actionable"] += 1
            formatted_cpc = format_currency(summary_data['avg_cpc'], summary_data['currency'])
            top_insights.append({
                "title": "High CPC Warning",
                "description": f"Average CPC is {formatted_cpc} - review keyword bidding strategy",
                "impact": "medium",
                "type": "optimization",
                "priority": 2
            })
        
        # Conversion rate insights
        if summary_data["conversion_rate"] < 0.01:
            insights_count["high_priority"] += 1
            insights_count["actionable"] += 1
            top_insights.append({
                "title": "Low Conversion Rate",
                "description": f"Conversion rate is {summary_data['conversion_rate']:.3f}% - optimize landing pages and ad relevance",
                "impact": "high",
                "type": "optimization",
                "priority": 1
            })
        
        # Spend insights
        if summary_data["total_spend"] > 1000:
            formatted_spend = format_currency(summary_data['total_spend'], summary_data['currency'])
            top_insights.append({
                "title": "High Spend Volume",
                "description": f"{formatted_spend} spent in the last 30 days - monitor budget allocation",
                "impact": "medium",
                "type": "budget_alert",
                "priority": 3
            })
        
        return {
            "summary": {
                "total_campaigns": summary_data["total_campaigns"],
                "active_campaigns": summary_data["active_campaigns"],
                "total_cost": summary_data["total_spend"],
                "total_impressions": summary_data["total_impressions"],
                "total_clicks": summary_data["total_clicks"],
                "total_conversions": summary_data["total_conversions"],
                "avg_ctr": summary_data["avg_ctr"] * 100,  # Convert to percentage
                "avg_cpc": summary_data["avg_cpc"],
                "conversion_rate": summary_data["conversion_rate"] * 100,  # Convert to percentage
                "conversion_value": summary_data["conversion_value"],
                "currency": summary_data["currency"],
                "period": summary_data["period"]
            },
            "insights": insights_count,
            "top_insights": sorted(top_insights, key=lambda x: x["priority"])[:5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 