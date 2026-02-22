import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  robots?: string;
}

const defaultSEO = {
  title: 'Aide | Turn Notes into Quizzes, Flashcards, Maps, and Podcasts',
  description:
    'Aide transforms notes, PDFs, and images into AI study materials: summaries, quizzes, flashcards, knowledge maps, tutor chat, course plans, and podcasts.',
  keywords:
    'AI study assistant, quiz generator, flashcards generator, knowledge map, AI tutor chat, study podcast generator, PDF study tool, multilingual learning',
  image: 'https://myaide.vercel.app/placeholder.svg',
  robots: 'index, follow'
};

const pageSEO: Record<string, SEOProps> = {
  '/': {
    title: 'Aide | Turn Notes into Quizzes, Flashcards, Maps, and Podcasts',
    description:
      'Study smarter with Aide. Upload notes, PDFs, or images and get summaries, quizzes, flashcards, knowledge maps, AI tutor chat, and podcasts in seconds.',
    keywords:
      'study assistant, AI study app, quiz flashcards, knowledge map generator, educational podcast generator',
    robots: 'index, follow'
  },
  '/help': {
    title: 'Aide Help | Prompting Guide and Study Tips',
    description:
      'Learn how to write better prompts, choose the right mode, and get stronger AI study results with Aide.',
    keywords:
      'Aide help, prompting guide, study prompts, AI study tips',
    robots: 'index, follow'
  },
  '/auth': {
    title: 'Sign In | Aide',
    description: 'Sign in to Aide to start generating quizzes, flashcards, maps, and podcasts from your study material.',
    keywords: 'Aide login, sign in, AI study account',
    robots: 'noindex, nofollow'
  },
  '/dashboard': {
    title: 'Dashboard | Aide',
    description: 'Analyze text, files, and voice input to generate AI study tools in your Aide dashboard.',
    keywords: 'AI study dashboard, learning workflow',
    robots: 'noindex, nofollow'
  },
  '/library': {
    title: 'Library | Aide',
    description: 'Access your saved analyses, chats, courses, podcasts, quizzes, and flashcards in one library.',
    keywords: 'study library, learning archive, AI generated study content',
    robots: 'noindex, nofollow'
  },
  '/billing': {
    title: 'Plans & Billing | Aide',
    description: 'Compare Free, Pro, and Class plans for Aide and upgrade your daily study generation limits.',
    keywords: 'Aide pricing, Pro plan, class plan, study subscription',
    robots: 'noindex, nofollow'
  },
  '/settings': {
    title: 'Settings | Aide',
    description: 'Manage language, theme, account preferences, and profile details in Aide.',
    keywords: 'account settings, profile preferences',
    robots: 'noindex, nofollow'
  }
};

export const SEO = ({ title, description, keywords, image }: SEOProps) => {
  const location = useLocation();
  const pathname = location.pathname;

  const resolvePageSEO = (): SEOProps => {
    if (pageSEO[pathname]) return pageSEO[pathname];
    if (pathname.startsWith('/library/course/')) {
      return {
        title: 'Course View | Aide',
        description: 'Review your generated course structure, modules, and guided study actions in Aide.',
        keywords: 'AI course planner, study syllabus generator',
        robots: 'noindex, nofollow'
      };
    }
    if (pathname.startsWith('/library/') && pathname.endsWith('/quiz')) {
      return {
        title: 'Practice Quiz | Aide',
        description: 'Practice AI-generated quiz questions with explanations based on your uploaded content.',
        keywords: 'practice quiz, AI quiz generator',
        robots: 'noindex, nofollow'
      };
    }
    if (pathname.startsWith('/library/') && pathname.endsWith('/flashcards')) {
      return {
        title: 'Flashcards | Aide',
        description: 'Study with AI-generated flashcards from your notes, PDFs, and course material.',
        keywords: 'AI flashcards, study flashcards',
        robots: 'noindex, nofollow'
      };
    }
    if (pathname.startsWith('/library/') && pathname.endsWith('/chat')) {
      return {
        title: 'AI Tutor Chat | Aide',
        description: 'Ask follow-up questions and learn with context-aware AI tutor chat.',
        keywords: 'AI tutor chat, study Q&A',
        robots: 'noindex, nofollow'
      };
    }
    if (pathname.startsWith('/library/')) {
      return {
        title: 'Study Content | Aide',
        description: 'View your AI-generated summary, key terms, map, quiz, flashcards, and podcast.',
        keywords: 'study content, AI analysis',
        robots: 'noindex, nofollow'
      };
    }
    return {};
  };
  
  const pageData = resolvePageSEO();
  
  const finalTitle = title || pageData.title || defaultSEO.title;
  const finalDescription = description || pageData.description || defaultSEO.description;
  const finalKeywords = keywords || pageData.keywords || defaultSEO.keywords;
  const finalImage = image || pageData.image || defaultSEO.image;
  const finalRobots = pageData.robots || defaultSEO.robots;

  useEffect(() => {
    document.title = finalTitle;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    const updateJsonLd = (id: string, payload: object) => {
      let script = document.querySelector(`script[data-seo="${id}"]`) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', id);
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(payload);
    };

    const canonicalBase = window.location.origin || 'https://myaide.vercel.app';
    const canonicalUrl = `${canonicalBase}${pathname}`;

    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('robots', finalRobots || defaultSEO.robots);
    updateMetaTag('author', 'Aide');
    updateMetaTag('application-name', 'Aide');
    
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:site_name', 'Aide', true);
    
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);

    updateLinkTag('canonical', canonicalUrl);

    updateJsonLd('app-schema', {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Aide',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: 'https://myaide.vercel.app/',
      description: finalDescription,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: [
        'AI summaries',
        'Quiz generation',
        'Flashcards',
        'Knowledge map',
        'AI tutor chat',
        'Podcast generation',
        'PDF export',
        'Multilingual learning support'
      ]
    });
  }, [finalTitle, finalDescription, finalKeywords, finalImage, finalRobots, pathname]);

  return null;
};

