"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Requis"),
  country: z.string().min(1, "Requis"),
  countryCode: z.string().length(2, "2 lettres"),
  animal: z.string().min(1, "Requis"),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Totem {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  animal: string;
}

export default function AdminTotems() {
  const [totems, setTotems] = useState<Totem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const adminSecret = typeof window !== "undefined"
    ? (localStorage.getItem("admin_secret") || "changez-ce-secret-en-production")
    : "";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    fetch("/api/admin/totems", { headers: { "x-admin-secret": adminSecret } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTotems(data); })
      .catch(() => {});
  }, [adminSecret]);

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/admin/totems", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
      body: JSON.stringify({ ...data, countryCode: data.countryCode.toUpperCase() }),
    });
    if (res.ok) {
      const totem = await res.json();
      setTotems((prev) => [...prev, totem]);
      reset();
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-title text-3xl gradient-gold tracking-widest">TOTEMS</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30 rounded-xl px-4 py-2 text-sm hover:bg-[#FBBF24]/30 transition-all"
        >
          <Plus size={16} />
          Nouveau Totem
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 border border-[#FBBF24]/20 mb-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            {[
              { name: "name" as const, label: "Nom du totem" },
              { name: "country" as const, label: "Pays" },
              { name: "countryCode" as const, label: "Code pays (2 lettres)" },
              { name: "animal" as const, label: "Animal" },
              { name: "imageUrl" as const, label: "URL image (optionnel)" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs text-[#94A3B8] mb-1 block">{field.label}</label>
                <input
                  {...register(field.name)}
                  className="w-full bg-[#070B14] border border-[#1E293B] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#FBBF24]"
                />
                {errors[field.name] && (
                  <p className="text-[#EF4444] text-xs mt-0.5">{errors[field.name]?.message}</p>
                )}
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-xs text-[#94A3B8] mb-1 block">Description (optionnel)</label>
              <textarea
                {...register("description")}
                rows={2}
                className="w-full bg-[#070B14] border border-[#1E293B] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#FBBF24] resize-none"
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="bg-[#FBBF24] text-black font-bold px-6 py-2 rounded-xl text-sm">
                Créer
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="glass border border-white/10 text-[#94A3B8] px-6 py-2 rounded-xl text-sm">
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {totems.map((totem, i) => (
          <motion.div
            key={totem.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 border border-white/5 text-center"
          >
            <Shield size={24} className="text-[#FBBF24] mx-auto mb-2" />
            <div className="font-title text-sm text-white">{totem.name}</div>
            <div className="text-xs text-[#94A3B8] mt-1">{totem.country} ({totem.countryCode})</div>
            <div className="text-xs text-[#475569] mt-0.5">{totem.animal}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
