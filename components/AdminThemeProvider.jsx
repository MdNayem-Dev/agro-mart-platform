"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

export default function AdminThemeProvider({ children }) {
  // If the admin user navigates to the public storefront, remove 'dark' class
  // so the public customer-facing site is always guaranteed to be purely light.
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="admin-theme-preference"
    >
      {children}
    </NextThemesProvider>
  );
}
