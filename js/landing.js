// ===== LANDING PAGE ANIMATIONS =====

// Redirect if already logged in
const u = localStorage.getItem("mc_user");
if(u) window.location.href = "pages/dashboard.html";

// Spawn particles
const particleEl = document.getElementById("particles");
const colors = ["#2ECC71","#FFD54F","#4FC3F7","#FF7043","#8E44AD"];
for(let i=0; i<35; i++){
  const p = document.createElement("div");
  p.className = "particle";
  p.style.cssText = `
    left:${Math.random()*100}%;
    width:${3+Math.random()*5}px; height:${3+Math.random()*5}px;
    background:${colors[Math.floor(Math.random()*colors.length)]};
    animation-duration:${5+Math.random()*10}s;
    animation-delay:${Math.random()*8}s;
  `;
  particleEl.appendChild(p);
}

// Floating math symbols
const symbols = ["∑","∫","π","∞","√","θ","sin","cos","tan","Δ","α","β","∂","≈","±","÷","×","²","³"];
const symEl = document.getElementById("mathSymbols");
for(let i=0; i<20; i++){
  const s = document.createElement("div");
  s.className = "math-sym";
  s.textContent = symbols[Math.floor(Math.random()*symbols.length)];
  s.style.cssText = `
    left:${Math.random()*95}%;
    top:${5+Math.random()*80}%;
    font-size:${1+Math.random()*1.5}rem;
    animation-duration:${4+Math.random()*6}s;
    animation-delay:${Math.random()*5}s;
  `;
  symEl.appendChild(s);
}

// Ground blocks
const groundEl = document.getElementById("groundRow");
const blockTypes = ["grass","grass","grass","stone","grass","grass","stone","grass"];
for(let i=0; i<18; i++){
  const b = document.createElement("div");
  b.className = `block ${blockTypes[i%blockTypes.length]}`;
  b.style.setProperty("--i", i);
  b.style.animationDelay = `${i*0.15}s`;
  groundEl.appendChild(b);
}
