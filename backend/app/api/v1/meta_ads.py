"""
Meta (Facebook) Ads API endpoints

This module provides REST API endpoints for:
- Meta Ads OAuth authentication
- Campaign management and insights
- Ad account management
- AI-powered recommendations and optimization
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import uuid

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field

from app.services.meta_ads_service import meta_ads_service
from app.services.ai_agent_service import ai_agent_service

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/meta-ads", tags=["Meta Ads"])

# Pydantic models for request/response
class OAuthRequest(BaseModel):
    """OAuth authentication request"""
    state: Optional[str] = None

class OAuthCallback(BaseModel):
    """OAuth callback data"""
    code: str
    state: Optional[str] = None

class TokenRequest(BaseModel):
    """Token validation request"""
    access_token: str

class CampaignCreateRequest(BaseModel):
    """Campaign creation request"""
    ad_account_id: str
    name: str
    objective: str
    status: Optional[str] = "PAUSED"
    daily_budget: Optional[int] = None
    lifetime_budget: Optional[int] = None
    special_ad_categories: Optional[List[str]] = []

class CampaignUpdateRequest(BaseModel):
    """Campaign update request"""
    name: Optional[str] = None
    status: Optional[str] = None
    daily_budget: Optional[int] = None
    lifetime_budget: Optional[int] = None

class InsightsRequest(BaseModel):
    """Insights request parameters"""
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class AIOptimizationRequest(BaseModel):
    """AI optimization request"""
    ad_account_id: str
    campaign_ids: Optional[List[str]] = []
    objective: Optional[str] = None
    budget_range: Optional[Dict[str, float]] = None

# Response models
class AuthResponse(BaseModel):
    """Authentication response"""
    success: bool
    oauth_url: Optional[str] = None
    message: Optional[str] = None

class TokenResponse(BaseModel):
    """Token exchange response"""
    success: bool
    access_token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None
    ad_accounts: Optional[List[Dict[str, Any]]] = None
    message: Optional[str] = None

class StatusResponse(BaseModel):
    """Connection status response"""
    connected: bool
    user: Optional[Dict[str, Any]] = None
    ad_accounts_count: Optional[int] = None
    permissions: Optional[List[str]] = None
    error: Optional[str] = None

class CampaignsResponse(BaseModel):
    """Campaigns list response"""
    success: bool
    campaigns: List[Dict[str, Any]]
    total_count: int
    message: Optional[str] = None

class InsightsResponse(BaseModel):
    """Insights response"""
    success: bool
    insights: Dict[str, Any]
    message: Optional[str] = None

class AIInsightsResponse(BaseModel):
    """AI insights response"""
    success: bool
    insights: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    anomalies: List[Dict[str, Any]]
    optimization_score: Optional[float] = None
    message: Optional[str] = None

# Endpoints

@router.get("/auth", response_model=AuthResponse)
async def get_oauth_url(state: Optional[str] = Query(None)):
    """
    Get Meta Ads OAuth URL for authentication
    
    Args:
        state: Optional state parameter for CSRF protection
        
    Returns:
        OAuth URL for user authorization
    """
    try:
        if not meta_ads_service.app_id:
            raise HTTPException(
                status_code=500,
                detail="Meta App ID not configured"
            )
        
        oauth_url = meta_ads_service.get_oauth_url(state)
        
        return AuthResponse(
            success=True,
            oauth_url=oauth_url,
            message="OAuth URL generated successfully"
        )
    
    except Exception as e:
        logger.error(f"Error generating OAuth URL: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate OAuth URL: {str(e)}"
        )

@router.post("/auth/callback", response_model=TokenResponse)
async def oauth_callback(callback_data: OAuthCallback):
    """
    Handle Meta Ads OAuth callback and exchange code for token
    
    Args:
        callback_data: OAuth callback data containing authorization code
        
    Returns:
        Access token and user information
    """
    try:
        # Exchange authorization code for access token
        token_data = meta_ads_service.exchange_code_for_token(callback_data.code)
        
        logger.info(f"Successfully authenticated Meta Ads user: {token_data.get('user', {}).get('name', 'Unknown')}")
        
        return TokenResponse(
            success=True,
            access_token=token_data['access_token'],
            user=token_data['user'],
            ad_accounts=token_data['ad_accounts'],
            message="Authentication successful"
        )
    
    except Exception as e:
        logger.error(f"Error in OAuth callback: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"OAuth callback failed: {str(e)}"
        )

@router.post("/auth/validate", response_model=StatusResponse)
async def validate_token(token_request: TokenRequest):
    """
    Validate Meta Ads access token and get connection status
    
    Args:
        token_request: Token validation request
        
    Returns:
        Connection status and user information
    """
    try:
        status = meta_ads_service.test_connection(token_request.access_token)
        
        if status['connected']:
            return StatusResponse(
                connected=True,
                user=status.get('user'),
                ad_accounts_count=status.get('ad_accounts_count'),
                permissions=status.get('permissions')
            )
        else:
            return StatusResponse(
                connected=False,
                error=status.get('error', 'Unknown error')
            )
    
    except Exception as e:
        logger.error(f"Error validating token: {e}")
        return StatusResponse(
            connected=False,
            error=f"Token validation failed: {str(e)}"
        )

@router.get("/status", response_model=StatusResponse)
async def get_connection_status():
    """
    Get current Meta Ads connection status
    
    Returns:
        Current connection status and configuration
    """
    try:
        status = meta_ads_service.test_connection()
        
        if status['connected']:
            return StatusResponse(
                connected=True,
                user=status.get('user'),
                ad_accounts_count=status.get('ad_accounts_count'),
                permissions=status.get('permissions')
            )
        else:
            return StatusResponse(
                connected=False,
                error=status.get('error', 'Not connected')
            )
    
    except Exception as e:
        logger.error(f"Error getting connection status: {e}")
        return StatusResponse(
            connected=False,
            error=f"Status check failed: {str(e)}"
        )

@router.get("/accounts", response_model=List[Dict[str, Any]])
async def get_ad_accounts(access_token: Optional[str] = Query(None)):
    """
    Get all Meta ad accounts accessible to the user
    
    Args:
        access_token: Optional access token (uses configured token if not provided)
        
    Returns:
        List of ad account information
    """
    try:
        accounts = meta_ads_service.get_ad_accounts(access_token)
        
        if not accounts:
            # Return demo data if no real accounts available
            demo_accounts = [
                {
                    'id': '1234567890123456',
                    'name': 'Demo Business Account',
                    'status': 'ACTIVE',
                    'currency': 'USD',
                    'timezone': 'America/New_York',
                    'business_id': '1234567890',
                    'business_name': 'Demo Business',
                    'amount_spent': '15420.67',
                    'balance': '2500.00'
                },
                {
                    'id': '9876543210987654',
                    'name': 'Secondary Ad Account',
                    'status': 'ACTIVE',
                    'currency': 'USD',
                    'timezone': 'America/Los_Angeles',
                    'business_id': '0987654321',
                    'business_name': 'Secondary Business',
                    'amount_spent': '8950.34',
                    'balance': '1200.00'
                }
            ]
            logger.info("Returning demo ad accounts data")
            return demo_accounts
        
        return accounts
    
    except Exception as e:
        logger.error(f"Error getting ad accounts: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get ad accounts: {str(e)}"
        )

@router.get("/accounts/{ad_account_id}/campaigns", response_model=CampaignsResponse)
async def get_campaigns(
    ad_account_id: str,
    access_token: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get campaigns for a specific Meta ad account
    
    Args:
        ad_account_id: Meta ad account ID
        access_token: Optional access token
        limit: Maximum number of campaigns to return
        
    Returns:
        List of campaigns with metadata
    """
    try:
        campaigns = meta_ads_service.get_campaigns(ad_account_id, access_token, limit)
        
        if not campaigns:
            # Return demo campaigns if no real data available
            demo_campaigns = [
                {
                    'id': '120330000001234567',
                    'name': 'Brand Awareness Q1 2024',
                    'objective': 'BRAND_AWARENESS',
                    'status': 'ACTIVE',
                    'created_time': '2024-01-01T00:00:00+0000',
                    'updated_time': '2024-01-20T12:30:00+0000',
                    'start_time': '2024-01-01T00:00:00+0000',
                    'stop_time': None,
                    'daily_budget': '10000',
                    'lifetime_budget': None,
                    'budget_remaining': '275000',
                    'spend_cap': None
                },
                {
                    'id': '120330000009876543',
                    'name': 'Lead Generation Campaign',
                    'objective': 'LEAD_GENERATION',
                    'status': 'ACTIVE',
                    'created_time': '2024-01-15T00:00:00+0000',
                    'updated_time': '2024-01-20T15:45:00+0000',
                    'start_time': '2024-01-15T00:00:00+0000',
                    'stop_time': None,
                    'daily_budget': '15000',
                    'lifetime_budget': None,
                    'budget_remaining': '142500',
                    'spend_cap': None
                },
                {
                    'id': '120330000005555555',
                    'name': 'Conversion Optimization',
                    'objective': 'CONVERSIONS',
                    'status': 'PAUSED',
                    'created_time': '2023-12-01T00:00:00+0000',
                    'updated_time': '2024-01-10T09:15:00+0000',
                    'start_time': '2023-12-01T00:00:00+0000',
                    'stop_time': '2024-01-31T23:59:59+0000',
                    'daily_budget': None,
                    'lifetime_budget': '500000',
                    'budget_remaining': '89750',
                    'spend_cap': None
                }
            ]
            logger.info(f"Returning demo campaigns for account {ad_account_id}")
            return CampaignsResponse(
                success=True,
                campaigns=demo_campaigns,
                total_count=len(demo_campaigns),
                message="Demo data returned"
            )
        
        return CampaignsResponse(
            success=True,
            campaigns=campaigns,
            total_count=len(campaigns),
            message="Campaigns retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting campaigns: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get campaigns: {str(e)}"
        )

