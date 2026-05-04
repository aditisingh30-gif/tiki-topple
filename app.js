// ═══════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════
const TIKIS = [
  { id: 'red',    name: 'Kapu', color: '#ef4444', symbol: '🔥' },
  { id: 'orange', name: 'Huna', color: '#f97316', symbol: '🦊' },
  { id: 'yellow', name: 'Pele', color: '#eab308', symbol: '⚡' },
  { id: 'green',  name: 'Mano', color: '#22c55e', symbol: '🍃' },
  { id: 'cyan',   name: 'Nalu', color: '#06b6d4', symbol: '🌊' },
  { id: 'blue',   name: 'Lono', color: '#3b82f6', symbol: '💧' },
  { id: 'purple', name: 'Koa',  color: '#a855f7', symbol: '🔮' },
  { id: 'pink',   name: 'Wiki', color: '#ec4899', symbol: '🌸' },
  { id: 'white',  name: 'Hoku', color: '#f8fafc', symbol: '⭐' },
];

const ACTION_CARDS = [
  { id: 'up1',    type: 'UP',     value: 1, name: 'Tiki Up 1',   icon: '⬆️',  desc: 'Move a Tiki up 1 spot' },
  { id: 'up2',    type: 'UP',     value: 2, name: 'Tiki Up 2',   icon: '⏫',  desc: 'Move a Tiki up 2 spots' },
  { id: 'up3',    type: 'UP',     value: 3, name: 'Tiki Up 3',   icon: '🚀',  desc: 'Move a Tiki up 3 spots' },
  { id: 'topple', type: 'TOPPLE', value: 0, name: 'Tiki Topple', icon: '⏬',  desc: 'Send any Tiki to the bottom' },
  { id: 'toast',  type: 'TOAST',  value: 0, name: 'Tiki Toast',  icon: '🔥',  desc: 'Remove the bottom Tiki entirely' },
];

const AVATAR_FACES  = ['🗿','🦁','🐯','🦊','🐸','🐙','🦋','👾','🤖','🧙','🦅','🐬','🦚','🧜','🦝'];
const AVATAR_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#a855f7','#ec4899','#14b8a6','#f43f5e'];
const AVATAR_HATS   = ['','🎩','👑','🎓','⛑️','🪖','🎭','🌸','⚡','🌟'];

// ═══════════════════════════════════════════
//  THEME SYSTEM
// ═══════════════════════════════════════════
let currentTheme = 'ocean';

const THEME_SOUNDS = {
  ocean:   { base: 'sine',     freqMult: 1.0,  gainMult: 1.0  },
  volcano: { base: 'sawtooth', freqMult: 0.85, gainMult: 1.1  },
  jungle:  { base: 'triangle', freqMult: 1.15, gainMult: 0.9  },
  sunset:  { base: 'sine',     freqMult: 0.95, gainMult: 1.0  },
  neon:    { base: 'square',   freqMult: 1.25, gainMult: 0.8  },
  gold:    { base: 'triangle', freqMult: 1.1,  gainMult: 1.05 },
};

function applyTheme(theme) {
  currentTheme = theme;
  document.body.className = `theme-${theme}`;
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.dataset.theme);
    SFX.step();
  });
});

// Apply default theme
applyTheme('ocean');

