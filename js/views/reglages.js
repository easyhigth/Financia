// Vue Réglages : export/import JSON, statistiques de stockage, remise à zéro, aide à l'installation.
import * as db from '../db.js';
import { invalidate, currentStreak, cardStats, quizHistory } from '../store.js';
import { STATS } from '../data/index.js';
import { esc, pageHead, toast, dateFr, num } from '../ui.js';

export default async function reglages(route, { el, refresh, navigate }) {
  const [stats, streak, best, attempts, notes, bms, srs] = await Promise.all([
    cardStats(), currentStreak(), db.getMeta('bestStreak', 0), quizHistory(),
    db.getAll('notes'), db.getAll('bookmarks'), db.getAll('srs'),
  ]);

  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  el.innerHTML = `
    ${pageHead('Réglages', 'Sauvegarde locale, restauration et informations')}

    <div class="card">
      <h3>Vos données</h3>
      <div class="kv"><span class="k">Cartes vues</span><span class="v">${stats.seen} / ${stats.total}</span></div>
      <div class="kv"><span class="k">Cartes consolidées (≥ 21 j)</span><span class="v">${stats.mature}</span></div>
      <div class="kv"><span class="k">États de répétition enregistrés</span><span class="v">${srs.length}</span></div>
      <div class="kv"><span class="k">Quiz passés</span><span class="v">${attempts.length}</span></div>
      <div class="kv"><span class="k">Notes / marque-pages</span><span class="v">${notes.length} / ${bms.length}</span></div>
      <div class="kv"><span class="k">Série en cours / record</span><span class="v">${streak} j / ${best} j</span></div>
      <div class="kv"><span class="k">Dernier quiz</span><span class="v">${attempts.length ? dateFr(attempts[0].date) : '—'}</span></div>
    </div>

    <div class="sep"></div>
    <div class="card">
      <h3>Export / Import</h3>
      <p class="muted" style="font-size:.88rem">Toutes vos données (progression, scores, notes, marque-pages) restent sur cet appareil.
      Exportez régulièrement un fichier JSON pour les conserver ou les transférer.</p>
      <div class="tool-row">
        <button class="btn-primary" id="r-export">⬇ Exporter (JSON)</button>
        <button id="r-import">⬆ Importer</button>
      </div>
      <div class="checkline" style="margin-top:10px">
        <input type="checkbox" id="r-merge">
        <label for="r-merge">Fusionner avec les données existantes (sinon, remplacement complet)</label>
      </div>
      <input type="file" id="r-file" accept="application/json,.json" hidden>
    </div>

    <div class="sep"></div>
    <div class="card">
      <h3>Installer sur iPhone</h3>
      ${standalone
        ? `<p class="muted" style="margin:0">✓ L'application est déjà lancée en mode installé.</p>`
        : `<ol class="tight" style="padding-left:1.2rem">
             <li>Ouvrez cette page dans <strong>Safari</strong> (pas dans un autre navigateur).</li>
             <li>Touchez le bouton <strong>Partager</strong> (carré avec une flèche).</li>
             <li>Choisissez <strong>« Sur l'écran d'accueil »</strong>, puis <strong>Ajouter</strong>.</li>
             <li>Lancez Financia depuis l'icône : elle fonctionne alors hors ligne, en plein écran.</li>
           </ol>`}
    </div>

    <div class="sep"></div>
    <div class="card">
      <h3>Contenu embarqué</h3>
      <div class="kv"><span class="k">Modules</span><span class="v">${STATS.modules}</span></div>
      <div class="kv"><span class="k">Flashcards</span><span class="v">${STATS.cards}</span></div>
      <div class="kv"><span class="k">Questions de quiz</span><span class="v">${STATS.quiz}</span></div>
      <div class="kv"><span class="k">Fiches de glossaire</span><span class="v">${STATS.glossary}</span></div>
      <div class="kv"><span class="k">Questions d'entretien</span><span class="v">${STATS.interview}</span></div>
    </div>

    <div class="sep"></div>
    <div class="card">
      <h3>Zone sensible</h3>
      <p class="muted" style="font-size:.88rem">La remise à zéro efface définitivement progression, scores, notes et marque-pages de cet appareil. Exportez d'abord si besoin.</p>
      <button class="btn-danger btn-block" id="r-wipe">Effacer toutes mes données</button>
    </div>

    <div class="sep"></div>
    <div class="card tight"><small>Financia — application personnelle de révision, 100 % locale.
    Aucune donnée n'est transmise à un serveur, aucune analyse d'usage n'est collectée.</small></div>
  `;

  // ------------------------------------------------------------ Export
  el.querySelector('#r-export').addEventListener('click', async () => {
    const backup = await db.exportAll();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.href = url;
    a.download = `financia-sauvegarde-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('Sauvegarde exportée');
  });

  // ------------------------------------------------------------ Import
  const file = el.querySelector('#r-file');
  el.querySelector('#r-import').addEventListener('click', () => file.click());
  file.addEventListener('change', async () => {
    const f = file.files && file.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      const backup = JSON.parse(text);
      const merge = el.querySelector('#r-merge').checked;
      const n = Object.values(backup.data || {}).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
      if (!confirm(`Importer ${n} enregistrement(s) en mode ${merge ? 'fusion' : 'remplacement'} ?`)) return;
      await db.importAll(backup, merge ? 'merge' : 'replace');
      invalidate();
      toast('Sauvegarde restaurée');
      refresh();
    } catch (e) {
      alert(`Import impossible : ${e.message}`);
    } finally {
      file.value = '';
    }
  });

  // ------------------------------------------------------------ Remise à zéro
  el.querySelector('#r-wipe').addEventListener('click', async () => {
    if (!confirm('Effacer définitivement toutes vos données de révision sur cet appareil ?')) return;
    if (!confirm('Confirmation : cette action est irréversible. Continuer ?')) return;
    await db.wipe();
    invalidate();
    toast('Données effacées');
    navigate('#/dashboard');
  });
}
