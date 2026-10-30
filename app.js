/**
 * Celebration Planner — app.js  v2 (GitHub Pages / static build)
 * ─────────────────────────────────────────────────────────────
 * No backend required. AI calls go directly to the Gemini API
 * (free public tier) from the browser.
 *
 * Rules applied: B1 (clean code), B2 (AI guardrails),
 *                B3 (accessibility), B4 (definition of done).
 *
 * Money: stored as plain integers (minor-unit-free for INR/USD/etc.
 *        since we deal in whole-unit budgets from user input).
 * Dates: stored as ISO-8601 strings; displayed in the user's locale.
 * XSS:   every user-supplied string goes through escape() before
 *        being written into innerHTML.
 */

/* ═══════════════════════════════════════════════════════════
   1. CONSTANTS & DATA
   ═══════════════════════════════════════════════════════════ */

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

// ── Budget splits — percentages in each array must sum to 100 ──
const BUDGET_PLANS = {
  wedding: [
    { cat: 'Venue & Décor',         pct: 30, icon: '🏛' },
    { cat: 'Catering & Bar',        pct: 25, icon: '🍽' },
    { cat: 'Photography & Video',   pct: 12, icon: '📸' },
    { cat: 'Music & Entertainment', pct:  8, icon: '🎶' },
    { cat: 'Attire & Beauty',       pct:  8, icon: '👗' },
    { cat: 'Invitations & Gifts',   pct:  5, icon: '💌' },
    { cat: 'Flowers & Floral',      pct:  6, icon: '🌸' },
    { cat: 'Transport & Stays',     pct:  4, icon: '🚗' },
    { cat: 'Contingency',           pct:  2, icon: '🛡' },
  ],
  birthday: [
    { cat: 'Venue',          pct: 28, icon: '🏠' },
    { cat: 'Food & Cake',    pct: 30, icon: '🎂' },
    { cat: 'Decorations',    pct: 15, icon: '🎈' },
    { cat: 'Entertainment',  pct: 12, icon: '🎠' },
    { cat: 'Return Gifts',   pct:  8, icon: '🎁' },
    { cat: 'Photography',    pct:  5, icon: '📸' },
    { cat: 'Contingency',    pct:  2, icon: '🛡' },
  ],
  community: [
    { cat: 'Venue & Permits',      pct: 25, icon: '🏟' },
    { cat: 'Food & Refreshments',  pct: 30, icon: '🍱' },
    { cat: 'Stage & Sound',        pct: 15, icon: '🎤' },
    { cat: 'Decorations',          pct: 10, icon: '🎊' },
    { cat: 'Publicity & Comms',    pct:  8, icon: '📣' },
    { cat: 'Logistics & Safety',   pct:  8, icon: '🦺' },
    { cat: 'Contingency',          pct:  4, icon: '🛡' },
  ],
};

// ── Timeline tasks: wb = weeks before event date ──
const TIMELINE_PLANS = {
  wedding: [
    { wb: 52, task: 'Set budget and guest list' },
    { wb: 48, task: 'Book venue' },
    { wb: 40, task: 'Hire caterer and photographer' },
    { wb: 36, task: 'Choose and order attire' },
    { wb: 28, task: 'Book music and entertainment' },
    { wb: 20, task: 'Send save-the-dates' },
    { wb: 16, task: 'Finalise menu and floral' },
    { wb: 12, task: 'Send formal invitations' },
    { wb:  8, task: 'Confirm all vendors' },
    { wb:  4, task: 'Final guest count to caterer' },
    { wb:  2, task: 'Dry run of ceremony and speeches' },
    { wb:  1, task: 'Prepare emergency kit (pins, medicine, cash)' },
    { wb:  0, task: '🎉 Wedding day — enjoy every moment!' },
  ],
  birthday: [
    { wb:  8, task: 'Set budget and guest list' },
    { wb:  6, task: 'Book venue or confirm home space' },
    { wb:  5, task: 'Send invitations (digital or physical)' },
    { wb:  4, task: 'Order cake and food' },
    { wb:  3, task: 'Buy decorations and return gifts' },
    { wb:  2, task: 'Confirm RSVPs and headcount' },
    { wb:  1, task: 'Set up decorations and prep activities' },
    { wb:  0, task: '🎂 Birthday — have a blast!' },
  ],
  community: [
    { wb: 16, task: 'Form organising committee and assign roles' },
    { wb: 14, task: 'Book venue; apply for permits' },
    { wb: 12, task: 'Confirm budget and sponsors' },
    { wb: 10, task: 'Book stage, sound and AV equipment' },
    { wb:  8, task: 'Recruit and brief volunteers' },
    { wb:  6, task: 'Announce event; publish publicity material' },
    { wb:  4, task: 'Confirm food stalls and refreshments' },
    { wb:  2, task: 'Confirm programme and performers' },
    { wb:  1, task: 'Site walkthrough; brief security and first-aid' },
    { wb:  0, task: '🏘️ Event day — stay calm and delegate!' },
  ],
};