// ═══════════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════════
function spawnParticles() {
  const container = document.getElementById('splash-particles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      --dur: ${5 + Math.random() * 8}s;
      --delay: ${Math.random() * 6}s;
      --drift: ${-60 + Math.random() * 120}px;
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      opacity: ${0.2 + Math.random() * 0.5};
    `;
    container.appendChild(p);
  }
}
spawnParticles();

// ═══════════════════════════════════════════
//  SOUND ENGINE — Theme-Aware
// ═══════════════════════════════════════════
let audioCtx = null;
let soundEnabled = true;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone({ freq=440, type='sine', duration=0.15, gain=0.3, reverb=false }={}) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const ts  = THEME_SOUNDS[currentTheme] || THEME_SOUNDS.ocean;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();

    // Theme-specific waveform overlay
    const effectType = reverb ? ts.base : type;
    osc.type = effectType;
    osc.frequency.setValueAtTime(freq * ts.freqMult, ctx.currentTime);

    g.gain.setValueAtTime(gain * ts.gainMult, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(g); g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e){}
}

// Theme-specific ambient chord on game start
function playThemeJingle(theme) {
  if (!soundEnabled) return;
  const jingles = {
    ocean:   [[392,494,587,740], 'sine'],
    volcano: [[220,277,330,415], 'sawtooth'],
    jungle:  [[440,550,660,880], 'triangle'],
    sunset:  [[349,440,523,698], 'sine'],
    neon:    [[523,659,784,988], 'square'],
    gold:    [[440,554,659,880], 'triangle'],
  };
  const [freqs, wave] = jingles[theme] || jingles.ocean;
  freqs.forEach((f,i) => setTimeout(() => playTone({freq:f,type:wave,duration:0.3,gain:0.22}), i*110));
}

const SFX = {
  hover:     ()=> playTone({freq:660,type:'sine',duration:0.06,gain:0.08}),
  select:    ()=> playTone({freq:784,type:'triangle',duration:0.12,gain:0.18}),
  deselect:  ()=> playTone({freq:440,type:'triangle',duration:0.1,gain:0.12}),
  moveUp:    ()=>{ playTone({freq:523,type:'triangle',duration:0.08,gain:0.22}); setTimeout(()=>playTone({freq:659,duration:0.1,gain:0.22}),80); },
  topple:    ()=>{ playTone({freq:300,type:'sawtooth',duration:0.25,gain:0.28,reverb:true}); setTimeout(()=>playTone({freq:180,type:'sawtooth',duration:0.2,gain:0.18}),100); },
  toast:     ()=>{ playTone({freq:800,type:'square',duration:0.05,gain:0.12}); setTimeout(()=>playTone({freq:400,type:'sawtooth',duration:0.3,gain:0.18,reverb:true}),60); },
  roundOver: ()=>{ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone({freq:f,type:'sine',duration:0.3,gain:0.25}),i*120)); },
  error:     ()=> playTone({freq:200,type:'square',duration:0.2,gain:0.18}),
  start:     ()=> playThemeJingle(currentTheme),
  step:      ()=> playTone({freq:550,type:'sine',duration:0.1,gain:0.12}),
  charChange:()=> playTone({freq:720,type:'triangle',duration:0.08,gain:0.12}),
  themeChg:  ()=>{ playTone({freq:440,type:'sine',duration:0.12,gain:0.15}); setTimeout(()=>playTone({freq:880,duration:0.15,gain:0.12}),120); },
};

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════
function shuffle(arr) {
  let c=arr.length,r;
  while(c>0){r=Math.floor(Math.random()*c--);[arr[c],arr[r]]=[arr[r],arr[c]];}
  return arr;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showNotice(msg, type='info') {
  const el = document.getElementById('game-notice');
  el.textContent = msg;
  el.className = `game-notice game-notice--${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), 2600);
}

// ═══════════════════════════════════════════
//  SETUP STATE
// ═══════════════════════════════════════════
let setupConfig = {
  totalPlayers: 2,
  slots: [],
};
let currentCharTab = 0;

// ═══════════════════════════════════════════
//  STEP 1 — SPLASH
// ═══════════════════════════════════════════
document.querySelectorAll('.count-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.count-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    setupConfig.totalPlayers = parseInt(btn.dataset.count);
    SFX.hover();
  });
});

document.getElementById('splash-next').addEventListener('click',()=>{
  SFX.step();
  buildMixStep();
  showScreen('step-mix');
});

