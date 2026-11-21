import prisma from '@/lib/prisma';

/**
 * Fetch maintenance mode status from MySQL Setting table
 * @returns {Promise<boolean>}
 */
export async function getMaintenanceModeFromWC() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'maintenance' },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        return Boolean(parsed.enabled);
      } catch {
        return setting.value.includes('status:true') || setting.value.includes('"enabled":true');
      }
    }

    return false;
  } catch (err) {
    console.error('Error reading maintenance mode from Prisma:', err?.message || err);
    return false;
  }
}

/**
 * Update maintenance mode status in MySQL Setting table
 * @param {boolean} enabled 
 * @returns {Promise<boolean>}
 */
export async function setMaintenanceModeInWC(enabled) {
  const isEnabled = Boolean(enabled);
  const payload = {
    enabled: isEnabled,
    message: 'আমাদের ওয়েবসাইট সাময়িকভাবে রক্ষণাবেক্ষণের কাজে বন্ধ রয়েছে। কিছুক্ষণের মধ্যেই আমরা ফিরে আসছি।',
  };

  try {
    await prisma.setting.upsert({
      where: { key: 'maintenance' },
      update: {
        value: JSON.stringify(payload),
      },
      create: {
        key: 'maintenance',
        value: JSON.stringify(payload),
      },
    });

    return true;
  } catch (err) {
    console.error('Error saving maintenance mode to Prisma:', err?.message || err);
    return false;
  }
}
