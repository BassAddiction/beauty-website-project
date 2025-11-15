import { useEffect } from 'react';
import { updatePageMeta } from '@/utils/seo';

interface SEOMetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export const useSEO = (meta: SEOMetaTags) => {
  useEffect(() => {
    updatePageMeta(meta);
  }, [meta]);
};