// ═══════════════════════════════════════════
//  STEP 2 — HUMAN / AI MIX
// ═══════════════════════════════════════════
function buildMixStep() {
  const n = setupConfig.totalPlayers;
  document.getElementById('mix-title').textContent = `${n} Players — Who's Human?`;
  const container = document.getElementById('mix-slots');
  container.innerHTML = '';

  if (setupConfig.slots.length !== n) {
    setupConfig.slots = Array.from({length:n},(_,i)=>({
      type: 'human',
      name: `Player ${i+1}`,
      avatar: { face: AVATAR_FACES[i], color: AVATAR_COLORS[i], hat: '' }
    }));
  }

  setupConfig.slots.forEach((slot, i) => {
    const row = document.createElement('div');
    row.className = 'mix-row';
    row.innerHTML = `
      <div class="mix-avatar" style="background:${slot.avatar.color}">
        ${slot.avatar.hat}<span>${slot.avatar.face}</span>
      </div>
      <input class="mix-name-input" type="text" value="${slot.name}" maxlength="14" placeholder="Player ${i+1}" data-idx="${i}"/>
      <div class="type-toggle">
        <button class="type-btn ${slot.type==='human'?'active':''}" data-idx="${i}" data-type="human">👤 Human</button>
        <button class="type-btn ${slot.type==='ai'?'active':''}" data-idx="${i}" data-type="ai">🤖 AI</button>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.mix-name-input').forEach(inp=>{
    inp.addEventListener('input', e=>{
      setupConfig.slots[parseInt(e.target.dataset.idx)].name = e.target.value.trim() || `Player ${parseInt(e.target.dataset.idx)+1}`;
    });
  });

  container.querySelectorAll('.type-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const idx  = parseInt(btn.dataset.idx);
      const type = btn.dataset.type;
      setupConfig.slots[idx].type = type;
      const rowBtns = container.querySelectorAll(`.type-btn[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.classList.toggle('active', b.dataset.type===type));
      if (type==='ai') {
        const nameInput = container.querySelector(`.mix-name-input[data-idx="${idx}"]`);
        const aiName = `AI Bot ${idx+1}`;
        nameInput.value = aiName;
        setupConfig.slots[idx].name = aiName;
        setupConfig.slots[idx].avatar.face = '🤖';
      }
      SFX.hover();
    });
  });
}

document.getElementById('mix-back').addEventListener('click',()=>{ SFX.step(); showScreen('step-splash'); });
document.getElementById('mix-next').addEventListener('click',()=>{ SFX.step(); buildCharStep(0); showScreen('step-chars'); });

// ═══════════════════════════════════════════
//  STEP 3 — 3D CHARACTER CUSTOMIZER
// ═══════════════════════════════════════════
function build3DCharacter(avatar, isAI) {
  const color = avatar.color;
  // Compute a glow color from the avatar color
  const glow = color + '88';
  return `
    <div class="avatar-3d-scene" id="avatar3d-scene">
      <div class="avatar-3d-body">
        <div class="char3d" style="--char-color:${color}; --char-glow:${glow}">
          <div class="c3d-shadow"></div>
          <div class="c3d-leg-l"></div>
          <div class="c3d-leg-r"></div>
          <div class="c3d-arm-l"></div>
          <div class="c3d-arm-r"></div>
          <div class="c3d-body"></div>
          <div class="c3d-head" id="c3d-face">${avatar.face}</div>
          ${avatar.hat ? `<div class="c3d-hat" id="c3d-hat">${avatar.hat}</div>` : `<div class="c3d-hat" id="c3d-hat"></div>`}
        </div>
      </div>
    </div>
  `;
}

