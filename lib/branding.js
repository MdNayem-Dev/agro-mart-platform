import prisma from '@/lib/prisma';

export const DEFAULT_LOGO_URL = 'https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png';
export const DEFAULT_BANNER_URL = 'https://api.smartagrosource.com/wp-content/uploads/2026/10/SmartAgroSource_1200x300.png';

/**
 * Fetch current branding assets (logo and banners) from MySQL Setting table
 */
export async function getBrandingAssets() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'branding' },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        const banners = Array.isArray(parsed.banners) ? parsed.banners.filter(Boolean) : [];
        return {
          logo: parsed.logo || DEFAULT_LOGO_URL,
          banners: banners.length > 0 ? banners : [DEFAULT_BANNER_URL],
        };
      } catch {}
    }

    return { logo: DEFAULT_LOGO_URL, banners: [DEFAULT_BANNER_URL] };
  } catch (err) {
    console.error('Error fetching branding assets from Prisma:', err?.message || err);
    return { logo: DEFAULT_LOGO_URL, banners: [DEFAULT_BANNER_URL] };
  }
}

/**
 * Save updated branding (logo and banners) to MySQL Setting table
 */
export async function updateBrandingAssets({ logo = '', banners = [] }) {
  try {
    const cleanBanners = Array.isArray(banners) ? banners.filter(Boolean).slice(0, 4) : [];
    const cleanLogo = logo ? String(logo).trim() : DEFAULT_LOGO_URL;

    const payload = {
      logo: cleanLogo,
      banners: cleanBanners.length > 0 ? cleanBanners : [DEFAULT_BANNER_URL],
    };

    await prisma.setting.upsert({
      where: { key: 'branding' },
      update: {
        value: JSON.stringify(payload),
      },
      create: {
        key: 'branding',
        value: JSON.stringify(payload),
      },
    });

    return true;
  } catch (err) {
    console.error('Error updating branding assets in Prisma:', err?.message || err);
    return false;
  }
}
