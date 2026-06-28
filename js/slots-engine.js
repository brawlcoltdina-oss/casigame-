// ============================================================
// MOTEUR MACHINES À SOUS V2 — 3 MACHINES / WILDS / FREE SPINS / BONUS
// ============================================================

// ===== MACHINE 1: CLASSIC 777 (5 rouleaux x 3 lignes) =====
const MACHINE_CLASSIC = {
  id: 'classic',
  name: '♦ ROYAL 777 ♦',
  subtitle: '5 ROULEAUX · WILDS · JACKPOT',
  numReels: 5,
  numRows: 3,
  numLines: 5,
  symbols: {
    '🃏': { weight: 1,  name: 'WILD',    isWild: true },
    '7️⃣':  { weight: 2,  name: 'SEPT',    payout5: 5000, payout4: 500, payout3: 100 },
    '💎':  { weight: 3,  name: 'DIAMANT', payout5: 1000, payout4: 200, payout3: 50 },
    '⭐':  { weight: 5,  name: 'ETOILE',  payout5: 300,  payout4: 60,  payout3: 15 },
    '🔔':  { weight: 8,  name: 'CLOCHE',  payout5: 150,  payout4: 30,  payout3: 8 },
    '🍇':  { weight: 11, name: 'RAISIN',  payout5: 80,   payout4: 16,  payout3: 4 },
    '🍒':  { weight: 15, name: 'CERISE',  payout5: 50,   payout4: 10,  payout3: 3 },
    '🍋':  { weight: 19, name: 'CITRON',  payout5: 30,   payout4: 6,   payout3: 2 },
    '🍊':  { weight: 19, name: 'ORANGE',  payout5: 30,   payout4: 6,   payout3: 2 },
  },
  paylines: [
    [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2],
    [0,1,2,1,0], [2,1,0,1,2],
  ],
  lineColors: ['#F0D060','#4ade80','#60a5fa','#f472b6','#fb923c'],
  freeSpinSymbol: '⭐',
  freeSpinCount: 8,
  bonusSymbol: null,
};

// ===== MACHINE 2: MEGA FRUIT (3 rouleaux x 3 lignes, classique) =====
const MACHINE_FRUIT = {
  id: 'fruit',
  name: '🍉 MEGA FRUIT 🍉',
  subtitle: '3 ROULEAUX · BONUS FRUITS · MULTIPLICATEURS',
  numReels: 3,
  numRows: 3,
  numLines: 3,
  symbols: {
    '⚡': { weight: 1,  name: 'BONUS',   isBonus: true },
    '🍉': { weight: 3,  name: 'PASTEQUE', payout3: 200, payout2: 20 },
    '🍓': { weight: 5,  name: 'FRAISE',  payout3: 100, payout2: 15 },
    '🍑': { weight: 7,  name: 'PECHE',   payout3: 60,  payout2: 10 },
    '🍌': { weight: 9,  name: 'BANANE',  payout3: 40,  payout2: 7 },
    '🍍': { weight: 11, name: 'ANANAS',  payout3: 25,  payout2: 5 },
    '🍎': { weight: 14, name: 'POMME',   payout3: 15,  payout2: 3 },
    '🍋': { weight: 17, name: 'CITRON',  payout3: 10,  payout2: 2 },
    '🍒': { weight: 20, name: 'CERISE',  payout3: 8,   payout2: 1.5 },
  },
  paylines: [
    [1,1,1], [0,0,0], [2,2,2],
  ],
  lineColors: ['#F0D060','#4ade80','#60a5fa'],
  bonusSymbol: '⚡',
  bonusMinCount: 3,
  freeSpinSymbol: null,
  // Bonus game: tourne une roue avec des multiplicateurs
};

