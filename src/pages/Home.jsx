import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBloodStore } from '../store/useBloodStore';
import {
  Zap, Bell, ArrowRight, Activity, MapPin, Database,
  X, Phone, Clock, ChevronRight, ChevronLeft, ChevronDown, Users, LogIn, User,
  Droplets, Shield, Search, MessageSquare, FileText, Heart, AlertTriangle
} from 'lucide-react';

// ── Logos ──
import spmcLogo      from '../assets/bloodlinks_logo/spmc-logo.png';
import prcLogo       from '../assets/bloodlinks_logo/prc-logo.png';
import snbcLogo      from '../assets/bloodlinks_logo/snbc-removebg-preview.png';
import davaoLogo     from '../assets/bloodlinks_logo/davao-logo.png';
import bloodlinkLogo from '../assets/bloodlinks_logo/bloodlink-logo.png';

// ── Facility photos ──
import spmc1 from '../assets/facilities/spmc/spmc-1.jpg';
import spmc2 from '../assets/facilities/spmc/spmc-2.webp';
import prc1  from '../assets/facilities/prc/prc-1.jpg';
import snbc1 from '../assets/facilities/snbc/snbc-1.jpg';
import snbc2 from '../assets/facilities/snbc/snbc-2.jpg';

/* ─── Scroll-reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Full-width Hero Carousel ─── */
const heroSlides = [
  { img: snbc1, label: 'Sub National Blood Center', sub: 'DOH Regional Blood Referral Hub · Bajada, Davao City' },
  { img: snbc2, label: 'SNBC — Rare Blood Reserves', sub: 'Tier 3 Fallback · Inter-facility Transfer Coordination' },
  { img: spmc1, label: 'Southern Philippines Medical Center', sub: 'Primary Dispatch Target · Open 24/7' },
  { img: spmc2, label: 'SPMC Blood Production Services', sub: 'Mindanao\'s Largest Government Hospital' },
  { img: prc1,  label: 'Philippine Red Cross Davao Chapter', sub: 'Overflow Routing · Voluntary Blood Collection' },
];

