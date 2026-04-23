var parsedData = [];

var SAMPLES = {
  abc: '1. \ub2e4\uc74c \uc911 HTTP \uc0c1\ud0dc \ucf54\ub4dc 404\uc758 \uc758\ubbf8\ub294?\nA) \uc11c\ubc84 \uc624\ub958\nB) \uad8c\ud55c \uc5c6\uc74c\nC) \ud398\uc774\uc9c0\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc74c\nD) \uc694\uccad \uc131\uacf5\n\uc815\ub2f5: C\n\n2. \uac1d\uccb4\uc9c0\ud5a5 \ud504\ub85c\uadf8\ub798\ubc0d\uc758 4\ub300 \ud2b9\uc131\uc774 \uc544\ub2cc \uac83\uc740?\nA) \uce21\uc194\ud654\nB) \uc0c1\uc18d\nC) \ucef4\ud30c\uc77c\nD) \ub2e4\ud615\uc131\n\uc815\ub2f5: C',
  circled: '1. TCP/IP \ubaa8\ub378\uc758 \uacc4\uce35\uc774 \uc544\ub2cc \uac83\uc740?\n\u2460 \uc751\uc6a9 \uacc4\uce35\n\u2461 \uc804\uc1a1 \uacc4\uce35\n\u2462 \uc138\uc158 \uacc4\uce35\n\u2463 \ub124\ud2b8\uc6cc\ud06c \uacc4\uce35\n\uc815\ub2f5: \u2462\n\n2. \ub370\uc774\ud130\ubca0\uc774\uc2a4 \uc815\uaddc\ud654\uc758 \ubaa9\uc801\uc73c\ub85c \uac00\uc7a5 \uc801\uc808\ud55c \uac83\uc740?\n\u2460 \ub370\uc774\ud130 \uc911\ubcf5 \ucd5c\uc18c\ud654\n\u2461 \uac80\uc0c9 \uc18d\ub3c4 \ud5a5\uc0c1\n\u2462 \uc800\uc7a5 \uacf5\uac04 \ud655\ub300\n\u2463 \ubcf4\uc548 \uac15\ud654\n\uc815\ub2f5: \u2460',
  markdown: '**1. \ub2e4\uc74c \ube48\uce78\uc5d0 \uacf5\ud1b5\uc73c\ub85c \ub4e4\uc5b4\uac08 \uc54c\ub9de\uc740 \ub2e8\uc5b4\ub97c \uace0\ub974\uc138\uc694.**\n> \u2022 I am _______ Vietnam.\n> \u2022 Where are you _______?\n\n\u2460 to\n\u2461 in\n\u2462 at\n\u2463 from\n\n**\uc815\ub2f5: \u2463 from**\n**\ud574\uc124:** \ucd9c\uc2e0 \uad6d\uac00\ub97c \ub098\ud0c0\ub0bc \ub54c from\uc744 \uc0ac\uc6a9\ud569\ub2c8\ub2e4.\n\n---\n\n**2. \ub2e4\uc74c \uc6b0\ub9ac\ub9d0 \ub73b\uc5d0 \uc54c\ub9de\uc740 \uc601\uc5b4 \ubb38\uc7a5\uc744 \uace0\ub974\uc138\uc694.**\n> \ub098\ub294 \uc57c\uad6c\ub97c \uc798\ud574.\n\n\u2460 I am from baseball.\n\u2461 I like baseball.\n\u2462 I can play baseball well.\n\u2463 I play basketball well.\n\n**\uc815\ub2f5: \u2462 I can play baseball well.**',
  short_answer: '1. I am _______ Vietnam. \ube48\uce78\uc5d0 \uc54c\ub9de\uc740 \ub2e8\uc5b4\ub97c \uc4f0\uc138\uc694.\n\uc815\ub2f5: from\n\n2. "\ud568\uaed8"\ub97c \uc601\uc5b4\ub85c \uc4f0\uc138\uc694.\n\uc815\ub2f5: together\n\n3. My ______ is Huy. \ube48\uce78\uc5d0 \uc54c\ub9de\uc740 \ub2e8\uc5b4\ub97c \uc4f0\uc138\uc694.\n\uc815\ub2f5: name\n\n4. \ub2e4\uc74c \uc911 \uc62c\ubc14\ub978 \ubb38\uc7a5\uc744 \uace0\ub974\uc138\uc694.\nA) I likes hot dogs.\nB) I like hot dogs.\nC) I am like hot dogs.\nD) I liking hot dogs.\n\uc815\ub2f5: B'
};

