"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Pencil, X, Save, AlertTriangle } from "lucide-react";
import { Flag } from "@/components/ui/Flag";

interface TeamEntry {
  totem: { country: string; countryCode: string };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDiff: number;
  points: number;
}

interface GroupMatch {
  id: string;
  slug: string;
}

interface Group {
  letter: string;
  teams: TeamEntry[];
  matches: GroupMatch[];
}

interface Totem {
  id: string;
  country: string;
  countryCode: string;
  animal: string;
}

const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function AdminGroupes() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [totems, setTotems] = useState<Totem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editCodes, setEditCodes] = useState<[string, string, string, string]>([
    "",
    "",
    "",
    "",
  ]);
  const [saving, setSaving] = useState(false);

  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET || "";

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/groups").then((r) => r.json()),
      fetch("/api/totems").then((r) => r.json()),
    ])
      .then(([g, t]) => {
        if (Array.isArray(g)) setGroups(g);
        if (Array.isArray(t)) setTotems(t);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  // countryCodes déjà placés dans un autre groupe que celui en cours d'édition
  const lockedCodes = useMemo(() => {
    const set = new Set<string>();
    for (const g of groups) {
      if (g.letter === editing) continue;
      for (const t of g.teams) set.add(t.totem.countryCode);
    }
    return set;
  }, [groups, editing]);

  const startEdit = (g: Group) => {
    const codes = g.teams.map((t) => t.totem.countryCode);
    while (codes.length < 4) codes.push("");
    setEditCodes([codes[0], codes[1], codes[2], codes[3]] as [
      string,
      string,
      string,
      string,
    ]);
    setEditing(g.letter);
    setMsg(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setMsg(null);
  };

  const saveGroup = async () => {
    if (!editing) return;

    const codes = editCodes.filter(Boolean);
    if (codes.length !== 4 || new Set(codes).size !== 4) {
      setMsg("❌ Sélectionne 4 équipes uniques");
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/groups/${editing}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ teamCodes: editCodes }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(
          `✅ Groupe ${editing} mis à jour — ${data.created} matchs recréés`
        );
        setEditing(null);
        loadAll();
      } else {
        setMsg(`❌ ${data.error ?? "Erreur"}`);
      }
    } catch (e) {
      setMsg(`❌ ${e instanceof Error ? e.message : "Erreur inconnue"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReseed = async () => {
    if (
      !confirm(
        "⚠️ Cela va SUPPRIMER tous les matchs et votes actuels, puis recréer le calendrier officiel des 12 groupes. Continuer ?"
      )
    )
      return;
    setReseeding(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/seed-worldcup", {
        method: "POST",
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✅ ${data.matchCount} matchs créés avec succès`);
        loadAll();
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch (e) {
      setMsg(`❌ ${e instanceof Error ? e.message : "Erreur inconnue"}`);
    } finally {
      setReseeding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-title text-3xl gradient-gold tracking-widest">
          GROUPES — COUPE DU MONDE 2026
        </h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleReseed}
          disabled={reseeding}
          className="flex items-center gap-2 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 rounded-xl px-4 py-2 text-sm hover:bg-[#EF4444]/25 disabled:opacity-50"
        >
          <RefreshCw size={14} className={reseeding ? "animate-spin" : ""} />
          {reseeding ? "Génération..." : "Régénérer tout"}
        </motion.button>
      </div>

      {msg && (
        <div className="glass rounded-xl p-4 mb-6 border border-[#FBBF24]/20">
          <p className="text-sm">{msg}</p>
        </div>
      )}

      <div className="glass rounded-xl p-4 mb-6 border border-[#3B82F6]/20 flex items-start gap-3">
        <AlertTriangle size={18} className="text-[#3B82F6] shrink-0 mt-0.5" />
        <p className="text-sm text-[#94A3B8]">
          Clique sur l&apos;icône <Pencil size={12} className="inline mx-1 text-[#FBBF24]" />
          d&apos;un groupe pour modifier sa composition. Les 6 matchs du groupe seront
          régénérés selon le calendrier officiel FIFA. Les résultats (gérés
          dans <strong>Matchs</strong>) mettent à jour automatiquement le
          classement.
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {GROUP_LETTERS.map((letter) => {
            const g =
              groups.find((x) => x.letter === letter) ?? {
                letter,
                teams: [],
                matches: [],
              };
            const isEditing = editing === letter;

            return (
              <div
                key={letter}
                className={`glass rounded-xl overflow-hidden border ${
                  isEditing
                    ? "border-[#FBBF24]/40 shadow-[0_0_30px_-12px_rgba(251,191,36,0.4)]"
                    : "border-transparent"
                }`}
              >
                <div className="flex items-center justify-between p-3 border-b border-white/5">
                  <h2 className="font-title text-xl tracking-widest text-[#FBBF24]">
                    Groupe {letter}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#475569]">
                      {g.matches.length} matchs
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(g as Group)}
                        className="p-1.5 rounded-md hover:bg-white/10 text-[#94A3B8] hover:text-[#FBBF24] transition"
                        title="Modifier la composition"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 space-y-2"
                    >
                      <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">
                        Pos 1 / Pos 2 / Pos 3 / Pos 4 (calendrier FIFA)
                      </p>
                      {[0, 1, 2, 3].map((pos) => (
                        <select
                          key={pos}
                          value={editCodes[pos]}
                          onChange={(e) => {
                            const next = [...editCodes] as [
                              string,
                              string,
                              string,
                              string,
                            ];
                            next[pos] = e.target.value;
                            setEditCodes(next);
                          }}
                          className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#FBBF24]/50 outline-none"
                        >
                          <option value="">— Position {pos + 1} —</option>
                          {totems.map((t) => {
                            const usedInOther = lockedCodes.has(t.countryCode);
                            const usedInThis =
                              editCodes.includes(t.countryCode) &&
                              editCodes[pos] !== t.countryCode;
                            const disabled = usedInOther || usedInThis;
                            return (
                              <option
                                key={t.id}
                                value={t.countryCode}
                                disabled={disabled}
                              >
                                {t.country} {usedInOther ? "(déjà placé)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      ))}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveGroup}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 rounded-lg px-3 py-2 text-sm hover:bg-[#FBBF24]/25 disabled:opacity-50"
                        >
                          <Save size={14} />
                          {saving ? "Sauvegarde..." : "Enregistrer"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="flex items-center justify-center gap-2 bg-white/5 text-[#94A3B8] border border-white/10 rounded-lg px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
                        >
                          <X size={14} />
                          Annuler
                        </button>
                      </div>
                      <p className="text-[10px] text-[#EF4444]/70 leading-relaxed pt-1">
                        ⚠️ Enregistrer supprimera les 6 matchs actuels du
                        groupe {letter} et leurs votes.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.table
                      key="table"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full text-xs"
                    >
                      <thead className="text-[10px] text-[#475569] uppercase">
                        <tr>
                          <th className="text-left py-2 pl-3">#</th>
                          <th className="text-left py-2">Équipe</th>
                          <th className="text-center py-2 w-8">J</th>
                          <th className="text-center py-2 w-10">+/-</th>
                          <th className="text-center py-2 w-8 text-[#FBBF24]">
                            Pts
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.teams.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-6 text-[#475569] italic"
                            >
                              Aucun match — clique sur ✏️ pour configurer
                            </td>
                          </tr>
                        ) : (
                          g.teams.map((t, i) => (
                            <tr
                              key={t.totem.countryCode}
                              className="border-t border-white/5"
                            >
                              <td className="py-2 pl-3 text-[#475569]">
                                {i + 1}
                              </td>
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <Flag code={t.totem.countryCode} size="xs" />
                                  <span className="text-white truncate">
                                    {t.totem.country}
                                  </span>
                                </div>
                              </td>
                              <td className="text-center text-[#94A3B8]">
                                {t.played}
                              </td>
                              <td className="text-center text-[#94A3B8]">
                                {t.goalDiff > 0 ? "+" : ""}
                                {t.goalDiff}
                              </td>
                              <td className="text-center font-score text-[#FBBF24]">
                                {t.points}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </motion.table>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
