import { NextRequest, NextResponse } from 'next/server';

// Industry-specific template data with real content structures
const INDUSTRY_TEMPLATES = [
  // SaaS & Technology
  {
    id: 'saas-analytics',
    name: 'Analytics Dashboard',
    description: 'Perfect for analytics and data visualization platforms',
    category: 'saas',
    industry: 'Technology',
    tags: ['analytics', 'dashboard', 'data', 'saas'],
    isPremium: false,
    isActive: true,
    thumbnail: '/templates/saas-analytics.jpg',
    content: [
      {
        id: 'hero-section',
        componentId: 'hero-1',
        props: {
          title: 'Turn Data Into Actionable Insights',
          subtitle: 'Powerful analytics platform that helps you make data-driven decisions with real-time dashboards and automated reporting.',
          ctaText: 'Start Free Trial',
          ctaLink: '#signup',
          secondaryCtaText: 'Watch Demo',
          secondaryCtaLink: '#demo',
          backgroundOverlay: true
        }
      },
      {
        id: 'features-section',
        componentId: 'features-1',
        props: {
          title: 'Everything You Need to Analyze Data',
          subtitle: 'Comprehensive analytics tools designed for modern businesses',
          features: [
            {
              icon: 'ChartBarIcon',
              title: 'Real-time Dashboards',
              description: 'Monitor your KPIs with live updating dashboards and customizable widgets.'
            },
            {
              icon: 'DocumentChartBarIcon',
              title: 'Automated Reports',
              description: 'Schedule and automate your reporting workflows with smart insights.'
            },
            {
              icon: 'ShareIcon',
              title: 'Team Collaboration',
              description: 'Share insights and collaborate with your team in real-time.'
            }
          ]
        }
      },
      {
        id: 'testimonials-section',
        componentId: 'testimonials-1',
        props: {
          title: 'Trusted by Data-Driven Companies',
          testimonials: [
            {
              quote: 'This platform transformed how we analyze our customer data. The insights are invaluable.',
              author: 'Sarah Chen',
              role: 'Head of Analytics at TechCorp',
              avatar: ''
            },
            {
              quote: 'The automated reporting feature saves us hours every week. Highly recommended!',
              author: 'Michael Rodriguez',
              role: 'Data Scientist at InnovateLab',
              avatar: ''
            }
          ]
        }
      },
      {
        id: 'cta-section',
        componentId: 'cta-1',
        props: {
          title: 'Ready to Unlock Your Data\'s Potential?',
          subtitle: 'Join thousands of companies using our platform to make better decisions.',
          ctaText: 'Start Your Free Trial',
          ctaLink: '#signup',
          backgroundColor: '#3B82F6'
        }
      }
    ]
  },
  
  // E-commerce
  {
    id: 'ecommerce-fashion',
    name: 'Fashion Store',
    description: 'Stylish e-commerce template for fashion and retail brands',
    category: 'ecommerce',
    industry: 'Retail',
    tags: ['fashion', 'store', 'retail', 'shopping'],
    isPremium: false,
    isActive: true,
    thumbnail: '/templates/ecommerce-fashion.jpg',
    content: [
      {
        id: 'hero-section',
        componentId: 'hero-2',
        props: {
          title: 'Discover Your Perfect Style',
          subtitle: 'Premium fashion collection with the latest trends and timeless classics for every occasion.',
          ctaText: 'Shop Now',
          ctaLink: '#shop',
          heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
          imagePosition: 'right'
        }
      },
      {
        id: 'features-section',
        componentId: 'features-2',
        props: {
          title: 'Why Fashion Lovers Choose Us',
          features: [
            {
              title: 'Premium Quality',
              description: 'Carefully curated collection of high-quality materials',
              icon: '✨'
            },
            {
              title: 'Fast Shipping',
              description: 'Free shipping on orders over $50 with express delivery',
              icon: '🚚'
            },
            {
              title: 'Easy Returns',
              description: '30-day hassle-free returns and exchanges',
              icon: '🔄'
            },
            {
              title: 'Style Advice',
              description: 'Personal styling tips and fashion consultations',
              icon: '👗'
            }
          ]
        }
      },
      {
        id: 'testimonials-section',
        componentId: 'testimonials-1',
        props: {
          title: 'What Our Customers Say',
          testimonials: [
            {
              quote: 'Amazing quality and the fit is perfect! My new favorite online store.',
              author: 'Emma Watson',
              role: 'Fashion Blogger',
              avatar: ''
            },
            {
              quote: 'Fast delivery and excellent customer service. Highly recommend!',
              author: 'Jessica Taylor',
              role: 'Style Enthusiast',
              avatar: ''
            }
          ]
        }
      }
    ]
  },

  // Healthcare
  {
    id: 'healthcare-clinic',
    name: 'Medical Clinic',
    description: 'Professional template for healthcare providers and medical clinics',
    category: 'healthcare',
    industry: 'Healthcare',
    tags: ['medical', 'clinic', 'healthcare', 'doctor'],
    isPremium: false,
    isActive: true,
    thumbnail: '/templates/healthcare-clinic.jpg',
    content: [
      {
        id: 'hero-section',
        componentId: 'hero-1',
        props: {
          title: 'Caring for Your Health & Wellness',
          subtitle: 'Comprehensive medical care with experienced professionals dedicated to your well-being and recovery.',
          ctaText: 'Book Appointment',
          ctaLink: '#booking',
          secondaryCtaText: 'Our Services',
          secondaryCtaLink: '#services',
          backgroundOverlay: true
        }
      },
      {
        id: 'features-section',
        componentId: 'features-1',
        props: {
          title: 'Our Medical Services',
          subtitle: 'Comprehensive healthcare solutions for you and your family',
          features: [
            {
              icon: 'HeartIcon',
              title: 'Primary Care',
              description: 'Comprehensive primary care services for patients of all ages.'
            },
            {
              icon: 'UserGroupIcon',
              title: 'Specialist Consultations',
              description: 'Expert consultations with board-certified specialists.'
            },
            {
              icon: 'ClockIcon',
              title: 'Emergency Care',
              description: '24/7 emergency services with rapid response teams.'
            }
          ]
        }
      },
      {
        id: 'contact-section',
        componentId: 'contact-form',
        props: {
          title: 'Schedule Your Appointment',
          submitText: 'Book Appointment',
          showPhone: true,
          showCompany: false
        }
      }
    ]
  },

  // Real Estate
  {
    id: 'realestate-agency',
    name: 'Real Estate Agency',
    description: 'Professional template for real estate agencies and property listings',
    category: 'realestate',
    industry: 'Real Estate',
    tags: ['property', 'real estate', 'agency', 'homes'],
    isPremium: true,
    isActive: true,
    thumbnail: '/templates/realestate-agency.jpg',
    content: [
      {
        id: 'hero-section',
        componentId: 'hero-2',
        props: {
          title: 'Find Your Dream Home',
          subtitle: 'Expert real estate services helping you buy, sell, or invest in properties with confidence and success.',
          ctaText: 'Browse Properties',
          ctaLink: '#properties',
          heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
          imagePosition: 'right'
        }
      },
      {
        id: 'features-section',
        componentId: 'features-2',
        props: {
          title: 'Why Choose Our Agency',
          features: [
            {
              title: 'Market Expertise',
              description: 'Deep knowledge of local market trends and pricing',
              icon: '📊'
            },
            {
              title: 'Personalized Service',
              description: 'Dedicated agents providing tailored solutions',
              icon: '🤝'
            },
            {
              title: 'Proven Results',
              description: '95% client satisfaction with successful transactions',
              icon: '🏆'
            },
            {
              title: 'Full Support',
              description: 'End-to-end support from search to closing',
              icon: '🔑'
            }
          ]
        }
      }
    ]
  },

  // Restaurant & Food
  {
    id: 'restaurant-fine-dining',
    name: 'Fine Dining Restaurant',
    description: 'Elegant template for restaurants and culinary experiences',
    category: 'restaurant',
    industry: 'Food & Beverage',
    tags: ['restaurant', 'food', 'dining', 'culinary'],
    isPremium: false,
    isActive: true,
    thumbnail: '/templates/restaurant-fine-dining.jpg',
    content: [
      {
        id: 'hero-section',
        componentId: 'hero-1',
        props: {
          title: 'An Exceptional Culinary Journey',
          subtitle: 'Experience exquisite flavors and impeccable service in an atmosphere of refined elegance and culinary artistry.',
          ctaText: 'Make Reservation',
          ctaLink: '#reservation',
          secondaryCtaText: 'View Menu',
          secondaryCtaLink: '#menu',
          backgroundOverlay: true
        }
      },
      {
        id: 'features-section',
        componentId: 'features-1',
        props: {
          title: 'What Makes Us Special',
          subtitle: 'Every detail crafted for an unforgettable dining experience',
          features: [
            {
              icon: 'SparklesIcon',
              title: 'Chef\'s Specialties',
              description: 'Signature dishes crafted by our award-winning chef using finest ingredients.'
            },
            {
              icon: 'GlobeAltIcon',
              title: 'Wine Collection',
              description: 'Carefully curated wine selection from renowned vineyards worldwide.'
            },
            {
              icon: 'HeartIcon',
              title: 'Intimate Atmosphere',
              description: 'Elegant ambiance perfect for romantic dinners and special occasions.'
            }
          ]
        }
      }
    ]
  },

  // Fitness & Wellness
  {
    id: 'fitness-gym',
    name: 'Fitness Studio',
    description: 'Dynamic template for gyms, fitness studios, and wellness centers',
    category: 'fitness',
    industry: 'Health & Fitness',
    tags: ['fitness', 'gym', 'wellness', 'health'],
    isPremium: false,
    isActive: true,
    thumbnail: '/templates/fitness-gym.jpg',
    content: [
      {
        id: 'hero-section',
        componentId: 'hero-1',
        props: {
          title: 'Transform Your Body, Transform Your Life',
          subtitle: 'State-of-the-art fitness facility with expert trainers helping you achieve your health and fitness goals.',
          ctaText: 'Start Your Journey',
          ctaLink: '#membership',
          secondaryCtaText: 'Free Trial',
          secondaryCtaLink: '#trial',
          backgroundOverlay: true
        }
      },
      {
        id: 'features-section',
        componentId: 'features-2',
        props: {
          title: 'Your Complete Fitness Solution',
          features: [
            {
              title: 'Expert Trainers',
              description: 'Certified personal trainers to guide your fitness journey',
              icon: '💪'
            },
            {
              title: 'Modern Equipment',
              description: 'Latest fitness equipment and technology',
              icon: '🏋️'
            },
            {
              title: 'Group Classes',
              description: 'Variety of group fitness classes for all levels',
              icon: '👥'
            },
            {
              title: 'Nutrition Guidance',
              description: 'Personalized nutrition plans and meal prep advice',
              icon: '🥗'
            }
          ]
        }
      }
    ]
  },

  // Professional Services
  {
    id: 'consulting-business',
    name: 'Business Consulting',
    description: 'Professional template for consulting firms and business services',
    category: 'business',
    industry: 'Professional Services',
    tags: ['consulting', 'business', 'professional', 'services'],
    isPremium: true,
    isActive: true,
    thumbnail: '/templates/consulting-business.jpg',
    content: [
      {
        id: 'hero-section',
        componentId: 'hero-2',
        props: {
          title: 'Accelerate Your Business Growth',
          subtitle: 'Strategic consulting services that help businesses optimize operations, increase efficiency, and achieve sustainable growth.',
          ctaText: 'Get Consultation',
          ctaLink: '#consultation',
          heroImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop',
          imagePosition: 'right'
        }
      },
      {
        id: 'features-section',
        componentId: 'features-1',
        props: {
          title: 'Our Expertise Areas',
          subtitle: 'Comprehensive consulting services for modern businesses',
          features: [
            {
              icon: 'ChartBarIcon',
              title: 'Strategy Development',
              description: 'Custom strategies aligned with your business goals and market opportunities.'
            },
            {
              icon: 'CogIcon',
              title: 'Process Optimization',
              description: 'Streamline operations to improve efficiency and reduce costs.'
            },
            {
              icon: 'UserGroupIcon',
              title: 'Team Development',
              description: 'Leadership training and organizational development programs.'
            }
          ]
        }
      }
    ]
  },

  // Education
  {
    id: 'education-online-course',
    name: 'Online Learning Platform',
    description: 'Modern template for educational institutions and online courses',
    category: 'education',
    industry: 'Education',
    tags: ['education', 'learning', 'courses', 'online'],
    isPremium: false,
    isActive: true,
    thumbnail: '/templates/education-online-course.jpg',
    content: [
      {
        id: 'hero-section',
        componentId: 'hero-1',
        props: {
          title: 'Learn New Skills, Advance Your Career',
          subtitle: 'Expert-led online courses designed to help you master new skills and achieve your professional goals from anywhere.',
          ctaText: 'Start Learning',
          ctaLink: '#courses',
          secondaryCtaText: 'Browse Courses',
          secondaryCtaLink: '#browse',
          backgroundOverlay: true
        }
      },
      {
        id: 'features-section',
        componentId: 'features-2',
        props: {
          title: 'Why Students Choose Us',
          features: [
            {
              title: 'Expert Instructors',
              description: 'Learn from industry professionals and subject matter experts',
              icon: '🎓'
            },
            {
              title: 'Flexible Learning',
              description: 'Study at your own pace with lifetime access to content',
              icon: '⏰'
            },
            {
              title: 'Practical Projects',
              description: 'Hands-on projects to build your portfolio',
              icon: '🛠️'
            },
            {
              title: 'Certificates',
              description: 'Earn recognized certificates upon course completion',
              icon: '📜'
            }
          ]
        }
      }
    ]
  }
];

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Industries' },
  { id: 'saas', name: 'SaaS & Technology' },
  { id: 'ecommerce', name: 'E-commerce & Retail' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'realestate', name: 'Real Estate' },
  { id: 'restaurant', name: 'Food & Beverage' },
  { id: 'fitness', name: 'Health & Fitness' },
  { id: 'business', name: 'Professional Services' },
  { id: 'education', name: 'Education' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const premium = searchParams.get('premium');

    let filteredTemplates = INDUSTRY_TEMPLATES.filter(template => template.isActive);

    // Filter by category
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        template.industry.toLowerCase().includes(searchLower)
      );
    }

    // Filter by premium
    if (premium === 'true') {
      filteredTemplates = filteredTemplates.filter(template => template.isPremium);
    }

    return NextResponse.json({
      templates: filteredTemplates,
      categories: TEMPLATE_CATEGORIES,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateId } = await request.json();
    
    const template = INDUSTRY_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 