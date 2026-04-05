import React, { useState, useRef, useCallback, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   BIRDIE GOLF STUDIOS — Customer Booking Website
   Responsive React app with Supabase backend
   ═══════════════════════════════════════════════════════════ */

/* ─── Supabase Client ─── */
const SUPABASE_URL = "https://dvaviudmsofyqttcazpw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YXZpdWRtc29meXF0dGNhenB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODc1MTgsImV4cCI6MjA5MDM2MzUxOH0.SWrAlnKZ33cIAQmn0dAQFfcAZ6b8qBZcp6Dyq2gMb2g";

const sb = {
  headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
  async get(table, query = "") {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: this.headers });
      return r.ok ? await r.json() : [];
    } catch { return []; }
  },
  async post(table, data) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: this.headers, body: JSON.stringify(data) });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  },
  async patch(table, query, data) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { method: "PATCH", headers: this.headers, body: JSON.stringify(data) });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  },
  async del(table, query) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { method: "DELETE", headers: this.headers });
      return true;
    } catch { return false; }
  }
};

/* ─── Square Integration ─── */
const SQUARE_APP_ID = "sandbox-sq0idb-B5-swZBCJSc2NwH6nZCw2g";
const SQUARE_LOCATION_ID = "LHYS7H99XC8WD";
const SQUARE_FN_URL = `${SUPABASE_URL}/functions/v1/square-proxy`;

const square = async (action, params = {}) => {
  try {
    const r = await fetch(SQUARE_FN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ action, ...params }),
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
};

/* ─── Fonts & Icons ─── */
const ff = "'DM Sans',sans-serif", mono = "'JetBrains Mono',monospace";
const Ic = ({ d, z = 18 }) => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
const X = {
  grid: z => <Ic z={z} d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  cal: z => <Ic z={z} d="M3 4h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2zM16 2v4M8 2v4M3 10h18" />,
  user: z => <Ic z={z} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />,
  crown: z => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M4 20l2-14 4 6 2-8 2 8 4-6 2 14" /></svg>,
  chk: z => <Ic z={z} d="M20 6L9 17l-5-5" />,
  card: z => <Ic z={z} d="M1 4h22a2 2 0 012 2v12a2 2 0 01-2 2H1a2 2 0 01-2-2V6a2 2 0 012-2zM1 10h22" />,
  x: z => <Ic z={z} d="M18 6L6 18M6 6l12 12" />,
  clock: z => <Ic z={z} d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />,
  mail: z => <Ic z={z} d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6" />,
  phone: z => <Ic z={z} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />,
  edit: z => <Ic z={z} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />,
  out: z => <Ic z={z} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
  coach: z => <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M9 13a5 5 0 00-5 5v2h10v-2a5 5 0 00-5-5z"/><circle cx="17" cy="10" r="2.5"/><path d="M17 14.5c-2 0-3.5 1.5-3.5 3.5v2H21v-2c0-2-1.5-3.5-3.5-3.5z"/></svg>,
  chevL: z => <Ic z={z} d="M15 18l-6-6 6-6" />,
  plus: z => <Ic z={z} d="M12 5v14M5 12h14" />,
  trash: z => <Ic z={z} d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />,
};

/* ─── Business Constants ─── */
const TIERS = {
  starter: { n: "Starter", c: "#4A8B6E", badge: "STR", price: 45, hrs: 0, disc: 0.20, perks: ["20% off hourly bay rate"] },
  player: { n: "Player", c: "#2D8A5E", badge: "PLR", price: 200, hrs: 8, disc: 0.20, perks: ["8 hrs bay rental/mo", "20% off additional hours", "15% off F&B", "10% off retail", "Club storage", "Members-only events"] },
  champion: { n: "Champion", c: "#124A2B", badge: "CHP", price: 600, hrs: -1, disc: 0, maxBk: 2, perks: ["Unlimited bay rental (max 2hr/booking)", "15% off F&B", "10% off retail", "Club storage", "Members-only events"] },
};

/* Default: coaches available all operating hours. Admin updates override via Supabase. */
const ALL_WD_SLOTS = ["7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM"];
const ALL_WE_SLOTS = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM"];
const FULL_AV = { Mon: ALL_WD_SLOTS, Tue: ALL_WD_SLOTS, Wed: ALL_WD_SLOTS, Thu: ALL_WD_SLOTS, Fri: ALL_WD_SLOTS, Sat: ALL_WE_SLOTS, Sun: ALL_WE_SLOTS };

const COACHES = [
  { id: "TMiznwW3c_E9-NTW", n: "Santiago Espinoza", ini: "SE", av: { ...FULL_AV } },
  { id: "TMa5N23NEiU89Spy", n: "Nicolas Cavero", ini: "NC", av: { ...FULL_AV } },
];

/* ─── Time / Date Helpers ─── */
const ALL_TIMES = ["7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM"];
const WK_TIMES = ALL_TIMES.filter(t => { const h = toH(t); return h >= 9 && h < 21; });
function toH(s) { const [t, ap] = s.split(" "); let [h, m] = t.split(":").map(Number); if (ap === "PM" && h !== 12) h += 12; if (ap === "AM" && h === 12) h = 0; return h + m / 60; }
function fmtDate(d) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
function fmtDateLong(d) { return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
function dateKey(d) { return d.toISOString().split("T")[0]; }
function dayName(d) { return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]; }
function isWeekend(d) { return d.getDay() === 0 || d.getDay() === 6; }
function gen14() { const a = [], t = new Date(); t.setHours(0,0,0,0); for (let i = 0; i < 14; i++) { const d = new Date(t); d.setDate(t.getDate() + i); a.push(d); } return a; }
function getHours(d) { return isWeekend(d) ? WK_TIMES : ALL_TIMES.filter(t => { const h = toH(t); return h >= 7 && h < 22; }); }

/* ─── Availability Logic ─── */
function isBayBlocked(bayId, dt, slot, bayBlocks) {
  const dk = dateKey(dt);
  return bayBlocks.some(b => {
    if (!b.bays.includes(bayId)) return false;
    if (dk < b.from_date && dk < b.from) return false;
    if (dk > b.to_date && dk > b.to) return false;
    const from = b.from_date || b.from, to = b.to_date || b.to;
    if (dk < from || dk > to) return false;
    if (b.all_day || b.allDay) return true;
    const tf = b.time_from || b.timeFrom, tt = b.time_to || b.timeTo;
    if (!tf || !tt) return true;
    const sh = toH(tf), eh = toH(tt), th = toH(slot);
    return th >= sh && th < eh;
  });
}

function getBk(dt, slot, realBookings) {
  const dk = dt.toISOString().split("T")[0];
  const occupied = [];
  (realBookings || []).forEach(b => {
    if (b.status === "cancelled" || b.date !== dk || !b.bay) return;
    const allT = ["7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM"];
    const bsi = allT.indexOf(b.start_time), si = allT.indexOf(slot);
    if (bsi >= 0 && si >= bsi && si < bsi + (b.duration_slots || 2)) occupied.push(b.bay);
  });
  return occupied;
}

function getAvailBays(dt, startSlot, durSlots, bayBlocks, realBookings) {
  const hrs = getHours(dt); const si = hrs.indexOf(startSlot);
  if (si === -1) return [];
  const needed = hrs.slice(si, si + durSlots);
  if (needed.length < durSlots) return [];
  return [1,2,3,4,5].map(bay => ({ bay, ok: needed.every(s => !getBk(dt, s, realBookings).includes(bay) && !isBayBlocked(bay, dt, s, bayBlocks)) }));
}

function isSameLocalDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function getAllTimes(dt, durSlots, bayBlocks, realBookings) {
  const hrs = getHours(dt), result = [];
  const now = new Date();
  const isToday = isSameLocalDay(dt, now);
  const currentH = now.getHours() + now.getMinutes() / 60;
  for (let i = 0; i <= hrs.length - durSlots; i++) {
    const needed = hrs.slice(i, i + durSlots);
    const consecutive = needed.every((s, j) => j === 0 || toH(s) - toH(needed[j - 1]) === 0.5);
    if (!consecutive) continue;
    if (isToday && toH(hrs[i]) <= currentH) { result.push({ time: hrs[i], open: false }); continue; }
    const anyBayFree = [1,2,3,4,5].some(bay => needed.every(s => !getBk(dt, s, realBookings).includes(bay) && !isBayBlocked(bay, dt, s, bayBlocks)));
    result.push({ time: hrs[i], open: anyBayFree });
  }
  return result;
}

/* Pricing */
function isPeak(dt, slot) { return !isWeekend(dt) && toH(slot) >= 17; }
function slotRate(dt, slot, cfg) { return isWeekend(dt) ? cfg.wk : isPeak(dt, slot) ? cfg.pk : cfg.op; }
function calcPrice(dt, startSlot, durSlots, tier, bayCredits, cfg) {
  const hrs = getHours(dt), si = hrs.indexOf(startSlot), needed = hrs.slice(si, si + durSlots), durHrs = durSlots * 0.5;
  if (tier === "champion") return { total: 0, disc: 0, credits: durHrs, base: 0 };
  let base = 0; needed.forEach(s => { base += slotRate(dt, s, cfg) * 0.5; });
  if (tier === "player") {
    const credHrs = Math.min(bayCredits, durHrs), credSlots = credHrs * 2;
    let paidBase = 0; needed.slice(credSlots).forEach(s => { paidBase += slotRate(dt, s, cfg) * 0.5; });
    const disc = paidBase * 0.20;
    return { total: paidBase - disc, disc, credits: credHrs, base };
  }
  if (tier === "starter") { const disc = base * 0.20; return { total: base - disc, disc, credits: 0, base }; }
  return { total: base, disc: 0, credits: 0, base };
}

function lessonPrice(tier, hasCredits, creditCoachId, selCoach) {
  if (hasCredits && creditCoachId === selCoach) return { total: 0, credit: true, label: "$0 (1 credit)" };
  return { total: (tier && tier !== "none") ? 120 : 150, credit: false, label: "$" + ((tier && tier !== "none") ? 120 : 150) + ".00" };
}

/* Lesson helpers */
function getLessonTimes(dt, coachFilter, bayBlocks, realBookings) {
  const dn = dayName(dt), hrs = getHours(dt), times = new Set();
  const now = new Date();
  const isToday = isSameLocalDay(dt, now);
  const currentH = now.getHours() + now.getMinutes() / 60;
  (coachFilter ? [coachFilter] : COACHES).forEach(c => {
    const avSlots = c.av[dn] || [];
    avSlots.forEach((s, si) => {
      const next = avSlots[si + 1];
      if (!next || toH(next) - toH(s) !== 0.5) return;
      if (isToday && toH(s) <= currentH) return;
      if ([1,2,3,4,5].some(bay => [s, next].every(sl => !getBk(dt, sl, realBookings).includes(bay) && !isBayBlocked(bay, dt, sl, bayBlocks))) && hrs.includes(s)) times.add(s);
    });
  });
  return [...times].sort((a, b) => toH(a) - toH(b));
}
function getCoachesAt(dt, time, bayBlocks, realBookings) {
  const dn = dayName(dt);
  return COACHES.filter(c => {
    const avSlots = c.av[dn] || [], si = avSlots.indexOf(time);
    if (si === -1) return false;
    const next = avSlots[si + 1];
    if (!next || toH(next) - toH(time) !== 0.5) return false;
    return [1,2,3,4,5].some(bay => [time, next].every(sl => !getBk(dt, sl, realBookings).includes(bay) && !isBayBlocked(bay, dt, sl, bayBlocks)));
  });
}
function autoAssignBay(dt, time, bayBlocks, realBookings) {
  const hrs = getHours(dt), si = hrs.indexOf(time), needed = [time, hrs[si + 1]];
  for (let bay = 1; bay <= 5; bay++) { if (needed.every(s => !getBk(dt, s, realBookings).includes(bay) && !isBayBlocked(bay, dt, s, bayBlocks))) return bay; }
  return 1;
}

