// hsk-sample-templates.ts
// Pre-configured standardized templates matching the official HSK 3.0 Hanban/CTI 样卷 (from HSK3.0 folder)

export interface ImportedQuestion {
  id: string;
  type: string;
  content: string;
  skill: string;
  points: number;
  correctAnswer: string;
  explanation: string;
  options: { id: string; text?: string; imageUrl?: string }[];
  audioUrl?: string;
  imageUrl?: string;
  pinyin?: string;
  rubric?: string;
}

export function getSampleQuestionsForLevel(level: number): ImportedQuestion[] {
  if (level === 1) {
    const audioUrl = "/HSK3.0/HSK/音频/HSK（一级）样卷.mp3";
    const questions: ImportedQuestion[] = [];
    const ansL = ["C", "A", "B", "A", "C", "C", "A", "A", "B", "C", "E", "F", "B", "D", "A", "A", "B", "C", "A", "C"];
    for (let i = 1; i <= 20; i++) {
      questions.push({
        id: `hsk1_q${i}`,
        type: "listening_choice",
        skill: "LISTENING",
        content: `第 ${i} 题：请听录音并选择正确答案。`,
        points: 2.5,
        correctAnswer: ansL[i - 1],
        explanation: `Theo audio mẫu HSK 1: câu ${i} đáp án đúng là ${ansL[i - 1]}.`,
        audioUrl,
        options: [
          { id: "A", text: "Hình A" },
          { id: "B", text: "Hình B" },
          { id: "C", text: "Hình C" },
        ],
      });
    }

    const ansR = ["F", "A", "D", "B", "C", "D", "E", "C", "B", "A", "F", "A", "B", "C", "E", "B", "B", "C", "C", "A"];
    for (let i = 21; i <= 40; i++) {
      questions.push({
        id: `hsk1_q${i}`,
        type: "multiple_choice",
        skill: "READING",
        content: `第 ${i} 题：阅读并选择与题意相符的选项。`,
        points: 2.5,
        correctAnswer: ansR[i - 21],
        explanation: `Theo đáp án đề mẫu HSK 1: câu ${i} đáp án đúng là ${ansR[i - 21]}.`,
        options: [
          { id: "A", text: "Đáp án A" },
          { id: "B", text: "Đáp án B" },
          { id: "C", text: "Đáp án C" },
          { id: "D", text: "Đáp án D" },
          { id: "E", text: "Đáp án E" },
          { id: "F", text: "Đáp án F" },
        ],
      });
    }
    return questions;
  }

  if (level === 2) {
    const audioUrl = "/HSK3.0/HSK/音频/HSK（二级）样卷.mp3";
    const questions: ImportedQuestion[] = [];
    const ansL = ["B","B","C","A","C","E","A","C","B","F","C","D","B","E","A","A","C","C","A","B","C","A","C","A","C"];
    for (let i = 1; i <= 25; i++) {
      questions.push({
        id: `hsk2_q${i}`,
        type: "listening_choice",
        skill: "LISTENING",
        content: `第 ${i} 题：请听录音并选择正确答案。`,
        points: 2,
        correctAnswer: ansL[i - 1],
        explanation: `Theo audio mẫu HSK 2: câu ${i} đáp án đúng là ${ansL[i - 1]}.`,
        audioUrl,
        options: [
          { id: "A", text: "Đáp án A" },
          { id: "B", text: "Đáp án B" },
          { id: "C", text: "Đáp án C" },
        ],
      });
    }

    const ansR = ["B","E","A","C","F","C","A","D","B","F","D","B","A","F","C","C","D","E","A","B","C","A","B","B","C"];
    for (let i = 26; i <= 50; i++) {
      questions.push({
        id: `hsk2_q${i}`,
        type: "multiple_choice",
        skill: "READING",
        content: `第 ${i} 题：阅读句子并选择正确的对应选项。`,
        points: 2,
        correctAnswer: ansR[i - 26],
        explanation: `Theo đáp án mẫu HSK 2: câu ${i} đáp án đúng là ${ansR[i - 26]}.`,
        options: [
          { id: "A", text: "Lựa chọn A" },
          { id: "B", text: "Lựa chọn B" },
          { id: "C", text: "Lựa chọn C" },
          { id: "D", text: "Lựa chọn D" },
          { id: "E", text: "Lựa chọn E" },
          { id: "F", text: "Lựa chọn F" },
        ],
      });
    }

    for (let i = 51; i <= 55; i++) {
      questions.push({
        id: `hsk2_q${i}`,
        type: "sentence_order",
        skill: "WRITING",
        content: `第 ${i} 题：请将词语排列成正确的句子。`,
        points: 2,
        correctAnswer: "正确 句子 排序",
        explanation: `Trật tự câu đúng chuẩn HSK 2.`,
        options: [
          { id: "1", text: "词语一" },
          { id: "2", text: "词语二" },
          { id: "3", text: "词语三" },
        ],
      });
    }
    const hanziAnswers = ["的", "可", "好", "学", "洗"];
    for (let i = 56; i <= 60; i++) {
      questions.push({
        id: `hsk2_q${i}`,
        type: "fill_blank",
        skill: "WRITING",
        content: `第 ${i} 题：根据拼音在横线上写出汉字。`,
        points: 2,
        correctAnswer: hanziAnswers[i - 56],
        explanation: `Chữ Hán chính xác là: ${hanziAnswers[i - 56]}.`,
        options: [],
      });
    }
    return questions;
  }

  // LEVEL 3 (Default standard 70 questions matching CTI HSK 3 样卷)
  const audioUrl = `/HSK3.0/HSK/音频/HSK（${level === 3 ? "三" : level === 4 ? "四" : level === 5 ? "五" : level === 6 ? "六" : "七—九"}级）样卷.mp3`;
  const questions: ImportedQuestion[] = [];

  // 1-10: 听力第一部分 (Match pictures A-F)
  const p1Answers = ["B", "C", "A", "E", "F", "B", "A", "E", "C", "D"];
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: `hsk3_q${i}`,
      type: "listening_choice",
      skill: "LISTENING",
      content: `第 ${i} 题：请听录音并选择与录音内容相符的图片 (A-F)。`,
      points: 2,
      correctAnswer: p1Answers[i - 1],
      explanation: `Dựa vào file audio mẫu: câu ${i} đáp án đúng là ${p1Answers[i - 1]}.`,
      audioUrl,
      options: [
        { id: "A", text: "Hình A" },
        { id: "B", text: "Hình B" },
        { id: "C", text: "Hình C" },
        { id: "D", text: "Hình D" },
        { id: "E", text: "Hình E" },
        { id: "F", text: "Hình F" },
      ],
    });
  }

  // 11-20: 听力第二部分
  const p2Data = [
    { num: 11, ans: "B", opts: ["A 跳舞", "B 讲故事", "C 唱中文歌"] },
    { num: 12, ans: "A", opts: ["A 住院了", "B 变胖了", "C 太累了"] },
    { num: 13, ans: "B", opts: ["A 9:05", "B 10:15", "C 10:30"] },
    { num: 14, ans: "C", opts: ["A 手表坏了", "B 书包丢了", "C 电脑不能开机"] },
    { num: 15, ans: "A", opts: ["A 宾馆", "B 球场", "C 卫生间"] },
    { num: 16, ans: "B", opts: ["A 是电子书", "B 和历史有关", "C 有五千多页"] },
    { num: 17, ans: "B", opts: ["A 今天", "B 周六", "C 星期天"] },
    { num: 18, ans: "C", opts: ["A 太旧了", "B 离药店远", "C 附近环境好"] },
    { num: 19, ans: "B", opts: ["A 在检票", "B 担心儿子", "C 要出国留学"] },
    { num: 20, ans: "A", opts: ["A 三层的", "B 红色的", "C 水果的"] },
  ];
  for (const item of p2Data) {
    questions.push({
      id: `hsk3_q${item.num}`,
      type: "listening_choice",
      skill: "LISTENING",
      content: `第 ${item.num} 题：听短对话，选择正确答案。`,
      points: 2,
      correctAnswer: item.ans,
      explanation: `Theo nội dung đối thoại trong audio: đáp án đúng là ${item.ans}.`,
      audioUrl,
      options: item.opts.map((o) => ({ id: o.slice(0, 1), text: o.slice(2) })),
    });
  }

  // 21-30: 听力第三部分
  const p3Data = [
    { num: 21, ans: "C", opts: ["A 不做难题", "B 复习汉字", "C 看清楚要求"] },
    { num: 22, ans: "C", opts: ["A 河边", "B 街上", "C 草地上"] },
    { num: 23, ans: "A", opts: ["A 习惯差", "B 每晚扫地", "C 正在洗碗"] },
    { num: 24, ans: "A", opts: ["A 凉快", "B 刮大风", "C 晴天少"] },
    { num: 25, ans: "C", opts: ["A 经常哭", "B 总是吃糖", "C 刷牙时间短"] },
    { num: 26, ans: "C", opts: ["A 出院了", "B 要来做客", "C 已经搬家了"] },
    { num: 27, ans: "A", opts: ["A 害怕水", "B 没人教她", "C 练习不认真"] },
    { num: 28, ans: "A", opts: ["A 叔叔", "B 名人", "C 女朋友"] },
    { num: 29, ans: "C", opts: ["A 北京市", "B 中国东北", "C 其他国家"] },
    { num: 30, ans: "B", opts: ["A 假期长", "B 想看世界", "C 能学外语"] },
  ];
  for (const item of p3Data) {
    questions.push({
      id: `hsk3_q${item.num}`,
      type: "listening_choice",
      skill: "LISTENING",
      content: `第 ${item.num} 题：听长对话或短文，选择正确答案。`,
      points: 2,
      correctAnswer: item.ans,
      explanation: `Theo nội dung đoạn nghe: đáp án chính xác là ${item.ans}.`,
      audioUrl,
      options: item.opts.map((o) => ({ id: o.slice(0, 1), text: o.slice(2) })),
    });
  }

  // 31-40: 阅读第一部分
  const r1Sentences = [
    { num: 31, text: "这条裙子很漂亮，但是我有一条几乎一样的。", ans: "A", exp: "Ghép với A: 那我们还是买别的衣服吧。" },
    { num: 32, text: "你为什么不参加后天的篮球比赛？", ans: "F", exp: "Ghép với F: 我水平不高，怕影响大家。" },
    { num: 33, text: "我把一个本子忘在这儿了，是黑色的，大概这么大。", ans: "B", exp: "Ghép với B: 您刚才坐几号桌？我让服务员找一下。" },
    { num: 34, text: "你不能每天只吃方便面，会生病的。", ans: "C", exp: "Ghép với C: 我会在里面加菜和肉，其实挺健康的。" },
    { num: 35, text: "你喜欢动物园里的哪种动物？", ans: "D", exp: "Ghép với D: 小矮马，它们个子比较小，可爱极了。" },
    { num: 36, text: "没问题，有不明白的问我就行。", ans: "E", exp: "Ghép với E: 我上节数学课没来，能看看你的笔记吗？明天还你。" },
    { num: 37, text: "这位是我爱人张南，他在图书馆上班。", ans: "A", exp: "Ghép với A: 您好！我是李冰，是您妻子的同事。" },
    { num: 38, text: "他休假了，你有事可以给他发邮件。", ans: "C", exp: "Ghép với C: 经理怎么不在办公室？" },
    { num: 39, text: "别急，我已经上电梯了。", ans: "D", exp: "Ghép với D: 你到哪儿了？表演快开始了。" },
    { num: 40, text: "请问香蕉多少钱一公斤？", ans: "B", exp: "Ghép với B: 八元五角。要不要来点儿？" },
  ];
  for (const item of r1Sentences) {
    const opts = item.num <= 35
      ? [
          { id: "A", text: "那我们还是买别的衣服吧。" },
          { id: "B", text: "您刚才坐几号桌？我让服务员找一下。" },
          { id: "C", text: "我会在里面加菜和肉，其实挺健康的。" },
          { id: "D", text: "小矮马，它们个子比较小，可爱极了。" },
          { id: "E", text: "当然。我们先坐公交车，然后换地铁。" },
          { id: "F", text: "我水平不高，怕影响大家。" },
        ]
      : [
          { id: "A", text: "您好！我是李冰，是您妻子的同事。" },
          { id: "B", text: "八元五角。要不要来点儿？" },
          { id: "C", text: "经理怎么不在办公室？" },
          { id: "D", text: "你到哪儿了？表演快开始了。" },
          { id: "E", text: "我上节数学课没来，能看看你的笔记吗？明天还你。" },
        ];
    questions.push({
      id: `hsk3_q${item.num}`,
      type: "multiple_choice",
      skill: "READING",
      content: `第 ${item.num} 题：选择最合适的一项与句子相呼应。\n\n「${item.text}」`,
      points: 2,
      correctAnswer: item.ans,
      explanation: item.exp,
      options: opts,
    });
  }

  // 41-50: 阅读第二部分
  const r2Items = [
    { num: 41, text: "女儿下（ ）要上初中三年级了。", ans: "D", word: "学期" },
    { num: 42, text: "那个男孩儿这个月一共（ ）七回了。", ans: "B", word: "迟到" },
    { num: 43, text: "这儿有一（ ）信，好像是给你的。", ans: "C", word: "封" },
    { num: 44, text: "洗手间（ ）小，放不下那么大的洗衣机。", ans: "A", word: "地方" },
    { num: 45, text: "在大人的帮助下，妹妹（ ）学会了用筷子吃饭。", ans: "F", word: "终于" },
    { num: 46, text: "A：你的声音怎么变成这样了？\nB：我昨天开了一晚上空调，早上起来就（ ）了。", ans: "F", word: "感冒" },
    { num: 47, text: "A：您口渴了吧？要不要喝杯茶（ ）咖啡？\nB：不用了，我喝矿泉水就行。", ans: "A", word: "或者" },
    { num: 48, text: "A：别一边过（ ），一边玩手机，小心路上的车！\nB：对不起，我以后不这样了。", ans: "E", word: "马路" },
    { num: 49, text: "A：等我一下，我去洗个澡，然后跟你们（ ）聊天儿。\nB：好，快去吧。", ans: "B", word: "一块儿" },
    { num: 50, text: "A：你网球为什么打得这么好？\nB：因为我去年一半（ ）的时间都在练习打球。", ans: "C", word: "以上" },
  ];
  for (const item of r2Items) {
    const opts = item.num <= 45
      ? [
          { id: "A", text: "A 地方" },
          { id: "B", text: "B 迟到" },
          { id: "C", text: "C 封" },
          { id: "D", text: "D 学期" },
          { id: "E", text: "E 鞋" },
          { id: "F", text: "F 终于" },
        ]
      : [
          { id: "A", text: "A 或者" },
          { id: "B", text: "B 一块儿" },
          { id: "C", text: "C 以上" },
          { id: "D", text: "D 护照" },
          { id: "E", text: "E 马路" },
          { id: "F", text: "F 感冒" },
        ];
    questions.push({
      id: `hsk3_q${item.num}`,
      type: "multiple_choice",
      skill: "READING",
      content: `第 ${item.num} 题：选词填空。\n\n${item.text}`,
      points: 2,
      correctAnswer: item.ans,
      explanation: `Từ cần điền là ${item.ans} (${item.word}).`,
      options: opts,
    });
  }

  // 51-60: 阅读第三部分
  const r3Items = [
    {
      num: 51,
      passage: "小海刚来中国生活，除了我以外，没什么认识的人。快要到春节了，我想请他来咱们家过节，一起包饺子、看电视。\n★ 小海：",
      opts: [{ id: "A", text: "是游客" }, { id: "B", text: "打算请客" }, { id: "C", text: "来中国不久" }],
      ans: "C",
      exp: "Đoạn văn viết: '小海刚来中国生活' -> Đến Trung Quốc chưa lâu (来中国不久)."
    },
    {
      num: 52,
      passage: "难过的时候，我会选择做一些运动，比如出去跑跑步、骑会儿车。每次不需要锻炼太久，只要让身体动起来，我心里就会觉得舒服很多。\n★ 他难过时会怎么做？",
      opts: [{ id: "A", text: "笑一笑" }, { id: "B", text: "锻炼身体" }, { id: "C", text: "喝几瓶饮料" }],
      ans: "B",
      exp: "Đoạn văn viết: '做一些运动，比如出去跑跑步、骑会儿车' -> Tập thể dục (锻炼身体)."
    },
    {
      num: 53,
      passage: "那个公园非常有名，它有个好听的名字，叫“城市花园”，因为里面到处都开着漂亮的花。\n★ 那个公园：",
      opts: [{ id: "A", text: "在山上" }, { id: "B", text: "花特别多" }, { id: "C", text: "可以坐船" }],
      ans: "B",
      exp: "Đoạn văn viết: '到处都开着漂亮的花' -> Rất nhiều hoa (花特别多)."
    },
    {
      num: 54,
      passage: "爷爷在一个小学旁边开了家饭店，只卖面条儿、鸡腿和羊肉包子，孩子们放学后都会去那儿买吃的。\n★ 关于那家饭店，可以知道什么？",
      opts: [{ id: "A", text: "没有菜单" }, { id: "B", text: "在校园里" }, { id: "C", text: "受小学生欢迎" }],
      ans: "C",
      exp: "Đoạn văn viết: '孩子们放学后都会去那儿买吃的' -> Được học sinh tiểu học yêu thích."
    },
    {
      num: 55,
      passage: "我把名单发给大家了，请再检查一下自己的姓名、电话、邮箱，如果有问题，请在星期日中午前找我。\n★ 他让大家检查：",
      opts: [{ id: "A", text: "电话号码" }, { id: "B", text: "上衣大小" }, { id: "C", text: "银行卡号" }],
      ans: "A",
      exp: "Đoạn văn liệt kê: '检查一下自己的姓名、电话、邮箱' -> Số điện thoại (电话号码)."
    },
    {
      num: 56,
      passage: "为了让班里的学生看得更清楚，我会用不同颜色的笔在黑板上写字：黄色的是常用的字词和句子，白色的是课文，蓝色的是作业。\n★ 他用什么颜色的笔写常用字词？",
      opts: [{ id: "A", text: "绿色" }, { id: "B", text: "蓝色" }, { id: "C", text: "黄色" }],
      ans: "C",
      exp: "Đoạn văn nêu rõ: '黄色的是常用的字词和句子' -> Màu vàng (黄色)."
    },
    {
      num: 57,
      passage: "兴趣是最好的老师。如果对一件事情很感兴趣，人们一般会花更多时间学习，也更容易坚持。比如我对照相很感兴趣，为了提高自己的水平，我常常去外边拍照，还会在网上学习不同的拍照方法。\n★ 根据这段话，感兴趣的事情：",
      opts: [{ id: "A", text: "不难坚持" }, { id: "B", text: "可能变化" }, { id: "C", text: "必须是有用的" }],
      ans: "A",
      exp: "Đoạn văn viết: '也更容易坚持' -> Dễ kiên trì / không khó kiên trì (不难坚持)."
    },
    {
      num: 58,
      passage: "兴趣是最好的老师。如果对一件事情很感兴趣，人们一般会花更多时间学习，也更容易坚持。比如我对照相很感兴趣，为了提高自己的水平，我常常去外边拍照，还会在网上学习不同的拍照方法。\n★ 为了提高拍照水平，他：",
      opts: [{ id: "A", text: "去大学上课" }, { id: "B", text: "常出门拍照" }, { id: "C", text: "买不同的相机" }],
      ans: "B",
      exp: "Đoạn văn viết: '我常常去外边拍照' -> Thường ra ngoài chụp ảnh (常出门拍照)."
    },
    {
      num: 59,
      passage: "我过去一直不快乐，因为我总是在努力让别人满意，以为这样才能得到大家的关注和喜爱。后来我慢慢懂得了：让自己满意才是最重要的。我开始学会对别人说“不”，开始认真地关心和照顾自己。这不但让我感到快乐，而且也让我和家人、朋友的关系越来越近了。\n★ 他过去：",
      opts: [{ id: "A", text: "非常爱生气" }, { id: "B", text: "希望别人满意" }, { id: "C", text: "不相信身边的人" }],
      ans: "B",
      exp: "Đoạn văn viết: '总是在努力让别人满意' -> Hi vọng người khác hài lòng (希望别人满意)."
    },
    {
      num: 60,
      passage: "我过去一直不快乐，因为我总是在努力让别人满意，以为这样才能得到大家的关注和喜爱。后来我慢慢懂得了：让自己满意才是最重要的。我开始学会对别人说“不”，开始认真地关心和照顾自己。这不但让我感到快乐，而且也让我和家人、朋友的关系越来越近了。\n★ 他现在学会了：",
      opts: [{ id: "A", text: "关心自己" }, { id: "B", text: "照顾老人" }, { id: "C", text: "怎样养小孩儿" }],
      ans: "A",
      exp: "Đoạn văn viết: '开始认真地关心和照顾自己' -> Quan tâm bản thân (关心自己)."
    },
  ];
  for (const item of r3Items) {
    questions.push({
      id: `hsk3_q${item.num}`,
      type: "multiple_choice",
      skill: "READING",
      content: `第 ${item.num} 题：阅读短文并回答问题。\n\n${item.passage}`,
      points: 2,
      correctAnswer: item.ans,
      explanation: item.exp,
      options: item.opts,
    });
  }

  // 61-65: 书写第一部分
  const w1Items = [
    { num: 61, py: "fāng", text: "听说这些鸟是从北（ fāng ）飞过来的。", ans: "方", exp: "Phiên âm fāng trong '北方' (phía bắc) là chữ 方." },
    { num: 62, py: "gāi", text: "没有经过我的同意，你不（ gāi ）动我的东西。", ans: "该", exp: "Phiên âm gāi trong '不该' (không nên) là chữ 该." },
    { num: 63, py: "máo", text: "这里一个鸡蛋只要八（ máo ）钱。", ans: "毛", exp: "Phiên âm máo trong '八毛钱' (8 hào) là chữ 毛." },
    { num: 64, py: "chéng", text: "小东这次中文考试考了第一，（ chéng ）绩比上次高十分。", ans: "成", exp: "Phiên âm chéng trong '成绩' (thành tích) là chữ 成." },
    { num: 65, py: "fǎ", text: "牛先生认为这个办（ fǎ ）不能解决问题。", ans: "法", exp: "Phiên âm fǎ trong '办法' (biện pháp / cách) là chữ 法." },
  ];
  for (const item of w1Items) {
    questions.push({
      id: `hsk3_q${item.num}`,
      type: "fill_blank",
      skill: "WRITING",
      content: `第 ${item.num} 题：根据拼音写出汉字。\n\n${item.text}`,
      points: 4,
      correctAnswer: item.ans,
      pinyin: item.py,
      explanation: item.exp,
      options: [],
    });
  }

  // 66-70: 书写第二部分
  const w2Items = [
    { num: 66, word: "羽毛球", text: "请使用词语「羽毛球」写出一个完整的句子：\n（参考示例：姐姐羽毛球打得很好。）", ans: "姐姐羽毛球打得很好。", exp: "Câu hoàn chỉnh chứa từ '羽毛球', ngữ pháp đúng." },
    { num: 67, word: "饱", text: "请使用词语「饱」写出一个完整的句子：\n（参考示例：我已经饱了，不吃了。）", ans: "我已经饱了，不吃了。", exp: "Câu hoàn chỉnh chứa từ '饱', ngữ pháp đúng." },
    { num: 68, word: "爬", text: "请使用词语「爬」写出一个完整的句子：\n（参考示例：我周末常常去爬山。）", ans: "我周末常常去爬山。", exp: "Câu hoàn chỉnh chứa từ '爬', ngữ pháp đúng." },
    { num: 69, word: "结婚", text: "请使用词语「结婚」写出一个完整的句子：\n（参考示例：他们两个今天结婚了。）", ans: "他们两个今天结婚了。", exp: "Câu hoàn chỉnh chứa từ '结婚', ngữ pháp đúng." },
    { num: 70, word: "地图", text: "请使用词语「地图」写出一个完整的句子：\n（参考示例：根据地图，我们应该向那边走。）", ans: "根据地图，我们应该向那边走。", exp: "Câu hoàn chỉnh chứa từ '地图', ngữ pháp đúng." },
  ];
  for (const item of w2Items) {
    questions.push({
      id: `hsk3_q${item.num}`,
      type: "writing",
      skill: "WRITING",
      content: `第 ${item.num} 题：${item.text}`,
      points: 6,
      correctAnswer: item.ans,
      explanation: item.exp,
      options: [],
    });
  }

  return questions;
}

