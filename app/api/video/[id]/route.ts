import { NextResponse } from "next/server";
import { invidiousVideo } from "@/lib/invidious";
import { getPipedVideo } from "@/lib/piped";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[\\w-]{6,20}$/.test(id)) return NextResponse.json({ error: "Invalid video ID." }, { status: 400 });
  let invidiousError = "Invidious unavailable.";
  try {
    const result = await invidiousVideo<any>("/api/v1/videos/" + encodeURIComponent(id));
    return NextResponse.json({ video: result.data, instance: result.instance, provider: "invidious" });
  } catch (error) {
    invidiousError = error instanceof Error ? error.message : invidiousError;
  }
  try {
    const result = await getPipedVideo(id);
    return NextResponse.json({ video: result.video, instance: result.instance, provider: "piped", fallback: true });
  } catch (error) {
    const pipedError = error instanceof Error ? error.message : "Piped unavailable.";
    return NextResponse.json({ error: invidiousError + " | " + pipedError }, { status: 503 });
  }
}
