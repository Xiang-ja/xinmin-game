// 新民向新 · 游戏静态数据（网页版，与小程序版一致）
// 历史知识文案基于公开常识整理，正式上线前建议由项目方核对校准。
window.XM = (function () {
  var TYPE_LABEL = { quiz: '答题', find: '寻物', puzzle: '解谜' };

  // 十个关卡：前 7 关（70%）免费，后 3 关（30%）需解锁
  // pos 为手绘地图上的百分比坐标
  var LEVELS = [
    {
      idx: 0, name: '新民广场 · 序章', short: '新民广场', emoji: '⛲', spot: '新民广场',
      type: 'quiz', free: true, galleryId: 'g1', pos: { x: 50, y: 87 },
      npc: { name: '街长爷爷', emoji: '🧓', lines: ['欢迎来到新民大街的南端起点——新民广场！', '这条约1.5公里的大街，藏着半部长春近代史。', '先考考你：这条街当年叫什么名字？'] },
      quiz: {
        question: '新民大街在伪满时期曾叫什么名字？',
        options: ['顺天大街', '大同大街', '兴亚大街'],
        answer: 0,
        knowledge: '新民大街建成于1930年代，曾名"顺天大街"；抗战胜利后更名"新民大街"，取"弃旧图新、与民更始"之意。它南起新民广场，北至文化广场，全长约1.5公里，是长春百年街脉的核心。',
      },
    },
    {
      idx: 1, name: '伪满国务院旧址', short: '国务院旧址', emoji: '🏫', spot: '新民大街 · 东侧',
      type: 'quiz', free: true, galleryId: 'g2', pos: { x: 74, y: 66 },
      npc: { name: '小小讲解员', emoji: '👧', lines: ['看！这栋气派的大楼，是整条街上体量最大的老建筑。', '它曾是"伪满洲国国务院"，如今天天传出大学生的读书声。', '猜猜它现在是哪所大学的楼？'] },
      quiz: {
        question: '伪满洲国国务院旧址，如今是哪所大学的建筑？',
        options: ['吉林大学', '东北师范大学', '长春理工大学'],
        answer: 0,
        knowledge: '伪满洲国国务院旧址现为吉林大学基础医学院教学楼，是新民大街上体量最大的历史建筑，兴亚式风格庄重恢弘，被称为街上的"门面担当"。',
      },
    },
    {
      idx: 2, name: '吉林茶书馆 · 一盏茶', short: '茶书馆', emoji: '🍵', spot: '吉林茶书馆',
      type: 'find', free: true, galleryId: 'g3', pos: { x: 78, y: 47 },
      npc: { name: '猫店长', emoji: '🐈', lines: ['喵～欢迎来到吉林茶书馆。', '我在店里藏了三样宝贝：盖碗茶、线装书、茶宠。', '帮我找出来，就请你喝一盏春天！'] },
      find: {
        scene: '吉林茶书馆',
        targets: ['盖碗茶', '线装书', '茶宠'],
        items: [
          { id: 'f1', emoji: '🍵', name: '盖碗茶', target: true },
          { id: 'f2', emoji: '📖', name: '线装书', target: true },
          { id: 'f3', emoji: '🐸', name: '茶宠', target: true },
          { id: 'f4', emoji: '🌿', name: '绿植' },
          { id: 'f5', emoji: '🖼️', name: '挂画' },
          { id: 'f6', emoji: '☕', name: '手冲咖啡' },
          { id: 'f7', emoji: '🍰', name: '点心' },
          { id: 'f8', emoji: '🪟', name: '木格窗' },
          { id: 'f9', emoji: '🕯️', name: '香薰' },
          { id: 'f10', emoji: '🐈', name: '猫店长' },
          { id: 'f11', emoji: '📦', name: '茶叶罐' },
          { id: 'f12', emoji: '🎐', name: '风铃' },
        ],
      },
    },
    {
      idx: 3, name: '朝阳公园 · 湖畔谜踪', short: '朝阳公园', emoji: '🌳', spot: '朝阳公园',
      type: 'puzzle', free: true, galleryId: 'g4', pos: { x: 22, y: 68 },
      npc: { name: '风筝少年', emoji: '🪁', lines: ['湖边风景四时不同：春樱、夏荷、秋杏、冬凇。', '刚才一阵大风，把四季的顺序全吹乱啦！', '帮我把"春 → 夏 → 秋 → 冬"重新点亮吧！'] },
      puzzle: {
        prompt: '湖畔四季乱了顺序，请按"春 → 夏 → 秋 → 冬"依次点亮风景。',
        order: ['🌸 樱粉初绽', '🌿 荷风绿荫', '🍂 银杏铺金', '❄️ 雾凇盈枝'],
      },
    },
    {
      idx: 4, name: '伪满军事部旧址', short: '军事部旧址', emoji: '🏥', spot: '新民大街 · 北段',
      type: 'quiz', free: true, galleryId: 'g5', pos: { x: 22, y: 31 },
      npc: { name: '医生姐姐', emoji: '👩‍⚕️', lines: ['这栋老楼如今是医院，救死扶伤几十年啦。', '它的前身，是伪满时期的军事部。', '你知道它现在是哪家医院吗？'] },
      quiz: {
        question: '伪满军事部旧址如今是哪家医院？',
        options: ['吉林大学白求恩第一医院', '吉林省人民医院', '长春市中心医院'],
        answer: 0,
        knowledge: '伪满军事部旧址现为吉林大学白求恩第一医院。新民大街两侧的伪满旧址群如今多由高校与医院使用，因此这条街也被称为"露天建筑博物馆"。',
      },
    },
    {
      idx: 5, name: '历史文化书吧 · 寻香', short: '历史书吧', emoji: '📚', spot: '长春历史文化书吧',
      type: 'find', free: true, galleryId: 'g6', pos: { x: 20, y: 48 },
      npc: { name: '老馆长', emoji: '👓', lines: ['欢迎来到长春历史文化书吧，这里的故事比书架还高。', '可我的文房三宝不见了：毛笔、镇纸、蓝印花布。', '麻烦小侦探帮我找找！'] },
      find: {
        scene: '长春历史文化书吧',
        targets: ['毛笔', '镇纸', '蓝印花布'],
        items: [
          { id: 'b1', emoji: '🖌️', name: '毛笔', target: true },
          { id: 'b2', emoji: '🪨', name: '镇纸', target: true },
          { id: 'b3', emoji: '🧵', name: '蓝印花布', target: true },
          { id: 'b4', emoji: '📚', name: '书墙' },
          { id: 'b5', emoji: '🫖', name: '茶壶' },
          { id: 'b6', emoji: '🪑', name: '木椅' },
          { id: 'b7', emoji: '🔍', name: '放大镜' },
          { id: 'b8', emoji: '🗓️', name: '老日历' },
          { id: 'b9', emoji: '🏮', name: '宫灯' },
          { id: 'b10', emoji: '✉️', name: '旧信封' },
          { id: 'b11', emoji: '🎧', name: '耳机' },
          { id: 'b12', emoji: '🪴', name: '盆栽' },
        ],
      },
    },
    {
      idx: 6, name: '文化广场 · 地质宫', short: '文化广场', emoji: '🏯', spot: '文化广场',
      type: 'quiz', free: true, galleryId: 'g7', pos: { x: 76, y: 30 },
      npc: { name: '鸽子阿姨', emoji: '🕊️', lines: ['地质宫门前就是文化广场，是长春人的城市客厅。', '悄悄告诉你：地质宫的地基，当年是给"新皇宫"预留的。', '来，验证一下你记住了没有！'] },
      quiz: {
        question: '地质宫所在的位置，当年原本计划修建什么？',
        options: ['伪满新皇宫', '火车站', '体育场'],
        answer: 0,
        knowledge: '地质宫建于1950年代，是在伪满"新宫廷"预留地基上建成的教学主楼，因宫殿式样得名；门前的文化广场是今天长春市民最熟悉的城市客厅。',
      },
    },
    {
      idx: 7, name: '伪满经济部旧址', short: '经济部旧址', emoji: '🏦', spot: '新民大街 · 中段',
      type: 'quiz', free: false, galleryId: 'g8', pos: { x: 68, y: 79 },
      shop: { name: '吾麻咖啡 yamu coffee', lat: 43.8699, lng: 125.3129 },
      npc: { name: '咖啡师阿麻', emoji: '☕', lines: ['街边的咖啡香，混着百年砖墙的味道。', '这一带的老楼，曾被人们统称为"八大部"。', '"八"到底指什么呢？答对请你喝咖啡～'] },
      quiz: {
        question: '"伪满八大部"里的"八"，指的是什么？',
        options: ['八个部级机构', '八条街道', '八座宫殿'],
        answer: 0,
        knowledge: '"八大部"泛指伪满洲国的八个部级机构，多分布在新民大街及附近街区。这些旧址是那段历史的重要实物见证，提醒后人勿忘来路。',
      },
    },
    {
      idx: 8, name: '伪满综合法衙 · 年轮', short: '综合法衙', emoji: '⚖️', spot: '新民大街 · 南段',
      type: 'puzzle', free: false, galleryId: 'g9', pos: { x: 30, y: 79 },
      shop: { name: 'LANLIZI BAKERY', lat: 43.8641, lng: 125.3137 },
      npc: { name: '时间信使', emoji: '⏳', lines: ['历史是一条河，有先有后。', '伪满洲国出笼、顺天大街成型、抗战光复、长春解放……', '请按时间先后，点亮这条街的年轮！'] },
      puzzle: {
        prompt: '请按时间先后，点亮新民大街的历史年轮。',
        order: ['1932 伪满洲国出笼', '1936 顺天大街成型', '1945 抗战光复', '1948 长春解放'],
      },
    },
    {
      idx: 9, name: '百年街脉 · 北端终点', short: '北端终点', emoji: '🚩', spot: '文化广场 · 北端',
      type: 'quiz', free: false, galleryId: 'g10', pos: { x: 50, y: 12 },
      shop: { name: '长春历史文化书吧', lat: 43.8758, lng: 125.3145 },
      npc: { name: '街长爷爷', emoji: '🧓', lines: ['恭喜你走到大街北端！身后的宫殿就是地质宫。', '最后一题，答对就能点亮整条新民大街！', '准备好了吗？'] },
      quiz: {
        question: '新民大街的正确走向是？',
        options: ['南起新民广场，北至文化广场', '东起南湖，西至胜利公园', '南起人民广场，北至火车站'],
        answer: 0,
        knowledge: '新民大街南起新民广场、北至文化广场（地质宫），与红旗街、工农大路等相接，已入选中国历史文化街区。走完这1.5公里，就读完了半部长春近代史。',
      },
    },
  ];

  // 图鉴藏品：游戏价 = 线下原价 × 0.9（低10%）
  var GALLERY = [
    { id: 'g1', emoji: '🗺️', name: '老街手绘地图笺', price: 15, desc: '新民大街手绘导览图，可作纪念收藏' },
    { id: 'g2', emoji: '🏛️', name: '国务院旧址印章卡', price: 12, desc: '兴亚式建筑线稿 + 到访打卡印章' },
    { id: 'g3', emoji: '🍵', name: '盖碗茶贴纸', price: 10, desc: '茶书馆联名，一盏茶的时间' },
    { id: 'g4', emoji: '🍂', name: '湖畔银杏书签', price: 8, desc: '朝阳公园秋日限定银杏叶书签' },
    { id: 'g5', emoji: '🧱', name: '青砖纹冰箱贴', price: 18, desc: '取自伪满旧址青砖墙纹理' },
    { id: 'g6', emoji: '🧵', name: '蓝印花布卡', price: 12, desc: '传统印染纹样，书吧限定' },
    { id: 'g7', emoji: '🏮', name: '琉璃瓦挂件', price: 20, desc: '地质宫屋顶琉璃同款配色' },
    { id: 'g8', emoji: '🪙', name: '百年街脉纪念章', price: 25, desc: '新民大街铜质纪念徽章' },
    { id: 'g9', emoji: '⚖️', name: '天平小徽章', price: 15, desc: '综合法衙主题，法理与历史' },
    { id: 'g10', emoji: '📮', name: '终点纪念邮戳', price: 10, desc: '通关纪念，盖戳留念' },
  ];

  var FACES = [
    { id: 'f1', emoji: '🧒', name: '小街坊', free: true },
    { id: 'f2', emoji: '👧', name: '小兰花', free: true },
    { id: 'f3', emoji: '🧚', name: '兰仙子', free: false },
    { id: 'f4', emoji: '🥷', name: '夜行侠', free: false },
  ];

  var ACCS = [
    { id: 'a1', emoji: '🎀', name: '红蝴蝶结', free: true },
    { id: 'a2', emoji: '🧢', name: '棒球帽', free: true },
    { id: 'a3', emoji: '🍀', name: '小幸运', free: true },
    { id: 'a4', emoji: '🪭', name: '团扇', free: false },
    { id: 'a5', emoji: '🐰', name: '兔耳朵', free: false },
  ];

  var OUTFITS = [
    { id: 'o1', color: '#4a7c59', name: '青竹', free: true },
    { id: 'o2', color: '#d8a7b1', name: '藕荷', free: true },
    { id: 'o3', color: '#c0392b', name: '朱砂', free: false },
    { id: 'o4', color: '#3b6e8f', name: '石青', free: false },
    { id: 'o5', color: '#c9a86a', name: '鎏金', free: false },
  ];

  // 四季皮肤：除基础色调外，每季有专属环境滤镜、动态粒子（fx）与地图装饰物（decos）
  // fx: e=表情 m=fall飘落/rise上升/flutter飞舞；fxCount=粒子数；fxMin/fxMax=单程秒数；fxSize=字号范围
  var SKINS = [
    {
      key: 'spring', short: '春', name: '春 · 樱杏新绿', emoji: '🌸',
      accent: '#e07f8f', wash: '#fdf0f2', need: 0, petal: '🌸',
      tint: 'linear-gradient(180deg, rgba(255,168,194,.30) 0%, rgba(255,233,239,.12) 42%, rgba(198,232,208,.22) 100%)',
      fx: [
        { e: '🌸', m: 'fall' }, { e: '🌸', m: 'fall' }, { e: '🌸', m: 'fall' },
        { e: '🩷', m: 'fall' }, { e: '🌸', m: 'fall' }, { e: '🍃', m: 'fall' },
        { e: '🦋', m: 'flutter' },
      ],
      fxCount: 16, fxMin: 8, fxMax: 14, fxSize: [11, 20],
      decos: [
        { e: '🌸', x: 7, y: 10, s: 24 }, { e: '🌸', x: 13, y: 15, s: 16 },
        { e: '🌷', x: 5, y: 66, s: 15 }, { e: '🌱', x: 92, y: 90, s: 14 },
        { e: '🦋', x: 88, y: 26, s: 15, anim: 'flutter' },
      ],
    },
    {
      key: 'summer', short: '夏', name: '夏 · 荷风竹露', emoji: '🌿',
      accent: '#3f9d6b', wash: '#eaf4ec', need: 0, petal: '🌿',
      tint: 'linear-gradient(180deg, rgba(118,204,158,.32) 0%, rgba(180,226,200,.14) 45%, rgba(108,184,224,.22) 100%)',
      fx: [
        { e: '🍃', m: 'fall' }, { e: '🍃', m: 'fall' }, { e: '🌿', m: 'fall' },
        { e: '✨', m: 'rise' }, { e: '✨', m: 'rise' }, { e: '🦋', m: 'flutter' },
      ],
      fxCount: 15, fxMin: 7, fxMax: 13, fxSize: [10, 19],
      decos: [
        { e: '🪷', x: 60, y: 91, s: 20 }, { e: '☀️', x: 90, y: 6, s: 20, anim: 'glow' },
        { e: '🐞', x: 33, y: 62, s: 12, anim: 'flutter' }, { e: '🎋', x: 9, y: 40, s: 16 },
      ],
    },
    {
      key: 'autumn', short: '秋', name: '秋 · 银杏满街', emoji: '🍂',
      accent: '#d9a441', wash: '#fdf3df', need: 0, petal: '🍂',
      tint: 'linear-gradient(180deg, rgba(255,174,86,.34) 0%, rgba(255,214,140,.16) 45%, rgba(214,140,58,.26) 100%)',
      fx: [
        { e: '🍂', m: 'fall' }, { e: '🍂', m: 'fall' }, { e: '🍂', m: 'fall' },
        { e: '🍁', m: 'fall' }, { e: '🌾', m: 'fall' }, { e: '🍂', m: 'fall' },
      ],
      fxCount: 20, fxMin: 5, fxMax: 9.5, fxSize: [12, 22],
      decos: [
        { e: '🍁', x: 90, y: 38, s: 18 }, { e: '🍄', x: 6, y: 88, s: 14 },
        { e: '🌾', x: 94, y: 72, s: 14 }, { e: '🍁', x: 16, y: 8, s: 15 },
      ],
    },
    {
      key: 'winter', short: '冬', name: '冬 · 雾凇雪霁', emoji: '❄️',
      accent: '#7fa8c9', wash: '#eef3f8', need: 0, petal: '❄️',
      tint: 'linear-gradient(180deg, rgba(184,217,242,.42) 0%, rgba(224,238,248,.26) 50%, rgba(255,255,255,.36) 100%)',
      fx: [
        { e: '❄️', m: 'fall' }, { e: '❄️', m: 'fall' }, { e: '🌨️', m: 'fall' },
        { e: '❄️', m: 'fall' }, { e: '✨', m: 'rise' }, { e: '❄️', m: 'fall' },
      ],
      fxCount: 26, fxMin: 8, fxMax: 16, fxSize: [9, 18],
      decos: [
        { e: '⛄', x: 12, y: 84, s: 22 }, { e: '🌨️', x: 88, y: 10, s: 17, anim: 'flutter' },
        { e: '❄️', x: 74, y: 20, s: 15 }, { e: '🧣', x: 20, y: 90, s: 13 },
      ],
    },
  ];

  var VOUCHERS = [
    { id: 'v1', emoji: '☕', name: '吾麻咖啡 · 手冲9折券', desc: '到店出示核销，新民大街店' },
    { id: 'v2', emoji: '🥐', name: 'LANLIZI · 可颂买一送一', desc: '到店出示核销，当日有效' },
    { id: 'v3', emoji: '🧋', name: '珍珠甜研 · 第二杯半价', desc: '到店出示核销' },
    { id: 'v4', emoji: '🎁', name: '吉林文创礼盒（可邮寄）', desc: '填写地址，吉林文创包邮到家', mail: true },
  ];

  function getGalleryItem(id) {
    for (var i = 0; i < GALLERY.length; i++) if (GALLERY[i].id === id) return GALLERY[i];
    return GALLERY[0];
  }
  function getLevel(idx) {
    return (idx >= 0 && idx < LEVELS.length) ? LEVELS[idx] : null;
  }
  function findItem(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  return {
    TYPE_LABEL: TYPE_LABEL, LEVELS: LEVELS, GALLERY: GALLERY, FACES: FACES, ACCS: ACCS,
    OUTFITS: OUTFITS, SKINS: SKINS, VOUCHERS: VOUCHERS,
    getGalleryItem: getGalleryItem, getLevel: getLevel, findItem: findItem,
  };
})();