// 보기 마커 패턴
var CHOICE_PATTERNS = [
  { regex: /^[\s]*(?:\(?([A-E])\)?[\.\)]\s*)(.*)/i, type: 'alpha',
    indexFn: function(m) { return m[1].toUpperCase().charCodeAt(0) - 65; }, textFn: function(m) { return m[2].trim(); } },
  { regex: /^[\s]*([\u2460\u2461\u2462\u2463\u2464])\s*(.*)/, type: 'circled',
    indexFn: function(m) { return '\u2460\u2461\u2462\u2463\u2464'.indexOf(m[1]); }, textFn: function(m) { return m[2].trim(); } },
  { regex: /^[\s]*([1-5])[\.\)]\s*(.*)/, type: 'num',
    indexFn: function(m) { return parseInt(m[1]) - 1; }, textFn: function(m) { return m[2].trim(); } },
  { regex: /^[\s]*\(([\uAC00\uB098\uB2E4\uB77C\uB9C8])\)\s*(.*)/, type: 'korean_paren',
    indexFn: function(m) { return '\uAC00\uB098\uB2E4\uB77C\uB9C8'.indexOf(m[1]); }, textFn: function(m) { return m[2].trim(); } },
  { regex: /^[\s]*([\u3131\u3134\u3137\u3139\u3141])[\.\)]\s*(.*)/, type: 'korean_consonant',
    indexFn: function(m) { return '\u3131\u3134\u3137\u3139\u3141'.indexOf(m[1]); }, textFn: function(m) { return m[2].trim(); } }
];

