/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Bell,
  Building2,
  CalendarCheck,
  Camera,
  CheckCircle2,
  Film,
  Globe,
  ImagePlus,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Plane,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  Video,
  Zap,
} from "lucide-react";

import { adminApi, clearAccessToken, getAccessToken, getCurrentUser, logout } from "@/lib/api-client";
import { demoPortfolio } from "@/lib/demo-content";
import type {
  AdminAnnouncement,
  AdminMediaAsset,
  ContactSubmission,
  PortfolioPayload,
  PortfolioSite,
  Service,
  Testimonial,
} from "@/lib/types";

type TabKey = "overview" | "site" | "services" | "media" | "testimonials" | "announcements" | "contacts";

type SiteFields = Omit<PortfolioSite, "id">;
type ServiceFields = Omit<Service, "id">;
type TestimonialFields = Omit<Testimonial, "id">;
type AnnouncementFields = Omit<AdminAnnouncement, "id">;
type MediaEditFields = { title: string; description: string; category: string; project_client: string; project_location: string };

const SERVICE_ICON_CHOICES: { value: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "camera", label: "كاميرا", Icon: Camera },
  { value: "building", label: "عقارات", Icon: Building2 },
  { value: "calendar", label: "فعاليات", Icon: CalendarCheck },
  { value: "plane", label: "طيران", Icon: Plane },
  { value: "users", label: "أشخاص", Icon: Users },
  { value: "film", label: "أفلام", Icon: Film },
  { value: "globe", label: "دولي", Icon: Globe },
  { value: "zap", label: "طاقة", Icon: Zap },
  { value: "sparkles", label: "مميز", Icon: Sparkles },
  { value: "map_pin", label: "مواقع", Icon: MapPin },
  { value: "video", label: "فيديو", Icon: Video },
];

const MEDIA_CATEGORY_OPTIONS = [
  { value: "", label: "— بدون تصنيف —" },
  { value: "real_estate", label: "عقارات" },
  { value: "events", label: "فعاليات" },
  { value: "campaigns", label: "حملات تجارية" },
  { value: "tourism", label: "سياحة" },
  { value: "architecture", label: "معمار" },
  { value: "other", label: "أخرى" },
];

type UploadQueueItem = {
  fileName: string;
  progress: number;
  state: "uploading" | "done" | "error";
};

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { key: "site", label: "إعدادات الموقع", icon: Settings },
  { key: "services", label: "الخدمات", icon: Film },
  { key: "media", label: "الوسائط", icon: Upload },
  { key: "testimonials", label: "التقييمات", icon: Star },
  { key: "announcements", label: "الإعلانات", icon: Bell },
  { key: "contacts", label: "الاستفسارات", icon: MessageSquare },
];

async function extractFileMetadata(file: File): Promise<Partial<AdminMediaAsset>> {
  if (file.type.startsWith("image/")) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.width, height: image.height });
      image.src = URL.createObjectURL(file);
    });
  }

  if (file.type.startsWith("video/")) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration_seconds: Math.round(video.duration),
        });
      };
      video.src = URL.createObjectURL(file);
    });
  }

  return {};
}

