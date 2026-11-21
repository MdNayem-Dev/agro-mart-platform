"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Allowed roles for the Admin Panel
const ALLOWED_ADMIN_ROLES = ["admin", "superadmin", "administrator", "manager", "shop_manager"];

/**
 * Server Action: Admin Login
 * Verifies credentials against MySQL prisma.user table using bcryptjs
 * Sets HttpOnly Secure SameSite=lax cookie: admin_session
 */
export async function adminLogin(input, rawPassword = null) {
  try {
    let emailOrUsername = "";
    let password = "";

    if (input instanceof FormData) {
      emailOrUsername = input.get("emailOrUsername") || input.get("email") || input.get("username") || "";
      password = input.get("password") || "";
    } else if (typeof input === "object" && input !== null) {
      emailOrUsername = input.emailOrUsername || input.email || input.username || "";
      password = input.password || "";
    } else if (typeof input === "string") {
      emailOrUsername = input;
      password = rawPassword || "";
    }

    emailOrUsername = String(emailOrUsername).trim();
    password = String(password);

    if (!emailOrUsername || !password) {
      return {
        success: false,
        error: "অনুগ্রহ করে ইমেইল/ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।",
      };
    }

    // 1. Find user by username or email in MySQL (support case-insensitivity)
    const lowerInput = emailOrUsername.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: emailOrUsername },
          { email: emailOrUsername },
          { username: lowerInput },
          { email: lowerInput },
        ],
      },
    });

    if (!user) {
      return {
        success: false,
        error: "ইমেইল/ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।",
      };
    }

    // 2. Verify hashed password with bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "ইমেইল/ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।",
      };
    }

    // 3. Verify user has authorized admin role
    const userRole = (user.role || "admin").toLowerCase().trim();
    if (!ALLOWED_ADMIN_ROLES.includes(userRole)) {
      return {
        success: false,
        error: "আপনার অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই।",
      };
    }

    // 4. Create session payload and store in HttpOnly cookie
    const sessionToken = `admin_${user.id}_${Date.now()}`;
    const sessionData = {
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name || user.username,
        email: user.email,
        username: user.username,
        roles: [userRole],
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const cookieStore = await cookies();
    cookieStore.set("admin_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return {
      success: true,
      user: sessionData.user,
    };
  } catch (error) {
    console.error("adminLogin error:", error);

    // Fallback safeguard: If Hostinger MySQL hits max_connections_per_hour or is temporarily unreachable,
    // allow the master admin credentials to authenticate so the admin is never locked out.
    const lowerInput = String(emailOrUsername || "").toLowerCase().trim();
    if (
      (lowerInput === "smartagrosource.com" || lowerInput === "admin" || lowerInput === "sourceofagri") &&
      password === "sony@2k26"
    ) {
      console.warn("Notice: Logging in via admin fallback credentials due to database rate limit.");
      const sessionData = {
        token: `admin_fallback_${Date.now()}`,
        user: {
          id: 1,
          name: "Smart Agro Admin",
          email: "smartagrosource.com",
          username: "smartagrosource.com",
          roles: ["admin"],
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };

      const cookieStore = await cookies();
      cookieStore.set("admin_session", JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return {
        success: true,
        user: sessionData.user,
      };
    }

    return {
      success: false,
      error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
    };
  }
}

/**
 * Server Action: Admin Logout
 * Deletes admin_session cookie and redirects to /admin/login
 */
export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

/**
 * Helper to fetch the current Admin Session from cookies
 */
export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;
    if (!sessionCookie) return null;

    let rawVal = sessionCookie;
    if (rawVal.startsWith("%7B") || rawVal.startsWith("%7b") || rawVal.includes("%22")) {
      try { rawVal = decodeURIComponent(rawVal); } catch {}
    }

    const data = JSON.parse(rawVal);
    if (!data || (!data.token && !data.user)) return null;

    if (data.expiresAt && data.expiresAt < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
