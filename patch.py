with open("src/App.jsx", "r") as f:
    src = f.read()

print(f"Read {len(src.splitlines())} lines")

# ── 1. Replace getBk / getAvailBays / getAllTimes ────────────────────────────
old1 = 'const MOCK_BK = {};\nfunction getBk(dt, slot) {\n  // All bays start available — real bookings come from Supabase\n  return [];\n}\n\nfunction getAvailBays(dt, startSlot, durSlots, bayBlocks) {\n  const hrs = getHours(dt); const si = hrs.indexOf(startSlot);\n  if (si === -1) return [];\n  const needed = hrs.slice(si, si + durSlots);\n  if (needed.length < durSlots) return [];\n  return [1,2,3,4,5].map(bay => ({ bay, ok: needed.every(s => !getBk(dt, s).includes(bay) && !isBayBlocked(bay, dt, s, bayBlocks)) }));\n}\n\nfunction getAllTimes(dt, durSlots, bayBlocks) {\n  const hrs = getHours(dt), result = [];\n  for (let i = 0; i <= hrs.length - durSlots; i++) {\n    const needed = hrs.slice(i, i + durSlots);\n    const consecutive = needed.every((s, j) => j === 0 || toH(s) - toH(needed[j - 1]) === 0.5);\n    if (!consecutive) continue;\n    const anyBayFree = [1,2,3,4,5].some(bay => needed.every(s => !getBk(dt, s).includes(bay) && !isBayBlocked(bay, dt, s, bayBlocks)));\n    result.push({ time: hrs[i], open: anyBayFree });\n  }\n  return result;\n}'

new1 = 'function getBk(dt, slot, realBookings) {\n  const dk = dt.toISOString().split("T")[0];\n  const occupied = [];\n  (realBookings || []).forEach(b => {\n    if (b.status === "cancelled" || b.date !== dk || !b.bay) return;\n    const allT = ["7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM"];\n    const bsi = allT.indexOf(b.start_time), si = allT.indexOf(slot);\n    if (bsi >= 0 && si >= bsi && si < bsi + (b.duration_slots || 2)) occupied.push(b.bay);\n  });\n  return occupied;\n}\n\nfunction getAvailBays(dt, startSlot, durSlots, bayBlocks, realBookings) {\n  const hrs = getHours(dt); const si = hrs.indexOf(startSlot);\n  if (si === -1) return [];\n  const needed = hrs.slice(si, si + durSlots);\n  if (needed.length < durSlots) return [];\n  return [1,2,3,4,5].map(bay => ({ bay, ok: needed.every(s => !getBk(dt, s, realBookings).includes(bay) && !isBayBlocked(bay, dt, s, bayBlocks)) }));\n}\n\nfunction getAllTimes(dt, durSlots, bayBlocks, realBookings) {\n  const hrs = getHours(dt), result = [];\n  for (let i = 0; i <= hrs.length - durSlots; i++) {\n    const needed = hrs.slice(i, i + durSlots);\n    const consecutive = needed.every((s, j) => j === 0 || toH(s) - toH(needed[j - 1]) === 0.5);\n    if (!consecutive) continue;\n    const anyBayFree = [1,2,3,4,5].some(bay => needed.every(s => !getBk(dt, s, realBookings).includes(bay) && !isBayBlocked(bay, dt, s, bayBlocks)));\n    result.push({ time: hrs[i], open: anyBayFree });\n  }\n  return result;\n}'

if old1 in src:
    src = src.replace(old1, new1, 1); print("OK: getBk/getAvailBays/getAllTimes")
else:
    print("FAIL: mock section")

