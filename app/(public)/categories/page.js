export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getProductCategories } from '@/lib/api';
import JsonLd from '@/components/JsonLd';
import CategoriesClient from './CategoriesClient';

export const metadata = {
  title: 'সকল ক্যাটাগরি (All Categories) - কৃষি ও খামার যন্ত্রপাতি কালেকশন',
  description: 'Smart Agro Source এর সকল পণ্য ক্যাটাগরি দেখুন। ডেইরি ফার্মিং, মিল্কিং মেশিন, পোল্ট্রি, সিডলিং ট্রে, ফিডার এবং আধুনিক কৃষি যন্ত্রপাতির বিশাল সমাহার।',
  alternates: {
    canonical: 'https://smartagrosource.com/categories',
  },
  openGraph: {
    title: 'সকল ক্যাটাগরি | Smart Agro Source',
    description: 'Smart Agro Source এর সকল পণ্য ক্যাটাগরি ও আধুনিক কৃষি যন্ত্রপাতির বিশাল সমাহার।',
    url: 'https://smartagrosource.com/categories',
    siteName: 'Smart Agro Source',
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'সকল ক্যাটাগরি | Smart Agro Source',
    description: 'Smart Agro Source এর সকল পণ্য ক্যাটাগরি ও আধুনিক কৃষি যন্ত্রপাতির বিশাল সমাহার।',
  },
};

const categoriesBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'হোম',
      item: 'https://smartagrosource.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'সকল ক্যাটাগরি',
      item: 'https://smartagrosource.com/categories',
    },
  ],
};

export default async function CategoriesPage() {
  const categories = (await getProductCategories()) || [];
  
  return (
    <>
      {/* Breadcrumb JSON-LD Schema */}
      <JsonLd data={categoriesBreadcrumbSchema} />

      <CategoriesClient categories={categories} />
    </>
  );
}