function buildCharStep(tabIdx) {
  currentCharTab = tabIdx;
  const slots = setupConfig.slots;

  // Tabs
  const tabsEl = document.getElementById('char-tabs');
  tabsEl.innerHTML = slots.map((s,i)=>`
    <button class="char-tab ${i===tabIdx?'active':''}" data-idx="${i}">
      <span style="background:${s.avatar.color}" class="tab-avatar">${s.avatar.hat}${s.avatar.face}</span>
      ${s.name}
    </button>
  `).join('');
  tabsEl.querySelectorAll('.char-tab').forEach(btn=>{
    btn.addEventListener('click',()=>{ SFX.hover(); buildCharStep(parseInt(btn.dataset.idx)); });
  });

  // Editor
  const slot   = slots[tabIdx];
  const editor = document.getElementById('char-editor');
  const isAI   = slot.type === 'ai';

  editor.innerHTML = `
    <div class="char-preview-wrap">
      ${build3DCharacter(slot.avatar, isAI)}
      <div class="char-name-display">${slot.name}</div>
      ${isAI ? '<div class="ai-badge">🤖 AI Controlled</div>' : ''}
    </div>

    <div class="char-options">
      <div class="option-section">
        <label class="option-label">Face / Spirit</label>
        <div class="option-grid" id="face-grid">
          ${AVATAR_FACES.map(f=>`<button class="opt-btn ${f===slot.avatar.face?'active':''}" data-face="${f}">${f}</button>`).join('')}
        </div>
      </div>

      <div class="option-section">
        <label class="option-label">Color</label>
        <div class="option-grid" id="color-grid">
          ${AVATAR_COLORS.map(c=>`<button class="opt-btn color-swatch ${c===slot.avatar.color?'active':''}" data-color="${c}" style="background:${c};"></button>`).join('')}
        </div>
      </div>

      <div class="option-section">
        <label class="option-label">Hat / Accessory</label>
        <div class="option-grid" id="hat-grid">
          ${AVATAR_HATS.map(h=>`<button class="opt-btn ${h===slot.avatar.hat?'active':''}" data-hat="${h}">${h||'∅'}</button>`).join('')}
        </div>
      </div>
    </div>
  `;

  // Add drag-to-rotate on 3D scene
  setup3DRotate();

  editor.querySelectorAll('[data-face]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      slot.avatar.face = btn.dataset.face;
      const faceEl = document.getElementById('c3d-face');
      if (faceEl) faceEl.textContent = btn.dataset.face;
      editor.querySelectorAll('[data-face]').forEach(b=>b.classList.toggle('active',b===btn));
      rebuildTabs();
      SFX.charChange();
    });
  });

  editor.querySelectorAll('[data-color]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      slot.avatar.color = btn.dataset.color;
      // Update 3D character colors live
      const char3d = editor.querySelector('.char3d');
      if (char3d) {
        char3d.style.setProperty('--char-color', btn.dataset.color);
        char3d.style.setProperty('--char-glow', btn.dataset.color + '88');
      }
      editor.querySelectorAll('[data-color]').forEach(b=>b.classList.toggle('active',b===btn));
      rebuildTabs();
      SFX.charChange();
    });
  });

  editor.querySelectorAll('[data-hat]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      slot.avatar.hat = btn.dataset.hat === '∅' ? '' : btn.dataset.hat;
      const hatEl = document.getElementById('c3d-hat');
      if (hatEl) hatEl.textContent = slot.avatar.hat;
      editor.querySelectorAll('[data-hat]').forEach(b=>b.classList.toggle('active',b===btn));
      rebuildTabs();
      SFX.charChange();
    });
  });
}

function setup3DRotate() {
  const scene = document.getElementById('avatar3d-scene');
  if (!scene) return;
  const body = scene.querySelector('.avatar-3d-body');
  if (!body) return;

  let dragging = false, startX = 0, currentY = 0;

  scene.addEventListener('mousedown', e => { dragging = true; startX = e.clientX; body.style.animationPlayState = 'paused'; });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const delta = e.clientX - startX;
    currentY += delta * 0.8;
    body.style.transform = `rotateY(${currentY}deg) rotateX(5deg)`;
    startX = e.clientX;
  });
  window.addEventListener('mouseup', () => { dragging = false; });

  scene.addEventListener('touchstart', e => { dragging = true; startX = e.touches[0].clientX; body.style.animationPlayState = 'paused'; });
  scene.addEventListener('touchmove', e => {
    if (!dragging) return;
    const delta = e.touches[0].clientX - startX;
    currentY += delta * 0.8;
    body.style.transform = `rotateY(${currentY}deg) rotateX(5deg)`;
    startX = e.touches[0].clientX;
  });
  scene.addEventListener('touchend', () => { dragging = false; });
}