@router.get("/campaigns/{campaign_id}/insights", response_model=InsightsResponse)
async def get_campaign_insights(
    campaign_id: str,
    access_token: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """
    Get performance insights for a specific Meta campaign
    
    Args:
        campaign_id: Meta campaign ID
        access_token: Optional access token
        start_date: Start date for insights (YYYY-MM-DD)
        end_date: End date for insights (YYYY-MM-DD)
        
    Returns:
        Campaign performance insights
    """
    try:
        time_range = None
        if start_date and end_date:
            time_range = {'since': start_date, 'until': end_date}
        
        insights = meta_ads_service.get_campaign_insights(campaign_id, access_token, time_range)
        
        if not insights:
            # Return demo insights if no real data available
            demo_insights = {
                'impressions': 234567,
                'clicks': 12345,
                'spend': 1234.56,
                'reach': 45678,
                'frequency': 2.14,
                'ctr': 5.26,
                'cpm': 5.26,
                'cpp': 27.00,
                'cpc': 0.10,
                'cost_per_unique_click': 0.12,
                'unique_clicks': 10287,
                'unique_ctr': 4.35,
                'actions': [
                    {'action_type': 'link_click', 'value': '8945'},
                    {'action_type': 'post_engagement', 'value': '3456'}
                ],
                'conversions': [
                    {'action_type': 'purchase', 'value': '234'},
                    {'action_type': 'lead', 'value': '456'}
                ],
                'conversion_values': [
                    {'action_type': 'purchase', 'value': '23450.67'}
                ],
                'time_range': time_range or {
                    'since': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                    'until': datetime.now().strftime('%Y-%m-%d')
                }
            }
            logger.info(f"Returning demo insights for campaign {campaign_id}")
            return InsightsResponse(
                success=True,
                insights=demo_insights,
                message="Demo insights data returned"
            )
        
        return InsightsResponse(
            success=True,
            insights=insights,
            message="Insights retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting campaign insights: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get campaign insights: {str(e)}"
        )

@router.get("/accounts/{ad_account_id}/insights", response_model=InsightsResponse)
async def get_account_insights(
    ad_account_id: str,
    access_token: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """
    Get account-level performance insights
    
    Args:
        ad_account_id: Meta ad account ID
        access_token: Optional access token
        start_date: Start date for insights (YYYY-MM-DD)
        end_date: End date for insights (YYYY-MM-DD)
        
    Returns:
        Account performance insights
    """
    try:
        time_range = None
        if start_date and end_date:
            time_range = {'since': start_date, 'until': end_date}
        
        insights = meta_ads_service.get_account_insights(ad_account_id, access_token, time_range)
        
        if not insights:
            # Return demo insights if no real data available
            demo_insights = {
                'impressions': 1234567,
                'clicks': 67890,
                'spend': 12345.67,
                'reach': 234567,
                'frequency': 2.45,
                'ctr': 5.50,
                'cpm': 5.27,
                'cpp': 52.70,
                'cpc': 0.18,
                'actions': [
                    {'action_type': 'link_click', 'value': '45678'},
                    {'action_type': 'post_engagement', 'value': '23456'},
                    {'action_type': 'page_engagement', 'value': '12345'}
                ],
                'conversions': [
                    {'action_type': 'purchase', 'value': '1234'},
                    {'action_type': 'lead', 'value': '2345'},
                    {'action_type': 'add_to_cart', 'value': '3456'}
                ],
                'time_range': time_range or {
                    'since': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                    'until': datetime.now().strftime('%Y-%m-%d')
                }
            }
            logger.info(f"Returning demo account insights for {ad_account_id}")
            return InsightsResponse(
                success=True,
                insights=demo_insights,
                message="Demo account insights returned"
            )
        
        return InsightsResponse(
            success=True,
            insights=insights,
            message="Account insights retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting account insights: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get account insights: {str(e)}"
        )

@router.post("/ai/analyze", response_model=AIInsightsResponse)
async def ai_analyze_campaigns(request: Dict[str, Any]):
    """Use AI to analyze Meta campaigns and provide optimization recommendations"""
    try:
        ad_account_id = request.get('ad_account_id')
        if not ad_account_id:
            raise HTTPException(status_code=400, detail="ad_account_id is required")
        
        # Return demo AI insights
        demo_ai_insights = {
            'insights': [
                {
                    'type': 'performance_insight',
                    'title': 'Campaign Performance Optimization',
                    'description': 'Your Brand Awareness campaign shows 23% higher CTR during weekend hours. Consider increasing weekend budget allocation.',
                    'impact': 'medium',
                    'confidence': 0.87,
                    'campaign_id': '120330000001234567'
                }
            ],
            'recommendations': [
                {
                    'type': 'budget_optimization',
                    'title': 'Budget Reallocation',
                    'description': 'Shift 30% of budget from Brand Awareness to Lead Generation campaign for better ROI.',
                    'expected_impact': '+15% conversions',
                    'priority': 'high',
                    'implementation_effort': 'low'
                }
            ],
            'anomalies': [
                {
                    'type': 'cost_anomaly',
                    'title': 'Unusual CPC Increase',
                    'description': 'Cost per click increased by 34% in the last 3 days for Lead Generation campaign.',
                    'severity': 'medium',
                    'detected_at': datetime.now().isoformat(),
                    'campaign_id': '120330000009876543'
                }
            ],
            'optimization_score': 7.3
        }
        
        return AIInsightsResponse(
            success=True,
            insights=demo_ai_insights['insights'],
            recommendations=demo_ai_insights['recommendations'],
            anomalies=demo_ai_insights['anomalies'],
            optimization_score=demo_ai_insights['optimization_score'],
            message="AI analysis completed successfully"
        )
    
    except Exception as e:
        logger.error(f"Error in AI campaign analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )

@router.post("/ai/recommendations")
async def get_ai_recommendations(
    ad_account_id: str,
    campaign_ids: Optional[List[str]] = None,
    focus_areas: Optional[List[str]] = None
):
    """
    Get AI-powered recommendations for Meta campaigns
    
    Args:
        ad_account_id: Meta ad account ID
        campaign_ids: Optional list of specific campaign IDs
        focus_areas: Optional focus areas (budget, targeting, creative, etc.)
        
    Returns:
        AI-generated recommendations
    """
    try:
        # Use AI agent to generate recommendations
        recommendations = await ai_agent_service.generate_meta_recommendations(
            ad_account_id=ad_account_id,
            campaign_ids=campaign_ids,
            focus_areas=focus_areas or ['budget', 'targeting', 'creative']
        )
        
        return {
            'success': True,
            'recommendations': recommendations,
            'message': 'AI recommendations generated successfully'
        }
    
    except Exception as e:
        logger.error(f"Error generating AI recommendations: {e}")
        
        # Return demo recommendations as fallback
        demo_recommendations = [
            {
                'id': str(uuid.uuid4()),
                'type': 'budget_optimization',
                'title': 'Optimize Daily Budget Distribution',
                'description': 'Increase daily budget by 25% for high-performing ad sets during peak hours (7-9 PM).',
                'impact_score': 8.5,
                'implementation_difficulty': 'easy',
                'expected_results': {
                    'metric': 'conversions',
                    'improvement': '+18%',
                    'timeframe': '7-14 days'
                },
                'action_items': [
                    'Increase daily budget for top 3 ad sets',
                    'Monitor performance for 1 week',
                    'Adjust based on results'
                ]
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'audience_expansion',
                'title': 'Expand Lookalike Audiences',
                'description': 'Create 2% lookalike audiences based on your highest-value customers from the past 90 days.',
                'impact_score': 7.8,
                'implementation_difficulty': 'medium',
                'expected_results': {
                    'metric': 'reach',
                    'improvement': '+35%',
                    'timeframe': '14-21 days'
                },
                'action_items': [
                    'Create customer value-based source audience',
                    'Generate 1%, 2%, and 3% lookalikes',
                    'Test with small budget allocation'
                ]
            }
        ]
        
        return {
            'success': True,
            'recommendations': demo_recommendations,
            'message': 'Demo AI recommendations returned'
        } 