export function DashboardClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [booting, setBooting] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState<PortfolioSite | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [media, setMedia] = useState<AdminMediaAsset[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  const [editingMediaId, setEditingMediaId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const siteForm = useForm<SiteFields>();
  const serviceForm = useForm<ServiceFields>({ defaultValues: { title: "", description: "", short_label: "", icon: "camera", sort_order: 0, is_published: true } });
  const testimonialForm = useForm<TestimonialFields>({ defaultValues: { client_name: "", client_role: "", quote: "", rating: 5, sort_order: 0, is_published: true, client_photo_url: "" } });
  const announcementForm = useForm<AnnouncementFields>({ defaultValues: { badge: "", title: "", body: "", cta_label: "", cta_url: "", starts_at: "", ends_at: "", is_published: true } });
  const mediaEditForm = useForm<MediaEditFields>({ defaultValues: { title: "", description: "", category: "", project_client: "", project_location: "" } });

  const overview = useMemo<PortfolioPayload | null>(() => {
    if (!site) return null;
    return { ...site, services, testimonials, announcements, images: media.filter((item) => item.media_type === "image"), videos: media.filter((item) => item.media_type === "video") };
  }, [announcements, media, services, site, testimonials]);

  const loadDashboard = useCallback(async () => {
    if (typeof window !== "undefined" && localStorage.getItem("guest_mode") === "1") {
      const { services, testimonials, announcements, images: _img, videos: _vid, ...siteFields } = demoPortfolio;
      const demoSite = siteFields as unknown as PortfolioSite;
      setSite(demoSite);
      setServices(services);
      setTestimonials(testimonials);
      setAnnouncements(announcements);
      setMedia([]);
      setContacts([]);
      siteForm.reset(demoSite);
      setIsGuest(true);
      setBooting(false);
      return;
    }
    const token = getAccessToken();
    if (!token) { router.replace("/admin/login"); return; }
    try {
      await getCurrentUser();
      const [siteResponse, serviceResponse, testimonialResponse, announcementResponse, mediaResponse, contactResponse] = await Promise.all([
        adminApi.get<PortfolioSite>("/admin/site/"),
        adminApi.get<Service[]>("/admin/services/"),
        adminApi.get<Testimonial[]>("/admin/testimonials/"),
        adminApi.get<AdminAnnouncement[]>("/admin/announcements/"),
        adminApi.get<AdminMediaAsset[]>("/admin/media/"),
        adminApi.get<ContactSubmission[]>("/admin/contacts/"),
      ]);
      setSite(siteResponse.data);
      setServices(serviceResponse.data);
      setTestimonials(testimonialResponse.data);
      setAnnouncements(announcementResponse.data);
      setMedia(mediaResponse.data);
      setContacts(contactResponse.data);
      siteForm.reset(siteResponse.data);
    } catch {
      clearAccessToken();
      router.replace("/admin/login");
    } finally {
      setBooting(false);
    }
  }, [router, siteForm]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const saveSite = siteForm.handleSubmit(async (values) => {
    setSaving(true);
    try {
      const response = await adminApi.patch<PortfolioSite>("/admin/site/", values);
      setSite(response.data);
      siteForm.reset(response.data);
    } finally { setSaving(false); }
  });

  const saveService = serviceForm.handleSubmit(async (values) => {
    const response = editingServiceId
      ? await adminApi.put<Service>(`/admin/services/${editingServiceId}/`, values)
      : await adminApi.post<Service>("/admin/services/", values);
    setServices((c) => [...c.filter((i) => i.id !== response.data.id), response.data].sort((a, b) => a.sort_order - b.sort_order));
    setEditingServiceId(null);
    serviceForm.reset({ title: "", description: "", short_label: "", sort_order: 0, is_published: true });
  });

  const saveTestimonial = testimonialForm.handleSubmit(async (values) => {
    const response = editingTestimonialId
      ? await adminApi.put<Testimonial>(`/admin/testimonials/${editingTestimonialId}/`, values)
      : await adminApi.post<Testimonial>("/admin/testimonials/", values);
    setTestimonials((c) => [...c.filter((i) => i.id !== response.data.id), response.data].sort((a, b) => a.sort_order - b.sort_order));
    setEditingTestimonialId(null);
    testimonialForm.reset({ client_name: "", client_role: "", quote: "", rating: 5, sort_order: 0, is_published: true, client_photo_url: "" });
  });

  const saveMediaEdit = mediaEditForm.handleSubmit(async (values) => {
    if (!editingMediaId) return;
    const { data } = await adminApi.patch<AdminMediaAsset>(`/admin/media/${editingMediaId}/`, values);
    setMedia((c) => c.map((i) => (i.id === editingMediaId ? { ...i, ...data } : i)));
    setEditingMediaId(null);
    mediaEditForm.reset();
  });

  const saveAnnouncement = announcementForm.handleSubmit(async (values) => {
    const response = editingAnnouncementId
      ? await adminApi.put<AdminAnnouncement>(`/admin/announcements/${editingAnnouncementId}/`, values)
      : await adminApi.post<AdminAnnouncement>("/admin/announcements/", values);
    setAnnouncements((c) => [response.data, ...c.filter((i) => i.id !== response.data.id)]);
    setEditingAnnouncementId(null);
    announcementForm.reset({ badge: "", title: "", body: "", cta_label: "", cta_url: "", starts_at: "", ends_at: "", is_published: true });
  });

  async function removeRecord<T extends { id: number }>(endpoint: string, id: number, setter: React.Dispatch<React.SetStateAction<T[]>>) {
    await adminApi.delete(`${endpoint}/${id}/`);
    setter((c) => c.filter((i) => i.id !== id));
  }

  async function handleLogout() {
    if (isGuest) {
      if (typeof window !== "undefined") localStorage.removeItem("guest_mode");
      router.replace("/admin/login");
      return;
    }
    await logout();
    router.replace("/admin/login");
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      const queueItem: UploadQueueItem = { fileName: file.name, progress: 0, state: "uploading" };
      setQueue((c) => [...c, queueItem]);
      try {
        const mediaType = file.type.startsWith("video/") ? "video" : "image";
        const { data: presign } = await adminApi.post<{ upload_url: string; file_key: string; headers: Record<string, string>; public_url: string }>(
          "/admin/uploads/presign/",
          { media_type: mediaType, file_name: file.name, content_type: file.type, size_bytes: file.size },
        );
        await axios.put(presign.upload_url, file, {
          headers: presign.headers,
          onUploadProgress: (e) => {
            const p = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
            setQueue((c) => c.map((i) => (i.fileName === file.name ? { ...i, progress: p } : i)));
          },
        });
        const metadata = await extractFileMetadata(file);
        const { data: created } = await adminApi.post<AdminMediaAsset>("/admin/media/", {
          media_type: mediaType, title: file.name.replace(/\.[^.]+$/, ""), description: "",
          original_filename: file.name, file_key: presign.file_key, thumbnail_key: "",
          mime_type: file.type, size_bytes: file.size, featured: false, is_published: true, sort_order: 0, ...metadata,
        });
        setMedia((c) => [created, ...c]);
        setQueue((c) => c.map((i) => (i.fileName === file.name ? { ...i, progress: 100, state: "done" } : i)));
      } catch {
        setQueue((c) => c.map((i) => (i.fileName === file.name ? { ...i, state: "error" } : i)));
      }
    }
  }

  async function markContact(id: number, status: ContactSubmission["status"]) {
    const { data } = await adminApi.patch<ContactSubmission>(`/admin/contacts/${id}/mark_read/`, { status });
    setContacts((c) => c.map((i) => (i.id === id ? data : i)));
  }

  /* ─── Loading screen ─── */
  if (booting) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(175deg,#060d1a 0%,#09111d 50%,#0c1624 100%)" }}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center shadow-[0_0_40px_rgba(241,164,82,0.35)]">
              <Sparkles className="h-7 w-7 text-slate-950" />
            </div>
            <div className="absolute -inset-3 rounded-3xl border border-[var(--accent)]/20 animate-pulse" />
          </div>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <LoaderCircle className="h-4 w-4 animate-spin text-[var(--accent)]" />
            جارٍّ تحميل اللوحة...
          </div>
        </div>
      </main>
    );
  }

  const activeTabMeta = tabs.find((t) => t.key === activeTab);
  const watchedServiceIcon = serviceForm.watch("icon");

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(175deg,#060d1a 0%,#09111d 50%,#0c1624 100%)" }}>
      {/* ═══════════════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════════════ */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex shrink-0 flex-col overflow-hidden border-l border-white/[0.06]"
        style={{ background: "rgba(6,13,26,0.95)" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] shadow-[0_0_20px_rgba(241,164,82,0.3)]">
            <Sparkles className="h-4 w-4 text-slate-950" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <p className="text-sm font-semibold text-white whitespace-nowrap" style={{ fontFamily: "var(--font-cairo)" }}>آيد للتصوير الجوي</p>
                <p className="text-[10px] text-white/30 whitespace-nowrap">لوحة التحكم</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3 overflow-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                title={!sidebarOpen ? tab.label : undefined}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--accent)] text-slate-950 shadow-[0_4px_20px_rgba(241,164,82,0.25)]"
                    : "text-white/40 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-950" : ""}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden font-medium"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!sidebarOpen && isActive && (
                  <span className="absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-l-full bg-[var(--accent)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/[0.06] p-3">
          <button
            onClick={handleLogout}
            type="button"
            title={!sidebarOpen ? "تسجيل خروج" : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30 transition hover:bg-[rgba(241,125,114,0.1)] hover:text-[var(--rose)]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="whitespace-nowrap overflow-hidden">
                  تسجيل خروج
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ═══════════════════════════════════════════════
          MAIN AREA
      ═══════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Guest banner */}
        {isGuest && (
          <div className="flex items-center justify-between gap-4 bg-[var(--accent)]/10 border-b border-[var(--accent)]/20 px-6 py-2.5">
            <p className="text-xs text-[var(--accent)]">
              <span className="font-semibold">وضع الضيف</span> — للعرض فقط. التعديلات لن تُحفَظ.
            </p>
            <a href="/" className="text-xs text-[var(--accent)]/70 underline hover:text-[var(--accent)]">العودة للموقع</a>
          </div>
        )}
        {/* ── Top bar ── */}
        <header className="flex items-center gap-4 border-b border-white/[0.06] bg-[rgba(6,13,26,0.7)] px-6 py-4 backdrop-blur-xl sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/40 transition hover:bg-white/[0.08] hover:text-white/70"
          >
            <div className="flex flex-col gap-1">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-3 bg-current" />
              <span className="block h-px w-4 bg-current" />
            </div>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/30">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-white/70 font-medium">{activeTabMeta?.label}</span>
          </div>

          <div className="mr-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
              <span className="text-xs text-white/40">متصل</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30">
              <span className="text-xs font-bold text-[var(--accent)]">أ</span>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >

              {/* ══════════════════════════════════════
                  OVERVIEW
              ══════════════════════════════════════ */}
              {activeTab === "overview" && overview && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-cairo)" }}>مرحباً بك 👋</h1>
                    <p className="mt-1 text-sm text-white/40">إليك ملخص سريع لموقعك</p>
                  </div>

                  {/* Stats row */}
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "الخدمات", value: overview.services.length, icon: Film, color: "var(--accent)", bg: "rgba(241,164,82,0.1)", border: "rgba(241,164,82,0.2)" },
                      { label: "الصور", value: overview.images.length, icon: ImagePlus, color: "var(--teal)", bg: "rgba(105,209,204,0.1)", border: "rgba(105,209,204,0.2)" },
                      { label: "الفيديوهات", value: overview.videos.length, icon: Upload, color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)" },
                      { label: "الاستفسارات", value: contacts.length, icon: Mail, color: "var(--rose)", bg: "rgba(241,125,114,0.1)", border: "rgba(241,125,114,0.2)" },
                    ].map(({ label, value, icon: Icon, color, bg, border }) => (
                      <div
                        key={label}
                        className="rounded-2xl border p-5 transition hover:scale-[1.01]"
                        style={{ background: bg, borderColor: border }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-white/40 mb-3">{label}</p>
                            <p className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-cairo)" }}>{value}</p>
                          </div>
                          <div className="rounded-xl p-2.5" style={{ background: `${color}20` }}>
                            <Icon className="h-5 w-5" style={{ color }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hero preview */}
                  <div
                    className="rounded-2xl border border-white/[0.08] p-6 relative overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(241,164,82,0.06),transparent_60%)]" />
                    <p className="relative z-10 text-xs text-[var(--accent-soft)] mb-4 font-medium">المحتوى الرئيسي المعروض حالياً</p>
                    <h2 className="relative z-10 text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-cairo)" }}>{overview.hero_title}</h2>
                    <p className="relative z-10 text-sm leading-8 text-white/40 max-w-2xl">{overview.hero_subtitle}</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("site")}
                      className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2 text-xs text-[var(--accent)] transition hover:bg-[var(--accent)]/20"
                    >
                      <Pencil className="h-3 w-3" />
                      تعديل المحتوى
                    </button>
                  </div>

                  {/* Recent contacts */}
                  {contacts.length > 0 && (
                    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.015)" }}>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                        <h3 className="text-sm font-semibold text-white">آخر الاستفسارات</h3>
                        <button type="button" onClick={() => setActiveTab("contacts")} className="text-xs text-[var(--accent)] hover:underline">عرض الكل</button>
                      </div>
                      {contacts.slice(0, 3).map((c, i) => (
                        <div key={c.id} className={`flex items-center gap-4 px-6 py-4 ${i < 2 ? "border-b border-white/[0.04]" : ""}`}>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--teal)]/15 text-[var(--teal)] text-xs font-bold">
                            {c.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white truncate">{c.name}</p>
                            <p className="text-xs text-white/30 truncate">{c.message}</p>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status === "new" ? "bg-[var(--teal)]/15 text-[var(--teal)]" : "bg-white/5 text-white/30"}`}>
                            {c.status === "new" ? "جديد" : c.status === "read" ? "مقروء" : "مؤرشف"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════════
                  SITE SETTINGS
              ══════════════════════════════════════ */}
              {activeTab === "site" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-cairo)" }}>إعدادات الموقع</h1>
                    <p className="mt-1 text-sm text-white/40">تحكم في المحتوى الرئيسي والعلامة التجارية</p>
                  </div>

                  <form className="space-y-5" onSubmit={saveSite}>
                    {/* Card: Brand */}
                    <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[var(--accent)]" /> العلامة التجارية
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <DashField label="اسم العلامة التجارية" placeholder="آيد للتصوير الجوي" {...siteForm.register("brand_name")} />
                        <DashField label="الشعار المختصر" placeholder="استوديو التصوير الجوي" {...siteForm.register("tagline")} />
                      </div>
                    </div>

                    {/* Card: Hero */}
                    <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-[var(--teal)]" /> قسم الصفحة الرئيسية
                      </h3>
                      <div className="space-y-4">
                        <DashField label="عنوان الصفحة الرئيسية" placeholder="نرتفع لنُظهر العالم من منظور آخر" {...siteForm.register("hero_title")} />
                        <DashTextarea label="وصف مختصر" placeholder="نصف سطر وصفي يظهر أسفل العنوان" {...siteForm.register("hero_subtitle")} />
                      </div>
                    </div>

                    {/* Card: About */}
                    <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#a78bfa]" /> قسم التعريف
                      </h3>
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <DashField label="عنوان قسم التعريف" placeholder="من نحن" {...siteForm.register("about_title")} />
                          <DashField label="عنوان قسم الخدمات" placeholder="خدماتنا" {...siteForm.register("services_title")} />
                        </div>
                        <DashTextarea label="نص التعريف" rows={4} placeholder="فقرة تعريفية عن الاستوديو..." {...siteForm.register("about_body")} />
                      </div>
                    </div>

                    {/* Card: Contact */}
                    <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[var(--rose)]" /> معلومات التواصل
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <DashField label="البريد الإلكتروني" placeholder="hello@example.com" {...siteForm.register("contact_email")} />
                        <DashField label="رقم الهاتف" placeholder="+966 5xx xxx xxx" {...siteForm.register("contact_phone")} />
                        <DashField label="المدينة" placeholder="الرياض" {...siteForm.register("base_city")} />
                        <DashField label="رابط إنستغرام" placeholder="https://instagram.com/..." {...siteForm.register("instagram_url")} />
                        <DashField label="رابط يوتيوب" placeholder="https://youtube.com/..." {...siteForm.register("youtube_url")} />
                        <DashField label="رابط تيك توك" placeholder="https://tiktok.com/..." {...siteForm.register("tiktok_url")} />
                        <DashField label="رابط واتساب" placeholder="https://wa.me/..." {...siteForm.register("whatsapp_url")} />
                        <DashField label="رابط تويتر / X" placeholder="https://x.com/..." {...siteForm.register("twitter_url")} />
                        <DashField label="رابط سناب شات" placeholder="https://snapchat.com/add/..." {...siteForm.register("snapchat_url")} />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        disabled={saving || isGuest}
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[var(--accent-soft)] disabled:opacity-50"
                      >
                        {saving ? <><LoaderCircle className="h-4 w-4 animate-spin" /> جارٍّ الحفظ...</> : <><CheckCircle2 className="h-4 w-4" /> حفظ الإعدادات</>}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ══════════════════════════════════════
                  SERVICES
              ══════════════════════════════════════ */}
              {activeTab === "services" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-cairo)" }}>الخدمات</h1>
                    <p className="mt-1 text-sm text-white/40">أضف وعدّل خدمات الاستوديو المعروضة للعملاء</p>
                  </div>
                  <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    {/* Form */}
                    <form onSubmit={saveService} className="rounded-2xl border border-white/[0.07] p-6 space-y-4 h-fit" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <h3 className="text-sm font-semibold text-white">{editingServiceId ? "تعديل الخدمة" : "خدمة جديدة"}</h3>
                      <DashField label="العنوان" placeholder="تصوير جوي للعقارات" {...serviceForm.register("title", { required: true })} />
                      <DashField label="تسمية مختصرة" placeholder="عقارات" {...serviceForm.register("short_label")} />
                      <DashTextarea label="الوصف" rows={3} placeholder="وصف تفصيلي للخدمة..." {...serviceForm.register("description", { required: true })} />
                      {/* Icon picker */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-white/40">الأيقونة</label>
                        <div className="grid grid-cols-6 gap-2">
                          {SERVICE_ICON_CHOICES.map(({ value, label, Icon }) => (
                            <button
                              key={value}
                              type="button"
                              title={label}
                              onClick={() => serviceForm.setValue("icon", value)}
                              className={`flex items-center justify-center rounded-xl p-2.5 border transition ${
                                watchedServiceIcon === value
                                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                                  : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/60"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <DashField label="الترتيب" type="number" placeholder="0" {...serviceForm.register("sort_order", { valueAsNumber: true })} />
                      <div className="flex gap-3 pt-1">
                        <button type="submit" className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[var(--accent-soft)]">
                          {editingServiceId ? "تحديث" : "إضافة"}
                        </button>
                        {editingServiceId && (
                          <button type="button" onClick={() => { setEditingServiceId(null); serviceForm.reset(); }} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:text-white">
                            إلغاء
                          </button>
                        )}
                      </div>
                    </form>
                    {/* List */}
                    <div className="space-y-3">
                      {services.length === 0 && <EmptyState icon={Film} message="لم تُضَف أي خدمات بعد" />}
                      {services.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-white/[0.07] p-5 transition hover:border-white/[0.12]" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-white text-sm" style={{ fontFamily: "var(--font-cairo)" }}>{item.title}</p>
                                {item.short_label && <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[10px] text-[var(--accent)]">{item.short_label}</span>}
                              </div>
                              <p className="text-xs leading-6 text-white/40 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <IconBtn onClick={() => { setEditingServiceId(item.id); serviceForm.reset(item); }} icon={<Pencil className="h-3.5 w-3.5" />} />
                              <IconBtn danger onClick={() => void removeRecord("/admin/services", item.id, setServices)} icon={<Trash2 className="h-3.5 w-3.5" />} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════
                  MEDIA
              ══════════════════════════════════════ */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-cairo)" }}>مكتبة الوسائط</h1>
                    <p className="mt-1 text-sm text-white/40">ارفع الصور والفيديوهات لعرضها في معرض الأعمال</p>
                  </div>
                  <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    {/* Upload zone */}
                    <div className="rounded-2xl border border-white/[0.07] p-6 space-y-5 h-fit" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <h3 className="text-sm font-semibold text-white">رفع ملفات جديدة</h3>
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/15">
                          <ImagePlus className="h-6 w-6 text-[var(--accent)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">اختر الملفات للرفع</p>
                          <p className="mt-1 text-xs text-white/30">صور حتى 25 MB · فيديوهات حتى 500 MB</p>
                        </div>
                        <input type="file" multiple accept="image/*,video/*" onChange={handleUpload} className="hidden" />
                      </label>
                      {queue.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs text-white/30 font-medium">جارٍ الرفع</p>
                          {queue.map((item) => (
                            <div key={`${item.fileName}-${item.state}`} className="rounded-xl border border-white/[0.06] p-3">
                              <div className="flex items-center justify-between gap-2 text-xs mb-2">
                                <span className="truncate text-white/60">{item.fileName}</span>
                                <span className={item.state === "error" ? "text-[var(--rose)]" : item.state === "done" ? "text-emerald-400" : "text-[var(--accent-soft)]"}>
                                  {item.state === "uploading" ? `${item.progress}%` : item.state === "done" ? "✓" : "خطأ"}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${item.state === "error" ? "bg-[var(--rose)]" : item.state === "done" ? "bg-emerald-400" : "bg-[var(--accent)]"}`}
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Grid */}
                    <div>
                      {media.length === 0 && <EmptyState icon={ImagePlus} message="لم يُرفَع أي وسائط بعد" />}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {media.map((item) => (
                          <div key={item.id} className="group rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <div className="relative aspect-video bg-black/40">
                              {item.media_type === "image" ? (
                                <img src={item.file_url} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                              ) : (
                                <video src={item.file_url} className="h-full w-full object-cover" controls preload="metadata" />
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-end justify-end gap-2 p-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMediaId(item.id);
                                    mediaEditForm.reset({ title: item.title, description: item.description || "", category: item.category || "", project_client: item.project_client || "", project_location: item.project_location || "" });
                                  }}
                                  className="rounded-full bg-white/10 border border-white/20 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button type="button" onClick={() => void removeRecord("/admin/media", item.id, setMedia)} className="rounded-full bg-[var(--rose)]/20 border border-[var(--rose)]/40 p-2 text-[var(--rose)] transition hover:bg-[var(--rose)]/30">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            {editingMediaId === item.id ? (
                              <form onSubmit={saveMediaEdit} className="space-y-2.5 p-3">
                                <DashField label="العنوان" placeholder="عنوان المشروع" {...mediaEditForm.register("title")} />
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-medium text-white/40">التصنيف</label>
                                  <select className="w-full rounded-xl border border-white/[0.08] bg-[#0a1322] px-3 py-2 text-sm text-white outline-none transition focus:border-[var(--accent)]/50" {...mediaEditForm.register("category")}>
                                    {MEDIA_CATEGORY_OPTIONS.map((opt) => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <DashField label="اسم العميل" placeholder="شركة الرياض العقارية" {...mediaEditForm.register("project_client")} />
                                <DashField label="الموقع" placeholder="الرياض، حي النرجس" {...mediaEditForm.register("project_location")} />
                                <div className="flex gap-2 pt-1">
                                  <button type="submit" className="flex-1 rounded-lg bg-[var(--accent)] py-2 text-xs font-semibold text-slate-950 transition hover:bg-[var(--accent-soft)]">حفظ</button>
                                  <button type="button" onClick={() => setEditingMediaId(null)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:text-white">إلغاء</button>
                                </div>
                              </form>
                            ) : (
                              <div className="p-3">
                                <p className="text-xs font-medium text-white truncate">{item.title}</p>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <p className="text-[10px] text-white/30">{item.media_type === "image" ? "صورة" : "فيديو"} · {(item.size_bytes / (1024 * 1024)).toFixed(1)} MB</p>
                                  {item.category ? <span className="rounded-full bg-[var(--accent)]/10 px-1.5 py-0.5 text-[9px] text-[var(--accent)]">{item.category}</span> : null}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════
                  TESTIMONIALS
              ══════════════════════════════════════ */}
              {activeTab === "testimonials" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-cairo)" }}>التقييمات</h1>
                    <p className="mt-1 text-sm text-white/40">إدارة آراء العملاء الظاهرة في الموقع</p>
                  </div>
                  <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <form onSubmit={saveTestimonial} className="rounded-2xl border border-white/[0.07] p-6 space-y-4 h-fit" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <h3 className="text-sm font-semibold text-white">{editingTestimonialId ? "تعديل التقييم" : "تقييم جديد"}</h3>
                      <DashField label="اسم العميل" placeholder="محمد العمري" {...testimonialForm.register("client_name", { required: true })} />
                      <DashField label="الصفة أو المسمى" placeholder="مدير مشاريع" {...testimonialForm.register("client_role")} />
                      <DashField label="رابط صورة العميل" placeholder="https://..." {...testimonialForm.register("client_photo_url")} />
                      <DashTextarea label="نص التقييم" rows={3} placeholder="تجربة ممتازة..." {...testimonialForm.register("quote", { required: true })} />
                      <DashField label="التقييم (من 5)" type="number" placeholder="5" {...testimonialForm.register("rating", { valueAsNumber: true })} />
                      <div className="flex gap-3 pt-1">
                        <button type="submit" className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[var(--accent-soft)]">
                          {editingTestimonialId ? "تحديث" : "إضافة"}
                        </button>
                        {editingTestimonialId && (
                          <button type="button" onClick={() => { setEditingTestimonialId(null); testimonialForm.reset(); }} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:text-white">
                            إلغاء
                          </button>
                        )}
                      </div>
                    </form>
                    <div className="space-y-3">
                      {testimonials.length === 0 && <EmptyState icon={Star} message="لم تُضَف أي تقييمات بعد" />}
                      {testimonials.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-white/[0.07] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-sm font-bold shrink-0">
                                  {item.client_name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">{item.client_name}</p>
                                  <p className="text-[10px] text-white/30">{item.client_role}</p>
                                </div>
                                <div className="mr-auto flex gap-0.5">
                                  {Array.from({ length: item.rating }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-[var(--accent)] text-[var(--accent)]" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs leading-6 text-white/50 line-clamp-2">{item.quote}</p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <IconBtn onClick={() => { setEditingTestimonialId(item.id); testimonialForm.reset(item); }} icon={<Pencil className="h-3.5 w-3.5" />} />
                              <IconBtn danger onClick={() => void removeRecord("/admin/testimonials", item.id, setTestimonials)} icon={<Trash2 className="h-3.5 w-3.5" />} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════
                  ANNOUNCEMENTS
              ══════════════════════════════════════ */}
              {activeTab === "announcements" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-cairo)" }}>الإعلانات</h1>
                    <p className="mt-1 text-sm text-white/40">أنشئ إعلانات تظهر في أعلى الصفحة</p>
                  </div>
                  <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <form onSubmit={saveAnnouncement} className="rounded-2xl border border-white/[0.07] p-6 space-y-4 h-fit" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <h3 className="text-sm font-semibold text-white">{editingAnnouncementId ? "تعديل الإعلان" : "إعلان جديد"}</h3>
                      <DashField label="الوسم" placeholder="جديد / عرض / تنبيه" {...announcementForm.register("badge")} />
                      <DashField label="العنوان" placeholder="عنوان الإعلان" {...announcementForm.register("title", { required: true })} />
                      <DashTextarea label="النص" rows={3} placeholder="تفاصيل الإعلان..." {...announcementForm.register("body", { required: true })} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <DashField label="نص الزر" placeholder="اعرف المزيد" {...announcementForm.register("cta_label")} />
                        <DashField label="رابط الزر" placeholder="https://..." {...announcementForm.register("cta_url")} />
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button type="submit" className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[var(--accent-soft)]">
                          {editingAnnouncementId ? "تحديث" : "إضافة"}
                        </button>
                        {editingAnnouncementId && (
                          <button type="button" onClick={() => { setEditingAnnouncementId(null); announcementForm.reset(); }} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:text-white">
                            إلغاء
                          </button>
                        )}
                      </div>
                    </form>
                    <div className="space-y-3">
                      {announcements.length === 0 && <EmptyState icon={Bell} message="لا توجد إعلانات نشطة" />}
                      {announcements.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-white/[0.07] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              {item.badge && <span className="inline-block rounded-full bg-[var(--teal)]/15 px-2.5 py-0.5 text-[10px] font-medium text-[var(--teal)] mb-2">{item.badge}</span>}
                              <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                              <p className="text-xs leading-6 text-white/40 line-clamp-2">{item.body}</p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <IconBtn onClick={() => { setEditingAnnouncementId(item.id); announcementForm.reset(item); }} icon={<Pencil className="h-3.5 w-3.5" />} />
                              <IconBtn danger onClick={() => void removeRecord("/admin/announcements", item.id, setAnnouncements)} icon={<Trash2 className="h-3.5 w-3.5" />} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════
                  CONTACTS
              ══════════════════════════════════════ */}
              {activeTab === "contacts" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-cairo)" }}>الاستفسارات</h1>
                    <p className="mt-1 text-sm text-white/40">{contacts.length} رسالة واردة</p>
                  </div>
                  {contacts.length === 0 && <EmptyState icon={MessageSquare} message="لا توجد استفسارات بعد" />}
                  <div className="space-y-3">
                    {contacts.map((item) => (
                      <div key={item.id} className={`rounded-2xl border p-5 transition ${item.status === "new" ? "border-[var(--teal)]/20 bg-[var(--teal)]/[0.03]" : "border-white/[0.06]"}`} style={item.status !== "new" ? { background: "rgba(255,255,255,0.015)" } : undefined}>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold">
                              {item.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="text-sm font-semibold text-white">{item.name}</p>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.status === "new" ? "bg-[var(--teal)]/15 text-[var(--teal)]" : item.status === "read" ? "bg-white/8 text-white/40" : "bg-white/5 text-white/25"}`}>
                                  {item.status === "new" ? "جديد" : item.status === "read" ? "مقروء" : "مؤرشف"}
                                </span>
                              </div>
                              <p className="text-xs text-white/30 mb-3">{item.email}{item.phone ? ` · ${item.phone}` : ""}</p>
                              <p className="text-sm leading-7 text-white/60">{item.message}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button type="button" onClick={() => void markContact(item.id, "read")} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:border-white/20 hover:text-white">
                              تعليم كمقروء
                            </button>
                            <button type="button" onClick={() => void markContact(item.id, "archived")} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:border-white/20 hover:text-white">
                              أرشفة
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TINY HELPER COMPONENTS
═══════════════════════════════════════════════════════════ */

type DashFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };
const DashField = ({ label, ...props }: DashFieldProps) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-white/40">{label}</label>
    <input
      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[var(--accent)]/50 focus:bg-white/[0.06]"
      {...props}
    />
  </div>
);

type DashTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };
const DashTextarea = ({ label, rows = 3, ...props }: DashTextareaProps) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-white/40">{label}</label>
    <textarea
      rows={rows}
      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[var(--accent)]/50 focus:bg-white/[0.06] resize-none"
      {...props}
    />
  </div>
);

function IconBtn({ onClick, icon, danger }: { onClick: () => void; icon: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
        danger
          ? "border-[var(--rose)]/20 text-[var(--rose)]/50 hover:bg-[var(--rose)]/10 hover:text-[var(--rose)] hover:border-[var(--rose)]/40"
          : "border-white/10 text-white/30 hover:bg-white/[0.06] hover:text-white/70"
      }`}
    >
      {icon}
    </button>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ComponentType<{ className?: string }>; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/[0.07] py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
        <Icon className="h-5 w-5 text-white/20" />
      </div>
      <p className="text-sm text-white/25">{message}</p>
    </div>
  );
}
