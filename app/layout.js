import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from '@/components/Providers';
import JsonLd from '@/components/JsonLd';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://smartagrosource.com'),
  title: {
    default: 'Smart Agro Source - স্মার্ট কৃষি, সমৃদ্ধ আগামী | আধুনিক কৃষি ও খামার যন্ত্রপাতি',
    template: '%s | Smart Agro Source',
  },
  description: 'Smart Agro Source (স্মার্ট এগ্রো সোর্স) - বাংলাদেশে আধুনিক কৃষি ও ডেইরি/পোল্ট্রি খামার যন্ত্রপাতির বিশ্বস্ত অনলাইন শপ। সাশ্রয়ী মূল্যে সেরা মানের এগ্রো পণ্য, স্পেয়ার পার্টস ও নির্ভরযোগ্য ডেলিভারি সেবা। বগুড়া সদর, বাংলাদেশ। হটলাইন: +880 1601-471471',
  applicationName: 'Smart Agro Source',
  keywords: [
    'Smart Agro Source',
    'স্মার্ট এগ্রো সোর্স',
    'smartagrosource.com',
    'স্মার্ট কৃষি',
    'আধুনিক কৃষি যন্ত্রপাতি',
    'কৃষি সরঞ্জাম বাংলাদেশ',
    'খামার প্রযুক্তি',
    'ডেইরি খামার সরঞ্জাম',
    'পোল্ট্রি খামার যন্ত্রপাতি',
    'দুধ দোহন মেশিন',
    'মিল্কিং মেশিন',
    'ঘাস কাটার মেশিন',
    'সিডলিং ট্রে',
    'ক্যাল্ফ ফিডার',
    'কৃষি যন্ত্রপাতি বগুড়া',
    'Agriculture machinery Bangladesh',
    'Dairy farm equipment Bangladesh',
  ],
  authors: [{ name: 'Smart Agro Source', url: 'https://smartagrosource.com' }],
  creator: 'Smart Agro Source',
  publisher: 'Smart Agro Source',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: 'https://smartagrosource.com',
    siteName: 'Smart Agro Source',
    title: 'Smart Agro Source - স্মার্ট কৃষি, সমৃদ্ধ আগামী | আধুনিক কৃষি ও খামার যন্ত্রপাতি',
    description: 'বাংলাদেশে আধুনিক কৃষি ও ডেইরি/পোল্ট্রি খামার যন্ত্রপাতির বিশ্বস্ত অনলাইন শপ। সুলভ মূল্যে উন্নত মানের আধুনিক যন্ত্রপাতি ও হোম ডেলিভারি সেবা।',
    images: [
      {
        url: 'https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png',
        width: 800,
        height: 400,
        alt: 'Smart Agro Source Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Agro Source - স্মার্ট কৃষি, সমৃদ্ধ আগামী',
    description: 'বাংলাদেশে আধুনিক কৃষি ও ডেইরি/পোল্ট্রি খামার যন্ত্রপাতির বিশ্বস্ত অনলাইন শপ।',
    images: ['https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png'],
    creator: '@smartagrosource',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.png?v=3', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico?v=3', sizes: 'any' },
      { url: '/icon.svg?v=3', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
  },
  verification: {
    other: {
      'facebook-domain-verification': ['8fso57pdkifasdezj878dg3bptlcxw'],
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#488e14',
};

const globalOrganizationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'Store', 'LocalBusiness'],
      '@id': 'https://smartagrosource.com/#organization',
      name: 'Smart Agro Source',
      alternateName: ['স্মার্ট এগ্রো সোর্স', 'SmartAgroSource'],
      url: 'https://smartagrosource.com',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://smartagrosource.com/#logo',
        url: 'https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png',
        contentUrl: 'https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png',
        caption: 'Smart Agro Source Logo',
      },
      image: 'https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png',
      description: 'Smart Agro Source (স্মার্ট এগ্রো সোর্স) - বাংলাদেশে আধুনিক কৃষি ও ডেইরি/পোল্ট্রি খামার যন্ত্রপাতির বিশ্বস্ত অনলাইন শপ। সাশ্রয়ী মূল্যে সেরা মানের এগ্রো পণ্য ও নির্ভরযোগ্য ডেলিভারি সেবা।',
      telephone: '+8801601471471',
      email: 'sourceofagri@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'পিটিআই মোড় (PTI More)',
        addressLocality: 'বগুড়া সদর (Bogura Sadar)',
        addressRegion: 'বগুড়া (Bogura)',
        postalCode: '5800',
        addressCountry: 'BD',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '24.8465',
        longitude: '89.3777',
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '20:00',
      },
      priceRange: '৳৳',
      currenciesAccepted: 'BDT',
      paymentAccepted: 'Cash on Delivery, bKash, Nagad, Bank Transfer',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://smartagrosource.com/#website',
      url: 'https://smartagrosource.com',
      name: 'Smart Agro Source',
      alternateName: 'স্মার্ট এগ্রো সোর্স',
      publisher: {
        '@id': 'https://smartagrosource.com/#organization',
      },
      inLanguage: 'bn-BD',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://smartagrosource.com/categories?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="facebook-domain-verification" content="8fso57pdkifasdezj878dg3bptlcxw" />
      </head>
      <body 
        className="min-h-full flex flex-col bg-gray-50 text-gray-800 overflow-x-hidden pb-16 md:pb-0"
        suppressHydrationWarning
      >
        {/* Global JSON-LD Schema (Organization & WebSite) */}
        <JsonLd data={globalOrganizationSchema} />

        {/* Meta / Facebook Pixel Code */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1405411940990491');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1405411940990491&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <Providers>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
