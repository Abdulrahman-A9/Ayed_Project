/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = require("react-player") as any;
import { ArrowRight, Camera, MapPin, User, Calendar, Maximize2, X } from "lucide-react";
import type { AdminMediaAsset } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: "عقارات",
  events: "فعاليات",
  campaigns: "حملات تجارية",
  tourism: "سياحة",
  architecture: "معمار",
  other: "أخرى",
};

interface Props {
  item: AdminMediaAsset;
  brandName: string;
  contactEmail: string;
  related: AdminMediaAsset[];
}

export function ProjectDetailPage({ item, brandName, related }: Props) {
  const [lightbox, setLightbox] = useState(false);
  const isVideo = item.media_type === "video";

  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{ background: "linear-gradient(175deg,#060d1a 0%,#09111d 50%,#0c1624 100%)" }}
    >
      {/* ambient orb */}
      <div className="pointer-events-none absolute left-[-8rem] top-10 h-[22rem] w-[22rem] rounded-full bg-[rgba(241,164,82,0.12)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        {/* ── breadcrumb ── */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-white/40">
          <Link href="/" className="transition hover:text-white">{brandName}</Link>
          <span>/</span>
          <Link href="/#gallery" className="transition hover:text-white">معرض الأعمال</Link>
          <span>/</span>
          <span className="text-white/70">{item.title}</span>
        </nav>

        {/* ── header ── */}
        <div className="mb-8 space-y-4">
          {item.category && (
            <span className="inline-block rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-medium text-[var(--accent)]">
              {CATEGORY_LABELS[item.category] || item.category}
            </span>
          )}
          <h1
            className="text-[2.2rem] font-extrabold leading-tight text-white md:text-5xl"
            style={{ fontFamily: "var(--font-cairo)" }}
          >
            {item.title}
          </h1>
          {/* meta chips */}
          <div className="flex flex-wrap gap-4 text-sm text-white/40">
            {item.project_client && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[var(--accent)]" />
                {item.project_client}
              </span>
            )}
            {item.project_location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[var(--teal,#69d1cc)]" />
                {item.project_location}
              </span>
            )}
            {item.created_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(item.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
              </span>
            )}
          </div>
        </div>

        {/* ── main media ── */}
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-2xl">
          {isVideo ? (
            <div className="aspect-video">
              <ReactPlayer url={item.file_url} controls width="100%" height="100%" />
            </div>
          ) : (
            <div className="relative group cursor-zoom-in" onClick={() => setLightbox(true)}>
              <img
                src={item.file_url}
                alt={item.title}
                className="w-full max-h-[72vh] object-cover"
              />
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20 flex items-center justify-center">
                <Maximize2 className="h-8 w-8 text-white opacity-0 transition group-hover:opacity-80" />
              </div>
            </div>
          )}
        </div>

        {/* ── details grid ── */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* description */}
          <div className="space-y-6">
            {item.description ? (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
                  عن هذا المشروع
                </h2>
                <p className="text-base leading-9 text-white/70">{item.description}</p>
              </div>
            ) : null}

            {/* technical specs */}
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
                تفاصيل تقنية
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "نوع الوسيط", value: isVideo ? "فيديو" : "صورة" },
                  { label: "الحجم", value: `${(item.size_bytes / (1024 * 1024)).toFixed(1)} MB` },
                  item.width && item.height ? { label: "الأبعاد", value: `${item.width} × ${item.height}` } : null,
                  item.duration_seconds ? { label: "المدة", value: `${Math.floor(item.duration_seconds / 60)}:${String(item.duration_seconds % 60).padStart(2, "0")} دقيقة` } : null,
                ]
                  .filter(Boolean)
                  .map((spec) => spec && (
                    <div key={spec.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-[10px] uppercase tracking-widest text-white/30">{spec.label}</p>
                      <p className="mt-1 text-sm font-medium text-white">{spec.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* CTA card */}
          <div className="h-fit rounded-[1.75rem] border border-white/[0.08] bg-white/[0.02] p-7 space-y-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/15">
              <Camera className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="font-semibold text-white" style={{ fontFamily: "var(--font-cairo)" }}>
                جاهز لمشروع مماثل؟
              </p>
              <p className="mt-2 text-sm leading-7 text-white/50">
                تواصل معنا لنناقش رؤيتك وكيفية تحويلها إلى لقطات جوية سينمائية احترافية.
              </p>
            </div>
            <Link
              href="/#contact"
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[var(--accent-soft)] hover:scale-[1.02]"
            >
              احجز مشروعك الآن
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/#gallery" className="block text-center text-xs text-white/30 transition hover:text-white/60">
              ← العودة للمعرض
            </Link>
          </div>
        </div>

        {/* ── related projects ── */}
        {related.length > 0 && (
          <div className="mt-16 space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
              مشاريع ذات صلة
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => (
                <Link key={rel.id} href={`/project/${rel.id}`} className="group block overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.02] transition hover:border-white/20">
                  {rel.media_type === "image" ? (
                    <img src={rel.file_url} alt={rel.title} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-black/40">
                      <ReactPlayer url={rel.file_url} width="100%" height="100%" light />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm font-semibold text-white">{rel.title}</p>
                    {rel.category && <p className="mt-1 text-[11px] text-white/40">{CATEGORY_LABELS[rel.category] || rel.category}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── lightbox ── */}
      {lightbox && !isVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setLightbox(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <img src={item.file_url} alt={item.title} className="max-h-[92vh] max-w-full rounded-[1.5rem] object-contain shadow-2xl" />
        </div>
      )}
    </main>
  );
}
