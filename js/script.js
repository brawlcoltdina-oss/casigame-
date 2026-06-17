import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { loadLeaderboard } from './leaderboard.js';

const firebaseConfig = {
  apiKey: "AIzaSyDaimPB4wFPVasidcMqyDlopDCwhq1C5Xo",
  authDomain: "casigame-c8040.firebaseapp.com",
  projectId: "casigame-c8040",
  storageBucket: "casigame-c8040.firebasestorage.app",
  messagingSenderId: "1026611910126",
  appId: "1:1026611910126:web:339bf944eba21b891b6aff",
  measurementId: "G-YH7QZK1XQJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

window._auth = auth;
window._db = db;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('loading-screen').style.display = 'flex';
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        balance: 1000,
        createdAt: Date.now()
      });
      window.balance = 1000;
    } else {
      window.balance = snap.data().balance;
    }
    const name = user.displayName || user.email.split('@')[0];
    const initials = name.substring(0,2).toUpperCase();
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-display-name').textContent = name;
    document.getElementById('user-email-display').textContent = user.email;
    document.getElementById('user-bar').classList.add('visible');
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('lobby').classList.add('visible');
    window.updateAllBalances();
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('lobby').classList.remove('visible');
    document.getElementById('user-bar').classList.remove('visible');
  }
});

window.saveBalance = async () => {
  const user = auth.currentUser;
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, { balance: window.balance });
  const ind = document.getElementById('save-indicator');
  ind.classList.add('show');
  setTimeout(() => ind.classList.remove('show'), 2000);
};

window.loginWithEmail = async () => {
  const email = document.getElementById('login-email').value.trim();
  const pwd = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'CONNEXION...';
  try {
    await signInWithEmailAndPassword(auth, email, pwd);
  } catch(e) {
    errEl.textContent = translateError(e.code);
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'ENTRER AU CASINO';
  }
};

window.registerWithEmail = async () => {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const pwd = document.getElementById('register-password').value;
  const errEl = document.getElementById('register-error');
  const sucEl = document.getElementById('register-success');
  errEl.style.display = 'none';
  sucEl.style.display = 'none';
  if (!name) { errEl.textContent = 'Entrez votre pseudo.'; errEl.style.display='block'; return; }
  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.textContent = 'CRÉATION...';
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pwd);
    await updateProfile(cred.user, { displayName: name });
  } catch(e) {
    errEl.textContent = translateError(e.code);
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'CRÉER MON COMPTE';
  }
};

window.loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch(e) { console.error(e); }
};

window.logout = async () => {
  await window.saveBalance();
  await signOut(auth);
};

function translateError(code) {
  const map = {
    'auth/invalid-email': 'Email invalide.',
    'auth/user-not-found': 'Aucun compte avec cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/weak-password': 'Mot de passe trop court (min. 6 caractères).',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
  };
  return map[code] || 'Erreur : ' + code;
}

function switchTab(tab) {
  document.getElementById('form-login').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'flex' : 'none';
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

window.balance = 0;
function fmt(n) { return n.toLocaleString('fr-FR') + ' €'; }

function updateAllBalances() {
  document.getElementById('lobby-balance').textContent = fmt(balance);
  ['slots','roul','bj','dice'].forEach(id => {
    const el = document.getElementById(id + '-balance');
    if (el) el.textContent = fmt(balance);
  });
}
window.updateAllBalances = updateAllBalances;

function saveAndUpdate() {
  updateAllBalances();
  if (window.saveBalance) window.saveBalance();
}

function openGame(game) {
  document.getElementById('lobby').classList.remove('visible');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + game).classList.add('active');
  updateAllBalances();
  if (game === 'leaderboard') loadLeaderboard();
}

function goLobby() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('lobby').classList.add('visible');
  updateAllBalances();
}

// ===== SLOT MACHINE =====
const symbols = ['7️⃣','💎','⭐','🔔','🍇','🍒','🍋','🍊','🍉','🍀'];
const payouts = { '7️⃣': 500000, '💎': 1500, '⭐': 500, '🔔': 200, '🍇': 100, '🍒': 75 };
let slotBet = 10;
let slotSpinning = false;

function changeBet(delta) {
  slotBet = Math.max(5, Math.min(1000000, slotBet + delta));
  document.getElementById('slot-bet').textContent = slotBet;
}
function changeBet2(delta) {
  slotBet = Math.max(10000, Math.min(1000000, slotBet + delta));
  document.getElementById('slot-bet').textContent = slotBet;
}


