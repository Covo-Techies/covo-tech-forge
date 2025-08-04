import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

const SEO = ({
  title = 'Covo Tech Forge - Premium Electronics & Technology Store',
  description = 'Discover cutting-edge electronics, laptops, smartphones, and tech accessories at Covo Tech Forge. Quality products, competitive prices, and exceptional customer service.',
  keywords = 'electronics, laptops, smartphones, technology, computers, gadgets, online store, tech accessories',
  image = '/placeholder.svg',
  url = window.location.href,
  type = 'website',
  author = 'Covo Tech Forge',
  publishedTime,
  modifiedTime,
  noIndex = false,
  canonicalUrl
}: SEOProps) => {
  const siteUrl = window.location.origin;
  const fullImageUrl = image?.startsWith('http') ? image : `${siteUrl}${image}`;
  const currentUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Viewport and Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Covo Tech Forge" />
      
      {/* Theme Colors */}
      <meta name="theme-color" content="#7C3AED" />
      <meta name="msapplication-TileColor" content="#7C3AED" />
      <meta name="msapplication-navbutton-color" content="#7C3AED" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Covo Tech Forge" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@covotechforge" />
      <meta name="twitter:creator" content="@covotechforge" />
      
      {/* Article specific meta tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* SEO Meta Tags */}
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta name="googlebot" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta name="revisit-after" content="1 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Covo Tech Forge",
          "description": description,
          "url": siteUrl,
          "logo": `${siteUrl}/placeholder.svg`,
          "image": fullImageUrl,
          "telephone": "+254-700-000-000",
          "email": "info@covotechforge.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Tech Hub Street",
            "addressLocality": "Nairobi",
            "addressCountry": "Kenya"
          },
          "openingHours": "Mo-Fr 08:00-18:00",
          "priceRange": "$$",
          "acceptedPaymentMethod": [
            "http://purl.org/goodrelations/v1#ByBankTransferInAdvance",
            "http://purl.org/goodrelations/v1#ByInvoice",
            "http://purl.org/goodrelations/v1#Cash",
            "http://purl.org/goodrelations/v1#PayPal"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;