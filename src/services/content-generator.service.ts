/**
 * Content Generator Service
 * 
 * Generates deterministic, structured content for page sections
 * based on requirements, templates, and page structures.
 */

import { Requirement } from '../models/Requirement';
import { Template } from '../models/Template';
import { PageStructure } from '../models/PageStructure';
import {
  HeroContent,
  FeaturesContent,
  PricingContent,
  TestimonialsContent,
  AboutContent,
  ContactContent,
  FAQContent,
  ProductCatalogContent,
  MenuContent,
  GalleryContent,
  BlogContent,
  CTAContent,
  SectionType,
} from '../types/page-content';
import { Section } from '../types/page-structure';

export class ContentGeneratorService {
  /**
   * Generate content for all sections in a page structure
   */
  async generateAllContent(
    sessionId: string,
    templateId: string
  ): Promise<Map<string, Map<SectionType, any>>> {
    // Fetch latest requirement
    const requirement = await Requirement.findOne({
      where: { session_id: sessionId },
      order: [['version_number', 'DESC']],
    });

    if (!requirement) {
      throw new Error(`No requirement found for session ${sessionId}`);
    }

    // Fetch template
    const template = await Template.findByPk(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Fetch page structure
    const pageStructure = await PageStructure.findOne({
      where: { session_id: sessionId, template_id: templateId },
    });

    if (!pageStructure) {
      throw new Error(
        `No page structure found for session ${sessionId} and template ${templateId}`
      );
    }

    // Generate content for each section
    const contentMap = new Map<string, Map<SectionType, any>>();

    for (const page of pageStructure.structure.pages) {
      const pageSections = new Map<SectionType, any>();

      for (const section of page.sections) {
        const content = this.generateSectionContent(
          section,
          requirement,
          template
        );
        pageSections.set(section.type as SectionType, content);
      }

      contentMap.set(page.slug, pageSections);
    }

    return contentMap;
  }

  /**
   * Generate content for a specific section
   */
  private generateSectionContent(
    section: Section,
    requirement: Requirement,
    _template: Template
  ): any {
    const businessType = requirement.business_type.toLowerCase();
    const designPrefs = requirement.design_preferences.toLowerCase();

    switch (section.type) {
      case 'hero':
        return this.generateHeroContent(businessType, designPrefs, requirement);
      case 'features':
        return this.generateFeaturesContent(requirement);
      case 'pricing':
        return this.generatePricingContent(businessType);
      case 'testimonials':
        return this.generateTestimonialsContent(businessType);
      case 'about':
        return this.generateAboutContent(businessType, requirement);
      case 'contact':
        return this.generateContactContent();
      case 'faq':
        return this.generateFAQContent(businessType);
      case 'product-catalog':
        return this.generateProductCatalogContent(businessType);
      case 'menu':
        return this.generateMenuContent();
      case 'gallery':
        return this.generateGalleryContent(businessType);
      case 'blog':
        return this.generateBlogContent();
      case 'cta':
        return this.generateCTAContent(businessType);
      default:
        return {};
    }
  }

  private generateHeroContent(
    businessType: string,
    designPrefs: string,
    _requirement: Requirement
  ): HeroContent {
    const headlines: Record<string, string> = {
      'e-commerce': 'Discover Amazing Products',
      restaurant: 'Experience Culinary Excellence',
      portfolio: 'Creative Work That Inspires',
      saas: 'Transform Your Workflow',
      blog: 'Stories Worth Reading',
    };

    const subheadlines: Record<string, string> = {
      'e-commerce': `Shop our curated collection with ${designPrefs} style`,
      restaurant: `Authentic cuisine crafted with ${designPrefs} presentation`,
      portfolio: `Showcasing ${designPrefs} designs and projects`,
      saas: `Powerful tools with ${designPrefs} interface`,
      blog: `Insights and ideas with ${designPrefs} perspective`,
    };

    return {
      headline: headlines[businessType] || 'Welcome to Our Website',
      subheadline:
        subheadlines[businessType] || `Designed with ${designPrefs} in mind`,
      cta_text: businessType === 'e-commerce' ? 'Shop Now' : 'Learn More',
      cta_url: businessType === 'e-commerce' ? '/products' : '/about',
    };
  }

  private generateFeaturesContent(requirement: Requirement): FeaturesContent {
    const features = requirement.key_features.map((feature) => ({
      icon: this.getFeatureIcon(feature),
      title: this.capitalizeFirst(feature),
      description: `Our ${feature} feature is designed to provide the best experience for ${requirement.target_audience}.`,
    }));

    return {
      title: 'Our Features',
      subtitle: `Everything you need for ${requirement.target_audience}`,
      features: features.slice(0, 6), // Limit to 6 features
    };
  }

  private generatePricingContent(_businessType: string): PricingContent {
    const plans = [
      {
        name: 'Basic',
        price: '$9.99',
        billing_period: 'per month',
        features: ['Core features', 'Email support', 'Basic analytics'],
        cta_text: 'Get Started',
        cta_url: '/signup?plan=basic',
      },
      {
        name: 'Professional',
        price: '$29.99',
        billing_period: 'per month',
        features: [
          'All Basic features',
          'Priority support',
          'Advanced analytics',
          'Custom branding',
        ],
        cta_text: 'Start Free Trial',
        cta_url: '/signup?plan=pro',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: '$99.99',
        billing_period: 'per month',
        features: [
          'All Pro features',
          'Dedicated support',
          'Custom integration',
          'SLA guarantee',
        ],
        cta_text: 'Contact Sales',
        cta_url: '/contact?plan=enterprise',
      },
    ];

    return {
      title: 'Pricing Plans',
      subtitle: 'Choose the perfect plan for your needs',
      plans,
    };
  }

  private generateTestimonialsContent(
    _businessType: string
  ): TestimonialsContent {
    const testimonials = [
      {
        quote: 'This service has transformed how we do business. Highly recommended!',
        author: 'Sarah Johnson',
        role: 'CEO, TechCorp',
      },
      {
        quote: 'Exceptional quality and outstanding customer service.',
        author: 'Michael Chen',
        role: 'Founder, StartupXYZ',
      },
      {
        quote: 'The best decision we made this year. Results speak for themselves.',
        author: 'Emily Rodriguez',
        role: 'Director of Operations',
      },
    ];

    return {
      title: 'What Our Clients Say',
      subtitle: 'Trusted by businesses worldwide',
      testimonials,
    };
  }

  private generateAboutContent(
    businessType: string,
    requirement: Requirement
  ): AboutContent {
    return {
      title: 'About Us',
      description: `We are dedicated to serving ${requirement.target_audience} with ${businessType} solutions. Our mission is to provide exceptional quality and service.`,
      team_section: {
        title: 'Meet Our Team',
        members: [
          {
            name: 'Alex Thompson',
            role: 'Founder & CEO',
            bio: 'Passionate about delivering excellence',
          },
          {
            name: 'Jordan Lee',
            role: 'Head of Operations',
            bio: 'Ensuring smooth daily operations',
          },
        ],
      },
    };
  }

  private generateContactContent(): ContactContent {
    return {
      title: 'Get In Touch',
      description: 'We\'d love to hear from you. Reach out anytime!',
      contact_info: {
        email: 'info@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, City, State 12345',
      },
    };
  }

  private generateFAQContent(_businessType: string): FAQContent {
    const questions = [
      {
        question: 'How do I get started?',
        answer: 'Simply sign up for an account and follow our onboarding process.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards and PayPal.',
      },
      {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription at any time with no penalties.',
      },
    ];

    return {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions',
      questions,
    };
  }

  private generateProductCatalogContent(
    _businessType: string
  ): ProductCatalogContent {
    const products = [
      {
        name: 'Product One',
        description: 'High-quality product for your needs',
        price: '$49.99',
      },
      {
        name: 'Product Two',
        description: 'Premium option with advanced features',
        price: '$79.99',
      },
      {
        name: 'Product Three',
        description: 'Best value for budget-conscious shoppers',
        price: '$29.99',
      },
    ];

    return {
      title: 'Our Products',
      subtitle: 'Discover our curated collection',
      products,
    };
  }

  private generateMenuContent(): MenuContent {
    return {
      title: 'Our Menu',
      subtitle: 'Fresh ingredients, expertly prepared',
      categories: ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'],
      items: [
        {
          name: 'Caesar Salad',
          description: 'Crisp romaine with classic dressing',
          price: '$12.99',
          category: 'Appetizers',
        },
        {
          name: 'Grilled Salmon',
          description: 'Fresh Atlantic salmon with seasonal vegetables',
          price: '$24.99',
          category: 'Main Courses',
        },
        {
          name: 'Chocolate Lava Cake',
          description: 'Decadent chocolate dessert',
          price: '$8.99',
          category: 'Desserts',
        },
      ],
    };
  }

  private generateGalleryContent(_businessType: string): GalleryContent {
    return {
      title: 'Our Gallery',
      subtitle: 'Explore our work',
      items: [
        {
          title: 'Project Alpha',
          description: 'Stunning visual showcase',
          image_url: 'https://via.placeholder.com/400x300',
          category: 'Featured',
        },
        {
          title: 'Project Beta',
          description: 'Creative excellence',
          image_url: 'https://via.placeholder.com/400x300',
          category: 'Recent',
        },
      ],
    };
  }

  private generateBlogContent(): BlogContent {
    return {
      title: 'Latest Posts',
      subtitle: 'Read our latest articles and insights',
      posts: [
        {
          title: 'Getting Started Guide',
          excerpt: 'Learn the basics in this comprehensive guide...',
          author: 'Admin',
          date: new Date().toISOString().split('T')[0],
          category: 'Guides',
        },
        {
          title: 'Tips and Tricks',
          excerpt: 'Discover hidden features and productivity hacks...',
          author: 'Editor',
          date: new Date().toISOString().split('T')[0],
          category: 'Tips',
        },
      ],
    };
  }

  private generateCTAContent(businessType: string): CTAContent {
    const headlines: Record<string, string> = {
      'e-commerce': 'Ready to Shop?',
      restaurant: 'Make a Reservation',
      portfolio: 'Let\'s Work Together',
      saas: 'Start Your Free Trial',
      blog: 'Subscribe to Our Newsletter',
    };

    const descriptions: Record<string, string> = {
      'e-commerce': 'Browse our collection and find your perfect match today.',
      restaurant: 'Experience exceptional dining. Book your table now.',
      portfolio: 'Bring your vision to life. Get in touch today.',
      saas: 'Join thousands of satisfied customers. No credit card required.',
      blog: 'Get the latest updates delivered straight to your inbox.',
    };

    return {
      headline: headlines[businessType] || 'Take Action Today',
      description: descriptions[businessType] || 'Get started with us now.',
      cta_text: businessType === 'e-commerce' ? 'Shop Now' : 'Get Started',
      cta_url: businessType === 'e-commerce' ? '/products' : '/signup',
    };
  }

  private getFeatureIcon(feature: string): string {
    const iconMap: Record<string, string> = {
      'product catalog': 'grid',
      'shopping cart': 'cart',
      'payment integration': 'credit-card',
      menu: 'book',
      reservations: 'calendar',
      gallery: 'image',
      pricing: 'tag',
      testimonials: 'quote',
      homepage: 'home',
      'contact form': 'mail',
    };

    return iconMap[feature.toLowerCase()] || 'star';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
