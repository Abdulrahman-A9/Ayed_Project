/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useForm } from "react-hook-form";
import ReactPlayer from "react-player";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Camera,
  CirclePlay,
  Film,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plane,
  Quote,
  Sparkles,
  Star,
  Users,
  Video,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { submitContactForm } from "@/lib/public-api";
import type { ContactFormFields, PortfolioPayload } from "@/lib/types";

function Reveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.section>
  );
}

function SectionDivider() {
  return (
    <div className="relative flex items-center justify-center py-2">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10 flex items-center gap-2">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--accent)]/50" />
        <span className="h-1.5 w-1.5 rotate-45 rounded-sm bg-[var(--accent)] shadow-[0_0_8px_2px_rgba(241,164,82,0.45)]" />
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--accent)]/50" />
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs tracking-[0.12em] text-[var(--accent-soft)]">{eyebrow}</p>
      <h2 className="headline text-[1.85rem] leading-tight text-white md:text-5xl">{title}</h2>
      <p className="text-base leading-9 text-[var(--muted)]">{copy}</p>
    </div>
  );
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  camera: Camera,
  building: Building2,
  calendar: CalendarCheck,
  plane: Plane,
  users: Users,
  film: Film,
  globe: Globe,
  zap: Zap,
  sparkles: Sparkles,
  map_pin: MapPin,
  video: Video,
};

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: "عقارات",
  events: "فعاليات",
  campaigns: "حملات تجارية",
  tourism: "سياحة",
  architecture: "معمار",
  other: "أخرى",
};