export interface QuestionOption {
  id: string;
  text?: string;
  imageUrl?: string;
}

export interface QuestionItem {
  id: string;
  type: string;
  content: string;
  pinyin?: string;
  points: number;
  imageUrl?: string;
  audioUrl?: string;
  correctAnswer: string;
  explanation?: string;
  options: QuestionOption[];
}

export interface ExamSectionGroup {
  id: string;
  title: string;
  skill: "LISTENING" | "READING" | "WRITING" | "SPEAKING";
  instruction?: string;
  audioUrl?: string;
  passage?: string;
  questions: QuestionItem[];
}

export function flattenGroups(groups: ExamSectionGroup[]): ImportedQuestion[] {
  let qIdx = 1;
  const result: ImportedQuestion[] = [];
  for (const group of groups) {
    for (const q of group.questions) {
      const questionId = q.id || `q_${qIdx}`;
      const item: ImportedQuestion = {
        id: questionId,
        type: q.type || (group.skill === "LISTENING" ? "listening_choice" : "multiple_choice"),
        skill: group.skill,
        content: q.content || `第 ${qIdx} 题`,
        pinyin: q.pinyin || "",
        points: Number(q.points) || 2.5,
        correctAnswer: q.correctAnswer || "A",
        explanation: q.explanation || "",
        imageUrl: q.imageUrl || "",
        audioUrl: q.audioUrl || group.audioUrl || "",
        options: Array.isArray(q.options) && q.options.length ? q.options : [
          { id: "A", text: "Đáp án A" },
          { id: "B", text: "Đáp án B" },
          { id: "C", text: "Đáp án C" },
        ],
        rubric: (q as any).rubric || "",
      };
      (item as any).passage = group.passage || "";
      (item as any).groupTitle = group.title || "";
      result.push(item);
      qIdx++;
    }
  }
  return result;
}

