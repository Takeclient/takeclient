import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getComponentById } from '@/app/lib/landing-page-components';

interface PageSection {
  id: string;
  componentId: string;
  props: any;
}

// Helper function to render component with props
function renderComponent(componentId: string, props: any): string {
  const component = getComponentById(componentId);
  if (!component) return '';
  
  let html = component.template;
  
  // Simple template engine - replace {{prop}} with actual values
  Object.keys(props).forEach(key => {
    const value = props[key];
    
    if (Array.isArray(value)) {
      // Handle arrays with {{#each}} blocks
      const regex = new RegExp(`{{#each ${key}}}([\\s\\S]*?){{/each}}`, 'g');
      html = html.replace(regex, (match, content) => {
        return value.map((item: any) => {
          let itemHtml = content;
          if (typeof item === 'object') {
            Object.keys(item).forEach(itemKey => {
              itemHtml = itemHtml.replace(new RegExp(`{{this\\.${itemKey}}}`, 'g'), item[itemKey]);
            });
          }
          return itemHtml;
        }).join('');
      });
    } else if (typeof value === 'boolean') {
      // Handle boolean with {{#if}} blocks
      const ifRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, 'g');
      html = html.replace(ifRegex, (match, content) => {
        return value ? content : '';
      });
    } else {
      // Handle simple replacements
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  });
  
  return html;
}

export default async function PublicLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  // Find the published landing page by slug
  const page = await prisma.landingPage.findFirst({
    where: {
      slug: params.slug,
      status: 'PUBLISHED',
    },
    include: {
      tenant: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  // Track page view
  await prisma.landingPage.update({
    where: { id: page.id },
    data: {
      views: { increment: 1 },
    },
  });

  // Render sections
  const sections = (page.content as unknown as PageSection[]) || [];
  const renderedSections = sections.map(section => 
    renderComponent(section.componentId, section.props)
  ).join('');

  return (
    <>
      <head>
        <title>{page.metaTitle || page.name}</title>
        {page.metaDescription && (
          <meta name="description" content={page.metaDescription} />
        )}
        {page.metaKeywords && (
          <meta name="keywords" content={page.metaKeywords} />
        )}
        {page.ogTitle && (
          <meta property="og:title" content={page.ogTitle} />
        )}
        {page.ogDescription && (
          <meta property="og:description" content={page.ogDescription} />
        )}
        {page.ogImage && (
          <meta property="og:image" content={page.ogImage} />
        )}
        {page.favicon && (
          <link rel="icon" href={page.favicon} />
        )}
        {page.css && (
          <style dangerouslySetInnerHTML={{ __html: page.css }} />
        )}
      </head>
      
      <div dangerouslySetInnerHTML={{ __html: renderedSections }} />
      
      {page.javascript && (
        <script dangerouslySetInnerHTML={{ __html: page.javascript }} />
      )}
    </>
  );
} 