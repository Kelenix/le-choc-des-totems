"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MatchCard } from "@/components/match/MatchCard";
import type { MatchWithVote } from "@/types";
import { useUserStore } from "@/store/userStore";

export function UpcomingMatches() {
  const [matches, setMatches] = useState<MatchWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const { id: userId } = useUserStore();

  useEffect(() => {
    fetch("/api/matches?limit=10")
      .then((r) => r.json())
      .then(async (data: MatchWithVote[]) => {
        if (!Array.isArray(data)) return;

        // Fetch user votes if logged in
        if (userId) {
          const enriched = await Promise.all(
            data.map(async (match) => {
              try {
                const vr = await fetch(`/api/votes?userId=${userId}&matchId=${match.id}`);
                const vote = await vr.json();
                return { ...match, userVote: vote };
              } catch {
                return match;
              }
            })
          );
          setMatches(enriched);
        } else {
          setMatches(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-40 bg-[#1E293B] rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl h-32 animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-title text-2xl tracking-wider gradient-gold mb-4">PROCHAINS DUELS</h2>
      <div className="space-y-3">
        {matches.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-[#475569] border border-white/5">
            Aucun match programmé pour le moment
          </div>
        ) : (
          matches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
