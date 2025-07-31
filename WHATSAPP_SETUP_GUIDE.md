# 🚀 WhatsApp Business API Setup Guide

*Complete setup instructions to connect your CRM to WhatsApp Business API*

## 📋 **What You'll Need**

Your CRM already has all the technical components built! We just need to connect it to WhatsApp. Here's what you need to gather:

### **Required Information:**
- 📱 **Phone Number**: A dedicated business phone number (not personal)
- 🏢 **Business Details**: Company name, address, business type
- 🆔 **Government ID**: For business verification
- 💳 **Payment Method**: For Meta Business account (small verification charge)

---

## 🛠️ **Step-by-Step Setup**

### **Step 1: Create Meta Business Account**

1. **Go to** → [business.facebook.com](https://business.facebook.com)
2. **Click** → "Create Account"
3. **Enter Business Information:**
   - Business name
   - Your name  
   - Business email
   - Business address
4. **Verify** your business (may take 1-3 days)

### **Step 2: Set Up WhatsApp Business Account**

1. **In Meta Business Manager** → Go to "WhatsApp" section
2. **Click** → "Create WhatsApp Business Account"
3. **Add Phone Number:**
   - Must be a business phone number
   - Cannot be already registered with WhatsApp
   - Choose SMS or voice call verification
4. **Complete Verification** process

### **Step 3: Get API Access**

1. **In WhatsApp Manager** → Go to "API Setup"
2. **Add Phone Number** to API
3. **Get these credentials:**

```bash
📝 You'll need to copy these values:

✅ Phone Number ID: (looks like: 1234567890123456)
✅ WhatsApp Business Account ID: (looks like: 1234567890123456) 
✅ Permanent Access Token: (long string starting with EAA...)
✅ App Secret: (for webhook verification)
```

### **Step 4: Generate Permanent Access Token**

⚠️ **Important**: Don't use temporary tokens!

1. **Go to** → Meta Developers Console
2. **Create/Select App** → WhatsApp Business
3. **Go to** → WhatsApp → Getting Started
4. **Generate System User Token:**
   - Select your business account
   - Choose scopes: `whatsapp_business_messaging`, `whatsapp_business_management`
   - **Copy the permanent token** (save it securely!)

---

## 🔧 **Step 5: Configure Your CRM**

Now let's add these credentials to your CRM:

### **Option A: Through CRM Interface (Recommended)**

1. **Start your CRM**: `npm run dev`
2. **Navigate to**: Dashboard → Marketing → WhatsApp
3. **Click**: "Add Integration" or go to Setup Guide tab
4. **Enter the credentials** you gathered above

### **Option B: Add to Environment File**

Add these to your `backend/.env` file:

```bash
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=EAA... # Your permanent access token
WHATSAPP_APP_SECRET=your_app_secret_here
WHATSAPP_PHONE_NUMBER_ID=1234567890123456
WHATSAPP_BUSINESS_ACCOUNT_ID=1234567890123456
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token_here

# Encryption key for storing access tokens securely
WHATSAPP_ENCRYPTION_KEY=your-32-character-encryption-key-here
```

---

## 🌐 **Step 6: Configure Webhook (Critical!)**

Your CRM needs to receive messages from WhatsApp. Here's how:

### **Get Your Webhook URL**

1. **If testing locally**: `https://your-ngrok-url.ngrok.io/api/whatsapp/webhook`
2. **If deployed**: `https://yourdomain.com/api/whatsapp/webhook`

### **Set Up Webhook in Meta**

1. **Go to** → Meta Developers Console
2. **Select your app** → WhatsApp → Configuration
3. **Add Webhook URL**:
   - **Callback URL**: Your webhook URL above
   - **Verify Token**: The `WHATSAPP_WEBHOOK_VERIFY_TOKEN` you set
4. **Subscribe to Fields**:
   - ✅ `messages` 
   - ✅ `message_status`

### **For Local Development (Ngrok)**

If testing locally, install ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the HTTPS URL for webhook (e.g., https://abc123.ngrok.io)
```

---

## 🧪 **Step 7: Test Your Integration**

### **Test Message Receiving**

1. **Start your CRM**: `npm run dev`
2. **Send a WhatsApp message** to your business number
3. **Check CRM**: Go to WhatsApp → Conversations
4. **Should see**: Your message appear in real-time

### **Test Message Sending**

1. **In CRM**: Go to WhatsApp → Conversations
2. **Click on a conversation**
3. **Type a reply** and send
4. **Check your phone**: Should receive the message

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. "Webhook verification failed"**
```bash
✅ Solution:
- Check verify token matches exactly
- Ensure webhook URL is accessible
- Check ngrok is running (if local)
```

#### **2. "Cannot send messages"**
```bash
✅ Solution:
- Verify access token is valid
- Check phone number is verified for API
- Ensure recipient messaged you first (24h window rule)
```

#### **3. "Messages not appearing"**
```bash
✅ Solution:
- Check webhook subscription in Meta
- Verify integration is marked as "Active"
- Check browser console for errors
```

#### **4. "Access token expired"**
```bash
✅ Solution:
- Generate new permanent system user token
- Update token in CRM integration settings
- Don't use temporary page access tokens
```

---

## 📱 **Quick Setup Checklist**

Use this checklist to ensure everything is configured:

### **Meta/WhatsApp Setup**
- [ ] Meta Business Account created and verified
- [ ] WhatsApp Business Account created
- [ ] Phone number added and verified
- [ ] Phone number added to API
- [ ] Permanent access token generated
- [ ] Webhook URL configured in Meta
- [ ] Webhook fields subscribed (messages, message_status)

### **CRM Configuration**
- [ ] Integration added in CRM with all credentials
- [ ] Integration marked as "Active"
- [ ] Webhook URL accessible (test with curl/Postman)
- [ ] Encryption key set in environment

### **Testing**
- [ ] Can receive messages in CRM
- [ ] Can send messages from CRM
- [ ] Message status updates working
- [ ] Conversations create properly

---

## 🎯 **Next Steps After Setup**

Once WhatsApp is working:

1. **Message Templates**: Sync your approved templates for marketing
2. **Contact Sync**: Enable auto-sync with CRM contacts
3. **Workflow Integration**: Set up automated responses
4. **Team Access**: Add team members to handle conversations
5. **Analytics**: Monitor conversation metrics

---

## 📞 **Need Help?**

If you get stuck:

1. **Check Setup Guide** in CRM: WhatsApp → Setup Guide tab
2. **Review Integration Status**: Should show "Connected" with green dot  
3. **Check Console Logs**: Browser developer tools for errors
4. **Test Webhook**: Use webhook testing tools to verify connectivity

---

**✨ Once this is set up, your CRM will have real-time WhatsApp messaging integrated with your contact management, workflows, and automation system!** 