import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

const DEFAULT_FAQ_DATA = {
  header: {
    badge: 'সাধারণ জিজ্ঞাসা • Frequently Asked Questions',
    title: 'আপনার মনে থাকা প্রয়োজনীয় প্রশ্নের উত্তর',
    subtitle: 'স্মার্ট এগ্রো সোর্স থেকে কেনাকাটা, দেশব্যাপী হোম ডেলিভারি, আধুনিক কৃষি ও ডেইরি মেশিনের ব্যবহার এবং বিক্রয়োত্তর সেবা সম্পর্কে জেনে নিন।'
  },
  cta: {
    tag: 'কাস্টমার হেল্পলাইন',
    title: 'আপনার কি অন্য কোনো প্রশ্ন বা জানার আছে?',
    subtitle: 'আমাদের অভিজ্ঞ কৃষি ও ডেইরি এক্সপার্টদের সাথে এখনই কথা বলুন এবং সঠিক সমাধান পান।'
  },
  faqs: [
    {
      id: '1',
      category: 'order',
      categoryName: 'অর্ডার ও ডেলিভারি',
      question: 'সারা দেশে কীভাবে পণ্য ডেলিভারি দেওয়া হয় এবং কতদিন সময় লাগে?',
      answer: 'আমরা সুন্দরবন কুরিয়ার, এসএ পরিবহন, করাতোয়া এবং রেডএক্স সহ বিশ্বস্ত কুরিয়ার সার্ভিসের মাধ্যমে সমগ্র বাংলাদেশের ৬৪টি জেলা ও প্রত্যন্ত উপজেলায় দ্রুততম সময়ে হোম ডেলিভারি ও কুরিয়ার পয়েন্টে ডেলিভারি নিশ্চিত করি। সাধারণত অর্ডার নিশ্চিতকরণের ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়।'
    },
    {
      id: '2',
      category: 'payment',
      categoryName: 'পেমেন্ট ও ওয়ারেন্টি',
      question: 'ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা কি রয়েছে?',
      answer: 'হ্যাঁ! আমাদের অধিকাংশ এগ্রো পণ্যে ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ) সুবিধা রয়েছে। শুধুমাত্র বড় মেশিনারিজ বা দূরবর্তী অর্ডারের ক্ষেত্রে ন্যূনতম কুরিয়ার চার্জ বুকিং বাবদ বিকাশ, নগদ বা ব্যাংকের মাধ্যমে অগ্রিম প্রদান করতে হয় এবং অবশিষ্ট টাকা পণ্য রিসিভ করার সময় দেওয়া যায়।'
    }
  ]
};

const DEFAULT_TRUST_SERVICES_DATA = {
  section: {
    badge: 'আমাদের অঙ্গীকার ও সেবা',
    title: 'স্মার্ট এগ্রো সোর্সের সেবা ও নিশ্চয়তা',
    subtitle: 'অনলাইন কেনাকাটায় সর্বোচ্চ বিশ্বাসযোগ্যতা ও দীর্ঘমেয়াদী গ্রাহক সন্তুষ্টি'
  },
  stats: [
    { id: 1, target: 10100, suffix: '+', label: 'সন্তুষ্ট খামারি ও কাস্টমার', icon: 'Users' },
    { id: 2, target: 150, suffix: '+', label: 'ডেলিভারি সফল অর্ডার', icon: 'PackageCheck' },
    { id: 3, target: 8, suffix: '+', label: 'কৃষি ও খামার ক্যাটাগরি', icon: 'Layers' }
  ],
  features: [
    { id: '1', icon: 'Truck', title: 'দেশব্যাপী ডেলিভারি', subtitle: 'Smart Agro Guarantee', description: 'আমাদের অর্ডারকৃত পণ্য সারাদেশে দ্রুততার সাথে ডেলিভারি দিয়ে থাকি।' },
    { id: '2', icon: 'Wallet', title: 'নিরাপদ মূল্যপরিশোধ', subtitle: 'Smart Agro Guarantee', description: 'আমাদের আপনি পেমেন্ট করুন বিশ্বের জনপ্রিয় ও নিরাপদ পেমেন্ট পদ্ধতিতে।' },
    { id: '3', icon: 'ShieldCheck', title: 'আস্থার সাথে কিনুন', subtitle: 'Smart Agro Guarantee', description: 'নিরাপদ কেনাকাটা করুন পণ্য বাছাই করা থেকে ঘরে ডেলিভারি পর্যন্ত।' }
  ]
};

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Initial Admin User
  const username = 'admin';
  const email = 'admin@smartagrosource.com';
  const plainPassword = 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { username },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      username,
      email,
      name: 'Smart Agro Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log(`[+] Admin user seeded successfully!`);
  console.log(`    Username: ${adminUser.username}`);
  console.log(`    Email:    ${adminUser.email}`);
  console.log(`    Role:     ${adminUser.role}`);

  // 2. Seed Default Settings
  const defaultBranding = {
    title: 'Smart Agro Source',
    description: 'কৃষি ও খামার শিল্পের বিশ্বস্ত নাম',
    siteLogo: 'https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png',
    banners: [
      'https://api.smartagrosource.com/wp-content/uploads/2026/10/SmartAgroSource_1200x300.png'
    ],
  };

  await prisma.setting.upsert({
    where: { key: 'branding' },
    update: {
      value: JSON.stringify(defaultBranding),
    },
    create: {
      key: 'branding',
      value: JSON.stringify(defaultBranding),
    },
  });
  console.log('[+] Default Branding setting seeded.');

  await prisma.setting.upsert({
    where: { key: 'faq' },
    update: {
      value: JSON.stringify(DEFAULT_FAQ_DATA),
    },
    create: {
      key: 'faq',
      value: JSON.stringify(DEFAULT_FAQ_DATA),
    },
  });
  console.log('[+] Default FAQ setting seeded.');

  await prisma.setting.upsert({
    where: { key: 'trust_services' },
    update: {
      value: JSON.stringify(DEFAULT_TRUST_SERVICES_DATA),
    },
    create: {
      key: 'trust_services',
      value: JSON.stringify(DEFAULT_TRUST_SERVICES_DATA),
    },
  });
  console.log('[+] Default Trust & Services setting seeded.');

  const defaultMaintenance = {
    enabled: false,
    message: 'আমাদের ওয়েবসাইট সাময়িকভাবে রক্ষণাবেক্ষণের কাজে বন্ধ রয়েছে। কিছুক্ষণের মধ্যেই আমরা ফিরে আসছি।',
  };

  await prisma.setting.upsert({
    where: { key: 'maintenance' },
    update: {
      value: JSON.stringify(defaultMaintenance),
    },
    create: {
      key: 'maintenance',
      value: JSON.stringify(defaultMaintenance),
    },
  });
  console.log('[+] Default Maintenance setting seeded.');

  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
