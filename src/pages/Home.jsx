import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Zap, Bell, ArrowRight, Activity, MapPin,
  Sparkles, X, Phone, Clock, ChevronRight, ChevronLeft, Users, Droplets
} from 'lucide-react';

// ── Logos ──
import spmcLogo     from '../assets/bloodlinks_logo/spmc-logo.png';
import prcLogo      from '../assets/bloodlinks_logo/prc-logo.png';
import snbcLogo     from '../assets/bloodlinks_logo/snbc-removebg-preview.png';
import davaoLogo    from '../assets/bloodlinks_logo/davao-logo.png';
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

/* ─── Image Carousel ─── */
function Carousel({ images, alt }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  return (
    <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl group select-none">
      {/* Images */}
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Arrows — only show if more than 1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === idx ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Facility Row ─── */
function FacilityRow({ id, images, logo, logoAlt, name, acronym, type, status, statusColor,
  address, phone, hours, accent, whyColor, whyText, tierLabel, dispatch, reverse }) {

  const [ref, visible] = useReveal();

  const base = 'transition-all ease-out duration-700';
  const fromLeft  = visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16';
  const fromRight = visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16';

  const photoPanel = (
    <div className={`${base} ${reverse ? fromRight : fromLeft}`}>
      {/* Small logo badge above carousel */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white rounded-xl shadow border border-slate-100 flex items-center justify-center p-1 flex-shrink-0">
          <img src={logo} alt={logoAlt} className="w-full h-full object-contain" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
            style={{ color: accent, borderColor: accent, background: `${accent}12` }}>
            {type}
          </span>
        </div>
      </div>
      <Carousel images={images} alt={acronym} />
    </div>
  );

  const textPanel = (
    <div className={`flex flex-col justify-center ${base} ${reverse ? fromLeft : fromRight} delay-100`}>
      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{status}</span>
      </div>

      {/* Name */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
        {name}
      </h2>
      <p className="text-lg font-black tracking-widest mb-5" style={{ color: accent }}>{acronym}</p>

      {/* Contact */}
      <div className="space-y-2 text-sm text-slate-500 mb-6">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>{address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-700">{hours}</span>
        </div>
      </div>

      {/* Why integrated */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: `${whyColor}0e`, border: `1px solid ${whyColor}28` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: whyColor }}>
          Why Integrated
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">{whyText}</p>
      </div>

      {/* Tier badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
          style={{ color: accent, borderColor: accent, background: `${accent}10` }}>
          <Droplets className="w-3.5 h-3.5" />{dispatch}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
          <Users className="w-3.5 h-3.5" />{tierLabel}
        </span>
      </div>
    </div>
  );

  return (
    <div id={id} ref={ref} className="py-20 md:py-28 border-b border-slate-100 last:border-0 scroll-mt-20">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        {reverse ? <>{textPanel}{photoPanel}</> : <>{photoPanel}{textPanel}</>}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [heroRef, heroVisible] = useReveal(0.1);
  const [featRef, featVisible] = useReveal(0.15);
  const [statRef, statVisible] = useReveal(0.2);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white min-h-screen text-slate-800 flex flex-col antialiased overflow-x-hidden" style={{ fontFamily: '"Open Sans", sans-serif' }}>

      {/* ── STICKY HEADER ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 py-3.5 px-6 md:px-12 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* BloodLink Logo — opens modal */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2.5 group focus:outline-none"
            title="Access BloodLink DVO System"
          >
            <img src={bloodlinkLogo} alt="BloodLink" className="h-14 w-auto object-contain group-hover:opacity-80 transition-opacity" />
            <img src={davaoLogo} alt="Davao" className="h-12 w-auto object-contain" />
          </button>

          <div className="flex items-center gap-5">
            {/* ── Clickable partner logos ── */}
            <div className="hidden md:flex items-center gap-4">
              {/* SPMC */}
              <button
                onClick={() => scrollTo('spmc')}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
                title="Jump to SPMC"
              >
                <img src={spmcLogo} alt="SPMC" className="h-8 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-[9px] font-bold text-slate-400 group-hover:text-[#C21C24] transition-colors tracking-widest">SPMC</span>
              </button>

              <span className="w-px h-8 bg-slate-200" />

              {/* PRC */}
              <button
                onClick={() => scrollTo('prc')}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
                title="Jump to PRC"
              >
                <img src={prcLogo} alt="PRC" className="h-8 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-700 transition-colors tracking-widest">PRC</span>
              </button>

              <span className="w-px h-8 bg-slate-200" />

              {/* SNBC */}
              <button
                onClick={() => scrollTo('snbc')}
                className="flex flex-col items-center gap-0.5 group focus:outline-none"
                title="Jump to SNBC"
              >
                <img src={snbcLogo} alt="SNBC" className="h-11 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-700 transition-colors tracking-widest">SNBC</span>
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200 hidden md:block" />

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#C21C24] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#A8181F] transition-colors shadow-sm"
            >
              <span>Access System</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── PORTAL MODAL ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg fade-in">
            <div className="px-7 pt-7 pb-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <img src={bloodlinkLogo} alt="BloodLink" className="h-9 w-auto object-contain" />
                <img src={davaoLogo} alt="Davao" className="h-10 w-auto object-contain" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Select your access portal to continue</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Admin */}
              <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition-colors">
                    <Activity className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">Blood Center Portal</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">For center administrators and healthcare facilities</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">Monitor inventory shortages, trigger emergency donor matching, manage real-time turnout dashboards, and oversee automated SMS dispatch routing.</p>
                  </div>
                </div>
                <Link to="/admin/dashboard" onClick={() => setShowModal(false)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm">
                  <span>Access Admin Console</span><ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Donor */}
              <div className="border border-rose-100 rounded-xl p-5 hover:border-rose-300 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100 transition-colors">
                    <Heart className="w-5 h-5 text-[#C21C24]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">Donor Portal</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">For voluntary blood donors and advocates</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">Register your profile, view real-time blood shortage alerts across the city, log your donation history, and instantly respond to urgent requests.</p>
                  </div>
                </div>
                <Link to="/donor/register" onClick={() => setShowModal(false)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#C21C24] text-white py-2.5 px-5 rounded-lg text-xs font-bold hover:bg-[#A8181F] transition-colors shadow-sm">
                  <span>Access Donor Portal</span><ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="px-7 pb-6 text-center text-[11px] text-slate-400 font-medium">
              BloodLink DVO · University of Mindanao Capstone Project
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="px-6 pt-24 pb-12 max-w-7xl mx-auto w-full">
        <div ref={heroRef}
          className={`text-center max-w-3xl mx-auto transition-all duration-700 ease-out ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#C21C24] bg-rose-50 border border-rose-100 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Davao City Blood Mobilization Initiative</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">
            Automated. Intelligent.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C21C24] to-rose-700">Life-Saving.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Connecting urgent blood shortages with verified local donors through real-time algorithmic matching — across Davao City's three major blood service facilities.
          </p>
        </div>
      </section>

      {/* ── SECTION HEADER ── */}
      <div className="text-center pb-4 max-w-7xl mx-auto w-full px-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Partner Network</p>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Integrated Blood Service Facilities</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          BloodLink DVO is directly linked to Davao City's three primary blood banking institutions — each with a specific role in the emergency dispatch chain.
        </p>
      </div>

      {/* ── FACILITY ROWS ── */}
      <div className="max-w-6xl mx-auto w-full px-6">

        <FacilityRow
          id="spmc"
          images={[spmc1, spmc2]}
          logo={spmcLogo} logoAlt="SPMC"
          name="Southern Philippines Medical Center"
          acronym="SPMC"
          type="Gov't Hospital · Tier 1"
          status="24 / 7 Active"
          statusColor="bg-emerald-400"
          address="JP Laurel Ave, Bajada, Davao City"
          phone="(082) 227-2731"
          hours="Open 24 hours, 7 days a week"
          accent="#C21C24"
          whyColor="#C21C24"
          whyText="As Mindanao's largest government tertiary hospital, SPMC handles the highest volume of trauma, surgical, and critical care cases in Davao. Its Blood Production Services unit is the primary mobilization target in BloodLink DVO's emergency dispatch chain — requiring the fastest donor response times."
          tierLabel="Priority Tier 1"
          dispatch="Primary Dispatch"
          reverse={false}
        />

        <FacilityRow
          id="prc"
          images={[prc1]}
          logo={prcLogo} logoAlt="PRC"
          name="Philippine Red Cross Davao Chapter"
          acronym="PRC"
          type="NGO · National · Tier 2"
          status="8 AM – 5 PM Mon–Sat"
          statusColor="bg-amber-400"
          address="Roxas Ave, Poblacion District, Davao City"
          phone="(082) 221-2131"
          hours="Monday – Saturday, 8:00 AM – 5:00 PM"
          accent="#1E3A5F"
          whyColor="#1E3A5F"
          whyText="The Philippine Red Cross Davao Chapter operates one of the most active voluntary blood collection programs in the region. BloodLink DVO routes donor registrations and surplus mobilization alerts through the PRC network — enabling cross-center inventory balancing during shortage peaks at SPMC."
          tierLabel="Priority Tier 2"
          dispatch="Overflow Routing"
          reverse={true}
        />

        <FacilityRow
          id="snbc"
          images={[snbc1, snbc2]}
          logo={snbcLogo} logoAlt="SNBC"
          name="Sub National Blood Center"
          acronym="SNBC"
          type="DOH · Regional · Tier 3"
          status="8 AM – 5 PM Mon–Fri"
          statusColor="bg-sky-400"
          address="DOH Compound, Bajada, Davao City"
          phone="(082) 300-1122"
          hours="Monday – Friday, 8:00 AM – 5:00 PM"
          accent="#1D4ED8"
          whyColor="#1D4ED8"
          whyText="As the DOH-designated sub national blood referral hub for Southern Mindanao, SNBC manages inter-facility blood transfers and rare blood type reserves. BloodLink DVO integrates SNBC as the Tier 3 fallback — activated when both SPMC and PRC stocks are insufficient to cover emergency shortfall volumes."
          tierLabel="Priority Tier 3"
          dispatch="Rare Reserves"
          reverse={false}
        />

      </div>

      {/* ── FEATURES ── */}
      <section className="bg-slate-50 border-t border-slate-200 mt-8">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div ref={featRef}
            className={`transition-all duration-700 ease-out ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h4 className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-10">System Architecture Strengths</h4>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1.5">Automated Matching</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">Utilizes an optimized Aho-Corasick match filter to pair donor profiles with specific blood products in under two seconds.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1.5">Geographic Prioritization</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">Ranks and maps donors by live proximity radius to the requesting center, minimizing critical transport and response delays.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#C21C24]" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1.5">Instant Notifications</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">Dispatches rapid, targeted SMS alert sequences to eligible donor tiers, allowing quick confirmation and scheduling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-t border-slate-200">
        <div ref={statRef}
          className={`max-w-4xl mx-auto px-6 py-16 grid grid-cols-3 gap-6 text-center transition-all duration-700 ease-out ${statVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">45 min</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold">Avg. Mobilization Time</div>
            <div className="text-[10px] text-slate-400 mt-0.5">(vs. 4–8 hours manually)</div>
          </div>
          <div className="border-l border-slate-200">
            <div className="text-3xl font-extrabold text-slate-900">98%</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold">Matching Accuracy</div>
            <div className="text-[10px] text-slate-400 mt-0.5">(verified donor matching)</div>
          </div>
          <div className="border-l border-slate-200">
            <div className="text-3xl font-extrabold text-slate-900">3 Centers</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold">Davao City Facilities</div>
            <div className="text-[10px] text-slate-400 mt-0.5">SPMC, PRC, &amp; SNBC</div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600">University of Mindanao — College of Computing Education</p>
        <p className="mt-1">BloodLink DVO Capstone Project &copy; {new Date().getFullYear()}</p>
      </footer>

    </div>
  );
}
