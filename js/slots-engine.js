// ============================================================
// MOTEUR MACHINE À SOUS — 5 ROULEAUX / 3 RANGÉES / 5 LIGNES
// ============================================================
// Ce module attend que les fonctions globales suivantes existent
// déjà (définies dans script.js) :
//   - window.balance (number)
//   - window.updateAllBalances()
//   - window.saveBalance() (async)
// Il expose window.spinSlots pour rester compatible avec le HTML.

const WEIGHTS = {
  '7️⃣': 1,
  '💎': 2,
  '⭐': 4,
  '🔔': 7,
  '🍇': 10,
  '🍒': 14,
  '🍋': 18,
  '🍊': 18,
};

const PAYOUT_5 = { '7️⃣': 5000, '💎': 1000, '⭐': 300, '🔔': 150, '🍇': 80, '🍒': 50, '🍋': 30, '🍊': 30 };
const PAYOUT_4 = 8;
const PAYOUT_3 = 2;

const NUM_REELS = 5;
const NUM_ROWS = 3;

// Lignes de paiement : pour chaque ligne, la rangée (0=haut,1=milieu,2=bas) utilisée sur chacun des 5 rouleaux
const PAYLINES = [
  [1, 1, 1, 1, 1], // milieu
  [0, 0, 0, 0, 0], // haut
  [2, 2, 2, 2, 2], // bas
  [0, 1, 2, 1, 0], // V
  [2, 1, 0, 1, 2], // V inversé
];

const LINE_COLORS = ['#F0D060', '#4ade80', '#60a5fa', '#f472b6', '#fb923c'];

let slotBet = 10;
let slotSpinning = false;

function weightedRandomSymbol() {
  const entries = Object.entries(WEIGHTS);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [sym, w] of entries) {
    if (r < w) return sym;
    r -= w;
  }
  return entries[entries.length - 1][0];
}

function fmt(n) {
  return Math.round(n).toLocaleString('fr-FR') + ' €';
}

function getCol(reelIndex) {
  return document.getElementById('col' + reelIndex);
}

function getCell(reelIndex, rowIndex) {
  return getCol(reelIndex).children[rowIndex];
}

function setCellSymbol(reelIndex, rowIndex, symbol) {
  getCell(reelIndex, rowIndex).querySelector('.reel-symbol').textContent = symbol;
}

// Grille finale 5x3 — c'est la SEULE source de vérité pour l'affichage ET pour le calcul des gains
function generateGrid() {
  const grid = [];
  for (let r = 0; r < NUM_REELS; r++) {
    const col = [];
    for (let row = 0; row < NUM_ROWS; row++) col.push(weightedRandomSymbol());
    grid.push(col);
  }
  return grid;
}

// Anime un seul rouleau : flou de défilement, puis pose EXACTEMENT les symboles de `finalSymbols`
function spinReel(reelIndex, finalSymbols) {
  return new Promise((resolve) => {
    const col = getCol(reelIndex);
    col.classList.add('spinning');

    let ticks = 0;
    const maxTicks = 14 + reelIndex * 6; // effet de cascade : chaque rouleau suivant s'arrête plus tard
    const interval = setInterval(() => {
      for (let row = 0; row < NUM_ROWS; row++) {
        setCellSymbol(reelIndex, row, weightedRandomSymbol());
      }
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        col.classList.remove('spinning');
        for (let row = 0; row < NUM_ROWS; row++) {
          // On pose la valeur EXACTE de la grille calculée — ce qui s'affiche = ce qui est évalué
          setCellSymbol(reelIndex, row, finalSymbols[row]);
          const cell = getCell(reelIndex, row);
          cell.classList.remove('win-cell', 'settling');
          void cell.offsetWidth; // force le reflow pour pouvoir rejouer l'animation
          cell.classList.add('settling');
        }
        resolve();
      }
    }, 55);
  });
}

async function spinAllReels(grid) {
  const promises = [];
  for (let i = 0; i < NUM_REELS; i++) promises.push(spinReel(i, grid[i]));
  await Promise.all(promises);
}

// Évalue les 5 lignes sur la grille EXACTE qui a été posée à l'écran
function evaluateLines(grid, betPerLine) {
  const results = [];

  PAYLINES.forEach((line, lineIndex) => {
    const seq = line.map((row, reel) => grid[reel][row]);
    const first = seq[0];

    let count = 1;
    while (count < seq.length && seq[count] === first) count++;

    if (count >= 3) {
      let mult = 0;
      if (count === 5) mult = PAYOUT_5[first] || 20;
      else if (count === 4) mult = PAYOUT_4;
      else if (count === 3) mult = PAYOUT_3;

      const win = betPerLine * mult;
      const cells = [];
      for (let reel = 0; reel < count; reel++) cells.push([reel, line[reel]]);

      results.push({ lineIndex, symbol: first, count, mult, win, cells });
    }
  });

  return results;
}

function drawWinningLines(winResults) {
  const svg = document.getElementById('paylines-svg');
  svg.innerHTML = '';
  if (winResults.length === 0) return;

  const colW = 100 / NUM_REELS;
  const rowH = 100 / NUM_ROWS;

  winResults.forEach((res) => {
    const color = LINE_COLORS[res.lineIndex % LINE_COLORS.length];
    const line = PAYLINES[res.lineIndex];
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
    path.style.filter = `drop-shadow(0 0 6px ${color})`;
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
      getCell(reel, row).classList.add('win-cell');
    });
  });
  return () => {
    touched.forEach((key) => {
      const [reel, row] = key.split('-').map(Number);
      getCell(reel, row).classList.remove('win-cell');
    });
  };
}

