"use server";

import { searchProducts } from "@/lib/api";

export async function doSearch(term) {
  if (!term || term.trim().length < 2) return [];
  try {
    const results = await searchProducts(term);
    return results;
  } catch (err) {
    console.error("Search failed", err);
    return [];
  }
}
