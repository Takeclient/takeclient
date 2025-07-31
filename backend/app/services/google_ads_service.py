import os
import json
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import asyncio
from dataclasses import dataclass

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
import httpx

from app.core.config import get_settings

settings = get_settings()


@dataclass
class CampaignData:
    id: str
    name: str
    status: str
    budget_amount: float
    budget_type: str
    start_date: str
    end_date: Optional[str]
    currency: str = "USD"  # Default to USD, will be updated with actual currency
    impressions: int = 0
    clicks: int = 0
    conversions: float = 0
    cost: float = 0
    ctr: float = 0
    cpc: float = 0
    conversion_rate: float = 0


@dataclass
class AdGroupData:
    id: str
    name: str
    campaign_id: str
    status: str
    cpc_bid: float
    impressions: int = 0
    clicks: int = 0
    conversions: float = 0
    cost: float = 0


@dataclass
class KeywordData:
    id: str
    text: str
    match_type: str
    ad_group_id: str
    status: str
    cpc_bid: float
    quality_score: Optional[int] = None
    impressions: int = 0
    clicks: int = 0
    conversions: float = 0
    cost: float = 0


class GoogleAdsService:
    def __init__(self):
        self.client = None
        self.customer_id = None
        self.refresh_token = None
        self._setup_client()
    
    def set_refresh_token(self, refresh_token: str):
        """Set refresh token and reinitialize client"""
        self.refresh_token = refresh_token
        self._setup_client(refresh_token)
    
    def _setup_client(self, refresh_token: str = None):
        """Initialize Google Ads client with configuration"""
        try:
            # Use provided refresh token or settings
            refresh_token = refresh_token or settings.google_ads_refresh_token
            
            config = {
                "developer_token": settings.google_ads_developer_token,
                "client_id": settings.google_ads_client_id,
                "client_secret": settings.google_ads_client_secret,
                "refresh_token": refresh_token,
                "use_proto_plus": True,
            }
            
            # Check if we have minimum required configs (developer token, client_id, client_secret)
            required_configs = [
                settings.google_ads_developer_token,
                settings.google_ads_client_id, 
                settings.google_ads_client_secret
            ]
            
            if all(required_configs) and refresh_token:
                self.client = GoogleAdsClient.load_from_dict(config)
                self.refresh_token = refresh_token
                self.customer_id = settings.google_ads_customer_id
                print(f"✅ Google Ads client initialized successfully")
            else:
                print(f"⚠️ Google Ads client not fully configured. Missing: refresh_token={not refresh_token}")
                
        except Exception as e:
            print(f"❌ Failed to initialize Google Ads client: {e}")
    
    def get_oauth_flow(self) -> Flow:
        """Create OAuth2 flow for Google Ads authentication"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.google_ads_client_id,
                    "client_secret": settings.google_ads_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.google_oauth_redirect_uri]
                }
            },
            scopes=["https://www.googleapis.com/auth/adwords"]
        )
        flow.redirect_uri = settings.google_oauth_redirect_uri
        return flow
    
    def get_authorization_url(self) -> str:
        """Get Google OAuth authorization URL"""
        flow = self.get_oauth_flow()
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        return auth_url
    
    async def handle_oauth_callback(self, code: str) -> Dict[str, Any]:
        """Handle OAuth callback and get tokens"""
        try:
            flow = self.get_oauth_flow()
            flow.fetch_token(code=code)
            
            credentials = flow.credentials
            
            # Initialize the client with the new refresh token
            if credentials.refresh_token:
                self.refresh_token = credentials.refresh_token
                self._setup_client(credentials.refresh_token)
                
                # Save refresh token to environment file
                await self._save_refresh_token(credentials.refresh_token)
            
            return {
                "success": True,
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "expires_at": credentials.expiry.isoformat() if credentials.expiry else None,
                "client_initialized": bool(self.client)
            }
        except Exception as e:
            raise Exception(f"OAuth callback failed: {str(e)}")
    
    async def _save_refresh_token(self, refresh_token: str):
        """Save refresh token to .env file"""
        try:
            import os
            env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
            
            # Read current .env content
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    lines = f.readlines()
            else:
                lines = []
            
            # Update or add refresh token line
            updated = False
            for i, line in enumerate(lines):
                if line.startswith('GOOGLE_ADS_REFRESH_TOKEN='):
                    lines[i] = f'GOOGLE_ADS_REFRESH_TOKEN={refresh_token}\n'
                    updated = True
                    break
            
            if not updated:
                lines.append(f'GOOGLE_ADS_REFRESH_TOKEN={refresh_token}\n')
            
            # Write back to .env file
            with open(env_path, 'w') as f:
                f.writelines(lines)
                
            print(f"✅ Refresh token saved to .env file")
            
        except Exception as e:
            print(f"❌ Failed to save refresh token to .env: {e}")
    
    async def get_accessible_customers(self) -> List[Dict[str, str]]:
        """Get list of Google Ads accounts accessible to the user"""
        if not self.client:
            raise Exception("Google Ads client not initialized. Please complete OAuth authentication.")
        
        try:
            customer_service = self.client.get_service("CustomerService")
            accessible_customers = customer_service.list_accessible_customers()
            
            customers = []
            for customer_resource in accessible_customers.resource_names:
                customer_id = customer_resource.split("/")[-1]
                
                # Get customer details
                customer_client = self.client.get_service("GoogleAdsService")
                query = f"""
                    SELECT 
                        customer.id,
                        customer.descriptive_name,
                        customer.currency_code,
                        customer.time_zone
                    FROM customer 
                    WHERE customer.id = {customer_id}
                """
                
                try:
                    response = customer_client.search(
                        customer_id=customer_id,
                        query=query
                    )
                    
                    for row in response:
                        customers.append({
                            "id": str(row.customer.id),
                            "name": row.customer.descriptive_name or f"Google Ads Account {customer_id}",
                            "currency": row.customer.currency_code,
                            "timezone": row.customer.time_zone
                        })
                        break  # Only need the first (and only) result
                except Exception as e:
                    print(f"⚠️ Skipping customer {customer_id}: {e}")
                    continue
            
            if not customers:
                print("⚠️ No accessible Google Ads customers found. This might be because:")
                print("   - The Google account has no Google Ads accounts")
                print("   - The accounts need to be linked to the OAuth application")
                print("   - Account permissions need to be configured")
            else:
                print(f"✅ Found {len(customers)} accessible Google Ads accounts")
                        
            return customers
        except Exception as e:
            print(f"❌ Failed to get accessible customers: {e}")
            raise Exception(f"Failed to get accessible customers: {str(e)}")
    
    async def get_campaigns(self, customer_id: str = None) -> List[CampaignData]:
        """Get all campaigns for a customer"""
        if not self.client:
            raise Exception("Google Ads client not initialized. Please complete OAuth authentication.")

        customer_id = customer_id or self.customer_id
        if not customer_id:
            raise Exception("Customer ID not provided")

        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            # First get customer currency
            currency_code = "USD"  # Default fallback
            try:
                customer_query = """
                    SELECT customer.currency_code
                    FROM customer
                """
                customer_response = ga_service.search(customer_id=customer_id, query=customer_query)
                for row in customer_response:
                    if hasattr(row.customer, 'currency_code') and row.customer.currency_code:
                        currency_code = row.customer.currency_code
                    break
                print(f"🔍 Currency for customer {customer_id}: {currency_code}")
            except Exception as e:
                print(f"⚠️ Failed to fetch currency for customer {customer_id}, using USD: {e}")
                currency_code = "USD"
            
            # Optimized query with date filtering for better performance
            query = """
                SELECT 
                    campaign.id,
                    campaign.name,
                    campaign.status,
                    campaign.start_date,
                    campaign.end_date,
                    campaign_budget.amount_micros,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.conversions,
                    metrics.cost_micros,
                    metrics.ctr,
                    metrics.average_cpc
                FROM campaign 
                WHERE campaign.status IN ('ENABLED', 'PAUSED')
                AND segments.date DURING LAST_30_DAYS
                ORDER BY metrics.cost_micros DESC
            """
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            campaigns = []
            campaign_data = {}
            
            # Group metrics by campaign to aggregate data
            for row in response:
                campaign = row.campaign
                metrics = row.metrics
                budget = getattr(row, 'campaign_budget', None)
                
                campaign_id = str(campaign.id)
                if campaign_id not in campaign_data:
                    campaign_data[campaign_id] = {
                        'campaign': campaign,
                        'budget_amount': budget.amount_micros / 1_000_000 if budget and budget.amount_micros else 0,
                        'impressions': 0,
                        'clicks': 0,
                        'conversions': 0,
                        'cost': 0,
                        'ctr_sum': 0,
                        'cpc_sum': 0,
                        'days': 0
                    }
                
                # Aggregate metrics
                data = campaign_data[campaign_id]
                data['impressions'] += metrics.impressions or 0
                data['clicks'] += metrics.clicks or 0
                data['conversions'] += metrics.conversions or 0
                data['cost'] += (metrics.cost_micros or 0) / 1_000_000
                data['ctr_sum'] += metrics.ctr or 0
                data['cpc_sum'] += (metrics.average_cpc or 0) / 1_000_000
                data['days'] += 1
            
            # Convert to CampaignData objects
            for campaign_id, data in campaign_data.items():
                campaign = data['campaign']
                avg_ctr = data['ctr_sum'] / data['days'] if data['days'] > 0 else 0
                avg_cpc = data['cpc_sum'] / data['days'] if data['days'] > 0 else 0
                
                campaigns.append(CampaignData(
                    id=campaign_id,
                    name=campaign.name,
                    status=campaign.status.name,
                    budget_amount=data['budget_amount'],
                    budget_type="STANDARD",
                    start_date=campaign.start_date,
                    end_date=campaign.end_date if campaign.end_date else None,
                    currency=currency_code,
                    impressions=data['impressions'],
                    clicks=data['clicks'],
                    conversions=data['conversions'],
                    cost=data['cost'],
                    ctr=avg_ctr,
                    cpc=avg_cpc,
                    conversion_rate=data['conversions'] / data['clicks'] if data['clicks'] > 0 else 0
                ))
            
            print(f"✅ Found {len(campaigns)} campaigns for customer {customer_id}")
            return campaigns
        except Exception as e:
            print(f"❌ Failed to get campaigns for customer {customer_id}: {e}")
            raise Exception(f"Failed to get campaigns: {str(e)}")
    
    async def get_performance_summary(self, customer_id: str) -> Dict[str, Any]:
        """Get performance summary for analytics dashboard"""
        if not self.client:
            raise Exception("Google Ads client not initialized. Please complete OAuth authentication.")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            # First get customer currency
            currency_code = "USD"  # Default fallback
            try:
                customer_query = """
                    SELECT customer.currency_code
                    FROM customer
                """
                customer_response = ga_service.search(customer_id=customer_id, query=customer_query)
                for row in customer_response:
                    if hasattr(row.customer, 'currency_code') and row.customer.currency_code:
                        currency_code = row.customer.currency_code
                    break
                print(f"🔍 Performance summary currency for customer {customer_id}: {currency_code}")
            except Exception as e:
                print(f"⚠️ Failed to fetch currency for performance summary customer {customer_id}, using USD: {e}")
                currency_code = "USD"
            
            # Query for account-level metrics
            query = """
                SELECT 
                    metrics.impressions,
                    metrics.clicks,
                    metrics.conversions,
                    metrics.cost_micros,
                    metrics.ctr,
                    metrics.average_cpc,
                    metrics.conversions_value
                FROM customer 
                WHERE segments.date DURING LAST_30_DAYS
            """
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            total_impressions = 0
            total_clicks = 0
            total_conversions = 0
            total_cost = 0
            total_conversion_value = 0
            days_count = 0
            ctr_sum = 0
            cpc_sum = 0
            
            for row in response:
                metrics = row.metrics
                total_impressions += metrics.impressions or 0
                total_clicks += metrics.clicks or 0
                total_conversions += metrics.conversions or 0
                total_cost += (metrics.cost_micros or 0) / 1_000_000
                total_conversion_value += metrics.conversions_value or 0
                ctr_sum += metrics.ctr or 0
                cpc_sum += (metrics.average_cpc or 0) / 1_000_000
                days_count += 1
            
            avg_ctr = ctr_sum / days_count if days_count > 0 else 0
            avg_cpc = cpc_sum / days_count if days_count > 0 else 0
            conversion_rate = total_conversions / total_clicks if total_clicks > 0 else 0
            
            # Get campaign count
            campaigns = await self.get_campaigns(customer_id)
            active_campaigns = len([c for c in campaigns if c.status == 'ENABLED'])
            
            return {
                "total_spend": total_cost,
                "total_impressions": total_impressions,
                "total_clicks": total_clicks,
                "total_conversions": total_conversions,
                "avg_ctr": avg_ctr,
                "avg_cpc": avg_cpc,
                "conversion_rate": conversion_rate,
                "conversion_value": total_conversion_value,
                "active_campaigns": active_campaigns,
                "total_campaigns": len(campaigns),
                "currency": currency_code,
                "period": "Last 30 days"
            }
            
        except Exception as e:
            print(f"❌ Failed to get performance summary for customer {customer_id}: {e}")
            raise Exception(f"Failed to get performance summary: {str(e)}")
    
    async def create_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> str:
        """Create a new campaign"""
        if not self.client:
            raise Exception("Google Ads client not initialized")
        
        try:
            campaign_service = self.client.get_service("CampaignService")
            campaign_budget_service = self.client.get_service("CampaignBudgetService")
            
            # Create campaign budget
            campaign_budget_operation = self.client.get_type("CampaignBudgetOperation")
            campaign_budget = campaign_budget_operation.create
            campaign_budget.name = f"{campaign_data['name']} Budget"
            campaign_budget.delivery_method = self.client.enums.BudgetDeliveryMethodEnum.STANDARD
            campaign_budget.amount_micros = int(campaign_data['budget'] * 1_000_000)  # Convert to micros
            
            budget_response = campaign_budget_service.mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[campaign_budget_operation]
            )
            budget_resource_name = budget_response.results[0].resource_name
            
            # Create campaign
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            campaign.name = campaign_data['name']
            campaign.advertising_channel_type = self.client.enums.AdvertisingChannelTypeEnum.SEARCH
            campaign.status = self.client.enums.CampaignStatusEnum.ENABLED
            campaign.campaign_budget = budget_resource_name
            campaign.start_date = campaign_data.get('start_date', datetime.now().strftime('%Y-%m-%d'))
            
            if campaign_data.get('end_date'):
                campaign.end_date = campaign_data['end_date']
            
            campaign_response = campaign_service.mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            return campaign_response.results[0].resource_name.split("/")[-1]
        except GoogleAdsException as e:
            raise Exception(f"Failed to create campaign: {e}")
    
    async def update_campaign(self, customer_id: str, campaign_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing campaign"""
        if not self.client:
            raise Exception("Google Ads client not initialized")
        
        try:
            campaign_service = self.client.get_service("CampaignService")
            campaign_operation = self.client.get_type("CampaignOperation")
            
            campaign = campaign_operation.update
            campaign.resource_name = f"customers/{customer_id}/campaigns/{campaign_id}"
            
            if 'name' in updates:
                campaign.name = updates['name']
            if 'status' in updates:
                campaign.status = getattr(
                    self.client.enums.CampaignStatusEnum, 
                    updates['status'].upper()
                )
            
            field_mask = self.client.get_service("FieldMaskService").field_mask(
                campaign.__class__().__dict__.keys()
            )
            campaign_operation.update_mask.CopyFrom(field_mask)
            
            campaign_service.mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            return True
        except GoogleAdsException as e:
            raise Exception(f"Failed to update campaign: {e}")
    
    async def delete_campaign(self, customer_id: str, campaign_id: str) -> bool:
        """Delete (remove) a campaign"""
        if not self.client:
            raise Exception("Google Ads client not initialized")
        
        try:
            campaign_service = self.client.get_service("CampaignService")
            campaign_operation = self.client.get_type("CampaignOperation")
            
            campaign_operation.remove = f"customers/{customer_id}/campaigns/{campaign_id}"
            
            campaign_service.mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            return True
        except GoogleAdsException as e:
            raise Exception(f"Failed to delete campaign: {e}")
    
    async def get_ad_groups(self, customer_id: str, campaign_id: str = None) -> List[AdGroupData]:
        """Get ad groups for a campaign or all ad groups"""
        if not self.client:
            raise Exception("Google Ads client not initialized")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            query = """
                SELECT 
                    ad_group.id,
                    ad_group.name,
                    ad_group.campaign,
                    ad_group.status,
                    ad_group.cpc_bid_micros,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.conversions,
                    metrics.cost_micros
                FROM ad_group 
                WHERE ad_group.status != 'REMOVED'
            """
            
            if campaign_id:
                query += f" AND ad_group.campaign = 'customers/{customer_id}/campaigns/{campaign_id}'"
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            ad_groups = []
            for row in response:
                ad_group = row.ad_group
                metrics = row.metrics
                
                ad_groups.append(AdGroupData(
                    id=str(ad_group.id),
                    name=ad_group.name,
                    campaign_id=ad_group.campaign.split("/")[-1],
                    status=ad_group.status.name,
                    cpc_bid=ad_group.cpc_bid_micros / 1_000_000 if ad_group.cpc_bid_micros else 0,
                    impressions=metrics.impressions,
                    clicks=metrics.clicks,
                    conversions=metrics.conversions,
                    cost=metrics.cost_micros / 1_000_000
                ))
            
            return ad_groups
        except GoogleAdsException as e:
            raise Exception(f"Failed to get ad groups: {e}")
    
    async def get_keywords(self, customer_id: str, ad_group_id: str = None) -> List[KeywordData]:
        """Get keywords for an ad group or all keywords"""
        if not self.client:
            raise Exception("Google Ads client not initialized")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            query = """
                SELECT 
                    ad_group_criterion.criterion_id,
                    ad_group_criterion.keyword.text,
                    ad_group_criterion.keyword.match_type,
                    ad_group_criterion.ad_group,
                    ad_group_criterion.status,
                    ad_group_criterion.cpc_bid_micros,
                    ad_group_criterion.quality_info.quality_score,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.conversions,
                    metrics.cost_micros
                FROM keyword_view 
                WHERE ad_group_criterion.status != 'REMOVED'
            """
            
            if ad_group_id:
                query += f" AND ad_group_criterion.ad_group = 'customers/{customer_id}/adGroups/{ad_group_id}'"
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            keywords = []
            for row in response:
                criterion = row.ad_group_criterion
                metrics = row.metrics
                
                keywords.append(KeywordData(
                    id=str(criterion.criterion_id),
                    text=criterion.keyword.text,
                    match_type=criterion.keyword.match_type.name,
                    ad_group_id=criterion.ad_group.split("/")[-1],
                    status=criterion.status.name,
                    cpc_bid=criterion.cpc_bid_micros / 1_000_000 if criterion.cpc_bid_micros else 0,
                    quality_score=criterion.quality_info.quality_score if criterion.quality_info else None,
                    impressions=metrics.impressions,
                    clicks=metrics.clicks,
                    conversions=metrics.conversions,
                    cost=metrics.cost_micros / 1_000_000
                ))
            
            return keywords
        except GoogleAdsException as e:
            raise Exception(f"Failed to get keywords: {e}")
    
    async def get_campaign_recommendations(self, customer_id: str, campaign_id: str) -> List[Dict[str, Any]]:
        """Get Google Ads recommendations for a campaign"""
        if not self.client:
            raise Exception("Google Ads client not initialized")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            query = f"""
                SELECT 
                    recommendation.resource_name,
                    recommendation.type,
                    recommendation.impact,
                    recommendation.campaign_budget_recommendation,
                    recommendation.keyword_recommendation,
                    recommendation.text_ad_recommendation
                FROM recommendation 
                WHERE recommendation.campaign = 'customers/{customer_id}/campaigns/{campaign_id}'
            """
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            recommendations = []
            for row in response:
                rec = row.recommendation
                recommendations.append({
                    "id": rec.resource_name.split("/")[-1],
                    "type": rec.type_.name,
                    "impact": rec.impact,
                    "details": self._parse_recommendation_details(rec)
                })
            
            return recommendations
        except GoogleAdsException as e:
            raise Exception(f"Failed to get recommendations: {e}")
    
    def _parse_recommendation_details(self, recommendation) -> Dict[str, Any]:
        """Parse recommendation details based on type"""
        details = {}
        
        if recommendation.campaign_budget_recommendation:
            budget_rec = recommendation.campaign_budget_recommendation
            details["current_budget"] = budget_rec.current_budget_amount_micros / 1_000_000
            details["recommended_budget"] = budget_rec.recommended_budget_amount_micros / 1_000_000
        
        elif recommendation.keyword_recommendation:
            keyword_rec = recommendation.keyword_recommendation
            details["keywords"] = [kw.text for kw in keyword_rec.keywords]
        
        elif recommendation.text_ad_recommendation:
            ad_rec = recommendation.text_ad_recommendation
            details["ad_type"] = "text_ad"
        
        return details


# Singleton instance
google_ads_service = GoogleAdsService() 