function spinSlots() {
  slotBet = Math.max(5, Math.min(10000000000000000, parseInt(document.getElementById('slot-bet').value) || 10));
  if (slotSpinning || balance < slotBet) {
    document.getElementById('slot-msg').innerHTML = '<span class="lose-msg">Solde insuffisant !</span>';
    return;
  }
  slotSpinning = true;
  balance -= slotBet;
  updateAllBalances();
  document.getElementById('spin-btn').disabled = true;
  document.getElementById('slot-msg').textContent = '';
  const reels = [0,1,2];
  reels.forEach(i => document.getElementById('reel' + i).classList.add('spinning'));
  let ticks = 0;
  const interval = setInterval(() => {
    reels.forEach(i => {
      document.getElementById('sym' + i).textContent = symbols[Math.floor(Math.random() * symbols.length)];
    });
    ticks++;
    if (ticks > 25) {
      clearInterval(interval);
      const final = reels.map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      reels.forEach(i => {
        document.getElementById('reel' + i).classList.remove('spinning');
        document.getElementById('sym' + i).textContent = final[i];
      });
      evaluateSlots(final);
    }
  }, 60);
}

function evaluateSlots(s) {
  let win = 0, msg = '';
  let reels_win = [false,false,false];
  if (s[0] === s[1] && s[1] === s[2]) {
    const mult = payouts[s[0]] || 5;
    win = slotBet * mult;
    msg = '<span class="win-msg">🎉 JACKPOT ! × ' + mult + ' = +' + fmt(win) + '</span>';
    reels_win = [true,true,true];
  } else if (s[0] === s[1] || s[1] === s[2] || s[0] === s[2]) {
    win = Math.floor(slotBet * 2);
    msg = '<span class="win-msg">✨ DEUX IDENTIQUES ! +' + fmt(win) + '</span>';
    if (s[0]===s[1]) { reels_win[0]=reels_win[1]=true; }
    else if (s[1]===s[2]) { reels_win[1]=reels_win[2]=true; }
    else { reels_win[0]=reels_win[2]=true; }
  } else {
    msg = '<span class="lose-msg">Pas de chance. Réessayez !</span>';
  }
  [0,1,2].forEach(i => {
    if (reels_win[i]) document.getElementById('reel'+i).classList.add('win');
    setTimeout(() => document.getElementById('reel'+i).classList.remove('win'), 1500);
  });
  balance += win;
  saveAndUpdate();
  document.getElementById('slot-msg').innerHTML = msg;
  const hist = document.getElementById('slot-history');
  const chip = document.createElement('div');
  chip.className = 'hist-chip ' + (win > 0 ? 'hist-win' : 'hist-lose');
  chip.textContent = win > 0 ? '+' : '−';
  hist.insertBefore(chip, hist.firstChild);
  if (hist.children.length > 15) hist.removeChild(hist.lastChild);
  setTimeout(() => {
    slotSpinning = false;
    document.getElementById('spin-btn').disabled = false;
  }, 500);
}

// ===== BLACKJACK =====
const suits = ['♠','♥','♦','♣'];
const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let bjBet = 0, bjChip = 10, playerHand = [], dealerHand = [], bjPhase = 'bet';

function buildDeck() {
  let deck = [];
  for (let s of suits) for (let v of values) deck.push({suit:s,value:v});
  for (let i = deck.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [deck[i],deck[j]] = [deck[j],deck[i]];
  }
  return deck;
}
let deck = buildDeck();

function selectBjChip(val) {
  bjChip = val;
  document.querySelectorAll('#bj-chips .chip').forEach(c => c.classList.remove('active'));
  const idx = [5,10,25,50,100].indexOf(val);
  if (idx >= 0) document.querySelectorAll('#bj-chips .chip')[idx].classList.add('active');
  if (bjPhase === 'bet') {
    bjBet += val;
    if (bjBet > balance) bjBet = balance;
    document.getElementById('bj-bet-display').textContent = fmt(bjBet);
  }
}