function rebuildTabs() {
  const tabs = document.getElementById('char-tabs');
  setupConfig.slots.forEach((s,i)=>{
    const tab = tabs.querySelector(`.char-tab[data-idx="${i}"]`);
    if (tab) {
      tab.querySelector('.tab-avatar').style.background = s.avatar.color;
      tab.querySelector('.tab-avatar').textContent = s.avatar.hat + s.avatar.face;
    }
  });
}

document.getElementById('chars-back').addEventListener('click',()=>{ SFX.step(); showScreen('step-mix'); });

document.getElementById('chars-next').addEventListener('click',()=>{
  SFX.start();
  showScreen('step-game');
  initializeGame();
});

// ═══════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════
let gameState         = null;
let selectedCardUid   = null;
let objectiveRevealed = false;
let pendingAnimation  = null;

function createHand() {
  return [
    { ...ACTION_CARDS.find(c=>c.id==='up1'),    uid: Math.random().toString(36) },
    { ...ACTION_CARDS.find(c=>c.id==='up1'),    uid: Math.random().toString(36) },
    { ...ACTION_CARDS.find(c=>c.id==='up2'),    uid: Math.random().toString(36) },
    { ...ACTION_CARDS.find(c=>c.id==='up3'),    uid: Math.random().toString(36) },
    { ...ACTION_CARDS.find(c=>c.id==='topple'), uid: Math.random().toString(36) },
    { ...ACTION_CARDS.find(c=>c.id==='toast'),  uid: Math.random().toString(36) },
  ];
}

function initializeGame(keepScores=false) {
  const oldScores = gameState ? gameState.players.map(p=>p.score) : [];
  const players = setupConfig.slots.map((slot,i)=>({
    id:           i+1,
    name:         slot.name,
    isAI:         slot.type==='ai',
    avatar:       { ...slot.avatar },
    hand:         createHand(),
    objective:    shuffle([...TIKIS]).slice(0,3),
    score:        keepScores ? (oldScores[i]||0) : 0,
    lastRoundScore: 0,
  }));

  gameState = {
    board: shuffle([...TIKIS]),
    players,
    currentPlayerIndex: 0,
    turnNumber: 1,
    roundOver: false,
  };
  selectedCardUid   = null;
  objectiveRevealed = false;
  pendingAnimation  = null;
  render();

  if (gameState.players[0].isAI) setTimeout(doAITurn, 1200);
}

// ═══════════════════════════════════════════
//  AI LOGIC
// ═══════════════════════════════════════════
function doAITurn() {
  if (!gameState || gameState.roundOver) return;
  const player = gameState.players[gameState.currentPlayerIndex];
  if (!player.isAI) return;

  let bestScore = -Infinity, bestCard = null, bestTikiId = null;

  for (const card of player.hand) {
    for (const tiki of gameState.board) {
      const targetIndex = gameState.board.findIndex(t=>t.id===tiki.id);
      let simBoard = [...gameState.board];

      if (card.type==='TOAST') {
        if (gameState.turnNumber<=gameState.players.length) continue;
        if (targetIndex!==simBoard.length-1) continue;
        simBoard.pop();
      } else if (card.type==='TOPPLE') {
        const t = simBoard.splice(targetIndex,1)[0];
        simBoard.push(t);
      } else if (card.type==='UP') {
        const newIdx = Math.max(0, targetIndex - card.value);
        const t = simBoard.splice(targetIndex,1)[0];
        simBoard.splice(newIdx,0,t);
      }

      let s = 0;
      if (simBoard[0]?.id===player.objective[0].id) s+=9;
      if (simBoard[0]?.id===player.objective[1].id||simBoard[1]?.id===player.objective[1].id) s+=5;
      if (simBoard[0]?.id===player.objective[2].id||simBoard[1]?.id===player.objective[2].id||simBoard[2]?.id===player.objective[2].id) s+=2;

      if (s > bestScore) { bestScore=s; bestCard=card; bestTikiId=tiki.id; }
    }
  }

  if (!bestCard) {
    bestCard   = player.hand[Math.floor(Math.random()*player.hand.length)];
    bestTikiId = gameState.board[Math.floor(Math.random()*gameState.board.length)].id;
  }

  selectedCardUid = bestCard.uid;
  render();
  showNotice(`🤖 ${player.name} plays ${bestCard.icon} ${bestCard.name}`, 'ai');
  setTimeout(()=>{ applyMove(bestCard.uid, bestTikiId); }, 900);
}

