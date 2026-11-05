"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock3, Search, Trash2, X } from "lucide-react";

type HistoryItem = { videoId: string; title: string; author?: string; thumbnail?: string; watchedAt: number };

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hf-watch-history") || "[]");
      if (Array.isArray(saved)) setItems(saved.filter(item => item && item.videoId && item.title));
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item => (item.title + " " + (item.author || "")).toLowerCase().includes(q));
  }, [items, query]);

  function persist(next: HistoryItem[]) {
    setItems(next);
    localStorage.setItem("hf-watch-history", JSON.stringify(next));
  }

  function removeItem(videoId: string) {
    persist(items.filter(item => item.videoId !== videoId));
  }

  function clearHistory() {
    if (!window.confirm("Clear all watch history stored in this browser?")) return;
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#3ea6ff]">Your activity</p><h1 className="mt-1 text-2xl font-bold">Watch history</h1><p className="mt-1 text-sm text-white/45">{items.length} videos · Saved only in this browser.</p></div>
        {items.length > 0 && <button onClick={clearHistory} className="inline-flex items-center gap-2 rounded-full bg-[#252525] px-4 py-2 text-sm hover:bg-[#333]"><Trash2 size={16}/>Clear all</button>}
      </div>
      {items.length > 0 && <label className="mb-5 flex items-center gap-3 rounded-full border border-white/10 bg-[#181818] px-4"><Search size={18} className="text-white/40"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your watch history" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search" className="rounded-full p-1 text-white/50 hover:bg-white/10"><X size={16}/></button>}</label>}
      {!ready ? <div className="h-32 animate-pulse rounded-xl bg-[#1c1c1c]"/> : items.length === 0 ? <div className="rounded-2xl bg-[#181818] p-10 text-center"><Clock3 className="mx-auto text-white/30" size={32}/><p className="mt-4 font-semibold">No watch history yet</p><p className="mt-2 text-sm text-white/45">Videos you watch will appear here.</p><a href="/" className="mt-5 inline-block rounded-full bg-[#3ea6ff] px-5 py-2 text-sm font-semibold text-black">Explore videos</a></div> :
        visible.length === 0 ? <div className="rounded-2xl bg-[#181818] p-10 text-center text-sm text-white/45">No history matches “{query}”.</div> :
        <div className="divide-y divide-white/[.07]">{visible.map((item,index)=><article key={item.videoId+"-"+index} className="flex items-center gap-3 py-4 hover:bg-white/[.03]"><a href={"/watch/"+encodeURIComponent(item.videoId)} className="flex min-w-0 flex-1 gap-4"><div className="aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-[#222] sm:w-40">{item.thumbnail?<img src={item.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-[10px] font-bold text-[#3ea6ff]">HF TUBE</div>}</div><div className="min-w-0"><h2 className="line-clamp-2 font-semibold">{item.title}</h2><p className="mt-1 truncate text-sm text-white/45">{item.author || "Unknown channel"}</p><p className="mt-1 text-xs text-white/35">{new Date(item.watchedAt).toLocaleString()}</p></div></a><button onClick={()=>removeItem(item.videoId)} aria-label={"Remove "+item.title+" from history"} title="Remove from history" className="shrink-0 rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-red-300"><X size={18}/></button></article>)}</div>}
    </section>
  </main>;
}