# ── 2. Lesson availability functions ────────────────────────────────────────
old2 = 'function getLessonTimes(dt, coachFilter, bayBlocks) {\n  const dn = dayName(dt), hrs = getHours(dt), times = new Set();\n  (coachFilter ? [coachFilter] : COACHES).forEach(c => {\n    const avSlots = c.av[dn] || [];\n    avSlots.forEach((s, si) => {\n      const next = avSlots[si + 1];\n      if (!next || toH(next) - toH(s) !== 0.5) return;\n      if ([1,2,3,4,5].some(bay => [s, next].every(sl => !getBk(dt, sl).includes(bay) && !isBayBlocked(bay, dt, sl, bayBlocks))) && hrs.includes(s)) times.add(s);\n    });\n  });\n  return [...times].sort((a, b) => toH(a) - toH(b));\n}\nfunction getCoachesAt(dt, time, bayBlocks) {\n  const dn = dayName(dt);\n  return COACHES.filter(c => {\n    const avSlots = c.av[dn] || [], si = avSlots.indexOf(time);\n    if (si === -1) return false;\n    const next = avSlots[si + 1];\n    if (!next || toH(next) - toH(time) !== 0.5) return false;\n    return [1,2,3,4,5].some(bay => [time, next].every(sl => !getBk(dt, sl).includes(bay) && !isBayBlocked(bay, dt, sl, bayBlocks)));\n  });\n}\nfunction autoAssignBay(dt, time, bayBlocks) {\n  const hrs = getHours(dt), si = hrs.indexOf(time), needed = [time, hrs[si + 1]];\n  for (let bay = 1; bay <= 5; bay++) { if (needed.every(s => !getBk(dt, s).includes(bay) && !isBayBlocked(bay, dt, s, bayBlocks))) return bay; }\n  return 1;\n}'

new2 = 'function getLessonTimes(dt, coachFilter, bayBlocks, realBookings) {\n  const dn = dayName(dt), hrs = getHours(dt), times = new Set();\n  (coachFilter ? [coachFilter] : COACHES).forEach(c => {\n    const avSlots = c.av[dn] || [];\n    avSlots.forEach((s, si) => {\n      const next = avSlots[si + 1];\n      if (!next || toH(next) - toH(s) !== 0.5) return;\n      if ([1,2,3,4,5].some(bay => [s, next].every(sl => !getBk(dt, sl, realBookings).includes(bay) && !isBayBlocked(bay, dt, sl, bayBlocks))) && hrs.includes(s)) times.add(s);\n    });\n  });\n  return [...times].sort((a, b) => toH(a) - toH(b));\n}\nfunction getCoachesAt(dt, time, bayBlocks, realBookings) {\n  const dn = dayName(dt);\n  return COACHES.filter(c => {\n    const avSlots = c.av[dn] || [], si = avSlots.indexOf(time);\n    if (si === -1) return false;\n    const next = avSlots[si + 1];\n    if (!next || toH(next) - toH(time) !== 0.5) return false;\n    return [1,2,3,4,5].some(bay => [time, next].every(sl => !getBk(dt, sl, realBookings).includes(bay) && !isBayBlocked(bay, dt, sl, bayBlocks)));\n  });\n}\nfunction autoAssignBay(dt, time, bayBlocks, realBookings) {\n  const hrs = getHours(dt), si = hrs.indexOf(time), needed = [time, hrs[si + 1]];\n  for (let bay = 1; bay <= 5; bay++) { if (needed.every(s => !getBk(dt, s, realBookings).includes(bay) && !isBayBlocked(bay, dt, s, bayBlocks))) return bay; }\n  return 1;\n}'

if old2 in src:
    src = src.replace(old2, new2, 1); print("OK: lesson availability fns")
else:
    print("FAIL: lesson fns")

# ── 3. allBookings state ─────────────────────────────────────────────────────
old3 = '  const [upcomingBk, setUpcomingBk] = useState([]);'
new3 = '  const [upcomingBk, setUpcomingBk] = useState([]);\n  const [allBookings, setAllBookings] = useState([]);'
if old3 in src:
    src = src.replace(old3, new3, 1); print("OK: allBookings state")
else:
    print("FAIL: upcomingBk state")