// ===== MACHINE 3: DIAMOND RUSH (4 rouleaux x 4 lignes, cluster pays) =====
const MACHINE_DIAMOND = {
  id: 'diamond',
  name: '💎 DIAMOND RUSH 💎',
  subtitle: '4 ROULEAUX · CLUSTERS · CASCADES',
  numReels: 4,
  numRows: 4,
  numLines: 8,
  symbols: {
    '🌟': { weight: 1,  name: 'STAR',    isWild: true },
    '💎': { weight: 2,  name: 'DIAMANT', payout4: 2000, payout3: 200, payout2: 20 },
    '💙': { weight: 4,  name: 'SAPHIR',  payout4: 500,  payout3: 80,  payout2: 10 },
    '💜': { weight: 6,  name: 'VIOLET',  payout4: 250,  payout3: 40,  payout2: 6 },
    '💚': { weight: 8,  name: 'EMERAUDE',payout4: 120,  payout3: 20,  payout2: 4 },
    '❤️': { weight: 10, name: 'RUBIS',   payout4: 80,   payout3: 12,  payout2: 3 },
    '🔶': { weight: 14, name: 'TOPAZE',  payout4: 40,   payout3: 6,   payout2: 2 },
    '⬡':  { weight: 18, name: 'BASE',    payout4: 20,   payout3: 3,   payout2: 1 },
  },
  paylines: [
    [1,1,1,1],[2,2,2,2],[0,0,0,0],[3,3,3,3],
    [0,1,2,3],[3,2,1,0],[0,1,1,0],[3,2,2,3],
  ],
  lineColors: ['#F0D060','#4ade80','#60a5fa','#f472b6','#fb923c','#a78bfa','#34d399','#f87171'],
  cascadeMode: true, // Les symboles gagnants disparaissent et de nouveaux tombent
  freeSpinSymbol: null,
  bonusSymbol: null,
};

// ===== ÉTAT GLOBAL =====
let currentMachine = MACHINE_CLASSIC;
let slotBet = 10;
let slotSpinning = false;
let freeSpinsRemaining = 0;
let isFreeSpinMode = false;
let pendingClearTimeout = null;
let cascadeMultiplier = 1;

// ===== UTILS =====
function fmt(n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; }

function weightedRandom(symbols) {
  const entries = Object.entries(symbols);
  const total = entries.reduce((s, [, d]) => s + d.weight, 0);
  let r = Math.random() * total;
  for (const [sym, d] of entries) {
    if (r < d.weight) return sym;
    r -= d.weight;
  }
  return entries[entries.length - 1][0];
}

// ===== DOM HELPERS =====
function getCell(reelIndex, rowIndex, containerId = 'slot-reels-container') {
  const container = document.getElementById(containerId);
  const col = container.querySelector(`#col${reelIndex}`);
  return col ? col.children[rowIndex] : null;
}

function setCellSymbol(reelIndex, rowIndex, symbol, containerId = 'slot-reels-container') {
  const cell = getCell(reelIndex, rowIndex, containerId);
  if (cell) {
    const span = cell.querySelector('.reel-symbol');
    if (span) span.textContent = symbol;
  }
}

// ===== GÉNÉRATION DE GRILLE =====
function generateGrid(machine, forceWin = false) {
  const grid = [];
  for (let r = 0; r < machine.numReels; r++) {
    const col = [];
    for (let row = 0; row < machine.numRows; row++) {
      col.push(weightedRandom(machine.symbols));
    }
    grid.push(col);
  }
  return grid;
}

// ===== ANIMATION D'UN ROULEAU =====
function spinReel(reelIndex, finalSymbols, machine, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const container = document.getElementById('slot-reels-container');
      const col = container.querySelector(`#col${reelIndex}`);
      if (!col) { resolve(); return; }

      col.classList.add('spinning');

      let ticks = 0;
      const maxTicks = 12 + reelIndex * 5;
      const interval = setInterval(() => {
        for (let row = 0; row < machine.numRows; row++) {
          const span = col.children[row]?.querySelector('.reel-symbol');
          if (span) span.textContent = weightedRandom(machine.symbols);
        }
        ticks++;
        if (ticks >= maxTicks) {
          clearInterval(interval);
          col.classList.remove('spinning');
          for (let row = 0; row < machine.numRows; row++) {
            const span = col.children[row]?.querySelector('.reel-symbol');
            if (span) span.textContent = finalSymbols[row];
            const cell = col.children[row];
            if (cell) {
              cell.classList.remove('win-cell', 'settling', 'wild-cell', 'bonus-cell');
              void cell.offsetWidth;
              cell.classList.add('settling');
              // Glow spécial pour les symboles WILD/BONUS
              const sym = machine.symbols[finalSymbols[row]];
              if (sym?.isWild) cell.classList.add('wild-cell');
              if (sym?.isBonus) cell.classList.add('bonus-cell');
            }
          }
          resolve();
        }
      }, 55);
    }, delay);
  });
}

