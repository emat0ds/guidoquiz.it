(function () {
  var root = document.getElementById('quiz');
  var dataEl = document.getElementById('qdata');
  if (!root || !dataEl) return;
  var pool;
  try { pool = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var N = Math.min(10, pool.length);
  var appUrl = root.getAttribute('data-app');
  var qs = [], i = 0, score = 0, wrong = [], answered = false;

  function shuffle(a) {
    for (var k = a.length - 1; k > 0; k--) {
      var j = Math.floor(Math.random() * (k + 1));
      var t = a[k]; a[k] = a[j]; a[j] = t;
    }
    return a;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function start() {
    qs = shuffle(pool.slice()).slice(0, N);
    i = 0; score = 0; wrong = []; render();
  }
  function render() {
    answered = false;
    root.textContent = '';
    var q = qs[i];
    var card = el('div', 'quiz-card');
    var top = el('div', 'q-top');
    top.appendChild(el('span', '', 'Domanda ' + (i + 1) + ' di ' + N));
    top.appendChild(el('span', '', 'Punti: ' + score));
    var bar = el('div', 'q-bar'); var fill = el('div'); fill.style.width = (i / N * 100) + '%'; bar.appendChild(fill);
    card.appendChild(top); card.appendChild(bar);
    if (q.i) {
      var img = el('img', 'q-img'); img.src = '/quiz/img/' + q.i; img.alt = 'Immagine della domanda'; img.loading = 'lazy';
      card.appendChild(img);
    }
    card.appendChild(el('p', 'q-text', q.q));
    var btns = el('div', 'q-buttons');
    var bV = el('button', 'q-btn', 'Vero'); bV.type = 'button';
    var bF = el('button', 'q-btn', 'Falso'); bF.type = 'button';
    btns.appendChild(bV); btns.appendChild(bF);
    card.appendChild(btns);
    var fb = el('div'); fb.setAttribute('aria-live', 'polite');
    card.appendChild(fb);
    function pick(val) {
      if (answered) return; answered = true;
      var ok = (val === q.a);
      if (ok) score++; else wrong.push(q);
      bV.disabled = bF.disabled = true;
      (q.a ? bV : bF).classList.add('correct');
      if (!ok) (val ? bV : bF).classList.add('wrong');
      var f = el('div', 'q-feedback ' + (ok ? 'ok' : 'ko'));
      f.appendChild(el('strong', '', ok ? 'Corretto!' : 'Sbagliato — la risposta giusta è ' + (q.a ? 'Vero' : 'Falso')));
      f.appendChild(document.createTextNode(q.e));
      fb.appendChild(f);
      var nx = el('button', 'q-next', i + 1 < N ? 'Prossima domanda →' : 'Vedi il risultato →');
      nx.type = 'button';
      nx.onclick = function () { i++; if (i < N) render(); else result(); };
      fb.appendChild(nx);
      nx.focus();
    }
    bV.onclick = function () { pick(true); };
    bF.onclick = function () { pick(false); };
    root.appendChild(card);
  }
  function result() {
    root.textContent = '';
    var card = el('div', 'quiz-card q-result');
    card.appendChild(el('h2', '', 'Risultato'));
    card.appendChild(el('div', 'q-score', score + ' / ' + N));
    var msg = score >= 9 ? 'Ottimo, su questo argomento sei già a buon punto.'
      : score >= 7 ? 'Ci sei quasi: ripassa gli errori qui sotto e riprova.'
      : 'Serve un po’ di ripasso su questo argomento: parti dagli errori qui sotto.';
    card.appendChild(el('p', 'q-verdict', msg));
    if (wrong.length) {
      card.appendChild(el('h3', '', 'Da ripassare'));
      var ul = el('ul', 'q-review');
      wrong.forEach(function (w) {
        var li = el('li');
        li.appendChild(el('b', '', w.q));
        li.appendChild(document.createElement('br'));
        li.appendChild(document.createTextNode('Risposta corretta: ' + (w.a ? 'Vero' : 'Falso') + '. ' + w.e));
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }
    var acts = el('div', 'q-actions');
    var again = el('button', 'q-ghost', 'Altre 10 domande'); again.type = 'button'; again.onclick = start;
    var app = el('a', 'q-link-btn', 'Continua con l’app →'); app.href = appUrl;
    acts.appendChild(again); acts.appendChild(app);
    card.appendChild(acts);
    root.appendChild(card);
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  start();
})();
