"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Match {
  id: string;
  slug: string;
  scheduledAt: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  result: string | null;
  round: string | null;
  homeTotem: { country: string; countryCode: string };
  awayTotem: { country: string; countryCode: string };
}

const STATUS_OPTIONS = ["UPCOMING", "LIVE", "FINISHED", "CANCELLED"];
const FLAG_EMOJIS: Record<string, string> = {
  FR: "🇫🇷", SN: "🇸🇳", MA: "🇲🇦", AR: "🇦🇷", BR: "🇧🇷",
  ES: "🇪🇸", DE: "🇩🇪", IT: "🇮🇹", GB: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", NL: "🇳🇱",
};

export default function AdminMatchs() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    status?: string;
    homeScore?: number | string;
    awayScore?: number | string;
    result?: string;
  }>({});
  const adminSecret = typeof window !== "undefined"
    ? (localStorage.getItem("admin_secret") || "changez-ce-secret-en-production")
    : "";

  const headers = { "Content-Type": "application/json", "x-admin-secret": adminSecret };

  useEffect(() => {
    fetch("/api/admin/matches", { headers: { "x-admin-secret": adminSecret } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMatches(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [adminSecret]);

  const startEdit = (match: Match) => {
    setEditing(match.id);
    setEditData({
      status: match.status,
      homeScore: match.homeScore ?? "",
      awayScore: match.awayScore ?? "",
      result: match.result || "",
    });
  };

  const saveEdit = async (id: string) => {
    const body: Record<string, unknown> = { status: editData.status };
    if (editData.status === "FINISHED") {
      body.homeScore = Number(editData.homeScore);
      body.awayScore = Number(editData.awayScore);
      body.result = editData.result;
    }
    const res = await fetch(`/api/admin/matches/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setMatches((prev) => prev.map((m) => m.id === id ? { ...m, ...updated } : m));
    }
    setEditing(null);
  };

  const deleteMatch = async (id: string) => {
    if (!confirm("Supprimer ce match ?")) return;
    const res = await fetch(`/api/admin/matches/${id}`, { method: "DELETE", headers });
    if (res.ok) setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div>
      <h1 className="font-title text-3xl gradient-gold tracking-widest mb-6">GESTION DES MATCHS</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="glass rounded-xl h-16 animate-pulse border border-white/5" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <motion.div
              key={match.id}
              className="glass rounded-xl p-4 border border-white/5"
            >
              {editing === match.id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="bg-[#070B14] border border-[#1E293B] rounded-lg px-3 py-1.5 text-white text-sm outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {editData.status === "FINISHED" && (
                      <>
                        <input
                          type="number" min="0"
                          value={editData.homeScore}
                          onChange={(e) => setEditData({ ...editData, homeScore: e.target.value })}
                          placeholder="Score dom."
                          className="bg-[#070B14] border border-[#1E293B] rounded-lg px-3 py-1.5 text-white text-sm w-24 outline-none"
                        />
                        <span className="text-[#475569]">-</span>
                        <input
                          type="number" min="0"
                          value={editData.awayScore}
                          onChange={(e) => setEditData({ ...editData, awayScore: e.target.value })}
                          placeholder="Score ext."
                          className="bg-[#070B14] border border-[#1E293B] rounded-lg px-3 py-1.5 text-white text-sm w-24 outline-none"
                        />
                        <select
                          value={editData.result}
                          onChange={(e) => setEditData({ ...editData, result: e.target.value })}
                          className="bg-[#070B14] border border-[#1E293B] rounded-lg px-3 py-1.5 text-white text-sm outline-none"
                        >
                          <option value="">Résultat</option>
                          <option value="HOME">Domicile gagne</option>
                          <option value="DRAW">Match nul</option>
                          <option value="AWAY">Extérieur gagne</option>
                        </select>
                      </>
                    )}
                    <button onClick={() => saveEdit(match.id)} className="p-1.5 bg-[#FBBF24]/20 text-[#FBBF24] rounded-lg hover:bg-[#FBBF24]/30 transition-colors">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditing(null)} className="p-1.5 bg-white/5 text-[#94A3B8] rounded-lg hover:bg-white/10 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{FLAG_EMOJIS[match.homeTotem.countryCode] || "🏳️"}</span>
                      <span className="text-sm text-white">{match.homeTotem.country}</span>
                      {match.status === "FINISHED" ? (
                        <span className="font-score text-sm text-[#FBBF24]">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-[#475569] text-sm">vs</span>
                      )}
                      <span className="text-sm text-white">{match.awayTotem.country}</span>
                      <span>{FLAG_EMOJIS[match.awayTotem.countryCode] || "🏳️"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        match.status === "LIVE" ? "bg-[#EF4444]/20 text-[#EF4444]" :
                        match.status === "FINISHED" ? "bg-[#475569]/20 text-[#475569]" :
                        "bg-[#FBBF24]/10 text-[#FBBF24]"
                      }`}>{match.status}</span>
                      <span className="text-xs text-[#475569]">{formatDate(match.scheduledAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(match)} className="p-2 glass rounded-lg text-[#94A3B8] hover:text-[#FBBF24] transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteMatch(match.id)} className="p-2 glass rounded-lg text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
