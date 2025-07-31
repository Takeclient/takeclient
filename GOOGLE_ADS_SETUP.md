# Google Ads AI Agent System - Setup Guide

## 🚀 Overview

This system provides a comprehensive Google Ads management platform with AI-powered optimization, campaign management, and real-time insights. The AI agent analyzes campaign performance, provides recommendations, and can automatically optimize campaigns based on data-driven insights.

## 📋 Features

### Core Features
- **Google Ads API Integration**: Full CRUD operations for campaigns, ad groups, and keywords
- **OAuth2 Authentication**: Secure Google Ads account connection
- **Real-time Campaign Management**: Create, edit, delete, and monitor campaigns
- **Performance Analytics**: Comprehensive metrics and reporting

### AI Agent Features
- **Campaign Performance Analysis**: AI-powered insights into campaign effectiveness
- **Budget Optimization**: Automatic budget recommendations and alerts
- **Keyword Analysis**: High-performing and underperforming keyword identification
- **Anomaly Detection**: Statistical analysis to identify performance outliers
- **Automated Optimization**: AI-driven campaign improvements
- **Recommendation Engine**: Strategic suggestions for campaign enhancement

## 🛠️ Technical Architecture

### Backend (Python FastAPI)
- **Google Ads Service**: API integration and campaign management
- **AI Agent Service**: OpenAI-powered analysis and recommendations
- **Database Models**: Campaign, keyword, and insight storage
- **Background Tasks**: Scheduled optimization and monitoring

### Frontend (Next.js)
- **Dashboard Interface**: Campaign management and analytics
- **Real-time Updates**: Live performance metrics
- **AI Insights Panel**: Recommendations and alerts
- **Configuration Management**: API credentials and settings

## 📦 Installation & Setup

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -e .
```

#### Environment Configuration
Update `backend/.env` with your credentials:

```env
# Google Ads API Configuration
GOOGLE_ADS_CLIENT_ID=your-client-id
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ADS_CUSTOMER_ID=your-customer-id
GOOGLE_API_KEY=your-api-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# OAuth2 Configuration
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/google-ads/callback
```

#### Start Backend Server
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Start Frontend Server
```bash
npm run dev
```

## 🔑 Google Ads API Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Ads API

### 2. Create OAuth2 Credentials
1. Go to "Credentials" in Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Set application type to "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google-ads/callback`
   - `https://developers.google.com/oauthplayground`

