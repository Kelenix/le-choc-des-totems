"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ban, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  pseudo: string;
  points: number;
  streak: number;
  suspended: boolean;
  createdAt: string;
  _count?: { votes: number };
}

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET || "";

  useEffect(() => {
    fetch("/api/admin/users", { headers: { "x-admin-secret": adminSecret } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [adminSecret]);

  const toggleSuspend = async (user: User) => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
      body: JSON.stringify({ suspended: !user.suspended }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, suspended: !u.suspended } : u));
    }
  };

  return (
    <div>
      <h1 className="font-title text-3xl gradient-gold tracking-widest mb-6">UTILISATEURS</h1>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="glass rounded-xl h-12 animate-pulse border border-white/5" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-[#475569] uppercase tracking-widest border-b border-white/5">
                <th className="text-left py-3 px-4">Pseudo</th>
                <th className="text-left py-3 px-4">Points</th>
                <th className="text-left py-3 px-4">Série</th>
                <th className="text-left py-3 px-4">Votes</th>
                <th className="text-left py-3 px-4">Créé le</th>
                <th className="text-left py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-white/5 ${user.suspended ? "opacity-50" : ""}`}
                >
                  <td className="py-3 px-4 font-medium text-white text-sm">{user.pseudo}</td>
                  <td className="py-3 px-4 font-score text-[#FBBF24] text-sm">{user.points}</td>
                  <td className="py-3 px-4 text-[#EF4444] text-sm">{user.streak}🔥</td>
                  <td className="py-3 px-4 text-[#94A3B8] text-sm">{user._count?.votes || 0}</td>
                  <td className="py-3 px-4 text-[#475569] text-xs">{formatDate(user.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.suspended ? "bg-[#EF4444]/20 text-[#EF4444]" : "bg-[#10B981]/20 text-[#10B981]"}`}>
                      {user.suspended ? "Suspendu" : "Actif"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleSuspend(user)}
                      className={`p-1.5 rounded-lg transition-colors ${user.suspended ? "bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30" : "bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30"}`}
                    >
                      {user.suspended ? <Check size={14} /> : <Ban size={14} />}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
