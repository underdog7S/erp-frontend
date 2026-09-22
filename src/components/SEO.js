import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component - Custom Low-Code SEO Solution
 * 
 * Usage:
 * <SEO 
 *   title="Page Title"
 *   description="Page description"
 *   keywords="keyword1, keyword2"
 *   image="/path/to/image.jpg"
 *   url="https://zenitherp.online/page"
 *   type="website"
 * />
 */
const SEO = ({
  title = "ZenVerse - Custom Apps, Web Development & Multi-Industry ERP Solutions",
  description = "ZenVerse builds custom apps, web platforms, and ZenERP - a universal cloud-based ERP - for businesses across Education, Pharmacy, Retail, Hotel, Restaurant, and Salon industries. Free plan available. Start your digital transformation today!",
  keywords = "ERP Software, Enterprise Resource Planning, Cloud ERP, Education ERP, School Management System, Pharmacy Management Software, Retail ERP, POS System, Hotel Management System, Restaurant Management Software, Salon Management, Multi-tenant SaaS, Business Management Software, Inventory Management, Accounting Software, HR Management, Free ERP, Affordable ERP India, Cloud-based ERP Solution, Digital Transformation, Business Automation",
  image = "https://zenitherp.online/assets/logo/zenverse-og.png",
  url = "https://zenitherp.online",
  type = "website",
  author = "ZenVerse Tech Solutions",
  siteName = "ZenVerse",
  twitterHandle = "@zenitherp",
  structuredData = null,
  canonical = null,
  noindex = false,
  nofollow = false
}) => {
  const fullTitle = title.includes('ZenVerse') ? title : `${title} | ZenVerse`;
  const fullUrl = url.startsWith('http') ? url : `https://zenitherp.online${url}`;
  const fullImage = image.startsWith('http') ? image : `https://zenitherp.online${image}`;

  // Default structured data for organization
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ZenVerse Tech Solutions",
    "url": "https://zenitherp.online",
    "logo": "https://zenitherp.online/assets/logo/zenverse-og.png",
    "description": description || "ZenVerse builds custom apps, web platforms, and ZenERP - a universal cloud-based Enterprise Resource Planning solution - for businesses across Education, Pharmacy, Retail, Hotel, Restaurant, and Salon industries, with comprehensive automation, real-time analytics, and enterprise-grade security.",
    "foundingDate": "2024",
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "10-50"
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "knowsAbout": [
      "Enterprise Resource Planning",
      "Cloud Computing",
      "Business Automation",
      "Education Management",
      "Pharmacy Management",
      "Retail Management",
      "Hotel Management",
      "Restaurant Management",
      "Salon Management"
    ],
    "sameAs": [
      "https://zenitherp.online",
      // Add social media links if available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "url": "https://zenitherp.online/contact"
    },
    "offers": {
      "@type": "AggregateOffer",
      "offerCount": "4",
      "lowPrice": "0",
      "highPrice": "19999",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "2.0",
    "releaseNotes": "Multi-tenant cloud ERP with industry-specific modules",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical.startsWith('http') ? canonical : `https://zenitherp.online${canonical}`} />}
      {!canonical && <link rel="canonical" href={fullUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#1976d2" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="ZenVerse" />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;