// ═══════════════════════════════════════════
//  MOVE LOGIC
// ═══════════════════════════════════════════
function handleCardClick(uid) {
  if (gameState.players[gameState.currentPlayerIndex].isAI) return;
  if (selectedCardUid === uid) { selectedCardUid=null; SFX.deselect(); }
  else { selectedCardUid=uid; SFX.select(); }
  updateHint();
  render();
}

function handleTikiClick(tikiId) {
  if (!selectedCardUid) { showNotice('Pick a card first!','error'); SFX.error(); return; }
  if (gameState.players[gameState.currentPlayerIndex].isAI) return;
  applyMove(selectedCardUid, tikiId);
}

function applyMove(cardUid, tikiId) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const cardIndex = player.hand.findIndex(c=>c.uid===cardUid);
  if (cardIndex===-1) return;
  const card = player.hand[cardIndex];

  let newBoard    = [...gameState.board];
  const targetIdx = newBoard.findIndex(t=>t.id===tikiId);

  if (card.type==='TOAST') {
    if (gameState.turnNumber<=gameState.players.length) { SFX.error(); showNotice('Cannot use Toast on first round of turns.','error'); return; }
    if (targetIdx!==newBoard.length-1) { SFX.error(); showNotice('Toast only works on the bottom-most Tiki.','error'); return; }
    pendingAnimation = { type:'toast', index: targetIdx };
    SFX.toast();
    newBoard.pop();
  } else if (card.type==='TOPPLE') {
    if (targetIdx===-1) return;
    pendingAnimation = { type:'topple', fromIndex:targetIdx, toIndex:newBoard.length-1 };
    SFX.topple();
    const t=newBoard.splice(targetIdx,1)[0]; newBoard.push(t);
  } else if (card.type==='UP') {
    if (targetIdx===-1) return;
    const newIdx = Math.max(0, targetIdx-card.value);
    pendingAnimation = { type:'up', fromIndex:targetIdx, toIndex:newIdx };
    SFX.moveUp();
    const t=newBoard.splice(targetIdx,1)[0]; newBoard.splice(newIdx,0,t);
  }

  player.hand.splice(cardIndex,1);
  gameState.board = newBoard;
  gameState.turnNumber++;

  const allDone = gameState.players.every(p=>p.hand.length===0);
  const fewLeft = gameState.board.length<=3;

  if (allDone||fewLeft) {
    gameState.roundOver = true;
    gameState.players.forEach(p=>{
      let s=0;
      if(newBoard[0]?.id===p.objective[0].id) s+=9;
      if(newBoard[0]?.id===p.objective[1].id||newBoard[1]?.id===p.objective[1].id) s+=5;
      if(newBoard[0]?.id===p.objective[2].id||newBoard[1]?.id===p.objective[2].id||newBoard[2]?.id===p.objective[2].id) s+=2;
      p.score+=s; p.lastRoundScore=s;
    });
    setTimeout(()=>SFX.roundOver(),300);
  } else {
    gameState.currentPlayerIndex=(gameState.currentPlayerIndex+1)%gameState.players.length;
  }

  selectedCardUid=null; objectiveRevealed=false;
  render();

  if (!gameState.roundOver && gameState.players[gameState.currentPlayerIndex].isAI) {
    setTimeout(doAITurn, 1200);
  }
}