function cardValue(card) {
  if (['J','Q','K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}

function handScore(hand) {
  let score = hand.reduce((s,c) => s + cardValue(c), 0);
  let aces = hand.filter(c => c.value==='A').length;
  while (score > 21 && aces > 0) { score -= 10; aces--; }
  return score;
}

function renderCard(card, hidden) {
  const el = document.createElement('div');
  const isRed = ['♥','♦'].includes(card.suit);
  el.className = 'card' + (hidden ? ' hidden' : (isRed ? ' red-card' : ''));
  if (!hidden) {
    el.innerHTML = '<span style="font-size:0.7rem;position:absolute;top:4px;left:5px;">'+card.value+card.suit+'</span><span style="font-size:1.4rem">'+card.suit+'</span><span style="font-size:0.7rem;position:absolute;bottom:4px;right:5px;transform:rotate(180deg)">'+card.value+card.suit+'</span>';
  }
  return el;
}

function renderHands(hideDealer) {
  const ph = document.getElementById('player-hand');
  const dh = document.getElementById('dealer-hand');
  ph.innerHTML = ''; dh.innerHTML = '';
  playerHand.forEach(c => ph.appendChild(renderCard(c, false)));
  dealerHand.forEach((c,i) => dh.appendChild(renderCard(c, hideDealer && i===1)));
  document.getElementById('player-score').textContent = 'Score: ' + handScore(playerHand);
  document.getElementById('dealer-score').textContent = hideDealer ? 'Score: ?' : 'Score: ' + handScore(dealerHand);
}

function dealBlackjack() {
  if (bjBet <= 0) { document.getElementById('bj-msg').textContent = 'Choisissez une mise !'; return; }
  if (bjBet > balance) { document.getElementById('bj-msg').textContent = 'Solde insuffisant !'; return; }
  if (deck.length < 15) deck = buildDeck();
  balance -= bjBet;
  updateAllBalances();
  bjPhase = 'play';
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  renderHands(true);
  document.getElementById('bj-deal-btn').disabled = true;
  document.getElementById('bj-hit-btn').disabled = false;
  document.getElementById('bj-stand-btn').disabled = false;
  document.getElementById('bj-double-btn').disabled = false;
  if (handScore(playerHand) === 21) { bjStand(); } else {
    document.getElementById('bj-msg').textContent = 'Tirez (Hit) ou restez (Stand) ?';
  }
}

function bjHit() {
  playerHand.push(deck.pop());
  renderHands(true);
  if (handScore(playerHand) > 21) { renderHands(false); endBj('bust'); }
  else if (handScore(playerHand) === 21) { bjStand(); }
  document.getElementById('bj-double-btn').disabled = true;
}

function bjStand() {
  document.getElementById('bj-hit-btn').disabled = true;
  document.getElementById('bj-stand-btn').disabled = true;
  document.getElementById('bj-double-btn').disabled = true;
  while (handScore(dealerHand) < 17) dealerHand.push(deck.pop());
  renderHands(false);
  const ps = handScore(playerHand), ds = handScore(dealerHand);
  if (ps===21 && playerHand.length===2) endBj('blackjack');
  else if (ds>21) endBj('dealerbust');
  else if (ps>ds) endBj('win');
  else if (ps===ds) endBj('push');
  else endBj('lose');
}

function bjDouble() {
  if (balance < bjBet) { document.getElementById('bj-msg').textContent = 'Pas assez pour doubler !'; return; }
  balance -= bjBet;
  bjBet *= 2;
  updateAllBalances();
  document.getElementById('bj-bet-display').textContent = fmt(bjBet);
  playerHand.push(deck.pop());
  renderHands(true);
  if (handScore(playerHand) > 21) { renderHands(false); endBj('bust'); } else bjStand();
}

function endBj(outcome) {
  bjPhase = 'bet';
  const saved = bjBet;
  bjBet = 0;
  document.getElementById('bj-bet-display').textContent = '0€';
  document.getElementById('bj-deal-btn').disabled = false;
  document.getElementById('bj-hit-btn').disabled = true;
  document.getElementById('bj-stand-btn').disabled = true;
  document.getElementById('bj-double-btn').disabled = true;
  const msgs = {
    blackjack: ['🎉 BLACKJACK ! Vous gagnez ×20 !', 20],
    win: ['✨ Vous gagnez !', 2],
    dealerbust: ['🎉 Le croupier dépasse 21 !', 25],
    push: ['🤝 Égalité — mise remboursée', 1],
    bust: ['💥 Dépassé 21 !', 0],
    lose: ['Le croupier gagne.', 0]
  };
  const [msg, mult] = msgs[outcome];
  const win = Math.floor(saved * mult);
  balance += win;
  saveAndUpdate();
  const color = mult>=2 ? 'var(--gold)' : mult===1 ? 'var(--text-muted)' : 'var(--red)';
  document.getElementById('bj-msg').innerHTML = '<span style="color:'+color+'">'+msg+'</span>';
  setTimeout(() => {
    if (bjPhase === 'bet') {
      document.getElementById('player-hand').innerHTML = '';
      document.getElementById('dealer-hand').innerHTML = '';
      document.getElementById('player-score').textContent = '';
      document.getElementById('dealer-score').textContent = '';
      document.getElementById('bj-msg').textContent = 'Placez votre mise et distribuez !';
    }
  }, 3000);
}



// ===== EXPOSE GLOBAL FUNCTIONS =====
window.openGame = openGame;
window.goLobby = goLobby;
window.switchTab = switchTab;
window.changeBet = changeBet;
window.changeBet2 = changeBet2;
window.spinSlots = spinSlots;
window.selectChip = selectChip;
window.selectRoulBet = selectRoulBet;
window.clearRoulBets = clearRoulBets;
window.spinRoulette = spinRoulette;
window.selectBjChip = selectBjChip;
window.dealBlackjack = dealBlackjack;
window.bjHit = bjHit;
window.bjStand = bjStand;
window.bjDouble = bjDouble;
window.selectDiceBet = selectDiceBet;
window.selectDiceChip = selectDiceChip;
window.rollDice = rollDice;
window.loadLeaderboard = loadLeaderboard;

// ===== INIT =====
buildWheel();
buildNumbersGrid();
renderDie(document.getElementById('die1'), 1);
renderDie(document.getElementById('die2'), 6);
selectChip(10);
selectDiceBet('pass');