// app/login/page.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createBrowserClient,
} from "@supabase/ssr";

import {
  useRouter,
} from "next/navigation";

import {
  Loader2,
  LogIn,
  UserPlus,
  Mail,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type AuthMode =
  | "login"
  | "register";

// ============================================================================
// COMPONENT
// ============================================================================

export default function LoginPage() {
  // ==========================================================================
  // STATE
  // ==========================================================================

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);

  const [mode, setMode] =
    useState<AuthMode>(
      "login"
    );

  // ==========================================================================
  // SUPABASE
  // ==========================================================================

  const supabase =
    useMemo(
      () =>
        createBrowserClient(
          process.env
            .NEXT_PUBLIC_SUPABASE_URL!,
          process.env
            .NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ),
      []
    );

  const router =
    useRouter();

  // ==========================================================================
  // CHECK EXISTING SESSION
  // ==========================================================================

  useEffect(() => {
    let active = true;

    const checkUserSession =
      async () => {
        try {
          const {
            data: {
              session,
            },
            error,
          } =
            await supabase.auth.getSession();

          if (error) {
            console.error(
              "[LOGIN] Gagal memeriksa sesi:",
              error
            );
          }

          if (
            session
          ) {
            router.replace(
              "/akun"
            );

            return;
          }
        } catch (
          error
        ) {
          console.error(
            "[LOGIN] Error checking session:",
            error
          );
        } finally {
          if (active) {
            setCheckingAuth(
              false
            );
          }
        }
      };

    checkUserSession();

    return () => {
      active = false;
    };
  }, [
    supabase,
    router,
  ]);

  // ==========================================================================
  // EMAIL AUTH
  // ==========================================================================

  const handleAuth =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      if (
        loading ||
        googleLoading
      ) {
        return;
      }

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (
        !cleanEmail
      ) {
        alert(
          "Masukkan alamat email."
        );

        return;
      }

      if (
        password.length <
        6
      ) {
        alert(
          "Kata sandi minimal 6 karakter."
        );

        return;
      }

      setLoading(
        true
      );

      try {
        // ====================================================================
        // REGISTER
        // ====================================================================

        if (
          mode ===
          "register"
        ) {
          const {
            data,
            error,
          } =
            await supabase.auth.signUp(
              {
                email:
                  cleanEmail,

                password,

                options: {
                  emailRedirectTo:
                    `${window.location.origin}/auth/callback`,
                },
              }
            );

          if (error) {
            throw error;
          }

          // Jika Supabase tidak mewajibkan email confirmation
          if (
            data.session
          ) {
            router.replace(
              "/akun"
            );

            router.refresh();

            return;
          }

          alert(
            "Pendaftaran berhasil. Silakan periksa email Anda untuk melakukan verifikasi akun."
          );

          setMode(
            "login"
          );

          setPassword(
            ""
          );

          return;
        }

        // ====================================================================
        // LOGIN
        // ====================================================================

        const {
          error,
        } =
          await supabase.auth.signInWithPassword(
            {
              email:
                cleanEmail,

              password,
            }
          );

        if (error) {
          throw error;
        }

        router.replace(
          "/akun"
        );

        router.refresh();
      } catch (
        error:
          any
      ) {
        console.error(
          "[LOGIN] Authentication error:",
          error
        );

        alert(
          error?.message ||
            "Terjadi kesalahan saat memproses akun."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // ==========================================================================
  // GOOGLE AUTH
  // ==========================================================================

  const handleGoogleAuth =
    async () => {
      if (
        loading ||
        googleLoading
      ) {
        return;
      }

      setGoogleLoading(
        true
      );

      try {
        const {
          error,
        } =
          await supabase.auth.signInWithOAuth(
            {
              provider:
                "google",

              options: {
                redirectTo:
                  `${window.location.origin}/auth/callback`,
              },
            }
          );

        if (error) {
          throw error;
        }
      } catch (
        error:
          any
      ) {
        console.error(
          "[LOGIN] Google auth error:",
          error
        );

        alert(
          error?.message ||
            "Gagal masuk menggunakan Google."
        );

        setGoogleLoading(
          false
        );
      }
    };

  // ==========================================================================
  // SWITCH MODE
  // ==========================================================================

  const switchMode =
    () => {
      if (
        loading ||
        googleLoading
      ) {
        return;
      }

      setMode(
        (
          previous
        ) =>
          previous ===
          "login"
            ? "register"
            : "login"
      );

      setPassword(
        ""
      );
    };

  // ==========================================================================
  // CHECKING SESSION
  // ==========================================================================

  if (
    checkingAuth
  ) {
    return (
      <main className="min-h-screen w-full bg-slate-50">

        <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-3">

          <div className="flex flex-col items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#102a43] shadow-lg">

              <Loader2 className="h-5 w-5 animate-spin text-white" />

            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Memeriksa sesi
            </p>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  return (
    <main className="min-h-screen w-full bg-slate-50 pb-28 text-slate-900">

      {/* ==================================================================== */}
      {/* MOBILE-FIRST WRAPPER */}
      {/* ==================================================================== */}

      <div className="mx-auto w-full max-w-md px-3 pt-3">

        {/* ================================================================== */}
        {/* LOGIN PANEL */}
        {/* ================================================================== */}

        <section className="w-full border border-slate-200/80 bg-white shadow-sm">

          {/* ================================================================ */}
          {/* HEADER */}
          {/* ================================================================ */}

          <header className="relative overflow-hidden bg-[#102a43] px-4 pb-5 pt-6">

            {/* Dekorasi boleh bulat */}

            <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-20 -left-12 h-36 w-36 rounded-full border border-[#d7b66a]/15" />

            <div className="relative z-10">

              {/* Icon */}

              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7b66a]/30 bg-white/10 shadow-[0_0_20px_rgba(215,182,106,0.2)]">

                {mode ===
                "login" ? (
                  <LogIn className="h-5 w-5 text-[#e5c979]" />
                ) : (
                  <UserPlus className="h-5 w-5 text-[#e5c979]" />
                )}

              </div>

              <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#d7b66a]">
                Member Islami.or.id
              </p>

              <h1 className="mt-1.5 text-[24px] font-extrabold tracking-tight text-white">

                {mode ===
                "login"
                  ? "Masuk ke Akun"
                  : "Buat Akun"}

              </h1>

              <p className="mt-2 max-w-[320px] text-[11px] leading-[1.7] text-slate-300">

                {mode ===
                "login"
                  ? "Masuk untuk melihat riwayat donasi, akun, referral, dan aktivitas kebaikan Anda."
                  : "Daftar untuk menyimpan riwayat transaksi dan menggunakan fitur member islami.or.id."}

              </p>

            </div>

          </header>

          {/* ================================================================ */}
          {/* MODE SWITCH */}
          {/* ================================================================ */}

          <div className="grid grid-cols-2 border-b border-slate-200">

            <button
              type="button"
              onClick={() =>
                setMode(
                  "login"
                )
              }
              className={`border-r border-slate-200 py-3 text-[10px] font-bold uppercase tracking-wider transition ${
                mode ===
                "login"
                  ? "bg-white text-[#0d5c91]"
                  : "bg-slate-50 text-slate-400 hover:text-slate-600"
              }`}
            >
              Masuk
            </button>

            <button
              type="button"
              onClick={() =>
                setMode(
                  "register"
                )
              }
              className={`py-3 text-[10px] font-bold uppercase tracking-wider transition ${
                mode ===
                "register"
                  ? "bg-white text-[#0d5c91]"
                  : "bg-slate-50 text-slate-400 hover:text-slate-600"
              }`}
            >
              Daftar
            </button>

          </div>

          {/* ================================================================ */}
          {/* FORM */}
          {/* ================================================================ */}

          <div className="px-4 py-5 sm:px-5">

            <form
              onSubmit={
                handleAuth
              }
              className="space-y-4"
            >

              {/* ============================================================ */}
              {/* EMAIL */}
              {/* ============================================================ */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500"
                >
                  Email
                </label>

                <div className="relative">

                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={
                      email
                    }
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event
                          .target
                          .value
                      )
                    }
                    required
                    className="h-12 w-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-[12px] font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0d5c91] focus:bg-white"
                  />

                </div>

              </div>

              {/* ============================================================ */}
              {/* PASSWORD */}
              {/* ============================================================ */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500"
                >
                  Kata Sandi
                </label>

                <div className="relative">

                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type="password"
                    autoComplete={
                      mode ===
                      "login"
                        ? "current-password"
                        : "new-password"
                    }
                    placeholder="Minimal 6 karakter"
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event
                          .target
                          .value
                      )
                    }
                    minLength={
                      6
                    }
                    required
                    className="h-12 w-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-[12px] font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0d5c91] focus:bg-white"
                  />

                </div>

                {mode ===
                  "register" && (
                  <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
                    Gunakan minimal 6 karakter untuk kata sandi akun.
                  </p>
                )}

              </div>

              {/* ============================================================ */}
              {/* SUBMIT */}
              {/* ============================================================ */}

              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
                className="flex w-full items-center justify-center gap-2 bg-[#0d5c91] py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#0a4d7a] disabled:cursor-not-allowed disabled:bg-slate-300"
              >

                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Memproses
                  </>
                ) : mode ===
                  "login" ? (
                  <>
                    <LogIn className="h-4 w-4" />

                    Masuk
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />

                    Daftar dengan Email
                  </>
                )}

              </button>

            </form>

            {/* ================================================================ */}
            {/* DIVIDER */}
            {/* ================================================================ */}

            <div className="relative my-6">

              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center">

                <span className="bg-white px-3 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  atau lanjutkan dengan
                </span>

              </div>

            </div>

            {/* ================================================================ */}
            {/* GOOGLE */}
            {/* ================================================================ */}

            <button
              type="button"
              onClick={
                handleGoogleAuth
              }
              disabled={
                loading ||
                googleLoading
              }
              className="flex w-full items-center justify-center gap-2.5 border border-slate-200 bg-white py-3.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {googleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />

                  Menghubungkan...
                </>
              ) : (
                <>
                  <img
                    src="/google-icon.svg"
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-5"
                  />

                  <span>
                    Masuk dengan Google
                  </span>
                </>
              )}

            </button>

            {/* ================================================================ */}
            {/* CHANGE MODE */}
            {/* ================================================================ */}

            <div className="mt-5 border-t border-slate-100 pt-4 text-center">

              <p className="text-[10px] text-slate-500">

                {mode ===
                "login"
                  ? "Belum memiliki akun?"
                  : "Sudah memiliki akun?"}

              </p>

              <button
                type="button"
                onClick={
                  switchMode
                }
                disabled={
                  loading ||
                  googleLoading
                }
                className="mt-1.5 text-[10px] font-bold text-[#0d5c91] underline decoration-sky-300 underline-offset-2 disabled:opacity-50"
              >

                {mode ===
                "login"
                  ? "Daftar akun baru"
                  : "Masuk ke akun"}

              </button>

            </div>

          </div>

          {/* ================================================================ */}
          {/* SECURITY NOTE */}
          {/* ================================================================ */}

          <footer className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">

            <div className="flex items-start gap-2.5">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">

                <ShieldCheck className="h-3.5 w-3.5 text-[#0d5c91]" />

              </div>

              <p className="pt-0.5 text-[9px] leading-[1.65] text-slate-400">
                Gunakan email yang dapat Anda akses. Informasi akun digunakan untuk autentikasi dan fitur member islami.or.id.
              </p>

            </div>

          </footer>

        </section>

      </div>

    </main>
  );
}