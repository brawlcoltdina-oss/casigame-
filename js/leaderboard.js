// ============================================================
//  LEADERBOARD — À coller dans script.js (ou importer)
//
//  Dépendances attendues dans ton script principal :
//    - `db`          : instance Firestore (firebase/firestore)
//    - `currentUser` : objet { uid, displayName, email } de Firebase Auth
//    - `balance`     : variable globale avec le solde du joueur connecté
//
//  Collection Firestore utilisée : "users"
//  Chaque document doit avoir les champs :
//    - balance      (number)
//    - displayName  (string)
//    - email        (string)
// ============================================================

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Helpers ────────────────────────────────────────────────

/** Initiales pour l'avatar (ex: "Jean Dupont" → "JD") */
function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("") || "?";
}

/** Formate un solde en euros avec séparateur de milliers */
function formatBalance(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M €";
  if (n >= 1_000)     return (n / 1_000).toFixed(1)     + "k €";
  return n + " €";
}

// ── Chargement des données ──────────────────────────────────

async function loadLeaderboard() {
  const podiumEl = document.getElementById("lb-podium");
  const tableEl  = document.getElementById("lb-table");
  const btn      = document.getElementById("lb-refresh-btn");

  // Indicateur de chargement
  podiumEl.innerHTML = "";
  tableEl.innerHTML  = `
    <div class="lb-loading">
      <div class="loader"></div>
      CHARGEMENT...
    </div>`;
  if (btn) btn.disabled = true;

  try {
    // Récupère les 50 joueurs les plus riches
    const q = query(
      collection(window._db, "users"),
      orderBy("balance", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);

    const players = [];
    snapshot.forEach(doc => {
      const d = doc.data();
      players.push({
        uid:         doc.id,
        name:        d.displayName || d.email?.split("@")[0] || "Joueur",
        balance:     typeof d.balance === "number" ? d.balance : 0,
        isCurrentUser: window._auth?.currentUser && doc.id === window._auth.currentUser.uid
      });
    });

    if (players.length === 0) {
      podiumEl.innerHTML = "";
      tableEl.innerHTML  = `<div class="lb-empty">Aucun joueur enregistré pour l'instant.</div>`;
      return;
    }

    renderPodium(podiumEl, players.slice(0, 3));
    renderTable(tableEl, players);

  } catch (err) {
    console.error("Leaderboard error:", err);
    tableEl.innerHTML = `<div class="lb-empty">Erreur lors du chargement du classement.</div>`;
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── Rendu Podium (top 3) ───────────────────────────────────

function renderPodium(container, top3) {
  // Ordre d'affichage podium : 2e — 1er — 3e
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const placeClasses = top3[1] ? ["place-2", "place-1", "place-3"] : ["place-1", "place-2", "place-3"];
  const medals = { "place-1": "👑", "place-2": "", "place-3": "" };
  const rankLabels = { "place-1": "1", "place-2": "2", "place-3": "3" };

  container.innerHTML = order.map((player, i) => {
    const cls    = placeClasses[i];
    const initials = getInitials(player.name);
    const crown  = cls === "place-1" ? `<span class="podium-crown">👑</span>` : "";

    return `
      <div class="podium-slot ${cls}">
        <div class="podium-avatar">
          ${crown}${initials}
        </div>
        <div class="podium-name">${escapeHtml(player.name)}${player.isCurrentUser ? " (vous)" : ""}</div>
        <div class="podium-amount">${formatBalance(player.balance)}</div>
        <div class="podium-block">${rankLabels[cls]}</div>
      </div>`;
  }).join("");
}

// ── Rendu Tableau complet ──────────────────────────────────

function renderTable(container, players) {
  const rankIcon = (r) => {
    if (r === 1) return `<span class="lb-rank rank-1">🥇</span>`;
    if (r === 2) return `<span class="lb-rank rank-2">🥈</span>`;
    if (r === 3) return `<span class="lb-rank rank-3">🥉</span>`;
    return `<span class="lb-rank rank-other">#${r}</span>`;
  };

  const rows = players.map((p, i) => {
    const rank     = i + 1;
    const initials = getInitials(p.name);
    const youTag   = p.isCurrentUser
      ? `<span class="lb-you-tag">(vous)</span>`
      : "";
    const delay    = Math.min(i * 40, 800);

    return `
      <div class="lb-row${p.isCurrentUser ? " current-user" : ""}"
           style="animation-delay:${delay}ms">
        ${rankIcon(rank)}
        <div class="lb-player">
          <div class="lb-avatar">${initials}</div>
          <span class="lb-player-name">${escapeHtml(p.name)}${youTag}</span>
        </div>
        <div class="lb-balance">${formatBalance(p.balance)}</div>
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="lb-table-header">
      <span>RANG</span>
      <span>JOUEUR</span>
      <span>SOLDE</span>
    </div>
    ${rows}`;
}

// ── Sécurité XSS ──────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}




export { loadLeaderboard };