### 3. Get Developer Token
1. Go to [Google Ads API Center](https://ads.google.com/nav/selectaccount?authuser=0&dst=/aw/apicenter)
2. Apply for API access
3. Once approved, get your developer token

### 4. Generate Refresh Token
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click gear icon → "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In Step 1, enter scope: `https://www.googleapis.com/auth/adwords`
5. Authorize and exchange authorization code for tokens
6. Copy the refresh token

## 🤖 AI Agent Configuration

### OpenAI Setup
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to environment variables
3. The AI agent uses GPT-4 for advanced campaign analysis

### AI Features Configuration

#### Performance Thresholds
The AI agent uses configurable thresholds for analysis:

```python
performance_thresholds = {
    'low_ctr': 0.02,  # 2%
    'high_cpc': 2.0,  # $2
    'low_conversion_rate': 0.01,  # 1%
    'high_cost_per_conversion': 50.0,  # $50
    'budget_utilization_high': 0.85,  # 85%
    'budget_utilization_low': 0.3,  # 30%
}
```

#### Optimization Types
- `budget_optimization`: Automatic budget adjustments
- `bid_optimization`: Keyword bid optimization
- `performance_analysis`: Comprehensive campaign analysis
- `keyword_optimization`: Keyword performance analysis

## 📊 API Endpoints

### Authentication
- `GET /api/v1/google-ads/auth/url` - Get OAuth authorization URL
- `POST /api/v1/google-ads/auth/callback` - Handle OAuth callback
- `GET /api/v1/google-ads/customers` - Get accessible customers

### Campaign Management
- `GET /api/v1/google-ads/campaigns` - Get campaigns
- `POST /api/v1/google-ads/campaigns` - Create campaign
- `PUT /api/v1/google-ads/campaigns/{id}` - Update campaign
- `DELETE /api/v1/google-ads/campaigns/{id}` - Delete campaign

### Ad Groups & Keywords
- `GET /api/v1/google-ads/ad-groups` - Get ad groups
- `GET /api/v1/google-ads/keywords` - Get keywords

### AI Insights
- `GET /api/v1/google-ads/insights` - Get AI insights
- `GET /api/v1/google-ads/insights/keywords` - Get keyword insights
- `POST /api/v1/google-ads/keyword-suggestions` - Get keyword suggestions
- `POST /api/v1/google-ads/optimize` - Trigger optimization

### Analytics
- `GET /api/v1/google-ads/performance-summary` - Get performance summary
- `GET /api/v1/google-ads/recommendations` - Get Google recommendations

## 🔄 Workflow

### 1. Initial Setup
1. Configure Google Ads API credentials
2. Authenticate with Google Ads account
3. Select customer account
4. Load existing campaigns

### 2. Campaign Management
1. View campaign performance metrics
2. Create new campaigns with AI suggestions
3. Edit existing campaigns based on recommendations
4. Monitor real-time performance

### 3. AI Analysis
1. AI agent analyzes campaign data every hour
2. Generates insights and recommendations
3. Identifies optimization opportunities
4. Provides actionable suggestions

### 4. Optimization
1. Review AI recommendations
2. Apply optimizations manually or automatically
3. Monitor performance improvements
4. Iterate based on results

## 🎯 AI Agent Capabilities

### Campaign Analysis
- **Performance Metrics**: CTR, CPC, conversion rate analysis
- **Budget Utilization**: Spending pattern analysis
- **Trend Detection**: Performance trend identification
- **Competitive Analysis**: Market position assessment

### Optimization Recommendations
- **Budget Adjustments**: Increase/decrease budget recommendations
- **Bid Optimization**: Keyword bid adjustments
- **Targeting Refinement**: Audience and geographic targeting
- **Ad Copy Improvements**: Creative optimization suggestions

### Automated Actions
- **Budget Scaling**: Automatic budget increases for high-performing campaigns
- **Bid Adjustments**: Real-time bid optimization
- **Keyword Management**: Automatic negative keyword additions
- **Campaign Pausing**: Automatic pausing of underperforming campaigns

### Alerting System
- **Budget Alerts**: Notifications when budget limits are approached
- **Performance Alerts**: Warnings for declining performance
- **Opportunity Alerts**: Notifications for optimization opportunities
- **Anomaly Alerts**: Alerts for unusual performance patterns

## 📈 Performance Monitoring

### Key Metrics Tracked
- **Campaign Level**: Impressions, clicks, conversions, cost, CTR, CPC
- **Keyword Level**: Quality score, search terms, match types
- **Account Level**: Overall performance, budget utilization
- **AI Insights**: Recommendation accuracy, optimization impact

### Reporting Features
- **Real-time Dashboards**: Live performance metrics
- **Historical Analysis**: Trend analysis and comparisons
- **AI Impact Reports**: Optimization effectiveness tracking
- **Custom Reports**: Configurable reporting options

## 🔧 Troubleshooting

### Common Issues

#### Authentication Errors
- Verify OAuth credentials are correct
- Check redirect URI configuration
- Ensure developer token is approved

#### API Rate Limits
- Implement request throttling
- Use batch operations where possible
- Monitor API quota usage

#### AI Analysis Issues
- Verify OpenAI API key is valid
- Check data quality and completeness
- Review threshold configurations

### Debug Mode
Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🚀 Deployment

### Production Considerations
1. **Security**: Use environment variables for all credentials
2. **Scaling**: Implement Redis for caching and session management
3. **Monitoring**: Set up application monitoring and alerting
4. **Backup**: Regular database backups
5. **SSL**: Enable HTTPS for production deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📚 Additional Resources

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Support

For technical support or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Contact the development team

---

**Note**: This system requires proper Google Ads API access and OpenAI API credentials. Ensure you have the necessary permissions and quotas before deployment. 