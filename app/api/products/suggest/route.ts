import { NextRequest, NextResponse } from "next/server";
import { isValidCategory } from "@/lib/filters";
import { getProductSuggestions, getSuggestionCategories } from "@/lib/products";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const categoryParam = request.nextUrl.searchParams.get("category");

  if (categoryParam && isValidCategory(categoryParam)) {
    const suggestions = await getProductSuggestions(q, categoryParam);
    return NextResponse.json({ suggestions });
  }

  const categories = await getSuggestionCategories(q);
  return NextResponse.json({ categories });
}