async function spinAllReels(grid, machine) {
  const promises = [];
  for (let i = 0; i < machine.numReels; i++) {
    promises.push(spinReel(i, grid[i], machine, i * 80));
  }
  await Promise.all(promises);
}

// ===== ÉVALUATION DES LIGNES (avec WILD) =====
function evaluateLines(grid, machine, betPerLine) {
  const results = [];
  const symData = machine.symbols;
  const numReels = machine.numReels;

  machine.paylines.forEach((line, lineIndex) => {
    const seq = line.map((row, reel) => grid[reel][row]);

    // Remplace les wilds
    let first = null;
    for (const s of seq) {
      if (!symData[s]?.isWild && !symData[s]?.isBonus) { first = s; break; }
    }
    if (!first) return; // Que des wilds → pas de gain (rare)

    let count = 0;
    let hasWild = false;
    for (let i = 0; i < seq.length; i++) {
      const s = seq[i];
      if (s === first || symData[s]?.isWild) {
        count++;
        if (symData[s]?.isWild) hasWild = true;
      } else break;
    }

    if (count < 2) return;
    if (count === 2 && !symData[first]?.payout2) return;

    const d = symData[first];
    let mult = 0;
    if (count >= numReels && d.payout5) mult = d.payout5;
    else if (count >= numReels && d.payout4) mult = d.payout4;
    else if (count >= numReels && d.payout3) mult = d.payout3;
    else if (count === 4 && d.payout4) mult = d.payout4;
    else if (count === 3 && d.payout3) mult = d.payout3;
    else if (count === 2 && d.payout2) mult = d.payout2;

    if (!mult) return;

    const win = betPerLine * mult * cascadeMultiplier;
    const cells = [];
    for (let reel = 0; reel < count; reel++) cells.push([reel, line[reel]]);
    results.push({ lineIndex, symbol: first, count, mult, win, cells, hasWild });
  });

  return results;
}

