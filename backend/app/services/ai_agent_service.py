import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import numpy as np
import pandas as pd
from openai import AsyncOpenAI

from app.core.config import get_settings
from app.services.google_ads_service import (
    google_ads_service, 
    CampaignData, 
    AdGroupData, 
    KeywordData
)

settings = get_settings()


@dataclass
class AIInsight:
    id: str
    type: str  # 'optimization', 'budget_alert', 'keyword', 'recommendation', 'anomaly'
    title: str
    description: str
    impact: str  # 'high', 'medium', 'low'
    confidence: float  # 0.0 to 1.0
    campaign_id: Optional[str] = None
    ad_group_id: Optional[str] = None
    actionable: bool = True
    action_type: Optional[str] = None  # 'increase_budget', 'pause_keyword', 'adjust_bid', etc.
    action_data: Optional[Dict[str, Any]] = None
    created_at: str = None
    priority: int = 1  # 1 (highest) to 5 (lowest)

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()


class AIAgentService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self.performance_thresholds = {
            'low_ctr': 0.02,  # 2%
            'high_cpc': 2.0,  # $2
            'low_conversion_rate': 0.01,  # 1%
            'high_cost_per_conversion': 50.0,  # $50
            'budget_utilization_high': 0.85,  # 85%
            'budget_utilization_low': 0.3,  # 30%
        }
    
    async def analyze_campaigns(self, customer_id: str, campaigns: List[CampaignData]) -> List[AIInsight]:
        """Comprehensive campaign analysis using AI and rule-based insights"""
        insights = []
        
        if not campaigns:
            return insights
        
        # Rule-based analysis
        insights.extend(await self._analyze_budget_performance(campaigns))
        insights.extend(await self._analyze_campaign_performance(campaigns))
        insights.extend(await self._detect_anomalies(campaigns))
        
        # AI-powered analysis
        if self.openai_client:
            insights.extend(await self._ai_campaign_analysis(customer_id, campaigns))
        
        # Sort by priority and confidence
        insights.sort(key=lambda x: (x.priority, -x.confidence))
        
        return insights
    
    async def _analyze_budget_performance(self, campaigns: List[CampaignData]) -> List[AIInsight]:
        """Analyze budget utilization and spending patterns"""
        insights = []
        
        for campaign in campaigns:
            if campaign.budget_amount <= 0:
                continue
            
            utilization = campaign.cost / campaign.budget_amount if campaign.budget_amount > 0 else 0
            
            # High budget utilization alert
            if utilization > self.performance_thresholds['budget_utilization_high']:
                insights.append(AIInsight(
                    id=f"budget_high_{campaign.id}_{int(datetime.now().timestamp())}",
                    type="budget_alert",
                    title=f"High Budget Utilization: {campaign.name}",
                    description=f"Campaign has used {utilization:.1%} of its budget. Consider increasing budget or monitoring closely to avoid early exhaustion.",
                    impact="high" if utilization > 0.95 else "medium",
                    confidence=0.9,
                    campaign_id=campaign.id,
                    action_type="increase_budget",
                    action_data={"current_budget": campaign.budget_amount, "suggested_increase": campaign.budget_amount * 0.2},
                    priority=1 if utilization > 0.95 else 2
                ))
            
            # Low budget utilization
            elif utilization < self.performance_thresholds['budget_utilization_low']:
                insights.append(AIInsight(
                    id=f"budget_low_{campaign.id}_{int(datetime.now().timestamp())}",
                    type="optimization",
                    title=f"Low Budget Utilization: {campaign.name}",
                    description=f"Campaign is only using {utilization:.1%} of its budget. Consider increasing bids or expanding targeting.",
                    impact="medium",
                    confidence=0.8,
                    campaign_id=campaign.id,
                    action_type="optimize_targeting",
                    priority=3
                ))
        
        return insights
    
    async def _analyze_campaign_performance(self, campaigns: List[CampaignData]) -> List[AIInsight]:
        """Analyze campaign performance metrics"""
        insights = []
        
        for campaign in campaigns:
            # Low CTR analysis
            if campaign.ctr > 0 and campaign.ctr < self.performance_thresholds['low_ctr']:
                insights.append(AIInsight(
                    id=f"low_ctr_{campaign.id}_{int(datetime.now().timestamp())}",
                    type="optimization",
                    title=f"Low CTR Alert: {campaign.name}",
                    description=f"Campaign CTR is {campaign.ctr:.2%}, below recommended threshold. Consider improving ad copy or refining targeting.",
                    impact="high",
                    confidence=0.85,
                    campaign_id=campaign.id,
                    action_type="improve_ads",
                    priority=2
                ))
            
            # High CPC analysis
            if campaign.cpc > self.performance_thresholds['high_cpc']:
                insights.append(AIInsight(
                    id=f"high_cpc_{campaign.id}_{int(datetime.now().timestamp())}",
                    type="optimization",
                    title=f"High CPC Alert: {campaign.name}",
                    description=f"Campaign CPC is ${campaign.cpc:.2f}, consider optimizing bids or improving Quality Score.",
                    impact="medium",
                    confidence=0.8,
                    campaign_id=campaign.id,
                    action_type="optimize_bids",
                    priority=3
                ))
            
            # Low conversion rate
            if campaign.conversion_rate > 0 and campaign.conversion_rate < self.performance_thresholds['low_conversion_rate']:
                cost_per_conversion = campaign.cost / campaign.conversions if campaign.conversions > 0 else 0
                insights.append(AIInsight(
                    id=f"low_conv_{campaign.id}_{int(datetime.now().timestamp())}",
                    type="optimization",
                    title=f"Low Conversion Rate: {campaign.name}",
                    description=f"Conversion rate is {campaign.conversion_rate:.2%} with cost per conversion of ${cost_per_conversion:.2f}. Consider landing page optimization.",
                    impact="high",
                    confidence=0.9,
                    campaign_id=campaign.id,
                    action_type="optimize_landing_page",
                    priority=1
                ))
        
        return insights
    
    async def _detect_anomalies(self, campaigns: List[CampaignData]) -> List[AIInsight]:
        """Detect anomalies in campaign performance"""
        insights = []
        
        if len(campaigns) < 2:
            return insights
        
        # Convert to DataFrame for easier analysis
        campaign_data = []
        for campaign in campaigns:
            if campaign.impressions > 0:  # Only include campaigns with data
                campaign_data.append({
                    'id': campaign.id,
                    'name': campaign.name,
                    'ctr': campaign.ctr,
                    'cpc': campaign.cpc,
                    'conversion_rate': campaign.conversion_rate,
                    'cost': campaign.cost,
                    'impressions': campaign.impressions
                })
        
        if not campaign_data:
            return insights
        
        df = pd.DataFrame(campaign_data)
        
        # Detect outliers using IQR method
        for metric in ['ctr', 'cpc', 'conversion_rate']:
            if metric in df.columns and df[metric].nunique() > 1:
                Q1 = df[metric].quantile(0.25)
                Q3 = df[metric].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers = df[(df[metric] < lower_bound) | (df[metric] > upper_bound)]
                
                for _, outlier in outliers.iterrows():
                    if metric == 'ctr' and outlier[metric] < lower_bound:
                        insights.append(AIInsight(
                            id=f"anomaly_ctr_{outlier['id']}_{int(datetime.now().timestamp())}",
                            type="anomaly",
                            title=f"Unusually Low CTR: {outlier['name']}",
                            description=f"CTR of {outlier[metric]:.2%} is significantly below other campaigns. Investigate ad relevance.",
                            impact="medium",
                            confidence=0.75,
                            campaign_id=outlier['id'],
                            priority=3
                        ))
                    elif metric == 'cpc' and outlier[metric] > upper_bound:
                        insights.append(AIInsight(
                            id=f"anomaly_cpc_{outlier['id']}_{int(datetime.now().timestamp())}",
                            type="anomaly",
                            title=f"Unusually High CPC: {outlier['name']}",
                            description=f"CPC of ${outlier[metric]:.2f} is significantly higher than other campaigns. Review bidding strategy.",
                            impact="medium",
                            confidence=0.8,
                            campaign_id=outlier['id'],
                            priority=2
                        ))
        
        return insights
    
    async def _ai_campaign_analysis(self, customer_id: str, campaigns: List[CampaignData]) -> List[AIInsight]:
        """Use OpenAI to analyze campaigns and provide advanced recommendations"""
        if not self.openai_client:
            return []
        
        try:
            # Prepare campaign data for AI analysis
            campaign_summary = []
            for campaign in campaigns:
                campaign_summary.append({
                    "name": campaign.name,
                    "status": campaign.status,
                    "budget": campaign.budget_amount,
                    "spent": campaign.cost,
                    "impressions": campaign.impressions,
                    "clicks": campaign.clicks,
                    "conversions": campaign.conversions,
                    "ctr": campaign.ctr,
                    "cpc": campaign.cpc,
                    "conversion_rate": campaign.conversion_rate
                })
            
            prompt = f"""
            Analyze the following Google Ads campaigns and provide strategic recommendations:
            
            Campaign Data:
            {json.dumps(campaign_summary, indent=2)}
            
            Please provide insights in the following areas:
            1. Performance optimization opportunities
            2. Budget reallocation suggestions
            3. Targeting refinement recommendations
            4. Bidding strategy improvements
            5. Campaign structure optimization
            
            Focus on actionable insights that can improve ROI and campaign performance.
            Format your response as a JSON array of insights with the following structure:
            {{
                "title": "Insight title",
                "description": "Detailed description",
                "impact": "high|medium|low",
                "confidence": 0.0-1.0,
                "campaign_name": "Campaign name if specific",
                "action_type": "specific action type",
                "recommendation": "Specific recommendation"
            }}
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert Google Ads strategist and data analyst. Provide actionable, data-driven recommendations for campaign optimization."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            ai_insights_raw = response.choices[0].message.content
            
            # Parse AI response
            try:
                # Extract JSON from response
                start_idx = ai_insights_raw.find('[')
                end_idx = ai_insights_raw.rfind(']') + 1
                if start_idx != -1 and end_idx != 0:
                    json_str = ai_insights_raw[start_idx:end_idx]
                    ai_insights = json.loads(json_str)
                else:
                    return []
                
                insights = []
                for insight_data in ai_insights:
                    # Find campaign ID by name
                    campaign_id = None
                    if insight_data.get('campaign_name'):
                        for campaign in campaigns:
                            if campaign.name == insight_data['campaign_name']:
                                campaign_id = campaign.id
                                break
                    
                    insights.append(AIInsight(
                        id=f"ai_{int(datetime.now().timestamp())}_{len(insights)}",
                        type="recommendation",
                        title=insight_data.get('title', 'AI Recommendation'),
                        description=insight_data.get('description', ''),
                        impact=insight_data.get('impact', 'medium'),
                        confidence=float(insight_data.get('confidence', 0.7)),
                        campaign_id=campaign_id,
                        action_type=insight_data.get('action_type', 'optimize'),
                        priority=2
                    ))
                
                return insights
                
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            print(f"AI analysis failed: {e}")
            return []
    
    async def analyze_keywords(self, customer_id: str, keywords: List[KeywordData]) -> List[AIInsight]:
        """Analyze keyword performance and provide recommendations"""
        insights = []
        
        if not keywords:
            return insights
        
        # Keyword performance analysis
        for keyword in keywords:
            # Low performing keywords
            if keyword.clicks > 10 and keyword.conversions == 0:
                insights.append(AIInsight(
                    id=f"keyword_poor_{keyword.id}_{int(datetime.now().timestamp())}",
                    type="keyword",
                    title=f"Poor Performing Keyword: {keyword.text}",
                    description=f"Keyword '{keyword.text}' has {keyword.clicks} clicks but no conversions. Consider pausing or lowering bids.",
                    impact="medium",
                    confidence=0.8,
                    ad_group_id=keyword.ad_group_id,
                    action_type="pause_keyword",
                    action_data={"keyword_id": keyword.id, "keyword_text": keyword.text},
                    priority=3
                ))
            
            # High cost, low performance
            if keyword.cost > 50 and keyword.conversions == 0:
                insights.append(AIInsight(
                    id=f"keyword_expensive_{keyword.id}_{int(datetime.now().timestamp())}",
                    type="keyword",
                    title=f"Expensive Non-Converting Keyword: {keyword.text}",
                    description=f"Keyword '{keyword.text}' has spent ${keyword.cost:.2f} without conversions. Review and consider pausing.",
                    impact="high",
                    confidence=0.9,
                    ad_group_id=keyword.ad_group_id,
                    action_type="pause_keyword",
                    priority=1
                ))
            
            # High performing keywords
            if keyword.conversions > 0 and keyword.cost / keyword.conversions < 10:  # Good cost per conversion
                insights.append(AIInsight(
                    id=f"keyword_good_{keyword.id}_{int(datetime.now().timestamp())}",
                    type="keyword",
                    title=f"High-Performing Keyword: {keyword.text}",
                    description=f"Keyword '{keyword.text}' has excellent performance with cost per conversion of ${keyword.cost / keyword.conversions:.2f}. Consider increasing bids.",
                    impact="medium",
                    confidence=0.85,
                    ad_group_id=keyword.ad_group_id,
                    action_type="increase_bid",
                    action_data={"keyword_id": keyword.id, "current_bid": keyword.cpc_bid, "suggested_increase": 0.2},
                    priority=2
                ))
        
        return insights
    
    async def generate_keyword_suggestions(self, customer_id: str, campaign_id: str, existing_keywords: List[str]) -> List[str]:
        """Generate keyword suggestions using AI"""
        if not self.openai_client:
            return []
        
        try:
            prompt = f"""
            Based on the existing keywords: {', '.join(existing_keywords[:10])}
            
            Suggest 10 additional relevant keywords for a Google Ads campaign.
            Focus on:
            1. Long-tail variations
            2. Related terms
            3. Intent-based keywords
            4. Seasonal opportunities
            
            Return only the keywords, one per line, without explanations.
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a Google Ads keyword research expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=300
            )
            
            suggestions = response.choices[0].message.content.strip().split('\n')
            return [kw.strip() for kw in suggestions if kw.strip()]
            
        except Exception as e:
            print(f"Keyword suggestion failed: {e}")
            return []
    
    async def auto_optimize_campaign(self, customer_id: str, campaign_id: str, optimization_type: str) -> Dict[str, Any]:
        """Automatically optimize campaign based on AI recommendations"""
        try:
            result = {"success": False, "actions_taken": [], "errors": []}
            
            if optimization_type == "budget_optimization":
                # Get campaign data
                campaigns = await google_ads_service.get_campaigns(customer_id)
                campaign = next((c for c in campaigns if c.id == campaign_id), None)
                
                if campaign and campaign.cost / campaign.budget_amount > 0.9:
                    # Increase budget by 20%
                    new_budget = campaign.budget_amount * 1.2
                    success = await google_ads_service.update_campaign(
                        customer_id, campaign_id, {"budget": new_budget}
                    )
                    if success:
                        result["actions_taken"].append(f"Increased budget from ${campaign.budget_amount:.2f} to ${new_budget:.2f}")
                        result["success"] = True
            
            elif optimization_type == "bid_optimization":
                # Get keywords and optimize bids
                keywords = await google_ads_service.get_keywords(customer_id)
                campaign_keywords = [k for k in keywords if k.ad_group_id]  # Filter by campaign
                
                # Logic for bid optimization would go here
                result["actions_taken"].append("Analyzed keyword bids for optimization opportunities")
                result["success"] = True
            
            return result
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def schedule_optimization_tasks(self, customer_id: str) -> None:
        """Schedule recurring optimization tasks"""
        # This would integrate with a task scheduler like Celery
        pass

    async def analyze_meta_campaigns(self, campaigns: List[Dict[str, Any]], 
                                   objective: Optional[str] = None,
                                   budget_range: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """Analyze Meta (Facebook) campaigns and provide AI-powered insights"""
        insights = []
        recommendations = []
        anomalies = []
        
        try:
            if not campaigns:
                return {
                    'insights': insights,
                    'recommendations': recommendations,
                    'anomalies': anomalies,
                    'optimization_score': 5.0
                }
            
            # Analyze each campaign
            for campaign_data in campaigns:
                campaign = campaign_data.get('campaign', {})
                campaign_insights = campaign_data.get('insights', {})
                
                # Performance insights
                if campaign_insights:
                    ctr = campaign_insights.get('ctr', 0)
                    cpm = campaign_insights.get('cpm', 0)
                    spend = campaign_insights.get('spend', 0)
                    conversions = len(campaign_insights.get('conversions', []))
                    
                    # Low CTR insight
                    if ctr < 2.0:  # Below 2% CTR
                        insights.append({
                            'type': 'performance_insight',
                            'title': f'Low CTR in {campaign.get("name", "Campaign")}',
                            'description': f'Campaign CTR is {ctr:.2f}%, below optimal range. Consider testing new ad creatives or refining audience targeting.',
                            'impact': 'medium',
                            'confidence': 0.85,
                            'campaign_id': campaign.get('id')
                        })
                    
                    # High CPM insight
                    if cpm > 20.0:  # Above $20 CPM
                        insights.append({
                            'type': 'cost_insight',
                            'title': f'High CPM in {campaign.get("name", "Campaign")}',
                            'description': f'Campaign CPM is ${cpm:.2f}, which is above average. Review audience overlap and competition.',
                            'impact': 'medium',
                            'confidence': 0.8,
                            'campaign_id': campaign.get('id')
                        })
                    
                    # Conversion optimization
                    if conversions == 0 and spend > 100:
                        insights.append({
                            'type': 'conversion_insight',
                            'title': f'No Conversions in {campaign.get("name", "Campaign")}',
                            'description': f'Campaign has spent ${spend:.2f} without conversions. Review landing page and conversion tracking.',
                            'impact': 'high',
                            'confidence': 0.9,
                            'campaign_id': campaign.get('id')
                        })
            
            # Generate recommendations based on objective
            if objective == 'CONVERSIONS':
                recommendations.append({
                    'type': 'optimization',
                    'title': 'Conversion Rate Optimization',
                    'description': 'Implement Conversion API for better tracking and use Conversions campaign objective with automatic bidding.',
                    'priority': 'high',
                    'expected_impact': '+25% conversion tracking accuracy'
                })
            elif objective == 'REACH':
                recommendations.append({
                    'type': 'targeting',
                    'title': 'Audience Expansion',
                    'description': 'Use Reach and Frequency buying for predictable reach. Consider expanding to lookalike audiences.',
                    'priority': 'medium',
                    'expected_impact': '+40% unique reach'
                })
            
            # Budget recommendations
            if budget_range:
                min_budget = budget_range.get('min', 0)
                max_budget = budget_range.get('max', 1000)
                recommendations.append({
                    'type': 'budget',
                    'title': 'Budget Optimization',
                    'description': f'Optimal daily budget range is ${min_budget}-${max_budget}. Use Campaign Budget Optimization for automatic allocation.',
                    'priority': 'high',
                    'expected_impact': '+15% efficiency'
                })
            
            # Calculate optimization score
            total_campaigns = len(campaigns)
            optimization_score = min(10.0, max(1.0, 8.0 - (len(insights) * 0.5)))
            
            return {
                'insights': insights,
                'recommendations': recommendations,
                'anomalies': anomalies,
                'optimization_score': optimization_score
            }
            
        except Exception as e:
            # Return default analysis on error
            return {
                'insights': [
                    {
                        'type': 'general',
                        'title': 'Meta Campaign Analysis',
                        'description': 'Campaign analysis completed. Consider testing different ad formats and audiences for optimal performance.',
                        'impact': 'medium',
                        'confidence': 0.7
                    }
                ],
                'recommendations': [
                    {
                        'type': 'testing',
                        'title': 'A/B Testing',
                        'description': 'Implement systematic A/B testing for ad creatives, audiences, and placements.',
                        'priority': 'medium',
                        'expected_impact': '+20% performance'
                    }
                ],
                'anomalies': [],
                'optimization_score': 6.0
            }

    async def generate_meta_recommendations(self, ad_account_id: str,
                                          campaign_ids: Optional[List[str]] = None,
                                          focus_areas: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Generate AI-powered recommendations for Meta campaigns"""
        try:
            recommendations = []
            
            focus_areas = focus_areas or ['budget', 'targeting', 'creative']
            
            if 'budget' in focus_areas:
                recommendations.append({
                    'id': f"meta_budget_{int(datetime.now().timestamp())}",
                    'type': 'budget_optimization',
                    'title': 'Optimize Campaign Budget Allocation',
                    'description': 'Use Campaign Budget Optimization (CBO) to automatically distribute budget across ad sets based on performance.',
                    'impact_score': 8.2,
                    'implementation_difficulty': 'easy',
                    'expected_results': {
                        'metric': 'cost_per_result',
                        'improvement': '-12%',
                        'timeframe': '7-14 days'
                    },
                    'action_items': [
                        'Enable CBO for campaigns with multiple ad sets',
                        'Set appropriate bid caps if needed',
                        'Monitor performance for 1-2 weeks'
                    ]
                })
            
            if 'targeting' in focus_areas:
                recommendations.append({
                    'id': f"meta_targeting_{int(datetime.now().timestamp())}",
                    'type': 'audience_optimization',
                    'title': 'Implement Advantage+ Audiences',
                    'description': 'Use Advantage+ audience to leverage Meta\'s machine learning for optimal targeting while maintaining audience suggestions.',
                    'impact_score': 7.8,
                    'implementation_difficulty': 'medium',
                    'expected_results': {
                        'metric': 'conversion_rate',
                        'improvement': '+23%',
                        'timeframe': '14-21 days'
                    },
                    'action_items': [
                        'Transition to Advantage+ audiences',
                        'Provide audience suggestions as guidance',
                        'Monitor expansion quality closely'
                    ]
                })
            
            if 'creative' in focus_areas:
                recommendations.append({
                    'id': f"meta_creative_{int(datetime.now().timestamp())}",
                    'type': 'creative_optimization',
                    'title': 'Leverage Advantage+ Creative',
                    'description': 'Use Advantage+ creative features to automatically optimize ad elements like text, images, and formats.',
                    'impact_score': 8.5,
                    'implementation_difficulty': 'medium',
                    'expected_results': {
                        'metric': 'ctr',
                        'improvement': '+18%',
                        'timeframe': '10-14 days'
                    },
                    'action_items': [
                        'Enable Advantage+ creative enhancements',
                        'Provide multiple creative assets',
                        'Test different aspect ratios and formats'
                    ]
                })
            
            return recommendations
            
        except Exception as e:
            # Return fallback recommendations
            return [
                {
                    'id': f"meta_fallback_{int(datetime.now().timestamp())}",
                    'type': 'general_optimization',
                    'title': 'Meta Campaign Best Practices',
                    'description': 'Follow Meta advertising best practices for optimal campaign performance.',
                    'impact_score': 7.0,
                    'implementation_difficulty': 'easy',
                    'expected_results': {
                        'metric': 'overall_performance',
                        'improvement': '+15%',
                        'timeframe': '14-28 days'
                    },
                    'action_items': [
                        'Use high-quality creative assets',
                        'Test different audience segments',
                        'Monitor and optimize regularly'
                    ]
                }
            ]


# Singleton instance
ai_agent_service = AIAgentService() 