# ── 4. Load allBookings on mount ─────────────────────────────────────────────
old4 = '      const blocks = await sb.get("bay_blocks", "select=*");\n      if (blocks?.length) setBayBlocks(blocks);'
new4 = '      const blocks = await sb.get("bay_blocks", "select=*");\n      if (blocks?.length) setBayBlocks(blocks);\n      const allBks = await sb.get("bookings", "select=id,bay,date,start_time,duration_slots,status,type&status=neq.cancelled");\n      if (allBks?.length) setAllBookings(allBks);'
if old4 in src:
    src = src.replace(old4, new4, 1); print("OK: allBookings on mount")
else:
    print("FAIL: bay_blocks load")

# ── 5-9. Call site updates ───────────────────────────────────────────────────
replacements = [
    ('getAllTimes(bkDate, bkDur, bayBlocks)', 'getAllTimes(bkDate, bkDur, bayBlocks, allBookings)'),
    ('getAvailBays(bkDate, bkTime, bkDur, bayBlocks)', 'getAvailBays(bkDate, bkTime, bkDur, bayBlocks, allBookings)'),
    ('getLessonTimes(lesDate, null, bayBlocks)', 'getLessonTimes(lesDate, null, bayBlocks, allBookings)'),
    ('getCoachesAt(lesDate, lesTime, bayBlocks)', 'getCoachesAt(lesDate, lesTime, bayBlocks, allBookings)'),
    ('getLessonTimes(lesDate, COACHES.find(c => c.id === lesCoach), bayBlocks)', 'getLessonTimes(lesDate, COACHES.find(c => c.id === lesCoach), bayBlocks, allBookings)'),
    ('autoAssignBay(lesDate, lesTime, bayBlocks)', 'autoAssignBay(lesDate, lesTime, bayBlocks, allBookings)'),
]
for old, new in replacements:
    if old in src:
        src = src.replace(old, new); print(f"OK: {old[:55]}")
    else:
        print(f"FAIL: {old[:55]}")

# ── 10. allBookings after bay book ───────────────────────────────────────────
old10 = 'fire("Bay booked!"); resetBk(); setTab("home");'
new10 = 'setAllBookings(p => [...p, { id: Date.now().toString(), bay: bkBay, date: bkDate ? bkDate.toISOString().split("T")[0] : "", start_time: bkTime, duration_slots: bkDur, status: "confirmed", type: "bay" }]);\n                fire("Bay booked!"); resetBk(); setTab("home");'
if old10 in src:
    src = src.replace(old10, new10, 1); print("OK: allBookings after bay book")
else:
    print("FAIL: bay book fire")

# ── 11. allBookings after lesson book ───────────────────────────────────────
old11 = 'fire("Lesson booked!"); resetLes(); setTab("home");'
new11 = 'setAllBookings(p => [...p, { id: Date.now().toString(), bay: bayAssigned, date: lesDate ? lesDate.toISOString().split("T")[0] : "", start_time: lesTime, duration_slots: 2, status: "confirmed", type: "lesson" }]);\n                fire("Lesson booked!"); resetLes(); setTab("home");'
if old11 in src:
    src = src.replace(old11, new11, 1); print("OK: allBookings after lesson book")
else:
    print("FAIL: lesson book fire")

# ── 12. handleNav async refresh ─────────────────────────────────────────────
old12 = '  const handleNav = (k) => { setTab(k); if (k === "book") resetBk(); if (k === "lessons") { resetLes(); setLesTab("book"); } };'
new12 = '  const handleNav = async (k) => {\n    setTab(k);\n    if (k === "book" || k === "lessons") {\n      const fresh = await sb.get("bookings", "select=id,bay,date,start_time,duration_slots,status,type&status=neq.cancelled");\n      if (fresh?.length) setAllBookings(fresh);\n    }\n    if (k === "book") resetBk();\n    if (k === "lessons") { resetLes(); setLesTab("book"); }\n  };'
if old12 in src:
    src = src.replace(old12, new12, 1); print("OK: handleNav async")
else:
    print("FAIL: handleNav")

