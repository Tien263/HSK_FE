const test = require("node:test");
const assert = require("node:assert/strict");

test("dialogue lines assign consistent sides to speakers", () => {
  const lines = [
    { speaker: "王一飞", zh: "AI小语，你好！", pinyin: "AI Xiǎoyǔ, nǐ hǎo!", vi: "Xin chào AI Tiểu Ngữ!" },
    { speaker: "小语", zh: "王老师，你好！", pinyin: "Wáng lǎoshī, nǐ hǎo!", vi: "Chào cô Vương!" },
    { speaker: "王一飞", zh: "大家好！", pinyin: "Dàjiā hǎo!", vi: "Chào cả lớp!" },
    { speaker: "学生们", zh: "老师，您好！", pinyin: "Lǎoshī, nín hǎo!", vi: "Chào cô ạ!" },
    { speaker: "小语", zh: "很高兴见到大家！", pinyin: "Hěn gāoxìng jiàndào dàjiā!", vi: "Rất vui được gặp mọi người!" },
  ];

  const speakers = [];
  lines.forEach((l) => {
    if (l.speaker && !speakers.includes(l.speaker)) {
      speakers.push(l.speaker);
    }
  });

  const getSide = (spk) => {
    const idx = speakers.indexOf(spk);
    return idx % 2 === 0 ? "left" : "right";
  };

  assert.equal(getSide("王一飞"), "left");
  assert.equal(getSide("小语"), "right");
  assert.equal(getSide("学生们"), "left");

  // Quy tắc: Cùng 1 nhân vật luôn ở cùng 1 phía
  const sidesForWang = lines.filter((l) => l.speaker === "王一飞").map((l) => getSide(l.speaker));
  assert.deepEqual(sidesForWang, ["left", "left"]);

  const sidesForXiaoYu = lines.filter((l) => l.speaker === "小语").map((l) => getSide(l.speaker));
  assert.deepEqual(sidesForXiaoYu, ["right", "right"]);
});

test("dynamic json fields are partitioned without losing extra keys", () => {
  const rawJson = {
    meaningVi: "học tập",
    type: "Động từ",
    customMnemonic: "Đứa trẻ ngồi dưới mái nhà đọc sách",
    examTricks: "Thường đi kèm phó từ 努力",
    audioLessonUrl: "https://example.com/audio/lesson1.mp3",
    diagramUrl: "https://example.com/images/structure.png",
    extendedList: ["từ một", "từ hai"],
  };

  const standardKeys = new Set(["meaningVi", "type"]);
  const standard = {};
  const supplementary = {};

  for (const [key, val] of Object.entries(rawJson)) {
    if (standardKeys.has(key)) {
      standard[key] = val;
    } else {
      supplementary[key] = val;
    }
  }

  assert.equal(standard.meaningVi, "học tập");
  assert.equal(standard.type, "Động từ");

  assert.equal(Object.keys(supplementary).length, 5);
  assert.equal(supplementary.customMnemonic, "Đứa trẻ ngồi dưới mái nhà đọc sách");
  assert.equal(supplementary.audioLessonUrl, "https://example.com/audio/lesson1.mp3");
  assert.equal(supplementary.diagramUrl, "https://example.com/images/structure.png");
});
