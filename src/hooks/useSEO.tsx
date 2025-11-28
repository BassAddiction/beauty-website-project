import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { addStructuredData } from '@/utils/seo';

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

export const useSEO = (meta: SEOMetaTags): JSX.Element => {
  useEffect(() => {
    if (meta.structuredData) {
      addStructuredData(meta.structuredData);
    }
  }, [meta.structuredData]);
  
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.keywords && <meta name="keywords" content={meta.keywords} />}
      
      <meta property="og:title" content={meta.ogTitle || meta.title} />
      <meta property="og:description" content={meta.ogDescription || meta.description} />
      {meta.ogImage && <meta property="og:image" content={meta.ogImage} />}
      
      <meta name="twitter:title" content={meta.ogTitle || meta.title} />
      <meta name="twitter:description" content={meta.ogDescription || meta.description} />
      
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}
      {meta.noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};
