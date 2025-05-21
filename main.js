const a = document.getElementById('a');
const b = document.getElementById('b');
const ans = document.getElementById('answer');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const multEl = document.getElementById('mult');
const rows = [0, 1, 2].map(i => document.getElementById(`h${i}`));
const kbd = document.getElementById('kbd');
const bksp = document.getElementById('bksp');
const overlay = document.getElementById('overlay');
const endtext = document.getElementById('endtext');
const extra = document.getElementById('extra');
const restart = document.getElementById('restart');
const problem = document.querySelector('.problem');

let low = 1, high = 9, level = 1;
let x, y, prevX, prevY, user = 0;
let problemStart = 0;
let history = [];
let streak = 0, timeStreak = 0, mult = 1, score = 0, totalCorrect = 0;
let t = 30, loop = null, extraUsed = false;
const bestKey = 'mencalcBest';

function rand() { return Math.floor(Math.random() * (high - low + 1)) + low }

function resizeProblem() {
    problem.style.fontSize = '';
    let s = parseFloat(getComputedStyle(problem).fontSize);
    const w = problem.parentElement.clientWidth;
    while (problem.scrollWidth > w && s > 16) { s -= 2; problem.style.fontSize = s + 'px' }
}

function resizeRow(row) {
    row.style.fontSize = '';
    let s = parseFloat(getComputedStyle(row).fontSize);
    const w = row.parentElement.clientWidth;
    while (row.scrollWidth > w && s > 10) { s -= 1; row.style.fontSize = s + 'px' }
}

function generate() {
    do { x = rand() } while (x === prevX || x === prevY);
    do { y = rand() } while (y === prevX || y === prevY);
    while (x + y === prevX + prevY) { x = rand(); y = rand() }
    prevX = x; prevY = y;
    a.textContent = x;
    b.textContent = y;
    user = 0;
    ans.textContent = '';
    problemStart = performance.now();
    resizeProblem();
}

function tick() {
    t = +(t - 0.1).toFixed(1);
    if (t <= 0) { t = 0; end(); return }
    timerEl.textContent = t.toFixed(1);
}

function startTimer() { if (loop) return; loop = setInterval(tick, 100) }
function stopTimer() { clearInterval(loop); loop = null }

function put(n) {
    if (n === 0 && user === 0) return;
    startTimer();
    user = user * 10 + n;
    ans.textContent = user;
    if (Math.floor(Math.log10(user)) + 1 === Math.floor(Math.log10(x + y)) + 1) check();
}

function back() {
    if (user === 0) return;
    user = Math.floor(user / 10);
    ans.textContent = user || '';
}

function updateHistory(text, ok) {
    history.push({ text, ok });
    if (history.length > 3) history.shift();
    rows.forEach((r, i) => {
        const h = history[i];
        if (h) { r.textContent = h.text; r.style.background = h.ok ? '#060' : '#600' }
        else { r.textContent = ''; r.style.background = 'transparent' }
        resizeRow(r);
    });
}

function levelUp() { level++; low++; high++ }

function check() {
    const ok = x + y === user;
    const ms = Math.round(performance.now() - problemStart);
    const txt = ok ? `${x}+${y}=${user} ${ms} ms` : `${x}+${y}=${user}|${x + y}`;
    updateHistory(txt, ok);
    if (ok) {
        totalCorrect++;
        if (totalCorrect > 5) levelUp();
        streak++; timeStreak++; score += 100 * mult;
        if (timeStreak === 5) { timeStreak = 0; t += 7; toast('Бонус времени +7 сек') }
        if (streak === 3) { streak = 0; mult++; multEl.textContent = `x${mult}` }
    } else {
        streak = 0; timeStreak = 0; mult = 1; multEl.textContent = 'x1'
    }
    scoreEl.textContent = score;
    generate();
}

function end() {
    stopTimer();
    const best = parseInt(localStorage.getItem(bestKey) || '0', 10);
    let text = `Счёт: ${score}<br>Рекорд: ${best}`;
    if (score > best) { localStorage.setItem(bestKey, score); text += ' — новый рекорд!' }
    endtext.innerHTML = text;
    extra.style.display = extraUsed ? 'none' : 'block';
    overlay.classList.remove('hidden');
}

function reset() {
    history = [];
    rows.forEach(r => { r.textContent = ''; r.style.background = 'transparent'; resizeRow(r) });
    low = 1; high = 9; level = 1; mult = 1; streak = 0; timeStreak = 0; score = 0; totalCorrect = 0;
    scoreEl.textContent = 0; multEl.textContent = 'x1';
    t = 30; timerEl.textContent = '30.0'; extraUsed = false;
    generate();
    stopTimer();
    overlay.classList.add('hidden');
}

function toast(m) {
    const d = document.createElement('div');
    d.textContent = m;
    d.style.cssText = 'position:fixed;bottom:25px;left:50%;transform:translateX(-50%);background:#444;color:#fff;padding:.5rem 1rem;border-radius:.3rem;opacity:0;transition:opacity .3s';
    document.body.appendChild(d);
    requestAnimationFrame(() => d.style.opacity = 1);
    setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 300) }, 1500);
}

kbd.addEventListener('click', e => { const n = e.target.dataset.n; if (n) put(+n) });
bksp.addEventListener('click', back);
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') put(+e.key);
    if (e.key === 'Backspace') back();
});
window.addEventListener('resize', () => { resizeProblem(); rows.forEach(resizeRow) });
extra.addEventListener('click', () => { extraUsed = true; overlay.classList.add('hidden'); t += 30; timerEl.textContent = t.toFixed(1); startTimer() });
restart.addEventListener('click', reset);

reset();
