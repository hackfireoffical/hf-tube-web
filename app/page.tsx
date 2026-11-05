"use client";
import { useEffect, useMemo, useState } from "react";
import { Bell, Compass, Download, Home, Menu, PlaySquare, Search, Settings, UserCircle, Video as VideoIcon, Zap } from "lucide-react";
import type { Video } from "@/lib/types";
import { formatDuration, formatViews, thumbnail } from "@/lib/types";
const categories = ["All", "Today", "Gaming", "Music", "Minecraft", "Technology", "Live", "Mixes"];
export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [instance, setInstance] = useState("");
  useEffect(() => {
    let alive = true;
    fetch("/api/feed").then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Feed unavailable"); return d; })
      .then(d => { if (alive) { setVideos(d.videos || []); setInstance(d.instance || ""); } })
      .catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  const visible = useMemo(() => videos.filter(v => !query || (v.title + " " + (v.author || "")).toLowerCase().includes(query.toLowerCase())), [videos, query]);
  return <main className="min-h-screen bg-[#0f0f0f] pb-24">
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[.06] bg-[#0f0f0f]/95 px-4 backdrop-blur md:px-7">
      <div className="flex items-center gap-3"><button className="rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Menu"><Menu size={23}/></button><a href="/" className="flex items-center gap-2 text-xl font-black tracking-tight"><span className="grid h-7 w-8 place-items-center rounded-lg bg-[#3ea6ff] text-sm text-black">HF</span>tube</a></div>
      <form action="/search" className="mx-5 hidden max-w-xl flex-1 items-center rounded-full border border-white/15 bg-[#181818] px-4 md:flex"><Search size={18} className="text-white/45"/><input name="q" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search videos" className="h-10 w-full bg-transparent px-3 text-sm outline-none placeholder:text-white/40"/><button aria-label="Search"><Search size={18}/></button></form>
      <div className="flex items-center gap-2"><a href="/search" className="rounded-full p-2 md:hidden" aria-label="Search"><Search/></a><button className="rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Notifications"><Bell size={21}/></button><button className="rounded-full bg-[#242424] p-2 text-[#3ea6ff]" aria-label="Account"><UserCircle size={22}/></button></div>
    </header>
    <div className="mx-auto max-w-[1500px] md:flex">
      <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-20 shrink-0 flex-col items-center gap-7 border-r border-white/[.06] py-7 lg:flex"><NavIcon icon={<Home/>} label="Home" active/><NavIcon icon={<Zap/>} label="Shorts"/><NavIcon icon={<PlaySquare/>} label="Subscriptions"/><NavIcon href="/history" icon={<UserCircle/>} label="You"/><div className="mt-auto"><NavIcon icon={<Settings/>} label="Settings"/></div></aside>
      <section className="min-w-0 flex-1 px-4 pt-4 md:px-7">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">{categories.map(c=><button key={c} onClick={()=>setActive(c)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${active===c?"bg-white text-black":"bg-[#242424] text-white hover:bg-[#333]"}`}>{c}</button>)}</div>
        <div className="mb-7 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#3ea6ff]">Discover</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Your next watch.</h1></div><span className="hidden items-center gap-2 text-xs text-white/40 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-400"/>{instance ? "Connected to an instance" : "Finding a source"}</span></div>
        {loading && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="animate-pulse"><div className="aspect-video rounded-xl bg-[#222]"/><div className="mt-3 h-4 w-3/4 rounded bg-[#222]"/><div className="mt-2 h-3 w-1/2 rounded bg-[#1c1c1c]"/></div>)}</div>}
        {!loading && error && <div className="rounded-2xl border border-white/10 bg-[#181818] p-6"><p className="font-semibold">The feed couldn't load</p><p className="mt-2 text-sm text-white/50">{error}</p><p className="mt-3 text-xs text-white/35">Public instances can be busy or unavailable. HF Tube will try its configured fallback sources on the next request.</p></div>}
        {!loading && !error && <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{visible.map(v=><article key={v.videoId} className="group min-w-0"><a href={`/watch/${encodeURIComponent(v.videoId)}`} target="_blank" rel="noreferrer" className="relative block overflow-hidden rounded-xl bg-[#202020]"><div className="aspect-video"><img src={thumbnail(v)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"/></div><span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-1 text-xs font-semibold">{formatDuration(v.lengthSeconds)}</span></a><div className="mt-3 flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#242424] text-[#3ea6ff]"><VideoIcon size={17}/></div><div className="min-w-0"><a href={`/watch/${encodeURIComponent(v.videoId)}`} target="_blank" rel="noreferrer" className="line-clamp-2 text-[15px] font-semibold leading-5 hover:text-[#3ea6ff]">{v.title}</a>{v.authorId ? <a href={`/channel/${encodeURIComponent(v.authorId)}`} className="mt-1 block truncate text-sm text-white/50 hover:text-[#3ea6ff]">{v.author || "Unknown channel"}</a> : <p className="mt-1 truncate text-sm text-white/50">{v.author || "Unknown channel"}</p>}<p className="text-xs text-white/40">{formatViews(v.viewCount)} · {v.publishedText || "Recently"}</p></div><button title="Download options (coming soon)" className="ml-auto h-8 shrink-0 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"><Download size={17}/></button></div></article>)}</div>}
        {!loading && !error && visible.length===0 && <p className="py-16 text-center text-white/50">No videos match that search.</p>}
        <footer className="mt-16 border-t border-white/[.07] py-6 text-xs text-white/35">HF Tube · Independent frontend · Powered by community Invidious instances</footer>
      </section>
    </div>
    <nav className="fixed bottom-0 z-40 flex h-[68px] w-full items-center justify-around border-t border-white/10 bg-[#101010]/95 px-2 backdrop-blur lg:hidden"><MobileNav icon={<Home/>} label="Home" active/><MobileNav icon={<Zap/>} label="Shorts"/><button className="grid h-11 w-11 place-items-center rounded-full bg-[#252525] text-[#3ea6ff]"><span className="text-2xl">＋</span></button><MobileNav icon={<PlaySquare/>} label="Subscriptions"/><MobileNav href="/history" icon={<UserCircle/>} label="You"/></nav>
  </main>;
}
function NavIcon({icon,label,active=false,href="/"}:{icon:React.ReactNode;label:string;active?:boolean;href?:string}){return <a href={href} className={`flex flex-col items-center gap-1 text-[10px] ${active?"text-[#3ea6ff]":"text-white/55 hover:text-white"}`}>{icon}<span>{label}</span></a>}
function MobileNav({icon,label,active=false,href="/"}:{icon:React.ReactNode;label:string;active?:boolean;href?:string}){return <a href={href} className={`flex min-w-[58px] flex-col items-center gap-1 text-[10px] ${active?"text-white":"text-white/55"}`}>{icon}<span>{label}</span></a>}