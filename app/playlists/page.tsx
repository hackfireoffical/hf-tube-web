"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ListVideo, Plus, Search, Trash2, Pencil } from "lucide-react";
import { createPlaylist, deletePlaylist, readPlaylists, renamePlaylist, type LocalPlaylist } from "@/lib/playlists";

export default function PlaylistsPage() {
  const [items,setItems]=useState<LocalPlaylist[]>([]);
  const [name,setName]=useState("");
  const [query,setQuery]=useState("");
  useEffect(()=>setItems(readPlaylists()),[]);
  function add(){const p=createPlaylist(name);if(p){setItems(readPlaylists());setName("");}}
  function remove(id:string){const p=items.find(x=>x.id===id);if(!p||!window.confirm("Delete the playlist “"+p.name+"”?"))return;deletePlaylist(id);setItems(readPlaylists());}
  function rename(item:LocalPlaylist){const next=window.prompt("Rename playlist",item.name);if(next===null||!next.trim())return;renamePlaylist(item.id,next);setItems(readPlaylists());}
  const visible=useMemo(()=>items.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())),[items,query]);
  return <main className="min-h-screen bg-[#0f0f0f] px-4 pb-20 text-white md:px-7">
    <header className="mx-auto flex h-16 max-w-5xl items-center gap-3 border-b border-white/[.06]"><a href="/" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft/></a><a href="/" className="text-lg font-black">HF<span className="text-[#3ea6ff]">tube</span></a><span className="ml-auto text-sm text-white/50">Playlists</span></header>
    <section className="mx-auto max-w-5xl pt-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#3ea6ff]">Your library</p><h1 className="mt-1 text-2xl font-bold">Playlists</h1><p className="mt-2 text-sm text-white/45">Private playlists stored in this browser only.</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row"><input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")add();}} placeholder="New playlist name" maxLength={80} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#1b1b1b] px-4 py-3 text-sm outline-none focus:border-[#3ea6ff]"/><button onClick={add} disabled={!name.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3ea6ff] px-5 py-3 text-sm font-bold text-black disabled:opacity-40"><Plus size={17}/>Create playlist</button></div>
      {items.length>0&&<label className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-[#191919] px-3"><Search size={16} className="text-white/40"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search playlists" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>}
      {items.length===0?<div className="mt-8 rounded-2xl bg-[#191919] p-10 text-center"><ListVideo size={34} className="mx-auto text-white/30"/><h2 className="mt-4 font-semibold">No playlists yet</h2><p className="mt-2 text-sm text-white/45">Create a playlist, then use “Save to playlist” on any video.</p></div>:visible.length===0?<p className="mt-8 text-center text-sm text-white/45">No playlists match “{query}”.</p>:<div className="mt-7 grid gap-3 sm:grid-cols-2">{visible.map(p=><article key={p.id} className="flex items-center gap-3 rounded-2xl bg-[#1a1a1a] p-4"><a href={"/playlist/"+encodeURIComponent(p.id)} className="min-w-0 flex-1"><p className="truncate font-semibold hover:text-[#3ea6ff]">{p.name}</p><p className="mt-1 text-xs text-white/45">{p.videos.length} videos</p></a><a href={"/playlist/"+encodeURIComponent(p.id)} className="rounded-lg bg-[#292929] px-3 py-2 text-xs font-semibold">Open</a><button onClick={()=>rename(p)} aria-label={"Rename "+p.name} title="Rename playlist" className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"><Pencil size={16}/></button><button onClick={()=>remove(p.id)} aria-label={"Delete "+p.name} title="Delete playlist" className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-red-300"><Trash2 size={17}/></button></article>)}</div>}
    </section>
  </main>;
}
