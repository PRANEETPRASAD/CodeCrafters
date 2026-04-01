function calculate() {
  let V = document.getElementById("voltage").value;
  let R = document.getElementById("resistance").value;
// ── OPEN / CLOSE MODAL ──
function openLab(type) {
  document.getElementById('overlay').classList.add('active');
  if (type === 'chem') loadChem();
  else if (type === 'elec') loadElec();
  else loadPhys();
}
function closeModal(e) {
  if (e.target === document.getElementById('overlay')) closeLab();
}
function closeLab() {
  document.getElementById('overlay').classList.remove('active');
  stopPendulum();
}

// ══════════════════════════════
// CHEMISTRY — ACID-BASE TITRATION
// ══════════════════════════════
function loadChem() {
  document.getElementById('mtitle').textContent = '⚗️ Chemistry — Acid-Base Titration';
  document.getElementById('mbody').innerHTML = `
    <div class="sim-vis" style="flex-direction:column;gap:14px">
      <div style="display:flex;gap:28px;align-items:flex-end;justify-content:center">
        <div class="burette-wrap">
          <div class="bur-label">NaOH (base)</div>
          <div class="burette"><div class="bur-fill" id="burFill" style="height:100%"></div></div>
          <div class="bur-tip"></div>
          <div class="drop" id="drop"></div>
        </div>
        <div class="flask-wrap">
          <svg width="90" height="100" viewBox="0 0 90 100">
            <defs><clipPath id="fc"><path d="M30 10 L30 40 L5 85 Q5 95 15 95 L75 95 Q85 95 85 85 L60 40 L60 10 Z"/></clipPath></defs>
            <rect x="5" y="0" width="80" height="100" fill="#22c55e15" clip-path="url(#fc)" id="flaskFill" style="transition:fill .6s"/>
            <path d="M30 10 L30 40 L5 85 Q5 95 15 95 L75 95 Q85 95 85 85 L60 40 L60 10 Z" fill="none" stroke="#2a3f2f" stroke-width="2"/>
            <rect x="28" y="4" width="34" height="8" rx="2" fill="#2a3f2f"/>
          </svg>
          <div class="bur-label">HCl (acid)</div>
        </div>
        <div class="ph-box">
          <div class="ph-val" id="phVal">1.0</div>
          <div class="ph-lbl">pH VALUE</div>
          <div class="ph-bar"><div class="ph-ind" id="phInd" style="left:0%"></div></div>
        </div>
      </div>
    </div>
    <div>
      <div class="ctrl-label">NaOH added: <span id="naohVal">0</span> mL</div>
      <input type="range" min="0" max="50" value="0" oninput="updateChem(this.value)"/>
    </div>
    <div class="expl">
      <div class="expl-title">// WHAT'S HAPPENING</div>
      <div class="expl-body" id="chemExpl">Add NaOH (base) to neutralise HCl (acid). Watch the pH rise from acidic (red) to neutral (green) to basic (purple).</div>
    </div>
    <div class="quiz">
      <div class="quiz-q">At what pH is the solution considered neutral?</div>
      <div class="quiz-opts">
        <button class="qopt" onclick="answer(this,false)">pH 0</button>
        <button class="qopt" onclick="answer(this,true)">pH 7</button>
        <button class="qopt" onclick="answer(this,false)">pH 14</button>
        <button class="qopt" onclick="answer(this,false)">pH 5</button>
      </div>
      <div class="qfb" id="qfb"></div>
    </div>`;
}

function updateChem(v) {
  v = parseFloat(v);
  const ph = v < 25 ? 1 + v * 0.12 : v < 26 ? 7 : 7 + (v - 26) * 0.28;
  const clipped = Math.min(14, Math.max(0, ph));
  document.getElementById('naohVal').textContent = v;
  document.getElementById('phVal').textContent = clipped.toFixed(1);
  document.getElementById('phInd').style.left = (clipped / 14 * 100) + '%';
  document.getElementById('burFill').style.height = (100 - v * 2) + '%';
  const drop = document.getElementById('drop');
  drop.className = (v > 0 && v < 48) ? 'drop drip' : 'drop';
  let color, flaskColor, expl;
  if (clipped < 3)       { color='#ef4444'; flaskColor='#ef444430'; expl='Strongly acidic! HCl dominates. H⁺ ions are plentiful — pH stays very low.'; }
  else if (clipped < 6)  { color='#f97316'; flaskColor='#f9731630'; expl='Weakly acidic. Neutralisation is progressing: NaOH + HCl → NaCl + H₂O.'; }
  else if (clipped < 8)  { color='#22c55e'; flaskColor='#22c55e30'; expl='🎉 Equivalence point! Equal moles of acid and base. Only NaCl and H₂O remain — neutral solution.'; }
  else if (clipped < 11) { color='#06b6d4'; flaskColor='#06b6d430'; expl='Weakly basic. Excess NaOH raises the pH. OH⁻ ions now outnumber H⁺ ions.'; }
  else                   { color='#8b5cf6'; flaskColor='#8b5cf630'; expl='Strongly basic. Excess NaOH dominates. High pH burns tissue — why drain cleaners are dangerous!'; }
  document.getElementById('phVal').style.color = color;
  document.getElementById('flaskFill').setAttribute('fill', flaskColor);
  document.getElementById('chemExpl').textContent = expl;
}

// ══════════════════════════════
// ELECTRONICS — LED + OHM'S LAW
// ══════════════════════════════
function loadElec() {
  document.getElementById('mtitle').textContent = "⚡ Electronics — LED Circuit & Ohm's Law";
  document.getElementById('mbody').innerHTML = `
    <div class="sim-vis" style="flex-direction:column;align-items:center">
      <div class="led" id="led" style="color:#555">💡</div>
      <div style="font-family:'DM Mono',monospace;font-size:13px;color:var(--text2);margin-top:10px" id="voltRead">V = 0V  |  I = 0mA  |  R = 220Ω</div>
      <div class="circuit-row">
        <div class="comp">Battery</div>
        <div class="wire" id="w1"></div>
        <div class="comp">220Ω Resistor</div>
        <div class="wire" id="w2"></div>
        <div class="comp">LED</div>
        <div class="wire" id="w3"></div>
      </div>
    </div>
    <div>
      <div class="ctrl-label">Voltage (V): <span id="vVal">0</span>V</div>
      <input type="range" min="0" max="12" value="0" step="0.1" oninput="updateElec(this.value)"/>
    </div>
    <div>
      <div class="ctrl-label">Resistance (Ω): <span id="rVal">220</span>Ω</div>
      <input type="range" min="50" max="1000" value="220" step="10" oninput="updateR(this.value)"/>
    </div>
    <div class="expl">
      <div class="expl-title">// WHAT'S HAPPENING</div>
      <div class="expl-body" id="elecExpl">Increase voltage to push current through the circuit. The LED lights up when enough current flows. Ohm's Law: V = I × R</div>
    </div>
    <div class="quiz">
      <div class="quiz-q">If voltage = 6V and resistance = 300Ω, what is the current?</div>
      <div class="quiz-opts">
        <button class="qopt" onclick="answer(this,false)">50A</button>
        <button class="qopt" onclick="answer(this,true)">20mA</button>
        <button class="qopt" onclick="answer(this,false)">300mA</button>
        <button class="qopt" onclick="answer(this,false)">6mA</button>
      </div>
      <div class="qfb" id="qfb"></div>
    </div>`;
  window._R = 220; window._V = 0;
  updateElecDisplay();
}

function updateElec(v) { window._V = parseFloat(v); document.getElementById('vVal').textContent = parseFloat(v).toFixed(1); updateElecDisplay(); }
function updateR(v)    { window._R = parseFloat(v); document.getElementById('rVal').textContent = v; updateElecDisplay(); }

function updateElecDisplay() {
  const V = window._V || 0, R = window._R || 220;
  const I = (V / R) * 1000;
  const on = V >= 1.8;
  const led = document.getElementById('led');
  if (!led) return;
  led.classList.toggle('on', on);
  led.style.color = on ? `hsl(${60 + I * 2},90%,60%)` : '#555';
  ['w1','w2','w3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'wire' + (on ? ' active' : '');
  });
  document.getElementById('voltRead').textContent = `V = ${V.toFixed(1)}V  |  I = ${I.toFixed(1)}mA  |  R = ${R}Ω`;
  const expl = V < 1.8
    ? `Voltage too low to forward-bias the LED. Needs ~1.8V minimum. Currently ${V.toFixed(1)}V.`
    : `Current: I = V/R = ${V.toFixed(1)}/${R} = ${I.toFixed(1)}mA. ${I > 30 ? 'Warning: high current! The resistor protects the LED from burning out.' : 'The resistor safely limits current to protect the LED.'}`;
  document.getElementById('elecExpl').textContent = expl;
}

