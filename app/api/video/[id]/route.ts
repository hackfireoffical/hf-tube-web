import { NextResponse } from "next/server";
import { invidiousVideo } from "@/lib/invidious";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[\w-]{6,20}$/.test(id)) return NextResponse.json({ error: "Invalid video ID." }, { status: 400 });
  try {
    const result = await invidiousVideo<any>("/api/v1/videos/" + encodeURIComponent(id));
    return NextResponse.json({ video: result.data, instance: result.instance });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Video unavailable." }, { status: 503 });
  }
}