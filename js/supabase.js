/* ===== MATHCRAFT — SUPABASE CLIENT ===== */
/* Loads Supabase JS v2 from CDN and provides a SupaDB helper module.
   Requires window.MATHCRAFT_CONFIG.SUPABASE_URL and .SUPABASE_ANON_KEY */

(function () {
  "use strict";

  const CFG = window.MATHCRAFT_CONFIG || {};
  const SUPA_URL = (CFG.SUPABASE_URL || "").trim();
  const SUPA_KEY = (CFG.SUPABASE_ANON_KEY || "").trim();

  /* ── Expose a global flag so other scripts know if Supabase is available ── */
  window._supaReady = false;
  window._supaClient = null;

  if (!SUPA_URL || !SUPA_KEY || SUPA_URL.includes("your_project")) {
    console.warn("[MathCraft] Supabase not configured — using localStorage fallback.");
    window.SupaDB = null;
    return;
  }

  /* ── Load Supabase JS SDK from CDN ── */
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  script.onload = () => {
    try {
      const { createClient } = window.supabase;
      const client = createClient(SUPA_URL, SUPA_KEY);
      window._supaClient = client;
      window._supaReady = true;
      window.SupaDB = buildSupaDB(client);
      console.log("[MathCraft] Supabase connected ✅");
      // Dispatch event so other scripts can react
      window.dispatchEvent(new Event("supaready"));
    } catch (e) {
      console.error("[MathCraft] Supabase init failed:", e);
    }
  };
  script.onerror = () => console.error("[MathCraft] Failed to load Supabase SDK.");
  document.head.appendChild(script);

  /* ═════════════════════════════════════════
     SupaDB — high-level API
  ═════════════════════════════════════════ */
  function buildSupaDB(client) {
    return {
      client,

      /* ── AUTH ── */
      async signUp(email, password, username) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { data: { username } }
        });
        if (error) throw error;
        return data;
      },

      async signIn(email, password) {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },

      async signOut() {
        const { error } = await client.auth.signOut();
        if (error) throw error;
      },

      async getSession() {
        const { data: { session } } = await client.auth.getSession();
        return session;
      },

      getUser() {
        // synchronous check from last known session
        return client.auth.getUser ? client.auth.getUser() : null;
      },

      onAuthChange(cb) {
        return client.auth.onAuthStateChange(cb);
      },

      /* ── PROFILE ── */
      async getProfile(userId) {
        const { data, error } = await client
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (error) throw error;
        return data;
      },

      async updateProfile(userId, updates) {
        const { data, error } = await client
          .from("profiles")
          .update(updates)
          .eq("id", userId)
          .select()
          .single();
        if (error) throw error;
        return data;
      },

      /* ── PROGRESS ── */
      async getProgress(userId) {
        const { data, error } = await client
          .from("progress")
          .select("topic, percentage")
          .eq("user_id", userId);
        if (error) throw error;
        // Convert to { topic: percentage } map
        const map = {};
        (data || []).forEach(r => { map[r.topic] = r.percentage; });
        return map;
      },

      async saveProgress(userId, topic, percentage) {
        const { error } = await client
          .from("progress")
          .upsert(
            { user_id: userId, topic, percentage },
            { onConflict: "user_id,topic" }
          );
        if (error) throw error;
      },

      /* ── QUIZ HISTORY ── */
      async saveQuizResult(userId, result) {
        const { error } = await client
          .from("quiz_history")
          .insert({
            user_id: userId,
            topic: result.topic,
            score: result.score,
            total: result.total,
            xp_earned: result.xpEarned || 0
          });
        if (error) throw error;
      },

      async getQuizHistory(userId, limit = 20) {
        const { data, error } = await client
          .from("quiz_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        return (data || []).map(r => ({
          topic: r.topic,
          score: r.score,
          total: r.total,
          xpEarned: r.xp_earned,
          date: new Date(r.created_at).toLocaleDateString()
        }));
      },

      /* ── BADGES ── */
      async getBadges(userId) {
        const { data, error } = await client
          .from("badges")
          .select("*")
          .eq("user_id", userId);
        if (error) throw error;
        return data || [];
      },

      async addBadge(userId, badgeId, name, icon) {
        const { error } = await client
          .from("badges")
          .upsert(
            { user_id: userId, badge_id: badgeId, name, icon },
            { onConflict: "user_id,badge_id" }
          );
        if (error) throw error;
      },

      /* ── LEADERBOARD ── */
      async getLeaderboard(limit = 10) {
        const { data, error } = await client
          .from("profiles")
          .select("id, username, avatar, level, xp")
          .order("xp", { ascending: false })
          .limit(limit);
        if (error) throw error;
        return (data || []).map((r, i) => ({
          ...r,
          rank: i + 1
        }));
      }
    };
  }
})();
