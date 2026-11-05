"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Volume2, VolumeX } from "lucide-react";
import type { Video, VideoDetails } from "@/lib/types";
import { formatViews, thumbnail } from "@/lib/types";

export default function ShortsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (nextPage: number) => {
    const response = await fetch("/api/shorts?page=" + nextPage);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Short videos unavailable.");
    const incoming: Video[] = Array.isArray(data.videos) ? data.videos : [];
    setVideos(current => {
      const ids = new Set(current.map(video => video.videoId));
      return [...current, ...incoming.filter(video => !ids.has(video.videoId))];
    });
    setPage(nextPage);
    setHasMore(incoming.length >= 12);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/shorts?page=1").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Short videos unavailable.");
      if (active) {
        setVideos(Array.isArray(data.videos) ? data.videos : []);
        setHasMore((data.videos || []).length >= 12);
      }
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Short videos unavailable."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try { await load(page + 1); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load more videos."); }
    finally { setLoadingMore(false); }
  };

  return <main className="min-h-screen bg-black text-white">
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 bg-gradient-to-b from-black/90 to-transparent px-4">
      <a href="/" aria-label="Back home" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft/></a>
      <a href="/" className="font-black">HF<span className="text-[#3ea6ff]">tube</span></a>
      <span className="ml-2 text-sm font-semibold">Short videos</span>
    </header>
    {loading && <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-[#3ea6ff]" size={32}/></div>}
    {!loading && error && <div className="mx-auto grid min-h-screen max-w-md place-items-center px-6 text-center"><div><h1 className="text-xl font-bold">Short videos couldn't load</h1><p className="mt-3 text-sm text-white/55">{error}</p><a href="/" className="mt-5 inline-block rounded-full bg-[#3ea6ff] px-5 py-2 font-semibold text-black">Back home</a></div></div>}
    {!loading && !error && videos.length === 0 && <div className="mx-auto grid min-h-screen max-w-md place-items-center px-6 text-center"><div><h1 className="text-xl font-bold">No short videos found</h1><p className="mt-3 text-sm text-white/55">The available public video sources did not return any videos under 60 seconds. Try again later.</p></div></div>}
    {!loading && !error && videos.length > 0 && <div className="h-[100svh] snap-y snap-mandatory overflow-y-auto overscroll-contain">
      {videos.map(video => <ShortCard key={video.videoId} video={video}/>)}
      <div className="grid min-h-32 snap-start place-items-center bg-[#101010]">
        {hasMore ? <button onClick={loadMore} disabled={loadingMore} className="inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-sm font-semibold disabled:opacity-50">{loadingMore && <Loader2 size={16} className="animate-spin"/>}{loadingMore ? "Loading more…" : "Load more shorts"}</button> : <p className="text-sm text-white/40">You're all caught up.</p>}
      </div>
    </div>}
  </main>;
}

function ShortCard({ video }: { video: Video }) {
  const root = useRef<HTMLElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const [details, setDetails] = useState<VideoDetails | null>(null);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let requested = false;
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0]?.isIntersecting;
      if (!visible) {
        player.current?.pause();
        return;
      }
      if (!requested) {
        requested = true;
        setLoading(true);
        fetch("/api/video/" + encodeURIComponent(video.videoId)).then(async response => {
          const data = await response.json();
          if (!response.ok) throw new Error("Video unavailable");
          setDetails(data.video);
        }).catch(() => setFailed(true)).finally(() => setLoading(false));
      } else {
        void player.current?.play().catch(() => {});
      }
    }, { threshold: 0.65 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [video.videoId]);

  const stream = details?.formatStreams?.find(format => format.url)?.url || "";
  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    if (player.current) player.current.muted = next;
  };

  return <section ref={root} className="relative mx-auto flex h-[100svh] w-full max-w-[520px] snap-start items-center justify-center overflow-hidden bg-[#090909]">
    {stream ? <video ref={player} src={stream} poster={thumbnail(video)} autoPlay muted={muted} loop playsInline onClick={toggleSound} className="h-full w-full object-contain"/> :
      <div className="absolute inset-0 grid place-items-center bg-[#171717]">{loading ? <Loader2 className="animate-spin text-[#3ea6ff]" size={32}/> : <img src={thumbnail(video)} alt="" className="h-full w-full object-contain"/>}</div>}
    {failed && <div className="absolute inset-x-4 top-20 rounded-xl bg-black/70 p-3 text-center text-sm">This video couldn't be played by the current source.</div>}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent px-5 pb-8 pt-24">
      <p className="line-clamp-2 text-lg font-bold drop-shadow">{video.title}</p>
      <p className="mt-2 text-sm text-white/80">{video.author || "Unknown channel"} · {formatViews(video.viewCount)}</p>
      <a href={"/watch/" + encodeURIComponent(video.videoId)} className="pointer-events-auto mt-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25">Open full video</a>
    </div>
    <button onClick={toggleSound} aria-label={muted ? "Unmute video" : "Mute video"} className="absolute bottom-28 right-4 rounded-full bg-black/60 p-3 backdrop-blur">{muted ? <VolumeX size={20}/> : <Volume2 size={20}/>}</button>
  </section>;
}
