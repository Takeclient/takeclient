import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if list exists and belongs to tenant
    const list = await prisma.emailList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!list) {
      return NextResponse.json({ error: 'Email list not found' }, { status: 404 });
    }

    // Get all subscribers
    const subscribers = await prisma.emailSubscriber.findMany({
      where: {
        listId: params.id,
      },
      orderBy: {
        subscribedAt: 'desc',
      },
    });

    // Create CSV content
    const headers = ['Email', 'First Name', 'Last Name', 'Status', 'Source', 'Subscribed At', 'Unsubscribed At'];
    const csvRows = [headers.join(',')];

    subscribers.forEach(subscriber => {
      const row = [
        subscriber.email,
        subscriber.firstName || '',
        subscriber.lastName || '',
        subscriber.status,
        subscriber.source || '',
        subscriber.subscribedAt.toISOString(),
        subscriber.unsubscribedAt?.toISOString() || '',
      ];
      
      // Escape commas and quotes in CSV
      const escapedRow = row.map(field => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      });
      
      csvRows.push(escapedRow.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${list.name.replace(/[^a-zA-Z0-9]/g, '_')}_subscribers.csv"`,
      },
    });

  } catch (error) {
    console.error('Error exporting email list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 