// ===== BONUS: ROUE DE FORTUNE (Machine Fruit) =====
function showBonusWheel(bet) {
  return new Promise((resolve) => {
    const multipliers = [2, 5, 10, 20, 50, 3, 8, 15, 25, 100];
    const overlay = document.createElement('div');
    overlay.id = 'bonus-overlay';
    overlay.innerHTML = `
      <div class="bonus-modal">
        <div class="bonus-title">⚡ BONUS GAME ⚡</div>
        <div class="bonus-subtitle">Cliquez pour faire tourner la roue !</div>
        <div class="wheel-container">
          <div class="wheel" id="bonus-wheel">
            ${multipliers.map((m, i) => `
              <div class="wheel-segment" style="--i:${i};--total:${multipliers.length};--color:hsl(${i * 36}, 70%, 45%)">
                <span class="wheel-label" style="transform: rotate(${90 + i * (360/multipliers.length)}deg)">×${m}</span>
              </div>
            `).join('')}
          </div>
          <div class="wheel-pointer">▼</div>
        </div>
        <button class="spin-wheel-btn" id="spin-wheel-btn">🎡 TOURNER LA ROUE</button>
        <div class="bonus-result" id="bonus-result"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('spin-wheel-btn').onclick = () => {
      const btn = document.getElementById('spin-wheel-btn');
      btn.disabled = true;
      const idx = Math.floor(Math.random() * multipliers.length);
      const mult = multipliers[idx];
      const degrees = 1800 + (360 - idx * (360 / multipliers.length));
      const wheel = document.getElementById('bonus-wheel');
      wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      wheel.style.transform = `rotate(${degrees}deg)`;

      setTimeout(() => {
        const win = bet * mult;
        document.getElementById('bonus-result').innerHTML = `
          <div style="font-size:2rem">🎉</div>
          <div style="color:var(--gold);font-family:'Cinzel',serif;font-size:1.4rem">×${mult}</div>
          <div style="color:#4ade80;font-size:1.1rem">+${fmt(win)}</div>
        `;
        setTimeout(() => {
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.5s';
          setTimeout(() => { overlay.remove(); resolve(win); }, 500);
        }, 2500);
      }, 4100);
    };
  });
}

// ===== FREE SPINS =====
function activateFreeSpins(count) {
  freeSpinsRemaining = count;
  isFreeSpinMode = true;
  const banner = document.getElementById('free-spins-banner');
  if (banner) {
    banner.style.display = 'flex';
    updateFreeSpinsBanner();
  }
  document.getElementById('slot-msg').innerHTML =
    `<span class="win-msg">🌟 ${count} FREE SPINS ACTIVÉS ! 🌟</span>`;
}

function updateFreeSpinsBanner() {
  const el = document.getElementById('free-spins-count');
  if (el) el.textContent = freeSpinsRemaining;
}

// ===== CASCADE (Diamond Rush) =====
async function doCascade(grid, machine, betPerLine) {
  cascadeMultiplier++;
  // Supprime les cellules gagnantes et fait tomber de nouveaux symboles
  const winResults = evaluateLines(grid, machine, betPerLine);
  if (winResults.length === 0) { cascadeMultiplier = 1; return 0; }

  const toRemove = new Set();
  winResults.forEach(r => r.cells.forEach(([reel, row]) => toRemove.add(`${reel}-${row}`)));

  // Animation de suppression
  toRemove.forEach(key => {
    const [reel, row] = key.split('-').map(Number);
    const cell = getCell(reel, row);
    if (cell) cell.classList.add('cascade-remove');
  });
  await new Promise(r => setTimeout(r, 400));

  // Nouveaux symboles
  toRemove.forEach(key => {
    const [reel, row] = key.split('-').map(Number);
    grid[reel][row] = weightedRandom(machine.symbols);
    const cell = getCell(reel, row);
    if (cell) {
      cell.classList.remove('cascade-remove', 'win-cell');
      const span = cell.querySelector('.reel-symbol');
      if (span) span.textContent = grid[reel][row];
      cell.classList.add('cascade-drop');
      setTimeout(() => cell.classList.remove('cascade-drop'), 400);
    }
  });

  await new Promise(r => setTimeout(r, 400));

  const total = winResults.reduce((s, r) => s + r.win, 0);
  return total;
}

// ===== SVG PAYLINES =====
function drawWinningLines(winResults, machine) {
  const svg = document.getElementById('paylines-svg');
  if (!svg) return;
  svg.innerHTML = '';

  const colW = 100 / machine.numReels;
  const rowH = 100 / machine.numRows;

  winResults.forEach((res) => {
    const color = machine.lineColors[res.lineIndex % machine.lineColors.length];
    const line = machine.paylines[res.lineIndex];
    let d = '';
    for (let reel = 0; reel < res.count; reel++) {
      const x = colW * reel + colW / 2;
      const y = rowH * line[reel] + rowH / 2;
      d += (reel === 0 ? 'M' : 'L') + x + ',' + y + ' ';
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d.trim());
    path.setAttribute('class', 'payline-path');
    path.style.stroke = color;
    path.style.filter = `drop-shadow(0 0 8px ${color})`;
    svg.appendChild(path);
  });
}

function highlightWinningCells(winResults) {
  const touched = new Set();
  winResults.forEach((res) => {
    res.cells.forEach(([reel, row]) => {
      const key = reel + '-' + row;
      if (touched.has(key)) return;
      touched.add(key);
      const cell = getCell(reel, row);
      if (cell) cell.classList.add('win-cell');
    });
  });
  return () => {
    touched.forEach((key) => {
      const [reel, row] = key.split('-').map(Number);
      const cell = getCell(reel, row);
      if (cell) cell.classList.remove('win-cell');
    });
  };
}

// ===== PARTICULES =====
function spawnParticles(winResults, machine) {
  const container = document.getElementById('win-particles');
  const reelsBox = document.getElementById('slot-reels-container');
  if (!container || !reelsBox) return;
  const rect = reelsBox.getBoundingClientRect();
  const emojis = ['✨','💰','⭐','🪙','💫','🎊','🎉'];

  const cellSet = new Set();
  winResults.forEach((res) => res.cells.forEach(([reel, row]) => cellSet.add(reel + '-' + row)));

  cellSet.forEach((key) => {
    const [reel, row] = key.split('-').map(Number);
    const cell = getCell(reel, row);
    if (!cell) return;
    const cellRect = cell.getBoundingClientRect();
    const originX = cellRect.left - rect.left + cellRect.width / 2;
    const originY = cellRect.top - rect.top + cellRect.height / 2;

    for (let p = 0; p < 6; p++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.left = originX + 'px';
      particle.style.top = originY + 'px';
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 70;
      particle.style.setProperty('--px', Math.cos(angle) * dist + 'px');
      particle.style.setProperty('--py', Math.sin(angle) * dist - 30 + 'px');
      particle.style.setProperty('--pr', (Math.random() * 360 - 180) + 'deg');
      particle.style.animationDelay = (Math.random() * 0.2) + 's';
      container.appendChild(particle);
      setTimeout(() => particle.remove(), 1400);
    }
  });
}

function flashScreen(color = 'rgba(212,175,55,0.35)') {
  const flash = document.createElement('div');
  flash.className = 'jackpot-flash';
  flash.style.background = `radial-gradient(circle, ${color}, transparent 70%)`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1000);
}

function shakeCabinet() {
  const cabinet = document.getElementById('slot-cabinet');
  if (!cabinet) return;
  cabinet.classList.remove('shake');
  void cabinet.offsetWidth;
  cabinet.classList.add('shake');
  setTimeout(() => cabinet.classList.remove('shake'), 450);
}

function pushHistory(won) {
  const hist = document.getElementById('slot-history');
  if (!hist) return;
  const chip = document.createElement('div');
  chip.className = 'hist-chip ' + (won ? 'hist-win' : 'hist-lose');
  chip.textContent = won ? '+' : '−';
  hist.insertBefore(chip, hist.firstChild);
  while (hist.children.length > 20) hist.removeChild(hist.lastChild);
}

// ===== CONSTRUCTION DE LA GRILLE HTML =====
function buildReelGrid(machine) {
  const container = document.getElementById('slot-reels-container');
  if (!container) return;

  // Supprimer uniquement les colonnes de rouleaux (pas le SVG/particles)
  container.querySelectorAll('.reel-column').forEach(c => c.remove());

  const svg = document.getElementById('paylines-svg');
  const particles = document.getElementById('win-particles');

  for (let r = 0; r < machine.numReels; r++) {
    const col = document.createElement('div');
    col.className = 'reel-column';
    col.id = 'col' + r;
    for (let row = 0; row < machine.numRows; row++) {
      const cell = document.createElement('div');
      cell.className = 'reel-cell';
      const syms = Object.keys(machine.symbols);
      const sym = syms[Math.floor(Math.random() * syms.length)];
      cell.innerHTML = `<span class="reel-symbol">${sym}</span>`;
      col.appendChild(cell);
    }
    container.insertBefore(col, svg || particles || null);
  }

  // Adapter la grille CSS
  container.style.gridTemplateColumns = `repeat(${machine.numReels}, 1fr)`;
}

// ===== CHANGEMENT DE MACHINE =====
window.selectMachine = function(machineId) {
  const machines = { classic: MACHINE_CLASSIC, fruit: MACHINE_FRUIT, diamond: MACHINE_DIAMOND };
  const machine = machines[machineId];
  if (!machine || machine === currentMachine) return;

  currentMachine = machine;
  freeSpinsRemaining = 0;
  isFreeSpinMode = false;
  cascadeMultiplier = 1;

  // Update UI
  document.getElementById('slot-marquee').textContent = machine.name;
  document.getElementById('lines-indicator').textContent = `${machine.numLines} LIGNES ACTIVES`;
  const fsBanner = document.getElementById('free-spins-banner');
  if (fsBanner) fsBanner.style.display = 'none';

  // Rebuild grid
  buildReelGrid(machine);

  // Update paytable
  updatePaytable(machine);

  // Highlight active tab
  document.querySelectorAll('.machine-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.machine-tab[data-machine="${machineId}"]`)?.classList.add('active');

  // Clear messages
  const svg = document.getElementById('paylines-svg');
  if (svg) svg.innerHTML = '';
  const msg = document.getElementById('slot-msg');
  if (msg) msg.textContent = '';

  // Show/hide cascade indicator
  const cascadeEl = document.getElementById('cascade-indicator');
  if (cascadeEl) cascadeEl.style.display = machine.cascadeMode ? 'block' : 'none';
};

function updatePaytable(machine) {
  const table = document.getElementById('paytable-rows');
  if (!table) return;
  const entries = Object.entries(machine.symbols).filter(([, d]) => !d.isWild && !d.isBonus);
  entries.sort(([, a], [, b]) => (b.payout5 || b.payout4 || b.payout3 || 0) - (a.payout5 || a.payout4 || a.payout3 || 0));

  table.innerHTML = entries.slice(0, 6).map(([sym, d]) => {
    const best = d.payout5 || d.payout4 || d.payout3 || 0;
    const count = d.payout5 ? machine.numReels : d.payout4 ? 4 : 3;
    const symsStr = Array(count).fill(sym).join(' ');
    return `<div class="pay-row"><span>${symsStr}</span><span class="pay-win">× ${best.toLocaleString('fr-FR')}</span></div>`;
  }).join('');

  if (machine.symbols['🃏']) {
    table.innerHTML += `<div class="pay-row pay-row-special"><span>🃏 = WILD (remplace tout)</span><span class="pay-win">✦</span></div>`;
  }
  if (machine.symbols['⚡']) {
    table.innerHTML += `<div class="pay-row pay-row-special"><span>⚡ 3× = BONUS GAME</span><span class="pay-win">🎡</span></div>`;
  }
  if (machine.freeSpinSymbol) {
    table.innerHTML += `<div class="pay-row pay-row-special"><span>${machine.freeSpinSymbol} 3× = ${machine.freeSpinCount} FREE SPINS</span><span class="pay-win">🌟</span></div>`;
  }
  if (machine.cascadeMode) {
    table.innerHTML += `<div class="pay-row pay-row-special"><span>CASCADES = ×2, ×3, ×4...</span><span class="pay-win">🌊</span></div>`;
  }
}

// ===== SPIN PRINCIPAL =====
async function spinSlots() {
  if (slotSpinning) return;

  const machine = currentMachine;
  const betInput = document.getElementById('slot-bet');
  slotBet = Math.max(1, Math.min(1000000, parseInt(betInput.value, 10) || 10));
  const totalCost = isFreeSpinMode ? 0 : slotBet * machine.numLines;

  if (!isFreeSpinMode && window.balance < totalCost) {
    document.getElementById('slot-msg').innerHTML =
      `<span class="lose-msg">Solde insuffisant ! (${fmt(totalCost)} requis)</span>`;
    return;
  }

  // Nettoyer l'état précédent
  if (pendingClearTimeout) { clearTimeout(pendingClearTimeout); pendingClearTimeout = null; }
  for (let reel = 0; reel < machine.numReels; reel++) {
    for (let row = 0; row < machine.numRows; row++) {
      const cell = getCell(reel, row);
      if (cell) cell.classList.remove('win-cell', 'wild-cell', 'bonus-cell', 'cascade-remove', 'cascade-drop');
    }
  }
  const svg = document.getElementById('paylines-svg');
  if (svg) svg.innerHTML = '';
  const particles = document.getElementById('win-particles');
  if (particles) particles.innerHTML = '';
  cascadeMultiplier = 1;

  slotSpinning = true;
  document.getElementById('spin-btn').disabled = true;

  if (isFreeSpinMode) {
    document.getElementById('slot-msg').innerHTML =
      `<span class="free-spin-msg">🌟 FREE SPIN (${freeSpinsRemaining} restants)</span>`;
  } else {
    document.getElementById('slot-msg').textContent = '';
    window.balance -= totalCost;
    window.updateAllBalances();
  }

  // Générer et animer la grille
  const grid = generateGrid(machine);
  await spinAllReels(grid, machine);

  // === Vérifier FREE SPINS ===
  if (machine.freeSpinSymbol && !isFreeSpinMode) {
    let fsCount = 0;
    for (let r = 0; r < machine.numReels; r++) {
      for (let row = 0; row < machine.numRows; row++) {
        if (grid[r][row] === machine.freeSpinSymbol) fsCount++;
      }
    }
    if (fsCount >= 3) {
      activateFreeSpins(machine.freeSpinCount);
    }
  }

  // === Vérifier BONUS GAME ===
  let bonusWin = 0;
  if (machine.bonusSymbol) {
    let bonusCount = 0;
    for (let r = 0; r < machine.numReels; r++) {
      for (let row = 0; row < machine.numRows; row++) {
        if (grid[r][row] === machine.bonusSymbol) bonusCount++;
      }
    }
    if (bonusCount >= machine.bonusMinCount) {
      slotSpinning = false;
      document.getElementById('spin-btn').disabled = false;
      bonusWin = await showBonusWheel(slotBet * machine.numLines);
      window.balance += bonusWin;
      window.updateAllBalances();
      slotSpinning = true;
      document.getElementById('spin-btn').disabled = true;
    }
  }

  // === Évaluer les lignes gagnantes ===
  const winResults = evaluateLines(grid, machine, slotBet);
  let totalWin = winResults.reduce((s, r) => s + r.win, 0) + bonusWin;

  // === Cascades (Diamond Rush) ===
  if (machine.cascadeMode && winResults.length > 0) {
    let cascadeWin = 0;
    let maxCascades = 5;
    while (maxCascades-- > 0) {
      const cw = await doCascade(grid, machine, slotBet);
      if (cw === 0) break;
      cascadeWin += cw;
    }
    totalWin += cascadeWin;
  }
  cascadeMultiplier = 1;

  // === Affichage des gains ===
  let clearHighlight = () => {};
  if (winResults.length > 0 || bonusWin > 0) {
    if (winResults.length > 0) {
      drawWinningLines(winResults, machine);
      clearHighlight = highlightWinningCells(winResults);
      spawnParticles(winResults, machine);
    }

    const bestMult = winResults.length > 0 ? Math.max(...winResults.map(r => r.mult)) : 0;
    if (bestMult >= 150 || bonusWin > slotBet * 50) {
      flashScreen();
      shakeCabinet();
      // Notification jackpot Firebase
      if (window._db && window._auth?.currentUser && bestMult >= 300) {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const player = window._auth.currentUser.displayName || 'Joueur';
        const sym = winResults[0]?.symbol || '💎';
        addDoc(collection(window._db, 'jackpots'), {
          uid: window._auth.currentUser.uid,
          player, symbol: sym,
          amount: Math.round(totalWin), at: Date.now()
        }).catch(() => {});
      }
    }

    const best = winResults.length > 0 ? winResults.reduce((a, b) => b.win > a.win ? b : a) : null;
    let label = '';
    if (bonusWin > 0 && winResults.length === 0) {
      label = `🎡 BONUS : +${fmt(bonusWin)}`;
    } else if (winResults.length > 1) {
      label = `🎉 ${winResults.length} LIGNES ! +${fmt(totalWin)}`;
    } else if (best) {
      const wildNote = best.hasWild ? ' 🃏' : '';
      label = `🎉 ${best.symbol}${wildNote} ×${best.count} (×${best.mult}) ! +${fmt(totalWin)}`;
    }
    if (machine.cascadeMode && cascadeMultiplier > 1) {
      label += ` [CASCADE ×${cascadeMultiplier}]`;
    }
    document.getElementById('slot-msg').innerHTML = `<span class="win-msg">${label}</span>`;
  } else {
    document.getElementById('slot-msg').innerHTML = `<span class="lose-msg">Pas de ligne gagnante. Réessayez !</span>`;
  }

  window.balance += totalWin;
  window.updateAllBalances();
  if (window.saveBalance) window.saveBalance();
  pushHistory(totalWin > 0);

  // FREE SPINS: décrémenter
  if (isFreeSpinMode) {
    freeSpinsRemaining--;
    if (freeSpinsRemaining <= 0) {
      isFreeSpinMode = false;
      const fsBanner = document.getElementById('free-spins-banner');
      if (fsBanner) fsBanner.style.display = 'none';
    } else {
      updateFreeSpinsBanner();
    }
  }

  pendingClearTimeout = setTimeout(() => {
    clearHighlight();
    if (svg) svg.innerHTML = '';
    pendingClearTimeout = null;
  }, 2500);

  slotSpinning = false;
  document.getElementById('spin-btn').disabled = false;
}

// ===== INIT =====
window.spinSlots = spinSlots;
document.addEventListener('DOMContentLoaded', () => {
  buildReelGrid(currentMachine);
  updatePaytable(currentMachine);
});

export { spinSlots };