var ANSWER_REGEX = /^[\(\[]?(?:\uc815\ub2f5|\ub2f5|\ub2f5\uc548|answer|correct)\s*[:\uFF1A]\s*(.+?)[\)\]]?\s*$/i;
var EXPLANATION_REGEX = /^(?:\ud574\uc124|\ud480\uc774|\uc124\uba85|explanation)\s*[:\uFF1A]/i;
var QUESTION_NUM_REGEX = /^(?:(?:\ubb38\uc81c|Q|q|#|\u3010)\s*)?(\d{1,3})[\s]*[.\)\u3011:\s]/;

function preprocessLine(line) {
  var s = line;
  s = s.replace(/^[\s]*>\s?/, '');
  s = s.replace(/\*\*/g, '');
  s = s.replace(/(^|\s)\*(\S)/g, '$1$2').replace(/(\S)\*(\s|$)/g, '$1$2');
  s = s.replace(/^#{1,6}\s+/, '');
  s = s.replace(/\$\\rightarrow\$/g, '\u2192');
  s = s.replace(/\$[^$]*\$/g, '');
  s = s.replace(/\[(?:\ub2e8\ub2f5\ud615|\uac1d\uad00\uc2dd|\uc8fc\uad00\uc2dd|\uc11c\uc220\ud615)\]\s*/g, '');
  return s;
}

function normalizeAnswer(answerText) {
  var t = answerText.trim();
  var circledMatch = t.match(/^([\u2460\u2461\u2462\u2463\u2464])/);
  if (circledMatch) return '\u2460\u2461\u2462\u2463\u2464'.indexOf(circledMatch[1]) + 1;
  var korParenMatch = t.match(/^\(([\uAC00\uB098\uB2E4\uB77C\uB9C8])\)/);
  if (korParenMatch) return '\uAC00\uB098\uB2E4\uB77C\uB9C8'.indexOf(korParenMatch[1]) + 1;
  var alphaMatch = t.match(/^([A-Ea-e])(?:\)|\.|$|\s)/);
  if (alphaMatch) return alphaMatch[1].toUpperCase().charCodeAt(0) - 64;
  var consMatch = t.match(/^([\u3131\u3134\u3137\u3139\u3141])/);
  if (consMatch) return '\u3131\u3134\u3137\u3139\u3141'.indexOf(consMatch[1]) + 1;
  var numMatch = t.match(/^([1-5])(?:\s|$|\))/);
  if (numMatch) return parseInt(numMatch[1]);
  if (/^[1-5]$/.test(t)) return parseInt(t);
  if (/^[A-Ea-e]$/.test(t)) return t.toUpperCase().charCodeAt(0) - 64;
  return t;
}

function parseQuestions() {
  var text = document.getElementById('inputText').value.trim();
  if (!text) { showToast('\ud14d\uc2a4\ud2b8\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694'); return; }

  var defaultTime = parseInt(document.getElementById('defaultTime').value) || 20;
  var rawLines = text.split('\n');
  var questions = [];
  var currentQ = null;

  for (var i = 0; i < rawLines.length; i++) {
    var raw = rawLines[i];
    if (/^\s*[-=]{3,}\s*$/.test(raw)) continue;
    var trimmed = preprocessLine(raw).trim();
    if (!trimmed) continue;
    if (EXPLANATION_REGEX.test(trimmed)) continue;
    if (/^[\[\u3010\u300C].*(?:\ubb38\uc81c|\uc5f0\uc2b5|\ud3c9\uac00|\ub2e8\uc6d0).*[\]\u3011\u300D]\s*$/.test(trimmed)) continue;

    var answerMatch = trimmed.match(ANSWER_REGEX);
    if (answerMatch && currentQ) { currentQ.answerRaw = answerMatch[1].trim(); continue; }

    var qMatch = trimmed.match(QUESTION_NUM_REGEX);
    if (qMatch) {
      if (currentQ) questions.push(currentQ);
      var afterNum = trimmed.replace(QUESTION_NUM_REGEX, '').trim();
      currentQ = { num: parseInt(qMatch[1]), question: afterNum, choices: [], answerRaw: '', choiceType: null };
      continue;
    }

    var choiceMatched = false;
    for (var j = 0; j < CHOICE_PATTERNS.length; j++) {
      var cp = CHOICE_PATTERNS[j];
      var cm = trimmed.match(cp.regex);
      if (cm) {
        if (cp.type === 'num' && !currentQ) break;
        if (cp.type === 'num' && currentQ && currentQ.choices.length === 0 && parseInt(cm[1]) > 1) break;
        if (currentQ) { currentQ.choices[cp.indexFn(cm)] = cp.textFn(cm); currentQ.choiceType = cp.type; }
        choiceMatched = true; break;
      }
    }
    if (choiceMatched) continue;

    if (currentQ && currentQ.choices.length === 0) {
      if (/^[\u2022\-]/.test(trimmed)) { currentQ.question += '\n' + trimmed; }
      else { currentQ.question += ' ' + trimmed; }
    }
  }
  if (currentQ) questions.push(currentQ);

  if (questions.length === 0) { showToast('\ubb38\uc81c\ub97c \ud30c\uc2f1\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \ud615\uc2dd\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694.'); return; }

  parsedData = questions.map(function(q, i) {
    var hasChoices = q.choices.some(function(c) { return c; });
    var isShortAnswer = !hasChoices && q.answerRaw;

    if (isShortAnswer) {
      var answerText = q.answerRaw.replace(/\*+/g, '').trim();
      answerText = answerText.replace(/^[\u2460\u2461\u2462\u2463\u2464]\s*/, '');
      answerText = answerText.replace(/^[A-Ea-e][\.\)]\s*/, '');
      answerText = answerText.replace(/^\([\uAC00\uB098\uB2E4\uB77C\uB9C8]\)\s*/, '');
      return { num: q.num || (i + 1), question: q.question.trim(), c1: answerText, c2: '', c3: '', c4: '', c5: '', time: defaultTime, answer: 1, isShortAnswer: true };
    } else {
      var answer = q.answerRaw ? normalizeAnswer(q.answerRaw) : '';
      return { num: q.num || (i + 1), question: q.question.trim(), c1: q.choices[0] || '', c2: q.choices[1] || '', c3: q.choices[2] || '', c4: q.choices[3] || '', c5: q.choices[4] || '', time: defaultTime, answer: answer, isShortAnswer: false };
    }
  });

  renderTable();
  showToast(parsedData.length + '\uac1c \ubb38\uc81c\ub97c \ud30c\uc2f1\ud588\uc2b5\ub2c8\ub2e4');
}