function spawnParticles(winResults) {
  const container = document.getElementById('win-particles');
  const reelsBox = document.getElementById('slot-reels-container');
  const rect = reelsBox.getBoundingClientRect();
  const emojis = ['✨', '💰', '⭐', '🪙'];

  const cellSet = new Set();
  winResults.forEach((res) => res.cells.forEach(([reel, row]) => cellSet.add(reel + '-' + row)));

  cellSet.forEach((key) => {
    const [reel, row] = key.split('-').map(Number);
    const cell = getCell(reel, row);
    const cellRect = cell.getBoundingClientRect();
    const originX = cellRect.left - rect.left + cellRect.width / 2;
    const originY = cellRect.top - rect.top + cellRect.height / 2;

    for (let p = 0; p < 5; p++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.left = originX + 'px';
      particle.style.top = originY + 'px';
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 50;
      particle.style.setProperty('--px', Math.cos(angle) * dist + 'px');
      particle.style.setProperty('--py', Math.sin(angle) * dist - 20 + 'px');
      particle.style.setProperty('--pr', (Math.random() * 360 - 180) + 'deg');
      particle.style.animationDelay = (Math.random() * 0.15) + 's';
      container.appendChild(particle);
      setTimeout(() => particle.remove(), 1300);
    }
  });
}

function flashScreen() {
  const flash = document.createElement('div');
  flash.className = 'jackpot-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1000);
}

function shakeCabinet() {
  const cabinet = document.getElementById('slot-cabinet');
  cabinet.classList.remove('shake');
  void cabinet.offsetWidth;
  cabinet.classList.add('shake');
  setTimeout(() => cabinet.classList.remove('shake'), 450);
}

function pushHistory(won) {
  const hist = document.getElementById('slot-history');
  const chip = document.createElement('div');
  chip.className = 'hist-chip ' + (won ? 'hist-win' : 'hist-lose');
  chip.textContent = won ? '+' : '−';
  hist.insertBefore(chip, hist.firstChild);
  while (hist.children.length > 18) hist.removeChild(hist.lastChild);
}

let pendingClearTimeout = null;

async function spinSlots() {
  if (slotSpinning) return;

  const betInput = document.getElementById('slot-bet');
  slotBet = Math.max(1, Math.min(1000000, parseInt(betInput.value, 10) || 10));
  const totalCost = slotBet * PAYLINES.length;

  if (window.balance < totalCost) {
    document.getElementById('slot-msg').innerHTML =
      '<span class="lose-msg">Solde insuffisant pour ' + PAYLINES.length + ' lignes (' + fmt(totalCost) + ') !</span>';
    return;
  }

  // Nettoyage de l'état visuel d'un éventuel spin précédent (au cas où le timeout n'a pas eu le temps de jouer)
  if (pendingClearTimeout) {
    clearTimeout(pendingClearTimeout);
    pendingClearTimeout = null;
  }
  for (let reel = 0; reel < NUM_REELS; reel++) {
    for (let row = 0; row < NUM_ROWS; row++) {
      getCell(reel, row).classList.remove('win-cell');
    }
  }
  document.getElementById('paylines-svg').innerHTML = '';
  document.getElementById('win-particles').innerHTML = '';

  slotSpinning = true;
  document.getElementById('spin-btn').disabled = true;
  document.getElementById('slot-msg').textContent = '';

  window.balance -= totalCost;
  window.updateAllBalances();

  const grid = generateGrid();
  await spinAllReels(grid);

  const winResults = evaluateLines(grid, slotBet);
  const totalWin = winResults.reduce((s, r) => s + r.win, 0);

  let clearHighlight = () => {};

  if (totalWin > 0) {
    drawWinningLines(winResults);
    clearHighlight = highlightWinningCells(winResults);
    spawnParticles(winResults);

    const bestMult = Math.max(...winResults.map((r) => r.mult));
    if (bestMult >= 150) {
      flashScreen();
      shakeCabinet();
    }

    const best = winResults.reduce((a, b) => (b.win > a.win ? b : a), winResults[0]);
    const label = winResults.length > 1
      ? `🎉 ${winResults.length} LIGNES GAGNANTES ! +${fmt(totalWin)}`
      : `🎉 ${best.symbol} × ${best.count} (×${best.mult}) ! +${fmt(totalWin)}`;

    document.getElementById('slot-msg').innerHTML = '<span class="win-msg">' + label + '</span>';
  } else {
    document.getElementById('slot-msg').innerHTML = '<span class="lose-msg">Pas de ligne gagnante. Réessayez !</span>';
  }

  window.balance += totalWin;
  window.updateAllBalances();
  if (window.saveBalance) window.saveBalance();
  pushHistory(totalWin > 0);

  pendingClearTimeout = setTimeout(() => {
    clearHighlight();
    document.getElementById('paylines-svg').innerHTML = '';
    pendingClearTimeout = null;
  }, 2200);

  slotSpinning = false;
  document.getElementById('spin-btn').disabled = false;
}

window.spinSlots = spinSlots;

export { spinSlots };