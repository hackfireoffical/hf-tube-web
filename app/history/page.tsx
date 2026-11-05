"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Trash2 } from "lucide-react";

type HistoryItem = { videoId: string; title: string; author?: string; watchedAt: number };

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hf-watch-history") || "[]");
      if (Array.isArray(saved)) setItems(saved.filter(item => item && item.videoId && item.title));
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  function clearHistory() {
    localStorage.removeItem("hf-watch-history");
    setItems([]);
  }

  return <main className="min-h-screen bg-[#0f0f0f] px-4 pb-20 text-white md:px-7">
    <header className="mx-auto flex h-16 max-w-4xl items-center gap-3 border-b border-white/[.06]">
      <a href="/" aria-label="Back home" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft /></a>
      <a href="/" className="text-lg font-black">HF<span className="text-[#3ea6ff]">tube</span></a>
      <span className="ml-auto flex items-center gap-2 text-sm text-white/50"><Clock3 size={17}/> Watch history</span>
    </header>
    <section className="mx-auto max-w-4xl pt-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#3ea6ff]">Your activity</p><h1 className="mt-1 text-2xl font-bold">Watch history</h1><p className="mt-1 text-sm text-white/45">Saved only in this browser on this device.</p></div>
        {items.length > 0 && <button onClick={clearHistory} className="inline-flex items-center gap-2 rounded-full bg-[#252525] px-4 py-2 text-sm hover:bg-[#333]"><Trash2 size={16}/>Clear</button>}
      </div>
      {!ready ? <div className="h-32 animate-pulse rounded-xl bg-[#1c1c1c]"/> : items.length === 0 ? <div className="rounded-2xl bg-[#181818] p-10 text-center"><Clock3 className="mx-auto text-white/30" size={32}/><p className="mt-4 font-semibold">No watch history yet</p><p className="mt-2 text-sm text-white/45">Videos you watch will appear here.</p><a href="/" className="mt-5 inline-block rounded-full bg-[#3ea6ff] px-5 py-2 text-sm font-semibold text-black">Explore videos</a></div> :
        <div className="divide-y divide-white/[.07]">{items.map((item,index)=><a key={item.videoId+"-"+index} href={"/watch/"+encodeURIComponent(item.videoId)} className="flex gap-4 py-4 hover:bg-white/[.03]"><div className="grid h-16 w-28 shrink-0 place-items-center rounded-lg bg-[#222] text-[#3ea6ff]"><span className="text-xs font-bold">HF TUBE</span></div><div className="min-w-0"><h2 className="line-clamp-2 font-semibold">{item.title}</h2><p className="mt-1 truncate text-sm text-white/45">{item.author || "Unknown channel"}</p><p className="mt-1 text-xs text-white/35">{new Date(item.watchedAt).toLocaleString()}</p></div></a>)}</div>}
    </section>
  </main>;
}
