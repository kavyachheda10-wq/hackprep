// ===== MATHCRAFT APP STATE (localStorage) =====

const MC = {
  // --- State ---
  getUser() {
    const d = localStorage.getItem("mc_user");
    return d ? JSON.parse(d) : null;
  },
  saveUser(u) {
    localStorage.setItem("mc_user", JSON.stringify(u));
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
      badges: []
    };
  },
  isLoggedIn() { return !!this.getUser(); },
  logout() { localStorage.removeItem("mc_user"); window.location.href = "../pages/auth.html"; },

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
  },
  saveQuizResult(topic, score, total, xpEarned) {
    const u = this.getUser(); if(!u) return;
    u.quizHistory.unshift({ topic, score, total, xpEarned, date: new Date().toLocaleDateString() });
    if(u.quizHistory.length > 20) u.quizHistory = u.quizHistory.slice(0, 20);
    this.saveUser(u);
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

  // --- Leaderboard (simulated) ---
  getLeaderboard() {
    const u = this.getUser();
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