export function PublicPortfolioPage({ portfolio }: { portfolio: PortfolioPayload }) {
  const { scrollYProgress } = useScroll();
  const orbShift = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<string>("all");
  const [contactState, setContactState] = useState<"idle" | "success" | "error">("idle");
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContactFormFields>();

  const stats = useMemo(
    () => [
      { label: "مقطع جوي", value: String(portfolio.videos.length).padStart(2, "0") },
      { label: "صورة احترافية", value: String(portfolio.images.length).padStart(2, "0") },
      { label: "تقييم عميل", value: String(portfolio.testimonials.length).padStart(2, "0") },
    ],
    [portfolio.images.length, portfolio.testimonials.length, portfolio.videos.length],
  );

  const galleryCategories = useMemo(() => {
    const cats = portfolio.images.map((img) => img.category || "").filter(Boolean);
    return [...new Set(cats)];
  }, [portfolio.images]);

  const filteredImages = useMemo(() => {
    if (galleryFilter === "all") return portfolio.images;
    return portfolio.images.filter((img) => (img.category || "") === galleryFilter);
  }, [portfolio.images, galleryFilter]);

  const onSubmit = handleSubmit(async (values) => {
    setContactState("idle");
    try {
      await submitContactForm(values);
      setContactState("success");
      reset();
    } catch {
      setContactState("error");
    }
  });

  return (
    <main className="relative overflow-hidden text-white">
      <motion.div style={{ y: orbShift }} className="pointer-events-none absolute left-[-10rem] top-10 h-[26rem] w-[26rem] rounded-full bg-[rgba(241,164,82,0.15)] blur-3xl" />
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -160]) }} className="pointer-events-none absolute right-[-8rem] top-[30rem] h-[30rem] w-[30rem] rounded-full bg-[rgba(105,209,204,0.14)] blur-3xl" />
      <div className="mesh-overlay pointer-events-none absolute inset-0 opacity-50" />

      {portfolio.announcements[0] ? (
        <div className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-3 text-center text-sm text-[var(--accent-soft)]">
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.08em]">
              {portfolio.announcements[0].badge || "إعلان"}
            </span>
            <span>{portfolio.announcements[0].title}</span>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(5,10,20,0.6)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs tracking-[0.1em] text-[var(--accent-soft)]">محفظة أعمال جوية</p>
            <p className="headline text-2xl">{portfolio.brand_name}</p>
          </div>
          <nav className="hide-scrollbar flex max-w-[70vw] gap-5 overflow-x-auto text-sm text-[var(--muted)]">
            {[
              ["من نحن", "about"],
              ["الخدمات", "services"],
              ["معرض الصور", "gallery"],
              ["الأفلام", "films"],
              ["التقييمات", "reviews"],
              ["تواصل", "contact"],
            ].map(([label, href]) => (
              <a key={href} href={`#${href}`} className="whitespace-nowrap transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-7xl flex-col justify-center px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.08em] text-[var(--accent-soft)]">
                <Sparkles className="h-4 w-4" />
                {portfolio.tagline}
              </span>
              <div className="space-y-5">
                <h1 className="headline max-w-3xl text-[2.6rem] leading-[1.25] md:text-[3.75rem]">{portfolio.hero_title}</h1>
                <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">{portfolio.hero_subtitle}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15 }} className="flex flex-wrap gap-4">
              <a href="#films" className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-[var(--accent-soft)]">
                شاهد أحدث عمل
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3 font-semibold transition hover:border-white/25 hover:bg-white/8">
                احجز مشروعاً
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25 }} className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="glass-panel rounded-[1.75rem] p-5">
                  <p className="headline text-5xl text-white">{stat.value}</p>
                  <p className="mt-2 text-sm tracking-[0.08em] text-[var(--muted)]">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative">
            <div className="glass-panel relative overflow-hidden rounded-[2.5rem] p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
              <div className="relative grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/20">
                  {portfolio.videos[0] ? (
                    <div className="aspect-[4/5] overflow-hidden">
                      <ReactPlayer src={portfolio.videos[0].file_url} controls width="100%" height="100%" playing muted loop />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 bg-[linear-gradient(180deg,rgba(105,209,204,0.12),rgba(0,0,0,0))] p-8 text-center">
                      <CirclePlay className="h-14 w-14 text-[var(--accent)]" />
                      <div>
                        <p className="headline text-4xl">رِيلك السينمائي يعيش هنا</p>
                        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">ارفع أول فيديو رئيسي من لوحة التحكم لإحياء هذا القسم فوراً.</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {portfolio.images.slice(0, 2).map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveImage(item.file_url)}
                      className="group relative block aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10 text-left"
                    >
                      <img src={item.file_url} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading={index === 0 ? "eager" : "lazy"} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <p className="text-sm tracking-[0.08em] text-[var(--accent-soft)]">معرض الصور</p>
                        <p className="headline text-2xl">{item.title}</p>
                      </div>
                    </button>
                  ))}
                  {portfolio.images.length === 0 ? (
                    <div className="section-shell flex aspect-[4/3] items-end rounded-[1.75rem] p-5">
                      <div>
                        <p className="text-xs tracking-[0.12em] text-[var(--teal)]">صور مختارة</p>
                        <p className="headline text-3xl">شبكة الصور الجاهزة</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-0 px-6 pb-20">
        <Reveal id="about" className="grid gap-8 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <SectionHeading eyebrow="من نحن" title={portfolio.about_title} copy={portfolio.about_body} />
          <div className="section-shell rounded-[2rem] p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs tracking-[0.12em] text-[var(--accent-soft)]">موقعنا</p>
                <p className="mt-3 text-xl text-white">{portfolio.base_city || "الرياض، المملكة العربية السعودية"}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.12em] text-[var(--accent-soft)]">التخصص</p>
                <p className="mt-3 text-xl text-white">سرد القصص جوياً</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm leading-8 text-[var(--muted)]">
                  كل لقطة مُخطَّطة لتُجسّد الجمال والاتساع والحركة — من حملات السياحة وعروض العقارات إلى تغطية الفعاليات والمحتوى السينمائي لمنصات التواصل.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <SectionDivider />

        <Reveal id="services" className="space-y-10 py-16">
          <SectionHeading eyebrow="الخدمات" title={portfolio.services_title} copy="مُصمَّمة للعملاء الذين يتوقعون إنتاجاً جوياً متقناً وتشطيباً فاخراً وأثراً بصرياً لا يُنسى." />
          <div className="grid gap-5 lg:grid-cols-3">
            {portfolio.services.map((service, index) => (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="section-shell rounded-[2rem] p-7"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(241,164,82,0.16)] text-[var(--accent)]">
                  {(() => { const Icon = SERVICE_ICONS[service.icon || "camera"] ?? Camera; return <Icon className="h-5 w-5" />; })()}
                </div>
                <h3 className="headline text-3xl text-white">{service.title}</h3>
                <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{service.description}</p>
              </motion.article>
            ))}
          </div>
        </Reveal>

        <SectionDivider />

        <Reveal id="gallery" className="space-y-10 py-16">
          <SectionHeading eyebrow="مكتبة الصور" title="معرض يمنحك شعوراً بالاتساع." copy="بلاطات الصور المحمّلة تدريجياً تحافظ على الأداء مع توفير تجربة تصفح فاخرة وسلسة." />

          {/* ── category filter ── */}
          {galleryCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setGalleryFilter("all")}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                  galleryFilter === "all"
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
                }`}
              >
                الكل
              </button>
              {galleryCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGalleryFilter(cat)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    galleryFilter === cat
                      ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredImages.length > 0 ? (
              filteredImages.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setActiveImage(image.file_url)}
                    className="block w-full text-left"
                  >
                    <img src={image.file_url} alt={image.title} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105 group-hover:rotate-[1deg]" />
                  </button>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
                    <div className="pointer-events-none">
                      {image.category ? (
                        <span className="mb-1 inline-block rounded-full bg-[var(--accent)]/20 px-2.5 py-0.5 text-[10px] font-medium text-[var(--accent-soft)]">
                          {CATEGORY_LABELS[image.category] || image.category}
                        </span>
                      ) : null}
                      <p className="headline text-3xl">{image.title}</p>
                    </div>
                    <Link
                      href={`/project/${image.id}`}
                      className="z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-medium text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white"
                    >
                      تفاصيل
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="section-shell flex aspect-[4/5] items-end rounded-[2rem] p-6">
                  <div>
                    <p className="text-xs tracking-[0.12em] text-[var(--accent-soft)]">في انتظار الرفع</p>
                    <p className="headline text-4xl">مكان معرض {index + 1}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Reveal>

        <SectionDivider />

        <Reveal id="films" className="space-y-10 py-16">
          <SectionHeading eyebrow="مكتبة الأفلام" title="مشاهدة مباشرة بجودة كاملة." copy="تُبَثّ الفيديوهات مباشرةً من التخزين السحابي حتى يتمكن العملاء من تقييم الجودة الحقيقية للعمل دون ضغط أو تقليص." />
          <div className="grid gap-6 xl:grid-cols-2">
            {portfolio.videos.length > 0 ? (
              portfolio.videos.map((video) => (
                <article key={video.id} className="section-shell overflow-hidden rounded-[2rem] p-4">
                  <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40">
                    <div className="aspect-video">
                      <ReactPlayer src={video.file_url} controls width="100%" height="100%" />
                    </div>
                  </div>
                  <div className="space-y-3 px-2 py-5">
                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-[var(--accent-soft)]">
                      <span>{(video.size_bytes / (1024 * 1024)).toFixed(0)} MB</span>
                      {video.duration_seconds ? <span>{Math.floor(video.duration_seconds / 60)} min</span> : null}
                    </div>
                    <h3 className="headline text-3xl">{video.title}</h3>
                    <p className="text-sm leading-7 text-[var(--muted)]">{video.description || "عرض جوي عالي الدقة."}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="section-shell flex min-h-80 items-center justify-center rounded-[2rem] p-10 text-center">
                <div>
                  <p className="headline text-5xl">أرفف الفيديو جاهزة.</p>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">بمجرد رفع أول مقطع جوي من لوحة التحكم، سيظهر هنا تلقائياً مع تشغيل مباشر.</p>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        <SectionDivider />

        <Reveal id="reviews" className="space-y-10 py-16">
          <SectionHeading eyebrow="التقييمات" title="موثوق به من عملاء يُقدّرون الحرفية البصرية." copy="شهادات موجزة وذات مصداقية تمنح الصفحة ثقةً دون ازدحام في التجربة." />
          <div className="grid gap-5 lg:grid-cols-3">
            {portfolio.testimonials.map((testimonial) => (
              <article key={testimonial.id} className="section-shell rounded-[2rem] p-7">
                <Quote className="h-8 w-8 text-[var(--accent)]" />
                <p className="mt-6 text-base leading-8 text-white/88">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-1 text-[var(--accent-soft)]">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3">
                  {testimonial.client_photo_url ? (
                    <img src={testimonial.client_photo_url} alt={testimonial.client_name} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/10" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-base font-bold text-[var(--accent)]">
                      {testimonial.client_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{testimonial.client_name}</p>
                    <p className="text-sm text-[var(--muted)]">{testimonial.client_role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <SectionDivider />

        <Reveal id="contact" className="grid gap-8 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="space-y-6">
            <SectionHeading eyebrow="تواصل معنا" title="حوّل الموقع القادم إلى لقطة بصرية لا تُنسى." copy="سيُخزَّن كل استفسار في لوحة التحكم مع إشعار بريدي فوري للحفاظ على تدفق احترافي من أول رسالة." />
            <div className="space-y-4 text-sm text-[var(--muted)]">
              <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-[var(--accent)]" /> {portfolio.contact_email || "hello@example.com"}</p>
              <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[var(--accent)]" /> {portfolio.contact_phone || "+966 5X XXX XXXX"}</p>
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[var(--accent)]" /> {portfolio.base_city || "المملكة العربية السعودية"}</p>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-7">
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/30" placeholder="اسمك الكامل" {...register("name", { required: true })} />
                <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/30" placeholder="البريد الإلكتروني" type="email" {...register("email", { required: true })} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/30" placeholder="رقم الجوال" {...register("phone")} />
                <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/30" placeholder="موضوع المشروع" {...register("subject")} />
              </div>
              <textarea className="min-h-40 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/30" placeholder="أخبرني عن الموقع والهدف والجدول الزمني." {...register("message", { required: true })} />
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.01] hover:bg-[var(--accent-soft)] disabled:opacity-60">
                {isSubmitting ? "جارٍ الإرسال..." : "إرسال الاستفسار"}
              </button>
              {contactState === "success" ? <p className="text-sm text-[var(--teal)]">تم إرسال رسالتك بنجاح.</p> : null}
              {contactState === "error" ? <p className="text-sm text-[var(--rose)]">تعذّر إرسال الرسالة في الوقت الراهن.</p> : null}
            </form>
          </div>
        </Reveal>
      </div>

      {/* ══════════ PROFESSIONAL FOOTER ══════════ */}
      <footer className="relative z-10 mt-8 overflow-hidden border-t border-white/[0.06]">
        {/* background layers */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-[#060d1a]/95 to-[#060d1a]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(241,164,82,0.04),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-0">
          {/* ── top 3-col grid ── */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">

            {/* col 1 — brand */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/30">
                  <Camera className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <span className="headline text-2xl">{portfolio.brand_name}</span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                نحوّل كل مشروع إلى لقطة جوية احترافية تحكي قصة مميزة بعين الطائرة المسيّرة.
              </p>
              {/* social icons */}
              <div className="flex flex-wrap gap-3 pt-1">
                {portfolio.instagram_url && (
                  <a href={portfolio.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="إنستغرام"
                    className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all duration-200 hover:bg-[#e1306c]/15 hover:ring-[#e1306c]/40 hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[var(--muted)] transition-colors group-hover:text-[#e1306c]">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {portfolio.youtube_url && (
                  <a href={portfolio.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="يوتيوب"
                    className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all duration-200 hover:bg-[#ff0000]/15 hover:ring-[#ff0000]/40 hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[var(--muted)] transition-colors group-hover:text-[#ff0000]">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
                {portfolio.tiktok_url && (
                  <a href={portfolio.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="تيك توك"
                    className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all duration-200 hover:bg-white/10 hover:ring-white/30 hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[var(--muted)] transition-colors group-hover:text-white">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                )}
                {portfolio.whatsapp_url && (
                  <a href={portfolio.whatsapp_url} target="_blank" rel="noopener noreferrer" aria-label="واتساب"
                    className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all duration-200 hover:bg-[#25d366]/15 hover:ring-[#25d366]/40 hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[var(--muted)] transition-colors group-hover:text-[#25d366]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                  </a>
                )}
                {portfolio.twitter_url && (
                  <a href={portfolio.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="تويتر / X"
                    className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all duration-200 hover:bg-white/10 hover:ring-white/30 hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[var(--muted)] transition-colors group-hover:text-white">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {portfolio.snapchat_url && (
                  <a href={portfolio.snapchat_url} target="_blank" rel="noopener noreferrer" aria-label="سناب شات"
                    className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all duration-200 hover:bg-[#fffc00]/10 hover:ring-[#fffc00]/30 hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[var(--muted)] transition-colors group-hover:text-[#fffc00]">
                      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.317 4.187-.01.143.01.156.116.116.05 0 .1-.006.15-.015.157-.03.315-.057.43-.06.344-.025.866.16 1.107.38.236.216.267.5-.026.671-.278.163-1.357.532-1.43.56-.03.012-.043.015-.05.04-.035.14-.093.408-.108.48-.05.235-.168.265-.312.25-.12-.013-.25-.063-.396-.085-.117-.02-.23-.025-.35-.025-.25 0-.553.117-.785.343-.39.388-.536.916-.542.942-.006.027-.002.063.02.083 1.065 1.029 2.53 2.89 4.47 3.567.134.046.21.085.21.157 0 .14-.272.285-.677.392-.393.103-1.017.13-1.664.26-.19.037-.283.1-.367.215-.067.09-.063.19-.2.253-.133.06-.432.12-.48.12-.074 0-.108-.013-.15-.04-.02-.012-.01-.018.034-.013.197.017.38-.087.38-.087S16.9 19.5 12 19.5s-4.9-.5-4.9-.5.184.104.38.087c.044-.005.054.001.035.013-.042.027-.077.04-.15.04-.048 0-.347-.06-.48-.12-.137-.063-.133-.163-.2-.253-.084-.115-.177-.178-.367-.215-.647-.13-1.27-.157-1.664-.26-.405-.107-.677-.252-.677-.392 0-.072.076-.111.21-.157 1.94-.677 3.405-2.538 4.47-3.567.022-.02.026-.056.02-.083-.006-.026-.152-.554-.542-.942-.232-.226-.535-.343-.785-.343-.12 0-.233.005-.35.025-.146.022-.276.072-.396.085-.144.015-.262-.015-.312-.25-.015-.072-.073-.34-.108-.48-.007-.025-.02-.028-.05-.04-.073-.028-1.152-.397-1.43-.56-.293-.171-.262-.455-.026-.671.241-.22.763-.405 1.107-.38.115.003.273.03.43.06.05.009.1.015.15.015.106 0 .13-.01.116-.116-.086-.968-.212-2.994.317-4.187C7.86 1.069 11.216.793 12.206.793z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* col 2 — quick links */}
            <div className="space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">روابط سريعة</h3>
              <ul className="space-y-3">
                {[
                  { href: "#work",     label: "الأعمال" },
                  { href: "#services", label: "الخدمات" },
                  { href: "#reviews",  label: "التقييمات" },
                  { href: "#contact",  label: "التواصل" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <a href={href}
                      className="group flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-white">
                      <span className="h-px w-4 bg-[var(--muted)] transition-all duration-300 group-hover:w-6 group-hover:bg-[var(--accent)]" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* col 3 — contact */}
            <div className="space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">تواصل معنا</h3>
              <ul className="space-y-4">
                {portfolio.contact_email && (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/20">
                      <Mail className="h-3.5 w-3.5 text-[var(--accent)]" />
                    </span>
                    <a href={`mailto:${portfolio.contact_email}`}
                      className="break-all text-sm text-[var(--muted)] transition-colors hover:text-white">
                      {portfolio.contact_email}
                    </a>
                  </li>
                )}
                {portfolio.contact_phone && (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--teal)]/10 ring-1 ring-[var(--teal)]/20">
                      <Phone className="h-3.5 w-3.5 text-[var(--teal)]" />
                    </span>
                    <a href={`tel:${portfolio.contact_phone}`}
                      className="text-sm text-[var(--muted)] transition-colors hover:text-white" dir="ltr">
                      {portfolio.contact_phone}
                    </a>
                  </li>
                )}
                {portfolio.base_city && (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--rose)]/10 ring-1 ring-[var(--rose)]/20">
                      <MapPin className="h-3.5 w-3.5 text-[var(--rose)]" />
                    </span>
                    <span className="text-sm text-[var(--muted)]">{portfolio.base_city}، المملكة العربية السعودية</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* ── divider ── */}
          <div className="mt-14 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* ── bottom bar ── */}
          <div className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-[var(--muted)] sm:flex-row">
            <span>© {new Date().getFullYear()} {portfolio.brand_name}. جميع الحقوق محفوظة.</span>
            <span className="flex items-center gap-1.5">
              صُنع بـ
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              من فريق آيد للتصوير الجوي
            </span>
          </div>
        </div>
      </footer>

      {activeImage ? (
        <button
          type="button"
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl"
        >
          <img src={activeImage} alt="Expanded gallery item" className="max-h-full max-w-full rounded-[1.5rem] object-contain" />
        </button>
      ) : null}
    </main>
  );
}