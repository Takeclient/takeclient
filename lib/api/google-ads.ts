const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Campaign {
  id: string;
  name: string;
  status: string;
  budget_amount: number;
  start_date: string;
  end_date?: string;
  currency: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    ctr: number;
    cpc: number;
    conversion_rate: number;
  };
}

export interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  campaign_id?: string;
  ad_group_id?: string;
  actionable: boolean;
  action_type?: string;
  action_data?: any;
  created_at: string;
  priority: number;
}

export interface Keyword {
  id: string;
  text: string;
  match_type: string;
  ad_group_id: string;
  status: string;
  cpc_bid: number;
  quality_score?: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
  };
}

export interface AdGroup {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  cpc_bid: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  currency: string;
  timezone: string;
}

class GoogleAdsAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1/google-ads`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new Error('Empty response received');
        }
        try {
          return JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Invalid JSON response: ${text}`);
        }
      } else {
        throw new Error('Non-JSON response received');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Backend server is not running. Please start the backend server.');
      }
      throw error;
    }
  }

  // Authentication
  async getAuthUrl(): Promise<{ auth_url: string }> {
    return this.request('/auth/url');
  }

  async handleAuthCallback(code: string): Promise<{ success: boolean; tokens: any }> {
    return this.request('/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getAccessibleCustomers(): Promise<{ customers: Customer[] }> {
    return this.request('/customers');
  }

  // Campaigns
  async getCampaigns(customerId: string): Promise<{ campaigns: Campaign[] }> {
    return this.request(`/campaigns?customer_id=${customerId}`);
  }

  async createCampaign(customerId: string, campaignData: {
    name: string;
    budget: number;
    start_date: string;
    end_date?: string;
  }): Promise<{ success: boolean; campaign_id: string }> {
    return this.request(`/campaigns?customer_id=${customerId}`, {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async updateCampaign(
    customerId: string,
    campaignId: string,
    updates: {
      name?: string;
      status?: string;
      budget?: number;
    }
  ): Promise<{ success: boolean }> {
    return this.request(`/campaigns/${campaignId}?customer_id=${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCampaign(customerId: string, campaignId: string): Promise<{ success: boolean }> {
    return this.request(`/campaigns/${campaignId}?customer_id=${customerId}`, {
      method: 'DELETE',
    });
  }

  // Ad Groups
  async getAdGroups(customerId: string, campaignId?: string): Promise<{ ad_groups: AdGroup[] }> {
    const params = new URLSearchParams({ customer_id: customerId });
    if (campaignId) params.append('campaign_id', campaignId);
    return this.request(`/ad-groups?${params}`);
  }

  // Keywords
  async getKeywords(customerId: string, adGroupId?: string): Promise<{ keywords: Keyword[] }> {
    const params = new URLSearchParams({ customer_id: customerId });
    if (adGroupId) params.append('ad_group_id', adGroupId);
    return this.request(`/keywords?${params}`);
  }

  // AI Insights
  async getAIInsights(customerId: string, campaignId?: string): Promise<{ insights: AIInsight[] }> {
    const params = new URLSearchParams({ customer_id: customerId });
    if (campaignId) params.append('campaign_id', campaignId);
    return this.request(`/insights?${params}`);
  }

  async getKeywordInsights(customerId: string, adGroupId?: string): Promise<{ insights: AIInsight[] }> {
    const params = new URLSearchParams({ customer_id: customerId });
    if (adGroupId) params.append('ad_group_id', adGroupId);
    return this.request(`/insights/keywords?${params}`);
  }

  async getKeywordSuggestions(customerId: string, campaignId: string): Promise<{ suggestions: string[] }> {
    const params = new URLSearchParams({ customer_id: customerId, campaign_id: campaignId });
    return this.request(`/keyword-suggestions?${params}`, { method: 'POST' });
  }

  async optimizeCampaigns(
    customerId: string,
    optimizationData: {
      optimization_type: string;
      campaign_ids?: string[];
      auto_apply?: boolean;
    }
  ): Promise<{ results: any[] }> {
    const params = new URLSearchParams({ customer_id: customerId });
    return this.request(`/optimize?${params}`, {
      method: 'POST',
      body: JSON.stringify(optimizationData),
    });
  }

  async getGoogleRecommendations(customerId: string, campaignId: string): Promise<{ recommendations: any[] }> {
    const params = new URLSearchParams({ customer_id: customerId, campaign_id: campaignId });
    return this.request(`/recommendations?${params}`);
  }

  async getPerformanceSummary(customerId: string): Promise<{
    summary: {
      total_campaigns: number;
      active_campaigns: number;
      total_cost: number;
      total_impressions: number;
      total_clicks: number;
      total_conversions: number;
      avg_ctr: number;
      avg_cpc: number;
      conversion_rate: number;
      conversion_value: number;
      currency: string;
      period: string;
    };
    insights: {
      campaign_insights: number;
      high_priority: number;
      actionable: number;
    };
    top_insights: Array<{
      title: string;
      description: string;
      impact: string;
      type: string;
      priority: number;
    }>;
  }> {
    const params = new URLSearchParams({ customer_id: customerId });
    return this.request(`/performance-summary?${params}`);
  }
}

export const googleAdsAPI = new GoogleAdsAPI(); 