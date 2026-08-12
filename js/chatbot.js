/* ===== MATHCRAFT — CRAFTY AI TUTOR CHATBOT ===== */
/* Reads API key from js/config.js → window.MATHCRAFT_CONFIG  */

(function () {
  /* ── RESOLVE CONFIG ──────────────────────────────────────
     Key comes from js/config.js (gitignored).
     Fallback chain:
       1. window.MATHCRAFT_CONFIG.GROQ_API_KEY  (config.js)
       2. localStorage "mc_groq_api_key"         (legacy)
  ──────────────────────────────────────────────────────── */
  const CFG         = window.MATHCRAFT_CONFIG || {};
  const GROQ_API_KEY = (CFG.GROQ_API_KEY || "").trim() ||
                       (localStorage.getItem("mc_groq_api_key") || "").trim();
  const GROQ_MODEL   = CFG.GROQ_MODEL || "llama-3.3-70b-versatile";
  const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

  const KEY_READY = GROQ_API_KEY && !GROQ_API_KEY.includes("your_key_here");

  /* ── BOT IDENTITY ── */
  const BOT_NAME  = "Crafty";
  const BOT_EMOJI = "⛏️";

  const SYSTEM_PROMPT = `You are Crafty, the AI Math Crafter of MathCraft — a Minecraft-inspired gamified math learning app.
Your personality: bold, adventurous, enthusiastic. You use Minecraft analogies and emojis to make math fun.
Your role: Help students understand math step-by-step. Use Minecraft references when helpful (e.g. "Think of probability like crafting — right combination = right result!").
Keep answers concise but complete. Use numbered steps for solutions.
Topics: Trigonometry, Probability, Statistics, Equations, Sets, Triangles, and general math.
Always end with a Minecraft-style motivational line (e.g. "Now go mine that A grade! ⛏️").
Use ✅ for steps, 💡 for tips, ⚠️ for warnings.
Format math in plain text only (e.g. sin(30°) = 1/2, not LaTeX).`;

  /* ── STATE ── */
  let chatHistory = [];
  let isOpen      = false;
  let isTyping    = false;

  /* ════════════════════════════════════════
     BUILD DOM
  ════════════════════════════════════════ */
  function buildUI() {
    const style = document.createElement("style");
    style.textContent = CHATBOT_CSS;
    document.head.appendChild(style);

    /* Floating Bubble */
    const bubble = document.createElement("div");
    bubble.id = "mc-chat-bubble";
    bubble.title = KEY_READY ? "Ask Crafty — AI Math Crafter" : "Crafty needs config.js setup";
    bubble.onclick = toggleChat;
    bubble.innerHTML = `
      <div class="mc-owl-anim">${BOT_EMOJI}</div>
      <div class="mc-bubble-badge" id="mcBubbleBadge" style="display:none">!</div>
    `;
    if (!KEY_READY) bubble.classList.add("mc-bubble-warn");
    document.body.appendChild(bubble);

    /* Chat Modal */
    const modal = document.createElement("div");
    modal.id = "mc-chat-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-label", "MathCraft Crafty AI Chat");
    modal.innerHTML = `
      <!-- HEADER -->
      <div class="mc-chat-header">
        <div class="mc-chat-avatar">${BOT_EMOJI}</div>
        <div class="mc-chat-info">
          <span class="mc-chat-name">${BOT_NAME}</span>
          <span class="mc-chat-status">
            <span class="mc-status-dot ${KEY_READY ? "" : "mc-dot-warn"}"></span>
            <span>${KEY_READY ? "AI Math Crafter · Ready ✅" : "API key missing ⚠️"}</span>
          </span>
        </div>
        <div class="mc-chat-header-actions">
          <button class="mc-icon-btn mc-icon-btn--danger" title="Clear chat" onclick="window._mcChatbot.clearChat()">🗑️</button>
          <button class="mc-icon-btn" title="Close" onclick="window._mcChatbot.closeChat()">✕</button>
        </div>
      </div>

      ${KEY_READY ? "" : `
      <!-- NO-KEY BANNER -->
      <div class="mc-nokey-banner">
        <div class="mc-nokey-icon">🔑</div>
        <p class="mc-nokey-title">API Key Not Found</p>
        <p class="mc-nokey-desc">
          Open <code>js/config.js</code> and replace<br>
          <code>"gsk_your_key_here"</code> with your real Groq key.<br><br>
          Get a <strong>free</strong> key at
          <a href="https://console.groq.com" target="_blank" class="mc-key-link">console.groq.com</a>
          (no credit card needed).
        </p>
        <div class="mc-nokey-steps">
          <div class="mc-step">1️⃣ Go to <strong>console.groq.com</strong> → create account</div>
          <div class="mc-step">2️⃣ Click <strong>"Create API Key"</strong> → copy the key</div>
          <div class="mc-step">3️⃣ Open <strong>js/config.js</strong> → paste the key → save</div>
          <div class="mc-step">4️⃣ Reload this page → Crafty is ready! ⛏️</div>
        </div>
      </div>
      `}

      <!-- MESSAGES -->
      <div class="mc-chat-messages" id="mcChatMessages"></div>

      <!-- QUICK CHIPS -->
      <div class="mc-quick-chips" id="mcQuickChips">
        <button class="mc-chip" onclick="window._mcChatbot.sendQuick('Explain sin, cos, tan with examples')">📐 Trig</button>
        <button class="mc-chip" onclick="window._mcChatbot.sendQuick('How to solve probability problems?')">🎲 Probability</button>
        <button class="mc-chip" onclick="window._mcChatbot.sendQuick('Explain sets and Venn diagrams')">🌿 Sets</button>
        <button class="mc-chip" onclick="window._mcChatbot.sendQuick('How to find mean, median, mode?')">📊 Statistics</button>
      </div>

      <!-- INPUT -->
      <div class="mc-chat-input-row">
        <textarea
          id="mcChatInput"
          class="mc-chat-input"
          placeholder="${KEY_READY ? "Ask Crafty… e.g. Solve sin²θ + cos²θ = ?" : "Set up js/config.js to start chatting…"}"
          rows="1"
          maxlength="800"
          ${KEY_READY ? "" : "disabled"}
          onkeydown="window._mcChatbot.handleKey(event)"
          oninput="window._mcChatbot.autoResize(this)"
        ></textarea>
        <button class="mc-send-btn" id="mcSendBtn"
          onclick="window._mcChatbot.sendMessage()"
          ${KEY_READY ? "" : "disabled"}
          title="${KEY_READY ? "Send" : "API key required"}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div class="mc-chat-footer">Powered by <strong>Groq · Llama 3</strong> · MathCraft ${BOT_EMOJI}</div>
    `;
    document.body.appendChild(modal);

    if (KEY_READY) {
      showWelcome();
    }
  }

  /* ════════════════════════════════════════
     TOGGLE / OPEN / CLOSE
  ════════════════════════════════════════ */
  function toggleChat() { isOpen ? closeChat() : openChat(); }

  function openChat() {
    isOpen = true;
    document.getElementById("mc-chat-modal").classList.add("open");
    document.getElementById("mc-chat-bubble").classList.add("active");
    hideBadge();
    if (KEY_READY) setTimeout(() => document.getElementById("mcChatInput").focus(), 320);
  }

  function closeChat() {
    isOpen = false;
    document.getElementById("mc-chat-modal").classList.remove("open");
    document.getElementById("mc-chat-bubble").classList.remove("active");
  }

  function clearChat() {
    chatHistory = [];
    const c = document.getElementById("mcChatMessages");
    if (c) c.innerHTML = "";
    document.getElementById("mcQuickChips").style.display = "flex";
    if (KEY_READY) showWelcome();
  }

  function hideBadge() {
    const b = document.getElementById("mcBubbleBadge");
    if (b) b.style.display = "none";
  }
  function showBadge() {
    const b = document.getElementById("mcBubbleBadge");
    if (b) b.style.display = "flex";
  }

  function showWelcome() {
    appendMessage("bot",
      `⛏️ Yo, Crafter! I'm **Crafty**, your AI Math mining expert!\n\nAsk me anything — I'll break down concepts like a pickaxe through stone. Step-by-step solutions, tips, tricks — let's **mine that knowledge!** 💎`
    );
  }

  /* ════════════════════════════════════════
     MESSAGING
  ════════════════════════════════════════ */
  function sendQuick(text) {
    if (!KEY_READY) return;
    document.getElementById("mcQuickChips").style.display = "none";
    document.getElementById("mcChatInput").value = text;
    sendMessage();
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function sendMessage() {
    if (isTyping || !KEY_READY) return;
    const input = document.getElementById("mcChatInput");
    const text  = (input.value || "").trim();
    if (!text) return;

    document.getElementById("mcQuickChips").style.display = "none";
    appendMessage("user", text);
    input.value = "";
    input.style.height = "auto";
    chatHistory.push({ role: "user", content: text });

    isTyping = true;
    const typingId = showTyping();
    document.getElementById("mcSendBtn").disabled = true;

    try {
      const reply = await callGroqAPI();
      removeTyping(typingId);
      appendMessage("bot", reply);
      chatHistory.push({ role: "assistant", content: reply });
      if (!isOpen) showBadge();
    } catch (err) {
      removeTyping(typingId);
      appendMessage("bot",
        `⚠️ **Error contacting Groq:**\n${err.message}\n\nCheck your key in **js/config.js** and make sure you're connected to the internet. ⛏️`
      );
    } finally {
      isTyping = false;
      document.getElementById("mcSendBtn").disabled = false;
    }
  }

  async function callGroqAPI() {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.slice(-12)
    ];
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: 800, temperature: 0.7 })
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { msg = (await res.json())?.error?.message || msg; } catch (_) {}
      throw new Error(msg);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "No response received. Try again!";
  }

  /* ════════════════════════════════════════
     DOM HELPERS
  ════════════════════════════════════════ */
  function appendMessage(role, text) {
    const c = document.getElementById("mcChatMessages");
    if (!c) return;
    const wrap   = document.createElement("div");
    wrap.className = `mc-msg mc-msg-${role}`;
    const avatar = document.createElement("div");
    avatar.className = "mc-msg-avatar";
    avatar.textContent = role === "bot" ? BOT_EMOJI : "🧑‍💻";
    const bubble = document.createElement("div");
    bubble.className = "mc-msg-bubble";
    bubble.innerHTML = formatText(text);
    if (role === "bot") { wrap.appendChild(avatar); wrap.appendChild(bubble); }
    else                { wrap.appendChild(bubble); wrap.appendChild(avatar); }
    c.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("visible"));
    c.scrollTop = c.scrollHeight;
  }

  function showTyping() {
    const c  = document.getElementById("mcChatMessages");
    const id = "typing-" + Date.now();
    const w  = document.createElement("div");
    w.className = "mc-msg mc-msg-bot"; w.id = id;
    w.innerHTML = `<div class="mc-msg-avatar">${BOT_EMOJI}</div>
      <div class="mc-msg-bubble mc-typing-bubble">
        <span class="mc-dot"></span><span class="mc-dot"></span><span class="mc-dot"></span>
      </div>`;
    c.appendChild(w);
    requestAnimationFrame(() => w.classList.add("visible"));
    c.scrollTop = c.scrollHeight;
    return id;
  }
  function removeTyping(id) { const el = document.getElementById(id); if (el) el.remove(); }

  function formatText(raw) {
    return raw
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>")
      .replace(/(\d+\.\s)/g, "<span class='mc-step-num'>$1</span>");
  }

  /* ════════════════════════════════════════
     CSS
  ════════════════════════════════════════ */
  const CHATBOT_CSS = `
    #mc-chat-bubble {
      position:fixed; bottom:24px; right:24px; z-index:9999;
      width:64px; height:64px; border-radius:50%;
      background:linear-gradient(135deg,#3FA34D 0%,#2ECC71 60%,#27ae60 100%);
      box-shadow:0 8px 28px rgba(63,163,77,.55),0 2px 8px rgba(0,0,0,.35);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; border:3px solid rgba(255,255,255,.18);
      transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s;
      animation:mc-bubble-bob 3.2s ease-in-out infinite;
    }
    #mc-chat-bubble.mc-bubble-warn {
      background:linear-gradient(135deg,#e67e22,#FF7043);
      box-shadow:0 8px 28px rgba(255,112,67,.55);
      animation:mc-bubble-bob 3.2s ease-in-out infinite;
    }
    #mc-chat-bubble:hover { transform:scale(1.14) translateY(-3px); box-shadow:0 16px 40px rgba(63,163,77,.65); }
    #mc-chat-bubble.mc-bubble-warn:hover { box-shadow:0 16px 40px rgba(255,112,67,.65); }
    #mc-chat-bubble.active { animation:none; transform:scale(.92); }
    @keyframes mc-bubble-bob { 0%,100%{transform:translateY(0) rotate(-4deg);}50%{transform:translateY(-9px) rotate(4deg);} }
    .mc-owl-anim { font-size:1.9rem; user-select:none; filter:drop-shadow(0 2px 5px rgba(0,0,0,.4)); }
    .mc-bubble-badge {
      position:absolute; top:-5px; right:-5px;
      background:#FF7043; color:#fff; font-size:.65rem; font-weight:800;
      width:20px; height:20px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      border:2px solid #0E1117;
      animation:mc-badge-pulse 1.4s ease-in-out infinite;
    }
    @keyframes mc-badge-pulse { 0%,100%{transform:scale(1);}50%{transform:scale(1.25);} }

    /* Modal */
    #mc-chat-modal {
      position:fixed; bottom:104px; right:24px; z-index:9998;
      width:370px; max-width:calc(100vw - 32px);
      height:560px; max-height:calc(100vh - 120px);
      background:#12141d;
      border:1.5px solid rgba(63,163,77,.28); border-radius:22px;
      box-shadow:0 28px 72px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.04);
      display:flex; flex-direction:column; overflow:hidden;
      transform:scale(.85) translateY(28px); opacity:0; pointer-events:none;
      transition:transform .32s cubic-bezier(.34,1.56,.64,1),opacity .24s ease;
      font-family:'Poppins','Segoe UI',sans-serif;
    }
    #mc-chat-modal.open { transform:scale(1) translateY(0); opacity:1; pointer-events:all; }

    /* Header */
    .mc-chat-header {
      display:flex; align-items:center; gap:10px; padding:14px 16px;
      background:linear-gradient(135deg,#1a2e1c,#1c2e1e);
      border-bottom:1.5px solid rgba(63,163,77,.18); flex-shrink:0;
    }
    .mc-chat-avatar {
      font-size:1.75rem; width:42px; height:42px; border-radius:10px;
      background:linear-gradient(135deg,#3FA34D,#2ECC71);
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0; box-shadow:0 4px 12px rgba(63,163,77,.4);
      animation:mc-avatar-bob 2.8s ease-in-out infinite;
    }
    @keyframes mc-avatar-bob { 0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);} }
    .mc-chat-info { flex:1; min-width:0; }
    .mc-chat-name { display:block; font-weight:700; font-size:.98rem; color:#3FA34D; }
    .mc-chat-status { display:flex; align-items:center; gap:5px; font-size:.7rem; color:rgba(255,255,255,.5); }
    .mc-status-dot {
      width:7px; height:7px; border-radius:50%;
      background:#3FA34D; box-shadow:0 0 6px #3FA34D; flex-shrink:0;
      animation:mc-status-blink 2s ease-in-out infinite;
    }
    .mc-status-dot.mc-dot-warn { background:#FF7043; box-shadow:0 0 6px #FF7043; }
    @keyframes mc-status-blink { 0%,100%{opacity:1;}50%{opacity:.35;} }
    .mc-chat-header-actions { display:flex; gap:5px; }
    .mc-icon-btn {
      background:rgba(255,255,255,.07); border:none; border-radius:8px;
      width:30px; height:30px; cursor:pointer; font-size:.82rem;
      color:rgba(255,255,255,.55);
      display:flex; align-items:center; justify-content:center;
      transition:background .18s,color .18s,transform .14s;
    }
    .mc-icon-btn:hover { background:rgba(255,255,255,.14); color:#fff; transform:scale(1.1); }
    .mc-icon-btn--danger:hover { background:rgba(255,100,100,.18); color:#ff7070; }

    /* No-key banner */
    .mc-nokey-banner {
      padding:20px 20px 12px; text-align:center; border-bottom:1px solid rgba(255,255,255,.06);
      flex-shrink:0;
    }
    .mc-nokey-icon { font-size:2.4rem; margin-bottom:6px; }
    .mc-nokey-title { font-size:1rem; font-weight:700; color:#FF7043; margin-bottom:6px; }
    .mc-nokey-desc { font-size:.78rem; color:rgba(255,255,255,.55); line-height:1.65; }
    .mc-nokey-desc code {
      background:rgba(255,255,255,.09); border-radius:4px;
      padding:1px 5px; font-family:'Courier New',monospace; font-size:.75em; color:#FFD54F;
    }
    .mc-key-link { color:#3FA34D; font-weight:600; text-decoration:none; }
    .mc-key-link:hover { text-decoration:underline; }
    .mc-nokey-steps {
      margin-top:12px; display:flex; flex-direction:column; gap:5px;
      background:rgba(255,255,255,.04); border-radius:10px; padding:10px 12px;
      text-align:left;
    }
    .mc-step { font-size:.75rem; color:rgba(255,255,255,.6); line-height:1.5; }

    /* Messages */
    .mc-chat-messages {
      flex:1; overflow-y:auto; padding:14px 13px;
      display:flex; flex-direction:column; gap:10px; scroll-behavior:smooth;
    }
    .mc-chat-messages::-webkit-scrollbar { width:3px; }
    .mc-chat-messages::-webkit-scrollbar-thumb { background:rgba(63,163,77,.3); border-radius:4px; }
    .mc-msg {
      display:flex; align-items:flex-end; gap:8px;
      opacity:0; transform:translateY(14px);
      transition:opacity .28s ease,transform .3s cubic-bezier(.34,1.56,.64,1);
    }
    .mc-msg.visible { opacity:1; transform:translateY(0); }
    .mc-msg-user { flex-direction:row-reverse; }
    .mc-msg-avatar {
      font-size:1.1rem; width:30px; height:30px; border-radius:8px;
      flex-shrink:0; display:flex; align-items:center; justify-content:center;
      background:rgba(255,255,255,.06);
    }
    .mc-msg-bot .mc-msg-avatar { background:linear-gradient(135deg,#3FA34D,#2ECC71); }
    .mc-msg-bubble {
      max-width:80%; padding:10px 14px; border-radius:16px;
      font-size:.845rem; line-height:1.68; word-break:break-word;
    }
    .mc-msg-bubble p { margin:0 0 6px; }
    .mc-msg-bubble p:last-child { margin:0; }
    .mc-msg-bubble code {
      background:rgba(63,163,77,.15); color:#3FA34D;
      border-radius:4px; padding:1px 5px;
      font-family:'Courier New',monospace; font-size:.8em;
    }
    .mc-step-num { color:#3FA34D; font-weight:700; }
    .mc-msg-bot  .mc-msg-bubble {
      background:rgba(255,255,255,.055); border:1px solid rgba(255,255,255,.08);
      border-bottom-left-radius:4px; color:#ddeedd;
    }
    .mc-msg-user .mc-msg-bubble {
      background:linear-gradient(135deg,#3FA34D 0%,#2ECC71 100%);
      color:#fff; font-weight:500; border-bottom-right-radius:4px;
    }

    /* Typing */
    .mc-typing-bubble { display:flex; gap:5px; align-items:center; padding:12px 16px !important; }
    .mc-dot {
      width:7px; height:7px; border-radius:50%; background:#3FA34D; opacity:.6;
      animation:mc-dot-jump 1.2s ease-in-out infinite;
    }
    .mc-dot:nth-child(2){animation-delay:.17s;}
    .mc-dot:nth-child(3){animation-delay:.34s;}
    @keyframes mc-dot-jump{0%,80%,100%{transform:translateY(0);opacity:.5;}40%{transform:translateY(-7px);opacity:1;}}

    /* Quick chips */
    .mc-quick-chips {
      display:flex; flex-wrap:wrap; gap:6px; padding:8px 13px;
      border-top:1px solid rgba(255,255,255,.05); flex-shrink:0;
    }
    .mc-chip {
      background:rgba(63,163,77,.1); border:1px solid rgba(63,163,77,.28);
      border-radius:20px; color:#3FA34D;
      font-size:.74rem; font-family:'Poppins',sans-serif;
      padding:5px 11px; cursor:pointer; font-weight:500;
      transition:background .18s,transform .14s,box-shadow .18s;
    }
    .mc-chip:hover { background:rgba(63,163,77,.22); transform:translateY(-2px); box-shadow:0 4px 12px rgba(63,163,77,.22); }

    /* Input row */
    .mc-chat-input-row {
      display:flex; align-items:flex-end; gap:9px; padding:11px 13px;
      border-top:1.5px solid rgba(255,255,255,.06);
      background:rgba(255,255,255,.02); flex-shrink:0;
    }
    .mc-chat-input {
      flex:1; background:rgba(255,255,255,.07);
      border:1.5px solid rgba(63,163,77,.22); border-radius:12px;
      color:#fff; font-family:'Poppins',sans-serif; font-size:.85rem;
      padding:9px 13px; resize:none; outline:none; max-height:120px; line-height:1.5;
      transition:border-color .2s,box-shadow .2s;
    }
    .mc-chat-input::placeholder { color:rgba(255,255,255,.28); }
    .mc-chat-input:focus { border-color:#3FA34D; box-shadow:0 0 0 3px rgba(63,163,77,.13); }
    .mc-chat-input:disabled { opacity:.4; cursor:not-allowed; }
    .mc-send-btn {
      width:40px; height:40px; border-radius:11px; border:none;
      background:linear-gradient(135deg,#3FA34D,#2ECC71); color:#fff; cursor:pointer;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
      box-shadow:0 4px 14px rgba(63,163,77,.4);
      transition:transform .18s,box-shadow .18s;
    }
    .mc-send-btn svg { width:17px; height:17px; }
    .mc-send-btn:hover { transform:scale(1.1) translateY(-1px); box-shadow:0 6px 20px rgba(63,163,77,.55); }
    .mc-send-btn:active { transform:scale(.93); }
    .mc-send-btn:disabled { filter:grayscale(.6) opacity(.4); cursor:not-allowed; transform:none; }

    .mc-chat-footer {
      text-align:center; font-size:.62rem;
      color:rgba(255,255,255,.22); padding:5px 0 9px; letter-spacing:.03em;
    }

    @media(max-width:480px){
      #mc-chat-bubble{bottom:14px;right:14px;width:56px;height:56px;}
      #mc-chat-modal{bottom:84px;right:8px;width:calc(100vw - 16px);}
    }
  `;

  /* ════════════════════════════════════════
     INIT + PUBLIC API
  ════════════════════════════════════════ */
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", buildUI);
    } else {
      buildUI();
    }
  }

  window._mcChatbot = {
    openChat, closeChat, clearChat,
    sendQuick, sendMessage, handleKey, autoResize
  };

  init();
})();
