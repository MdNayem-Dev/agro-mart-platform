"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { 
  getTrustServicesData, 
  updateTrustServicesData, 
  DEFAULT_TRUST_SERVICES_DATA 
} from "@/lib/trustServices";

/**
 * Fetch current Trust & Services data
 */
export async function getTrustServicesAction() {
  try {
    const data = await getTrustServicesData();
    return {
      success: true,
      data: data || DEFAULT_TRUST_SERVICES_DATA
    };
  } catch (err) {
    console.error("Error in getTrustServicesAction:", err);
    return {
      success: false,
      data: DEFAULT_TRUST_SERVICES_DATA,
      error: "অঙ্গীকার ও সেবা ডেটা লোড করতে সমস্যা হয়েছে"
    };
  }
}

/**
 * Save updated Trust & Services data
 */
export async function saveTrustServicesAction(data) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;

    if (!sessionCookie) {
      return { success: false, message: "অননুমোদিত অনুরোধ (Unauthorized) - অনুগ্রহ করে লগইন করুন" };
    }

    if (!data || !Array.isArray(data.features)) {
      return { success: false, message: "অপ্রত্যাশিত ডেটা ফরম্যাট" };
    }

    const updated = await updateTrustServicesData(data);

    if (!updated) {
      return { success: false, message: "সার্ভারে ডেটা সংরক্ষণ করতে সমস্যা হয়েছে" };
    }

    // Invalidate public page caches so changes appear immediately on homepage
    try {
      revalidatePath("/");
      revalidatePath("/admin/services");
      revalidateTag("site-trust-services");
    } catch (cacheErr) {
      console.warn("Revalidation notice:", cacheErr);
    }

    return {
      success: true,
      message: "অঙ্গীকার ও সেবা স্লাইডারের তথ্য সফলভাবে সংরক্ষিত হয়েছে!"
    };
  } catch (err) {
    console.error("Error in saveTrustServicesAction:", err);
    return {
      success: false,
      message: err?.message || "সার্ভার এরর: সংরক্ষণ করা সম্ভব হয়নি"
    };
  }
}
