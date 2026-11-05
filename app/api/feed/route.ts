import { NextResponse } from "next/server";
import { invidious } from "@/lib/invidious";

export const revalidate = 120;

export async function GET() {
  try {
    const result = await invidious<any[]>("/api/v1/trending");
    if (!Array.isArray(result.data)) {
      return NextResponse.json({ videos: [], error: "The video provider returned an unexpected response." }, { status: 502 });
    }
    return NextResponse.json({
      videos: result.data,
      instance: result.instance,
      fallback: result.instance !== "https://invidious.tiekoetter.com"
    });
  } catch (error) {
    return NextResponse.json({
      videos: [],
      error: error instanceof Error ? error.message : "No available Invidious instance responded."
    }, { status: 503 });
  }
}
