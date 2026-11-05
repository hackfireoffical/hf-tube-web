import { NextResponse } from "next/server";
import { invidious } from "@/lib/invidious";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[\w-]{6,20}$/.test(id)) return NextResponse.json({ comments: [] }, { status: 400 });
  try {
    const result = await invidious<any>("/api/v1/comments/" + encodeURIComponent(id));
    return NextResponse.json({ comments: result.data?.comments || [], instance: result.instance });
  } catch {
    return NextResponse.json({ comments: [], unavailable: true });
  }
}