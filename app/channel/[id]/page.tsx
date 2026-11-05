"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Video } from "@/lib/types";
import { formatDuration, formatViews, thumbnail } from "@/lib/types";

type Channel = {
  author?: string;
  authorId?: string;
  authorUrl?: string;
  authorThumbnails?: { url: string }[];
  authorBanners?: { url: string }[];
  subCount?: number;
  totalViews?: number;
  description?: string;
  joined?: number;
  latestVideos?: Video[];
};

export default function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void params.then(({ id }) => {
      if (!active) return;
      fetch("/api/channel/" + encodeURIComponent(id))
        .then(async response => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Channel unavailable.");
          return data;
        })
        .then(data => {
          if (!active) return;
          setChannel(data.channel);
          setVideos(data.videos || []);
        })
        .catch(reason => {
          if (active) setError(reason instanceof Error ? reason.message : "Channel unavailable.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });
    return () => { active = false; };
  }, [params]);

  const avatar = channel?.authorThumbnails?.at(-1)?.url;
  const banner = channel?.authorBanners?.at(-1)?.url;

  return (
    <main className="min-h-screen bg-[#0f0f0f] pb-20 text-white">
      <header className="flex h-16 items-center gap-3 border-b border-white/[.06] px-4">
        <a href="/" aria-label="Back home" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft /></a>
        <a href="/" className="text-lg font-black">HF<span className="text-[#3ea6ff]">tube</span></a>
      </header>
      <section className="mx-auto max-w-6xl px-4 pt-5 md:px-7">
        {loading && <div className="h-44 animate-pulse rounded-2xl bg-[#202020]" />}
        {error && <div className="rounded-xl bg-[#211b19] p-5 text-orange-200">{error}</div>}
        {!loading && !error && channel && <>
          {banner && <div className="h-32 overflow-hidden rounded-2xl bg-[#202020] sm:h-52"><img src={banner} alt="" className="h-full w-full object-cover" /></div>}
          <div className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center">
            {avatar && <img src={avatar} alt="" className="h-24 w-24 rounded-full bg-[#242424] object-cover" />}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold">{channel.author || "Channel"}</h1>
              <p className="mt-1 text-sm text-white/50">{channel.subCount?.toLocaleString() || "—"} subscribers · {formatViews(channel.totalViews)}</p>
              {channel.description && <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm text-white/65">{channel.description}</p>}
            </div>
          </div>
          <div className="border-b border-white/10 pb-3"><h2 className="text-lg font-bold">Videos</h2></div>
          {videos.length === 0 ? <p className="py-12 text-center text-white/45">No videos were returned by this source.</p> :
            <div className="grid grid-cols-1 gap-x-5 gap-y-7 py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map(video => <a key={video.videoId} href={"/watch/" + encodeURIComponent(video.videoId)} className="group min-w-0">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-[#202020]">
                  <img src={thumbnail(video)} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-1 text-xs">{formatDuration(video.lengthSeconds)}</span>
                </div>
                <h3 className="mt-3 line-clamp-2 font-semibold group-hover:text-[#3ea6ff]">{video.title}</h3>
                <p className="mt-1 text-xs text-white/45">{formatViews(video.viewCount)} · {video.publishedText || ""}</p>
              </a>)}
            </div>}
        </>}
      </section>
    </main>
  );
}