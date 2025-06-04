# WhatsApp Business API Integration

## Overview

The CRM now includes a comprehensive WhatsApp Business API integration that allows users to:
- Connect multiple WhatsApp Business accounts
- Send and receive messages in real-time
- Manage conversations with contacts
- Use message templates
- Auto-sync WhatsApp contacts with CRM contacts

## Features

### 1. **Multi-Account Support**
- Add multiple WhatsApp Business phone numbers
- Switch between accounts easily
- Manage each integration independently

### 2. **Real-Time Messaging**
- Send text messages, images, documents, and more
- Receive messages instantly via webhooks
- Message status tracking (sent, delivered, read)
- Typing indicators and read receipts

### 3. **Contact Management**
- Auto-create CRM contacts from WhatsApp conversations
- Link existing contacts to WhatsApp conversations
- View contact details within the chat interface

### 4. **Message Templates**
- Sync approved templates from Meta Business Manager
- Use templates for marketing and utility messages
- Preview templates before sending

### 5. **Security**
- Access tokens are encrypted using AES-256-GCM
- Webhook verification for secure message delivery
- Role-based access control

## Setup Instructions

### Prerequisites

1. **Meta Business Account**
   - Access to Meta Business Manager
   - WhatsApp Business Account
   - WhatsApp Business API access

2. **WhatsApp Business Phone Number**
   - Verified phone number
   - API access enabled

### Integration Steps

1. **Navigate to WhatsApp Section**
   - Go to Marketing → WhatsApp in the sidebar

2. **Add Integration**
   - Click "Add Integration" button
   - Enter the following details:
     - Integration Name (e.g., "Main Business Number")
     - WhatsApp Phone Number (with country code)
     - Phone Number ID (from Meta Business Manager)
     - Business Account ID (from Meta Business Manager)
     - Access Token (permanent token recommended)
     - Webhook Verify Token (optional, auto-generated if not provided)

3. **Configure Webhook in Meta**
   - Copy the webhook URL from Settings tab
   - Go to Meta Business Manager → WhatsApp → Configuration
   - Add webhook URL and verify token
   - Subscribe to messages and message_status fields

4. **Test the Integration**
   - Send a test message to your WhatsApp number
   - Check if it appears in the Conversations tab
   - Send a reply to verify outbound messaging

## API Endpoints

### Integrations
- `GET /api/whatsapp/integrations` - List all integrations
- `POST /api/whatsapp/integrations` - Create new integration
- `DELETE /api/whatsapp/integrations/[id]` - Delete integration
- `POST /api/whatsapp/integrations/[id]/toggle` - Toggle integration status

### Conversations
- `GET /api/whatsapp/conversations` - List conversations
- `GET /api/whatsapp/conversations/[id]/messages` - Get messages
- `POST /api/whatsapp/conversations/[id]/read` - Mark as read

### Messages
- `POST /api/whatsapp/messages/send` - Send message
- `GET /api/whatsapp/webhook` - Webhook verification
- `POST /api/whatsapp/webhook` - Receive messages

### Templates
- `GET /api/whatsapp/templates` - List templates
- `POST /api/whatsapp/templates/sync` - Sync templates from Meta

## Database Schema

### WhatsAppIntegration
- Stores WhatsApp Business account credentials
- Encrypted access tokens
- Webhook verification tokens

### WhatsAppConversation
- Tracks conversations with customers
- Links to CRM contacts
- Maintains unread count and status

### WhatsAppMessage
- Stores all messages (inbound and outbound)
- Tracks message status and timestamps
- Supports various message types

### WhatsAppTemplate
- Caches message templates from Meta
- Stores template components and metadata

## Security Considerations

1. **Access Token Encryption**
   - Tokens are encrypted using AES-256-GCM
   - Encryption key must be set in environment variables
   - Never expose raw access tokens

2. **Webhook Security**
   - Verify webhook signatures from Meta
   - Use unique verify tokens per integration
   - Log all webhook activities

3. **Permissions**
   - Only MARKETER role and above can access WhatsApp
   - Tenant isolation ensures data privacy
   - Audit logs track all actions

## Troubleshooting

### Common Issues

1. **Messages not appearing**
   - Check webhook configuration in Meta
   - Verify integration is active
   - Check browser console for errors

2. **Cannot send messages**
   - Verify access token is valid
   - Check if number is registered for API
   - Ensure recipient has messaged first (24-hour window)

3. **Templates not syncing**
   - Verify access token permissions
   - Check if templates are approved
   - Try manual sync from Templates tab

### Debug Mode

Enable debug logging by checking browser console:
- Webhook payloads are logged
- API errors show detailed messages
- Network tab shows all API calls

## Best Practices

1. **Message Templates**
   - Always use approved templates for initial contact
   - Keep templates simple and clear
   - Test templates before bulk sending

2. **Contact Management**
   - Enable auto-sync for better organization
   - Regularly update contact information
   - Use tags to categorize WhatsApp contacts

3. **Conversation Management**
   - Respond promptly to maintain 24-hour window
   - Use quick replies when available
   - Archive old conversations regularly

## Future Enhancements

- Bulk messaging campaigns
- Automated responses and chatbots
- WhatsApp Business catalog integration
- Advanced analytics and reporting
- Multi-agent support with assignment
- Integration with other CRM features 