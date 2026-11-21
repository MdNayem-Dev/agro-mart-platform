import prisma from '@/lib/prisma';

export const DEFAULT_TRUST_SERVICES_DATA = {
  section: {
    badge: 'আমাদের অঙ্গীকার ও সেবা',
    title: 'স্মার্ট এগ্রো সোর্সের সেবা ও নিশ্চয়তা',
    subtitle: 'অনলাইন কেনাকাটায় সর্বোচ্চ বিশ্বাসযোগ্যতা ও দীর্ঘমেয়াদী গ্রাহক সন্তুষ্টি'
  },
  stats: [
    {
      id: 1,
      target: 10100,
      suffix: '+',
      label: 'সন্তুষ্ট খামারি ও কাস্টমার',
      icon: 'Users'
    },
    {
      id: 2,
      target: 150,
      suffix: '+',
      label: 'ডেলিভারি সফল অর্ডার',
      icon: 'PackageCheck'
    },
    {
      id: 3,
      target: 8,
      suffix: '+',
      label: 'কৃষি ও খামার ক্যাটাগরি',
      icon: 'Layers'
    }
  ],
  features: [
    {
      id: '1',
      icon: 'Truck',
      title: 'দেশব্যাপী ডেলিভারি',
      subtitle: 'Smart Agro Guarantee',
      description: 'আমাদের অর্ডারকৃত পণ্য সারাদেশে দ্রুততার সাথে ডেলিভারি দিয়ে থাকি।',
      color: 'amber'
    },
    {
      id: '2',
      icon: 'Wallet',
      title: 'নিরাপদ মূল্যপরিশোধ',
      subtitle: 'Smart Agro Guarantee',
      description: 'আমাদের আপনি পেমেন্ট করুন বিশ্বের জনপ্রিয় ও নিরাপদ পেমেন্ট পদ্ধতিতে।',
      color: 'emerald'
    },
    {
      id: '3',
      icon: 'ShieldCheck',
      title: 'আস্থার সাথে কিনুন',
      subtitle: 'Smart Agro Guarantee',
      description: 'নিরাপদ কেনাকাটা করুন পণ্য বাছাই করা থেকে ঘরে ডেলিভারি পর্যন্ত।',
      color: 'blue'
    },
    {
      id: '4',
      icon: 'Headphones',
      title: 'সার্বক্ষণিক কাস্টমার সেবা',
      subtitle: 'Smart Agro Guarantee',
      description: 'ঝামেলাহীন কেনাকাটার অভিজ্ঞতার জন্য সার্বক্ষণিক আছে কাস্টমার সেবা।',
      color: 'purple'
    },
    {
      id: '5',
      icon: 'BadgePercent',
      title: 'সাশ্রয়ী মূল্য',
      subtitle: 'Smart Agro Guarantee',
      description: 'আমরা আমাদের ক্রেতাদেরকে সর্বদা প্রতিযোগিতামূলক সাশ্রয়ী মূল্য অফার করি।',
      color: 'rose'
    }
  ]
};

/**
 * Fetch Trust & Services data from MySQL Setting table
 */
export async function getTrustServicesData() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'trust_services' },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        return {
          section: {
            ...DEFAULT_TRUST_SERVICES_DATA.section,
            ...(parsed.section || {})
          },
          stats: Array.isArray(parsed.stats) && parsed.stats.length > 0
            ? parsed.stats
            : DEFAULT_TRUST_SERVICES_DATA.stats,
          features: Array.isArray(parsed.features) && parsed.features.length > 0
            ? parsed.features
            : DEFAULT_TRUST_SERVICES_DATA.features
        };
      } catch {}
    }

    return DEFAULT_TRUST_SERVICES_DATA;
  } catch (err) {
    console.error('Error fetching Trust Services data from Prisma:', err?.message || err);
    return DEFAULT_TRUST_SERVICES_DATA;
  }
}

/**
 * Save Trust & Services data to MySQL Setting table
 */
export async function updateTrustServicesData(data) {
  try {
    const payload = {
      section: data.section || DEFAULT_TRUST_SERVICES_DATA.section,
      stats: Array.isArray(data.stats) ? data.stats : DEFAULT_TRUST_SERVICES_DATA.stats,
      features: Array.isArray(data.features) ? data.features : DEFAULT_TRUST_SERVICES_DATA.features
    };

    await prisma.setting.upsert({
      where: { key: 'trust_services' },
      update: {
        value: JSON.stringify(payload),
      },
      create: {
        key: 'trust_services',
        value: JSON.stringify(payload),
      },
    });

    return true;
  } catch (err) {
    console.error('Error updating Trust Services data in Prisma:', err?.message || err);
    return false;
  }
}
