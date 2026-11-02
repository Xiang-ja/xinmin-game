// 新民向新 · 网页版逻辑（与小程序版玩法一致，进度存浏览器本地）
(function () {
  var D = window.XM;
  var LEVELS = D.LEVELS;

  // ---------- 存档 ----------
  var KEY = 'xinmin_web_state_v1';
  var DEFAULT_STATE = {
    cleared: [],
    unlockedLevels: [],
    advancedOwned: false,
    galleryCollected: [],
    paidGallery: [],
    skin: 'spring',
    playerPos: { x: 50, y: 57 },
    avatar: { face: 'f1', acc: 'a1', outfit: 'o1' },
    redeemed: '',
    mail: null,
  };

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var merged = JSON.parse(JSON.stringify(DEFAULT_STATE));
        Object.keys(merged).forEach(function (k) {
          if (parsed[k] !== undefined && parsed[k] !== null) merged[k] = parsed[k];
        });
        return merged;
      }
    } catch (e) { /* 忽略损坏存档 */ }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 存储满时忽略 */ }
  }

  var state = loadState();

  // ---------- 工具 ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.add('hidden'); }, 1800);
  }
  function confirmBox(title, text, onOk) {
    var box = $('confirm');
    $('confirm-title').textContent = title;
    $('confirm-text').textContent = text;
    box.classList.remove('hidden');
    $('confirm-ok').onclick = function () { box.classList.add('hidden'); onOk(); };
    $('confirm-cancel').onclick = function () { box.classList.add('hidden'); };
  }

  function findSkin(key) {
    // 注意：SKINS 用 key 字段标识，不能用 findItem（它按 id 匹配）
    for (var i = 0; i < D.SKINS.length; i++) {
      if (D.SKINS[i].key === key) return D.SKINS[i];
    }
    return D.SKINS[0];
  }
  function clearedCount() { return state.cleared.length; }

  // ---------- 标签切换 ----------
  var TABS = ['map', 'avatar', 'gallery', 'rewards'];
  function switchTab(tab) {
    TABS.forEach(function (t) {
      $('view-' + t).classList.toggle('hidden', t !== tab);
      $('tab-' + t).classList.toggle('on', t === tab);
    });
    if (tab === 'map') renderMap();
    if (tab === 'avatar') renderAvatar();
    if (tab === 'gallery') renderGallery();
    if (tab === 'rewards') renderRewards();
    window.scrollTo(0, 0);
  }

  // ---------- 大街地图 ----------
  function renderMap() {
    var skin = findSkin(state.skin);
    var clearedN = clearedCount();
    var html = '';
    LEVELS.forEach(function (l) {
      var isCleared = state.cleared.indexOf(l.idx) >= 0;
      var isLocked = !l.free && state.unlockedLevels.indexOf(l.idx) < 0;
      var badge = isCleared ? '✓' : (isLocked ? '🔒' : '▶');
      var cls = isCleared ? 'cleared' : (isLocked ? 'locked' : '');
      html += '<button class="node" style="left:' + l.pos.x + '%;top:' + l.pos.y + '%;" data-idx="' + l.idx + '">' +
        '<div class="plaque ' + cls + '"><span class="plaque-emoji">' + l.emoji + '</span><span class="plaque-name">' + esc(l.short) + '</span></div>' +
        '<span class="node-badge ' + cls + '">' + badge + '</span>' +
        '</button>';
    });
    var wrap = $('nodes');
    wrap.innerHTML = html;
    Array.prototype.forEach.call(wrap.querySelectorAll('.node'), function (el) {
      el.onclick = function () {
        var idx = Number(el.getAttribute('data-idx'));
        var lv = D.getLevel(idx);
        // 小人先走到牌匾附近，再打开关卡
        movePlayerTo(lv.pos.x, lv.pos.y + 5, function () { openLevel(idx); });
      };
    });

    // 四季整体视觉：专属色调滤镜 + 环境光 + 装饰物 + 动态粒子
    var phone = document.querySelector('.phone');
    phone.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
    phone.classList.add('season-' + skin.key);
    $('season-tint').style.background = skin.tint;
    renderSeasonDeco(skin);
    spawnSeasonFx(skin);
    $('hud-num').textContent = clearedN + '/' + LEVELS.length + ' 关';
    $('hud-fill').style.width = Math.round((clearedN / LEVELS.length) * 100) + '%';

    var seasonHtml = '';
    D.SKINS.forEach(function (s) {
      var unlocked = clearedN >= s.need;
      seasonHtml += '<button class="s-btn ' + (s.key === state.skin ? 'on' : '') + (unlocked ? '' : ' lock') + '" data-key="' + s.key + '">' +
        '<span class="s-emoji">' + s.emoji + '</span><span class="s-txt">' + s.short + '</span></button>';
    });
    var side = $('season-side');
    side.innerHTML = seasonHtml;
    Array.prototype.forEach.call(side.querySelectorAll('.s-btn'), function (el) {
      el.onclick = function () {
        var s = findSkin(el.getAttribute('data-key'));
        if (clearedCount() < s.need) { toast('通关 ' + s.need + ' 关后解锁'); return; }
        state.skin = s.key;
        saveState();
        renderMap();
        renderPlayer();
        seasonFlash(s);
        toast('已换上' + s.name);
      };
    });

    renderPlayer();
  }

  function renderPlayer() {
    var face = D.findItem(D.FACES, state.avatar.face);
    var acc = D.findItem(D.ACCS, state.avatar.acc);
    var outfit = D.findItem(D.OUTFITS, state.avatar.outfit);
    var skin = findSkin(state.skin);
    var p = state.playerPos || { x: 50, y: 57 };
    P.x = clampX(p.x);
    P.y = clampY(p.y);
    $('player').style.left = P.x + '%';
    $('player').style.top = P.y + '%';
    $('player-face').textContent = face ? face.emoji : '🧒';
    $('player-acc').textContent = acc ? acc.emoji : '🎀';
    $('player-circle').style.background = outfit ? outfit.color : '#4a7c59';
    $('player-circle').style.borderColor = skin.accent;
  }

  // ---------- 人物移动引擎（点击行走 + 键盘操控） ----------
  var P = { x: 50, y: 57 };                                  // 小人当前坐标（地图百分比）
  var SPEED = 30;                                            // 行走速度：每秒移动的百分比
  var walk = { tx: null, ty: null, cb: null, raf: null, last: 0 };
  var keyDirs = { left: false, right: false, up: false, down: false };

  function clampX(x) { return Math.max(3.5, Math.min(96.5, x)); }
  function clampY(y) { return Math.max(6, Math.min(95, y)); }

  function setPlayerPos(x, y) {
    P.x = x;
    P.y = y;
    var el = $('player');
    el.style.left = x + '%';
    el.style.top = y + '%';
  }

  function startMoveLoop() {
    if (walk.raf) return;
    walk.last = performance.now();
    walk.raf = requestAnimationFrame(stepMove);
  }

  function stepMove(now) {
    var dt = Math.min((now - walk.last) / 1000, 0.05);
    walk.last = now;
    var el = $('player');
    var active = false;

    if (walk.tx !== null) {
      var dx = walk.tx - P.x, dy = walk.ty - P.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var step = SPEED * dt;
      if (dist <= step) {
        setPlayerPos(walk.tx, walk.ty);
        walk.tx = walk.ty = null;
        saveState();
        if (walk.cb) { var cb = walk.cb; walk.cb = null; cb(); }
      } else {
        setPlayerPos(P.x + dx / dist * step, P.y + dy / dist * step);
        if (dx < -0.1) el.classList.add('face-left');
        else if (dx > 0.1) el.classList.remove('face-left');
        active = true;
      }
    }

    if (walk.tx === null) {
      var kx = (keyDirs.right ? 1 : 0) - (keyDirs.left ? 1 : 0);
      var ky = (keyDirs.down ? 1 : 0) - (keyDirs.up ? 1 : 0);
      if (kx || ky) {
        var len = Math.sqrt(kx * kx + ky * ky);
        setPlayerPos(clampX(P.x + kx / len * SPEED * dt), clampY(P.y + ky / len * SPEED * dt));
        if (kx < 0) el.classList.add('face-left');
        else if (kx > 0) el.classList.remove('face-left');
        active = true;
      }
    }

    if (active) {
      el.classList.add('walking');
      walk.raf = requestAnimationFrame(stepMove);
    } else {
      el.classList.remove('walking');
      walk.raf = null;
      saveState();
    }
  }

  function movePlayerTo(x, y, cb) {
    walk.tx = clampX(x);
    walk.ty = clampY(y);
    walk.cb = cb || null;
    showDestRing(walk.tx, walk.ty);
    startMoveLoop();
  }

  function showDestRing(x, y) {
    var ring = $('dest-ring');
    ring.style.left = x + '%';
    ring.style.top = y + '%';
    ring.classList.remove('run');
    void ring.offsetWidth;
    ring.classList.add('run');
  }

  // ---------- 四季装饰物与动态粒子 ----------
  function renderSeasonDeco(skin) {
    var html = '';
    (skin.decos || []).forEach(function (d) {
      html += '<span class="deco' + (d.anim ? ' deco-' + d.anim : '') + '" style="left:' + d.x + '%;top:' + d.y + '%;font-size:' + d.s + 'px;">' + d.e + '</span>';
    });
    $('season-deco').innerHTML = html;
  }

  function spawnSeasonFx(skin) {
    var layer = $('fx-layer');
    layer.innerHTML = '';
    var fall = layer.offsetHeight + 80;
    for (var i = 0; i < skin.fxCount; i++) {
      var f = skin.fx[Math.floor(Math.random() * skin.fx.length)];
      var sp = document.createElement('span');
      sp.className = 'fx fx-' + f.m;
      sp.textContent = f.e;
      var size = skin.fxSize[0] + Math.random() * (skin.fxSize[1] - skin.fxSize[0]);
      sp.style.left = (Math.random() * 100) + '%';
      sp.style.fontSize = size.toFixed(1) + 'px';
      sp.style.animationDuration = (skin.fxMin + Math.random() * (skin.fxMax - skin.fxMin)).toFixed(2) + 's';
      sp.style.animationDelay = (-Math.random() * skin.fxMax).toFixed(2) + 's';
      sp.style.setProperty('--drift', Math.round((Math.random() - 0.5) * 150) + 'px');
      sp.style.setProperty('--fall', Math.round(fall) + 'px');
      sp.style.setProperty('--spin', Math.round((Math.random() > 0.5 ? 1 : -1) * (240 + Math.random() * 360)) + 'deg');
      sp.style.setProperty('--op', (0.55 + Math.random() * 0.4).toFixed(2));
      layer.appendChild(sp);
    }
  }

  function seasonFlash(skin) {
    var fl = $('season-flash');
    fl.style.background = skin.wash;
    fl.classList.remove('run');
    void fl.offsetWidth;
    fl.classList.add('run');
  }

  // ---------- 关卡 ----------
  var LV = { idx: 0, def: null, phase: '', dlgIndex: 0, dlgLines: [], puzzleOrder: [], puzzleProgress: 0, answerIndex: 0 };

  function openLevel(idx) {
    var lv = D.getLevel(idx);
    if (!lv) return;
    LV.idx = idx;
    LV.def = lv;
    var isLocked = !lv.free && state.unlockedLevels.indexOf(idx) < 0;
    if (isLocked) { renderLocked(); } else { renderDialogue(); }
    $('overlay').classList.remove('hidden');
  }

  function closeLevel() {
    $('overlay').classList.add('hidden');
    renderMap();
  }

  function lvHead() {
    return '<span class="lv-idx">第 ' + (LV.idx + 1) + ' 关</span>' +
      '<span class="lv-name">' + esc(LV.def.name) + '</span>' +
      '<span class="lv-spot">' + D.TYPE_LABEL[LV.def.type] + ' · ' + esc(LV.def.spot) + '</span>';
  }

  function renderLocked() {
    LV.phase = 'locked';
    var shopName = LV.def.shop ? LV.def.shop.name : '';
    $('sheet').innerHTML = lvHead() +
      '<div class="card" style="margin-top:12px;text-align:center;">' +
      '<span class="lock-emoji">🔒</span>' +
      '<span class="lock-title">本关属于进阶关卡（后30%）</span>' +
      '<span class="lock-desc">选择以下任意一种方式即可解锁</span>' +
      '<button class="btn-primary" id="u-pay">① ¥6 付费购买本关</button>' +
      '<button class="btn-ghost" id="u-checkin">② 📍 到「' + esc(shopName) + '」定位打卡</button>' +
      '<button class="btn-ghost" id="u-demo" style="border:1px dashed #c9a86a;font-size:12px;">演示模式：模拟到店打卡</button>' +
      '<button class="btn-ghost" id="u-share">③ 📣 线上宣传本游戏（复制链接）</button>' +
      '<button class="btn-primary hidden" id="u-share-done">我已完成宣传，确认解锁</button>' +
      '<span class="lock-note">宣传方式：把游戏链接发到抖音 / 小红书并 @官方账号，回来点确认即可</span>' +
      '</div>';
    $('u-pay').onclick = function () {
      confirmBox('付费解锁', '以 ¥6 解锁本关（演示环境为模拟支付，不产生真实扣款）？', function () {
        if (state.unlockedLevels.indexOf(LV.idx) < 0) state.unlockedLevels.push(LV.idx);
        saveState();
        toast('解锁成功');
        renderDialogue();
      });
    };
    $('u-checkin').onclick = function () {
      // 浏览器端不强制真实定位：演示定位打卡流程
      confirmBox('到店打卡', '将尝试获取你的位置，距「' + shopName + '」1.5公里内可打卡领店铺优惠。浏览器未授权时可用演示模式。', function () {
        if (!navigator.geolocation) { demoCheckin(); return; }
        var shop = LV.def.shop;
        navigator.geolocation.getCurrentPosition(function (p) {
          var dist = distance(p.coords.latitude, p.coords.longitude, shop.lat, shop.lng);
          if (dist <= 1500) { demoCheckin(); }
          else { confirmBox('距离有点远', '你距店铺约' + Math.round(dist) + '米，到店后可打卡。也可以先用演示模式体验。', demoCheckin); }
        }, function () { demoCheckin(); }, { timeout: 5000 });
      });
    };
    $('u-demo').onclick = demoCheckin;
    $('u-share').onclick = function () {
      copyLink();
      $('u-share-done').classList.remove('hidden');
    };
    $('u-share-done').onclick = function () {
      if (state.unlockedLevels.indexOf(LV.idx) < 0) state.unlockedLevels.push(LV.idx);
      saveState();
      toast('解锁成功');
      renderDialogue();
    };
  }

  function demoCheckin() {
    if (state.unlockedLevels.indexOf(LV.idx) < 0) state.unlockedLevels.push(LV.idx);
    saveState();
    toast('打卡成功，已领取店铺优惠');
    renderDialogue();
  }

  function renderDialogue() {
    LV.phase = 'dialogue';
    var lv = LV.def;
    var npc = lv.npc;
    LV.dlgLines = npc.lines;
    LV.dlgIndex = 0;
    var startLabel = lv.type === 'quiz' ? '开始答题' : (lv.type === 'find' ? '开始寻物' : '开始解谜');
    drawDialogue(startLabel);
  }

  function drawDialogue(startLabel) {
    $('sheet').innerHTML = lvHead() +
      '<div class="card" style="margin-top:12px;">' +
      '<span class="dlg-spot">📍 ' + esc(LV.def.spot) + '</span>' +
      '<div class="dlg-row">' +
      '<div class="dlg-avatar-ring"><span class="dlg-avatar">' + LV.def.npc.emoji + '</span></div>' +
      '<div class="dlg-main"><span class="dlg-name">' + esc(LV.def.npc.name) + '</span>' +
      '<div class="dlg-bubble" id="dlg-bubble"><span class="dlg-text">' + esc(LV.dlgLines[LV.dlgIndex]) + '</span>' +
      (LV.dlgIndex < LV.dlgLines.length - 1 ? '<span class="dlg-next">▼</span>' : '') +
      '</div></div></div>' +
      (LV.dlgIndex < LV.dlgLines.length - 1
        ? '<button class="btn-ghost" id="dlg-skip">跳过对话 »</button>'
        : '<button class="btn-primary" id="dlg-start">' + startLabel + '</button>') +
      '</div>';
    $('dlg-bubble').onclick = function () {
      if (LV.dlgIndex < LV.dlgLines.length - 1) { LV.dlgIndex++; drawDialogue(startLabel); }
    };
    var skip = $('dlg-skip');
    if (skip) skip.onclick = function () { LV.dlgIndex = LV.dlgLines.length - 1; drawDialogue(startLabel); };
    var start = $('dlg-start');
    if (start) start.onclick = function () { renderPlay(); };
  }

  function renderPlay() {
    var lv = LV.def;
    LV.phase = lv.type;
    if (lv.type === 'quiz') {
      LV.answerIndex = lv.quiz.answer;
      var optsHtml = '';
      lv.quiz.options.forEach(function (t, i) {
        optsHtml += '<div class="opt-item" data-i="' + i + '"><span class="opt-mark">' + '甲乙丙'[i] + '</span><span class="opt-text">' + esc(t) + '</span></div>';
      });
      $('sheet').innerHTML = lvHead() +
        '<div class="card" style="margin-top:12px;"><span class="q-text">' + esc(lv.quiz.question) + '</span>' + optsHtml + '</div>';
      Array.prototype.forEach.call($('sheet').querySelectorAll('.opt-item'), function (el) {
        el.onclick = function () { tapOption(Number(el.getAttribute('data-i'))); };
      });
    } else if (lv.type === 'find') {
      var items = lv.find.items.map(function (it) {
        return { id: it.id, emoji: it.emoji, name: it.name, target: !!it.target, found: false };
      });
      LV.findItems = items;
      LV.foundCount = 0;
      LV.findTotal = items.filter(function (it) { return it.target; }).length;
      drawFind();
    } else if (lv.type === 'puzzle') {
      var shuffled = lv.puzzle.order.slice();
      for (var j = shuffled.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = shuffled[j]; shuffled[j] = shuffled[k]; shuffled[k] = tmp;
      }
      var same = true;
      for (var m = 0; m < shuffled.length; m++) { if (shuffled[m] !== lv.puzzle.order[m]) { same = false; break; } }
      if (same) { var first = shuffled.shift(); shuffled.push(first); }
      LV.puzzleOrder = shuffled;
      LV.puzzleCorrect = lv.puzzle.order;
      LV.puzzleProgress = 0;
      LV.puzzleLit = shuffled.map(function () { return false; });
      drawPuzzle();
    }
  }

  function drawFind() {
    var lv = LV.def;
    var cells = '';
    LV.findItems.forEach(function (it) {
      cells += '<div class="find-cell' + (it.found ? ' found' : '') + '" data-id="' + it.id + '">' +
        '<span class="find-emoji">' + it.emoji + '</span><span class="find-name">' + esc(it.name) + '</span>' +
        (it.found ? '<span class="find-badge">✓</span>' : '') + '</div>';
    });
    $('sheet').innerHTML = lvHead() +
      '<div class="card" style="margin-top:12px;"><span class="q-text">在' + esc(lv.find.scene) + '里找到这些宝贝：</span>' +
      '<span class="q-target">' + esc(lv.find.targets.join('、')) + '</span>' +
      '<span class="q-sub">已找到 ' + LV.foundCount + '/' + LV.findTotal + ' · 点错的会抖一下哦</span>' +
      '<div class="find-grid">' + cells + '</div></div>';
    Array.prototype.forEach.call($('sheet').querySelectorAll('.find-cell'), function (el) {
      el.onclick = function () { tapFind(el.getAttribute('data-id'), el); };
    });
  }

  function tapFind(id, el) {
    var item = null;
    LV.findItems.forEach(function (it) { if (it.id === id) item = it; });
    if (!item || item.found) return;
    if (item.target) {
      item.found = true;
      LV.foundCount++;
      if (navigator.vibrate) navigator.vibrate(30);
      drawFind();
      if (LV.foundCount >= LV.findTotal) setTimeout(win, 400);
    } else {
      el.classList.add('wrong');
      toast('不是这个哦～');
      setTimeout(function () { el.classList.remove('wrong'); }, 600);
    }
  }

  function drawPuzzle() {
    var lv = LV.def;
    var steps = '';
    LV.puzzleOrder.forEach(function (text, i) {
      steps += '<div class="pz-step' + (LV.puzzleLit[i] ? ' lit' : '') + '" data-i="' + i + '">' +
        '<span class="pz-no">' + (i + 1) + '</span><span class="pz-text">' + esc(text) + '</span></div>';
    });
    $('sheet').innerHTML = lvHead() +
      '<div class="card" style="margin-top:12px;"><span class="q-text">' + esc(lv.puzzle.prompt) + '</span>' +
      '<span class="q-sub">按正确顺序逐个点亮，点错将全部重置</span>' +
      '<div>' + steps + '</div></div>';
    Array.prototype.forEach.call($('sheet').querySelectorAll('.pz-step'), function (el) {
      el.onclick = function () { tapPuzzle(Number(el.getAttribute('data-i'))); };
    });
  }

  function tapPuzzle(i) {
    if (LV.puzzleLit[i]) return;
    if (LV.puzzleOrder[i] === LV.puzzleCorrect[LV.puzzleProgress]) {
      LV.puzzleLit[i] = true;
      LV.puzzleProgress++;
      if (navigator.vibrate) navigator.vibrate(30);
      drawPuzzle();
      if (LV.puzzleProgress >= LV.puzzleOrder.length) setTimeout(win, 400);
    } else {
      LV.puzzleLit = LV.puzzleLit.map(function () { return false; });
      LV.puzzleProgress = 0;
      drawPuzzle();
      toast('顺序不对，重新来～');
    }
  }

  function tapOption(i) {
    if (LV.phase !== 'quiz') return;
    var el = $('sheet').querySelector('.opt-item[data-i="' + i + '"]');
    if (!el || el.classList.contains('right') || el.classList.contains('wrong')) return;
    if (i === LV.answerIndex) {
      el.classList.add('right');
      if (navigator.vibrate) navigator.vibrate(30);
      setTimeout(win, 500);
    } else {
      el.classList.add('wrong');
      toast('再想想哦～');
      setTimeout(function () { el.classList.remove('wrong'); }, 700);
    }
  }

  function win() {
    var lv = LV.def;
    var gid = lv.galleryId;
    var item = D.getGalleryItem(gid);
    if (state.cleared.indexOf(LV.idx) < 0) state.cleared.push(LV.idx);
    if (gid && state.galleryCollected.indexOf(gid) < 0) state.galleryCollected.push(gid);
    saveState();
    LV.phase = 'won';
    var know = lv.quiz ? lv.quiz.knowledge : '新民大街的每一栋老建筑，都是一段可以触摸的历史。慢逛细品，四时俱好。';
    $('sheet').innerHTML = lvHead() +
      '<div class="card won-card" style="margin-top:12px;">' +
      '<span class="won-emoji">🎉</span><span class="won-title">闯关成功！</span>' +
      '<div class="know-box"><span class="know-title">📜 历史小知识</span><span class="know-text">' + esc(know) + '</span></div>' +
      '<div class="reward-box"><span class="reward-emoji">' + item.emoji + '</span>' +
      '<div><span class="reward-name">图鉴 +1：' + esc(item.name) + '</span>' +
      '<span class="reward-desc">已收入图鉴，可在图鉴页以9折购买实物</span></div></div>' +
      (clearedCount() >= LEVELS.length ? '<div class="coupon-tip">🏆 全部通关！快去「奖励」页兑换线下好礼</div>' : '') +
      '<button class="btn-primary" id="won-back">返回大街 →</button></div>';
    $('won-back').onclick = closeLevel;
  }

  function distance(lat1, lng1, lat2, lng2) {
    var rad = Math.PI / 180;
    var dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function copyLink() {
    var url = location.href.split('#')[0];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast('链接已复制，去抖音/小红书发布吧'); }, function () { toast(url); });
    } else { toast(url); }
  }

  // ---------- 形象页 ----------
  var avatarTab = 'face';
  function renderAvatar() {
    var face = D.findItem(D.FACES, state.avatar.face);
    var acc = D.findItem(D.ACCS, state.avatar.acc);
    var outfit = D.findItem(D.OUTFITS, state.avatar.outfit);
    var skin = findSkin(state.skin);
    $('avatar-face').textContent = face ? face.emoji : '🧒';
    $('avatar-acc').textContent = acc ? acc.emoji : '🎀';
    $('avatar-circle').style.background = outfit ? outfit.color : '#4a7c59';
    $('avatar-skin').textContent = skin.name;
    $('avatar-circle').style.borderColor = skin.accent;
    $('avatar-stage').style.background = skin.wash;

    var tabs = [['face', '脸型'], ['acc', '配饰'], ['outfit', '衣色']];
    var tabHtml = '';
    tabs.forEach(function (t) {
      tabHtml += '<button class="tab ' + (avatarTab === t[0] ? 'on' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
    });
    $('avatar-tabs').innerHTML = tabHtml;
    Array.prototype.forEach.call($('avatar-tabs').querySelectorAll('.tab'), function (el) {
      el.onclick = function () { avatarTab = el.getAttribute('data-tab'); renderAvatar(); };
    });

    var list, selectedId;
    if (avatarTab === 'face') {
      list = D.FACES; selectedId = state.avatar.face;
    } else if (avatarTab === 'acc') {
      list = D.ACCS; selectedId = state.avatar.acc;
    } else {
      list = D.OUTFITS; selectedId = state.avatar.outfit;
    }
    var html = '';
    list.forEach(function (it) {
      var locked = !it.free && !state.advancedOwned;
      var emoji = avatarTab === 'outfit' ? (face ? face.emoji : '🧒') : it.emoji;
      var style = avatarTab === 'outfit' ? 'background:' + it.color + ';' : '';
      html += '<div class="opt-cell' + (it.id === selectedId ? ' sel' : '') + (locked ? ' lock' : '') + '" data-id="' + it.id + '">' +
        '<div class="opt-emoji-wrap" style="' + style + '"><span class="opt-emoji">' + emoji + '</span></div>' +
        '<span class="opt-name">' + esc(it.name) + '</span>' +
        (locked ? '<span class="opt-lock">进阶🔒</span>' : '') + '</div>';
    });
    $('avatar-opts').innerHTML = html;
    Array.prototype.forEach.call($('avatar-opts').querySelectorAll('.opt-cell'), function (el) {
      el.onclick = function () { tapAvatarOption(el.getAttribute('data-id')); };
    });

    $('btn-advanced').classList.toggle('hidden', !!state.advancedOwned);
    $('btn-advanced-owned').classList.toggle('hidden', !state.advancedOwned);

    var skinsHtml = '';
    D.SKINS.forEach(function (s) {
      var unlocked = clearedCount() >= s.need;
      var stateText = s.need === 0 ? '新九街主题 · 免费' : (unlocked ? '已解锁（通关' + clearedCount() + '关）' : '通关 ' + s.need + ' 关解锁');
      skinsHtml += '<div class="skin-row' + (s.key === state.skin ? ' sel' : '') + '" data-key="' + s.key + '">' +
        '<div class="skin-swatch" style="background:' + s.wash + ';border-color:' + s.accent + ';">' + s.emoji + '</div>' +
        '<div class="skin-info"><span class="skin-name">' + esc(s.name) + '</span><span class="skin-desc">' + stateText + '</span></div>' +
        '<span class="skin-state">' + (s.key === state.skin ? '使用中 ✓' : (unlocked ? '可换' : '🔒')) + '</span></div>';
    });
    $('skin-list').innerHTML = skinsHtml;
    Array.prototype.forEach.call($('skin-list').querySelectorAll('.skin-row'), function (el) {
      el.onclick = function () {
        var s = findSkin(el.getAttribute('data-key'));
        if (clearedCount() < s.need) { toast('通关 ' + s.need + ' 关后解锁'); return; }
        state.skin = s.key;
        saveState();
        renderAvatar();
        toast('已换上' + s.name);
      };
    });
  }

  function tapAvatarOption(id) {
    var list = avatarTab === 'face' ? D.FACES : (avatarTab === 'acc' ? D.ACCS : D.OUTFITS);
    var item = D.findItem(list, id);
    if (!item) return;
    if (!item.free && !state.advancedOwned) {
      confirmBox('进阶形象', '「' + item.name + '」属于进阶装扮，¥6 解锁全套进阶形象（模拟支付）？', function () {
        state.advancedOwned = true;
        saveState();
        applyAvatarChoice(id, list);
        toast('进阶形象已解锁');
        renderAvatar();
      });
      return;
    }
    applyAvatarChoice(id, list);
    saveState();
    renderAvatar();
  }

  function applyAvatarChoice(id, list) {
    if (list === D.FACES) state.avatar.face = id;
    else if (list === D.ACCS) state.avatar.acc = id;
    else state.avatar.outfit = id;
  }

  // ---------- 图鉴页 ----------
  function renderGallery() {
    var collectedN = state.galleryCollected.length;
    $('g-progress-num').textContent = '已收集 ' + collectedN + '/' + D.GALLERY.length;
    $('g-progress-fill').style.width = Math.round((collectedN / D.GALLERY.length) * 100) + '%';

    var html = '';
    D.GALLERY.forEach(function (g) {
      var collected = state.galleryCollected.indexOf(g.id) >= 0;
      var bought = state.paidGallery.indexOf(g.id) >= 0;
      var hint = g.desc;
      if (!collected) {
        hint = '通关对应关卡解锁';
        for (var i = 0; i < LEVELS.length; i++) {
          if (LEVELS[i].galleryId === g.id) { hint = '通关第' + (i + 1) + '关「' + LEVELS[i].name + '」解锁'; break; }
        }
      }
      var salePrice = Math.round(g.price * 0.9 * 10) / 10;
      html += '<div class="card g-card' + (collected ? '' : ' unknown') + '">' +
        '<span class="g-emoji">' + (collected ? g.emoji : '❓') + '</span>' +
        '<span class="g-name">' + (collected ? esc(g.name) : '待解锁') + '</span>' +
        '<span class="g-hint">' + esc(hint) + '</span>' +
        (collected
          ? '<div class="g-price-row"><span class="g-price-origin">线下价 ¥' + g.price + '</span><span class="g-price-sale">游戏价 ¥' + salePrice + '</span></div>' +
            '<button class="g-buy' + (bought ? ' done' : '') + '" data-id="' + g.id + '">' + (bought ? '已下单 ✓' : '低10% 购买') + '</button>'
          : '') +
        '</div>';
    });
    $('g-grid').innerHTML = html;
    Array.prototype.forEach.call($('g-grid').querySelectorAll('.g-buy'), function (el) {
      el.onclick = function () { tapBuy(el.getAttribute('data-id')); };
    });
  }

  function tapBuy(id) {
    var item = D.getGalleryItem(id);
    var salePrice = Math.round(item.price * 0.9 * 10) / 10;
    confirmBox('购买藏品', '「' + item.name + '」游戏价 ¥' + salePrice + '（线下门店原价 ¥' + item.price + '，低10%）。演示环境为模拟下单，成功后凭订单到线下门店核销提货。', function () {
      if (state.paidGallery.indexOf(id) < 0) state.paidGallery.push(id);
      saveState();
      toast('下单成功，到店核销');
      renderGallery();
    });
  }

  // ---------- 奖励页 ----------
  function renderRewards() {
    var n = clearedCount();
    var all = n >= LEVELS.length;
    $('r-progress-text').textContent = '已通关 ' + n + '/' + LEVELS.length + ' 关（' + Math.round((n / LEVELS.length) * 100) + '%）';
    $('r-progress-fill').style.width = Math.round((n / LEVELS.length) * 100) + '%';
    $('map2').classList.toggle('open', all);
    $('map2-emoji').textContent = all ? '🗺️' : '🔒';
    $('map2-desc').textContent = all ? '通关100%已解锁，新地图制作中，敬请期待' : '通关100%第一张地图【新民大街】后解锁';
    $('r-sub').textContent = all ? '恭喜全部通关！选择一件线下好礼吧' : '全部通关后可兑换新九街线下指定店铺的文创礼品、代金券';

    var html = '';
    D.VOUCHERS.forEach(function (v) {
      html += '<div class="v-row' + (v.id === state.redeemed ? ' sel' : '') + (all ? '' : ' dim') + '" data-id="' + v.id + '">' +
        '<span class="v-emoji">' + v.emoji + '</span>' +
        '<div class="v-info"><span class="v-name">' + esc(v.name) + '</span><span class="v-desc">' + esc(v.desc) + '</span></div>' +
        '<span class="v-check">' + (v.id === state.redeemed ? '已选 ✓' : '选择') + '</span></div>';
    });
    $('v-list').innerHTML = html;
    Array.prototype.forEach.call($('v-list').querySelectorAll('.v-row'), function (el) {
      el.onclick = function () { tapVoucher(el.getAttribute('data-id'), all); };
    });

    var redeemedItem = null;
    D.VOUCHERS.forEach(function (v) { if (v.id === state.redeemed) redeemedItem = v; });
    var mailBox = $('mail-box');
    var showMail = !!(all && redeemedItem && redeemedItem.mail);
    mailBox.classList.toggle('hidden', !showMail);
    if (showMail && !state.mail) state.mail = { name: '', phone: '', address: '' };
    if (showMail) {
      $('mail-name').value = state.mail.name || '';
      $('mail-phone').value = state.mail.phone || '';
      $('mail-address').value = state.mail.address || '';
    }
  }

  function tapVoucher(id, all) {
    if (!all) { toast('全部通关后开启兑换'); return; }
    var item = null;
    D.VOUCHERS.forEach(function (v) { if (v.id === id) item = v; });
    if (!item) return;
    confirmBox('确认选择', '选择「' + item.name + '」作为你的通关奖励？到店出示核销' + (item.mail ? '，或填写地址邮寄到家' : '') + '。', function () {
      state.redeemed = id;
      saveState();
      toast('奖励已锁定 🎉');
      renderRewards();
    });
  }

  function saveMail() {
    var mail = {
      name: $('mail-name').value.trim(),
      phone: $('mail-phone').value.trim(),
      address: $('mail-address').value.trim(),
    };
    if (!mail.name || !mail.phone || !mail.address) { toast('请填写完整邮寄信息'); return; }
    state.mail = mail;
    saveState();
    toast('邮寄信息已保存');
  }

  // ---------- 初始化 ----------
  function init() {
    $('tab-map').onclick = function () { switchTab('map'); };
    $('tab-avatar').onclick = function () { switchTab('avatar'); };
    $('tab-gallery').onclick = function () { switchTab('gallery'); };
    $('tab-rewards').onclick = function () { switchTab('rewards'); };
    $('overlay-close').onclick = closeLevel;
    $('btn-advanced').onclick = function () {
      confirmBox('进阶形象', '¥6 一次性解锁全部进阶脸型、配饰与衣色（演示环境为模拟支付）？', function () {
        state.advancedOwned = true;
        saveState();
        toast('解锁成功 🎉');
        renderAvatar();
      });
    };
    $('btn-share').onclick = copyLink;
    $('mail-save').onclick = saveMail;

    // 点地图任意位置 → 小人走过去（牌匾点击由各自 handler 接管）
    var mapWrap = document.querySelector('.map-wrap');
    mapWrap.addEventListener('click', function (ev) {
      if (ev.target.closest('.node')) return;
      var rect = mapWrap.getBoundingClientRect();
      var x = (ev.clientX - rect.left) / rect.width * 100;
      var y = (ev.clientY - rect.top) / rect.height * 100;
      movePlayerTo(x, y);
    });

    // 键盘方向键 / WASD 操控（仅在地图页生效）
    var KEYMAP = {
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right',
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowDown: 'down', s: 'down', S: 'down',
    };
    document.addEventListener('keydown', function (ev) {
      if ($('view-map').classList.contains('hidden')) return;
      if (!$('overlay').classList.contains('hidden')) return;
      var d = KEYMAP[ev.key];
      if (!d) return;
      if (ev.key.indexOf('Arrow') === 0) ev.preventDefault();
      if (!keyDirs[d]) { keyDirs[d] = true; startMoveLoop(); }
    });
    document.addEventListener('keyup', function (ev) {
      var d = KEYMAP[ev.key];
      if (d) keyDirs[d] = false;
    });

    switchTab('map');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
