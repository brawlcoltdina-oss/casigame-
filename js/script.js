import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { loadLeaderboard } from './leaderboard.js';
import './slots-engine.js';

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

// ===== JACKPOT GLOBAL NOTIFICATIONS =====
const jackpotStyle = document.createElement('style');
jackpotStyle.textContent = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(jackpotStyle);

let _lastJackpotId = null;

function listenJackpots() {
  const q = query(collection(db, 'jackpots'), orderBy('at', 'desc'), limit(1));
  let firstLoad = true;
  onSnapshot(q, (snap) => {
    if (firstLoad) {
      firstLoad = false;
      snap.docs.forEach(d => { _lastJackpotId = d.id; });
      return;
    }
    snap.docChanges().forEach(change => {
      if (change.type === 'added') {
        const d = change.doc.data();
        const docId = change.doc.id;
        if (docId === _lastJackpotId) return;
        _lastJackpotId = docId;
        console.log('[JACKPOT] Received:', d);
        if (d.uid === auth.currentUser?.uid) return;
        showJackpotBanner(d.player, d.symbol, d.amount);
      }
    });
  });
}

function showJackpotBanner(player, symbol, amount) {
  const old = document.getElementById('jackpot-banner');
  if (old) old.remove();

  const banner = document.createElement('div');
  banner.id = 'jackpot-banner';
  banner.innerHTML = `
    <div style="font-size:2rem">${symbol === '7️⃣' ? '7️⃣7️⃣7️⃣' : '💎💎💎'}</div>
    <div style="font-family:'Cinzel',serif;font-size:1rem;color:var(--gold);letter-spacing:0.15em">🎉 JACKPOT !</div>
    <div style="font-family:'Cinzel',serif;font-size:0.8rem;color:var(--text);margin-top:0.3rem">
      <strong style="color:var(--gold-light)">${player}</strong> vient de gagner
    </div>
    <div style="font-family:'Cinzel',serif;font-size:1.3rem;color:#4ade80;margin-top:0.2rem;font-weight:700">
      +${amount.toLocaleString('fr-FR')} €
    </div>
  `;
  Object.assign(banner.style, {
    position: 'fixed',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #1a0a00, #2a1500)',
    border: '2px solid var(--gold)',
    borderRadius: '12px',
    padding: '1.2rem 2rem',
    textAlign: 'center',
    zIndex: '9999',
    boxShadow: '0 0 40px rgba(212,175,55,0.5)',
    animation: 'fadeInDown 0.4s ease',
    minWidth: '280px',
  });

  document.body.appendChild(banner);
  setTimeout(() => {
    banner.style.transition = 'opacity 0.5s';
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 500);
  }, 6000);
}

// ===== AUTH =====
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
    const initials = name.substring(0, 2).toUpperCase();
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-display-name').textContent = name;
    document.getElementById('user-email-display').textContent = user.email;
    document.getElementById('user-bar').classList.add('visible');
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('lobby').classList.add('visible');
    listenJackpots();
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
  if (!name) { errEl.textContent = 'Entrez votre pseudo.'; errEl.style.display = 'block'; return; }
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
  ['slots', 'roul', 'bj', 'dice'].forEach(id => {
    const el = document.getElementById(id + '-balance');
    if (el) el.textContent = fmt(balance);
  });
}
window.updateAllBalances = updateAllBalances;

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

// ===== EXPOSE GLOBAL FUNCTIONS =====
// Note : spinSlots est défini et exposé par slots-engine.js (import ci-dessus)
window.openGame = openGame;
window.goLobby = goLobby;
window.switchTab = switchTab;
window.selectBjChip = selectBjChip;
window.dealBlackjack = dealBlackjack;
window.bjHit = bjHit;
window.bjStand = bjStand;
window.bjDouble = bjDouble;
window.loadLeaderboard = loadLeaderboard;