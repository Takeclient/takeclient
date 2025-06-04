import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Temporary in-memory storage for GMB accounts
// In production, this would use the database
let gmbAccountsStorage: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Filter accounts by tenant
    const accounts = gmbAccountsStorage.filter(account => 
      account.tenantId === session.user.tenantId
    );

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching GMB accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      businessName,
      businessAddress,
      businessPhone,
      businessWebsite,
      businessCategory,
      businessType = 'LOCAL',
      accessToken,
      refreshToken,
      googleAccountId,
      googlePlaceId
    } = body;

    if (!businessName || !accessToken || !googleAccountId) {
      return NextResponse.json(
        { error: 'Business name, access token, and Google account ID are required' },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existingAccount = gmbAccountsStorage.find(account => 
      account.tenantId === session.user.tenantId && 
      account.googleAccountId === googleAccountId
    );

    if (existingAccount) {
      return NextResponse.json(
        { error: 'This Google My Business account is already connected' },
        { status: 409 }
      );
    }

    // Create new GMB account
    const newAccount = {
      id: `gmb_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      tenantId: session.user.tenantId,
      userId: session.user.id,
      businessName,
      businessAddress: businessAddress || null,
      businessPhone: businessPhone || null,
      businessWebsite: businessWebsite || null,
      businessCategory: businessCategory || null,
      businessType,
      googleAccountId,
      googlePlaceId: googlePlaceId || null,
      isVerified: false,
      verificationMethod: null,
      accessToken,
      refreshToken: refreshToken || null,
      tokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      scope: ['https://www.googleapis.com/auth/business.manage'],
      isActive: true,
      lastSync: new Date(),
      syncError: null,
      businessHours: null,
      attributes: null,
      photos: [],
      logo: null,
      coverPhoto: null,
      metadata: {
        connectedAt: new Date(),
        source: 'manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store the account
    gmbAccountsStorage.push(newAccount);

    return NextResponse.json({ 
      success: true, 
      account: newAccount,
      message: 'Google My Business account connected successfully' 
    });
  } catch (error) {
    console.error('Error creating GMB account:', error);
    return NextResponse.json(
      { error: 'Failed to connect GMB account' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const accountIndex = gmbAccountsStorage.findIndex(account => 
      account.id === id && account.tenantId === session.user.tenantId
    );

    if (accountIndex === -1) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Update the account
    gmbAccountsStorage[accountIndex] = {
      ...gmbAccountsStorage[accountIndex],
      ...updateData,
      updatedAt: new Date()
    };

    return NextResponse.json({ 
      success: true, 
      account: gmbAccountsStorage[accountIndex],
      message: 'Account updated successfully' 
    });
  } catch (error) {
    console.error('Error updating GMB account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('id');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    const accountIndex = gmbAccountsStorage.findIndex(account => 
      account.id === accountId && account.tenantId === session.user.tenantId
    );

    if (accountIndex === -1) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Remove the account
    gmbAccountsStorage.splice(accountIndex, 1);

    return NextResponse.json({ 
      success: true,
      message: 'GMB account disconnected successfully' 
    });
  } catch (error) {
    console.error('Error deleting GMB account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
} 