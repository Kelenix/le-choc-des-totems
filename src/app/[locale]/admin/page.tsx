"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Swords, Trophy, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, matches: 0, votes: 0, points: 0 });

  useEffect(() => {
    fetch("/api/admin/stats", { headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET || "" } })
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setStats(d); })
      .catch(() => {});
  }, []);

  const cards = [
    { icon: Users, label: "Utilisateurs", value: stats.users, color: "#3B82F6" },
    { icon: Swords, label: "Matchs", value: stats.matches, color: "#FBBF24" },
    { icon: TrendingUp, label: "Votes", value: stats.votes, color: "#EF4444" },
    { icon: Trophy, label: "Points distribués", value: stats.points, color: "#10B981" },
  ];

  return (
    <div>
      <h1 className="font-title text-3xl gradient-gold tracking-widest mb-8">TABLEAU DE BORD</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-5 border border-white/5"
          >
            <card.icon size={24} style={{ color: card.color }} className="mb-3" />
            <div className="font-score text-3xl" style={{ color: card.color }}>{card.value}</div>
            <div className="text-[#94A3B8] text-sm mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
