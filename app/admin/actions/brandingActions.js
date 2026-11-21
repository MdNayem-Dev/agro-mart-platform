"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBrandingAssets, updateBrandingAssets } from "@/lib/branding";
import { uploadImageAction } from "@/app/admin/actions/productActions";

/**
 * Fetch current branding (logo and banners)
 */
export async function getBrandingAction() {
  try {
    const data = await getBrandingAssets();
    return {
      success: true,
      data: {
        logo: data.logo || "",
        banners: Array.isArray(data.banners) ? data.banners : []
      }
    };
  } catch (err) {
    console.error("Error in getBrandingAction:", err);
    return {
      success: false,
      error: "ব্র্যান্ডিং ডেটা লোড করতে ব্যর্থ হয়েছে",
      data: { logo: "", banners: [] }
    };
  }
}

/**
 * Save updated branding (logo and 1-4 banners)
 */
export async function saveBrandingAction({ logo = "", banners = [] }) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;

    if (!sessionCookie) {
      return { success: false, message: "অননুমোদিত অনুরোধ (Unauthorized)" };
    }

    const cleanBanners = Array.isArray(banners) ? banners.filter(Boolean).slice(0, 4) : [];
    const cleanLogo = logo ? String(logo).trim() : "";

    const updated = await updateBrandingAssets({
      logo: cleanLogo,
      banners: cleanBanners
    });

    if (!updated) {
      return { success: false, message: "ব্যানার ও লোগো আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
    }

    // Invalidate public caches so changes show immediately
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/admin/banners");
      revalidateTag("site-branding");
      revalidateTag("site-assets");
    } catch {}

    return {
      success: true,
      message: "ব্যানার ও লোগো সফলভাবে আপডেট করা হয়েছে!"
    };
  } catch (err) {
    console.error("Error in saveBrandingAction:", err);
    return {
      success: false,
      message: "সার্ভারে সমস্যা হয়েছে: " + (err?.message || "অজানা ত্রুটি")
    };
  }
}

/**
 * Upload an image file for logo or banner
 */
export async function uploadBrandingImageAction(formData) {
  return await uploadImageAction(formData);
}
