"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { ArrowLeft, Download, Settings, Trash2, Upload, LogIn, LogOut, UserCircle } from "lucide-react";
import { DEFAULT_PREFERENCES, readPreferences, savePreferences, type PlaybackPreferences } from "@/lib/preferences";

const STORAGE_KEYS = ["hf-playback-preferences", "hf-watch-history", "hf-search-history", "hf-subscriptions", "hf-playlists", "hf-playback-queue"];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<PlaybackPreferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState<{email:string;name:string;picture?:string}|null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  useEffect(() => {
    setPrefs(readPreferences());
    const status = new URLSearchParams(window.location.search).get("google");
    if (status === "not-configured") setMessage("Google sign-in needs OAuth credentials and an encryption secret in your hosting environment.");
    else if (status && status !== "connected") setMessage("Google sign-in could not finish. Check your OAuth setup and try again.");
    fetch("/api/account/me").then(async response => {
      if (!response.ok) return null;
      const data = await response.json();
      return data.connected ? data.account : null;
    }).then(setAccount).catch(()=>setAccount(null)).finally(()=>{setAccountLoading(false);setReady(true);});
  }, []);

  async function disconnectGoogle() {
    if (!window.confirm("Disconnect this Google account from HF Tube?")) return;
    await fetch("/api/account/disconnect", { method: "POST" });
    setAccount(null);
    setMessage("Google account disconnected from this browser.");
  }

  function update(next: PlaybackPreferences) {
    setPrefs(next);
    savePreferences(next);
    setMessage("Preferences saved in this browser.");
  }

  function exportData() {
    const data: Record<string, unknown> = { app: "HF Tube", version: 1, exportedAt: new Date().toISOString(), storage: {} };
    const storage: Record<string, unknown> = {};
    for (const key of STORAGE_KEYS) {
      try { const raw = localStorage.getItem(key); if (raw !== null) storage[key] = JSON.parse(raw); } catch { /* Skip invalid local entries. */ }
    }
    data.storage = storage;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hf-tube-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Your browser data export was prepared.");
  }

  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.app !== "HF Tube" || !parsed.storage || typeof parsed.storage !== "object") throw new Error("This is not a valid HF Tube export.");
        if (!window.confirm("Import this HF Tube data? Matching local data will be replaced.")) return;
        for (const key of STORAGE_KEYS) {
          if (Object.prototype.hasOwnProperty.call(parsed.storage, key)) localStorage.setItem(key, JSON.stringify(parsed.storage[key]));
        }
        setPrefs(readPreferences());
        setMessage("Data imported. Refresh pages to see all restored items.");
      } catch (e) { setMessage(e instanceof Error ? e.message : "Could not import this file."); }
      finally { event.target.value = ""; }
    };
    reader.readAsText(file);
  }

  function clearData(key: string, label: string) {
    if (!window.confirm("Delete " + label + " saved in this browser? This cannot be undone.")) return;
    localStorage.removeItem(key);
    if (key === "hf-playback-preferences") setPrefs(DEFAULT_PREFERENCES);
    setMessage(label + " cleared from this browser.");
  }

  const dataItems = [
    { key: "hf-watch-history", label: "Watch history" },
    { key: "hf-search-history", label: "Search history" },
    { key: "hf-subscriptions", label: "Subscriptions" },
    { key: "hf-playlists", label: "Playlists" }
  ];

  if (!ready) return <main className="min-h-screen bg-[#0f0f0f] p-6 text-white">Loading settings…</main>;

  return <main className="min-h-screen bg-[#0f0f0f] px-4 pb-20 text-white md:px-7">
    <header className="mx-auto flex h-16 max-w-3xl items-center gap-3 border-b border-white/[.06]">
      <a href="/" aria-label="Back home" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft/></a>
      <a href="/" className="text-lg font-black">HF<span className="text-[#3ea6ff]">tube</span></a>
      <span className="ml-auto flex items-center gap-2 text-sm text-white/50"><Settings size={17}/> Settings</span>
    </header>
    <section className="mx-auto max-w-3xl pt-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#3ea6ff]">Customize</p>
      <h1 className="mt-1 text-2xl font-bold">Settings</h1>
      <p className="mt-2 text-sm text-white/45">These preferences and data are stored locally in this browser. They are not synced to a Google account.</p>

      <section className="mt-8 rounded-2xl border border-white/[.07] bg-[#181818] p-5">
        <h2 className="text-lg font-semibold">Google account</h2>
        <p className="mt-1 text-sm text-white/45">Optional read-only access to your YouTube subscriptions and channel uploads. HF Tube never asks for your Google password.</p>
        {accountLoading ? <p className="mt-4 text-sm text-white/45">Checking account connection…</p> : account ? <div className="mt-4 flex flex-wrap items-center gap-3"><div className="flex min-w-0 flex-1 items-center gap-3">{account.picture ? <img src={account.picture} alt="" className="h-11 w-11 rounded-full"/> : <UserCircle size={34} className="text-white/45"/>}<span className="min-w-0"><span className="block truncate font-semibold">{account.name}</span><span className="block truncate text-xs text-white/45">{account.email}</span></span></div><button onClick={disconnectGoogle} className="inline-flex items-center gap-2 rounded-full bg-[#303030] px-4 py-2.5 text-sm hover:bg-[#3a3a3a]"><LogOut size={16}/>Disconnect</button></div> : <div className="mt-4"><a href="/api/auth/google/start" className="inline-flex items-center gap-2 rounded-full bg-[#3ea6ff] px-4 py-2.5 text-sm font-semibold text-black"><LogIn size={16}/>Connect Google account</a></div>}
        <p className="mt-3 text-xs leading-5 text-white/35">The supported account feed is built from channels you subscribe to. YouTube's former Home-activity API parameter is deprecated, so this cannot reproduce YouTube's personalized recommendation algorithm. YouTube watch history is not available through this integration.</p>
      </section>

      <section className="mt-8 rounded-2xl border border-white/[.07] bg-[#181818] p-5">
        <h2 className="text-lg font-semibold">Playback</h2>
        <div className="mt-4 divide-y divide-white/[.07]">
          <label className="flex items-center justify-between gap-4 py-4"><span><span className="block font-medium">Autoplay videos</span><span className="mt-1 block text-xs text-white/45">Start videos automatically when the watch page opens.</span></span><input type="checkbox" checked={prefs.autoplay} onChange={e=>update({...prefs,autoplay:e.target.checked})} className="h-5 w-5 accent-[#3ea6ff]"/></label>
          <label className="flex items-center justify-between gap-4 py-4"><span><span className="block font-medium">Start videos muted</span><span className="mt-1 block text-xs text-white/45">Useful when opening videos in public or quiet places.</span></span><input type="checkbox" checked={prefs.muted} onChange={e=>update({...prefs,muted:e.target.checked})} className="h-5 w-5 accent-[#3ea6ff]"/></label>
          <label className="flex items-center justify-between gap-4 py-4"><span><span className="block font-medium">Default playback speed</span><span className="mt-1 block text-xs text-white/45">Applied when a video page loads.</span></span><select value={prefs.speed} onChange={e=>update({...prefs,speed:Number(e.target.value)})} className="rounded-lg bg-[#303030] px-3 py-2 text-sm"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/[.07] bg-[#181818] p-5">
        <h2 className="text-lg font-semibold">Your data</h2>
        <p className="mt-1 text-sm text-white/45">Remove individual types of locally stored data. This does not affect your Google account or the source provider.</p>
        <div className="mt-3 divide-y divide-white/[.07]">
          {dataItems.map(item=><div key={item.key} className="flex items-center justify-between gap-3 py-3"><span className="text-sm">{item.label}</span><button onClick={()=>clearData(item.key,item.label)} className="inline-flex items-center gap-2 rounded-lg bg-[#292929] px-3 py-2 text-xs text-white/75 hover:bg-[#383838]"><Trash2 size={14}/>Clear</button></div>)}
          <div className="flex items-center justify-between gap-3 py-3"><span className="text-sm">Playback preferences</span><button onClick={()=>clearData("hf-playback-preferences","Playback preferences")} className="inline-flex items-center gap-2 rounded-lg bg-[#292929] px-3 py-2 text-xs text-white/75 hover:bg-[#383838]"><Trash2 size={14}/>Reset</button></div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/[.07] bg-[#181818] p-5">
        <h2 className="text-lg font-semibold">Backup and restore</h2>
        <p className="mt-1 text-sm text-white/45">Export your HF Tube history, subscriptions, playlists, and playback preferences to a JSON file, or restore them later.</p>
        <div className="mt-4 flex flex-wrap gap-3"><button onClick={exportData} className="inline-flex items-center gap-2 rounded-full bg-[#3ea6ff] px-4 py-2.5 text-sm font-semibold text-black"><Download size={16}/>Export data</button><label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#303030] px-4 py-2.5 text-sm font-semibold hover:bg-[#3a3a3a]"><Upload size={16}/>Import data<input type="file" accept="application/json,.json" onChange={importData} className="hidden"/></label></div>
      </section>
      {message&&<p role="status" className="mt-4 rounded-xl bg-[#17251d] p-3 text-sm text-emerald-200">{message}</p>}
      <p className="mt-7 text-xs leading-5 text-white/30">HF Tube does not offer cross-device sync for local playlists and watch history, or light mode. Public video sources may have their own availability and privacy policies.</p>
    </section>
  </main>;
}