// ══════════════════════════════
// PHYSICS — SIMPLE PENDULUM
// ══════════════════════════════
let animId = null;

function stopPendulum() {
  if (animId) cancelAnimationFrame(animId);
  animId = null;
}

function loadPhys() {
  document.getElementById('mtitle').textContent = '🔭 Physics — Simple Pendulum';
  document.getElementById('mbody').innerHTML = `
    <div class="sim-vis" style="flex-direction:column;padding:16px">
      <canvas id="pCanvas" width="340" height="180" style="display:block;margin:0 auto"></canvas>
      <div style="font-family:'DM Mono',monospace;font-size:13px;color:var(--accent);text-align:center;margin-top:8px" id="periodRead">Period T = — s</div>
    </div>
    <div>
      <div class="ctrl-label">Length (m): <span id="lenVal">1.0</span>m</div>
      <input type="range" min="0.2" max="2" value="1" step="0.1" oninput="updatePhys('len',this.value)"/>
    </div>
    <div>
      <div class="ctrl-label">Gravity (m/s²): <span id="gravVal">9.8</span> m/s²</div>
      <input type="range" min="1.6" max="24" value="9.8" step="0.1" oninput="updatePhys('grav',this.value)"/>
    </div>
    <div class="expl">
      <div class="expl-title">// WHAT'S HAPPENING</div>
      <div class="expl-body" id="physExpl">T = 2π√(L/g). Longer string = slower swing. Higher gravity = faster swing. The bob is fastest at the bottom!</div>
    </div>
    <div class="quiz">
      <div class="quiz-q">What happens to the period if you double the string length?</div>
      <div class="quiz-opts">
        <button class="qopt" onclick="answer(this,false)">Period doubles exactly</button>
        <button class="qopt" onclick="answer(this,true)">Period increases by ~1.41×</button>
        <button class="qopt" onclick="answer(this,false)">Period stays the same</button>
        <button class="qopt" onclick="answer(this,false)">Period halves</button>
      </div>
      <div class="qfb" id="qfb"></div>
    </div>`;
  window._L = 1.0; window._G = 9.8;
  startPendulum();
}