// ═══════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════
function updateHint() {
  const hint = document.getElementById('hint-text');
  if (!hint) return;
  if (!selectedCardUid) { hint.textContent='① Pick a card from your hand'; }
  else { hint.textContent='② Tap a Tiki on the board to apply!'; }
}

function renderAvatar(avatar, size='sm') {
  return `<div class="avatar avatar--${size}" style="background:${avatar.color}">${avatar.hat}<span>${avatar.face}</span></div>`;
}

// Render big playing card HTML
function renderBigCard(card, isSelected) {
  const typeMap = {
    UP:     { bg: 'linear-gradient(160deg,#0f2d1a 0%,#062010 100%)', accent: '#4ade80' },
    TOPPLE: { bg: 'linear-gradient(160deg,#2d0f1a 0%,#1a0510 100%)', accent: '#f43f5e' },
    TOAST:  { bg: 'linear-gradient(160deg,#2d1a0a 0%,#1a0e05 100%)', accent: '#f97316' },
  };
  const tm = typeMap[card.type] || typeMap.UP;
  return `
    <div class="action-card action-card--${card.type.toLowerCase()} ${isSelected?'action-card--selected':''}"
         data-uid="${card.uid}">
      <div class="card-shine"></div>
      <div class="card-corner top-left">
        <span class="corner-icon">${card.icon}</span>
        <span class="corner-val" style="color:${tm.accent}">${card.value||'★'}</span>
      </div>
      <div class="card-center">
        <div class="card-big-icon">${card.icon}</div>
        <div class="card-big-name" style="color:${tm.accent}">${card.name}</div>
      </div>
      <div class="card-corner bot-right">
        <span class="corner-icon">${card.icon}</span>
        <span class="corner-val" style="color:${tm.accent}">${card.value||'★'}</span>
      </div>
      <div class="card-footer">${card.desc}</div>
    </div>
  `;
}

