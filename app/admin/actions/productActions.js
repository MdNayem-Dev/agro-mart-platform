"use server";

import prisma from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/uploadHelper';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Helper to generate URL-friendly slug supporting Bengali and English Unicode
 */
function slugifyText(text, fallback = 'item') {
  if (!text) return `${fallback}-${Date.now()}`;
  const clean = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return clean || `${fallback}-${Date.now()}`;
}

async function getUniqueProductSlug(baseText, excludeId = null) {
  const baseSlug = slugifyText(baseText, 'product');
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Server Action: Upload image to local public/uploads directory
 */
export async function uploadImageAction(formData) {
  try {
    const file = formData.get('file');
    if (!file) return { success: false, error: 'No file provided' };

    const url = await saveUploadedFile(file);
    return { success: true, url };
  } catch (error) {
    console.error("Local image upload failed:", error);
    return { success: false, error: error.message || 'Image upload failed' };
  }
}

/**
 * Server Action: Create product directly in MySQL via Prisma
 */
export async function createProductAction(data) {
  try {
    let categoryId = null;

    // Handle new category inline creation if requested
    if (data.category === 'new' && data.new_category_name) {
      const catSlug = slugifyText(data.new_category_name, 'category');
      const newCat = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: {
          name: data.new_category_name.trim(),
          slug: catSlug,
        },
      });
      categoryId = newCat.id;
    } else if (data.category) {
      categoryId = parseInt(data.category, 10) || null;
    }

    // Verify categoryId exists in database to prevent foreign key errors
    if (categoryId) {
      const catExists = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });
      if (!catExists) {
        categoryId = null;
      }
    }

    const slug = await getUniqueProductSlug(data.name);
    const regPrice = parseFloat(data.regular_price) || 0;
    const salePrice = data.sale_price ? parseFloat(data.sale_price) : null;
    const deliveryCharge = data.delivery_charge !== undefined && data.delivery_charge !== '' ? parseFloat(data.delivery_charge) || 0 : 0;
    const stockStatus = data.stock_status || 'instock';
    const stockQuantity = data.stock_quantity !== undefined && data.stock_quantity !== '' ? parseInt(data.stock_quantity, 10) || 0 : 0;
    const displaySection = data.display_section || 'both';
    const isPopular = displaySection === 'popular' || displaySection === 'both';

    const newProduct = await prisma.product.create({
      data: {
        name: (data.name || '').trim(),
        slug,
        regularPrice: regPrice,
        salePrice: salePrice && !isNaN(salePrice) ? salePrice : null,
        deliveryCharge: deliveryCharge,
        stockStatus: stockStatus,
        stockQuantity: stockQuantity,
        shortDescription: data.short_description || null,
        fullDescription: data.description || null,
        youtubeUrl: data.youtube_video_url || null,
        imageUrl: data.image_url || null,
        categoryId: categoryId,
        isPopular: isPopular,
        displaySection: displaySection,
      },
      include: {
        category: true,
      },
    });

    try {
      revalidateTag('wc-products');
      revalidateTag('wc-api');
    } catch {}

    try {
      revalidatePath(`/product/${newProduct.slug}`);
      revalidatePath('/admin/products');
      revalidatePath('/categories');
      revalidatePath('/', 'layout');
      revalidatePath('/');
    } catch {}

    return { 
      success: true, 
      id: newProduct.id, 
      slug: newProduct.slug,
      name: newProduct.name 
    };
  } catch (error) {
    console.error("Failed to create product in Prisma:", error);
    return { success: false, error: error.message || 'পণ্য তৈরি করতে সমস্যা হয়েছে।' };
  }
}

/**
 * Server Action: Update product directly in MySQL via Prisma
 */
export async function updateProductAction(id, data) {
  try {
    const numericId = parseInt(id, 10);
    if (!numericId) throw new Error('Invalid product ID');

    let categoryId = null;

    if (data.category === 'new' && data.new_category_name) {
      const catSlug = slugifyText(data.new_category_name, 'category');
      const newCat = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: {
          name: data.new_category_name.trim(),
          slug: catSlug,
        },
      });
      categoryId = newCat.id;
    } else if (data.category) {
      categoryId = parseInt(data.category, 10) || null;
    }

    // Verify categoryId exists in database to prevent foreign key errors
    if (categoryId) {
      const catExists = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });
      if (!catExists) {
        categoryId = null;
      }
    }

    const regPrice = parseFloat(data.regular_price) || 0;
    const salePrice = data.sale_price ? parseFloat(data.sale_price) : null;
    const displaySection = data.display_section || 'both';
    const isPopular = displaySection === 'popular' || displaySection === 'both';

    const updatePayload = {
      name: (data.name || '').trim(),
      regularPrice: regPrice,
      salePrice: salePrice && !isNaN(salePrice) ? salePrice : null,
      shortDescription: data.short_description || null,
      fullDescription: data.description || null,
      youtubeUrl: data.youtube_video_url || null,
      categoryId: categoryId,
      isPopular: isPopular,
      displaySection: displaySection,
    };

    if (data.delivery_charge !== undefined) {
      updatePayload.deliveryCharge = data.delivery_charge !== '' ? (parseFloat(data.delivery_charge) || 0) : 0;
    }

    if (data.stock_status !== undefined) {
      updatePayload.stockStatus = data.stock_status || 'instock';
    }

    if (data.stock_quantity !== undefined) {
      updatePayload.stockQuantity = data.stock_quantity !== '' ? (parseInt(data.stock_quantity, 10) || 0) : 0;
    }

    if (data.image_url !== undefined && data.image_url !== '') {
      updatePayload.imageUrl = data.image_url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: numericId },
      data: updatePayload,
      include: {
        category: true,
      },
    });

    try {
      revalidateTag('wc-products');
      revalidateTag('wc-api');
    } catch {}

    try {
      revalidatePath(`/product/${updatedProduct.slug}`);
      revalidatePath('/admin/products');
      revalidatePath('/categories');
      revalidatePath('/', 'layout');
      revalidatePath('/');
    } catch {}

    return { 
      success: true, 
      id: updatedProduct.id, 
      slug: updatedProduct.slug,
      name: updatedProduct.name 
    };
  } catch (error) {
    console.error("Failed to update product in Prisma:", error);
    return { success: false, error: error.message || 'পণ্য আপডেট করতে সমস্যা হয়েছে।' };
  }
}

/**
 * Server Action: Delete product directly in MySQL via Prisma
 */
export async function deleteProductAction(id) {
  try {
    const numericId = parseInt(id, 10);
    if (!numericId) throw new Error('Invalid product ID');

    await prisma.product.delete({
      where: { id: numericId },
    });

    try {
      revalidateTag('wc-products');
      revalidateTag('wc-api');
      revalidatePath('/admin/products');
      revalidatePath('/categories');
      revalidatePath('/');
    } catch {}

    return { success: true };
  } catch (error) {
    console.error("Failed to delete product in Prisma:", error);
    return { success: false, error: error.message || 'পণ্য মুছতে সমস্যা হয়েছে।' };
  }
}