const VENDOR_PLANS = {
  wedding: [
    { icon: '🏛', name: 'Venue',        ask: 'What is included — chairs, linen, kitchen access?' },
    { icon: '🍽', name: 'Caterer',      ask: 'Do they provide waitstaff? What is the per-plate cost?' },
    { icon: '📸', name: 'Photographer', ask: 'How many edited photos? When are they delivered?' },
    { icon: '🎶', name: 'DJ or Band',   ask: 'Can they take requests? Do they have backup equipment?' },
    { icon: '🌸', name: 'Florist',      ask: 'Do they set up and clear up on the day?' },
    { icon: '🎂', name: 'Cake',         ask: 'Can they deliver to the venue? Tasting session?' },
    { icon: '🚗', name: 'Transport',    ask: 'Pickup and drop-off included? Decorated vehicle?' },
    { icon: '💌', name: 'Stationery',   ask: 'What is the turnaround for printed invites?' },
  ],
  birthday: [
    { icon: '🏠', name: 'Venue',         ask: 'How many hours included? Is there a kitchen?' },
    { icon: '🎂', name: 'Cake',          ask: 'Custom design available? Allergen info?' },
    { icon: '🎈', name: 'Decorator',     ask: 'Theme decorations included? Setup time?' },
    { icon: '🎠', name: 'Entertainment', ask: 'What activities are included? Age range?' },
    { icon: '📸', name: 'Photographer',  ask: 'How many hours? Digital prints included?' },
  ],
  community: [
    { icon: '🏟', name: 'Venue',      ask: 'Parking, restrooms and power supply available?' },
    { icon: '🎤', name: 'Stage & Sound', ask: 'Is a sound engineer included?' },
    { icon: '🍱', name: 'Catering',   ask: 'Can they handle dietary restrictions and bulk orders?' },
    { icon: '🦺', name: 'Security',   ask: 'First-aid trained? CCTV or crowd management plan?' },
    { icon: '📣', name: 'Printing',   ask: 'Banners, flyers — turnaround time?' },
  ],
};

const STATUS_OPTIONS = ['To find', 'Contacted', 'Booked', 'Paid'];

// Gemini free-tier endpoint (flash model — fast and free)
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/* ═══════════════════════════════════════════════════════════
   2. STATE
   ═══════════════════════════════════════════════════════════ */

let state = loadState();

// ── API key (stored only in sessionStorage, never in the repo) ──
let _apiKey = sessionStorage.getItem('cp_gemini_key') || '';

function getApiKey() { return _apiKey; }

function promptForApiKey() {
  const k = prompt(
    '🔑 Paste your free Gemini API key to enable AI features.\n\n' +
    'Get one free at: https://aistudio.google.com/app/apikey\n\n' +
    '(It is stored only in this browser tab — never sent to any server except Google.)'
  );
  if (k && k.trim()) {
    _apiKey = k.trim();
    sessionStorage.setItem('cp_gemini_key', _apiKey);
    return _apiKey;
  }
  return '';
}