# ── 13. Cancel modal 7-day logic ─────────────────────────────────────────────
old13 = '      {memModal === "cancel" && <div style={S.ov} onClick={() => setMemModal(null)}><div style={S.mod} onClick={e => e.stopPropagation()}>\n        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Cancel Membership?</h3>\n        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>Your {td?.n} membership will remain active until {renewDate}. 7-day notice is required.</p>\n        <div style={{ display: "flex", gap: 10 }}><button style={S.b2} onClick={() => setMemModal(null)}>Keep Plan</button><button style={{ ...S.b1, flex: 2, background: "#E03928" }} onClick={async () => { await sb.post("membership_history", { customer_id: customerId, action: "cancel", tier, amount: 0, date: dateKey(new Date()) }); fire("Membership cancelled"); setMemModal(null); }}>Confirm Cancel</button></div>\n      </div></div>}'

new13 = '      {memModal === "cancel" && (() => {\n        const today = new Date(); today.setHours(0,0,0,0);\n        const rd = renewDate ? new Date(renewDate) : null;\n        const daysToRenewal = rd ? Math.ceil((rd - today) / 86400000) : 999;\n        const withinWindow = daysToRenewal >= 0 && daysToRenewal <= 7;\n        return <div style={S.ov} onClick={() => setMemModal(null)}><div style={S.mod} onClick={e => e.stopPropagation()}>\n          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Cancel Membership?</h3>\n          {withinWindow ? (\n            <div style={{ background: "#FFF8E8", border: "1px solid #E8890C44", borderRadius: 10, padding: 14, marginBottom: 16 }}>\n              <p style={{ fontSize: 13, fontWeight: 700, color: "#E8890C", marginBottom: 6 }}>\u26a0\ufe0f Within 7-Day Renewal Window</p>\n              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>Your renewal date is {renewDate} \u2014 within 7 days. Your {td?.n} membership <strong>will renew this cycle</strong> but <strong>will not auto-renew after that</strong>.</p>\n            </div>\n          ) : (\n            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>Your {td?.n} membership will be <strong>cancelled immediately</strong>. Access ends today.</p>\n          )}\n          <div style={{ display: "flex", gap: 10 }}>\n            <button style={S.b2} onClick={() => setMemModal(null)}>Keep Plan</button>\n            <button style={{ ...S.b1, flex: 2, background: "#E03928" }} onClick={async () => {\n              await sb.post("membership_history", { customer_id: customerId, action: "cancel", tier, amount: 0, date: dateKey(new Date()) });\n              await sb.post("transactions", { customer_id: customerId, description: (withinWindow ? "Membership Cancellation Scheduled \u2014 " : "Membership Cancelled \u2014 ") + (td?.n || "") + " Plan", date: dateKey(new Date()), amount: 0, payment_label: "System" });\n              if (!withinWindow) {\n                await sb.patch("customers", `id=eq.${customerId}`, { tier: "none", bay_credits_remaining: 0 });\n                setTier("none"); setBayCredits(0);\n              }\n              try { await fetch(SQUARE_FN_URL, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}` }, body: JSON.stringify({ action: "email.cancellation", customer_id: customerId, tier: td?.n, renewal_date: renewDate, within_window: withinWindow }) }); } catch(e) { console.warn("Email failed", e); }\n              fire(withinWindow ? "Cancellation scheduled after " + renewDate : "Membership cancelled");\n              setMemModal(null);\n            }}>{withinWindow ? "Schedule Cancellation" : "Confirm Cancel"}</button>\n          </div>\n        </div></div>;\n      })()}'

if old13 in src:
    src = src.replace(old13, new13, 1); print("OK: cancel modal 7-day logic")
else:
    print("FAIL: cancel modal")
    probe = 'fire("Membership cancelled"); setMemModal(null); }}>Confirm Cancel'
    print(f"  probe found: {probe in src}")

with open("patched_App.jsx", "w") as f:
    f.write(src)

lines = len(src.splitlines())
opens = src.count("{"); closes = src.count("}")
print(f"\nFinal: {lines} lines | {{}} diff={opens-closes}")
