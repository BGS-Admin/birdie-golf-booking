// Vercel Cron — runs every 15 min, calls Supabase Edge Function
module.exports = async (req, res) => {
  const response = await fetch(
    "https://dvaviudmsofyqttcazpw.supabase.co/functions/v1/bgs-reminders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        "x-bgs-key": process.env.BGS_API_SECRET || "bgs-app-2026-x9k3m7p",
      },
    }
  );
  const data = await response.json();
  res.status(200).json(data);
};