function updatePhys(key, v) {
  if (key === 'len') { window._L = parseFloat(v); const el = document.getElementById('lenVal'); if (el) el.textContent = parseFloat(v).toFixed(1); }
  else               { window._G = parseFloat(v); const el = document.getElementById('gravVal'); if (el) el.textContent = parseFloat(v).toFixed(1); }
  const T = 2 * Math.PI * Math.sqrt(window._L / window._G);
  const pr = document.getElementById('periodRead');
  if (pr) pr.textContent = 'Period T = ' + T.toFixed(2) + ' s';
  const pe = document.getElementById('physExpl');
  if (pe) pe.textContent = `T = 2π√(L/g) = 2π√(${window._L.toFixed(1)}/${window._G.toFixed(1)}) = ${T.toFixed(2)}s. ${window._G < 5 ? 'Low gravity (like the Moon!) — much slower swing.' : window._G > 15 ? 'High gravity (like Jupiter!) — very fast swing.' : 'Earth-like gravity. Try changing the length!'}`;
}

function startPendulum() {
  const canvas = document.getElementById('pCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let angle = 0.4, vel = 0;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = 20;
  function draw() {
    if (!document.getElementById('pCanvas')) { stopPendulum(); return; }
    const L = window._L || 1, G = window._G || 9.8;
    vel += (-G / L) * Math.sin(angle) * 0.016;
    angle += vel * 0.016;
    const pxLen = Math.min(L * 90, H - 40);
    const bx = cx + Math.sin(angle) * pxLen;
    const by = cy + Math.cos(angle) * pxLen;
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#4ade80'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by);
    ctx.strokeStyle = '#5a7a64'; ctx.lineWidth = 1.5; ctx.stroke();
    const speed = Math.abs(vel);
    ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${140 - speed * 200},70%,55%)`; ctx.fill();
    ctx.strokeStyle = '#4ade8066'; ctx.lineWidth = 1; ctx.stroke();
    animId = requestAnimationFrame(draw);
  }
  draw();
  updatePhys('len', window._L);
}

// ── QUIZ ANSWER ──
function answer(btn, correct) {
  const opts = btn.parentElement.querySelectorAll('.qopt');
  opts.forEach(b => b.disabled = true);
  btn.classList.add(correct ? 'correct' : 'wrong');
  const fb = document.getElementById('qfb');
  fb.className = 'qfb show ' + (correct ? 'correct' : 'wrong');
  fb.textContent = correct
    ? "✓ Correct! Great intuition — you're thinking like a scientist."
    : '✗ Not quite. Try the simulation again and observe carefully!';
}