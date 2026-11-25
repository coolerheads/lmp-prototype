/* Live scoring -> Game Day links: the Game Day view button and the NFL scoreboard chips open /gameday */
;(function () {
  var LIVE = { DETCHI: 1, KCDEN: 1, SEAARI: 1, HOUNE: 1 };
  document.addEventListener('click', function (e) {
    if (location.pathname.replace(/\/+$/, '') === '/gameday') return;
    var t = e.target; if (!t || !t.closest) return;
    var a = t.closest('#app a, #app button'); if (!a) return;
    var chip = t.closest('#app .gchip'), url = null;
    if (chip) {
      var ab = [].map.call(chip.querySelectorAll('.t'), function (x) { return x.textContent.trim(); });
      var k = ab.slice(0, 2).join('');
      url = '/gameday' + (LIVE[k] ? '?game=' + k + '&view=featured' : '');
    } else if ((a.innerText || '').trim() === 'Game Day view') url = '/gameday?view=featured';
    if (url) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); location.href = url; }
  }, true);
})();
