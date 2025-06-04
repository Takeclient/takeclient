import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import crypto from 'crypto';

// Verify webhook signature from Meta
function verifyWebhookSignature(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// GET - Webhook verification from Meta
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('Webhook verification request:', { mode, token, challenge });

    if (mode === 'subscribe' && token) {
      // Find integration with matching verify token
      const integration = await prisma.whatsAppIntegration.findFirst({
        where: {
          webhookVerifyToken: token,
          isActive: true,
        },
      });

      if (integration) {
        console.log('Webhook verified for integration:', integration.phoneNumber);
        return new NextResponse(challenge, { status: 200 });
      }
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  } catch (error) {
    console.error('Webhook verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Receive WhatsApp messages and status updates
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log webhook payload for debugging
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await processMessages(change.value);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processMessages(value: any) {
  const { metadata, messages, statuses, contacts } = value;
  
  if (!metadata?.phone_number_id) {
    console.error('Missing phone_number_id in webhook');
    return;
  }

  // Find the integration
  const integration = await prisma.whatsAppIntegration.findFirst({
    where: {
      phoneNumberId: metadata.phone_number_id,
      isActive: true,
    },
  });

  if (!integration) {
    console.error('No active integration found for phone_number_id:', metadata.phone_number_id);
    return;
  }

  // Process incoming messages
  if (messages && messages.length > 0) {
    for (const message of messages) {
      await processIncomingMessage(integration, message, contacts);
    }
  }

  // Process message status updates
  if (statuses && statuses.length > 0) {
    for (const status of statuses) {
      await processStatusUpdate(status);
    }
  }
}

async function processIncomingMessage(integration: any, message: any, contacts: any[]) {
  try {
    const customerPhone = message.from;
    const customerInfo = contacts?.find(c => c.wa_id === customerPhone);

    // Find or create conversation
    let conversation = await prisma.whatsAppConversation.findUnique({
      where: {
        integrationId_customerPhone: {
          integrationId: integration.id,
          customerPhone: customerPhone,
        },
      },
    });

    if (!conversation) {
      // Try to find existing contact
      const contact = await prisma.contact.findFirst({
        where: {
          tenantId: integration.tenantId,
          phone: customerPhone,
        },
      });

      conversation = await prisma.whatsAppConversation.create({
        data: {
          integrationId: integration.id,
          customerPhone: customerPhone,
          customerName: customerInfo?.profile?.name,
          contactId: contact?.id,
        },
      });
    }

    // Create message record
    const messageData: any = {
      waMessageId: message.id,
      conversationId: conversation.id,
      direction: 'INBOUND',
      type: message.type.toUpperCase(),
      status: 'RECEIVED',
      createdAt: new Date(parseInt(message.timestamp) * 1000),
    };

    // Handle different message types
    switch (message.type) {
      case 'text':
        messageData.content = message.text.body;
        break;
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
        messageData.mediaUrl = message[message.type].id; // Store media ID, fetch URL later
        messageData.content = message[message.type].caption || null;
        break;
      case 'location':
        messageData.content = `Location: ${message.location.latitude}, ${message.location.longitude}`;
        break;
    }

    await prisma.whatsAppMessage.create({ data: messageData });

    // Update conversation
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
      },
    });

    // Auto-create or update contact if enabled
    if (!conversation.contactId && customerInfo?.profile?.name) {
      const contactData = {
        firstName: customerInfo.profile.name.split(' ')[0] || customerInfo.profile.name,
        lastName: customerInfo.profile.name.split(' ').slice(1).join(' ') || null,
        phone: customerPhone,
        source: 'WhatsApp',
        status: 'LEAD' as const,
        tenantId: integration.tenantId,
      };

      const contact = await prisma.contact.upsert({
        where: {
          tenantId_email: {
            tenantId: integration.tenantId,
            email: `${customerPhone}@whatsapp.placeholder`,
          },
        },
        update: contactData,
        create: {
          ...contactData,
          email: `${customerPhone}@whatsapp.placeholder`, // Placeholder email
        },
      });

      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { contactId: contact.id },
      });
    }
  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
}

async function processStatusUpdate(status: any) {
  try {
    if (!status.id) return;

    const message = await prisma.whatsAppMessage.findFirst({
      where: { waMessageId: status.id },
    });

    if (!message) {
      console.log('Message not found for status update:', status.id);
      return;
    }

    const updateData: any = {};

    switch (status.status) {
      case 'sent':
        updateData.status = 'SENT';
        updateData.sentAt = new Date(parseInt(status.timestamp) * 1000);
        break;
      case 'delivered':
        updateData.status = 'DELIVERED';
        updateData.deliveredAt = new Date(parseInt(status.timestamp) * 1000);
        break;
      case 'read':
        updateData.status = 'READ';
        updateData.readAt = new Date(parseInt(status.timestamp) * 1000);
        break;
      case 'failed':
        updateData.status = 'FAILED';
        updateData.errorMessage = status.errors?.[0]?.title || 'Message failed';
        break;
    }

    await prisma.whatsAppMessage.update({
      where: { id: message.id },
      data: updateData,
    });
  } catch (error) {
    console.error('Error processing status update:', error);
  }
} 