function render() {
  if (!gameState) return;
  const cp = gameState.players[gameState.currentPlayerIndex];

  // ── Scores ──
  document.getElementById('scores-container').innerHTML =
    gameState.players.map(p=>{
      const active = p.id===cp.id && !gameState.roundOver;
      return `<div class="score-chip ${active?'score-chip--active':''}">
        ${renderAvatar(p.avatar)}
        <span>${p.name}: <strong>${p.score}</strong></span>
      </div>`;
    }).join('');

  const layout    = document.getElementById('game-layout');
  const overPanel = document.getElementById('game-over-panel');

  if (gameState.roundOver) {
    layout.classList.add('hidden');
    overPanel.classList.remove('hidden');
    const sorted = [...gameState.players].sort((a,b)=>b.score-a.score);
    document.getElementById('results-container').innerHTML = sorted.map((p,i)=>`
      <div class="result-card ${i===0?'result-card--winner':''}">
        ${i===0?'<div class="winner-crown">👑</div>':''}
        <div class="result-avatar">${renderAvatar(p.avatar,'lg')}</div>
        <h3>${p.name}</h3>
        <p class="round-pts">+${p.lastRoundScore} pts</p>
        <p class="total-pts">Total: ${p.score}</p>
        <div class="obj-summary">${p.objective.map(t=>`${t.symbol}${t.name}`).join(' · ')}</div>
      </div>
    `).join('');
    return;
  }

  layout.classList.remove('hidden');
  overPanel.classList.add('hidden');

  // ── Left panel ──
  document.getElementById('current-avatar').innerHTML = renderAvatar(cp.avatar,'lg');
  document.getElementById('turn-player-name').textContent = `${cp.name}'s Turn`;
  document.getElementById('turn-badge').textContent = cp.isAI ? '🤖 AI THINKING…' : 'YOUR TURN';

  const objDetails = document.getElementById('objective-details');
  const toggleBtn  = document.getElementById('toggle-objective-btn');
  if (objectiveRevealed && !cp.isAI) {
    objDetails.classList.remove('hidden');
    toggleBtn.textContent = '🙈 Hide Objective';
    document.getElementById('objective-list').innerHTML =
      cp.objective.map((t,i)=>`
        <li class="obj-item">
          <span class="obj-rank">${['1st','2nd','3rd'][i]}</span>
          <span class="obj-pts">${[9,5,2][i]}pts</span>
          <span class="obj-tiki" style="color:${t.color}">${t.symbol} ${t.name}</span>
        </li>
      `).join('');
  } else {
    objDetails.classList.add('hidden');
    toggleBtn.textContent = cp.isAI ? '🤖 AI Objective Hidden' : '🔍 Reveal Objective';
  }
  toggleBtn.disabled = cp.isAI;

  // Selected notice
  const notice  = document.getElementById('selected-notice');
  const preview = document.getElementById('selected-card-preview');
  if (selectedCardUid) {
    notice.classList.remove('hidden');
    const card = cp.hand.find(c=>c.uid===selectedCardUid);
    if (card) preview.textContent = `${card.icon} ${card.name} — `;
  } else {
    notice.classList.add('hidden');
  }
  updateHint();

  // ── Board — Small Physical Tiki Pieces ──
  const tikiLine = document.getElementById('tiki-line');
  tikiLine.innerHTML='';
  gameState.board.forEach((tiki,index)=>{
    const el=document.createElement('div');
    el.className='tiki-piece';
    el.dataset.id=tiki.id;
    el.style.setProperty('--piece-color', tiki.color);

    if (pendingAnimation) {
      if (pendingAnimation.type==='toast'  && index===pendingAnimation.index)   el.classList.add('anim-toast');
      if (pendingAnimation.type==='topple' && index===pendingAnimation.toIndex) el.classList.add('anim-topple');
      if (pendingAnimation.type==='up'     && index===pendingAnimation.toIndex) el.classList.add('anim-up');
    }

    const objIdx = cp.objective.findIndex(t=>t.id===tiki.id);
    if (objectiveRevealed && objIdx!==-1) {
      el.classList.add('tiki-targeted');
      el.dataset.objRank = ['★★★','★★','★'][objIdx];
    }

    el.style.background = tiki.color;
    el.style.boxShadow  = `0 2px 8px ${tiki.color}66, inset 0 0 12px rgba(0,0,0,0.35)`;

    if (selectedCardUid) el.classList.add('tiki-selectable');

    el.innerHTML=`
      <div class="tiki-pos">${index+1}</div>
      <div class="tiki-sym">${tiki.symbol}</div>
      <div class="tiki-name">${tiki.name}</div>
      ${objIdx!==-1&&objectiveRevealed?`<div class="tiki-star">${['🥇','🥈','🥉'][objIdx]}</div>`:''}
    `;
    el.addEventListener('click',()=>handleTikiClick(tiki.id));
    tikiLine.appendChild(el);
  });
  pendingAnimation=null;

  // ── Hand — Big Playing Cards ──
  const stack=document.getElementById('cards-stack');
  stack.innerHTML='';
  cp.hand.forEach(card=>{
    const isSelected = selectedCardUid===card.uid;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderBigCard(card, isSelected);
    const el = wrapper.firstElementChild;
    el.addEventListener('click',()=>handleCardClick(card.uid));
    el.addEventListener('mouseenter',()=>{ if(!isSelected) SFX.hover(); });
    stack.appendChild(el);
  });
}

// ═══════════════════════════════════════════
//  GLOBAL HOOKS
// ═══════════════════════════════════════════
window.startNextRound = ()=> initializeGame(true);
window.goToStart      = ()=>{ showScreen('step-splash'); buildMixStep(); spawnParticles(); };

document.getElementById('toggle-objective-btn').addEventListener('click',()=>{
  objectiveRevealed=!objectiveRevealed;
  render();
});

const soundBtn = document.getElementById('sound-toggle');
soundBtn.addEventListener('click',()=>{
  soundEnabled=!soundEnabled;
  soundBtn.textContent=soundEnabled?'🔊':'🔇';
});