export function unflattenToGroups(questions: ImportedQuestion[], defaultLevel: number): ExamSectionGroup[] {
  if (!questions.length) return buildDefaultGroups(defaultLevel);

  const groupsMap = new Map<string, ExamSectionGroup>();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const explicitGroupTitle = (q as any).groupTitle || (q as any).editorData?.groupTitle;
    const explicitPassage = (q as any).passage || (q as any).editorData?.passage;

    let key = explicitGroupTitle;
    if (!key) {
      const chunkNum = Math.floor(i / 5) + 1;
      const startQ = (chunkNum - 1) * 5 + 1;
      const endQ = Math.min(chunkNum * 5, questions.length);
      const skillName = q.skill === "LISTENING" ? "Phần Nghe" : q.skill === "READING" ? "Phần Đọc" : "Phần Viết";
      key = `${skillName} · Nhóm ${chunkNum} (Câu ${startQ} - ${endQ})`;
    }

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        id: `group_${groupsMap.size + 1}`,
        title: key,
        skill: (q.skill as any) || "READING",
        audioUrl: q.audioUrl || "",
        passage: explicitPassage || "",
        questions: [],
      });
    }

    const grp = groupsMap.get(key)!;
    if (explicitPassage && !grp.passage) grp.passage = explicitPassage;
    if (q.audioUrl && !grp.audioUrl) grp.audioUrl = q.audioUrl;

    grp.questions.push({
      id: q.id || `q_${i + 1}`,
      type: q.type || (grp.skill === "LISTENING" ? "listening_choice" : "multiple_choice"),
      content: q.content || `Câu ${i + 1}`,
      pinyin: q.pinyin || "",
      points: Number(q.points) || 2.5,
      imageUrl: q.imageUrl || "",
      audioUrl: q.audioUrl && q.audioUrl !== grp.audioUrl ? q.audioUrl : "",
      correctAnswer: q.correctAnswer || "A",
      explanation: q.explanation || "",
      options: Array.isArray(q.options) && q.options.length
        ? q.options.map((opt: any, optIdx: number) => ({
            id: typeof opt === "object" && opt ? opt.id : String.fromCharCode(65 + optIdx),
            text: typeof opt === "string" ? opt : opt?.text || opt?.content || "",
            imageUrl: opt?.imageUrl || "",
          }))
        : [
            { id: "A", text: "Đáp án A" },
            { id: "B", text: "Đáp án B" },
          ],
    });
  }

  return Array.from(groupsMap.values());
}

