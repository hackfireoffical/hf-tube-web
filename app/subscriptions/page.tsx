"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Loader2, RefreshCw, Search } from "lucide-react";
import type { Video } from "@/lib/types";
import { formatDuration, formatViews, thumbnail } from "@/lib/types";
import { readSubscriptions, toggleSubscription, type Subscription } from "@/lib/subscriptions";

export default function SubscriptionsPage() {
  const [channels, setChannels] = useState<Subscription[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [query, setQuery] = useState("");
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    let active = true;
    const saved = readSubscriptions();
    setChannels(saved);
    setLoading(true);
    setMessage("");
    setFailedCount(0);
    if (!saved.length) {
      setVideos([]);
      setLoading(false);
      return () => { active = false; };
    }
    Promise.allSettled(saved.map(async channel => {
      const response = await fetch("/api/channel/" + encodeURIComponent(channel.authorId) + "?page=1");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Channel unavailable");
      return (data.videos || []) as Video[];
    })).then(results => {
      if (!active) return;
      const merged = results.flatMap(result => result.status === "fulfilled" ? result.value : []);
      setFailedCount(results.filter(result => result.status === "rejected").length);
      const unique = Array.from(new Map(merged.map(video => [video.videoId, video])).values());
      setVideos(unique);
      if (!unique.length) setMessage("Your subscribed channels didn't return videos. Public instances may be temporarily unavailable.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshToken]);

  function unsubscribe(channel: Subscription) {
    toggleSubscription({ authorId: channel.authorId, author: channel.author, avatar: channel.avatar });
    setChannels(current => current.filter(item => item.authorId !== channel.authorId));
  }

  const filteredChannels = channels.filter(channel => channel.author.toLowerCase().includes(query.toLowerCase()));

  return <main className="min-h-screen bg-[#0f0f0f] px-4 pb-20 text-white md:px-7">
    <header className="mx-auto flex h-16 max-w-6xl items-center gap-3 border-b border-white/[.06]">
      <a href="/" aria-label="Back home" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft/></a>
      <a href="/" className="text-lg font-black">HF<span className="text-[#3ea6ff]">tube</span></a>
      <span className="ml-auto flex items-center gap-2 text-sm text-white/50"><Bell size={17}/> Subscriptions</span>
    </header>
    <section className="mx-auto max-w-6xl pt-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#3ea6ff]">Your channels</p>
      <h1 className="mt-1 text-2xl font-bold">Subscriptions</h1>
      <p className="mt-2 text-sm text-white/45">Subscriptions are saved locally in this browser. They are not synced to Google or other devices.</p>
      {channels.length > 0 && <>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#191919] px-3"><Search size={16} className="text-white/40"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a subscribed channel" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
          <button onClick={()=>setRefreshToken(v=>v+1)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#252525] px-4 py-2.5 text-sm hover:bg-[#333] disabled:opacity-40"><RefreshCw size={15} className={loading?"animate-spin":""}/>Refresh feed</button>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-3">{filteredChannels.map(channel=><div key={channel.authorId} className="flex min-w-36 items-center gap-3 rounded-xl bg-[#1a1a1a] p-3"><a href={"/channel/"+encodeURIComponent(channel.authorId)} className="flex min-w-0 items-center gap-2">{channel.avatar ? <img src={channel.avatar} alt="" className="h-10 w-10 rounded-full object-cover"/> : <span className="grid h-10 w-10 place-items-center rounded-full bg-[#292929]"><Bell size={16}/></span>}<span className="max-w-28 truncate text-sm font-semibold">{channel.author}</span></a><button onClick={()=>unsubscribe(channel)} aria-label={"Unsubscribe from "+channel.author} className="text-xs text-white/40 hover:text-white">×</button></div>)}</div>
      </>}
      {loading && <div className="grid min-h-48 place-items-center"><Loader2 className="animate-spin text-[#3ea6ff]" size={28}/></div>}
      {!loading && channels.length === 0 && <div className="mt-8 rounded-2xl bg-[#191919] p-10 text-center"><Bell size={32} className="mx-auto text-white/30"/><h2 className="mt-4 font-semibold">No subscriptions yet</h2><p className="mt-2 text-sm text-white/45">Visit a channel and tap Subscribe to add it here.</p><a href="/" className="mt-5 inline-block rounded-full bg-[#3ea6ff] px-5 py-2 text-sm font-semibold text-black">Discover videos</a></div>}
      {!loading && failedCount > 0 && <p className="mt-5 rounded-xl bg-[#241e17] p-3 text-sm text-orange-200">{failedCount} subscribed channel(s) could not be reached. Other channel videos may still be available.</p>}
      {!loading && channels.length > 0 && videos.length > 0 && <><h2 className="mb-4 mt-8 text-lg font-bold">Latest from your channels</h2><div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{videos.map(video=><a key={video.videoId} href={"/watch/"+encodeURIComponent(video.videoId)} className="group min-w-0"><div className="relative aspect-video overflow-hidden rounded-xl bg-[#202020]"><img src={thumbnail(video)} alt="" loading="lazy" className="h-full w-full object-cover"/><span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-1 text-xs">{formatDuration(video.lengthSeconds)}</span></div><h3 className="mt-3 line-clamp-2 font-semibold group-hover:text-[#3ea6ff]">{video.title}</h3><p className="mt-1 text-xs text-white/45">{video.author} · {formatViews(video.viewCount)}</p></a>)}</div></>}
      {!loading && channels.length > 0 && filteredChannels.length === 0 && <p className="mt-5 text-center text-sm text-white/45">No subscribed channels match that search.</p>}
      {!loading && message && <p className="mt-8 text-center text-sm text-white/45">{message}</p>}
    </section>
  </main>;
}