function freshState(form) {
  const type     = form.eventType.value;
  const budget   = parseInt(form.budget.value, 10);
  const currency = form.currency.value;
  const guests   = parseInt(form.guestCount.value, 10);
  const date     = form.eventDate.value;
  const name     = form.eventName.value.trim();
  const notes    = form.notes.value.trim();

  const budgetItems = BUDGET_PLANS[type].map(b => ({ ...b, spent: 0 }));

  const eventDate = new Date(date);
  const tasks = TIMELINE_PLANS[type].map(t => ({
    ...t,
    dueDate: offsetDate(eventDate, -t.wb * 7),
    done: false,
  }));

  const vendors = VENDOR_PLANS[type].map(v => ({ ...v, status: 'To find' }));

  return { type, name, date, guests, budget, currency, notes,
           budgetItems, tasks, vendors, ideas: [], chatHistory: [] };
}

function loadState() {
  try {
    const raw = localStorage.getItem('celebration_planner_v3');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState() {
  try {
    localStorage.setItem('celebration_planner_v3', JSON.stringify(state));
  } catch { /* quota — silent fail */ }
}

/* ═══════════════════════════════════════════════════════════
   3. UTILITIES
   ═══════════════════════════════════════════════════════════ */

function offsetDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmt(amount, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  return sym + Math.round(amount).toLocaleString('en-IN');
}

/** Sanitise user text before innerHTML insertion (XSS guard, rule B1) */
function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function daysToGo(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((new Date(dateStr) - today) / 86_400_000);
}

function totalPct() {
  return state.budgetItems.reduce((s, b) => s + Number(b.pct), 0);
}

/* ═══════════════════════════════════════════════════════════
   4. RENDER
   ═══════════════════════════════════════════════════════════ */

function renderAll() {
  renderStats(); renderBudget(); renderTimeline();
  renderVendors(); renderIdeas(); renderChat();
}

// ── Stats ──
function renderStats() {
  const days = daysToGo(state.date);
  el('statDays').textContent   = days >= 0 ? days : `${Math.abs(days)} ago`;
  el('statBudget').textContent = fmt(state.budget, state.currency);
  const spent = state.budgetItems.reduce((s, b) => s + Number(b.spent), 0);
  el('statSpent').textContent  = fmt(spent, state.currency);
  const done = state.tasks.filter(t => t.done).length;
  el('statTasks').textContent  = `${done} / ${state.tasks.length}`;
  el('eventTitle').textContent = escape(state.name) +
    ` · ${state.type.charAt(0).toUpperCase() + state.type.slice(1)}`;
}

// ── Budget ──
function renderBudget() {
  const tbody = el('budgetBody');
  const tfoot = el('budgetFoot');
  tbody.innerHTML = '';

  state.budgetItems.forEach((item, i) => {
    const planned = Math.round(state.budget * item.pct / 100);
    const spent   = Number(item.spent) || 0;
    const rem     = planned - spent;
    const fill    = planned > 0 ? Math.min(100, Math.round(spent / planned * 100)) : 0;
    const over    = spent > planned;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.icon} ${escape(item.cat)}</td>
      <td>
        <input class="pct-input" type="number" min="0" max="100"
               value="${item.pct}" data-idx="${i}"
               aria-label="${escape(item.cat)} allocation percent" />%
      </td>
      <td>${fmt(planned, state.currency)}</td>
      <td>
        <input class="spend-input" type="number" min="0"
               value="${spent || ''}" placeholder="0" data-idx="${i}"
               aria-label="${escape(item.cat)} amount spent" />
      </td>
      <td class="${over ? 'tag-over' : ''}">
        ${over ? `Over by ${fmt(Math.abs(rem), state.currency)}` : fmt(rem, state.currency)}
      </td>
      <td>
        <div class="progress-bar" role="progressbar"
             aria-valuenow="${fill}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill${over ? ' over' : ''}" style="width:${fill}%"></div>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  const totalSpent = state.budgetItems.reduce((s,b) => s + Number(b.spent), 0);
  const tp = totalPct();
  tfoot.innerHTML = `<tr>
    <td colspan="2">Total (${tp}%${tp!==100?' ⚠':''}) </td>
    <td>${fmt(state.budget, state.currency)}</td>
    <td>${fmt(totalSpent, state.currency)}</td>
    <td>${fmt(state.budget - totalSpent, state.currency)}</td>
    <td></td></tr>`;

  tbody.querySelectorAll('.pct-input').forEach(inp => inp.addEventListener('change', e => {
    state.budgetItems[+e.target.dataset.idx].pct =
      Math.max(0, Math.min(100, +e.target.value));
    saveState(); renderBudget(); renderStats();
  }));
  tbody.querySelectorAll('.spend-input').forEach(inp => inp.addEventListener('change', e => {
    state.budgetItems[+e.target.dataset.idx].spent = Math.max(0, +e.target.value);
    saveState(); renderBudget(); renderStats();
  }));
}

// ── Timeline ──
function renderTimeline() {
  const ul = el('timelineList');
  ul.innerHTML = '';
  const today = new Date(); today.setHours(0,0,0,0);

  state.tasks.forEach((task, i) => {
    const due = new Date(task.dueDate);
    const overdue = !task.done && due < today;
    const li = document.createElement('li');
    li.className = `timeline-item${task.done ? ' done' : ''}`;
    li.innerHTML = `
      <input type="checkbox" id="task-${i}" ${task.done ? 'checked' : ''}
             aria-label="${escape(task.task)}" />
      <div class="timeline-info">
        <div class="timeline-task">
          ${escape(task.task)}
          ${overdue ? '<span class="tag-overdue" aria-label="Overdue">Overdue</span>' : ''}
        </div>
        <div class="timeline-date">
          ${due.toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
        </div>
      </div>`;
    li.querySelector('input').addEventListener('change', e => {
      state.tasks[i].done = e.target.checked;
      saveState(); renderTimeline(); renderStats();
    });
    ul.appendChild(li);
  });
}

// ── Vendors ──
function renderVendors() {
  const ul = el('vendorList');
  ul.innerHTML = '';
  state.vendors.forEach((v, i) => {
    const li = document.createElement('li');
    li.className = 'vendor-item';
    const opts = STATUS_OPTIONS.map(s =>
      `<option value="${s}" ${v.status===s?'selected':''}>${s}</option>`
    ).join('');
    li.innerHTML = `
      <div class="vendor-icon" aria-hidden="true">${v.icon}</div>
      <div class="vendor-info">
        <div class="vendor-name">${escape(v.name)}</div>
        <div class="vendor-ask">❓ ${escape(v.ask)}</div>
      </div>
      <select class="status-select ${v.status==='Booked'||v.status==='Paid'?'status-booked':''}"
              aria-label="${escape(v.name)} status">${opts}</select>`;
    li.querySelector('select').addEventListener('change', e => {
      state.vendors[i].status = e.target.value;
      saveState(); renderVendors();
    });
    ul.appendChild(li);
  });
}

// ── Ideas ──
function renderIdeas() {
  const grid = el('ideasGrid');
  grid.innerHTML = '';
  if (!state.ideas.length) {
    grid.innerHTML =
      '<p style="color:var(--mute)">Click <strong>✨ Generate ideas</strong> ' +
      'to get AI-powered suggestions tailored to your event.<br><br>' +
      '<small>You\'ll be prompted for a free Gemini API key on first use.<br>' +
      'Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" ' +
      'rel="noopener">aistudio.google.com</a></small></p>';
    return;
  }
  state.ideas.forEach(idea => {
    const card = document.createElement('div');
    card.className = 'idea-card';
    card.innerHTML = `
      <div class="idea-cat">${escape(idea.category || '')}</div>
      <div class="idea-title">${escape(idea.title || '')}</div>
      <div class="idea-detail">${escape(idea.detail || '')}</div>`;
    grid.appendChild(card);
  });
}

// ── Chat ──
function renderChat() {
  const container = el('chatMessages');
  container.innerHTML = '';
  if (!state.chatHistory.length) {
    appendChatBubble('assistant',
      `Hi! I'm your AI planning assistant. Ask me anything about your ` +
      `${state.type} — invites, speeches, rain plans, budget tips and more. ` +
      `(Needs a free Gemini API key — you'll be prompted on first message.)`, false);
    return;
  }
  state.chatHistory.forEach(m => appendChatBubble(m.role, m.content, false));
}

function appendChatBubble(role, text, scroll = true) {
  const container = el('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.textContent = text;
  container.appendChild(div);
  if (scroll) container.scrollTop = container.scrollHeight;
  return div;
}

/* ═══════════════════════════════════════════════════════════
   5. AI CALLS  (Gemini 2.0 Flash — free tier, client-side)
   ═══════════════════════════════════════════════════════════ */

// Simple client-side rate guard: max 20 requests per 5 minutes
const _aiLog = [];
function withinRateLimit() {
  const now = Date.now();
  while (_aiLog.length && _aiLog[0] < now - 300_000) _aiLog.shift();
  if (_aiLog.length >= 20) return false;
  _aiLog.push(now);
  return true;
}

function eventCtx() {
  return `Event type: ${state.type}
Event name: ${state.name}
Event date: ${state.date}
Guests: ${state.guests}
Budget: ${state.budget} ${state.currency}
Notes: ${state.notes || 'none'}`;
}

// ── Generate ideas ──
async function generateIdeas() {
  if (!withinRateLimit()) {
    showIdeasStatus('error', 'Too many requests — please wait a moment and try again.');
    return;
  }
  let key = getApiKey();
  if (!key) key = promptForApiKey();
  if (!key) {
    showIdeasStatus('error', 'No API key provided. Get a free key at aistudio.google.com/app/apikey');
    return;
  }

  const btn = el('btnIdeas');
  btn.disabled = true; btn.textContent = 'Thinking…';
  hideEl('ideasStatus');

  const prompt = `${eventCtx()}

You are a celebration planning assistant. Return ONLY a valid JSON array of exactly 8 objects.
Each object must have exactly these keys:
  "category" (string ≤ 20 chars)
  "title"    (string ≤ 50 chars)
  "detail"   (string ≤ 120 chars, practical tip)

RULES (mandatory):
- Never invent vendor names, phone numbers or specific prices.
- Tailor ideas to the event type, guest count, budget and notes.
- Keep ideas practical and achievable.
- Return ONLY the JSON array — no markdown, no explanation, no code fences.`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Strip optional code fences
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const ideas = JSON.parse(raw);
    if (!Array.isArray(ideas)) throw new Error('Response is not a JSON array');

    state.ideas = ideas.slice(0, 12).map(i => ({
      category: String(i.category || '').slice(0, 20),
      title:    String(i.title    || '').slice(0, 50),
      detail:   String(i.detail   || '').slice(0, 120),
    }));
    saveState();
    renderIdeas();

  } catch (err) {
    console.error('Ideas error:', err);
    // Graceful fallback — rule B2: app must work when AI is down
    if (err.message?.includes('API_KEY') || err.message?.includes('401')) {
      sessionStorage.removeItem('cp_gemini_key');
      _apiKey = '';
      showIdeasStatus('error', 'Invalid API key. Please try again with a valid Gemini API key.');
    } else {
      state.ideas = getFallbackIdeas();
      saveState();
      renderIdeas();
      showIdeasStatus('error',
        'AI is unavailable — showing template ideas. Check your API key or retry later.');
    }
  } finally {
    btn.disabled = false; btn.textContent = '✨ Generate ideas';
  }
}

// ── Chat ──
async function sendChat(question) {
  if (!withinRateLimit()) {
    appendChatBubble('assistant', 'Too many messages — please wait a moment.');
    return;
  }
  let key = getApiKey();
  if (!key) key = promptForApiKey();
  if (!key) {
    appendChatBubble('assistant',
      'No API key provided. Get a free key at aistudio.google.com/app/apikey and refresh the page.');
    return;
  }

  const typingDiv = appendChatBubble('assistant', '…', true);
  typingDiv.classList.add('typing');

  // Build Gemini contents array from chat history (last 10 turns)
  const systemText =
    `You are a knowledgeable, friendly celebration planning assistant.\n` +
    `Event context:\n${eventCtx()}\n\n` +
    `Rules:\n` +
    `- Keep answers under 200 words.\n` +
    `- Never invent vendor names, phone numbers, or specific prices.\n` +
    `- Label ideas as suggestions; recommend confirming with real local vendors.\n` +
    `- If asked something unrelated to event planning, politely redirect.`;

  const history = state.chatHistory.slice(-10);
  const contents = [];

  // Gemini requires alternating user/model turns; inject system as first user turn
  contents.push({ role: 'user', parts: [{ text: systemText }] });
  contents.push({ role: 'model', parts: [{ text: 'Understood! I\'m ready to help plan your event.' }] });

  history.forEach(m => {
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    });
  });
  contents.push({ role: 'user', parts: [{ text: question }] });

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 512, temperature: 0.8 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || 'Sorry, I couldn\'t generate a response. Please try again.';

    typingDiv.textContent = reply;
    typingDiv.classList.remove('typing');

    state.chatHistory.push({ role: 'user', content: question });
    state.chatHistory.push({ role: 'assistant', content: reply });
    if (state.chatHistory.length > 30) state.chatHistory = state.chatHistory.slice(-30);
    saveState();

    el('chatMessages').scrollTop = el('chatMessages').scrollHeight;

  } catch (err) {
    console.error('Chat error:', err);
    if (err.message?.includes('API_KEY') || err.message?.includes('401')) {
      sessionStorage.removeItem('cp_gemini_key');
      _apiKey = '';
      typingDiv.textContent = 'Invalid API key — please refresh and try again with a valid Gemini API key.';
    } else {
      typingDiv.textContent =
        'AI is unavailable right now. Your plan is still fully saved — try again in a moment.';
    }
    typingDiv.classList.remove('typing');
  }
}