export function buildDefaultGroups(level: number): ExamSectionGroup[] {
  if (level === 1) {
    const audioUrl = "/HSK3.0/HSK/音频/HSK（一级）样卷.mp3";
    return [
      {
        id: "group_1",
        title: "Phần 1 Nghe: Phán đoán tranh Đúng / Sai (Câu 1 - 5)",
        skill: "LISTENING",
        instruction: "Nghe ghi âm và phán đoán xem câu nói có khớp với bức tranh hay không (Đúng hoặc Sai).",
        audioUrl,
        questions: [1, 2, 3, 4, 5].map((i) => ({
          id: `hsk1_q${i}`,
          type: "true_false",
          content: `第 ${i} 题：请听录音并判断正误 (对 / 错)。`,
          points: 2.5,
          correctAnswer: i % 2 === 1 ? "true" : "false",
          imageUrl: "",
          explanation: `Câu ${i}: Nghe đoạn băng và đối chiếu với bức tranh minh họa.`,
          options: [
            { id: "true", text: "Đúng (对)" },
            { id: "false", text: "Sai (错)" },
          ],
        })),
      },
      {
        id: "group_2",
        title: "Phần 2 Nghe: Nghe đoạn ngắn và chọn tranh tương ứng (Câu 6 - 10)",
        skill: "LISTENING",
        instruction: "Nghe từng câu ngắn và chọn bức tranh A, B hoặc C phù hợp nhất.",
        audioUrl,
        questions: [6, 7, 8, 9, 10].map((i) => ({
          id: `hsk1_q${i}`,
          type: "multiple_choice",
          content: `第 ${i} 题：请听录音并选择正确的图片。`,
          points: 2.5,
          correctAnswer: i % 3 === 0 ? "A" : i % 3 === 1 ? "B" : "C",
          imageUrl: "",
          explanation: `Câu ${i}: Chọn bức tranh phù hợp với nội dung đoạn băng.`,
          options: [
            { id: "A", text: "Tranh A" },
            { id: "B", text: "Tranh B" },
            { id: "C", text: "Tranh C" },
          ],
        })),
      },
      {
        id: "group_3",
        title: "Phần 3 Nghe: Đối thoại ngắn chọn tranh A - F (Câu 11 - 15)",
        skill: "LISTENING",
        instruction: "Nghe đối thoại ngắn giữa 2 người và chọn bức tranh A - F tương ứng.",
        audioUrl,
        questions: [11, 12, 13, 14, 15].map((i, idx) => ({
          id: `hsk1_q${i}`,
          type: "multiple_choice",
          content: `第 ${i} 题：请听对话并选择正确的图片 (A-F)。`,
          points: 2.5,
          correctAnswer: ["E", "F", "B", "D", "A"][idx],
          imageUrl: "",
          explanation: `Câu ${i}: Đối thoại ngắn tương ứng với tranh ${["E", "F", "B", "D", "A"][idx]}.`,
          options: [
            { id: "A", text: "Tranh A" },
            { id: "B", text: "Tranh B" },
            { id: "C", text: "Tranh C" },
            { id: "D", text: "Tranh D" },
            { id: "E", text: "Tranh E" },
            { id: "F", text: "Tranh F" },
          ],
        })),
      },
      {
        id: "group_4",
        title: "Phần 4 Nghe: Nghe câu chọn đáp án A, B, C (Câu 16 - 20)",
        skill: "LISTENING",
        instruction: "Nghe câu hỏi và chọn đáp án A, B hoặc C.",
        audioUrl,
        questions: [16, 17, 18, 19, 20].map((i, idx) => ({
          id: `hsk1_q${i}`,
          type: "multiple_choice",
          content: `第 ${i} 题：请听录音并选择正确答案。`,
          points: 2.5,
          correctAnswer: ["A", "B", "C", "A", "C"][idx],
          imageUrl: "",
          explanation: `Câu ${i}: Đáp án đúng là ${["A", "B", "C", "A", "C"][idx]}.`,
          options: [
            { id: "A", text: "Đáp án A" },
            { id: "B", text: "Đáp án B" },
            { id: "C", text: "Đáp án C" },
          ],
        })),
      },
      {
        id: "group_5",
        title: "Phần 1 Đọc: Nhìn tranh và từ ngữ phán đoán Đúng / Sai (Câu 21 - 25)",
        skill: "READING",
        instruction: "Xem bức tranh và từ ngữ chữ Hán đi kèm, phán đoán xem có khớp nhau không (Đúng / Sai).",
        questions: [21, 22, 23, 24, 25].map((i) => ({
          id: `hsk1_q${i}`,
          type: "true_false",
          content: `第 ${i} 题：看图判断词语是否正确 (对 / 错)。`,
          points: 2.5,
          correctAnswer: i % 2 === 1 ? "true" : "false",
          imageUrl: "",
          explanation: `Câu ${i}: So sánh tranh và từ vựng.`,
          options: [
            { id: "true", text: "Đúng (对)" },
            { id: "false", text: "Sai (错)" },
          ],
        })),
      },
      {
        id: "group_6",
        title: "Phần 2 Đọc: Đọc câu và ghép nối với tranh A - F (Câu 26 - 30)",
        skill: "READING",
        instruction: "Đọc từng câu và chọn bức tranh A - F tương ứng.",
        questions: [26, 27, 28, 29, 30].map((i, idx) => ({
          id: `hsk1_q${i}`,
          type: "multiple_choice",
          content: `第 ${i} 题：阅读句子并选择对应的图片 (A-F)。`,
          points: 2.5,
          correctAnswer: ["D", "E", "C", "B", "A"][idx],
          imageUrl: "",
          explanation: `Câu ${i}: Nội dung câu khớp với tranh ${["D", "E", "C", "B", "A"][idx]}.`,
          options: [
            { id: "A", text: "Tranh A" },
            { id: "B", text: "Tranh B" },
            { id: "C", text: "Tranh C" },
            { id: "D", text: "Tranh D" },
            { id: "E", text: "Tranh E" },
            { id: "F", text: "Tranh F" },
          ],
        })),
      },
      {
        id: "group_7",
        title: "Phần 3 Đọc: Nối câu hỏi với câu trả lời (Câu 31 - 35)",
        skill: "READING",
        instruction: "Đọc câu hỏi bên dưới và chọn câu trả lời A - F tương ứng.",
        questions: [31, 32, 33, 34, 35].map((i, idx) => ({
          id: `hsk1_q${i}`,
          type: "multiple_choice",
          content: `第 ${i} 题：选择最佳的应答句子 (A-F)。`,
          points: 2.5,
          correctAnswer: ["F", "A", "B", "C", "E"][idx],
          imageUrl: "",
          explanation: `Câu ${i}: Lời đáp phù hợp là ${["F", "A", "B", "C", "E"][idx]}.`,
          options: [
            { id: "A", text: "Câu A" },
            { id: "B", text: "Câu B" },
            { id: "C", text: "Câu C" },
            { id: "D", text: "Câu D" },
            { id: "E", text: "Câu E" },
            { id: "F", text: "Câu F" },
          ],
        })),
      },
      {
        id: "group_8",
        title: "Phần 4 Đọc: Chọn từ điền vào chỗ trống (Câu 36 - 40)",
        skill: "READING",
        instruction: "Chọn từ thích hợp trong khung (A - F) để điền vào chỗ trống hoàn thành câu.",
        questions: [36, 37, 38, 39, 40].map((i, idx) => ({
          id: `hsk1_q${i}`,
          type: "fill_blank",
          content: `第 ${i} 题：选词填空 (请选择 A-F)。`,
          points: 2.5,
          correctAnswer: ["B", "B", "C", "C", "A"][idx],
          imageUrl: "",
          explanation: `Câu ${i}: Từ thích hợp điền vào câu là ${["B", "B", "C", "C", "A"][idx]}.`,
          options: [
            { id: "A", text: "Từ A" },
            { id: "B", text: "Từ B" },
            { id: "C", text: "Từ C" },
            { id: "D", text: "Từ D" },
            { id: "E", text: "Từ E" },
            { id: "F", text: "Từ F" },
          ],
        })),
      },
    ];
  }

  const sample = getSampleQuestionsForLevel(level);
  return unflattenToGroups(sample, level);
}

