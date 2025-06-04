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

    const { source, contactIds, companyIds, dealIds } = await request.json();

    if (!source || !['contacts', 'companies', 'deals'].includes(source)) {
      return NextResponse.json({ error: 'Invalid import source' }, { status: 400 });
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

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    try {
      if (source === 'contacts' && contactIds?.length > 0) {
        const contacts = await prisma.contact.findMany({
          where: {
            id: { in: contactIds },
            tenantId: session.user.tenantId,
            email: { not: null },
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        for (const contact of contacts) {
          if (!contact.email) continue;

          try {
            // Check if already subscribed
            const existing = await prisma.emailSubscriber.findFirst({
              where: {
                email: contact.email.toLowerCase(),
                listId: params.id,
              },
            });

            if (existing) {
              skippedCount++;
              continue;
            }

            await prisma.emailSubscriber.create({
              data: {
                email: contact.email.toLowerCase(),
                firstName: contact.firstName,
                lastName: contact.lastName,
                status: list.doubleOptIn ? 'PENDING' : 'ACTIVE',
                source: 'CONTACT_IMPORT',
                listId: params.id,
                subscribedAt: new Date(),
              },
            });

            importedCount++;
          } catch (error) {
            errors.push(`Failed to import contact ${contact.email}: ${error}`);
          }
        }
      }

      if (source === 'companies' && companyIds?.length > 0) {
        const companies = await prisma.company.findMany({
          where: {
            id: { in: companyIds },
            tenantId: session.user.tenantId,
            email: { not: null },
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        for (const company of companies) {
          if (!company.email) continue;

          try {
            // Check if already subscribed
            const existing = await prisma.emailSubscriber.findFirst({
              where: {
                email: company.email.toLowerCase(),
                listId: params.id,
              },
            });

            if (existing) {
              skippedCount++;
              continue;
            }

            await prisma.emailSubscriber.create({
              data: {
                email: company.email.toLowerCase(),
                firstName: company.name,
                lastName: null,
                status: list.doubleOptIn ? 'PENDING' : 'ACTIVE',
                source: 'COMPANY_IMPORT',
                listId: params.id,
                subscribedAt: new Date(),
              },
            });

            importedCount++;
          } catch (error) {
            errors.push(`Failed to import company ${company.email}: ${error}`);
          }
        }
      }

      if (source === 'deals' && dealIds?.length > 0) {
        const deals = await prisma.deal.findMany({
          where: {
            id: { in: dealIds },
            tenantId: session.user.tenantId,
          },
          include: {
            contact: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            company: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        });

        for (const deal of deals) {
          // Try contact email first, then company email
          const contactEmail = deal.contact?.email;
          const companyEmail = deal.company?.email;
          
          if (contactEmail) {
            try {
              // Check if already subscribed
              const existing = await prisma.emailSubscriber.findFirst({
                where: {
                  email: contactEmail.toLowerCase(),
                  listId: params.id,
                },
              });

              if (existing) {
                skippedCount++;
              } else {
                await prisma.emailSubscriber.create({
                  data: {
                    email: contactEmail.toLowerCase(),
                    firstName: deal.contact!.firstName,
                    lastName: deal.contact!.lastName,
                    status: list.doubleOptIn ? 'PENDING' : 'ACTIVE',
                    source: 'DEAL_IMPORT',
                    listId: params.id,
                    subscribedAt: new Date(),
                  },
                });
                importedCount++;
              }
            } catch (error) {
              errors.push(`Failed to import deal contact ${contactEmail}: ${error}`);
            }
          }

          if (companyEmail && companyEmail !== contactEmail) {
            try {
              // Check if already subscribed
              const existing = await prisma.emailSubscriber.findFirst({
                where: {
                  email: companyEmail.toLowerCase(),
                  listId: params.id,
                },
              });

              if (existing) {
                skippedCount++;
              } else {
                await prisma.emailSubscriber.create({
                  data: {
                    email: companyEmail.toLowerCase(),
                    firstName: deal.company!.name,
                    lastName: null,
                    status: list.doubleOptIn ? 'PENDING' : 'ACTIVE',
                    source: 'DEAL_IMPORT',
                    listId: params.id,
                    subscribedAt: new Date(),
                  },
                });
                importedCount++;
              }
            } catch (error) {
              errors.push(`Failed to import deal company ${companyEmail}: ${error}`);
            }
          }
        }
      }

      return NextResponse.json({
        imported: importedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully imported ${importedCount} subscribers${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}`,
      });

    } catch (error) {
      console.error('Error during import:', error);
      return NextResponse.json({ error: 'Import failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error importing subscribers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 