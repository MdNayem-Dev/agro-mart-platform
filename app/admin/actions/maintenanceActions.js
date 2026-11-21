"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getMaintenanceModeFromWC, setMaintenanceModeInWC } from "@/lib/maintenance";

/**
 * Get current maintenance mode status
 */
export async function getMaintenanceModeAction() {
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get("site_maintenance_mode")?.value;
    
    // Check WooCommerce persistent status
    const wcStatus = await getMaintenanceModeFromWC();
    
    // If WooCommerce answered, use it; otherwise fallback to cookie
    const isMaintenance = typeof wcStatus === "boolean" ? wcStatus : (cookieVal === "1");

    return { 
      success: true, 
      enabled: isMaintenance 
    };
  } catch (err) {
    console.error("Failed to get maintenance mode:", err);
    return { success: false, enabled: false };
  }
}

/**
 * Toggle maintenance mode status
 * @param {boolean} enabled 
 */
export async function toggleMaintenanceModeAction(enabled) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;

    if (!sessionCookie) {
      return { success: false, message: "অননুমোদিত অনুরোধ (Unauthorized)" };
    }

    const targetState = Boolean(enabled);

    // 1. Update in WooCommerce permanently
    await setMaintenanceModeInWC(targetState);

    // 2. Set long-lived cookie for instant verification
    cookieStore.set("site_maintenance_mode", targetState ? "1" : "0", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
      httpOnly: false,
    });

    // 3. Revalidate public root cache and maintenance page
    revalidatePath("/", "layout");
    revalidatePath("/under-development");

    return { 
      success: true, 
      enabled: targetState,
      message: targetState 
        ? "মেইনটেইনেন্স মোড সফলভাবে চালু করা হয়েছে" 
        : "সাইট আবার লাইভ (Live) করা হয়েছে" 
    };
  } catch (err) {
    console.error("Failed to toggle maintenance mode:", err);
    return { success: false, message: "মেইনটেইনেন্স স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে" };
  }
}