// ── Fallback ideas when AI is down (rule B2) ──
function getFallbackIdeas() {
  const banks = {
    wedding: [
      { category:'Theme',         title:'Floral Mandap',         detail:'Seasonal marigold and rose canopy — confirm prices with your local florist before booking.' },
      { category:'Food',          title:'Live Chaat Counter',     detail:'A live chaat or pani-puri station is a crowd favourite; works for most budgets.' },
      { category:'Activities',    title:'Themed Photo Booth',     detail:'A backdrop with props is a fun and affordable addition that doubles as décor.' },
      { category:'Entertainment', title:'Family Sangeet Night',   detail:'Family performances and a playlist keep energy high with no external entertainer needed.' },
      { category:'Décor',         title:'Fairy-Light Canopy',     detail:'String lights create a warm ambience at a fraction of floral costs.' },
      { category:'Favours',       title:'Personalised Seed Kits', detail:'Eco-friendly, inexpensive, memorable. Print with couple\'s name and date.' },
      { category:'Food',          title:'Regional Thali Station', detail:'A themed thali matching your culture adds authenticity and is cost-effective.' },
      { category:'Activities',    title:'Memory Wish Jar',        detail:'Guests write wishes on cards — a keepsake that costs almost nothing.' },
    ],
    birthday: [
      { category:'Theme',         title:'Superhero Party',       detail:'Costumes, matching cake and activities; parents can DIY most décor cheaply.' },
      { category:'Food',          title:'DIY Pizza Station',     detail:'Kids top their own mini pizzas — a fun activity and a meal in one.' },
      { category:'Activities',    title:'Treasure Hunt',         detail:'A 20-minute hunt with small prize bags at the end keeps energy high.' },
      { category:'Décor',         title:'Balloon Arch',          detail:'Easy to DIY, hugely photogenic and fits any theme or colour scheme.' },
      { category:'Favours',       title:'Colouring Kits',        detail:'A booklet and crayons keep kids engaged at the party and travel home with them.' },
      { category:'Entertainment', title:'30-Minute Magic Show',  detail:'Affordable and captivates kids of all ages; many local magicians offer packages.' },
      { category:'Food',          title:'Themed Cake Pops',      detail:'Cheaper than a tiered cake and easy for guests to grab and go.' },
      { category:'Activities',    title:'Craft Corner',          detail:'Clay, stickers or friendship bracelets — easy, inexpensive and engaging.' },
    ],
    community: [
      { category:'Engagement',  title:'Local Cultural Performances', detail:'Invite schools and cultural groups — free talent and strong community buy-in.' },
      { category:'Food',        title:'Potluck Community Meal',      detail:'Each family brings a dish — reduces cost and showcases diversity.' },
      { category:'Activities',  title:'Traditional Games Zone',      detail:'Kabaddi, sack race, tug-of-war — no equipment costs, high participation.' },
      { category:'Publicity',   title:'WhatsApp Broadcast',          detail:'A broadcast list for members means zero cost and instant reach.' },
      { category:'Décor',       title:'Community Mural',             detail:'A local artist painting live doubles as entertainment and a keepsake.' },
      { category:'Logistics',   title:'Volunteer Shift Rota',        detail:'A shared Google Sheet to assign two-hour shifts keeps everything running.' },
      { category:'Activities',  title:'Skill Stalls',                detail:'Members demo local crafts, cooking or trades — educational and free.' },
      { category:'Entertainment','title':'Open Mic Session',         detail:'Invite members to sing, recite or speak — builds community pride at zero cost.' },
    ],
  };
  return banks[state.type] || banks.community;
}