/* ─── Responsive hook ─── */
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return w;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function BirdieGolfWebsite() {
  const width = useWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  /* Auth */
  const [authStep, setAuthStep] = useState("phone");
  const [logged, setLogged] = useState(false);
  const [ph, setPh] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [onbF, setOnbF] = useState("");
  const [onbL, setOnbL] = useState("");
  const [onbE, setOnbE] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [sqCustId, setSqCustId] = useState(null); // Square customer ID
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const editOtpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const cardExpRef = useRef(); const cardCvcRef = useRef();

  /* Nav & Toast */
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState(null);
  const fire = useCallback(m => { setToast(m); setTimeout(() => setToast(null), 3200); }, []);

  /* Config — loaded from Supabase */
  const [cfg, setCfg] = useState({ pk: 75, op: 50, wk: 50 });
  const [bayBlocks, setBayBlocks] = useState([
    { id: 1, bays: [2], from: "2026-03-20", to: "2026-03-22", allDay: true, reason: "Trackman calibration" },
    { id: 2, bays: [1, 3], from: "2026-03-25", to: "2026-03-25", timeFrom: "5:00 PM", timeTo: "9:00 PM", allDay: false, reason: "Private event" },
  ]);

  /* Profile */
  const [profPhone, setProfPhone] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [cards, setCards] = useState([]);
  const [addCard, setAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ num: "", exp: "", cvc: "" });

  /* Membership */
  const [tier, setTier] = useState("none");
  const [bayCredits, setBayCredits] = useState(0);
  const [memTab, setMemTab] = useState("current");
  const [memModal, setMemModal] = useState(null);
  const [renewDate, setRenewDate] = useState(null);
  const [memberSince, setMemberSince] = useState(null);

  /* Bay booking */
  const [bkStep, setBkStep] = useState(0);
  const [bkDate, setBkDate] = useState(null);
  const [bkDur, setBkDur] = useState(null);
  const [bkTime, setBkTime] = useState(null);
  const [bkBay, setBkBay] = useState(null);
  const [bkAgree, setBkAgree] = useState(false);

  /* Lesson booking */
  const [lesTab, setLesTab] = useState("book");
  const [lesMode, setLesMode] = useState("date");
  const [lesDate, setLesDate] = useState(null);
  const [lesTime, setLesTime] = useState(null);
  const [lesCoach, setLesCoach] = useState(null);
  const [lesStep, setLesStep] = useState(0);
  const [lesAgree, setLesAgree] = useState(false);
  const [pkgCoach, setPkgCoach] = useState(null);
  const [selPkg, setSelPkg] = useState(null);

  /* Lesson credits */
  const [totL, setTotL] = useState(0);
  const [maxL, setMaxL] = useState(0);
  const [creditCoachId, setCreditCoachId] = useState(null);
  const [creditPkg, setCreditPkg] = useState(null);
  const [creditExp, setCreditExp] = useState(null);
  const [creditPurchaseDate, setCreditPurchaseDate] = useState(null);
  const [lesHistory, setLesHistory] = useState([]);
  const [creditUsage, setCreditUsage] = useState([]);

  /* Upcoming & Transactions */
  const [upcomingBk, setUpcomingBk] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [manageBk, setManageBk] = useState(null); // booking being managed (edit/cancel)
  const [transactions, setTransactions] = useState([]);
  const [memHistory] = useState([]);

  const days14 = gen14();
  const creditCoach = COACHES.find(c => c.id === creditCoachId);
  const tierData = TIERS[tier] || null;
  const resetBk = () => { setBkStep(0); setBkDate(null); setBkDur(null); setBkTime(null); setBkBay(null); setBkAgree(false); };
  const hasCard = cards.length > 0;
  const resetLes = () => { setLesStep(0); setLesDate(null); setLesTime(null); setLesCoach(null); setLesAgree(false); };

  /* ─── Load data from Supabase on mount ─── */
  useEffect(() => {
    (async () => {
      const pricing = await sb.get("pricing_config", "select=*");
      if (pricing?.[0]) setCfg({ pk: pricing[0].peak_rate, op: pricing[0].off_peak_rate, wk: pricing[0].weekend_rate });
      const blocks = await sb.get("bay_blocks", "select=*");
      if (blocks?.length) setBayBlocks(blocks);
      const allBks = await sb.get("bookings", "select=id,bay,date,start_time,duration_slots,status,type&status=neq.cancelled");
      if (allBks?.length) setAllBookings(allBks);
    })();
  }, []);

  /* Load user-specific data (transactions, bookings, membership, lesson credits) */
  const loadUserData = useCallback(async (cid) => {
    if (!cid) return;
    // Transactions
    const txns = await sb.get("transactions", `select=*&customer_id=eq.${cid}&order=created_at.desc`);
    if (txns?.length) setTransactions(txns.map(t => ({
      desc: t.description, date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      method: t.payment_label || "Card", amt: "$" + Number(t.amount).toFixed(2),
    })));
    // Upcoming bookings — always overwrite from Supabase
    const today = new Date(); today.setHours(0,0,0,0);
    const bks = await sb.get("bookings", `select=*&customer_id=eq.${cid}&status=eq.confirmed&order=date.asc`);
    const upcoming = (bks || []).filter(b => new Date(b.date + "T23:59:59") >= today);
    setUpcomingBk(upcoming.map(b => ({
      id: b.id, type: b.type, label: b.type === "lesson" ? "Lesson · " + (b.coach_name || "") : "Bay " + b.bay,
      sub: new Date(b.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " · " + b.start_time + " · " + (b.duration_slots * 0.5) + "hr" + (b.duration_slots > 2 ? "s" : ""),
    })));
    // Membership — always reload from Supabase (reflects admin changes)
    const custData = await sb.get("customers", `id=eq.${cid}&select=tier,bay_credits_remaining,bay_credits_total,renewal_date,member_since`);
    if (custData?.[0]) {
      const c = custData[0];
      setTier(c.tier || "none");
      setBayCredits(c.bay_credits_remaining || 0);
      if (c.renewal_date) setRenewDate(new Date(c.renewal_date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
      if (c.member_since) setMemberSince(new Date(c.member_since + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
    }
    // Active lesson package
    const pkgs = await sb.get("lesson_packages", `customer_id=eq.${cid}&status=eq.active&select=*&order=purchase_date.desc`);
    if (pkgs?.length) {
      const pkg = pkgs[0];
      setTotL(pkg.remaining_credits || 0);
      setMaxL(pkg.total_credits || 0);
      setCreditCoachId(pkg.coach_id || null);
      setCreditPkg(pkg.name || "");
      if (pkg.purchase_date) setCreditPurchaseDate(new Date(pkg.purchase_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
      if (pkg.expiry_date) setCreditExp(new Date(pkg.expiry_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
    }
  }, []);

  /* Load saved cards from Supabase */
  const loadCards = useCallback(async (cid) => {
    if (!cid) return;
    const saved = await sb.get("payment_methods", `customer_id=eq.${cid}&select=*&order=created_at.asc`);
    if (saved?.length) setCards(saved.map(c => ({ id: c.id, brand: c.brand, last4: c.last4, exp: c.exp })));
  }, []);

  /* ─── Email notifications ─── */
  const sendEmail = async (type, data) => {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/square-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ action: "email.send", type, ...data }),
      });
    } catch (e) { console.warn("Email send failed:", e); }
  };

  /* ─── Save booking to Supabase ─── */
  const saveBayBooking = async (bookingData) => {
    // 1. Charge via Square (if amount > 0 and customer has Square profile)
    let sqPaymentId = null;
    if (bookingData.total > 0 && sqCustId) {
      const payment = await square("payment.create", {
        square_customer_id: sqCustId,
        amount: bookingData.total,
        note: `Bay ${bookingData.bay} · ${bookingData.time} · ${bookingData.durSlots * 0.5}hr`,
      });
      sqPaymentId = payment?.payment?.id;
      if (payment?.errors) { console.error("Square payment failed:", payment.errors); }
    }
    // 2. Save booking to Supabase
    const result = await sb.post("bookings", {
      customer_id: customerId, type: "bay", bay: bookingData.bay,
      date: dateKey(bookingData.date), start_time: bookingData.time,
      duration_slots: bookingData.durSlots, status: "confirmed",
      amount: bookingData.total, credits_used: bookingData.credits, discount: bookingData.disc,
      square_payment_id: sqPaymentId,
    });
    // Deduct credits if used
    if (bookingData.credits > 0) {
      const newCredits = Math.max(0, bayCredits - bookingData.credits);
      sb.patch("customers", `id=eq.${customerId}`, { bay_credits_remaining: newCredits });
      setBayCredits(newCredits);
    }
    // Save transaction to Supabase (fire and forget)
    sb.post("transactions", {
      customer_id: customerId, description: "Bay Booking · Bay " + bookingData.bay,
      date: dateKey(new Date()), amount: bookingData.total, payment_label: "Visa ····4242",
      square_payment_id: sqPaymentId,
    });
    // Always update local display
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setTransactions(p => [{ desc: "Bay Booking · Bay " + bookingData.bay, date: today, method: "Visa ····4242", amt: "$" + bookingData.total.toFixed(2) }, ...p]);
    // Send confirmation emails
    const emailData = {
      customer_name: onbF + " " + onbL,
      customer_email: profEmail || onbE,
      date: fmtDateLong(bookingData.date),
      time: bookingData.time,
      duration: bookingData.durSlots * 0.5 + " hr" + (bookingData.durSlots > 2 ? "s" : ""),
      bay: "Bay " + bookingData.bay,
      total: "$" + bookingData.total.toFixed(2),
      credits_used: bookingData.credits > 0 ? bookingData.credits + " hr credit" + (bookingData.credits > 1 ? "s" : "") : null,
    };
    sendEmail("bay_booking", emailData);
    return result;
  };

  const saveLessonBooking = async (bookingData) => {
    // 1. Charge via Square (if not using credit and customer has Square profile)
    let sqPaymentId = null;
    if (bookingData.total > 0 && !bookingData.credit && sqCustId) {
      const payment = await square("payment.create", {
        square_customer_id: sqCustId,
        amount: bookingData.total,
        note: `Lesson · ${bookingData.coachName} · ${bookingData.time}`,
      });
      sqPaymentId = payment?.payment?.id;
    }
    // 2. Save booking to Supabase
    const result = await sb.post("bookings", {
      customer_id: customerId, type: "lesson", bay: bookingData.bay,
      date: dateKey(bookingData.date), start_time: bookingData.time,
      duration_slots: 2, coach_id: bookingData.coachId, coach_name: bookingData.coachName,
      status: "confirmed", amount: bookingData.total, credits_used: bookingData.credit ? 1 : 0,
      square_payment_id: sqPaymentId,
    });
    // Save transaction to Supabase (fire and forget)
    sb.post("transactions", {
      customer_id: customerId, description: "Lesson · " + bookingData.coachName,
      date: dateKey(new Date()), amount: bookingData.total, payment_label: bookingData.credit ? "Credit" : "Visa ····4242",
    });
    // Always update local display
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setTransactions(p => [{ desc: "Lesson · " + bookingData.coachName, date: today, method: bookingData.credit ? "Credit" : "Visa ····4242", amt: "$" + bookingData.total.toFixed(2) }, ...p]);
    // Send confirmation emails
    const emailData = {
      customer_name: onbF + " " + onbL,
      customer_email: profEmail || onbE,
      date: fmtDateLong(bookingData.date),
      time: bookingData.time,
      coach: bookingData.coachName,
      bay: "Bay " + bookingData.bay,
      total: bookingData.credit ? "1 Lesson Credit" : "$" + bookingData.total.toFixed(2),
      payment_method: bookingData.credit ? "Lesson Credit" : "Card on file",
    };
    sendEmail("lesson_booking", emailData);
    return result;
  };

  /* ─── AUTH ─── */
  if (!logged) {
    const authCard = (content) => (
      <div style={LS.w}><style>{CSS}</style>
        <div style={{ ...LS.c, maxWidth: isDesktop ? 460 : 420 }}>{content}</div>
      </div>
    );

    if (authStep === "phone") return authCard(
      <>
        <div style={LS.br}>
          <h1 style={LS.bn}>BIRDIE GOLF STUDIOS</h1>
          <p style={LS.bs}>Wynwood, Miami, FL</p>
        </div>

        <div style={LS.divider} />
        <p style={LS.signInLabel}>Sign in or create an account to book</p>
        <label style={LS.label}>PHONE NUMBER</label>
        <div style={LS.phRow}>
          <span style={LS.phPre}>+1</span>
          <input style={LS.phIn} type="tel" placeholder="(305) 555-0000" value={ph.length > 6 ? `(${ph.slice(0,3)}) ${ph.slice(3,6)}-${ph.slice(6)}` : ph.length > 3 ? `(${ph.slice(0,3)}) ${ph.slice(3)}` : ph.length > 0 ? `(${ph}` : ""} onChange={e => { const digits = e.target.value.replace(/[^0-9]/g, ""); setPh(digits.slice(0, 10)); }} />
        </div>
        <button style={{ ...S.b1, marginTop: 16, opacity: ph.length >= 10 ? 1 : 0.4 }} onClick={() => { if (ph.length >= 10) setAuthStep("otp"); }}>Continue</button>
        <div style={LS.demo}>Demo: any 10+ digits</div>
        <div style={LS.footer}>
          <span style={LS.footerText}>45 NE 26th St, Unit C, Miami, FL 33145</span>
          <span style={LS.footerText}>Mon–Fri 7am–10pm · Sat–Sun 9am–9pm</span>
        </div>
      </>
    );

    if (authStep === "otp") return authCard(
      <>
        <div style={LS.br}>
          <h1 style={LS.bn}>BIRDIE GOLF STUDIOS</h1>
          <p style={LS.bs}>Wynwood, Miami, FL</p>
        </div>
        <p style={{ fontSize: 14, color: "#555", textAlign: "center", marginBottom: 20 }}>Code sent to +1 {ph.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</p>
        <div style={LS.otpRow}>
          {otp.map((v, i) => <input key={i} ref={otpRefs[i]} style={LS.otpIn} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={v}
            onChange={e => { const val = e.target.value.replace(/[^0-9]/g, "").slice(-1); const next = [...otp]; next[i] = val; setOtp(next); if (val && i < 5) otpRefs[i + 1].current?.focus(); }}
            onKeyDown={e => { if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs[i - 1].current?.focus(); }} />)}
        </div>
        <button style={{ ...S.b1, marginTop: 16, opacity: otp.every(d => d) ? 1 : 0.4 }} onClick={async () => {
          if (!otp.every(d => d)) return;
          // Look up phone in Supabase — skip onboarding if existing customer
          const existing = await sb.get("customers", `phone=eq.${ph}&select=*`);
          if (existing?.length) {
            const cust = existing[0];
            setCustomerId(cust.id);
            setSqCustId(cust.square_customer_id || null);
            setOnbF(cust.first_name || "");
            setOnbL(cust.last_name || "");
            setOnbE(cust.email || "");
            setProfPhone(cust.phone || "");
            setProfEmail(cust.email || "");
            setTier(cust.tier || "none");
            setBayCredits(cust.bay_credits_remaining || 0);
            if (cust.renewal_date) setRenewDate(new Date(cust.renewal_date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
            if (cust.member_since) setMemberSince(new Date(cust.member_since + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
            loadUserData(cust.id);
            loadCards(cust.id);
            setLogged(true);
          } else {
            setAuthStep("onboard");
          }
        }}>Verify</button>
        <div style={LS.demo}>Demo: any 6 digits</div>
        <button style={{ ...S.lk, marginTop: 12, display: "block", textAlign: "center", width: "100%" }} onClick={() => { setAuthStep("phone"); setOtp(["","","","","",""]); }}>← Back</button>
      </>
    );

    if (authStep === "onboard") return authCard(
      <>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0B2E1A", textAlign: "center", marginBottom: 4 }}>Welcome to Birdie Golf!</h2>
        <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 20 }}>Let's set up your account</p>
        <div style={LS.nameRow}>
          <div style={{ flex: 1 }}><label style={LS.label}>FIRST NAME</label><input style={LS.onbIn} placeholder="First" value={onbF} onChange={e => setOnbF(e.target.value)} /></div>
          <div style={{ flex: 1 }}><label style={LS.label}>LAST NAME</label><input style={LS.onbIn} placeholder="Last" value={onbL} onChange={e => setOnbL(e.target.value)} /></div>
        </div>
        <label style={LS.label}>PHONE</label>
        <input style={{ ...LS.onbIn, background: "#f8f8f6", color: "#888" }} value={"+1 " + ph.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")} readOnly />
        <label style={{ ...LS.label, marginTop: 12 }}>EMAIL</label>
        <input style={LS.onbIn} type="email" placeholder="you@email.com" value={onbE} onChange={e => setOnbE(e.target.value)} />
        <p style={{ fontSize: 11, color: "#aaa", marginTop: 14, lineHeight: 1.5 }}>By creating an account, you agree to our Privacy Policy and Terms of Service.</p>
        <button style={{ ...S.b1, marginTop: 16, opacity: onbF && onbL && onbE ? 1 : 0.4 }} onClick={async () => {
          if (!onbF || !onbL || !onbE) return;
          // 1. Create customer in Supabase
          const result = await sb.post("customers", { phone: ph, first_name: onbF, last_name: onbL, email: onbE, tier: "none", bay_credits_remaining: 0, bay_credits_total: 0 });
          const sbId = result?.[0]?.id;
          if (sbId) setCustomerId(sbId);
          // 2. Create customer in Square
          const sqResult = await square("customer.create", { first_name: onbF, last_name: onbL, phone: ph, email: onbE, supabase_id: sbId });
          const sqId = sqResult?.customer?.id;
          if (sqId) {
            setSqCustId(sqId);
            // Link Square ID back to Supabase
            if (sbId) await sb.patch("customers", `id=eq.${sbId}`, { square_customer_id: sqId });
          }
          setLogged(true); if (sbId) { loadUserData(sbId); loadCards(sbId); } fire("Welcome, " + onbF + "!");
        }}>Create Account</button>
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     MAIN APP — Responsive Layout
     ═══════════════════════════════════════════════════════════ */

  /* Navigation items */
  const navItems = [
    { k: "home", l: "Home", ic: X.grid },
    { k: "book", l: "Book", ic: X.cal },
    { k: "lessons", l: "Lessons", ic: X.coach },
    { k: "membership", l: "Membership", ic: X.crown },
    { k: "profile", l: "Profile", ic: X.user },
  ];

  const handleNav = async (k) => {
    setTab(k);
    if (k === "book" || k === "lessons") {
      const fresh = await sb.get("bookings", "select=id,bay,date,start_time,duration_slots,status,type&status=neq.cancelled");
      if (fresh?.length) setAllBookings(fresh);
    }
    if (k === "home" && customerId) {
      const today = new Date(); today.setHours(0,0,0,0);
      const bks = await sb.get("bookings", `select=*&customer_id=eq.${customerId}&status=eq.confirmed&order=date.asc`);
      const upcoming = (bks || []).filter(b => new Date(b.date + "T23:59:59") >= today);
      setUpcomingBk(upcoming.map(b => ({
        id: b.id, type: b.type,
        label: b.type === "lesson" ? "Lesson · " + (b.coach_name || "") : "Bay " + b.bay,
        sub: new Date(b.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " · " + b.start_time + " · " + (b.duration_slots * 0.5) + "hr" + (b.duration_slots > 2 ? "s" : ""),
        date: b.date, start_time: b.start_time, bay: b.bay,
        duration_slots: b.duration_slots, credits_used: b.credits_used || 0,
        amount: b.amount || 0, square_payment_id: b.square_payment_id || null,
        square_customer_id: b.square_customer_id || null, coach_name: b.coach_name || "",
      })));
    }
    if (k === "book") resetBk();
    if (k === "lessons") { resetLes(); setLesTab("book"); }
  };

  /* ─── TOP NAV (Desktop/Tablet) ─── */
  const TopNav = () => (
    <div style={S.topNav}>
      <div style={S.topNavInner}>
        <div style={S.topNavBrand}>
          <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#0B2E1A" }}>BIRDIE GOLF STUDIOS</span>
        </div>
        <div style={S.topNavLinks}>
          {navItems.map(n => (
            <button key={n.k} style={{ ...S.topNavBtn, ...(tab === n.k ? S.topNavBtnActive : {}) }} onClick={() => handleNav(n.k)}>
              {n.ic(18)}<span>{n.l}</span>
            </button>
          ))}
        </div>
        {tierData && <button style={{ ...S.tierBadge, background: tierData.c }} onClick={() => setTab("membership")}>{tierData.badge}</button>}
      </div>
    </div>
  );

  /* ─── BOTTOM NAV (Mobile) ─── */
  const BottomNav = () => (
    <div style={S.nav}>
      {navItems.map(n => (
        <button key={n.k} style={{ ...S.navBtn, color: tab === n.k ? "#2D8A5E" : "#aaa" }} onClick={() => handleNav(n.k)}>
          {n.ic(22)}<span style={{ fontSize: 10, fontWeight: tab === n.k ? 700 : 400 }}>{n.l}</span>
        </button>
      ))}
    </div>
  );

  /* ─── Content wrapper ─── */
  const Page = ({ children, wide }) => (
    <div style={{ ...S.page, maxWidth: wide ? 960 : 680 }}>{children}</div>
  );

  /* ─── RENDER TABS ─── */
  /* All tab render functions use the same business logic as before,
     but with responsive-aware spacing and grid columns */

  const renderContent = () => {
    /* Using the same rendering logic from the mobile app, adapted for responsive layout.
       For brevity in this file, the core rendering stays the same — the responsive magic
       happens through CSS media queries in the stylesheet and the Page wrapper. */

    if (tab === "home") return <Page>{renderHome()}</Page>;
    if (tab === "book") return <Page>{renderBook()}</Page>;
    if (tab === "lessons") return <Page>{renderLessons()}</Page>;
    if (tab === "membership") return <Page wide>{renderMembership()}</Page>;
    if (tab === "profile") return <Page>{renderProfile()}</Page>;
    return null;
  };

  /* ─── HOME ─── */
  const renderHome = () => (
    <>
      <div style={S.greetRow}>
        <div style={{ flex: 1 }}>
          <h2 style={S.greetH}>Hey, {onbF} 👋</h2>
          <p style={S.greetS}>Ready to hit the bays?</p>
        </div>
        {tierData && !isDesktop && <button style={{ ...S.tierBadge, background: tierData.c }} onClick={() => setTab("membership")}>{tierData.badge}</button>}
      </div>

      <div style={{ ...S.qGrid, gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(4, 1fr)" }}>
        {[{ l: "Book Bay", ic: X.cal, t: "book" }, { l: "Lessons", ic: X.coach, t: "lessons" }, { l: "Membership", ic: X.crown, t: "membership" }, { l: "Profile", ic: X.user, t: "profile" }].map(a => (
          <button key={a.l} style={S.qBtn} onClick={() => handleNav(a.t)}>
            <div style={S.qIc}>{a.ic(20)}</div><span style={S.qL}>{a.l}</span>
          </button>
        ))}
      </div>

      <h3 style={S.sh}>Upcoming Bookings</h3>
      {upcomingBk.length === 0 ? (
        <div style={S.emptyCard}>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>No upcoming reservations</p>
          <button style={{ ...S.b2, padding: "10px 24px" }} onClick={() => { resetBk(); setTab("book"); }}>Book a Bay</button>
        </div>
      ) : upcomingBk.map((b, i) => (
        <div key={i} style={S.upCard}>
          <div style={{ ...S.upIc, color: b.type === "lesson" ? "#5B6DCD" : "#2D8A5E", background: b.type === "lesson" ? "#5B6DCD14" : "#2D8A5E14" }}>
            {b.type === "lesson" ? X.coach(18) : X.cal(18)}
          </div>
          <div style={{ flex: 1 }}><p style={{ fontSize: 14, fontWeight: 600 }}>{b.label}</p><p style={{ fontSize: 12, color: "#888" }}>{b.sub}</p></div>
          <button
            style={{ fontSize: 11, fontWeight: 600, color: b.type === "lesson" ? "#5B6DCD" : "#2D8A5E", background: "none", border: `1px solid ${b.type === "lesson" ? "#5B6DCD44" : "#2D8A5E44"}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: ff, flexShrink: 0 }}
            onClick={() => setManageBk(b)}
          >
            Manage
          </button>
        </div>
      ))}

      {/* Active Membership & Lesson Package cards — side by side */}
      {(tierData || totL > 0) && <>
        <h3 style={S.sh}>My Plans</h3>
        <div style={{ display: "grid", gridTemplateColumns: (tierData && tier !== "none" && totL > 0) ? "1fr 1fr" : "1fr", gap: 12, alignItems: "stretch" }}>
          {tierData && tier !== "none" && (
            <div style={{ ...S.mc, background: `linear-gradient(135deg, ${tierData.c}, ${tierData.c}cc)`, display: "flex", flexDirection: "column" }}>
              <span style={S.mcBadge}>{tierData.badge}</span>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 6 }}>{tierData.n} Plan</p>
              <p style={{ fontSize: 12, color: "#ffffffbb" }}>${tierData.price}/mo</p>
              {tier === "player" && <div style={{ marginTop: 10 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 10, color: "#ffffffbb" }}>Bay Hours</span><span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>{bayCredits}/{TIERS.player.hrs}</span></div><div style={{ ...S.bar, background: "#ffffff33" }}><div style={{ ...S.barF, width: (bayCredits / 8 * 100) + "%", background: "#fff" }} /></div></div>}
              {tier === "champion" && <p style={{ fontSize: 11, color: "#ffffffcc", marginTop: 8 }}>Unlimited Bay Access</p>}
            </div>
          )}
          {totL > 0 && creditCoach && (
            <div style={{ background: "#5B6DCD12", border: "1px solid #5B6DCD33", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600, color: "#5B6DCD" }}>{creditPkg}</span><span style={{ background: "#5B6DCD", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{totL}/{maxL}</span></div>
              <p style={{ fontSize: 12, color: "#888" }}>{creditCoach.n}</p>
              <div style={{ ...S.bar, marginTop: 6 }}><div style={{ ...S.barF, width: (totL / maxL * 100) + "%", background: "#5B6DCD" }} /></div>
              <p style={{ fontSize: 10, color: "#aaa", marginTop: 6 }}>Expires {creditExp}</p>
            </div>
          )}
        </div>
      </>}

      {/* Credits (bay) for members without the "My Plans" section covering it */}
      {tierData && tier !== "none" && tier !== "starter" && !((tierData || totL > 0)) ? null : null}

      <h3 style={{ ...S.sh, marginTop: 24 }}>About Us</h3>
      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <div style={{ ...S.aboutCard, gridColumn: isDesktop ? "auto" : "1 / -1" }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Bay Rates</p>
          <p style={{ fontSize: 12, color: "#2D8A5E", lineHeight: 1.8 }}>Non-Peak ${cfg.op}/hr</p>
          <p style={{ fontSize: 10, color: "#888" }}>Mon–Fri 7am–5pm</p><p style={{ fontSize: 10, color: "#888" }}>Sat–Sun 9am–9pm</p>
          <p style={{ fontSize: 12, color: "#E8890C", lineHeight: 1.8, marginTop: 4 }}>Peak ${cfg.pk}/hr</p>
          <p style={{ fontSize: 10, color: "#888" }}>Mon–Fri 5pm–10pm</p>
        </div>
        <div style={S.aboutCard}><p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Hours</p><p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>Mon–Fri 7am–10pm</p><p style={{ fontSize: 12, color: "#555" }}>Sat–Sun 9am–9pm</p></div>
        <div style={S.aboutCard}><p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Location</p>
          <a href="https://maps.apple.com/?q=45+NE+26th+St+Miami+FL+33137" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <p style={{ fontSize: 12, color: "#2D8A5E", lineHeight: 1.6 }}>45 NE 26th St., Unit C</p>
            <p style={{ fontSize: 12, color: "#2D8A5E" }}>Miami, FL 33137</p>
          </a>
        </div>
      </div>

      <h3 style={S.sh}>Contact</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 40 }}>
        <a href="mailto:info@birdiegolfstudios.com" style={S.contactBtn}>{X.mail(16)} Email Us</a>
        <a href="tel:+13054564149" style={S.contactBtn}>{X.phone(16)} Call Us</a>
      </div>
    </>
  );

  /* ─── BAY BOOKING ─── */
  const durs = [{ slots: 1, l: "30 min" },{ slots: 2, l: "1 hr" },{ slots: 3, l: "1.5 hrs" },{ slots: 4, l: "2 hrs" },{ slots: 5, l: "2.5 hrs" },{ slots: 6, l: "3 hrs" },{ slots: 7, l: "3.5 hrs" },{ slots: 8, l: "4 hrs" }];
  const champMax = tier === "champion" ? 4 : 999;

  const renderBook = () => {
    if (bkStep === 1 && bkDate && bkDur && bkTime && bkBay) {
      const price = calcPrice(bkDate, bkTime, bkDur, tier, bayCredits, cfg);
      const durHrs = bkDur * 0.5;
      return <>
        <div style={S.hd}><button style={S.bk} onClick={() => setBkStep(0)}>{X.chevL(18)}</button><h2 style={S.ht}>Confirm Booking</h2></div>
        <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={S.confCard}>
              {[["Date", fmtDateLong(bkDate)], ["Duration", durHrs + " hr" + (durHrs > 1 ? "s" : "")], ["Time", bkTime], ["Bay", "Bay " + bkBay]].map(([l, v]) => <div key={l} style={S.confRow}><span style={S.confL}>{l}</span><span style={S.confV}>{v}</span></div>)}
              {price.credits > 0 && <div style={S.confRow}><span style={S.confL}>Credits Used</span><span style={{ ...S.confV, color: "#2D8A5E" }}>{price.credits} hr{price.credits > 1 ? "s" : ""}</span></div>}
              {price.disc > 0 && <div style={S.confRow}><span style={S.confL}>Member Discount</span><span style={{ ...S.confV, color: "#2D8A5E" }}>-${price.disc.toFixed(2)}</span></div>}
              <div style={S.confDiv} />
              <div style={S.confRow}><span style={{ ...S.confL, fontWeight: 700 }}>Total</span><span style={{ ...S.confV, fontSize: 15, fontWeight: 700 }}>${price.total.toFixed(2)}</span></div>
            </div>
            <p style={{ fontSize: 12, color: "#888", marginTop: 12 }}>Up to 4 players per bay. No additional charge.</p>
          </div>
          <div>
            <div style={S.polBox}>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Cancellation Policy</p>
              <p style={{ fontSize: 12, color: "#8B6914", lineHeight: 1.5, marginBottom: 12 }}>Cancellations within 24 hours are non-refundable.</p>
              <label style={S.chkRow}><input type="checkbox" checked={bkAgree} onChange={() => setBkAgree(!bkAgree)} style={{ marginRight: 8, accentColor: "#2D8A5E" }} /><span style={{ fontSize: 12 }}>I agree to the cancellation policy</span></label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={S.b2} onClick={() => setBkStep(0)}>Back</button>
              <button style={{ ...S.b1, flex: 2, opacity: bkAgree ? 1 : 0.4 }} onClick={async () => {
                if (!bkAgree) return;
                const durH = bkDur * 0.5;
                await saveBayBooking({ bay: bkBay, date: bkDate, time: bkTime, durSlots: bkDur, total: price.total, credits: price.credits, disc: price.disc });
                setAllBookings(p => [...p, { id: Date.now().toString(), bay: bkBay, date: bkDate ? bkDate.toISOString().split("T")[0] : "", start_time: bkTime, duration_slots: bkDur, status: "confirmed", type: "bay" }]);
                if (customerId) { const today = new Date(); today.setHours(0,0,0,0); const bks = await sb.get("bookings", `select=*&customer_id=eq.${customerId}&status=eq.confirmed&order=date.asc`); const upcoming = (bks || []).filter(b => new Date(b.date + "T23:59:59") >= today); setUpcomingBk(upcoming.map(b => ({ id: b.id, type: b.type, label: b.type === "lesson" ? "Lesson · " + (b.coach_name || "") : "Bay " + b.bay, sub: new Date(b.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " · " + b.start_time + " · " + (b.duration_slots * 0.5) + "hr" + (b.duration_slots > 2 ? "s" : ""), date: b.date, start_time: b.start_time, bay: b.bay, duration_slots: b.duration_slots, credits_used: b.credits_used || 0, amount: b.amount || 0, square_payment_id: b.square_payment_id || null, square_customer_id: b.square_customer_id || null, coach_name: b.coach_name || "" }))); }
                fire("Bay booked!"); resetBk(); setTab("home");
              }}>Confirm & Pay</button>
            </div>
          </div>
        </div>
      </>;
    }

    return <>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Book a Bay</h2>
      {!hasCard && <div style={{ background: "#FFF0F0", border: "1px solid #E0392822", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#E03928", marginBottom: 4 }}>Payment method required</p>
        <p style={{ fontSize: 12, color: "#E03928cc", marginBottom: 10 }}>Add a card to your profile before booking a bay.</p>
        <button style={{ ...S.b1, background: "#E03928", maxWidth: 180, fontSize: 13, padding: "10px 14px" }} onClick={() => setTab("profile")}>Add Card</button>
      </div>}
      {tier === "champion" && <div style={S.creditBanner}><span style={{ fontSize: 13, fontWeight: 600, color: "#124A2B" }}>Unlimited · Max 2hrs/booking</span></div>}
      {tier === "player" && <div style={S.creditBanner}><span style={{ fontSize: 13, fontWeight: 600, color: "#2D8A5E" }}>{bayCredits > 0 ? bayCredits + " hrs of credits remaining this cycle" : "No bay credits remaining this cycle"}</span></div>}

      {hasCard && <><h4 style={S.stepH}>Select Date</h4>
      <div style={S.dateScroll}>
        {days14.map(d => {
          const sel = bkDate && dateKey(bkDate) === dateKey(d);
          const isToday = dateKey(d) === dateKey(new Date());
          return <button key={dateKey(d)} style={{ ...S.dateBtn, ...(sel ? S.dateSel : {}), ...(isToday && !sel ? { borderColor: "#2D8A5E" } : {}) }}
            onClick={() => { setBkDate(d); setBkDur(null); setBkTime(null); setBkBay(null); }}>
            <span style={{ fontSize: 11, color: sel ? "#fff" : "#888" }}>{dayName(d)}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: sel ? "#fff" : "#1a1a1a" }}>{d.getDate()}</span>
            <span style={{ fontSize: 10, color: sel ? "#ffffffcc" : "#aaa" }}>{d.toLocaleDateString("en-US", { month: "short" })}</span>
          </button>;
        })}
      </div></>}

      {bkDate && <><h4 style={S.stepH}>Select Duration</h4>
        <div style={{ ...S.durGrid, gridTemplateColumns: isDesktop ? "repeat(8, 1fr)" : "repeat(4, 1fr)" }}>
          {durs.filter(d => d.slots <= champMax).map(d => {
            const sel = bkDur === d.slots;
            return <button key={d.slots} style={{ ...S.durBtn, ...(sel ? S.durSel : {}) }} onClick={() => { setBkDur(d.slots); setBkTime(null); setBkBay(null); }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: sel ? "#fff" : "#1a1a1a" }}>{d.l}</span>
            </button>;
          })}
        </div>
      </>}

      {bkDate && bkDur && <><h4 style={S.stepH}>Select Start Time</h4>
        <div style={{ ...S.timeGrid, gridTemplateColumns: isDesktop ? "repeat(6, 1fr)" : "repeat(4, 1fr)" }}>
          {getAllTimes(bkDate, bkDur, bayBlocks, allBookings).map(({ time: t, open }) => {
            const sel = bkTime === t, pk = isPeak(bkDate, t), wk = isWeekend(bkDate);
            return <button key={t} style={{ ...S.timeBtn, ...(sel ? S.timeSel : {}), ...(!open ? { opacity: 0.35, cursor: "not-allowed" } : {}) }}
              onClick={() => { if (open) { setBkTime(t); setBkBay(null); } }} disabled={!open}>
              <span style={{ fontSize: 12, fontWeight: 600, color: sel ? "#fff" : !open ? "#ccc" : "#1a1a1a" }}>{t}</span>
              {!open && <span style={{ fontSize: 8, fontWeight: 700, color: "#ccc" }}>FULL</span>}
            </button>;
          })}
        </div>
      </>}

      {bkDate && bkDur && bkTime && <><h4 style={S.stepH}>Select Bay</h4>
        <div style={S.bayGrid}>
          {getAvailBays(bkDate, bkTime, bkDur, bayBlocks, allBookings).map(b => {
            const sel = bkBay === b.bay;
            return <button key={b.bay} style={{ ...S.bayBtn, ...(sel ? S.baySel : {}), ...(b.ok ? {} : S.bayOff) }} onClick={() => { if (b.ok) setBkBay(b.bay); }} disabled={!b.ok}>
              <span style={{ fontSize: 14, fontWeight: 700, color: sel ? "#fff" : b.ok ? "#1a1a1a" : "#ccc" }}>Bay {b.bay}</span>
              {!b.ok && <span style={{ fontSize: 9, color: "#ccc" }}>Unavailable</span>}
            </button>;
          })}
        </div>
      </>}

      {bkDate && bkDur && bkTime && bkBay && (() => {
        const price = calcPrice(bkDate, bkTime, bkDur, tier, bayCredits, cfg);
        return <div style={S.pricePreview}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#2D8A5E" }}>${price.total.toFixed(2)}</span>
          </div>
          {price.credits > 0 && <p style={{ fontSize: 11, color: "#2D8A5E", marginTop: 4 }}>{price.credits} hr credit{price.credits > 1 ? "s" : ""} applied</p>}
          {price.disc > 0 && <p style={{ fontSize: 11, color: "#2D8A5E", marginTop: 2 }}>Member discount: -${price.disc.toFixed(2)}</p>}
        </div>;
      })()}
      {bkDate && bkDur && bkTime && bkBay && <button style={{ ...S.b1, marginTop: 14 }} onClick={() => {
        const now = new Date();
        const isToday = bkDate && isSameLocalDay(bkDate, now);
        const currentH = now.getHours() + now.getMinutes() / 60;
        if (isToday && bkTime && toH(bkTime) <= currentH) { fire("That time slot has passed — please select a new time."); setBkTime(null); setBkBay(null); return; }
        setBkStep(1);
      }}>Continue to Confirm</button>}
    </>;
  };

  /* ─── LESSONS ─── */
  const renderLessons = () => {
    if (lesTab === "book" && lesStep === 1 && lesDate && lesTime && lesCoach) {
      const coach = COACHES.find(c => c.id === lesCoach);
      const lp = lessonPrice(tier, totL > 0, creditCoachId, lesCoach);
      const bayAssigned = autoAssignBay(lesDate, lesTime, bayBlocks, allBookings);
      const wrongCoach = totL > 0 && lesCoach !== creditCoachId;
      const cancelFee = (tier && tier !== "none") ? (slotRate(lesDate, lesTime, cfg) * 0.8).toFixed(2) : slotRate(lesDate, lesTime, cfg).toFixed(2);
      return <>
        <div style={S.hd}><button style={S.bk} onClick={() => setLesStep(0)}>{X.chevL(18)}</button><h2 style={S.ht}>Confirm Lesson</h2></div>
        <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={S.confCard}>
              {[["Coach", coach?.n], ["Date", fmtDateLong(lesDate)], ["Time", lesTime + " · 1 hr"], ["Bay", "Bay " + bayAssigned]].map(([l, v]) => <div key={l} style={S.confRow}><span style={S.confL}>{l}</span><span style={S.confV}>{v}</span></div>)}
              <div style={S.confDiv} />
              <div style={S.confRow}><span style={{ ...S.confL, fontWeight: 700 }}>Total</span><span style={{ ...S.confV, fontSize: 15, fontWeight: 700, color: lp.credit ? "#2D8A5E" : "#1a1a1a" }}>{lp.label}</span></div>
            </div>
            {wrongCoach && <div style={{ ...S.polBox, background: "#FFF0F0", borderColor: "#E0392822" }}><p style={{ fontSize: 12, color: "#E03928", lineHeight: 1.5 }}>Credits only valid with {creditCoach?.n}. Full rate applies.</p></div>}
          </div>
          <div>
            <div style={S.polBox}>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Cancellation Policy</p>
              <div style={{ fontSize: 12, color: "#8B6914", lineHeight: 1.6, marginBottom: 12 }}>
                <p style={{ marginBottom: 6 }}><strong>Within 24 hours or no-show:</strong> No refund. You will be charged the bay rental cost for that hour (${slotRate(lesDate, lesTime, cfg).toFixed(2)}).</p>
                <p><strong>More than 24 hours in advance:</strong> Full refund — lesson credits returned to your account, or refund to your credit card on file.</p>
              </div>
              <label style={S.chkRow}><input type="checkbox" checked={lesAgree} onChange={() => setLesAgree(!lesAgree)} style={{ marginRight: 8, accentColor: "#5B6DCD" }} /><span style={{ fontSize: 12 }}>I have read and agree to the cancellation policy</span></label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={S.b2} onClick={() => setLesStep(0)}>Back</button>
              <button style={{ ...S.b1, flex: 2, background: "#5B6DCD", opacity: lesAgree ? 1 : 0.4 }} onClick={async () => {
                if (!lesAgree) return;
                await saveLessonBooking({ bay: bayAssigned, date: lesDate, time: lesTime, coachId: lesCoach, coachName: coach?.n, total: lp.total, credit: lp.credit });
                setUpcomingBk(p => [...p, { type: "lesson", label: "Lesson · " + coach?.n, sub: fmtDate(lesDate) + " · " + lesTime + " · 1hr" }]);
                if (lp.credit) { setTotL(c => Math.max(0, c - 1)); setCreditUsage(p => [...p, { date: fmtDate(new Date()), desc: "Lesson with " + coach?.n }]); }
                setLesHistory(p => [...p, { type: "lesson", desc: "Lesson with " + coach?.n, date: fmtDate(new Date()), amt: lp.credit ? "1 credit" : lp.label }]);
                setAllBookings(p => [...p, { id: Date.now().toString(), bay: bayAssigned, date: lesDate ? lesDate.toISOString().split("T")[0] : "", start_time: lesTime, duration_slots: 2, status: "confirmed", type: "lesson" }]);
                if (customerId) { const today = new Date(); today.setHours(0,0,0,0); const bks = await sb.get("bookings", `select=*&customer_id=eq.${customerId}&status=eq.confirmed&order=date.asc`); const upcoming = (bks || []).filter(b => new Date(b.date + "T23:59:59") >= today); setUpcomingBk(upcoming.map(b => ({ id: b.id, type: b.type, label: b.type === "lesson" ? "Lesson · " + (b.coach_name || "") : "Bay " + b.bay, sub: new Date(b.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " · " + b.start_time + " · " + (b.duration_slots * 0.5) + "hr" + (b.duration_slots > 2 ? "s" : ""), date: b.date, start_time: b.start_time, bay: b.bay, duration_slots: b.duration_slots, credits_used: b.credits_used || 0, amount: b.amount || 0, square_payment_id: b.square_payment_id || null, square_customer_id: b.square_customer_id || null, coach_name: b.coach_name || "" }))); }
                fire("Lesson booked!"); resetLes(); setTab("home");
              }}>Confirm & Book</button>
            </div>
          </div>
        </div>
      </>;
    }

    const CoachCard = ({ c, sel, locked, onClick }) => (
      <button style={{ ...S.coachCard, ...(sel ? { borderColor: "#5B6DCD", background: "#5B6DCD0A" } : {}), ...(locked ? { opacity: 0.4, cursor: "not-allowed" } : {}) }} onClick={onClick} disabled={locked}>
        <div style={S.coachAv}>{c.ini}</div>
        <div><p style={{ fontSize: 13, fontWeight: 600 }}>{c.n}</p>
          {locked && <p style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>Credits with {creditCoach?.n.split(" ")[0]}</p>}</div>
      </button>
    );

    const DateBtn = ({ d, sel, disabled: dis, color = "#5B6DCD" }) => (
      <button style={{ ...S.dateBtn, ...(sel ? { ...S.dateSel, background: color } : {}), ...(dateKey(d) === dateKey(new Date()) && !sel ? { borderColor: color } : {}), ...(dis ? { opacity: 0.35 } : {}) }}
        onClick={() => { if (!dis) { setLesDate(d); setLesTime(null); if (lesMode === "date") setLesCoach(null); } }} disabled={dis}>
        <span style={{ fontSize: 11, color: sel ? "#fff" : "#888" }}>{dayName(d)}</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: sel ? "#fff" : "#1a1a1a" }}>{d.getDate()}</span>
        <span style={{ fontSize: 10, color: sel ? "#ffffffcc" : "#aaa" }}>{d.toLocaleDateString("en-US", { month: "short" })}</span>
      </button>
    );

    return <>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Lessons</h2>
      {!hasCard && <div style={{ background: "#FFF0F0", border: "1px solid #E0392822", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#E03928", marginBottom: 4 }}>Payment method required</p>
        <p style={{ fontSize: 12, color: "#E03928cc", marginBottom: 10 }}>Add a card to your profile before booking lessons or purchasing packages.</p>
        <button style={{ ...S.b1, background: "#E03928", maxWidth: 180, fontSize: 13, padding: "10px 14px" }} onClick={() => setTab("profile")}>Add Card</button>
      </div>}
      {hasCard && <div style={S.tabs}>
        {["book", "credits"].map(t => <button key={t} style={{ ...S.tabBtn, ...(lesTab === t ? S.tabSel : {}) }} onClick={() => { setLesTab(t); setSelPkg(null); setPkgCoach(null); }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
      </div>}

      {hasCard && lesTab === "book" && <>
        {totL > 0 && <div style={{ ...S.creditBanner, background: "#5B6DCD12", borderColor: "#5B6DCD33" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ background: "#5B6DCD", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{totL}</span><span style={{ fontSize: 13, fontWeight: 600, color: "#5B6DCD" }}>Lesson Credits Available</span></div>
          <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{creditPkg} · {creditCoach?.n}</p>
        </div>}
        <div style={S.modeToggle}>
          <button style={{ ...S.modeBtn, ...(lesMode === "date" ? S.modeSel : {}) }} onClick={() => { setLesMode("date"); resetLes(); }}>By Date & Time</button>
          <button style={{ ...S.modeBtn, ...(lesMode === "instructor" ? S.modeSel : {}) }} onClick={() => { setLesMode("instructor"); resetLes(); }}>By Instructor</button>
        </div>

        {lesMode === "date" ? <>
          <h4 style={S.stepH}>Select Date</h4>
          <div style={S.dateScroll}>{days14.map(d => { const dn = dayName(d); const hasCoach = COACHES.some(c => (c.av[dn] || []).length > 0); return <DateBtn key={dateKey(d)} d={d} sel={lesDate && dateKey(lesDate) === dateKey(d)} disabled={!hasCoach} />; })}</div>
          {lesDate && <><h4 style={S.stepH}>Select Start Time</h4><div style={{ ...S.timeGrid, gridTemplateColumns: isDesktop ? "repeat(6,1fr)" : "repeat(4,1fr)" }}>
            {getLessonTimes(lesDate, null, bayBlocks, allBookings).map(t => { const sel = lesTime === t; return <button key={t} style={{ ...S.timeBtn, ...(sel ? { ...S.timeSel, background: "#5B6DCD", borderColor: "#5B6DCD" } : { borderColor: "#5B6DCD44" }) }} onClick={() => { setLesTime(t); setLesCoach(null); }}><span style={{ fontSize: 12, fontWeight: 600, color: sel ? "#fff" : "#1a1a1a" }}>{t}</span></button>; })}
          </div></>}
          {lesDate && lesTime && <><h4 style={S.stepH}>Select Instructor</h4><div style={{ display: "flex", gap: 10 }}>
            {getCoachesAt(lesDate, lesTime, bayBlocks, allBookings).map(c => <CoachCard key={c.id} c={c} sel={lesCoach === c.id} locked={totL > 0 && c.id !== creditCoachId} onClick={() => { if (!(totL > 0 && c.id !== creditCoachId)) setLesCoach(c.id); }} />)}
          </div></>}
        </> : <>
          <h4 style={S.stepH}>Select Instructor</h4>
          <div style={{ display: "flex", gap: 10 }}>{COACHES.map(c => <CoachCard key={c.id} c={c} sel={lesCoach === c.id} locked={totL > 0 && c.id !== creditCoachId} onClick={() => { if (!(totL > 0 && c.id !== creditCoachId)) { setLesCoach(c.id); setLesDate(null); setLesTime(null); } }} />)}</div>
          {lesCoach && <><h4 style={S.stepH}>Select Date</h4><div style={S.dateScroll}>{days14.map(d => { const coach = COACHES.find(c => c.id === lesCoach); const hasSlots = (coach?.av[dayName(d)] || []).length > 0; return <DateBtn key={dateKey(d)} d={d} sel={lesDate && dateKey(lesDate) === dateKey(d)} disabled={!hasSlots} />; })}</div></>}
          {lesCoach && lesDate && <><h4 style={S.stepH}>Select Start Time</h4><div style={{ ...S.timeGrid, gridTemplateColumns: isDesktop ? "repeat(6,1fr)" : "repeat(4,1fr)" }}>
            {getLessonTimes(lesDate, COACHES.find(c => c.id === lesCoach), bayBlocks, allBookings).map(t => { const sel = lesTime === t; return <button key={t} style={{ ...S.timeBtn, ...(sel ? { ...S.timeSel, background: "#5B6DCD", borderColor: "#5B6DCD" } : { borderColor: "#5B6DCD44" }) }} onClick={() => setLesTime(t)}><span style={{ fontSize: 12, fontWeight: 600, color: sel ? "#fff" : "#1a1a1a" }}>{t}</span></button>; })}
          </div></>}
        </>}

        {lesDate && lesTime && lesCoach && (() => {
          const coach = COACHES.find(c => c.id === lesCoach), lp = lessonPrice(tier, totL > 0, creditCoachId, lesCoach);
          return <div style={{ ...S.pricePreview, borderColor: "#5B6DCD33", background: "#5B6DCD08", marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><p style={{ fontSize: 13, fontWeight: 600 }}>{coach?.n} · 1 hr</p><p style={{ fontSize: 11, color: "#888" }}>Bay {autoAssignBay(lesDate, lesTime, bayBlocks, allBookings)}</p></div>
            <span style={{ fontSize: 16, fontWeight: 700, color: lp.credit ? "#2D8A5E" : "#5B6DCD" }}>{lp.label}</span></div></div>;
        })()}
        {lesDate && lesTime && lesCoach && <button style={{ ...S.b1, marginTop: 12, background: "#5B6DCD" }} onClick={() => {
          const now = new Date();
          const isToday = lesDate && isSameLocalDay(lesDate, now);
          const currentH = now.getHours() + now.getMinutes() / 60;
          if (isToday && lesTime && toH(lesTime) <= currentH) { fire("That time slot has passed — please select a new time."); setLesTime(null); setLesCoach(null); return; }
          setLesStep(1);
        }}>Continue to Confirm</button>}
      </>}

      {hasCard && lesTab === "credits" && <>
        {totL > 0 ? <>
          <div style={S.creditDetailCard}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><p style={{ fontSize: 15, fontWeight: 700 }}>{creditPkg}</p><span style={{ background: "#5B6DCD", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 10 }}>{totL}/{maxL}</span></div>
            <p style={{ fontSize: 12, color: "#888" }}>{creditCoach?.n}</p>
            <div style={S.bar}><div style={{ ...S.barF, width: (totL / maxL * 100) + "%", background: "#5B6DCD" }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#888" }}><span>Purchased {creditPurchaseDate}</span><span>Expires {creditExp}</span></div>
            <button style={{ ...S.b1, background: "#5B6DCD", marginTop: 14 }} onClick={() => { setLesTab("book"); setLesCoach(creditCoachId); setLesMode("instructor"); }}>Book with Credits</button>
          </div>
          {creditUsage.length > 0 && <><h4 style={{ ...S.stepH, marginTop: 20 }}>Credit Usage</h4>
            {creditUsage.map((u, i) => <div key={i} style={S.histRow}><div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 500 }}>{u.desc}</p><p style={{ fontSize: 11, color: "#888" }}>{u.date}</p></div><span style={{ fontSize: 12, fontWeight: 700, color: "#E03928" }}>-1</span></div>)}</>}
        </> : <>
          {!selPkg ? <>
            <h4 style={S.stepH}>Select a Package</h4><p style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>Purchase a lesson package to save on hourly rates.</p>
            {(() => { const isMem = tier && tier !== "none"; return [{ name: "3-Hour Package", credits: 3, price: isMem ? 300 : 360 }, { name: "5-Hour Package", credits: 5, price: isMem ? 400 : 500 }].map(p =>
              <button key={p.name} style={{ ...S.pkgCard, cursor: "pointer", textAlign: "left", width: "100%" }} onClick={() => setSelPkg(p)}>
                <div><p style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</p><p style={{ fontSize: 12, color: "#888" }}>{p.credits} lesson credits</p></div>
                <p style={{ fontSize: 18, fontWeight: 700, marginTop: 10 }}>${p.price}</p></button>); })()}
          </> : !pkgCoach ? <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><button style={S.bk} onClick={() => { setSelPkg(null); setPkgCoach(null); }}>{X.chevL(18)}</button><div><p style={{ fontSize: 15, fontWeight: 700 }}>{selPkg.name}</p><p style={{ fontSize: 12, color: "#888" }}>{selPkg.credits} credits · ${selPkg.price}</p></div></div>
            <h4 style={S.stepH}>Select Instructor</h4><div style={{ display: "flex", gap: 10 }}>{COACHES.map(c => <CoachCard key={c.id} c={c} sel={pkgCoach === c.id} locked={false} onClick={() => setPkgCoach(c.id)} />)}</div>
          </> : (() => { const coach = COACHES.find(c => c.id === pkgCoach); return <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><button style={S.bk} onClick={() => setPkgCoach(null)}>{X.chevL(18)}</button><div><p style={{ fontSize: 15, fontWeight: 700 }}>{selPkg.name}</p><p style={{ fontSize: 12, color: "#888" }}>{selPkg.credits} credits · {coach?.n}</p></div></div>
            <div style={S.confCard}>{[["Package", selPkg.name], ["Credits", selPkg.credits + " lessons"], ["Instructor", coach?.n]].map(([l, v]) => <div key={l} style={S.confRow}><span style={S.confL}>{l}</span><span style={S.confV}>{v}</span></div>)}<div style={S.confDiv} /><div style={S.confRow}><span style={{ ...S.confL, fontWeight: 700 }}>Total</span><span style={{ ...S.confV, fontSize: 15, fontWeight: 700 }}>${selPkg.price}</span></div></div>
            <button style={{ ...S.b1, background: "#5B6DCD", marginTop: 14 }} onClick={async () => {
              const today = new Date(), expDate = new Date(today); expDate.setMonth(expDate.getMonth() + 3);
              const fmtShort = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              await sb.post("lesson_packages", { customer_id: customerId, name: selPkg.name, total_credits: selPkg.credits, remaining_credits: selPkg.credits, coach_id: pkgCoach, coach_name: coach?.n, price: selPkg.price, expiry_date: dateKey(expDate) });
              await sb.post("transactions", { customer_id: customerId, description: selPkg.name + " · " + coach?.n, date: dateKey(today), amount: selPkg.price, payment_label: "Visa ····4242" });
              setTotL(selPkg.credits); setMaxL(selPkg.credits); setCreditCoachId(pkgCoach); setCreditPkg(selPkg.name); setCreditPurchaseDate(fmtShort(today)); setCreditExp(fmtShort(expDate)); setCreditUsage([]);
              setTransactions(p => [{ desc: selPkg.name + " · " + coach?.n, date: fmtShort(today), method: "Visa ····4242", amt: "$" + selPkg.price + ".00" }, ...p]);
              sendEmail("lesson_package", {
                customer_name: onbF + " " + onbL,
                customer_email: profEmail || onbE,
                package: selPkg.name,
                credits: selPkg.credits,
                coach: coach?.n,
                total: "$" + selPkg.price + ".00",
                expiry: fmtShort(expDate),
              });
              fire("Package purchased!"); setSelPkg(null); setPkgCoach(null);
            }}>Buy</button></div>; })()}
        </>}
      </>}

    </>;
  };

  /* ─── MEMBERSHIP ─── */
  const renderMembership = () => {
    const td = TIERS[tier];
    return <>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Membership</h2>
      <div style={S.tabs}>{["current", "memberships"].map(t => <button key={t} style={{ ...S.tabBtn, ...(memTab === t ? S.tabSel : {}) }} onClick={() => setMemTab(t)}>{t === "memberships" ? "Browse" : "Current"}</button>)}</div>

      {memTab === "current" && (!td || tier === "none") && (
        <div style={S.emptyCard}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No active membership</p>
          <p style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>Browse our membership plans to unlock bay credits, discounts, and more.</p>
          <button style={{ ...S.b1, maxWidth: 200, margin: "0 auto" }} onClick={() => setMemTab("memberships")}>Browse Plans</button>
        </div>
      )}

      {memTab === "current" && td && tier !== "none" && <>
        <div style={{ ...S.mc, background: `linear-gradient(135deg, ${td.c}, ${td.c}cc)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div><span style={S.mcBadge}>{td.badge}</span><p style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 8 }}>{td.n} Plan</p><p style={{ fontSize: 14, color: "#ffffffbb" }}>${td.price}/mo</p></div>
            <button style={S.mcManage} onClick={() => setMemTab("memberships")}>Manage →</button>
          </div>
          {tier === "player" && <div style={{ marginTop: 16 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 11, color: "#ffffffbb" }}>Bay Hours</span><span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{8 - bayCredits}/8 used · {bayCredits} left</span></div><div style={{ ...S.bar, background: "#ffffff33" }}><div style={{ ...S.barF, width: ((8 - bayCredits) / 8 * 100) + "%", background: "#fff" }} /></div></div>}
          {tier === "champion" && <p style={{ fontSize: 13, color: "#ffffffcc", marginTop: 14 }}>Unlimited Bay Access</p>}
          {totL > 0 && <p style={{ fontSize: 11, color: "#ffffffaa", marginTop: 10 }}>{totL} lesson credit{totL > 1 ? "s" : ""} active</p>}
          <p style={{ fontSize: 11, color: "#ffffff88", marginTop: 10 }}>Renews {renewDate}</p>
        </div>
        <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={S.detailCard}><h4 style={S.detailH}>Plan Details</h4>
            {[["Plan", td.n], ["Monthly Rate", "$" + td.price], ["Member Since", memberSince], ["Next Renewal", renewDate], ["Bay Hours", tier === "champion" ? "Unlimited (max 2hr/booking)" : bayCredits + " of 8 remaining"]].map(([l, v]) => <div key={l} style={S.detailRow}><span style={S.detailL}>{l}</span><span style={S.detailV}>{v}</span></div>)}</div>
          <div style={S.detailCard}><h4 style={S.detailH}>Perks</h4>
            {td.perks.map(p => <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}><span style={{ color: "#2D8A5E" }}>{X.chk(16)}</span><span style={{ fontSize: 13 }}>{p}</span></div>)}</div>
        </div>
        <div style={S.detailCard}><h4 style={S.detailH}>Cancellation Policy</h4>
          <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 12 }}>Next renewal: {renewDate}. 7-day cancellation notice required. Cancellations within 7 days of renewal are charged for the next cycle.</p>
          <button style={{ ...S.b1, background: "#E03928" }} onClick={() => setMemModal("cancel")}>Cancel Membership</button></div>
      </>}


      {memTab === "memberships" && <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {Object.entries(TIERS).map(([k, t]) => <div key={k} style={{ ...S.pkgCard, borderLeft: `3px solid ${t.c}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ background: t.c, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, fontFamily: mono, letterSpacing: 1 }}>{t.badge}</span><span style={{ fontSize: 16, fontWeight: 700 }}>{t.n}</span></div>
          <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>${t.price}<span style={{ fontSize: 13, color: "#888", fontWeight: 400 }}>/mo</span></p>
          {t.perks.map(p => <div key={p} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}><span style={{ color: t.c, flexShrink: 0 }}>{X.chk(14)}</span><span style={{ fontSize: 12 }}>{p}</span></div>)}
          <div style={{ marginTop: 14 }}>{k === tier ? <span style={{ fontSize: 13, fontWeight: 600, color: t.c }}>Current Plan</span> : hasCard ? <button style={{ ...S.b1, background: t.c }} onClick={() => setMemModal({ type: "switch", to: k })}>{Object.keys(TIERS).indexOf(k) > Object.keys(TIERS).indexOf(tier) ? "Upgrade" : "Switch"}</button> : <button style={{ ...S.b1, background: "#ccc" }} onClick={() => setTab("profile")}>Add Card First</button>}</div>
        </div>)}
      </div>}

      {memModal === "cancel" && (() => {
        const today = new Date(); today.setHours(0,0,0,0);
        const rd = renewDate ? new Date(renewDate) : null;
        const daysToRenewal = rd ? Math.ceil((rd - today) / 86400000) : 999;
        const withinWindow = daysToRenewal >= 0 && daysToRenewal <= 7;
        return <div style={S.ov} onClick={() => setMemModal(null)}><div style={S.mod} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Cancel Membership?</h3>
          {withinWindow ? (
            <div style={{ background: "#FFF8E8", border: "1px solid #E8890C44", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#E8890C", marginBottom: 6 }}>⚠️ Within 7-Day Renewal Window</p>
              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>Your renewal date is {renewDate} — within 7 days. Your {td?.n} membership <strong>will renew this cycle</strong> but <strong>will not auto-renew after that</strong>.</p>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>Your {td?.n} membership will be <strong>cancelled immediately</strong>. Access ends today.</p>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={S.b2} onClick={() => setMemModal(null)}>Keep Plan</button>
            <button style={{ ...S.b1, flex: 2, background: "#E03928" }} onClick={async () => {
              await sb.post("membership_history", { customer_id: customerId, action: "cancel", tier, amount: 0, date: dateKey(new Date()) });
              await sb.post("transactions", { customer_id: customerId, description: (withinWindow ? "Membership Cancellation Scheduled — " : "Membership Cancelled — ") + (td?.n || "") + " Plan", date: dateKey(new Date()), amount: 0, payment_label: "System" });
              if (!withinWindow) {
                await sb.patch("customers", `id=eq.${customerId}`, { tier: "none", bay_credits_remaining: 0 });
                setTier("none"); setBayCredits(0);
              }
              try { await fetch(SQUARE_FN_URL, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}` }, body: JSON.stringify({ action: "email.cancellation", customer_id: customerId, tier: td?.n, renewal_date: renewDate, within_window: withinWindow }) }); } catch(e) { console.warn("Email failed", e); }
              fire(withinWindow ? "Cancellation scheduled after " + renewDate : "Membership cancelled");
              setMemModal(null);
            }}>{withinWindow ? "Schedule Cancellation" : "Confirm Cancel"}</button>
          </div>
        </div></div>;
      })()}

      {memModal?.type === "switch" && <div style={S.ov} onClick={() => setMemModal(null)}><div style={S.mod} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Switch to {TIERS[memModal.to]?.n}?</h3>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>Your plan will change to {TIERS[memModal.to]?.n} (${TIERS[memModal.to]?.price}/mo) starting next billing cycle.</p>
        <div style={{ display: "flex", gap: 10 }}><button style={S.b2} onClick={() => setMemModal(null)}>Cancel</button><button style={{ ...S.b1, flex: 2, background: TIERS[memModal.to]?.c }} onClick={async () => {
          await sb.patch("customers", `id=eq.${customerId}`, { tier: memModal.to });
          await sb.post("membership_history", { customer_id: customerId, action: Object.keys(TIERS).indexOf(memModal.to) > Object.keys(TIERS).indexOf(tier) ? "upgrade" : "downgrade", tier: memModal.to, amount: TIERS[memModal.to]?.price });
          const newTier = memModal.to; const newPrice = TIERS[newTier]?.price || 0;
          setTier(newTier); setBayCredits(TIERS[newTier]?.hrs === -1 ? 999 : TIERS[newTier]?.hrs || 0);
          const todayStr = new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
          setMemberSince(todayStr); const rd=new Date(); rd.setMonth(rd.getMonth()+1); setRenewDate(rd.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}));
          await sb.post("transactions", { customer_id: customerId, description: TIERS[newTier]?.n + " Membership", date: dateKey(new Date()), amount: newPrice, payment_label: "Visa ····4242" });
          setTransactions(p => [{ desc: TIERS[newTier]?.n + " Membership", date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), method: "Visa ····4242", amt: "$" + newPrice + ".00" }, ...p]);
          // Send membership confirmation email
          sendEmail("membership", {
            customer_name: onbF + " " + onbL,
            customer_email: profEmail || onbE,
            plan: TIERS[newTier]?.n + " Plan",
            price: "$" + newPrice + "/mo",
            renewal: rd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          });
          fire("Plan updated!"); setMemModal(null); setMemTab("current");
        }}>Confirm Switch</button></div>
      </div></div>}
    </>;
  };

  /* ─── PROFILE ─── */
  const renderProfile = () => <>
    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Profile</h2>
    <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={S.sec}><h4 style={S.secL}>Personal Information</h4>
        {[{ l: "First Name", v: onbF }, { l: "Last Name", v: onbL }, { l: "Phone", v: profPhone ? ("+1 " + profPhone.replace(/\D/g,"").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")) : ("+1 " + ph.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")), edit: "phone" }, { l: "Email", v: profEmail || onbE, edit: "email" }].map(f =>
          <div key={f.l} style={S.fRow}><div style={{ flex: 1 }}><p style={S.fL}>{f.l}</p><p style={S.fV}>{f.v}</p></div>
            {f.edit && <button style={S.editBtn} onClick={() => setEditModal({ type: f.edit, val: "", step: "edit", otp: ["","","","","",""] })}>{X.edit(14)}</button>}</div>)}
      </div>
      <div style={S.sec}><h4 style={S.secL}>Payment Methods</h4>
        {cards.map(c => <div key={c.id} style={S.fRow}><div style={{ flex: 1 }}><p style={{ fontSize: 14, fontWeight: 600 }}>{c.brand} ····{c.last4}</p><p style={{ fontSize: 11, color: "#888" }}>Exp {c.exp}</p></div>
          {cards.length > 1 ? <button style={S.delCardBtn} onClick={() => { setCards(p => p.filter(x => x.id !== c.id)); fire("Card removed"); }}>{X.trash(14)}</button> : <span style={{ fontSize: 10, color: "#aaa", fontWeight: 600 }}>Required</span>}</div>)}
        {addCard ? <div style={{ marginTop: 12 }}>
          <input
            style={S.profIn} placeholder="Card number" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={19}
            value={newCard.num}
            onChange={e => {
              const v = e.target.value.replace(/\D/g,"").slice(0,16);
              const fmt = v.match(/.{1,4}/g)?.join(" ") || v;
              if (fmt !== newCard.num) { setNewCard(p => ({ ...p, num: fmt })); if (v.length === 16) cardExpRef.current?.focus(); }
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              ref={cardExpRef} style={{ ...S.profIn, flex: 1 }} placeholder="MM/YY" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={5}
              value={newCard.exp}
              onChange={e => {
                let v = e.target.value.replace(/\D/g,"").slice(0,4);
                if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2);
                if (v !== newCard.exp) { setNewCard(p => ({ ...p, exp: v })); if (v.length === 5) cardCvcRef.current?.focus(); }
              }}
            />
            <input
              ref={cardCvcRef} style={{ ...S.profIn, flex: 1 }} placeholder="CVC" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4}
              value={newCard.cvc}
              onChange={e => {
                const v = e.target.value.replace(/\D/g,"").slice(0,4);
                if (v !== newCard.cvc) setNewCard(p => ({ ...p, cvc: v }));
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button style={S.b2} onClick={() => { setAddCard(false); setNewCard({ num: "", exp: "", cvc: "" }); }}>Cancel</button><button style={{ ...S.b1, flex: 2 }} onClick={async () => {
            const rawNum = newCard.num.replace(/\D/g, "");
            const rawExp = newCard.exp.replace(/\D/g, "");
            const rawCvc = newCard.cvc.replace(/\D/g, "");
            // Validate card number (Luhn algorithm)
            const luhn = n => { let s=0,d=false; for(let i=n.length-1;i>=0;i--){let v=+n[i];if(d&&(v*=2)>9)v-=9;s+=v;d=!d;}return s%10===0; };
            if (rawNum.length < 15 || rawNum.length > 16) { fire("Invalid card number"); return; }
            if (!luhn(rawNum)) { fire("Card number is invalid"); return; }
            if (rawExp.length !== 4) { fire("Invalid expiry (use MM/YY)"); return; }
            const expMonth = parseInt(rawExp.slice(0,2));
            const expYear = parseInt("20" + rawExp.slice(2));
            const now = new Date();
            if (expMonth < 1 || expMonth > 12 || new Date(expYear, expMonth) < now) { fire("Card has expired"); return; }
            if (rawCvc.length < 3 || rawCvc.length > 4) { fire("Invalid CVC"); return; }
            // Detect brand
            const brand = rawNum[0] === "4" ? "Visa" : rawNum[0] === "5" ? "Mastercard" : rawNum.startsWith("34") || rawNum.startsWith("37") ? "Amex" : "Card";
            const last4 = rawNum.slice(-4);
            // Save to Square via proxy then to Supabase
            const sqResult = await square("card.create", {
              square_customer_id: sqCustId,
              source_id: "cnon:card-nonce-ok", // sandbox test nonce — replace with Web Payments SDK nonce in production
            });
            const sqCardId = sqResult?.card?.id || null;
            const saved = await sb.post("payment_methods", { customer_id: customerId, brand, last4, exp: newCard.exp, square_card_id: sqCardId });
            const savedId = Array.isArray(saved) ? saved[0]?.id : saved?.id;
            setCards(p => [...p, { id: savedId || Date.now(), brand, last4, exp: newCard.exp, square_card_id: sqCardId }]);
            setAddCard(false); setNewCard({ num: "", exp: "", cvc: "" }); fire("Card added"); setTab("home");
          }}>Save Card</button></div></div>
        : <button style={S.addCardBtn} onClick={() => setAddCard(true)}>{X.plus(14)} Add Card</button>}
      </div>
    </div>

    <div style={S.sec}><h4 style={S.secL}>Transaction History</h4>
      {transactions.length === 0 ? <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "12px 0" }}>No transactions yet</p> :
      transactions.map((t, i) => <div key={i} style={S.fRow}><div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 500 }}>{t.desc}</p><p style={{ fontSize: 11, color: "#888" }}>{t.date} · {t.method}</p></div><span style={{ fontSize: 13, fontWeight: 600, color: t.amt === "$0.00" ? "#2D8A5E" : "#1a1a1a" }}>{t.amt}</span></div>)}
      <p style={{ fontSize: 10, color: "#ccc", textAlign: "center", marginTop: 14 }}>Powered by Square</p></div>

    <button style={{ ...S.b1, background: "#E03928", marginTop: 8 }} onClick={() => { setLogged(false); setAuthStep("phone"); setPh(""); setOtp(["","","","","",""]); setOnbF(""); setOnbL(""); setOnbE(""); }}>{X.out(16)} Sign Out</button>

    {editModal && <div style={S.ov} onClick={() => setEditModal(null)}><div style={S.mod} onClick={e => e.stopPropagation()}>
      {editModal.step === "edit" ? <>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Update {editModal.type === "phone" ? "Phone" : "Email"}</h3>
        <input style={S.profIn} placeholder={editModal.type === "phone" ? "+1 (305) 555-0000" : "you@email.com"} value={editModal.val} onChange={e => setEditModal(p => ({ ...p, val: e.target.value }))} />
        <button style={{ ...S.b1, marginTop: 12 }} onClick={() => setEditModal(p => ({ ...p, step: "otp" }))}>Send Verification Code</button>
      </> : <>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Enter Code</h3>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>Demo: any 6 digits</p>
        <div style={{ ...LS.otpRow, justifyContent: "center" }}>{editModal.otp.map((v, i) => <input key={i} ref={editOtpRefs[i]} style={{ ...LS.otpIn, width: 40, height: 44 }} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={v} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, "").slice(-1); const next = [...editModal.otp]; next[i] = val; setEditModal(p => ({ ...p, otp: next })); if (val && i < 5) editOtpRefs[i + 1].current?.focus(); }} onKeyDown={e => { if (e.key === "Backspace" && !editModal.otp[i] && i > 0) editOtpRefs[i - 1].current?.focus(); }} />)}</div>
        <button style={{ ...S.b1, marginTop: 12 }} onClick={async () => {
          if (editModal.type === "phone") {
            setProfPhone(editModal.val);
            await sb.patch("customers", `id=eq.${customerId}`, { phone: editModal.val });
            if (sqCustId) await square("customer.update", { square_customer_id: sqCustId, phone: editModal.val.replace(/\D/g,"") });
          } else {
            setProfEmail(editModal.val);
            await sb.patch("customers", `id=eq.${customerId}`, { email: editModal.val });
            if (sqCustId) await square("customer.update", { square_customer_id: sqCustId, email: editModal.val });
          }
          fire((editModal.type === "phone" ? "Phone" : "Email") + " updated"); setEditModal(null);
        }}>Verify & Save</button>
      </>}
      <button style={{ ...S.lk, marginTop: 10, display: "block", textAlign: "center", width: "100%" }} onClick={() => setEditModal(null)}>Cancel</button>
    </div></div>}
    <div style={{ height: 40 }} />
  </>;

  /* ─── LAYOUT ─── */
  return (
    <div style={S.shell}><style>{CSS}</style>
      {!isMobile && <TopNav />}
      <div style={S.scroll}>{renderContent()}</div>
      {isMobile && <BottomNav />}
      {/* ══ MANAGE BOOKING MODAL ══ */}
      {manageBk && <ManageBookingModal
        bk={manageBk}
        onClose={() => setManageBk(null)}
        customerId={customerId}
        tier={tier}
        bayCredits={bayCredits}
        setBayCredits={setBayCredits}
        cfg={cfg}
        sb={sb}
        square={square}
        cards={cards}
        fire={fire}
        profEmail={profEmail}
        onbE={onbE}
        onbF={onbF}
        onbL={onbL}
        onRefresh={() => {
          if (customerId) {
            const today = new Date(); today.setHours(0,0,0,0);
            sb.get("bookings", `select=*&customer_id=eq.${customerId}&status=eq.confirmed&order=date.asc`).then(bks => {
              const upcoming = (bks || []).filter(b => new Date(b.date + "T23:59:59") >= today);
              setUpcomingBk(upcoming.map(b => ({
                id: b.id, type: b.type,
                label: b.type === "lesson" ? "Lesson · " + (b.coach_name || "") : "Bay " + b.bay,
                sub: new Date(b.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " · " + b.start_time + " · " + (b.duration_slots * 0.5) + "hr" + (b.duration_slots > 2 ? "s" : ""),
                date: b.date, start_time: b.start_time, bay: b.bay,
                duration_slots: b.duration_slots, credits_used: b.credits_used || 0,
                amount: b.amount || 0, square_payment_id: b.square_payment_id || null,
                square_customer_id: b.square_customer_id || null, coach_name: b.coach_name || "",
              })));
            });
            sb.get("bookings", "select=id,bay,date,start_time,duration_slots,status,type&status=neq.cancelled").then(a => { if (a?.length) setAllBookings(a); });
          }
        }}
        SUPABASE_KEY={SUPABASE_KEY}
        SQUARE_FN_URL={SQUARE_FN_URL}
        ff={ff}
        mono={mono}
      />}
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MANAGE BOOKING MODAL — Cancel bay & lesson bookings
   ═══════════════════════════════════════════════════════════ */

function ManageBookingModal({ bk, onClose, customerId, tier, bayCredits, setBayCredits, cfg, sb, square, cards, fire, onRefresh, SUPABASE_KEY, SQUARE_FN_URL, ff, mono, profEmail, onbE, onbF, onbL }) {
  const [saving, setSaving] = React.useState(false);

  const toH = s => { const [t,ap]=s.split(" "); let [h,m]=t.split(":").map(Number); if(ap==="PM"&&h!==12)h+=12; if(ap==="AM"&&h===12)h=0; return h+m/60; };

  // Parse booking start time into a proper local Date
  const bkStart = (() => {
    const [t,ap] = (bk.start_time||"9:00 AM").split(" ");
    let [h,m] = t.split(":").map(Number);
    if(ap==="PM"&&h!==12) h+=12; if(ap==="AM"&&h===12) h=0;
    const d = new Date(bk.date + "T00:00:00");
    d.setHours(h, m, 0, 0);
    return d;
  })();

  const hoursUntil = (bkStart - new Date()) / 3600000;
  const within24   = hoursUntil <= 24 && hoursUntil > 0;
  const isPast     = hoursUntil <= 0;

  // Rate for this booking slot
  const d    = new Date(bk.date + "T12:00:00");
  const isWk = d.getDay() === 0 || d.getDay() === 6;
  const hour = toH(bk.start_time || "9:00 AM");
  const isPeak = !isWk && hour >= 17;
  const rate = isPeak ? cfg.pk : cfg.op;

  const creditsUsed = bk.credits_used || 0;
  const isMember    = tier && tier !== "none" && tier !== "starter";
  const isLesson    = bk.type === "lesson";
  const lateFee     = rate; // 1hr bay rate for lesson late cancel

  // Send cancellation email
  const sendCancelEmail = async (refundDesc) => {
    try {
      await fetch(SQUARE_FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          action: "email.send",
          type: "cancellation",
          customer_name: (onbF + " " + onbL).trim(),
          customer_email: profEmail || onbE,
          booking_type: isLesson ? "Lesson" : "Bay Booking",
          date: bk.date,
          time: bk.start_time,
          bay: bk.bay ? "Bay " + bk.bay : "",
          refund_info: refundDesc,
        }),
      });
    } catch(e) { console.warn("Cancel email failed", e); }
  };

  /* ── Cancel booking ── */
  const cancelBooking = async () => {
    setSaving(true);

    // 1. Mark booking cancelled — this immediately frees the bay
    await sb.patch("bookings", `id=eq.${bk.id}`, {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    });

    let refundDesc = "No refund (within 24-hour cancellation window).";

    if (within24 && isLesson) {
      // Lesson within 24h: charge late fee
      const defaultCard = cards[0];
      let sqPaymentId = null;
      if (defaultCard?.square_card_id && bk.square_customer_id) {
        const payment = await square("payment.create", {
          square_customer_id: bk.square_customer_id,
          card_id: defaultCard.square_card_id,
          amount: lateFee,
          note: `Late cancellation fee · Lesson ${bk.date}`,
        });
        sqPaymentId = payment?.payment?.id || null;
      }
      await sb.post("transactions", {
        customer_id: customerId,
        description: `Late Cancellation Fee · Lesson`,
        date: new Date().toISOString().split("T")[0],
        amount: lateFee,
        payment_label: "Card",
        square_payment_id: sqPaymentId,
      });
      refundDesc = `Late cancellation fee of $${lateFee.toFixed(2)} charged.`;
      fire(`Lesson cancelled · $${lateFee.toFixed(2)} fee charged`);

    } else if (!within24) {
      // Outside 24h window: full refund — handle credits AND card simultaneously
      const refundParts = [];

      // Refund credits if any were used
      if (creditsUsed > 0 && isMember) {
        const newCredits = bayCredits + creditsUsed;
        await sb.patch("customers", `id=eq.${customerId}`, { bay_credits_remaining: newCredits });
        setBayCredits(newCredits);
        await sb.post("transactions", {
          customer_id: customerId,
          description: `Refund (credits) · ${isLesson ? "Lesson" : "Bay " + bk.bay}`,
          date: new Date().toISOString().split("T")[0],
          amount: 0,
          payment_label: "Credits",
        });
        refundParts.push(`${creditsUsed} credit${creditsUsed !== 1 ? "s" : ""} returned`);
      }

      // Refund card charge if any money was paid
      if (bk.square_payment_id && bk.amount > 0) {
        await square("payment.refund", {
          payment_id: bk.square_payment_id,
          amount: bk.amount,
          reason: "Customer cancellation",
        });
        await sb.post("transactions", {
          customer_id: customerId,
          description: `Refund · ${isLesson ? "Lesson" : "Bay " + bk.bay}`,
          date: new Date().toISOString().split("T")[0],
          amount: -(bk.amount),
          payment_label: "Refund",
        });
        refundParts.push(`$${bk.amount.toFixed(2)} refunded to card`);
      }

      if (refundParts.length > 0) {
        refundDesc = refundParts.join(" + ") + ".";
        fire("Cancelled · " + refundParts.join(" + "));
      } else {
        // No payment on file — still log cancellation
        await sb.post("transactions", {
          customer_id: customerId,
          description: `Cancellation · ${isLesson ? "Lesson" : "Bay " + (bk.bay || bk.label || "")}`,
          date: new Date().toISOString().split("T")[0],
          amount: 0,
          payment_label: "N/A",
        });
        fire("Booking cancelled");
      }
    } else {
      // Bay within 24h: no refund — still log cancellation
      await sb.post("transactions", {
        customer_id: customerId,
        description: `Cancellation (no refund) · ${isLesson ? "Lesson" : "Bay " + (bk.bay || bk.label || "")}`,
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        payment_label: "N/A",
      });
      fire("Booking cancelled (no refund)");
    }

    // Send cancellation confirmation email
    await sendCancelEmail(refundDesc);

    setSaving(false);
    onClose();
    onRefresh();
  };

  const GREEN="#2D8A5E", RED="#E03928", ORANGE="#E8890C", PURPLE="#5B6DCD";
  const accentColor = isLesson ? PURPLE : GREEN;
  const ov  = { position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20 };
  const mod = { background:"#fff",borderRadius:20,padding:24,maxWidth:420,width:"100%",maxHeight:"85vh",overflowY:"auto" };
  const btn1 = c => ({ background:c,color:"#fff",border:"none",borderRadius:12,padding:"13px 18px",fontSize:14,fontWeight:600,fontFamily:ff,cursor:"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8 });
  const btn2 = { background:"#f0f0ee",color:"#1a1a1a",border:"none",borderRadius:12,padding:"13px 18px",fontSize:14,fontWeight:600,fontFamily:ff,cursor:"pointer",width:"100%",marginTop:8 };

  return (
    <div style={ov} onClick={onClose}>
      <div style={mod} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
          <div style={{ width:40,height:40,borderRadius:10,background:accentColor+"14",color:accentColor,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18 }}>
            {isLesson ? "🎓" : "⛳"}
          </div>
          <div>
            <h3 style={{ fontSize:16,fontWeight:700 }}>{bk.label}</h3>
            <p style={{ fontSize:12,color:"#888" }}>{bk.sub}</p>
          </div>
        </div>

        {isPast ? (
          <div style={{ background:"#f8f8f6",borderRadius:10,padding:14,marginBottom:16,textAlign:"center" }}>
            <p style={{ fontSize:13,color:"#888" }}>This booking has already passed.</p>
          </div>
        ) : (
          <>
            {/* Policy message */}
            <div style={{ background: within24 ? RED+"08" : GREEN+"08", border:`1px solid ${within24 ? RED : GREEN}22`, borderRadius:10,padding:14,marginBottom:18 }}>
              {within24 ? (
                isLesson ? (
                  <>
                    <p style={{ fontSize:13,fontWeight:700,color:RED,marginBottom:6 }}>Within 24-Hour Window</p>
                    <p style={{ fontSize:12,color:"#555",lineHeight:1.6 }}>Per our cancellation policy, cancelling within 24 hours of your lesson will incur a <strong>${lateFee.toFixed(2)}</strong> fee (the cost of renting the bay during your reserved hour). No refund on the lesson payment.</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize:13,fontWeight:700,color:RED,marginBottom:6 }}>Cancelling within 24 hours</p>
                    <p style={{ fontSize:12,color:"#555",lineHeight:1.6 }}>This booking starts soon, so it's no longer eligible for a refund. You can still cancel, but no credits or charges will be returned.</p>
                  </>
                )
              ) : (
                <>
                  <p style={{ fontSize:13,fontWeight:700,color:GREEN,marginBottom:6 }}>You're good to cancel</p>
                  <p style={{ fontSize:12,color:"#555",lineHeight:1.6 }}>
                    You can still cancel this booking and receive a full refund. If you paid with credits, they'll be returned to your account.
                  </p>
                </>
              )}
            </div>

            <button style={btn1(RED)} onClick={cancelBooking} disabled={saving}>
              {saving ? "Processing..." : "Cancel"}
            </button>
          </>
        )}

        <button style={btn2} onClick={onClose}>Keep Booking</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════ */

const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px}input:focus,button:focus{outline:none}@keyframes ti{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}button:active{transform:scale(0.97)}`;

const LS = {
  w: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#0B2E1A,#1A5C3A 45%,#2D8A5E)", fontFamily: ff, padding: 20 },
  c: { background: "#fff", borderRadius: 22, padding: "36px 28px", width: "100%", maxWidth: 420, boxShadow: "0 28px 80px rgba(0,0,0,0.28)" },
  br: { textAlign: "center", marginBottom: 24 },
  bn: { fontFamily: mono, fontSize: 18, fontWeight: 700, color: "#0B2E1A", letterSpacing: 3 },
  bs: { fontFamily: ff, fontSize: 12, color: "#888", letterSpacing: 0.5, marginTop: 4 },
  label: { fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, marginBottom: 6, display: "block" },
  phRow: { display: "flex", alignItems: "center", gap: 8, background: "#f8f8f6", borderRadius: 12, padding: "0 14px", border: "1px solid #e8e8e6" },
  phPre: { fontSize: 14, fontWeight: 600, color: "#555", flexShrink: 0 },
  phIn: { flex: 1, border: "none", background: "transparent", padding: "14px 0", fontSize: 16, fontFamily: ff, color: "#1a1a1a" },
  demo: { marginTop: 14, textAlign: "center", fontSize: 12, color: "#2D8A5E", fontWeight: 600, background: "#2D8A5E10", padding: "8px 16px", borderRadius: 20 },
  tagline: { fontSize: 16, fontWeight: 600, color: "#0B2E1A", textAlign: "center", marginBottom: 10 },
  features: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 20 },
  feat: { fontSize: 11, color: "#555", whiteSpace: "nowrap" },
  featDot: { fontSize: 11, color: "#ccc" },
  divider: { height: 1, background: "#e8e8e6", marginBottom: 18 },
  signInLabel: { fontSize: 13, color: "#888", textAlign: "center", marginBottom: 14 },
  footer: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f2f2f0" },
  footerText: { fontSize: 11, color: "#aaa" },
  otpRow: { display: "flex", gap: 8, justifyContent: "center" },
  otpIn: { width: 46, height: 52, textAlign: "center", fontSize: 22, fontWeight: 700, fontFamily: mono, border: "1px solid #e8e8e6", borderRadius: 12, background: "#f8f8f6", color: "#1a1a1a" },
  nameRow: { display: "flex", gap: 10, marginBottom: 12 },
  onbIn: { width: "100%", padding: "13px 14px", border: "1px solid #e8e8e6", borderRadius: 12, fontSize: 14, fontFamily: ff, color: "#1a1a1a" },
};

const S = {
  shell: { fontFamily: ff, minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FAFAF8", overflow: "hidden" },
  scroll: { flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" },
  page: { maxWidth: 680, margin: "0 auto", padding: "24px 20px 80px", width: "100%" },

  /* Top nav (desktop/tablet) */
  topNav: { background: "#fff", borderBottom: "1px solid #e8e8e6", position: "sticky", top: 0, zIndex: 100 },
  topNavInner: { maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 60 },
  topNavBrand: { flexShrink: 0 },
  topNavLinks: { display: "flex", gap: 4 },
  topNavBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "none", background: "transparent", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#888", cursor: "pointer", fontFamily: ff },
  topNavBtnActive: { background: "#2D8A5E0E", color: "#2D8A5E", fontWeight: 600 },
  tierBadge: { fontSize: 11, fontWeight: 700, color: "#fff", padding: "6px 12px", borderRadius: 8, fontFamily: mono, letterSpacing: 1, border: "none", cursor: "pointer", flexShrink: 0 },

  /* Bottom nav (mobile) */
  nav: { display: "flex", borderTop: "1px solid #e8e8e6", background: "#fff", paddingBottom: "env(safe-area-inset-bottom, 0px)" },
  navBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "10px 0 8px", border: "none", background: "none", cursor: "pointer", fontFamily: ff },

  /* Buttons */
  b1: { background: "#2D8A5E", color: "#fff", border: "none", borderRadius: 12, padding: "14px 18px", fontSize: 14, fontWeight: 600, fontFamily: ff, cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  b2: { background: "#f0f0ee", color: "#1a1a1a", border: "none", borderRadius: 12, padding: "14px 18px", fontSize: 14, fontWeight: 600, fontFamily: ff, cursor: "pointer", flex: 1, textAlign: "center" },
  lk: { background: "none", border: "none", color: "#2D8A5E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff },

  /* Header / Back */
  hd: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  bk: { width: 36, height: 36, borderRadius: 10, background: "#f0f0ee", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "#1a1a1a" },
  ht: { fontSize: 18, fontWeight: 700, color: "#0B2E1A" },

  /* Greeting */
  greetRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  greetH: { fontSize: 22, fontWeight: 700, color: "#0B2E1A" },
  greetS: { fontSize: 13, color: "#888", marginTop: 2 },

  /* Quick actions */
  qGrid: { display: "grid", gap: 10, marginBottom: 24 },
  qBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 4px", background: "#fff", border: "1px solid #e8e8e6", borderRadius: 14, cursor: "pointer", fontFamily: ff },
  qIc: { width: 40, height: 40, borderRadius: 10, background: "#2D8A5E10", color: "#2D8A5E", display: "flex", alignItems: "center", justifyContent: "center" },
  qL: { fontSize: 11, fontWeight: 600, color: "#555" },

  /* Section headers */
  sh: { fontSize: 15, fontWeight: 700, color: "#0B2E1A", marginBottom: 12, marginTop: 8 },
  stepH: { fontSize: 14, fontWeight: 700, color: "#0B2E1A", marginBottom: 10, marginTop: 18 },

  /* Cards */
  emptyCard: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 14, padding: 20, textAlign: "center", marginBottom: 14 },
  upCard: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e8e8e6", borderRadius: 14, padding: "14px 16px", marginBottom: 8 },
  upIc: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  creditCard: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 14, padding: 16 },
  creditBanner: { background: "#2D8A5E10", border: "1px solid #2D8A5E22", borderRadius: 14, padding: "14px 16px", marginBottom: 10 },

  /* Progress bar */
  bar: { height: 6, borderRadius: 3, background: "#f0f0ee", overflow: "hidden" },
  barF: { height: "100%", borderRadius: 3, transition: "width .3s" },

  /* About / Contact */
  aboutGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 },
  aboutCard: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 14, padding: 16 },
  contactBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: "#fff", border: "1px solid #e8e8e6", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#2D8A5E", textDecoration: "none", fontFamily: ff, cursor: "pointer" },

  /* Date scroll */
  dateScroll: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 4 },
  dateBtn: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, minWidth: 60, height: 78, padding: "6px 8px", background: "#fff", border: "1.5px solid #e8e8e6", borderRadius: 14, cursor: "pointer", fontFamily: ff, position: "relative", flexShrink: 0 },
  dateSel: { background: "#2D8A5E", borderColor: "#2D8A5E" },

  /* Grids */
  durGrid: { display: "grid", gap: 8 },
  durBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px 6px", background: "#fff", border: "1.5px solid #e8e8e6", borderRadius: 12, cursor: "pointer", fontFamily: ff },
  durSel: { background: "#2D8A5E", borderColor: "#2D8A5E" },
  timeGrid: { display: "grid", gap: 8 },
  timeBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "12px 6px", background: "#fff", border: "1.5px solid #e8e8e6", borderRadius: 10, cursor: "pointer", fontFamily: ff },
  timeSel: { background: "#2D8A5E", borderColor: "#2D8A5E" },
  bayGrid: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 },
  bayBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px 4px", background: "#fff", border: "1.5px solid #e8e8e6", borderRadius: 12, cursor: "pointer", fontFamily: ff },
  baySel: { background: "#2D8A5E", borderColor: "#2D8A5E" },
  bayOff: { opacity: 0.4, cursor: "not-allowed" },

  /* Price / Confirmation */
  pricePreview: { background: "#2D8A5E0A", border: "1px solid #2D8A5E22", borderRadius: 14, padding: 16, marginTop: 14 },
  rateInfo: { marginTop: 20, padding: "12px 14px", background: "#f8f8f6", borderRadius: 10 },
  confCard: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: 20, marginBottom: 14 },
  confRow: { display: "flex", justifyContent: "space-between", padding: "8px 0" },
  confL: { fontSize: 13, color: "#888" },
  confV: { fontSize: 13, fontWeight: 600, textAlign: "right" },
  confDiv: { height: 1, background: "#f2f2f0", margin: "6px 0" },
  polBox: { background: "#FFF8F0", border: "1px solid #E8890C22", borderRadius: 14, padding: 16, marginTop: 14 },
  chkRow: { display: "flex", alignItems: "center", cursor: "pointer" },

  /* Tabs */
  tabs: { display: "flex", gap: 3, marginBottom: 16, background: "#f0f0ee", borderRadius: 12, padding: 3 },
  tabBtn: { flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, color: "#888", textAlign: "center" },
  tabSel: { background: "#fff", color: "#1a1a1a", boxShadow: "0 1px 4px rgba(0,0,0,.08)" },

  /* Mode toggle */
  modeToggle: { display: "flex", gap: 3, marginBottom: 14, background: "#f0f0ee", borderRadius: 10, padding: 3 },
  modeBtn: { flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, color: "#888", textAlign: "center" },
  modeSel: { background: "#fff", color: "#5B6DCD", boxShadow: "0 1px 4px rgba(0,0,0,.06)" },

  /* Coach card */
  coachCard: { flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "14px 14px", background: "#fff", border: "1.5px solid #e8e8e6", borderRadius: 14, cursor: "pointer", fontFamily: ff },
  coachAv: { width: 36, height: 36, borderRadius: 8, background: "#5B6DCD", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: mono, flexShrink: 0 },

  /* Package / Detail cards */
  pkgCard: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: 20, marginBottom: 14 },
  creditDetailCard: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: 20, marginBottom: 14 },
  detailCard: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: 20, marginBottom: 14 },
  detailH: { fontSize: 14, fontWeight: 700, marginBottom: 12 },
  detailRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f2f2f0" },
  detailL: { fontSize: 13, color: "#888" },
  detailV: { fontSize: 13, fontWeight: 600, textAlign: "right" },

  /* Membership gradient card */
  mc: { borderRadius: 18, padding: "22px 20px", marginBottom: 18 },
  mcBadge: { background: "#ffffff33", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, fontFamily: mono, letterSpacing: 1 },
  mcManage: { fontSize: 12, fontWeight: 600, color: "#ffffffcc", background: "#ffffff22", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: ff },

  /* History row */
  histRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f2f2f0" },

  /* Profile */
  sec: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: 20, marginBottom: 14 },
  secL: { fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#0B2E1A" },
  fRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f2f2f0" },
  fL: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 2 },
  fV: { fontSize: 14, fontWeight: 500 },
  editBtn: { width: 32, height: 32, borderRadius: 8, background: "#f0f0ee", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#888", flexShrink: 0 },
  addCardBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, padding: "12px 16px", background: "#f8f8f6", border: "1px dashed #ccc", borderRadius: 12, width: "100%", fontSize: 13, fontWeight: 600, color: "#2D8A5E", cursor: "pointer", fontFamily: ff },
  delCardBtn: { width: 32, height: 32, borderRadius: 8, background: "#FFF0F0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#E03928", flexShrink: 0 },
  profIn: { width: "100%", padding: "13px 14px", border: "1px solid #e8e8e6", borderRadius: 12, fontSize: 14, fontFamily: ff, color: "#1a1a1a" },

  /* Toast */
  toast: { position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", padding: "12px 24px", borderRadius: 50, fontSize: 13, fontWeight: 500, fontFamily: ff, boxShadow: "0 10px 36px rgba(0,0,0,.22)", zIndex: 200, animation: "ti .25s ease", whiteSpace: "nowrap" },

  /* Overlay / Modal */
  ov: { position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 20, animation: "fadeIn .15s ease" },
  mod: { background: "#fff", borderRadius: 20, padding: 24, maxWidth: 440, width: "100%", maxHeight: "85vh", overflowY: "auto" },
};
