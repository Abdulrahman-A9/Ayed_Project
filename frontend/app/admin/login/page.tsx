"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Eye, EyeOff, LockKeyhole, Sparkles, UserRound, Users } from "lucide-react";

import { login } from "@/lib/api-client";

type LoginFields = {
  username: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFields>();

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      router.push("/admin/dashboard");
    } catch {
      setError("فشل تسجيل الدخول. تحقق من بيانات المدير.");
    }
  });

  function handleGuestLogin() {
    if (typeof window !== "undefined") {
      localStorage.setItem("guest_mode", "1");
    }
    router.push("/admin/dashboard");
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#060d1a] text-white">
      {/* ===== Left decorative panel ===== */}
      <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(241,164,82,0.22),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(105,209,204,0.18),transparent_55%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-20 top-28 h-48 w-48 rounded-full bg-[rgba(241,164,82,0.14)] blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="pointer-events-none absolute bottom-32 right-16 h-56 w-56 rounded-full bg-[rgba(105,209,204,0.13)] blur-3xl"
        />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]">
              <Sparkles className="h-4 w-4 text-slate-950" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-white/80">آيد للتصوير الجوي</span>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="select-none font-['Cairo'] text-[11rem] font-black leading-none text-white/[0.04]"
            style={{ direction: "ltr" }}
          >
            CMS
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-[var(--accent-soft)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
              لوحة إدارة المحتوى
            </div>
            <h1 className="font-['Cairo'] text-5xl font-bold leading-tight">
              أدِر موقعك
              <br />
              <span className="text-[var(--accent)]">بالكامل من هنا</span>
            </h1>
            <p className="max-w-sm text-base leading-8 text-white/50">
              ارفع الأعمال الجوية، أنشئ الخدمات، راجع استفسارات العملاء — كل شيء في مكان واحد.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-wrap gap-3"
          >
            {["رفع الوسائط", "إدارة الخدمات", "استفسارات العملاء", "التقييمات"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60"
              >
                {f}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Back link */}
        <div className="relative z-10">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white/70">
            <ArrowLeft className="h-3.5 w-3.5" />
            العودة إلى الموقع
          </a>
        </div>
      </div>

      {/* ===== Right form panel ===== */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[rgba(255,255,255,0.015)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/[0.06]" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-[400px]"
        >
          {/* Mobile brand */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]">
              <Sparkles className="h-4 w-4 text-slate-950" />
            </div>
            <span className="text-sm font-semibold text-white/80">آيد للتصوير الجوي</span>
          </div>

          {/* Heading */}
          <div className="mb-10 space-y-2">
            <p className="text-xs text-[var(--accent-soft)]">مرحباً بك مجدداً</p>
            <h2 className="font-['Cairo'] text-4xl font-bold">تسجيل الدخول</h2>
            <p className="text-sm text-white/40">أدخل بيانات حسابك للوصول إلى لوحة التحكم</p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-xs text-white/50">اسم المستخدم</label>
              <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition focus-within:border-[var(--accent)] focus-within:bg-white/[0.07]">
                <UserRound className="h-4 w-4 shrink-0 text-white/30 transition group-focus-within:text-[var(--accent)]" />
                <input
                  dir="ltr"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/20"
                  placeholder="admin"
                  autoComplete="username"
                  {...register("username", { required: true })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs text-white/50">كلمة المرور</label>
              <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition focus-within:border-[var(--accent)] focus-within:bg-white/[0.07]">
                <LockKeyhole className="h-4 w-4 shrink-0 text-white/30 transition group-focus-within:text-[var(--accent)]" />
                <input
                  dir="ltr"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/20"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password", { required: true })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0 text-white/25 transition hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 rounded-2xl border border-[rgba(241,125,114,0.3)] bg-[rgba(241,125,114,0.08)] px-4 py-3 text-sm text-[var(--rose)]"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            ) : null}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full overflow-hidden rounded-2xl bg-[var(--accent)] px-6 py-4 font-semibold text-slate-950 transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    جارٍ التحقق...
                  </>
                ) : (
                  "دخول إلى اللوحة"
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-xs text-white/20">أو</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Guest login */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm text-white/50 transition hover:bg-white/[0.07] hover:text-white/80 hover:border-white/20"
          >
            <Users className="h-4 w-4" />
            تصفح كضيف — عرض تجريبي
          </button>

          <p className="mt-8 text-center text-xs text-white/25">
            هذه الصفحة مخصصة لمدير الموقع فقط
          </p>
        </motion.div>
      </div>
    </main>
  );
}
