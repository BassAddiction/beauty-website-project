import { useEffect } from 'react';
import { updatePageMeta, addStructuredData } from '@/utils/seo';

interface SEOMetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
}

export const useSEO = (meta: SEOMetaTags) => {
  useEffect(() => {
    updatePageMeta(meta);
    
    if (meta.structuredData) {
      addStructuredData(meta.structuredData);
    }
  }, [meta]);
};