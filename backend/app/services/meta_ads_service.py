"""
Meta (Facebook) Ads API Service

This service provides functionality to:
- Authenticate with Meta Ads API using OAuth2
- Manage ad campaigns, ad sets, and ads
- Retrieve performance metrics and insights
- Handle account and audience management

The service uses the Facebook Business SDK to interact with the Meta Marketing API.
"""

import os
import logging
import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import asyncio
from urllib.parse import urlencode, quote_plus

from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.ad import Ad
from facebook_business.adobjects.adsinsights import AdsInsights
from facebook_business.adobjects.user import User
from facebook_business.exceptions import FacebookRequestError
import requests

# Configure logging
logger = logging.getLogger(__name__)

class MetaAdsService:
    """Service for managing Meta (Facebook) Ads through the Marketing API"""
    
    def __init__(self):
        self.app_id = os.getenv('META_APP_ID')
        self.app_secret = os.getenv('META_APP_SECRET')
        self.access_token = os.getenv('META_ACCESS_TOKEN')
        self.redirect_uri_prod = os.getenv('META_OAUTH_REDIRECT_URI_PROD')
        self.redirect_uri_dev = os.getenv('META_OAUTH_REDIRECT_URI_DEV')
        
        # Choose redirect URI based on environment
        self.redirect_uri = self.redirect_uri_dev if os.getenv('ENVIRONMENT') == 'development' else self.redirect_uri_prod
        
        # API endpoints
        self.api_base_url = "https://graph.facebook.com/v18.0"
        self.oauth_base_url = "https://www.facebook.com/v18.0/dialog/oauth"
        
        # Initialize API if access token is available
        if self.access_token:
            try:
                FacebookAdsApi.init(
                    app_id=self.app_id,
                    app_secret=self.app_secret,
                    access_token=self.access_token
                )
                logger.info("Meta Ads API initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Meta Ads API: {e}")
        
        # Required permissions for ads management
        self.required_scopes = [
            'ads_management',
            'ads_read',
            'business_management',
            'pages_read_engagement',
            'pages_show_list',
            'read_insights'
        ]

    def get_oauth_url(self, state: str = None) -> str:
        """
        Generate OAuth URL for Meta Ads authentication
        
        Args:
            state: Optional state parameter for CSRF protection
            
        Returns:
            OAuth URL for user authorization
        """
        params = {
            'client_id': self.app_id,
            'redirect_uri': self.redirect_uri,
            'scope': ','.join(self.required_scopes),
            'response_type': 'code',
            'display': 'popup'
        }
        
        if state:
            params['state'] = state
            
        oauth_url = f"{self.oauth_base_url}?{urlencode(params)}"
        logger.info(f"Generated OAuth URL: {oauth_url}")
        return oauth_url

    def exchange_code_for_token(self, authorization_code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token
        
        Args:
            authorization_code: Authorization code from OAuth callback
            
        Returns:
            Dictionary containing access token and user information
        """
        try:
            # Exchange code for access token
            token_url = f"{self.api_base_url}/oauth/access_token"
            token_params = {
                'client_id': self.app_id,
                'client_secret': self.app_secret,
                'redirect_uri': self.redirect_uri,
                'code': authorization_code
            }
            
            response = requests.get(token_url, params=token_params)
            response.raise_for_status()
            token_data = response.json()
            
            if 'access_token' not in token_data:
                raise ValueError("No access token in response")
            
            access_token = token_data['access_token']
            
            # Get user information
            user_url = f"{self.api_base_url}/me"
            user_params = {
                'access_token': access_token,
                'fields': 'id,name,email'
            }
            
            user_response = requests.get(user_url, params=user_params)
            user_response.raise_for_status()
            user_data = user_response.json()
            
            # Get ad accounts
            accounts_url = f"{self.api_base_url}/me/adaccounts"
            accounts_params = {
                'access_token': access_token,
                'fields': 'id,name,account_status,currency,timezone_name,business'
            }
            
            accounts_response = requests.get(accounts_url, params=accounts_params)
            accounts_response.raise_for_status()
            accounts_data = accounts_response.json()
            
            return {
                'access_token': access_token,
                'user': user_data,
                'ad_accounts': accounts_data.get('data', []),
                'expires_in': token_data.get('expires_in', 3600)
            }
            
        except requests.RequestException as e:
            logger.error(f"HTTP error during token exchange: {e}")
            raise Exception(f"Failed to exchange code for token: {e}")
        except Exception as e:
            logger.error(f"Error during token exchange: {e}")
            raise Exception(f"Token exchange failed: {e}")

    def set_access_token(self, access_token: str) -> bool:
        """
        Set access token for the service
        
        Args:
            access_token: Meta access token
            
        Returns:
            True if token is valid and API is initialized
        """
        try:
            self.access_token = access_token
            FacebookAdsApi.init(
                app_id=self.app_id,
                app_secret=self.app_secret,
                access_token=access_token
            )
            
            # Test the token by making a simple API call
            me = User(fbid='me').api_get(fields=['id', 'name'])
            logger.info(f"Access token set successfully for user: {me.get('name', 'Unknown')}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to set access token: {e}")
            return False

    def get_ad_accounts(self, access_token: str = None) -> List[Dict[str, Any]]:
        """
        Get all ad accounts accessible to the user
        
        Returns:
            List of ad account information
        """
        try:
            token = access_token or self.access_token
            if not token:
                return []
            
            accounts_url = f"{self.api_base_url}/me/adaccounts"
            params = {
                'access_token': token,
                'fields': 'id,name,account_status,currency,timezone_name,business,amount_spent,balance'
            }
            
            response = requests.get(accounts_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            accounts = []
            for account in data.get('data', []):
                accounts.append({
                    'id': account.get('id'),
                    'name': account.get('name'),
                    'status': account.get('account_status'),
                    'currency': account.get('currency'),
                    'timezone': account.get('timezone_name'),
                    'business_id': account.get('business', {}).get('id') if account.get('business') else None,
                    'business_name': account.get('business', {}).get('name') if account.get('business') else None,
                    'amount_spent': account.get('amount_spent'),
                    'balance': account.get('balance')
                })
            
            return accounts
            
        except FacebookRequestError as e:
            logger.error(f"Facebook API error getting ad accounts: {e}")
            return []
        except Exception as e:
            logger.error(f"Error getting ad accounts: {e}")
            return []

    def get_campaigns(self, ad_account_id: str, access_token: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get campaigns for a specific ad account
        
        Args:
            ad_account_id: Meta ad account ID
            access_token: Optional access token
            limit: Maximum number of campaigns to return
            
        Returns:
            List of campaign information
        """
        try:
            token = access_token or self.access_token
            if not token:
                return []
            
            campaigns_url = f"{self.api_base_url}/act_{ad_account_id}/campaigns"
            params = {
                'access_token': token,
                'fields': 'id,name,objective,status,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining,spend_cap',
                'limit': limit
            }
            
            response = requests.get(campaigns_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            campaign_list = []
            for campaign in data.get('data', []):
                campaign_list.append({
                    'id': campaign.get('id'),
                    'name': campaign.get('name'),
                    'objective': campaign.get('objective'),
                    'status': campaign.get('status'),
                    'created_time': campaign.get('created_time'),
                    'updated_time': campaign.get('updated_time'),
                    'start_time': campaign.get('start_time'),
                    'stop_time': campaign.get('stop_time'),
                    'daily_budget': campaign.get('daily_budget'),
                    'lifetime_budget': campaign.get('lifetime_budget'),
                    'budget_remaining': campaign.get('budget_remaining'),
                    'spend_cap': campaign.get('spend_cap')
                })
            
            return campaign_list
            
        except FacebookRequestError as e:
            logger.error(f"Facebook API error getting campaigns: {e}")
            return []
        except Exception as e:
            logger.error(f"Error getting campaigns: {e}")
            return []

    def get_campaign_insights(self, campaign_id: str, access_token: str = None, time_range: Dict[str, str] = None) -> Dict[str, Any]:
        """
        Get performance insights for a specific campaign
        
        Args:
            campaign_id: Meta campaign ID
            access_token: Optional access token
            time_range: Dictionary with 'since' and 'until' dates in YYYY-MM-DD format
            
        Returns:
            Campaign insights data
        """
        try:
            token = access_token or self.access_token
            if not token:
                return {}
            
            # Default to last 30 days if no time range specified
            if not time_range:
                end_date = datetime.now()
                start_date = end_date - timedelta(days=30)
                time_range = {
                    'since': start_date.strftime('%Y-%m-%d'),
                    'until': end_date.strftime('%Y-%m-%d')
                }
            
            insights_url = f"{self.api_base_url}/{campaign_id}/insights"
            params = {
                'access_token': token,
                'fields': 'impressions,clicks,spend,reach,frequency,ctr,cpm,cpp,cpc,cost_per_unique_click,actions,conversions,conversion_values,unique_clicks,unique_ctr',
                'time_range': json.dumps(time_range),
                'level': 'campaign'
            }
            
            response = requests.get(insights_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get('data'):
                insight = data['data'][0]
                return {
                    'impressions': int(insight.get('impressions', 0)),
                    'clicks': int(insight.get('clicks', 0)),
                    'spend': float(insight.get('spend', 0)),
                    'reach': int(insight.get('reach', 0)),
                    'frequency': float(insight.get('frequency', 0)),
                    'ctr': float(insight.get('ctr', 0)),
                    'cpm': float(insight.get('cpm', 0)),
                    'cpp': float(insight.get('cpp', 0)),
                    'cpc': float(insight.get('cpc', 0)),
                    'cost_per_unique_click': float(insight.get('cost_per_unique_click', 0)),
                    'unique_clicks': int(insight.get('unique_clicks', 0)),
                    'unique_ctr': float(insight.get('unique_ctr', 0)),
                    'actions': insight.get('actions', []),
                    'conversions': insight.get('conversions', []),
                    'conversion_values': insight.get('conversion_values', []),
                    'time_range': time_range
                }
            
            return {}
            
        except FacebookRequestError as e:
            logger.error(f"Facebook API error getting campaign insights: {e}")
            return {}
        except Exception as e:
            logger.error(f"Error getting campaign insights: {e}")
            return {}

    def create_campaign(self, ad_account_id: str, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new campaign
        
        Args:
            ad_account_id: Meta ad account ID
            campaign_data: Campaign configuration data
            
        Returns:
            Created campaign information
        """
        try:
            if not self.access_token:
                raise Exception("No access token available")
            
            account = AdAccount(f"act_{ad_account_id}")
            
            campaign_params = {
                'name': campaign_data['name'],
                'objective': campaign_data['objective'],
                'status': campaign_data.get('status', Campaign.Status.paused),
                'special_ad_categories': campaign_data.get('special_ad_categories', [])
            }
            
            # Add budget information if provided
            if 'daily_budget' in campaign_data:
                campaign_params['daily_budget'] = campaign_data['daily_budget']
            elif 'lifetime_budget' in campaign_data:
                campaign_params['lifetime_budget'] = campaign_data['lifetime_budget']
            
            campaign = account.create_campaign(params=campaign_params)
            
            return {
                'id': campaign.get('id'),
                'success': True,
                'message': 'Campaign created successfully'
            }
            
        except FacebookRequestError as e:
            logger.error(f"Facebook API error creating campaign: {e}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            logger.error(f"Error creating campaign: {e}")
            return {'success': False, 'error': str(e)}

    def update_campaign(self, campaign_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing campaign
        
        Args:
            campaign_id: Meta campaign ID
            update_data: Data to update
            
        Returns:
            Update result
        """
        try:
            if not self.access_token:
                raise Exception("No access token available")
            
            campaign = Campaign(campaign_id)
            
            # Build update parameters
            update_params = {}
            allowed_fields = ['name', 'status', 'daily_budget', 'lifetime_budget', 'spend_cap']
            
            for field in allowed_fields:
                if field in update_data:
                    update_params[field] = update_data[field]
            
            if update_params:
                campaign.api_update(params=update_params)
                return {'success': True, 'message': 'Campaign updated successfully'}
            else:
                return {'success': False, 'error': 'No valid fields to update'}
            
        except FacebookRequestError as e:
            logger.error(f"Facebook API error updating campaign: {e}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            logger.error(f"Error updating campaign: {e}")
            return {'success': False, 'error': str(e)}

    def delete_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """
        Delete a campaign (actually sets status to deleted)
        
        Args:
            campaign_id: Meta campaign ID
            
        Returns:
            Deletion result
        """
        try:
            if not self.access_token:
                raise Exception("No access token available")
            
            campaign = Campaign(campaign_id)
            campaign.api_update(params={'status': Campaign.Status.deleted})
            
            return {'success': True, 'message': 'Campaign deleted successfully'}
            
        except FacebookRequestError as e:
            logger.error(f"Facebook API error deleting campaign: {e}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            logger.error(f"Error deleting campaign: {e}")
            return {'success': False, 'error': str(e)}

    def get_ad_sets(self, campaign_id: str) -> List[Dict[str, Any]]:
        """
        Get ad sets for a specific campaign
        
        Args:
            campaign_id: Meta campaign ID
            
        Returns:
            List of ad set information
        """
        try:
            if not self.access_token:
                return []
            
            campaign = Campaign(campaign_id)
            ad_sets = campaign.get_ad_sets(
                fields=[
                    'id', 'name', 'status', 'daily_budget', 'lifetime_budget',
                    'created_time', 'updated_time', 'start_time', 'end_time',
                    'targeting', 'optimization_goal', 'billing_event'
                ]
            )
            
            ad_set_list = []
            for ad_set in ad_sets:
                ad_set_list.append({
                    'id': ad_set.get('id'),
                    'name': ad_set.get('name'),
                    'status': ad_set.get('status'),
                    'daily_budget': ad_set.get('daily_budget'),
                    'lifetime_budget': ad_set.get('lifetime_budget'),
                    'created_time': ad_set.get('created_time'),
                    'updated_time': ad_set.get('updated_time'),
                    'start_time': ad_set.get('start_time'),
                    'end_time': ad_set.get('end_time'),
                    'targeting': ad_set.get('targeting'),
                    'optimization_goal': ad_set.get('optimization_goal'),
                    'billing_event': ad_set.get('billing_event')
                })
            
            return ad_set_list
            
        except FacebookRequestError as e:
            logger.error(f"Facebook API error getting ad sets: {e}")
            return []
        except Exception as e:
            logger.error(f"Error getting ad sets: {e}")
            return []

    def get_account_insights(self, ad_account_id: str, access_token: str = None, time_range: Dict[str, str] = None) -> Dict[str, Any]:
        """
        Get account-level insights
        
        Args:
            ad_account_id: Meta ad account ID
            access_token: Optional access token
            time_range: Dictionary with 'since' and 'until' dates
            
        Returns:
            Account insights data
        """
        try:
            token = access_token or self.access_token
            if not token:
                return {}
            
            # Default to last 30 days if no time range specified
            if not time_range:
                end_date = datetime.now()
                start_date = end_date - timedelta(days=30)
                time_range = {
                    'since': start_date.strftime('%Y-%m-%d'),
                    'until': end_date.strftime('%Y-%m-%d')
                }
            
            insights_url = f"{self.api_base_url}/act_{ad_account_id}/insights"
            params = {
                'access_token': token,
                'fields': 'impressions,clicks,spend,reach,frequency,ctr,cpm,cpp,cpc,actions,conversions',
                'time_range': json.dumps(time_range),
                'level': 'account'
            }
            
            response = requests.get(insights_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get('data'):
                insight = data['data'][0]
                return {
                    'impressions': int(insight.get('impressions', 0)),
                    'clicks': int(insight.get('clicks', 0)),
                    'spend': float(insight.get('spend', 0)),
                    'reach': int(insight.get('reach', 0)),
                    'frequency': float(insight.get('frequency', 0)),
                    'ctr': float(insight.get('ctr', 0)),
                    'cpm': float(insight.get('cpm', 0)),
                    'cpp': float(insight.get('cpp', 0)),
                    'cpc': float(insight.get('cpc', 0)),
                    'actions': insight.get('actions', []),
                    'conversions': insight.get('conversions', []),
                    'time_range': time_range
                }
            
            return {}
            
        except FacebookRequestError as e:
            logger.error(f"Facebook API error getting account insights: {e}")
            return {}
        except Exception as e:
            logger.error(f"Error getting account insights: {e}")
            return {}

    def test_connection(self, access_token: str = None) -> Dict[str, Any]:
        """
        Test the API connection and return status
        
        Returns:
            Dictionary with connection status and user information
        """
        try:
            token = access_token or self.access_token
            if not token:
                return {
                    'connected': False,
                    'error': 'No access token configured'
                }
            
            # Test with a simple API call
            user_url = f"{self.api_base_url}/me"
            params = {
                'access_token': token,
                'fields': 'id,name,email'
            }
            
            response = requests.get(user_url, params=params)
            response.raise_for_status()
            user_data = response.json()
            
            # Get ad accounts to verify ads access
            ad_accounts = self.get_ad_accounts(token)
            
            return {
                'connected': True,
                'user': {
                    'id': user_data.get('id'),
                    'name': user_data.get('name'),
                    'email': user_data.get('email')
                },
                'ad_accounts_count': len(ad_accounts),
                'permissions': self.required_scopes
            }
            
        except FacebookRequestError as e:
            logger.error(f"Facebook API error testing connection: {e}")
            return {
                'connected': False,
                'error': f'Facebook API error: {e}'
            }
        except Exception as e:
            logger.error(f"Error testing connection: {e}")
            return {
                'connected': False,
                'error': f'Connection test failed: {e}'
            }

# Create singleton instance
meta_ads_service = MetaAdsService() 