function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const go = (i) => setIdx((i + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    timerRef.current = setInterval(() => go(idx + 1), 5000);
    return () => clearInterval(timerRef.current);
  }, [idx]);

  return (
    <div className="relative w-full h-[480px] md:h-[600px] overflow-hidden select-none">
      {heroSlides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={s.img} alt={s.label} className="w-full h-full object-cover" />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          {/* Slide label */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">BloodLink DVO Partner Facility</p>
            <h2 className="text-white text-2xl md:text-4xl font-extrabold tracking-tight leading-tight mb-1">{s.label}</h2>
            <p className="text-white/70 text-sm">{s.sub}</p>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={() => go(idx - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10">
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => go(idx + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10">
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-8 flex gap-2 z-10">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Full-Bleed Background Carousel with Parallax ─── */
function FullBleedCarousel({ images, alt, translateX }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <div className="relative w-full h-full">
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            i === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={src}
            alt={`${alt} background ${i + 1}`}
            className="absolute top-0 left-0 h-full w-[130%] max-w-none object-cover"
            style={{
              transform: `translateX(${translateX}%)`,
              willChange: 'transform',
            }}
          />
        </div>
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Parallax Showcase Section ─── */
const ParallaxShowcaseSection = React.forwardRef(({
  id,
  isVisible,
  logo,
  badge,
  subtitle,
  title,
  desc,
  bulletPoints,
  contactInfo,
  carouselImages,
  textAlignment = 'left',
  infoBoxText
}, ref) => {
  const containerRef = useRef(null);
  const [bgTranslateX, setBgTranslateX] = useState(0);
  const [textTranslateY, setTextTranslateY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }
          const rect = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const elementHeight = rect.height;
          const totalDist = windowHeight + elementHeight;
          const currentDist = windowHeight - rect.top;

          if (rect.top < windowHeight && rect.bottom > 0) {
            const percentage = currentDist / totalDist; // 0 to 1 range
            
            // Alternating horizontal shift: 
            // Left alignment shifts to the left (-20 to 0)
            // Right alignment shifts to the right (0 to -20 or similar reversed transition)
            const factor = textAlignment === 'right' ? 1 : -1;
            const bgShift = factor * 20 * percentage + (textAlignment === 'right' ? -20 : 0);
            
            setBgTranslateX(bgShift);

            // Text moves vertically: from +80px to -80px
            const textShift = 80 * (0.5 - percentage);
            setTextTranslateY(textShift);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id={id}
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className="relative min-h-[600px] md:h-[650px] flex items-center overflow-hidden w-full select-none scroll-mt-16"
    >
      {/* Background Full-Bleed Carousel */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <FullBleedCarousel images={carouselImages} alt={title} translateX={bgTranslateX} />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-slate-950/65 z-10" />
      </div>

      {/* Overlapping Content Container */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 z-20 w-full flex">
        <div
          className={`w-full max-w-xl transition-all duration-1000 ${
            textAlignment === 'right' ? 'ml-auto' : 'mr-auto'
          } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          style={{
            transform: isVisible ? `translateY(${textTranslateY}px)` : undefined,
            willChange: 'transform',
          }}
        >
          {/* Clean Overlay Content without Card Container */}
          <div className="text-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg">
                <img src={logo} alt={title} className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 border border-white/30 px-2 py-0.5 rounded">
                  {badge}
                </span>
                <p className="text-white/60 text-xs font-bold mt-1 tracking-widest">{subtitle}</p>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-white">
              {title}
            </h2>
            <p className="text-white/90 text-base md:text-lg leading-relaxed mb-6 font-medium">
              {desc}
            </p>

            {/* Metric grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {bulletPoints.map((bp, i) => (
                <div key={i} className="bg-white/10 border border-white/10 rounded-xl p-2.5 text-center">
                  <p className="text-white font-extrabold text-xs md:text-sm">{bp.val}</p>
                  <p className="text-white/60 text-[9px] font-semibold uppercase tracking-wider mt-0.5">{bp.label}</p>
                </div>
              ))}
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-xs text-white/80 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="font-semibold">{contactInfo.hours}</span>
              </div>
            </div>

            {/* Mini Context Note */}
            {infoBoxText && (
              <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3 text-white/70 text-[11px] leading-relaxed">
                {infoBoxText}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

/* ─── Main Page ─── */
export default function Home() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Login Form States
  const [loginRole, setLoginRole] = useState('admin');
  const [email, setEmail] = useState('admin@bloodlink.dvo');
  const [password, setPassword] = useState('pass123');
  const [loginError, setLoginError] = useState('');

  const loginSystemUser = useBloodStore((state) => state.loginSystemUser);

  // Auto-fill emails based on role selection for easy prototype demoing
  const handleRoleChange = (role) => {
    setLoginRole(role);
    setLoginError('');
    if (role === 'superadmin') {
      setEmail('superadmin@bloodlink.dvo');
    } else if (role === 'admin') {
      setEmail('admin@bloodlink.dvo');
    } else if (role === 'registry') {
      setEmail('registry@bloodlink.dvo');
    } else if (role === 'bloodbank') {
      setEmail('bloodbank@bloodlink.dvo');
    } else if (role === 'issuance') {
      setEmail('issuance@bloodlink.dvo');
    } else if (role === 'hospital') {
      setEmail('hospital@bloodlink.dvo');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setLoginError('Email is required.');
      return;
    }

    const authenticatedUser = loginSystemUser(email);
    if (!authenticatedUser) {
      setLoginError('Authentication failed. Role-associated email not recognized.');
      return;
    }

    setShowModal(false);
    if (authenticatedUser.role === 'Super Admin' || authenticatedUser.role === 'Administrator') {
      navigate('/admin/dashboard');
    } else if (authenticatedUser.role === 'Registry Staff') {
      navigate('/registry/dashboard');
    } else if (authenticatedUser.role === 'Blood Bank Staff') {
      navigate('/bloodbank/dashboard');
    } else if (authenticatedUser.role === 'Issuance Personnel' || authenticatedUser.role === 'Hospital User') {
      navigate('/issuance/dashboard');
    }
  };

  const trackRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const totalHeight = rect.height - windowHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const [servRef, servVisible] = useReveal(0.1);
  const [snbcRef, snbcVisible] = useReveal(0.12);
  const [spmcRef, spmcVisible] = useReveal(0.12);
  const [prcRef,  prcVisible]  = useReveal(0.12);
  const [statRef, statVisible] = useReveal(0.2);

  const services = [
    { icon: <Bell className="w-6 h-6 text-[#C21C24]" />,       bg: 'bg-rose-50',    title: 'SMS Gateway Ledger',        desc: 'Semaphore PH gateway transaction log tracking delivery failures.' },
    { icon: <Activity className="w-6 h-6 text-blue-600" />,    bg: 'bg-blue-50',    title: 'MLR Demand Forecast',      desc: 'Predicts future blood bag demand using Multiple Linear Regression OLS.' },
    { icon: <Database className="w-6 h-6 text-purple-600" />,  bg: 'bg-purple-50',  title: 'Equity Allocation',        desc: 'Computes proportional blood distribution weights for hospitals.' },
    { icon: <Shield className="w-6 h-6 text-indigo-600" />,    bg: 'bg-indigo-50',  title: 'Donor Recall Engine',       desc: 'Auto-flags eligible donors after their 90-day rest interval.' },
    { icon: <FileText className="w-6 h-6 text-teal-600" />,    bg: 'bg-teal-50',    title: 'Blood Requests',           desc: 'Hospital pre-submission system with physician signature verification.' },
    { icon: <Search className="w-6 h-6 text-slate-600" />,     bg: 'bg-slate-100',  title: 'Donor Registry',           desc: 'Searchable Davao City donor database with full profile management.' },
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col antialiased" style={{ fontFamily: '"Open Sans", sans-serif' }}>

      {/* ── FIXED HEADER WRAPPER (nav, always follows scroll) ── */}
      <div className="fixed top-0 left-0 right-0 z-50">

      {/* ── NAV HEADER ── */}
      <header className={`bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex items-center gap-3">
            {/* SNBC Logo (Scrolls to SNBC Showcase) */}
            <button onClick={() => scrollTo('snbc')} className="flex items-center focus:outline-none cursor-pointer hover:opacity-80 transition-opacity" title="Scroll to SNBC Showcase">
              <img src={snbcLogo} alt="SNBC" className="h-11 w-auto object-contain" />
            </button>
            <span className="w-px h-6 bg-slate-200" />
            {/* Main Portal Access Logos */}
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 group focus:outline-none cursor-pointer" title="Access BloodLink DVO Portal">
              <img src={bloodlinkLogo} alt="BloodLink" className="h-14 w-auto object-contain group-hover:opacity-80 transition-opacity" />
              <img src={davaoLogo}     alt="Davao"     className="h-12 w-auto object-contain group-hover:opacity-80 transition-opacity" />
            </button>
          </div>

          {/* Hover Dropdown Menus */}
          <div className="hidden lg:flex items-center gap-8 mx-auto">
            {/* System Dropdown */}
            <div className="relative group py-2">
              <button className="text-slate-600 hover:text-[#C21C24] text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none">
                System
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C21C24] transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-white border border-slate-100 shadow-xl rounded-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#C21C24] uppercase tracking-wider">BloodLink DVO</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      An integrated 3-tier blood donor mobilization and transfer routing system customized for Davao City's key service providers.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 space-y-2">
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">Automated Dispatch</p>
                        <p className="text-[10px] text-slate-400">Aho-Corasick matches donors & sends instant SMS notifications.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">Proximity Routing</p>
                        <p className="text-[10px] text-slate-400">Prioritizes donors nearest to the requesting hospital.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Database className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">Live Inventory Tracker</p>
                        <p className="text-[10px] text-slate-400">Monitors blood bag reserves and triggers Tier fallback transfers.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Us Dropdown */}
            <div className="relative group py-2">
              <button className="text-slate-600 hover:text-[#C21C24] text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none">
                About Us
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C21C24] transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white border border-slate-100 shadow-xl rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="space-y-2">
                  <div className="p-2">
                    <p className="text-xs font-bold text-slate-800">University Project</p>
                    <p className="text-[10px] text-slate-400 leading-normal font-semibold mt-0.5">
                      BloodLink DVO is a Capstone research initiative by the University of Mindanao, College of Computing Education.
                    </p>
                  </div>
                  <div className="p-2 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-800">Voluntary Dispatch</p>
                    <p className="text-[10px] text-slate-400 leading-normal font-semibold mt-0.5">
                      Empowering local healthcare via automated donor matching algorithms.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Us Dropdown */}
            <div className="relative group py-2">
              <button className="text-slate-600 hover:text-[#C21C24] text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none">
                Contact Us
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C21C24] transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white border border-slate-100 shadow-xl rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2 p-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C21C24] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">Bolton HQ</p>
                      <p className="text-[10px] text-slate-400">Bolton Street, Davao City, PH</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 border-t border-slate-50">
                    <Phone className="w-3.5 h-3.5 text-[#C21C24] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">Help Desk</p>
                      <p className="text-[10px] text-slate-400">UM Research Office</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partner logos — clickable jump links */}
          <div className="hidden md:flex items-center gap-5">
            <button onClick={() => scrollTo('spmc')} className="flex flex-col items-center gap-0.5 group focus:outline-none cursor-pointer" title="SPMC">
              <img src={spmcLogo} alt="SPMC" className="h-8 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-[9px] font-bold text-slate-400 group-hover:text-[#C21C24] transition-colors tracking-widest">SPMC</span>
            </button>
            <span className="w-px h-8 bg-slate-200" />
            <button onClick={() => scrollTo('prc')} className="flex flex-col items-center gap-0.5 group focus:outline-none cursor-pointer" title="PRC">
              <img src={prcLogo} alt="PRC" className="h-8 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-700 transition-colors tracking-widest">PRC</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <button onClick={() => setShowModal(true)}
              className="flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-none"
              title="Portal Login">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
      </div>{/* END FIXED HEADER WRAPPER */}

      {/* Spacer to push content below fixed nav (64px) */}
      <div className="h-[64px]" />

      {/* ── PORTAL MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg modal-in">
               <div className="px-7 pt-7 pb-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <img src={bloodlinkLogo} alt="BloodLink" className="h-7 w-auto object-contain" />
                  <img src={davaoLogo}     alt="Davao"     className="h-8 w-auto object-contain" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Portal Authentication</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {loginError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Portal Desk</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100/70 border border-slate-200/50 p-1.5 rounded-xl text-[10px] font-bold">
                  {[
                    { id: 'superadmin', label: 'Super Admin' },
                    { id: 'admin', label: 'Admin' },
                    { id: 'registry', label: 'Registry' },
                    { id: 'bloodbank', label: 'Blood Bank' },
                    { id: 'issuance', label: 'Issuance' },
                    { id: 'hospital', label: 'Hospital' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleChange(r.id)}
                      className={`py-1.5 rounded-lg transition-all border ${
                        loginRole === r.id
                          ? 'bg-white text-[#C21C24] border-slate-200/60 shadow-sm'
                          : 'text-slate-500 border-transparent hover:bg-white/50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Helper Info Panel */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-500 leading-normal">
                <span className="font-bold text-slate-800">Mock credentials:</span>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  <li>Super Admin: <code className="font-mono text-rose-600">superadmin@bloodlink.dvo</code></li>
                  <li>Admin: <code className="font-mono text-rose-600">admin@bloodlink.dvo</code></li>
                  <li>Registry Staff: <code className="font-mono text-rose-600">registry@bloodlink.dvo</code></li>
                  <li>Blood Bank Staff: <code className="font-mono text-rose-600">bloodbank@bloodlink.dvo</code></li>
                  <li>Issuance Personnel: <code className="font-mono text-rose-600">issuance@bloodlink.dvo</code></li>
                  <li>Hospital Desk: <code className="font-mono text-rose-600">hospital@bloodlink.dvo</code> (SPMC)</li>
                </ul>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#C21C24] outline-none transition-all"
                  placeholder="name@bloodlink.dvo"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#C21C24] outline-none transition-all"
                   placeholder="pass123"
                 />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#C21C24] hover:bg-[#A8181F] text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" /> Secure Log In
                </button>
              </div>
            </form>
            <div className="px-7 pb-6 text-center text-[11px] text-slate-400 border-t border-slate-50 pt-4">
              BloodLink DVO Secure Authentication Gateway
            </div>
          </div>
        </div>
      )}

      {/* ── HERO CAROUSEL (PRC style, full-width) ── */}
      <HeroCarousel />

      {/* ── STATS BANNER (Moved from bottom) ── */}
      <section className="bg-[#C21C24] py-14 px-6 border-y border-red-700/30">
        <div ref={statRef}
          className={`max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-white transition-all duration-700 ${statVisible ? 'opacity-100 scale-100' : 'opacity-100 scale-100'}`}>
          <div className="py-4 md:py-0">
            <div className="text-3xl md:text-4xl font-extrabold">45 min</div>
            <div className="text-rose-200 text-xs mt-1 font-semibold uppercase tracking-wider">Avg. Mobilization Time</div>
            <div className="text-rose-300 text-[10px] mt-0.5">vs. 4–8 hours manually</div>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-white/20 py-4 md:py-0">
            <div className="text-3xl md:text-4xl font-extrabold">98%</div>
            <div className="text-rose-200 text-xs mt-1 font-semibold uppercase tracking-wider">Matching Accuracy</div>
            <div className="text-rose-300 text-[10px] mt-0.5">Verified donor matching</div>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-white/20 py-4 md:py-0">
            <div className="text-3xl md:text-4xl font-extrabold">3</div>
            <div className="text-rose-200 text-xs mt-1 font-semibold uppercase tracking-wider">Partner Facilities</div>
            <div className="text-rose-300 text-[10px] mt-0.5 font-mono">SPMC · PRC · SNBC</div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: SNBC SPOTLIGHT (DOH Tier 3 Referral Hub) ── */}
      <ParallaxShowcaseSection
        id="snbc"
        ref={snbcRef}
        isVisible={snbcVisible}
        logo={snbcLogo}
        badge="DOH · Tier 3 Referral Hub"
        subtitle="SNBC"
        title="Sub National Blood Center"
        desc="As the DOH-designated sub national blood referral hub for Southern Mindanao, SNBC manages regional inter-facility transfers and maintains reserves of rare blood types. BloodLink DVO integrates SNBC as the Tier 3 emergency fallback — automatically activated when both SPMC and PRC stocks are insufficient to meet urgent patient demands."
        bulletPoints={[
          { label: 'Rare Blood Types', val: 'Covered' },
          { label: 'Activation', val: 'Tier 3' },
          { label: 'Jurisdiction', val: 'Mindanao' }
        ]}
        contactInfo={{
          address: "DOH Compound, Bajada, Davao City",
          phone: "(082) 300-1122",
          hours: "Monday–Friday, 8:00 AM – 5:00 PM"
        }}
        carouselImages={[snbc1, snbc2]}
        textAlignment="left"
        infoBoxText="Why SNBC is Central to BloodLink DVO: As the regional DOH blood authority, SNBC provides the mandate to orchestrate emergency inter-facility transfers — making it the critical fallback node."
      />

      {/* ── SECTION 2: SPMC SHOWCASE (Tier 1 Primary Dispatch) ── */}
      <ParallaxShowcaseSection
        id="spmc"
        ref={spmcRef}
        isVisible={spmcVisible}
        logo={spmcLogo}
        badge="SPMC · Tier 1 Primary Target"
        subtitle="SPMC"
        title="Southern Philippines Medical Center"
        desc="As Mindanao's largest government hospital, SPMC acts as the primary dispatch destination for emergency blood requirements. It operates 24/7 with a direct connection to the BloodLink mobilization dashboard. Whenever a critical shortage alert is triggered, BloodLink DVO prioritizes matching registered donors in close proximity to SPMC to minimize transport and response times."
        bulletPoints={[
          { label: 'Dispatch Level', val: 'Tier 1' },
          { label: 'Availability', val: '24/7 Active' },
          { label: 'Bed Capacity', val: '1,500+' }
        ]}
        contactInfo={{
          address: "JP Laurel Ave, Bajada, Davao City",
          phone: "(082) 227-2731",
          hours: "Open 24/7 (Emergency Dispatch Active)"
        }}
        carouselImages={[spmc1, spmc2]}
        textAlignment="right"
        infoBoxText="Role of SPMC in BloodLink DVO: Receives initial system alerts and direct volunteer dispatch. Most matches resolve at Tier 1 before scaling."
      />

      {/* ── SECTION 3: PRC SHOWCASE (Tier 2 Overflow Hub) ── */}
      <ParallaxShowcaseSection
        id="prc"
        ref={prcRef}
        isVisible={prcVisible}
        logo={prcLogo}
        badge="PRC · Tier 2 Overflow"
        subtitle="PRC DAVAO"
        title="Philippine Red Cross Davao Chapter"
        desc="The Philippine Red Cross Davao Chapter coordinates massive voluntary donation drives and serves as the Tier 2 overflow buffer. Automatically queried when SPMC's primary stock drops below critical levels. PRC plays a key role in the BloodLink DVO network by bridging voluntary walk-in registries and direct emergency hospital dispatches, keeping secondary blood bags ready for mobilization."
        bulletPoints={[
          { label: 'Routing Tier', val: 'Tier 2' },
          { label: 'Operations', val: 'Mon-Sat' },
          { label: 'Registry Type', val: 'Voluntary' }
        ]}
        contactInfo={{
          address: "Roxas Ave, Poblacion District, Davao City",
          phone: "(082) 221-2131",
          hours: "Mon–Sat, 8:00 AM – 5:00 PM (Voluntary Collection)"
        }}
        carouselImages={[prc1]}
        textAlignment="left"
        infoBoxText="Role of PRC in BloodLink DVO: Bridge between voluntary walk-in registries and direct hospital transfers, managing secondary reserves."
      />

      {/* ── DARK FOOTER (PRC style multi-column) ── */}
      <footer className="bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={bloodlinkLogo} alt="BloodLink" className="h-10 w-auto object-contain brightness-0 invert" />
              <img src={davaoLogo} alt="Davao" className="h-10 w-auto object-contain brightness-0 invert opacity-80" />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              A capstone research system connecting urgent blood shortages with verified local donors through real-time algorithmic matching across Davao City's blood service network.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <img src={spmcLogo} alt="SPMC" className="h-7 w-auto object-contain brightness-0 invert opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => scrollTo('spmc')} />
              <img src={prcLogo}  alt="PRC"  className="h-7 w-auto object-contain brightness-0 invert opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => scrollTo('prc')} />
              <img src={snbcLogo} alt="SNBC" className="h-9 w-auto object-contain brightness-0 invert opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => scrollTo('snbc')} />
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-4">System</h5>
            <ul className="space-y-2.5 text-slate-400 text-xs">
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Blood Center Portal</Link></li>
              <li><Link to="/donor/register" className="hover:text-white transition-colors">Donor Registration</Link></li>
              <li><button onClick={() => scrollTo('snbc')} className="hover:text-white transition-colors text-left">SNBC Spotlight</button></li>
              <li><button onClick={() => scrollTo('spmc')} className="hover:text-white transition-colors text-left">SPMC</button></li>
              <li><button onClick={() => scrollTo('prc')} className="hover:text-white transition-colors text-left">PRC Davao</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Contact</h5>
            <ul className="space-y-2.5 text-slate-400 text-xs">
              <li className="flex items-start gap-2"><MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />Bolton Street, Davao City, Philippines</li>
              <li className="flex items-center gap-2"><Phone className="w-3 h-3 flex-shrink-0" />University of Mindanao</li>
              <li className="flex items-center gap-2"><MessageSquare className="w-3 h-3 flex-shrink-0" />College of Computing Education</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 px-6 text-center text-[11px] text-slate-500">
          BloodLink DVO Capstone Project &copy; {new Date().getFullYear()} · University of Mindanao — College of Computing Education
        </div>
      </footer>

    </div>
  );
}
