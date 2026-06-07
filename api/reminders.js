// BGS Booking Reminders — runs every 15 min via Vercel Cron
// Handles 24hr, 2hr, and 15-min extension reminders in one file

export const config = { runtime: "nodejs" };

const SUPABASE_URL = "https://dvaviudmsofyqttcazpw.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TWILIO_SID   = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM  = process.env.TWILIO_PHONE_NUMBER || "+18336995472";
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL || "https://book.birdiegolfstudios.com";
const BAYS         = [1, 2, 3, 4, 5];

// ── Supabase ─────────────────────────────────────────────────────────────────
async function sbGet(table, query = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.ok ? res.json() : [];
}

async function sbPost(table, body) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
}

// ── Duplicate guard ───────────────────────────────────────────────────────────
async function alreadySent(bookingId, type) {
  const rows = await sbGet("sent_reminders", `booking_id=eq.${bookingId}&type=eq.${type}&select=id`);
  return Array.isArray(rows) && rows.length > 0;
}

async function markSent(bookingId, type) {
  await sbPost("sent_reminders", { booking_id: bookingId, type, sent_at: new Date().toISOString() });
}

// ── Twilio SMS ────────────────────────────────────────────────────────────────
async function sendSMS(to, body) {
  const phone = to.replace(/\D/g, "");
  const e164  = phone.length === 10 ? `+1${phone}` : `+${phone}`;
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: e164, From: TWILIO_FROM, Body: body }).toString(),
    }
  );
  return res.ok;
}

// ── Time helpers ──────────────────────────────────────────────────────────────
function bookingStart(date, startTime) {
  const [time, meridiem] = startTime.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return new Date(`${date}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00-04:00`);
}

function bookingEnd(date, startTime, durationSlots) {
  return new Date(bookingStart(date, startTime).getTime() + (durationSlots || 2) * 30 * 60 * 1000);
}

function fmtTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
}

function toSlotTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
}

function todayStr(date) {
  return date.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();

  const now    = new Date();
  const today  = todayStr(now);
  const totals = { "24hr": 0, "2hr": 0, extend: 0 };

  // Fetch all confirmed bookings today and tomorrow
  const tomorrow = todayStr(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const [todayBks, tomorrowBks] = await Promise.all([
    sbGet("bookings", `select=*,customers(first_name,phone)&status=eq.confirmed&date=eq.${today}&type=in.(bay,lesson)`),
    sbGet("bookings", `select=*,customers(first_name,phone)&status=eq.confirmed&date=eq.${tomorrow}&type=in.(bay,lesson)`),
  ]);
  const allBks = [...(todayBks || []), ...(tomorrowBks || [])];

  for (const bk of allBks) {
    const cust = bk.customers;
    if (!cust?.phone) continue;

    const start    = bookingStart(bk.date, bk.start_time);
    const end      = bookingEnd(bk.date, bk.start_time, bk.duration_slots);
    const minsToStart = (start - now) / 60000;
    const minsToEnd   = (end   - now) / 60000;
    const typeLabel   = bk.type === "lesson" ? "lesson" : "bay";

    // ── 24hr reminder (window: 23h45m – 24h before start) ──
    if (minsToStart >= 23 * 60 + 45 && minsToStart < 24 * 60) {
      if (!(await alreadySent(bk.id, "24hr"))) {
        const msg = `Hey ${cust.first_name}! Reminder that you have a ${typeLabel} booked tomorrow at ${fmtTime(start)} at Birdie Golf Studios. See you then! 🏌️`;
        const ok  = await sendSMS(cust.phone, msg);
        if (ok) { await markSent(bk.id, "24hr"); totals["24hr"]++; }
      }
    }

    // ── 2hr reminder (window: 1h45m – 2h before start) ──
    if (minsToStart >= 105 && minsToStart < 120) {
      if (!(await alreadySent(bk.id, "2hr"))) {
        const msg = `Your ${typeLabel} at Birdie Golf Studios starts at ${fmtTime(start)}. We're at 45 NE 26th St, Miami, FL. See you soon!`;
        const ok  = await sendSMS(cust.phone, msg);
        if (ok) { await markSent(bk.id, "2hr"); totals["2hr"]++; }
      }
    }

    // ── Extension reminder (window: 0 – 15min before end, bay only) ──
    if (bk.type === "bay" && minsToEnd >= 0 && minsToEnd < 15) {
      if (!(await alreadySent(bk.id, "extend"))) {
        const nextSlotTime = toSlotTime(end);
        const takenBays    = (todayBks || [])
          .filter(b => b.id !== bk.id && b.start_time === nextSlotTime)
          .map(b => b.bay);
        const freeBays     = BAYS.filter(b => !takenBays.includes(b));
        if (freeBays.length > 0) {
          const sameBayFree = freeBays.includes(bk.bay);
          const extendUrl   = `${APP_URL}?extend=${bk.bay}&time=${encodeURIComponent(nextSlotTime)}`;
          const msg = sameBayFree
            ? `Your session ends in 15 minutes. Want to keep playing? Extend your time here: ${extendUrl}`
            : `Your session ends in 15 minutes. Want to keep playing? Bay ${freeBays[0]} is available — book it here: ${extendUrl}`;
          const ok = await sendSMS(cust.phone, msg);
          if (ok) { await markSent(bk.id, "extend"); totals.extend++; }
        }
      }
    }
  }

  res.status(200).json({ ok: true, ...totals });
}
