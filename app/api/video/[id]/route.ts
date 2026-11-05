import { NextResponse } from "next/server";
import { invidiousVideo, getInstances } from "@/lib/invidious";
import { getPipedVideo } from "@/lib/piped";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[\w-]{6,20}$/.test(id)) return NextResponse.json({ error: "Invalid video ID." }, { status: 400 });
  let invidiousError = "Invidious unavailable.";
  try {
    const result = await invidiousVideo<any>("/api/v1/videos/" + encodeURIComponent(id));
    return NextResponse.json({ video: result.data, instance: result.instance, provider: "invidious" }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    invidiousError = error instanceof Error ? error.message : invidiousError;
  }
  try {
    const result = await getPipedVideo(id);
    return NextResponse.json({ video: result.video, instance: result.instance, provider: "piped", fallback: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    const pipedError = error instanceof Error ? error.message : "Piped unavailable.";
    const embedUrls = getInstances()
      .filter(instance => !instance.toLowerCase().includes("tiekoetter.com"))
      .map(instance => instance + "/embed/" + encodeURIComponent(id));
    return NextResponse.json({
      embedUrls,
      error: "The provider APIs are blocking server-side requests. Trying the provider player directly in your browser.",
      diagnostic: invidiousError + " | " + pipedError
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}