function renderTable() {
  var tbody = document.getElementById('resultBody');
  if (!tbody) return;
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

  var fiveChoiceCount = 0, noAnswer = 0, fiveIsAnswer = 0, shortAnswerCount = 0, choiceCount = 0;
  parsedData.forEach(function(d) {
    if (d.isShortAnswer) { shortAnswerCount++; }
    else { choiceCount++; if (d.c5) { fiveChoiceCount++; if (d.answer === 5) fiveIsAnswer++; } }
    if (!d.answer) noAnswer++;
  });

  var statsEl = document.getElementById('stats');
  while (statsEl.firstChild) statsEl.removeChild(statsEl.firstChild);

  function addStat(num, label, isWarn) {
    var span = document.createElement('span');
    span.className = 'stat' + (isWarn ? ' warn' : '');
    var strong = document.createElement('strong');
    strong.textContent = num;
    span.appendChild(strong);
    span.appendChild(document.createTextNode(label));
    statsEl.appendChild(span);
  }

  addStat(parsedData.length, '\ubb38\uc81c');
  if (choiceCount > 0) addStat(choiceCount, '\uc120\ub2e4\ud615');
  if (shortAnswerCount > 0) addStat(shortAnswerCount, '\ub2e8\ub2f5\ud615');
  if (noAnswer > 0) addStat(noAnswer, '\uc815\ub2f5 \uc5c6\uc74c', true);
  if (fiveChoiceCount > 0) addStat(fiveChoiceCount, '\uc624\uc9c0\uc120\ub2e4 (4\uac1c\ub85c \ucd95\uc18c \ud544\uc694)', true);

  var warningArea = document.getElementById('warningArea');
  if (!warningArea) return;
  while (warningArea.firstChild) warningArea.removeChild(warningArea.firstChild);
  if (fiveChoiceCount > 0) {
    var warn = document.createElement('div');
    warn.className = 'warning-box';
    warn.textContent = 'Blooket\uc740 \ubcf4\uae30 \ucd5c\ub300 4\uac1c\ub9cc \uc9c0\uc6d0\ud569\ub2c8\ub2e4. \uc624\uc9c0\uc120\ub2e4 \ubb38\uc81c ' + fiveChoiceCount + '\uac1c\uac00 \uac10\uc9c0\ub418\uc5c8\uc2b5\ub2c8\ub2e4.';
    warningArea.appendChild(warn);
  }

  document.getElementById('countBadge').textContent = parsedData.length + '\ubb38\uc81c';

  parsedData.forEach(function(d, i) {
    var tr = document.createElement('tr');
    var tdNum = document.createElement('td'); tdNum.className = 'row-num'; tdNum.textContent = d.num; tr.appendChild(tdNum);
    var tdQ = document.createElement('td'); var taQ = document.createElement('textarea'); taQ.className = 'cell-edit'; taQ.value = d.question;
    taQ.addEventListener('change', (function(idx) { return function(e) { parsedData[idx].question = e.target.value; }; })(i));
    tdQ.appendChild(taQ); tr.appendChild(tdQ);

    ['c1','c2','c3','c4'].forEach(function(key) {
      var td = document.createElement('td'); var input = document.createElement('input'); input.type = 'text'; input.value = d[key];
      input.addEventListener('change', (function(idx, k) { return function(e) { parsedData[idx][k] = e.target.value; }; })(i, key));
      td.appendChild(input); tr.appendChild(td);
    });

    var tdTime = document.createElement('td'); var inputTime = document.createElement('input');
    inputTime.type = 'number'; inputTime.className = 'time-input'; inputTime.min = '5'; inputTime.max = '300'; inputTime.value = d.time;
    inputTime.addEventListener('change', (function(idx) { return function(e) { var v = parseInt(e.target.value); if (v < 5) v = 5; if (v > 300) v = 300; e.target.value = v; parsedData[idx].time = v; }; })(i));
    tdTime.appendChild(inputTime); tr.appendChild(tdTime);

    var tdA = document.createElement('td'); var inputA = document.createElement('input');
    inputA.type = 'text'; inputA.className = 'answer-input'; inputA.value = String(d.answer);
    inputA.addEventListener('change', (function(idx) { return function(e) { parsedData[idx].answer = e.target.value; }; })(i));
    tdA.appendChild(inputA); tr.appendChild(tdA);

    var tdDel = document.createElement('td'); var btnDel = document.createElement('button');
    btnDel.className = 'delete-btn'; btnDel.textContent = '\u2715'; btnDel.title = '\uc0ad\uc81c';
    btnDel.addEventListener('click', (function(idx) { return function() { deleteRow(idx); }; })(i));
    tdDel.appendChild(btnDel); tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });

  document.getElementById('resultCard').style.display = 'block';
  document.getElementById('emptyState').style.display = 'none';
}

function deleteRow(i) {
  parsedData.splice(i, 1);
  parsedData.forEach(function(d, idx) { d.num = idx + 1; });
  renderTable();
}

function addEmptyRow() {
  var defaultTime = parseInt(document.getElementById('defaultTime').value) || 20;
  parsedData.push({ num: parsedData.length + 1, question: '', c1: '', c2: '', c3: '', c4: '', c5: '', time: defaultTime, answer: '', isShortAnswer: false });
  renderTable();
  var wrap = document.querySelector('.table-wrap');
  wrap.scrollTop = wrap.scrollHeight;
}

