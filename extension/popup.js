document.addEventListener('DOMContentLoaded', function() {
  var btnParse = document.getElementById('btnParse');
  var btnCSV = document.getElementById('btnCSV');
  var btnOpenFull = document.getElementById('btnOpenFull');
  var resultEl = document.getElementById('result');
  var statsEl = document.getElementById('stats');
  var previewEl = document.getElementById('preview');

  btnParse.addEventListener('click', function() {
    parseQuestions();
    if (parsedData.length === 0) return;

    // 통계 표시
    while (statsEl.firstChild) statsEl.removeChild(statsEl.firstChild);
    var shortCount = 0, choiceCount = 0, noAnswer = 0;
    parsedData.forEach(function(d) {
      if (d.isShortAnswer) shortCount++;
      else choiceCount++;
      if (!d.answer) noAnswer++;
    });

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
    if (shortCount > 0) addStat(shortCount, '\ub2e8\ub2f5\ud615');
    if (noAnswer > 0) addStat(noAnswer, '\uc815\ub2f5 \uc5c6\uc74c', true);

    // 미리보기
    while (previewEl.firstChild) previewEl.removeChild(previewEl.firstChild);
    parsedData.forEach(function(d) {
      var div = document.createElement('div');
      div.className = 'q-item';

      var numSpan = document.createElement('span');
      numSpan.className = 'q-num';
      numSpan.textContent = 'Q' + d.num;
      div.appendChild(numSpan);

      var qText = d.question.length > 50 ? d.question.substring(0, 50) + '...' : d.question;
      div.appendChild(document.createTextNode(qText));

      var typeSpan = document.createElement('span');
      typeSpan.className = 'q-type ' + (d.isShortAnswer ? 'type-short' : 'type-choice');
      typeSpan.textContent = d.isShortAnswer ? '\ub2e8\ub2f5' : '\uc120\ub2e4';
      div.appendChild(typeSpan);

      previewEl.appendChild(div);
    });

    resultEl.style.display = 'block';
    btnCSV.disabled = false;
  });

  btnCSV.addEventListener('click', function() {
    downloadCSV();
  });

  btnOpenFull.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('app.html') });
  });
});
