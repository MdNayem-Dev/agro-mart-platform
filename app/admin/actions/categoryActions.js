"use server";

import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

function slugifyText(text, fallback = 'category') {
  if (!text) return `${fallback}-${Date.now()}`;
  const clean = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return clean || `${fallback}-${Date.now()}`;
}

async function getUniqueCategorySlug(baseText, excludeId = null) {
  const baseSlug = slugifyText(baseText, 'category');
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function createCategoryAction(data) {
  try {
    const slug = await getUniqueCategorySlug(data.name);

    const newCategory = await prisma.category.create({
      data: {
        name: (data.name || '').trim(),
        slug,
        imageUrl: data.image_url || null,
        bannerUrl: data.banner_url || null,
      },
    });

    try {
      revalidateTag('wc-categories');
      revalidateTag('wc-api');
    } catch {}

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');

    return { success: true, data: newCategory };
  } catch (error) {
    console.error("Failed to create category in Prisma:", error);
    return { success: false, error: error.message || 'ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে।' };
  }
}

export async function updateCategoryAction(id, data) {
  try {
    const numericId = parseInt(id, 10);
    if (!numericId) throw new Error('Invalid category ID');

    const updatePayload = {
      name: (data.name || '').trim(),
    };

    if (data.image_url !== undefined && data.image_url !== '') {
      updatePayload.imageUrl = data.image_url;
    }

    if (data.banner_url !== undefined && data.banner_url !== '') {
      updatePayload.bannerUrl = data.banner_url;
    }

    const updatedCategory = await prisma.category.update({
      where: { id: numericId },
      data: updatePayload,
    });

    try {
      revalidateTag('wc-categories');
      revalidateTag('wc-api');
    } catch {}

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');

    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error("Failed to update category in Prisma:", error);
    return { success: false, error: error.message || 'ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে।' };
  }
}

export async function deleteCategoryAction(id) {
  try {
    const numericId = parseInt(id, 10);
    if (!numericId) throw new Error('Invalid category ID');

    await prisma.category.delete({
      where: { id: numericId },
    });

    try {
      revalidateTag('wc-categories');
      revalidateTag('wc-api');
    } catch {}

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error("Failed to delete category in Prisma:", error);
    return { success: false, error: error.message || 'ক্যাটাগরি মুছতে সমস্যা হয়েছে।' };
  }
}