function applyDefaultTime() {
  var defaultTime = parseInt(document.getElementById('defaultTime').value) || 20;
  parsedData.forEach(function(d) { d.time = defaultTime; });
  renderTable();
  showToast('\ubaa8\ub4e0 \ubb38\uc81c\uc5d0 ' + defaultTime + '\ucd08\uac00 \uc801\uc6a9\ub418\uc5c8\uc2b5\ub2c8\ub2e4');
}

function buildExportRow(d) {
  if (d.isShortAnswer) {
    var correctNums = [];
    if (d.c1) correctNums.push('1');
    if (d.c2) correctNums.push('2');
    if (d.c3) correctNums.push('3');
    if (d.c4) correctNums.push('4');
    return [d.num, d.question, d.c1, d.c2 || '', d.c3 || '', d.c4 || '', d.time, correctNums.join(','), '', 'typing'];
  }
  return [d.num, d.question, d.c1, d.c2, d.c3 || '', d.c4 || '', d.time, d.answer, '', ''];
}

function downloadXLSX() {
  if (parsedData.length === 0) { showToast('\ub2e4\uc6b4\ub85c\ub4dc\ud560 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4'); return; }
  var wsData = [
    ['Blooket\nImport Template', '', '', '', '', '', '', '', '', ''],
    ['Question #', 'Question Text', 'Answer 1', 'Answer 2', 'Answer 3\n(Optional)', 'Answer 4\n(Optional)', 'Time Limit (sec)\n(Max: 300 seconds)', 'Correct Answer(s)\n(Only include Answer #)', '', 'Typing']
  ];
  parsedData.forEach(function(d) { wsData.push(buildExportRow(d)); });

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 13 }, { wch: 25 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 5 }, { wch: 10 }];
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, 'Blooket_Import_' + new Date().toISOString().slice(0, 10) + '.xlsx');
  showToast('Blooket XLSX \ud30c\uc77c\uc774 \ub2e4\uc6b4\ub85c\ub4dc\ub418\uc5c8\uc2b5\ub2c8\ub2e4');
}

function downloadCSV() {
  if (parsedData.length === 0) { showToast('\ub2e4\uc6b4\ub85c\ub4dc\ud560 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4'); return; }
  var headers = ['Question #', 'Question Text', 'Answer 1', 'Answer 2', 'Answer 3', 'Answer 4', 'Time Limit (sec)', 'Correct Answer(s)', '', 'Typing'];
  var rows = parsedData.map(function(d) { return buildExportRow(d); });
  var csvContent = [headers].concat(rows).map(function(row) {
    return row.map(function(cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href = url;
  a.download = 'Blooket_Import_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click(); URL.revokeObjectURL(url);
  showToast('CSV \ud30c\uc77c\uc774 \ub2e4\uc6b4\ub85c\ub4dc\ub418\uc5c8\uc2b5\ub2c8\ub2e4');
}

function clearInput() {
  document.getElementById('inputText').value = '';
  parsedData = [];
  var rc = document.getElementById('resultCard');
  var es = document.getElementById('emptyState');
  if (rc) rc.style.display = 'none';
  if (es) es.style.display = 'block';
}

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2500);
}

// app.html 전용 이벤트 바인딩 (popup에서는 해당 요소가 없으므로 스킵)
document.addEventListener('DOMContentLoaded', function() {
  var container = document.getElementById('formatHint');
  if (!container) return;

  var tags = [
    { key: 'abc', label: 'A/B/C/D \ud615\uc2dd' },
    { key: 'circled', label: '\u2460\u2461\u2462\u2463 \ud615\uc2dd' },
    { key: 'markdown', label: '\ub9c8\ud06c\ub2e4\uc6b4 (LLM)' },
    { key: 'short_answer', label: '\ub2e8\ub2f5\ud615 + \uc120\ub2e4\ud615 \ud63c\ud569' }
  ];
  tags.forEach(function(t) {
    var span = document.createElement('span');
    span.className = 'format-tag';
    span.textContent = t.label;
    span.addEventListener('click', function() {
      document.getElementById('inputText').value = SAMPLES[t.key] || '';
    });
    container.appendChild(span);
  });

  function bind(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
  bind('btnParse', parseQuestions);
  bind('btnClear', clearInput);
  bind('btnCSV', downloadCSV);
  bind('btnXLSX', downloadXLSX);
  bind('btnAddRow', addEmptyRow);
  bind('btnApplyTime', applyDefaultTime);
});
