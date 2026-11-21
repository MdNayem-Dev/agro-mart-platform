"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getFaqData, updateFaqData, DEFAULT_FAQ_DATA } from "@/lib/faq";

/**
 * Fetch current FAQ data
 */
export async function getFaqAction() {
  try {
    const data = await getFaqData();
    return {
      success: true,
      data: data || DEFAULT_FAQ_DATA
    };
  } catch (err) {
    console.error("Error in getFaqAction:", err);
    return {
      success: false,
      data: DEFAULT_FAQ_DATA,
      error: "FAQ ডেটা লোড করতে ব্যর্থ হয়েছে"
    };
  }
}

/**
 * Save updated FAQ data (header texts, CTA texts, and questions list)
 */
export async function saveFaqAction(faqData) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;

    if (!sessionCookie) {
      return { success: false, message: "অননুমোদিত অনুরোধ (Unauthorized)" };
    }

    if (!faqData || !Array.isArray(faqData.faqs)) {
      return { success: false, message: "অপ্রত্যাশিত ডেটা ফরম্যাট" };
    }

    const updated = await updateFaqData(faqData);

    if (!updated) {
      return { success: false, message: "FAQ ডেটা সার্ভারে সংরক্ষণ করতে সমস্যা হয়েছে" };
    }

    // Invalidate public page caches so changes show immediately on the homepage
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/admin/faq");
      revalidateTag("site-faq");
    } catch {}

    return {
      success: true,
      message: "FAQ সেকশন ও প্রশ্ন-উত্তর সফলভাবে আপডেট করা হয়েছে!"
    };
  } catch (err) {
    console.error("Error in saveFaqAction:", err);
    return {
      success: false,
      message: "সার্ভারে সমস্যা হয়েছে: " + (err?.message || "অজানা ত্রুটি")
    };
  }
}
