'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { DashboardStats } from '@/types/api';
import { formatKg, formatPoin } from '@/lib/utils';
import { Key, Scale, Coins, Recycle, Gift, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Hook: Track Window Scroll for Parallax Depth                              */
/* -------------------------------------------------------------------------- */
const useScrollParallax = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

/* -------------------------------------------------------------------------- */
/* Component: Scroll Reveal Wrapper with IntersectionObserver                 */
/* -------------------------------------------------------------------------- */
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (domRef.current) observer.unobserve(domRef.current);
        }
      },
      { threshold: 0.12 }
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${isVisible
        ? 'opacity-100 translate-y-0 scale-100'
        : 'opacity-0 translate-y-10 scale-[0.98]'
        } ${className}`}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Component: Interactive 3D Card Tilt with Cursor Glare                      */
/* -------------------------------------------------------------------------- */
interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}

const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  maxTilt = 6,
  scale = 1.015,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -maxTilt, y: x * maxTilt });
    setGlare({ x: (x + 0.5) * 100, y: (y + 0.5) * 100, opacity: 0.22 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      className="perspective-1200 w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`relative transition-transform duration-200 ease-out preserve-3d will-change-transform ${className}`}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${scale}, ${scale}, ${scale})`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        }}
      >
        {children}
        {/* Holographic moving specular sheen */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 z-30"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
          }}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Component: Animated Counter for Live Statistics                            */
/* -------------------------------------------------------------------------- */
interface AnimatedCounterProps {
  target: number;
  duration?: number;
  formatType?: 'kg' | 'poin' | 'number';
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 1600,
  formatType = 'number',
}) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, target, duration]);

  const formatted = useMemo(() => {
    if (formatType === 'kg') return formatKg(count);
    if (formatType === 'poin') return formatPoin(count);
    return count.toLocaleString('id-ID');
  }, [count, formatType]);

  return <span ref={elementRef}>{formatted}</span>;
};

/* -------------------------------------------------------------------------- */
/* Component: Floating Pill Navigation with Sliding Green Indicator           */
/* -------------------------------------------------------------------------- */
interface FloatingPillNavProps {
  currentUser: any;
}

