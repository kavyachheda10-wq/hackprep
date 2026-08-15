// ===== MATHCRAFT APP STATE =====
// Integrates with Supabase when available, falls back to localStorage for guests.

const MC = {
  _cache: null, // in-memory user cache

  // --- State ---
  getUser() {
    if (this._cache) return this._cache;
    const d = localStorage.getItem("mc_user");
    this._cache = d ? JSON.parse(d) : null;
    return this._cache;
  },

  saveUser(u) {
    this._cache = u;
    localStorage.setItem("mc_user", JSON.stringify(u));
    // Async sync to Supabase (fire and forget)
    if (window.SupaDB && u && u.supaId) {
      this._syncToSupabase(u).catch(e => console.warn("[MC] Supabase sync error:", e));
    }
  },

  async _syncToSupabase(u) {
    if (!window.SupaDB || !u.supaId) return;
    await window.SupaDB.updateProfile(u.supaId, {
      username: u.username,
      avatar: u.avatar,
      level: u.level,
      xp: u.xp,
      xp_to_next: u.xpToNext,
      emeralds: u.emeralds,
      streak: u.streak,
      last_login: new Date().toISOString().split("T")[0]
    });
    // Sync progress per topic
    for (const [topic, pct] of Object.entries(u.progress || {})) {
      await window.SupaDB.saveProgress(u.supaId, topic, pct);
    }
  },

  defaultUser(username) {
    return {
      username,
      avatar: "🧙",
      level: 1,
      xp: 0,
      xpToNext: 500,
      emeralds: 0,
      streak: 1,
      lastLogin: new Date().toDateString(),
      progress: { trigonometry:0, probability:0, statistics:0, equations:0, sets:0, triangles:0 },
      completedTopics: [],
      bossDefeated: [],
      achievements: [],
      quizHistory: [],
      badges: [],
      supaId: null, // null for guests
      isGuest: false
    };
  },

  isLoggedIn() { return !!this.getUser(); },

  async logout() {
    // Sign out of Supabase if available
    if (window.SupaDB) {
      try { await window.SupaDB.signOut(); } catch (_) {}
    }
    localStorage.removeItem("mc_user");
    this._cache = null;
    window.location.href = "auth.html";
  },

  // --- XP & Level ---
  addXP(amount) {
    const u = this.getUser(); if(!u) return;
    u.xp += amount;
    while(u.xp >= u.xpToNext) {
      u.xp -= u.xpToNext;
      u.level++;
      u.xpToNext = Math.floor(u.xpToNext * 1.3);
      this.showLevelUp(u.level);
    }
    this.saveUser(u);
    this.updateNavStats();
  },

  addEmeralds(amount) {
    const u = this.getUser(); if(!u) return;
    u.emeralds += amount;
    this.saveUser(u);
    this.updateNavStats();
  },

  addProgress(topic, amount) {
    const u = this.getUser(); if(!u) return;
    u.progress[topic] = Math.min(100, (u.progress[topic]||0) + amount);
    if(u.progress[topic] >= 100 && !u.completedTopics.includes(topic)) {
      u.completedTopics.push(topic);
    }
    this.saveUser(u);
  },

  unlockAchievement(id, name, icon) {
    const u = this.getUser(); if(!u) return;
    if(u.achievements.includes(id)) return;
    u.achievements.push(id);
    u.badges.push({id, name, icon, earnedAt: new Date().toISOString()});
    this.saveUser(u);
    this.showToast(`🏆 Achievement: ${name}`, "gold");
    // Sync badge to Supabase
    if (window.SupaDB && u.supaId) {
      window.SupaDB.addBadge(u.supaId, id, name, icon).catch(() => {});
    }
  },

  saveQuizResult(topic, score, total, xpEarned) {
    const u = this.getUser(); if(!u) return;
    u.quizHistory.unshift({ topic, score, total, xpEarned, date: new Date().toLocaleDateString() });
    if(u.quizHistory.length > 20) u.quizHistory = u.quizHistory.slice(0, 20);
    this.saveUser(u);
    // Sync to Supabase
    if (window.SupaDB && u.supaId) {
      window.SupaDB.saveQuizResult(u.supaId, { topic, score, total, xpEarned }).catch(() => {});
    }
  },

  // --- Load user from Supabase (called on page load for authenticated users) ---
  async loadFromSupabase() {
    if (!window.SupaDB) return false;
    try {
      const session = await window.SupaDB.getSession();
      if (!session || !session.user) return false;
      const uid = session.user.id;
      const profile = await window.SupaDB.getProfile(uid);
      const progress = await window.SupaDB.getProgress(uid);
      const quizHistory = await window.SupaDB.getQuizHistory(uid, 20);
      const badges = await window.SupaDB.getBadges(uid);

      const u = {
        username: profile.username || "Hero",
        avatar: profile.avatar || "🧙",
        level: profile.level || 1,
        xp: profile.xp || 0,
        xpToNext: profile.xp_to_next || 500,
        emeralds: profile.emeralds || 0,
        streak: profile.streak || 1,
        lastLogin: profile.last_login || new Date().toDateString(),
        progress: {
          trigonometry: 0, probability: 0, statistics: 0,
          equations: 0, sets: 0, triangles: 0,
          ...progress
        },
        completedTopics: Object.entries(progress).filter(([, v]) => v >= 100).map(([k]) => k),
        bossDefeated: [],
        achievements: badges.map(b => b.badge_id),
        quizHistory,
        badges: badges.map(b => ({ id: b.badge_id, name: b.name, icon: b.icon, earnedAt: b.earned_at })),
        supaId: uid,
        isGuest: false
      };
      this.saveUser(u);
      return true;
    } catch (e) {
      console.warn("[MC] Could not load from Supabase:", e);
      return false;
    }
  },

  // --- UI Helpers ---
  updateNavStats() {
    const u = this.getUser(); if(!u) return;
    const pct = Math.round((u.xp / u.xpToNext) * 100);
    document.querySelectorAll(".nav-xp").forEach(el => el.textContent = `${u.xp} XP`);
    document.querySelectorAll(".nav-em").forEach(el => el.textContent = `${u.emeralds} 💎`);
    document.querySelectorAll(".nav-lvl").forEach(el => el.textContent = `Lv.${u.level}`);
    document.querySelectorAll(".nav-name").forEach(el => el.textContent = u.username);
  },

  showToast(msg, type="green") {
    const colors = { green:"var(--emerald)", gold:"var(--gold)", red:"var(--lava)", blue:"var(--diamond)" };
    let t = document.getElementById("toast");
    if(!t) {
      t = document.createElement("div");
      t.id = "toast"; t.className = "toast";
      t.innerHTML = `<span class="toast-icon">🎮</span><span class="toast-text"></span>`;
      document.body.appendChild(t);
    }
    t.querySelector(".toast-text").textContent = msg;
    t.style.borderColor = colors[type] || colors.green;
    t.classList.add("show");
    clearTimeout(t._to);
    t._to = setTimeout(() => t.classList.remove("show"), 3000);
  },

  showXPPopup(amount) {
    let p = document.getElementById("xp-popup");
    if(!p) {
      p = document.createElement("div");
      p.id = "xp-popup"; p.className = "xp-popup";
      p.innerHTML = `<div class="xp-popup-val">+<span id="xp-amt"></span></div><div class="xp-popup-lbl">XP Earned!</div>`;
      document.body.appendChild(p);
    }
    document.getElementById("xp-amt").textContent = amount;
    p.classList.remove("show");
    void p.offsetWidth;
    p.classList.add("show");
  },

  showLevelUp(level) {
    this.showToast(`⚡ Level Up! You are now Level ${level}!`, "gold");
    this.confetti();
  },

  confetti() {
    const colors = ["#2ECC71","#FFD54F","#4FC3F7","#FF7043","#8E44AD","#F8F9FA"];
    const wrap = document.createElement("div"); wrap.className = "confetti-wrap"; document.body.appendChild(wrap);
    for(let i=0; i<60; i++) {
      const c = document.createElement("div"); c.className = "conf";
      c.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};
        width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;
        animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*0.5}s;border-radius:${Math.random()>0.5?'50%':'2px'}`;
      wrap.appendChild(c);
    }
    setTimeout(() => wrap.remove(), 3500);
  },

  requireAuth() {
    if(!this.isLoggedIn()) {
      window.location.href = "auth.html";
      return false;
    }
    return true;
  },

  // --- Leaderboard ---
  getLeaderboard() {
    const u = this.getUser();
    // If Supabase leaderboard data is cached, use it
    if (this._lbCache) return this._lbCache;

    const fake = [
      { username:"CryptoMage", avatar:"🧝", level:12, xp:5840 },
      { username:"VoxelWitch", avatar:"🧙‍♀️", level:10, xp:4210 },
      { username:"ForgeKnight", avatar:"⚔️", level:9, xp:3900 },
      { username:"DataDragon", avatar:"🐉", level:8, xp:3200 },
      { username:"StarCrafter", avatar:"⭐", level:7, xp:2750 },
      { username:"PrismLord", avatar:"💎", level:6, xp:2100 },
      { username:"NullByte", avatar:"🤖", level:5, xp:1500 },
    ];
    const you = u ? { username:u.username, avatar:u.avatar, level:u.level, xp:u.xp, isMe:true } : null;
    if(you) fake.push(you);
    return fake.sort((a,b)=>b.xp-a.xp).map((r,i)=>({...r,rank:i+1}));
  },

  _lbCache: null,

  async loadLeaderboard() {
    if (!window.SupaDB) return this.getLeaderboard();
    try {
      const data = await window.SupaDB.getLeaderboard(20);
      const u = this.getUser();
      this._lbCache = data.map(r => ({
        ...r,
        isMe: u && u.supaId === r.id
      }));
      return this._lbCache;
    } catch (e) {
      console.warn("[MC] Leaderboard fetch failed:", e);
      return this.getLeaderboard();
    }
  }
};

// Auto-update streak on load
(function checkStreak(){
  const u = MC.getUser();
  if(!u) return;
  const today = new Date().toDateString();
  if(u.lastLogin !== today) {
    const last = new Date(u.lastLogin);
    const diff = Math.floor((new Date()-last)/(1000*60*60*24));
    u.streak = diff === 1 ? (u.streak||0)+1 : 1;
    u.lastLogin = today;
    MC.saveUser(u);
  }
})();
