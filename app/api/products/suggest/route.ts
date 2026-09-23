import { NextRequest, NextResponse } from "next/server";
import { getProductSuggestions } from "@/lib/products";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const suggestions = await getProductSuggestions(q);
  return NextResponse.json({ suggestions });
}