/* ═══════════════════════════════════════════════════════════
   6. EXPORT
   ═══════════════════════════════════════════════════════════ */

function exportCSV() {
  const rows = [['Category','Alloc %','Planned','Spent','Remaining']];
  state.budgetItems.forEach(b => {
    const planned = Math.round(state.budget * b.pct / 100);
    const spent   = Number(b.spent) || 0;
    rows.push([b.cat, b.pct, planned, spent, planned - spent]);
  });
  const csv  = rows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `plan-${state.name.replace(/\s+/g,'-')}.csv`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════
   7. TABS
   ═══════════════════════════════════════════════════════════ */

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(btn => {
    const on = btn.dataset.tab === tabName;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    const on = panel.id === `tab-${tabName}`;
    panel.classList.toggle('active', on);
    panel.classList.toggle('hidden', !on);
  });
}

/* ═══════════════════════════════════════════════════════════
   8. DOM HELPERS
   ═══════════════════════════════════════════════════════════ */

const el     = id  => document.getElementById(id);
const showEl = id  => el(id).classList.remove('hidden');
const hideEl = id  => el(id).classList.add('hidden');

function showIdeasStatus(type, msg) {
  const s = el('ideasStatus');
  s.className  = `status-msg ${type}`;
  s.textContent = msg;
  s.classList.remove('hidden');
}

