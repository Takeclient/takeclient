import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mappingStr = formData.get('mapping') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!mappingStr) {
      return NextResponse.json({ error: 'Column mapping is required' }, { status: 400 });
    }

    let mapping;
    try {
      mapping = JSON.parse(mappingStr);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid mapping format' }, { status: 400 });
    }

    if (typeof mapping.email !== 'number' || mapping.email < 0) {
      return NextResponse.json({ error: 'Email column mapping is required' }, { status: 400 });
    }

    // Read and parse CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain at least a header and one data row' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const dataLines = lines.slice(1);

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const cells = line.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
      
      // Extract email (required)
      const email = cells[mapping.email]?.toLowerCase().trim();
      if (!email) {
        errors.push(`Row ${i + 2}: Missing email address`);
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Row ${i + 2}: Invalid email format: ${email}`);
        continue;
      }

      // Extract optional fields
      const firstName = mapping.firstName >= 0 ? cells[mapping.firstName]?.trim() || null : null;
      const lastName = mapping.lastName >= 0 ? cells[mapping.lastName]?.trim() || null : null;

      try {
        // Check if already subscribed
        const existing = await prisma.emailSubscriber.findFirst({
          where: {
            email,
            listId: params.id,
          },
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        await prisma.emailSubscriber.create({
          data: {
            email,
            firstName,
            lastName,
            status: list.doubleOptIn ? 'PENDING' : 'ACTIVE',
            source: 'CSV_IMPORT',
            listId: params.id,
            subscribedAt: new Date(),
          },
        });

        importedCount++;
      } catch (error) {
        errors.push(`Row ${i + 2}: Failed to import ${email}: ${error}`);
      }
    }

    return NextResponse.json({
      imported: importedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit errors to first 10
      totalErrors: errors.length,
      message: `Successfully imported ${importedCount} subscribers${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
    });

  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 