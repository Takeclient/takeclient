export interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  components: PageComponent[];
}

export interface PageComponent {
  id: string;
  type: string;
  name: string;
  category: string;
  icon: string;
  preview?: string;
  schema: ComponentSchema;
  defaultProps: any;
  template: string;
}

export interface ComponentSchema {
  [key: string]: {
    type: 'text' | 'textarea' | 'number' | 'color' | 'image' | 'boolean' | 'select' | 'array' | 'form';
    label: string;
    default?: any;
    options?: { label: string; value: string }[];
    placeholder?: string;
  };
}

export const componentCategories: ComponentCategory[] = [
  {
    id: 'headers',
    name: 'Headers',
    icon: 'Bars3Icon',
    components: [
      {
        id: 'hero-1',
        type: 'hero',
        name: 'Hero Section',
        category: 'headers',
        icon: 'SparklesIcon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'Build Something Amazing' },
          subtitle: { type: 'textarea', label: 'Subtitle', default: 'Create beautiful landing pages with our drag-and-drop builder' },
          ctaText: { type: 'text', label: 'CTA Text', default: 'Get Started' },
          ctaLink: { type: 'text', label: 'CTA Link', default: '#' },
          secondaryCtaText: { type: 'text', label: 'Secondary CTA Text', default: 'Learn More' },
          secondaryCtaLink: { type: 'text', label: 'Secondary CTA Link', default: '#' },
          backgroundImage: { type: 'image', label: 'Background Image' },
          backgroundOverlay: { type: 'boolean', label: 'Dark Overlay', default: true },
        },
        defaultProps: {
          title: 'Build Something Amazing',
          subtitle: 'Create beautiful landing pages with our drag-and-drop builder',
          ctaText: 'Get Started',
          ctaLink: '#',
          secondaryCtaText: 'Learn More',
          secondaryCtaLink: '#',
          backgroundOverlay: true,
        },
        template: `
          <section class="relative bg-gray-900 text-white">
            {{#if backgroundImage}}
              <div class="absolute inset-0">
                <img src="{{backgroundImage}}" alt="" class="w-full h-full object-cover">
                {{#if backgroundOverlay}}
                  <div class="absolute inset-0 bg-gray-900 opacity-75"></div>
                {{/if}}
              </div>
            {{/if}}
            <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
              <div class="text-center">
                <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                  {{title}}
                </h1>
                <p class="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
                  {{subtitle}}
                </p>
                <div class="mt-10 flex items-center justify-center gap-x-6">
                  <a href="{{ctaLink}}" class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                    {{ctaText}}
                  </a>
                  <a href="{{secondaryCtaLink}}" class="text-sm font-semibold leading-6 text-gray-300 hover:text-white">
                    {{secondaryCtaText}} <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        `,
      },
      {
        id: 'hero-2',
        type: 'hero',
        name: 'Hero with Image',
        category: 'headers',
        icon: 'SparklesIcon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'Welcome to our Platform' },
          subtitle: { type: 'textarea', label: 'Subtitle', default: 'The best solution for your business needs' },
          ctaText: { type: 'text', label: 'CTA Text', default: 'Start Free Trial' },
          ctaLink: { type: 'text', label: 'CTA Link', default: '#' },
          heroImage: { type: 'image', label: 'Hero Image', default: 'https://via.placeholder.com/600x400' },
          imagePosition: { 
            type: 'select', 
            label: 'Image Position', 
            default: 'right',
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Right', value: 'right' }
            ]
          },
        },
        defaultProps: {
          title: 'Welcome to our Platform',
          subtitle: 'The best solution for your business needs',
          ctaText: 'Start Free Trial',
          ctaLink: '#',
          heroImage: 'https://via.placeholder.com/600x400',
          imagePosition: 'right',
        },
        template: `
          <section class="bg-white py-16 sm:py-24">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                <div class="{{#if imagePosition}}{{#if imagePosition == 'right'}}lg:order-1{{else}}lg:order-2{{/if}}{{/if}}">
                  <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                    {{title}}
                  </h1>
                  <p class="mt-4 text-xl text-gray-500">
                    {{subtitle}}
                  </p>
                  <div class="mt-8">
                    <a href="{{ctaLink}}" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                      {{ctaText}}
                    </a>
                  </div>
                </div>
                <div class="mt-12 lg:mt-0 {{#if imagePosition}}{{#if imagePosition == 'right'}}lg:order-2{{else}}lg:order-1{{/if}}{{/if}}">
                  <img class="rounded-lg shadow-xl" src="{{heroImage}}" alt="Hero image">
                </div>
              </div>
            </div>
          </section>
        `,
      },
      {
        id: 'navbar-1',
        type: 'navbar',
        name: 'Navigation Bar',
        category: 'headers',
        icon: 'Bars3Icon',
        schema: {
          logo: { type: 'image', label: 'Logo' },
          logoText: { type: 'text', label: 'Logo Text', default: 'YourBrand' },
          links: {
            type: 'array',
            label: 'Navigation Links',
            default: [
              { text: 'Features', href: '#features' },
              { text: 'Pricing', href: '#pricing' },
              { text: 'About', href: '#about' },
              { text: 'Contact', href: '#contact' },
            ],
          },
          ctaText: { type: 'text', label: 'CTA Text', default: 'Get Started' },
          ctaLink: { type: 'text', label: 'CTA Link', default: '#' },
        },
        defaultProps: {
          logoText: 'YourBrand',
          links: [
            { text: 'Features', href: '#features' },
            { text: 'Pricing', href: '#pricing' },
            { text: 'About', href: '#about' },
            { text: 'Contact', href: '#contact' },
          ],
          ctaText: 'Get Started',
          ctaLink: '#',
        },
        template: `
          <nav class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between h-16">
                <div class="flex">
                  <div class="flex-shrink-0 flex items-center">
                    {{#if logo}}
                      <img class="h-8 w-auto" src="{{logo}}" alt="{{logoText}}">
                    {{else}}
                      <span class="text-xl font-bold text-gray-900">{{logoText}}</span>
                    {{/if}}
                  </div>
                  <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {{#each links}}
                      <a href="{{this.href}}" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        {{this.text}}
                      </a>
                    {{/each}}
                  </div>
                </div>
                <div class="hidden sm:ml-6 sm:flex sm:items-center">
                  <a href="{{ctaLink}}" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    {{ctaText}}
                  </a>
                </div>
              </div>
            </div>
          </nav>
        `,
      },
    ],
  },
  {
    id: 'content',
    name: 'Content',
    icon: 'DocumentTextIcon',
    components: [
      {
        id: 'features-1',
        type: 'features',
        name: 'Features Grid',
        category: 'content',
        icon: 'Squares2X2Icon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'Our Features' },
          subtitle: { type: 'textarea', label: 'Subtitle', default: 'Everything you need to build amazing landing pages' },
          features: {
            type: 'array',
            label: 'Features',
            default: [
              {
                icon: 'SparklesIcon',
                title: 'Beautiful Design',
                description: 'Create stunning pages with our modern templates',
              },
              {
                icon: 'BoltIcon',
                title: 'Lightning Fast',
                description: 'Optimized for speed and performance',
              },
              {
                icon: 'ShieldCheckIcon',
                title: 'Secure & Reliable',
                description: 'Built with security best practices in mind',
              },
            ],
          },
        },
        defaultProps: {
          title: 'Our Features',
          subtitle: 'Everything you need to build amazing landing pages',
          features: [
            {
              icon: 'SparklesIcon',
              title: 'Beautiful Design',
              description: 'Create stunning pages with our modern templates',
            },
            {
              icon: 'BoltIcon',
              title: 'Lightning Fast',
              description: 'Optimized for speed and performance',
            },
            {
              icon: 'ShieldCheckIcon',
              title: 'Secure & Reliable',
              description: 'Built with security best practices in mind',
            },
          ],
        },
        template: `
          <section class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  {{title}}
                </h2>
                <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                  {{subtitle}}
                </p>
              </div>
              <div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {{#each features}}
                  <div class="pt-6">
                    <div class="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                      <div class="-mt-6">
                        <div>
                          <span class="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </div>
                        <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">{{this.title}}</h3>
                        <p class="mt-5 text-base text-gray-500">
                          {{this.description}}
                        </p>
                      </div>
                    </div>
                  </div>
                {{/each}}
              </div>
            </div>
          </section>
        `,
      },
      {
        id: 'features-2',
        type: 'features',
        name: 'Features with Icons',
        category: 'content',
        icon: 'Squares2X2Icon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'Why Choose Us' },
          features: {
            type: 'array',
            label: 'Features',
            default: [
              {
                title: '24/7 Support',
                description: 'Get help whenever you need it',
                icon: '🎯',
              },
              {
                title: 'Easy Integration',
                description: 'Connect with your favorite tools',
                icon: '🔗',
              },
              {
                title: 'Analytics',
                description: 'Track performance in real-time',
                icon: '📊',
              },
              {
                title: 'Secure',
                description: 'Enterprise-grade security',
                icon: '🔒',
              },
            ],
          },
        },
        defaultProps: {
          title: 'Why Choose Us',
          features: [
            {
              title: '24/7 Support',
              description: 'Get help whenever you need it',
              icon: '🎯',
            },
            {
              title: 'Easy Integration',
              description: 'Connect with your favorite tools',
              icon: '🔗',
            },
            {
              title: 'Analytics',
              description: 'Track performance in real-time',
              icon: '📊',
            },
            {
              title: 'Secure',
              description: 'Enterprise-grade security',
              icon: '🔒',
            },
          ],
        },
        template: `
          <section class="py-16 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 class="text-3xl font-extrabold text-center text-gray-900 mb-12">
                {{title}}
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {{#each features}}
                  <div class="text-center">
                    <div class="text-4xl mb-4">{{this.icon}}</div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">{{this.title}}</h3>
                    <p class="text-gray-600">{{this.description}}</p>
                  </div>
                {{/each}}
              </div>
            </div>
          </section>
        `,
      },
      {
        id: 'text-block-1',
        type: 'text-block',
        name: 'Text Section',
        category: 'content',
        icon: 'DocumentTextIcon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'About Our Mission' },
          content: { 
            type: 'textarea', 
            label: 'Content', 
            default: 'We are dedicated to providing the best service possible. Our team works tirelessly to ensure your success.' 
          },
          alignment: {
            type: 'select',
            label: 'Text Alignment',
            default: 'center',
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ],
          },
        },
        defaultProps: {
          title: 'About Our Mission',
          content: 'We are dedicated to providing the best service possible. Our team works tirelessly to ensure your success.',
          alignment: 'center',
        },
        template: `
          <section class="py-16 bg-white">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-{{alignment}}">
              <h2 class="text-3xl font-extrabold text-gray-900 mb-6">
                {{title}}
              </h2>
              <div class="prose prose-lg text-gray-500 mx-auto">
                {{content}}
              </div>
            </div>
          </section>
        `,
      },
      {
        id: 'testimonials-1',
        type: 'testimonials',
        name: 'Testimonials',
        category: 'content',
        icon: 'ChatBubbleLeftRightIcon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'What Our Customers Say' },
          testimonials: {
            type: 'array',
            label: 'Testimonials',
            default: [
              {
                quote: 'This product has completely transformed how we do business.',
                author: 'Sarah Johnson',
                role: 'CEO at TechCorp',
                avatar: '',
              },
              {
                quote: 'The best investment we have made for our company.',
                author: 'Mike Chen',
                role: 'CTO at StartupXYZ',
                avatar: '',
              },
            ],
          },
        },
        defaultProps: {
          title: 'What Our Customers Say',
          testimonials: [
            {
              quote: 'This product has completely transformed how we do business.',
              author: 'Sarah Johnson',
              role: 'CEO at TechCorp',
              avatar: '',
            },
            {
              quote: 'The best investment we have made for our company.',
              author: 'Mike Chen',
              role: 'CTO at StartupXYZ',
              avatar: '',
            },
          ],
        },
        template: `
          <section class="bg-gray-50 py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center">
                <h2 class="text-3xl font-extrabold text-gray-900">
                  {{title}}
                </h2>
              </div>
              <div class="mt-12 grid gap-8 lg:grid-cols-2">
                {{#each testimonials}}
                  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div class="p-8">
                      <div class="mb-4">
                        <svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 32 32">
                          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                        </svg>
                      </div>
                      <p class="text-lg text-gray-600 italic">
                        "{{this.quote}}"
                      </p>
                      <div class="mt-6 flex items-center">
                        {{#if this.avatar}}
                          <img class="h-12 w-12 rounded-full" src="{{this.avatar}}" alt="{{this.author}}">
                        {{else}}
                          <div class="h-12 w-12 rounded-full bg-gray-300"></div>
                        {{/if}}
                        <div class="ml-4">
                          <p class="text-base font-medium text-gray-900">{{this.author}}</p>
                          <p class="text-sm text-gray-500">{{this.role}}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                {{/each}}
              </div>
            </div>
          </section>
        `,
      },
      {
        id: 'pricing-1',
        type: 'pricing',
        name: 'Pricing Table',
        category: 'content',
        icon: 'CurrencyDollarIcon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'Choose Your Plan' },
          subtitle: { type: 'text', label: 'Subtitle', default: 'Select the perfect plan for your needs' },
          plans: {
            type: 'array',
            label: 'Pricing Plans',
            default: [
              {
                name: 'Basic',
                price: '$9',
                period: '/month',
                features: ['10 Projects', '2 GB Storage', 'Email Support'],
                ctaText: 'Get Started',
                ctaLink: '#',
                featured: false,
              },
              {
                name: 'Pro',
                price: '$29',
                period: '/month',
                features: ['Unlimited Projects', '10 GB Storage', 'Priority Support', 'Advanced Analytics'],
                ctaText: 'Get Started',
                ctaLink: '#',
                featured: true,
              },
              {
                name: 'Enterprise',
                price: '$99',
                period: '/month',
                features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Support', 'Custom Integrations'],
                ctaText: 'Contact Sales',
                ctaLink: '#',
                featured: false,
              },
            ],
          },
        },
        defaultProps: {
          title: 'Choose Your Plan',
          subtitle: 'Select the perfect plan for your needs',
          plans: [
            {
              name: 'Basic',
              price: '$9',
              period: '/month',
              features: ['10 Projects', '2 GB Storage', 'Email Support'],
              ctaText: 'Get Started',
              ctaLink: '#',
              featured: false,
            },
            {
              name: 'Pro',
              price: '$29',
              period: '/month',
              features: ['Unlimited Projects', '10 GB Storage', 'Priority Support', 'Advanced Analytics'],
              ctaText: 'Get Started',
              ctaLink: '#',
              featured: true,
            },
            {
              name: 'Enterprise',
              price: '$99',
              period: '/month',
              features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Support', 'Custom Integrations'],
              ctaText: 'Contact Sales',
              ctaLink: '#',
              featured: false,
            },
          ],
        },
        template: `
          <section class="py-16 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  {{title}}
                </h2>
                <p class="mt-4 text-xl text-gray-600">
                  {{subtitle}}
                </p>
              </div>
              <div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {{#each plans}}
                  <div class="bg-white rounded-lg shadow-lg {{#if this.featured}}ring-2 ring-blue-500{{/if}}">
                    {{#if this.featured}}
                      <div class="bg-blue-500 text-white text-center py-2 rounded-t-lg">
                        <span class="text-sm font-semibold">MOST POPULAR</span>
                      </div>
                    {{/if}}
                    <div class="p-8">
                      <h3 class="text-2xl font-semibold text-gray-900">{{this.name}}</h3>
                      <div class="mt-4 flex items-baseline">
                        <span class="text-4xl font-extrabold text-gray-900">{{this.price}}</span>
                        <span class="text-xl text-gray-500">{{this.period}}</span>
                      </div>
                      <ul class="mt-8 space-y-4">
                        {{#each this.features}}
                          <li class="flex items-start">
                            <svg class="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-gray-600">{{this}}</span>
                          </li>
                        {{/each}}
                      </ul>
                      <div class="mt-8">
                        <a href="{{this.ctaLink}}" class="block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium {{#if this.featured}}bg-blue-600 text-white hover:bg-blue-700{{else}}bg-gray-100 text-gray-900 hover:bg-gray-200{{/if}}">
                          {{this.ctaText}}
                        </a>
                      </div>
                    </div>
                  </div>
                {{/each}}
              </div>
            </div>
          </section>
        `,
      },
    ],
  },
  {
    id: 'cta',
    name: 'Call to Action',
    icon: 'MegaphoneIcon',
    components: [
      {
        id: 'cta-1',
        type: 'cta',
        name: 'Simple CTA',
        category: 'cta',
        icon: 'MegaphoneIcon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'Ready to get started?' },
          subtitle: { type: 'text', label: 'Subtitle', default: 'Start your free trial today.' },
          ctaText: { type: 'text', label: 'CTA Text', default: 'Get Started' },
          ctaLink: { type: 'text', label: 'CTA Link', default: '#' },
          backgroundColor: { type: 'color', label: 'Background Color', default: '#3B82F6' },
        },
        defaultProps: {
          title: 'Ready to get started?',
          subtitle: 'Start your free trial today.',
          ctaText: 'Get Started',
          ctaLink: '#',
          backgroundColor: '#3B82F6',
        },
        template: `
          <section style="background-color: {{backgroundColor}}" class="py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
                {{title}}
              </h2>
              <p class="mt-4 text-lg text-blue-100">
                {{subtitle}}
              </p>
              <div class="mt-8">
                <a href="{{ctaLink}}" class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-blue-600 bg-white hover:bg-gray-50">
                  {{ctaText}}
                </a>
              </div>
            </div>
          </section>
        `,
      },
      {
        id: 'cta-2',
        type: 'cta',
        name: 'CTA with Form',
        category: 'cta',
        icon: 'MegaphoneIcon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'Get Early Access' },
          subtitle: { type: 'text', label: 'Subtitle', default: 'Be the first to know when we launch.' },
          buttonText: { type: 'text', label: 'Button Text', default: 'Join Waitlist' },
          placeholderText: { type: 'text', label: 'Placeholder', default: 'Enter your email' },
        },
        defaultProps: {
          title: 'Get Early Access',
          subtitle: 'Be the first to know when we launch.',
          buttonText: 'Join Waitlist',
          placeholderText: 'Enter your email',
        },
        template: `
          <section class="bg-blue-600 py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="max-w-2xl mx-auto text-center">
                <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
                  {{title}}
                </h2>
                <p class="mt-4 text-lg text-blue-100">
                  {{subtitle}}
                </p>
                <form class="mt-8 sm:flex sm:max-w-md sm:mx-auto">
                  <label for="cta-email" class="sr-only">Email address</label>
                  <input type="email" name="email" id="cta-email" autocomplete="email" required class="appearance-none min-w-0 w-full bg-white border border-transparent rounded-md shadow-sm py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white focus:border-white focus:placeholder-gray-400" placeholder="{{placeholderText}}">
                  <div class="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button type="submit" class="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      {{buttonText}}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        `,
      },
    ],
  },
  {
    id: 'forms',
    name: 'Forms',
    icon: 'ClipboardDocumentListIcon',
    components: [
      {
        id: 'form-select',
        type: 'form',
        name: 'Existing Form',
        category: 'forms',
        icon: 'ClipboardDocumentListIcon',
        schema: {
          formId: { type: 'form', label: 'Select Form', default: '' },
          title: { type: 'text', label: 'Section Title', default: 'Get in Touch' },
          subtitle: { type: 'text', label: 'Section Subtitle', default: 'Fill out the form below and we\'ll get back to you soon.' },
        },
        defaultProps: {
          formId: '',
          title: 'Get in Touch',
          subtitle: 'Fill out the form below and we\'ll get back to you soon.',
        },
        template: `
          <section class="bg-white py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="max-w-2xl mx-auto text-center">
                <h2 class="text-3xl font-extrabold text-gray-900">
                  {{title}}
                </h2>
                <p class="mt-4 text-lg text-gray-500">
                  {{subtitle}}
                </p>
              </div>
              <div class="mt-12 max-w-lg mx-auto">
                {{#if formId}}
                  <div data-form-id="{{formId}}" class="form-container">
                    <!-- Form will be loaded here -->
                  </div>
                {{else}}
                  <div class="bg-gray-100 rounded-lg p-8 text-center">
                    <p class="text-gray-500">Please select a form from your form builder</p>
                  </div>
                {{/if}}
              </div>
            </div>
          </section>
        `,
      },
      {
        id: 'contact-form',
        type: 'contact',
        name: 'Contact Form',
        category: 'forms',
        icon: 'EnvelopeIcon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'Contact Us' },
          subtitle: { type: 'text', label: 'Subtitle', default: 'Get in touch with us' },
          submitText: { type: 'text', label: 'Submit Button Text', default: 'Send Message' },
          showPhone: { type: 'boolean', label: 'Show Phone Field', default: true },
          showCompany: { type: 'boolean', label: 'Show Company Field', default: false },
        },
        defaultProps: {
          title: 'Contact Us',
          subtitle: 'Get in touch with us',
          submitText: 'Send Message',
          showPhone: true,
          showCompany: false,
        },
        template: `
          <section class="bg-gray-50 py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="max-w-lg mx-auto">
                <div class="text-center mb-8">
                  <h2 class="text-3xl font-extrabold text-gray-900">
                    {{title}}
                  </h2>
                  {{#if subtitle}}
                    <p class="mt-4 text-lg text-gray-600">
                      {{subtitle}}
                    </p>
                  {{/if}}
                </div>
                <form class="grid grid-cols-1 gap-6">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Name *</label>
                    <input type="text" name="name" id="name" autocomplete="name" required class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  </div>
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
                    <input type="email" name="email" id="email" autocomplete="email" required class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  </div>
                  {{#if showPhone}}
                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input type="tel" name="phone" id="phone" autocomplete="tel" class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    </div>
                  {{/if}}
                  {{#if showCompany}}
                    <div>
                      <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
                      <input type="text" name="company" id="company" autocomplete="organization" class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    </div>
                  {{/if}}
                  <div>
                    <label for="message" class="block text-sm font-medium text-gray-700">Message *</label>
                    <textarea name="message" id="message" rows="4" required class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                  </div>
                  <div>
                    <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      {{submitText}}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        `,
      },
      {
        id: 'newsletter-1',
        type: 'newsletter',
        name: 'Newsletter Signup',
        category: 'forms',
        icon: 'EnvelopeIcon',
        schema: {
          title: { type: 'text', label: 'Title', default: 'Subscribe to our newsletter' },
          subtitle: { type: 'text', label: 'Subtitle', default: 'Get the latest updates delivered to your inbox.' },
          buttonText: { type: 'text', label: 'Button Text', default: 'Subscribe' },
          placeholderText: { type: 'text', label: 'Placeholder', default: 'Enter your email' },
        },
        defaultProps: {
          title: 'Subscribe to our newsletter',
          subtitle: 'Get the latest updates delivered to your inbox.',
          buttonText: 'Subscribe',
          placeholderText: 'Enter your email',
        },
        template: `
          <section class="bg-gray-50 py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="max-w-2xl mx-auto text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  {{title}}
                </h2>
                <p class="mt-4 text-lg text-gray-500">
                  {{subtitle}}
                </p>
                <form class="mt-8 sm:flex sm:max-w-md sm:mx-auto">
                  <label for="email-address" class="sr-only">Email address</label>
                  <input type="email" name="email-address" id="email-address" autocomplete="email" required class="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:placeholder-gray-400" placeholder="{{placeholderText}}">
                  <div class="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button type="submit" class="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      {{buttonText}}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        `,
      },
    ],
  },
  {
    id: 'html',
    name: 'Custom HTML',
    icon: 'CodeBracketIcon',
    components: [
      {
        id: 'html-block',
        type: 'html',
        name: 'Custom HTML',
        category: 'html',
        icon: 'CodeBracketIcon',
        schema: {
          html: { type: 'textarea', label: 'HTML Code', default: '<div class="p-8 bg-gray-100 rounded-lg">\n  <h3 class="text-xl font-bold mb-4">Custom HTML Block</h3>\n  <p>Add your custom HTML here</p>\n</div>' },
        },
        defaultProps: {
          html: '<div class="p-8 bg-gray-100 rounded-lg">\n  <h3 class="text-xl font-bold mb-4">Custom HTML Block</h3>\n  <p>Add your custom HTML here</p>\n</div>',
        },
        template: `{{{html}}}`,
      },
      {
        id: 'embed-code',
        type: 'embed',
        name: 'Embed Code',
        category: 'html',
        icon: 'CodeBracketIcon',
        schema: {
          embedCode: { type: 'textarea', label: 'Embed Code', default: '<!-- Paste your embed code here -->' },
          title: { type: 'text', label: 'Section Title (Optional)', default: '' },
        },
        defaultProps: {
          embedCode: '<!-- Paste your embed code here -->',
          title: '',
        },
        template: `
          <section class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {{#if title}}
                <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-8">
                  {{title}}
                </h2>
              {{/if}}
              <div class="embed-container">
                {{{embedCode}}}
              </div>
            </div>
          </section>
        `,
      },
    ],
  },
  {
    id: 'footers',
    name: 'Footers',
    icon: 'BuildingOfficeIcon',
    components: [
      {
        id: 'footer-1',
        type: 'footer',
        name: 'Simple Footer',
        category: 'footers',
        icon: 'BuildingOfficeIcon',
        schema: {
          companyName: { type: 'text', label: 'Company Name', default: 'Your Company' },
          year: { type: 'text', label: 'Year', default: new Date().getFullYear().toString() },
          links: {
            type: 'array',
            label: 'Footer Links',
            default: [
              { text: 'Privacy Policy', href: '#' },
              { text: 'Terms of Service', href: '#' },
              { text: 'Contact', href: '#' },
            ],
          },
          socialLinks: {
            type: 'array',
            label: 'Social Links',
            default: [
              { platform: 'twitter', href: '#' },
              { platform: 'facebook', href: '#' },
              { platform: 'linkedin', href: '#' },
            ],
          },
        },
        defaultProps: {
          companyName: 'Your Company',
          year: new Date().getFullYear().toString(),
          links: [
            { text: 'Privacy Policy', href: '#' },
            { text: 'Terms of Service', href: '#' },
            { text: 'Contact', href: '#' },
          ],
          socialLinks: [
            { platform: 'twitter', href: '#' },
            { platform: 'facebook', href: '#' },
            { platform: 'linkedin', href: '#' },
          ],
        },
        template: `
          <footer class="bg-gray-800">
            <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-8">
                  <p class="text-gray-400">
                    &copy; {{year}} {{companyName}}. All rights reserved.
                  </p>
                  <nav class="flex space-x-6">
                    {{#each links}}
                      <a href="{{this.href}}" class="text-gray-400 hover:text-gray-300">
                        {{this.text}}
                      </a>
                    {{/each}}
                  </nav>
                </div>
                <div class="flex space-x-6">
                  {{#each socialLinks}}
                    <a href="{{this.href}}" class="text-gray-400 hover:text-gray-300">
                      <span class="sr-only">{{this.platform}}</span>
                      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>
                    </a>
                  {{/each}}
                </div>
              </div>
            </div>
          </footer>
        `,
      },
      {
        id: 'footer-2',
        type: 'footer',
        name: 'Footer with Columns',
        category: 'footers',
        icon: 'BuildingOfficeIcon',
        schema: {
          companyName: { type: 'text', label: 'Company Name', default: 'Your Company' },
          year: { type: 'text', label: 'Year', default: new Date().getFullYear().toString() },
          description: { type: 'textarea', label: 'Company Description', default: 'Making the world a better place through innovative solutions.' },
          columns: {
            type: 'array',
            label: 'Footer Columns',
            default: [
              {
                title: 'Product',
                links: [
                  { text: 'Features', href: '#' },
                  { text: 'Pricing', href: '#' },
                  { text: 'API', href: '#' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { text: 'About', href: '#' },
                  { text: 'Blog', href: '#' },
                  { text: 'Careers', href: '#' },
                ],
              },
              {
                title: 'Support',
                links: [
                  { text: 'Help Center', href: '#' },
                  { text: 'Contact', href: '#' },
                  { text: 'Status', href: '#' },
                ],
              },
            ],
          },
        },
        defaultProps: {
          companyName: 'Your Company',
          year: new Date().getFullYear().toString(),
          description: 'Making the world a better place through innovative solutions.',
          columns: [
            {
              title: 'Product',
              links: [
                { text: 'Features', href: '#' },
                { text: 'Pricing', href: '#' },
                { text: 'API', href: '#' },
              ],
            },
            {
              title: 'Company',
              links: [
                { text: 'About', href: '#' },
                { text: 'Blog', href: '#' },
                { text: 'Careers', href: '#' },
              ],
            },
            {
              title: 'Support',
              links: [
                { text: 'Help Center', href: '#' },
                { text: 'Contact', href: '#' },
                { text: 'Status', href: '#' },
              ],
            },
          ],
        },
        template: `
          <footer class="bg-gray-900">
            <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
              <div class="xl:grid xl:grid-cols-3 xl:gap-8">
                <div class="space-y-8 xl:col-span-1">
                  <span class="text-2xl font-bold text-white">{{companyName}}</span>
                  <p class="text-gray-400 text-base">
                    {{description}}
                  </p>
                </div>
                <div class="mt-12 grid grid-cols-3 gap-8 xl:mt-0 xl:col-span-2">
                  {{#each columns}}
                    <div>
                      <h3 class="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                        {{this.title}}
                      </h3>
                      <ul class="mt-4 space-y-4">
                        {{#each this.links}}
                          <li>
                            <a href="{{this.href}}" class="text-base text-gray-400 hover:text-white">
                              {{this.text}}
                            </a>
                          </li>
                        {{/each}}
                      </ul>
                    </div>
                  {{/each}}
                </div>
              </div>
              <div class="mt-12 border-t border-gray-700 pt-8">
                <p class="text-base text-gray-400 xl:text-center">
                  &copy; {{year}} {{companyName}}. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        `,
      },
    ],
  },
];

export function getAllComponents(): PageComponent[] {
  return componentCategories.flatMap(category => category.components);
}

export function getComponentById(id: string): PageComponent | undefined {
  return getAllComponents().find(component => component.id === id);
}

export function getComponentsByCategory(categoryId: string): PageComponent[] {
  const category = componentCategories.find(cat => cat.id === categoryId);
  return category ? category.components : [];
} 