/* ═══════════════════════════════════════════════════════════
   9. INIT
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Theme ──
  const saved = localStorage.getItem('cp_theme') || 'light';
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  el('btnTheme').addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
    el('btnTheme').textContent = dark ? '🌙' : '☀️';
    localStorage.setItem('cp_theme', dark ? 'light' : 'dark');
  });

  // ── Restore saved state ──
  if (state) { hideEl('secSetup'); showEl('secPlan'); renderAll(); }

  // ── Setup form ──
  el('formSetup').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    if (!form.eventType.value) {
      alert('Please choose an event type — Wedding, Birthday, or Community.');
      return;
    }
    state = freshState(form);
    saveState();
    hideEl('secSetup');
    showEl('secPlan');
    renderAll();
    el('secPlan').scrollIntoView({ behavior: 'smooth' });
  });

  // ── Tabs ──
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  // ── AI: ideas ──
  el('btnIdeas').addEventListener('click', generateIdeas);

  // ── AI: chat ──
  el('chatForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = el('chatInput');
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    appendChatBubble('user', q);
    sendChat(q);
  });

  // ── Suggestion chips ──
  el('chatSuggestions').querySelectorAll('.chip').forEach(chip =>
    chip.addEventListener('click', () => {
      const q = chip.dataset.q;
      appendChatBubble('user', q);
      sendChat(q);
    }));

  // ── Export / print ──
  el('btnExportCSV').addEventListener('click', exportCSV);
  el('btnPrint').addEventListener('click', () => window.print());

  // ── New event ──
  el('btnNewEvent').addEventListener('click', () => {
    if (confirm('Start planning a new event? Your current plan will be cleared.')) {
      localStorage.removeItem('celebration_planner_v3');
      state = null;
      hideEl('secPlan');
      showEl('secSetup');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // ── Min date = today ──
  el('eventDate').min = new Date().toISOString().slice(0, 10);
});