const FloatingPillNav: React.FC<FloatingPillNavProps> = ({ currentUser }) => {
  const navRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>({ left: 0, top: 0, width: 0, height: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const navItems = useMemo(
    () => [
      { label: 'Beranda', href: '#beranda' },
      { label: 'Layanan', href: '#layanan' },
      { label: 'Katalog Sampah', href: '/nasabah/kategori-sampah' },
      { label: 'Setup Tenant', href: '/setup' },
      {
        label: 'Setor Sekarang',
        href: currentUser
          ? currentUser.role === 'nasabah'
            ? '/nasabah/setor'
            : '/admin/dashboard'
          : '/login',
      },
    ],
    [currentUser]
  );

  const updateIndicator = useCallback((index: number) => {
    const el = itemsRef.current[index];
    const parent = navRef.current;
    if (el && parent) {
      const parentRect = parent.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - parentRect.left,
        top: elRect.top - parentRect.top,
        width: elRect.width,
        height: elRect.height,
      });
    }
  }, []);

  useEffect(() => {
    if (hoveredIndex !== null) {
      updateIndicator(hoveredIndex);
    }

    const handleResize = () => {
      if (hoveredIndex !== null) {
        updateIndicator(hoveredIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [hoveredIndex, updateIndicator]);

  return (
    <nav
      ref={navRef}
      onMouseLeave={() => setHoveredIndex(null)}
      className="relative hidden md:flex items-center bg-white/90 backdrop-blur-lg border border-white/60 p-1.5 rounded-full shadow-lg shadow-black/5 text-sm font-medium text-slate-700 select-none overflow-hidden"
      data-purpose="pill-navigation"
    >
      {/* Sliding Green Background Indicator - Muncul HANYA saat di-hover */}
      <div
        className={`absolute bg-emerald-500 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-md shadow-emerald-500/25 pointer-events-none ${
          hoveredIndex !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
          width: `${indicatorStyle.width}px`,
          height: `${indicatorStyle.height}px`,
        }}
      />

      {navItems.map((item, idx) => {
        const isHovered = hoveredIndex === idx;

        return (
          <Link
            key={item.label}
            ref={(el) => {
              itemsRef.current[idx] = el;
            }}
            href={item.href}
            onMouseEnter={() => {
              setHoveredIndex(idx);
              updateIndicator(idx);
            }}
            className={`relative z-10 px-4.5 py-2 rounded-full font-semibold transition-colors duration-200 ${
              isHovered
                ? 'text-white'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

/* -------------------------------------------------------------------------- */
/* Main HomePage Component                                                    */
/* -------------------------------------------------------------------------- */
export const HomePage: React.FC = () => {
  const { appKey, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mounted, setMounted] = useState(false);
  const scrollY = useScrollParallax();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentUser = mounted ? user : null;

  useEffect(() => {
    let isMounted = true;
    if (appKey) {
      api.dashboard
        .stats()
        .then((res) => {
          if (isMounted && res.success && res.data) {
            setStats(res.data);
          }
        })
        .catch(() => {
          // Keep default fallback stats if fetch fails
        });
    }

    return () => {
      isMounted = false;
    };
  }, [appKey]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white flex flex-col font-sans overflow-x-hidden">
      {/* BEGIN: Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
        {/* Downward Balanced Slate Gray Gradient Blur Background */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-b from-slate-400/50 via-slate-300/25 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group" data-purpose="brand-logo">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-emerald-400 font-extrabold text-xl shadow-lg transition-transform group-hover:scale-105 border border-white/10">
              <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Eco<span className="text-emerald-600 drop-shadow-xs">Payard</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-emerald-950 font-semibold mt-0.5">
                Bank Sampah Digital
              </span>
            </div>
          </Link>

          {/* Center Floating Pill Menu with Sliding Indicator */}
          <FloatingPillNav currentUser={currentUser} />

          {/* Right Auth Actions */}
          <div className="flex items-center gap-3" data-purpose="auth-actions">
            {mounted && !appKey && (
              <Link
                href="/setup"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-200 transition"
                title="Atur App Key Anda terlebih dahulu"
              >
                <Key className="w-3.5 h-3.5 text-amber-700" />
                Setup Key
              </Link>
            )}

            {currentUser ? (
              <Link
                href={currentUser.role === 'nasabah' ? '/nasabah/dashboard' : '/admin/dashboard'}
                className="px-6 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  className="px-5 py-2 rounded-full border border-slate-900/40 text-slate-900 text-sm font-semibold hover:bg-slate-900/10 transition"
                  href="/login"
                >
                  Masuk
                </Link>
                <Link
                  className="px-6 py-2 rounded-full bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-md shadow-slate-950/20"
                  href="/register"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {/* END: Navigation */}

      {/* BEGIN: Hero Section */}
      <main id="beranda" className="flex-1">
        <section
          className="relative hero-bg-pattern pt-36 pb-80 sm:pb-96 lg:pb-[420px] px-4 sm:px-6 lg:px-8 overflow-hidden preserve-3d"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.35) 1.4px, transparent 1.4px)',
            backgroundSize: '24px 24px',
          }}
          data-purpose="hero-container"
        >


          {/* 3D Floating Parallax Pill Bottom: Smart Scale */}
          <div
            className="hidden sm:inline-flex items-center gap-2 absolute bottom-64 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold animate-float-reverse pointer-events-none z-20"
            style={{ transform: `translateX(-50%) translateY(${scrollY * 0.08}px)` }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Timbangan Digital Presisi Terintegrasi
          </div>

          {/* Big Hero Headings */}
          <div className="max-w-5xl mx-auto text-center relative z-10">

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-xs leading-tight">
              Ubah Sampah Jadi Berkah,
              <span className="block mt-1 font-serif italic font-medium text-emerald-100/90 tracking-normal opacity-90 drop-shadow-md">
                &amp; Poin Hadiah
              </span>
            </h1>
            <p className="mt-4 text-emerald-50 text-base sm:text-lg max-w-2xl mx-auto opacity-95">
              Platform pengelolaan sampah daur ulang berbasis digital untuk lingkungan sekolah dan masyarakat yang lebih asri, bernilai ekonomis, dan berkelanjutan.
            </p>
          </div>

          {/* Ambient background glow circles with parallax scroll */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-400/30 blur-3xl pointer-events-none rounded-full"
            style={{ transform: `translateX(-50%) translateY(${scrollY * 0.15}px)` }}
          />
        </section>
        {/* END: Hero Section */}

        {/* BEGIN: Dual Role Open Account Container */}
        <section
          className="-mt-64 sm:-mt-80 lg:-mt-[340px] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pb-20"
          data-purpose="account-selection-container"
        >
          <ScrollReveal>
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-slate-100 card-shadow-lift">
              {/* Header Text inside White Card */}
              <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Open Account / Buka Akun</p>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Pilih Portal Berdasarkan Kebutuhan Anda</h2>
                </div>
              </div>

              {/* Two Large Feature Cards Grid with Interactive 3D Tilt */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: For Persons / Nasabah */}
                <TiltCard3D maxTilt={7} className="rounded-3xl">
                  <div
                    className="bg-[#3cf0a2] rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group min-h-[500px] h-full shadow-lg"
                    data-purpose="card-persons"
                  >
                    <div className="relative z-10">
                      <span className="inline-block px-3 py-1 rounded-full bg-black/10 text-emerald-950 text-xs font-bold tracking-wide uppercase mb-3">
                        Nasabah &amp; Edukasi
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">For persons</h3>
                      <p className="mt-3 text-slate-900/80 font-medium text-sm sm:text-base max-w-sm">
                        Tabung sampah kering Anda, pantau riwayat setor kilat, kumpulkan poin eco-reward, dan tukar langsung dengan hadiah sembako atau voucher.
                      </p>
                    </div>

                    {/* 3D Mobile / Card Stack Isometric Mockup with Depth Layer */}
                    <div className="relative my-8 h-48 flex items-center justify-center">
                      <div className="relative w-64 h-36 bg-white rounded-2xl p-3 shadow-2xl border-4 border-white/80 isometric-tilt transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 translate-z-20">
                        {/* Top Recycled Card stack */}
                        <div className="absolute -top-5 left-4 right-4 h-24 bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 rounded-xl p-3 text-white shadow-lg flex flex-col justify-between translate-z-40">
                          <div className="flex justify-between items-center text-[10px] font-mono tracking-wider opacity-90">
                            <span>ECO PASS</span>
                            <span className="font-bold">ID: 8821 0092</span>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest opacity-80">Saldo Poin Hijau</div>
                            <div className="text-base font-black">2.450 Pts</div>
                          </div>
                        </div>
                        {/* Secondary lower card */}
                        <div className="absolute -top-1 left-2 right-2 h-20 bg-slate-900 rounded-xl shadow-md -z-10 opacity-70" />
                        {/* Base phone bezel accents */}
                        <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center text-[11px] font-bold text-slate-400">
                          <span>Plastik • Kertas • Logam</span>
                          <span className="text-emerald-600 font-bold">Terverifikasi</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom Action */}
                    <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center gap-4">
                      <Link
                        className="w-full sm:w-auto px-7 py-3.5 bg-slate-950 text-white rounded-xl font-bold text-sm text-center shadow-lg shadow-black/10 hover:bg-slate-800 transition"
                        href="/login"
                      >
                        Masuk Nasabah
                      </Link>
                      <Link
                        href="/register"
                        className="text-xs font-semibold text-slate-800 hover:text-slate-950 hover:underline"
                      >
                        ⚡ Daftar 1 Menit via NISN / NIK
                      </Link>
                    </div>
                  </div>
                </TiltCard3D>

                {/* Right Card: For Business / Pengelola */}
                <TiltCard3D maxTilt={7} className="rounded-3xl">
                  <div
                    className="bg-[#5eaeff] rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group min-h-[500px] h-full shadow-lg"
                    data-purpose="card-business"
                  >
                    <div className="relative z-10">
                      <span className="inline-block px-3 py-1 rounded-full bg-black/10 text-blue-950 text-xs font-bold tracking-wide uppercase mb-3">
                        Admin &amp; Mitra Daur Ulang
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">For business</h3>
                      <p className="mt-3 text-slate-900/80 font-medium text-sm sm:text-base max-w-sm">
                        Kelola timbang sampah fisik, verifikasi setor, manajemen nasabah, dan rekapitulasi tonase bulanan unit Anda.
                      </p>
                    </div>

                    {/* 3D Card Ledger / File Rack Isometric Mockup */}
                    <div className="relative my-8 h-48 flex items-center justify-center">
                      <div className="w-64 h-36 relative flex items-center justify-center isometric-tilt transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 translate-z-20">
                        {/* Stacked Ledger Rack Effect */}
                        <div className="w-full h-28 bg-blue-700 rounded-xl shadow-2xl p-3 text-white flex flex-col justify-between relative overflow-hidden border border-blue-400/40 translate-z-40">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>TOTAL TONASE</span>
                            <span className="bg-blue-900/60 px-2 py-0.5 rounded text-[10px]">REAL-TIME</span>
                          </div>
                          <div className="text-2xl font-black tracking-tight">
                            {stats ? formatKg(stats.totalSampahTerkumpulKg) : '12.840'}{' '}
                            <span className="text-sm font-normal">Kg</span>
                          </div>
                          {/* Vertical dividers mimicking image file separator lines */}
                          <div className="absolute inset-0 flex divide-x divide-blue-500/30 pointer-events-none">
                            <div className="flex-1" />
                            <div className="flex-1" />
                            <div className="flex-1" />
                            <div className="flex-1" />
                            <div className="flex-1" />
                          </div>
                          <div className="text-[10px] text-blue-200">Scale ID: #UNIT-JKT-04</div>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom Action */}
                    <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center gap-4">
                      <Link
                        className="w-full sm:w-auto px-7 py-3.5 bg-slate-950 text-white rounded-xl font-bold text-sm text-center shadow-lg shadow-black/10 hover:bg-slate-800 transition"
                        href="/login"
                      >
                        Portal Pengelola
                      </Link>
                      <Link
                        href="/register"
                        className="text-xs font-semibold text-slate-800 hover:text-slate-950 hover:underline"
                      >
                        📋 Kelola Timbangan &amp; Logistik
                      </Link>
                    </div>
                  </div>
                </TiltCard3D>
              </div>
            </div>
          </ScrollReveal>
        </section>
        {/* END: Dual Role Open Account Container */}

        {/* BEGIN: Live Stats Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" data-purpose="live-stats">
          <ScrollReveal delay={100}>
            <div className="relative bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 rounded-3xl p-8 sm:p-12 shadow-xl shadow-emerald-950/5 border border-emerald-100/90 overflow-hidden">
              {/* Ambient decorative glow with slow breathing animation */}
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-glow-pulse pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl animate-glow-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

              <div className="relative z-10 text-center max-w-2xl mx-auto mb-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Statistik Dampak Nyata
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Dampak Nyata Bersama Kami
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mt-2">
                  Pencatatan transparan seluruh setoran dan emisi daur ulang secara digital di unit bank sampah.
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {/* Stat 1: Kg Sampah Terkumpul */}
                <div className="p-5 rounded-2xl bg-white/95 border border-emerald-200/70 shadow-xs hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1.5 hover:rotate-1 transition-all duration-300 group preserve-3d">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-xs">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                    <AnimatedCounter target={stats?.totalSampahTerkumpulKg ?? 12840} formatType="kg" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">Kg Sampah Terkumpul</div>
                </div>

                {/* Stat 2: Poin Hadiah Beredar */}
                <div className="p-5 rounded-2xl bg-white/95 border border-sky-200/70 shadow-xs hover:border-sky-400 hover:shadow-xl hover:-translate-y-1.5 hover:-rotate-1 transition-all duration-300 group preserve-3d">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-xs">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-sky-600">
                    <AnimatedCounter target={stats?.totalPoinBeredar ?? 485200} formatType="poin" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">Poin Hadiah Beredar</div>
                </div>

                {/* Stat 3: Transaksi Setor */}
                <div className="p-5 rounded-2xl bg-white/95 border border-teal-200/70 shadow-xs hover:border-teal-400 hover:shadow-xl hover:-translate-y-1.5 hover:rotate-1 transition-all duration-300 group preserve-3d">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-xs">
                    <Recycle className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-teal-600">
                    <AnimatedCounter target={stats?.totalTransaksiSetor ?? 3420} formatType="number" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">Transaksi Setor</div>
                </div>

                {/* Stat 4: Hadiah Ditukarkan */}
                <div className="p-5 rounded-2xl bg-white/95 border border-amber-200/70 shadow-xs hover:border-amber-400 hover:shadow-xl hover:-translate-y-1.5 hover:-rotate-1 transition-all duration-300 group preserve-3d">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-xs">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-amber-600">
                    <AnimatedCounter target={stats?.totalTransaksiPenukaran ?? 915} formatType="number" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">Hadiah Ditukarkan</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
        {/* END: Live Stats Section */}

        {/* BEGIN: How It Works / Process Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28" data-purpose="how-it-works" id="layanan">
          <ScrollReveal delay={120}>
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                Proses Cepat &amp; Praktis
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
                Bagaimana Alur Bank Sampah Bekerja?
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Empat langkah mudah dari pemilahan sampah rumah tangga hingga penukaran poin berharga.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <ScrollReveal delay={150}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full flex flex-col justify-between preserve-3d">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                    01
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition">Pilah Sampah</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pisahkan sampah anorganik (plastik, kertas kardus, kaleng logam) dalam kondisi bersih dan kering.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition duration-300 gap-1">
                  Mulai pemilahan <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal delay={250}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full flex flex-col justify-between preserve-3d">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                    02
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition">Ajukan Setoran</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pilih jenis kategori sampah melalui dashboard nasabah dan dapatkan kode tiket timbang digital.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition duration-300 gap-1">
                  Input pengajuan <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal delay={350}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full flex flex-col justify-between preserve-3d">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                    03
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition">Timbang &amp; Verifikasi</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Bawa sampah ke unit bank sampah terdekat untuk ditimbang secara akurat oleh petugas admin.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition duration-300 gap-1">
                  Verifikasi admin <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </ScrollReveal>

            {/* Step 4 */}
            <ScrollReveal delay={450}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full flex flex-col justify-between preserve-3d">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                    04
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition">Klaim Poin Reward</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Poin otomatis masuk ke saldo. Tukar menjadi sembako, tabungan tunai, atau voucher belanja.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition duration-300 gap-1">
                  Tukar hadiah <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
        {/* END: How It Works / Process Grid */}

        {/* BEGIN: Call to Action Banner */}
        <section
          className="bg-emerald-600 py-20 px-4 sm:px-6 lg:px-8 text-white text-center relative overflow-hidden"
          data-purpose="cta-banner"
          id="kemitraan"
        >
          {/* Animated 3D Floating Glowing Spheres */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl animate-glow-pulse pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-400/30 rounded-full blur-3xl animate-glow-pulse pointer-events-none" style={{ animationDelay: '2.5s' }} />

          <ScrollReveal delay={150}>
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-400/40 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Ekosistem Bersih, Transparan, &amp; Berkelanjutan
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Siap Memulai Langkah Hijau Anda?
              </h2>
              <p className="mt-4 text-emerald-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Daftarkan sekolah, instansi, atau lingkungan RT Anda sekarang dan nikmati ekosistem bank sampah tanpa ribet.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  className="px-8 py-4 rounded-full bg-slate-950 text-white font-bold text-sm shadow-2xl hover:bg-slate-900 hover:scale-105 transition-all duration-300"
                  href="/register"
                >
                  Buat Akun Gratis Sekarang
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
        {/* END: Call to Action Banner */}
      </main>

      {/* BEGIN: Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-sm" data-purpose="main-footer">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800 pb-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-base shadow-sm">
              ♻
            </div>
            <span className="text-lg font-bold text-white">EcoPayard</span>
            <span className="text-xs text-slate-500">| Bank Sampah Digital Indonesia</span>
          </div>
          {/* Footer Navigation Links */}
          <div className="flex flex-wrap gap-6 text-xs font-medium text-slate-400">
            <Link className="hover:text-white transition" href="/setup">
              Setup Tenant
            </Link>
            <Link className="hover:text-white transition" href="/nasabah/kategori-sampah">
              Katalog Sampah
            </Link>
            <Link className="hover:text-white transition" href="/login">
              Portal Masuk
            </Link>
            <Link className="hover:text-white transition" href="/register">
              Registrasi Akun
            </Link>
          </div>
        </div>
        {/* Copyright */}
        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <p>© 2026 Bank Sampah Digital EcoPayard. Seluruh hak cipta dilindungi.</p>
          <p>Mendukung target pengurangan sampah nasional terukur dan berkelanjutan.</p>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
};

export default HomePage;
