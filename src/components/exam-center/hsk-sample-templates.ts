import { WORD_BANK, CLOZE_PASSAGE, PASSAGE_CHOICE, PASSAGE_JUDGEMENT, JUDGEMENT_SECTION, JUDGEMENT_OPTIONS, PASSAGE_SECTION, CLOZE_SECTION, isReadingPassage, isReadingCloze, isReadingSection } from "../../lib/reading-cloze";
import { PICTURE_CODES, pictureSlots, sampleExamAudio, READING_REPLIES, replySlots, legacyReplyChoices, isSharedListeningGroup, type ExamReply } from "../../lib/exam-center-core";

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
  groupId?: string;
  sectionId?: string;
  sectionTitle?: string;
  sectionInstruction?: string;
  sectionType?: typeof PASSAGE_SECTION | typeof CLOZE_SECTION | typeof JUDGEMENT_SECTION;
  evidence?: string;
  groupTitle?: string;
  groupType?: ExamSectionGroup["groupType"];
  groupImages?: ExamSectionGroup["groupImages"];
  groupReplies?: ExamReply[];
  groupWords?: ExamReply[];
  passagePinyin?: string;
  blankId?: string;
  groupCustom?: boolean;
  instruction?: string;
  questionNo?: string | number;
  passage?: string;
  acceptedAnswers?: string;
  requiresManualReview?: boolean;
}

export function getSampleQuestionsForLevel(level: number): ImportedQuestion[] {
  if (level === 1) {
    const audioUrl = sampleExamAudio(level);
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
    const audioUrl = sampleExamAudio(level);
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
  const audioUrl = sampleExamAudio(level);
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
  pinyin?: string;
  imageUrl?: string;
}

export interface QuestionItem {
  id: string;
  questionNo?: string | number;
  blankId?: string;
  evidence?: string;
  type: string;
  content: string;
  pinyin?: string;
  points: number;
  imageUrl?: string;
  audioUrl?: string;
  correctAnswer: string;
  explanation?: string;
  acceptedAnswers?: string;
  requiresManualReview?: boolean;
  options: QuestionOption[];
}

export interface ExamSectionGroup {
  id: string;
  title: string;
  skill: "LISTENING" | "READING" | "WRITING" | "SPEAKING";
  instruction?: string;
  audioUrl?: string;
  passage?: string;
  groupType?: typeof PASSAGE_JUDGEMENT | typeof JUDGEMENT_SECTION | typeof PASSAGE_CHOICE | typeof PASSAGE_SECTION | typeof CLOZE_SECTION | typeof WORD_BANK | typeof CLOZE_PASSAGE | typeof READING_REPLIES | "matching_images" | "listening_choice_abc" | "eval_true_false_na" | "listening_fill_blank" | "standard";
  groupImages?: { id: string; label: string; imageUrl: string }[];
  groupReplies?: ExamReply[];
  groupWords?: ExamReply[];
  passagePinyin?: string;
  groupCustom?: boolean;
  questions: QuestionItem[];
  passages?: ExamSectionGroup[];
}

export function sectionQuestions(group: ExamSectionGroup): QuestionItem[] {
  return isReadingSection(group.groupType) ? (group.passages || []).flatMap(passage => passage.questions) : group.questions;
}

export function flattenGroups(groups: ExamSectionGroup[]): ImportedQuestion[] {
  let qIdx = 1;
  const result: ImportedQuestion[] = [];
  const entries = groups.flatMap<{ group: ExamSectionGroup; section?: ExamSectionGroup }>(section => isReadingSection(section.groupType)
    ? (section.passages || []).map(group => ({ group, section }))
    : [{ group: section, section: undefined }]);
  for (const { group, section } of entries) {
    const readingPassage = isReadingPassage(group.groupType);
    const judgement = group.groupType === PASSAGE_JUDGEMENT;
    const pictureGroup = group.groupType === "matching_images";
    const replyGroup = group.groupType === READING_REPLIES;
    const wordBank = group.groupType === WORD_BANK;
    const clozePassage = group.groupType === CLOZE_PASSAGE;
    const cloze = wordBank || clozePassage;
    const listeningFill = group.groupType === "listening_fill_blank";
    const listeningEval = group.groupType === "eval_true_false_na";
    const groupAudio = pictureGroup || replyGroup || cloze || isSharedListeningGroup(group.groupType);
    for (const [index, q] of group.questions.entries()) {
      const questionId = q.id || `q_${qIdx}`;
      const item: ImportedQuestion = {
        id: questionId,
        type: judgement ? "true_false" : readingPassage ? "multiple_choice" : listeningFill ? "listening_fill" : listeningEval ? "true_false_na" : cloze ? "fill_blank" : pictureGroup || replyGroup ? "matching" : q.type || (group.skill === "LISTENING" ? "listening_choice" : "multiple_choice"),
        skill: group.skill,
        content: readingPassage || cloze || replyGroup || (pictureGroup && group.skill === "READING") ? q.content : q.content || `第 ${qIdx} 题`,
        pinyin: q.pinyin || "",
        points: Number(q.points),
        correctAnswer: readingPassage || cloze || pictureGroup || replyGroup || listeningFill || listeningEval ? q.correctAnswer : q.correctAnswer || "A",
        explanation: q.explanation || "",
        imageUrl: readingPassage || cloze || replyGroup || (pictureGroup && group.skill === "READING") ? "" : q.imageUrl || "",
        audioUrl: groupAudio ? (index === 0 && group.skill === "LISTENING" ? group.audioUrl || "" : "") : q.audioUrl || group.audioUrl || "",
        options: judgement ? JUDGEMENT_OPTIONS : replyGroup || wordBank || listeningFill ? [] : clozePassage || readingPassage ? q.options.map(({ id, text, pinyin }) => ({ id, text, pinyin })) : pictureGroup ? PICTURE_CODES.map(id => ({ id, text: `Tranh ${id}` })) : Array.isArray(q.options) && q.options.length ? q.options.map((opt) => ({
          id: opt.id,
          text: opt.text || "",
          pinyin: opt.pinyin || "",
          imageUrl: opt.imageUrl || "",
        })) : [
          { id: "A", text: "Đáp án A" },
          { id: "B", text: "Đáp án B" },
          { id: "C", text: "Đáp án C" },
        ],
        rubric: (q as any).rubric || "",
      };
      item.passage = (clozePassage || readingPassage) && index === 0 ? group.passage || "" :
        pictureGroup || replyGroup || cloze || readingPassage ? "" : group.passage || "";
      if (clozePassage) item.blankId = q.blankId;
      if (judgement) item.evidence = q.evidence || "";
      if (section && isReadingSection(section.groupType)) {
        item.sectionId = section.id;
        item.sectionTitle = section.title;
        item.sectionInstruction = section.instruction;
        item.sectionType = section.groupType;
      }
      if ((cloze || readingPassage) && index === 0) {
        item.instruction = group.instruction || "";
        if (wordBank) {
          item.groupWords = group.groupWords || [];
          item.groupCustom = !!group.groupCustom;
        }
        if (clozePassage || readingPassage) item.passagePinyin = group.passagePinyin || "";
      }
      item.groupTitle = group.title || "";
      item.groupId = group.id;
      item.groupType = group.groupType;
      if (pictureGroup && index === 0) item.groupImages = pictureSlots(group.groupImages);
      if (replyGroup && index === 0) {
        item.groupReplies = replySlots(group.groupReplies);
        item.groupCustom = !!group.groupCustom;
        item.instruction = group.instruction || "";
      }
      item.questionNo = replyGroup && group.groupCustom ? index + 1 : q.questionNo || "";
      item.acceptedAnswers = q.acceptedAnswers || "";
      item.requiresManualReview = !!q.requiresManualReview;
      result.push(item);
      qIdx++;
    }
  }
  return result;
}

export function unflattenToGroups(questions: ImportedQuestion[], defaultLevel: number): ExamSectionGroup[] {
  if (!questions.length) return buildDefaultGroups(defaultLevel);

  const groupsMap = new Map<string, ExamSectionGroup>();
  const sections = new Map<string, ExamSectionGroup>();
  const ordered: ExamSectionGroup[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const explicitGroupTitle = (q as any).groupTitle || (q as any).editorData?.groupTitle;
    const explicitPassage = (q as any).passage || (q as any).editorData?.passage;
    const explicitGroupType = (q as any).groupType || (q as any).editorData?.groupType || "standard";
    const explicitGroupImages = (q as any).groupImages || (q as any).editorData?.groupImages;
    const cloze = isReadingCloze(explicitGroupType);
    const readingPassage = isReadingPassage(explicitGroupType);
    const explicitQuestionNo = (q as any).questionNo || (q as any).editorData?.questionNo;

    const sectionId = q.sectionId || (q as any).editorData?.sectionId;
    const sectionType = q.sectionType || (q as any).editorData?.sectionType;
    let key = q.groupId || (q as any).editorData?.groupId || explicitGroupTitle;
    if (!key) {
      const chunkNum = Math.floor(i / 5) + 1;
      const startQ = (chunkNum - 1) * 5 + 1;
      const endQ = Math.min(chunkNum * 5, questions.length);
      const skillName = q.skill === "LISTENING" ? "Phần Nghe" : q.skill === "READING" ? "Phần Đọc" : "Phần Viết";
      key = `${skillName} · Nhóm ${chunkNum} (Câu ${startQ} - ${endQ})`;
    }

    if (sectionId && isReadingSection(sectionType)) key = JSON.stringify([sectionId, key]);
    if (!groupsMap.has(key)) {
      const group: ExamSectionGroup = {
        id: q.groupId || (q as any).editorData?.groupId || `group_${groupsMap.size + 1}`,
        title: explicitGroupTitle || key,
        skill: (q.skill as any) || "READING",
        audioUrl: q.audioUrl || "",
        passage: explicitPassage || "",
        groupType: explicitGroupType,
        groupImages: Array.isArray(explicitGroupImages) && explicitGroupImages.length
          ? explicitGroupImages
          : explicitGroupType === "matching_images"
          ? ["A", "B", "C", "D", "E", "F"].map((id) => ({ id, label: `Tranh ${id}`, imageUrl: "" }))
          : undefined,
        questions: [],
      };
      groupsMap.set(key, group);
      if (sectionId && isReadingSection(sectionType)) {
        let section = sections.get(sectionId);
        if (!section) {
          section = {
            id: sectionId, title: q.sectionTitle || (q as any).editorData?.sectionTitle || "Phần Đọc",
            instruction: q.sectionInstruction || (q as any).editorData?.sectionInstruction,
            skill: "READING", groupType: sectionType, questions: [], passages: [],
          };
          sections.set(sectionId, section);
          ordered.push(section);
        }
        section.passages!.push(group);
      } else {
        ordered.push(group);
      }
    }

    const grp = groupsMap.get(key)!;
    const words = q.groupWords || (q as any).editorData?.groupWords;
    if (Array.isArray(words)) grp.groupWords = words;
    grp.passagePinyin ||= q.passagePinyin || (q as any).editorData?.passagePinyin;
    const replies = q.groupReplies || (q as any).editorData?.groupReplies;
    const custom = q.groupCustom ?? (q as any).editorData?.groupCustom;
    if (Array.isArray(replies)) grp.groupReplies = replySlots(replies);
    if (typeof custom === "boolean") grp.groupCustom = custom;
    if (!grp.instruction) grp.instruction = q.instruction || (q as any).editorData?.instruction;
    if (explicitPassage && !grp.passage) grp.passage = explicitPassage;
    if (q.audioUrl && !grp.audioUrl) grp.audioUrl = q.audioUrl;
    if (explicitGroupType && explicitGroupType !== "standard" && grp.groupType === "standard") {
      grp.groupType = explicitGroupType;
    }
    if (Array.isArray(explicitGroupImages) && explicitGroupImages.length) {
      grp.groupImages = explicitGroupImages;
    }

    grp.questions.push({
      id: q.id || `q_${i + 1}`,
      questionNo: explicitQuestionNo || (i + 1),
      blankId: q.blankId || (q as any).editorData?.blankId,
      evidence: q.evidence || (q as any).editorData?.evidence,
      type: q.type || (grp.skill === "LISTENING" ? "listening_choice" : "multiple_choice"),
      content: readingPassage || cloze || explicitGroupType === READING_REPLIES ? q.content || "" : q.content || `Câu ${i + 1}`,
      pinyin: q.pinyin || (q as any).pinyinPrompt || "",
      points: Number(q.points ?? 2.5),
      imageUrl: q.imageUrl || "",
      audioUrl: q.audioUrl && q.audioUrl !== grp.audioUrl ? q.audioUrl : "",
      correctAnswer: readingPassage || cloze || explicitGroupType === "listening_fill_blank" || explicitGroupType === "eval_true_false_na" || explicitGroupType === "matching_images" || explicitGroupType === READING_REPLIES ? q.correctAnswer || "" : q.correctAnswer || "A",
      explanation: q.explanation || "",
      acceptedAnswers: (q as any).acceptedAnswers || (q as any).editorData?.acceptedAnswers || "",
      requiresManualReview: !!((q as any).requiresManualReview || (q as any).editorData?.requiresManualReview),
      options: explicitGroupType === READING_REPLIES || explicitGroupType === WORD_BANK ? [] : Array.isArray(q.options) && q.options.length
        ? q.options.map((opt: any, optIdx: number) => ({
            id: typeof opt === "object" && opt ? opt.id : String.fromCharCode(65 + optIdx),
            text: typeof opt === "string" ? opt : opt?.text || opt?.content || "",
            pinyin: typeof opt === "object" && opt ? opt.pinyin || "" : "",
            imageUrl: opt?.imageUrl || "",
          }))
        : cloze || readingPassage ? [] : [
            { id: "A", text: "Đáp án A" },
            { id: "B", text: "Đáp án B" },
          ],
    });
  }

  return ordered.map(group => {
    if (group.skill !== "READING" || group.passage || group.groupType !== "standard") return group;
    const replies = legacyReplyChoices(group.title, group.questions);
    return replies ? {
      ...group,
      groupType: READING_REPLIES,
      groupReplies: replies,
      questions: group.questions.map(question => ({ ...question, type: "matching", options: [] })),
    } : group;
  });
}

export function buildDefaultGroups(level: number): ExamSectionGroup[] {
  if (level === 1) {
    const audioUrl = sampleExamAudio(level);
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
        groupType: "matching_images",
        groupImages: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, label: `Tranh ${l}`, imageUrl: "" })),
        instruction: "Nghe đối thoại ngắn giữa 2 người và chọn bức tranh A - F tương ứng.",
        audioUrl,
        questions: [11, 12, 13, 14, 15].map((i, idx) => ({
          id: `hsk1_q${i}`,
          questionNo: i,
          type: "matching",
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
        groupType: "listening_choice_abc",
        instruction: "Nghe câu hỏi hoặc đoạn hội thoại và chọn đáp án A, B hoặc C.",
        audioUrl,
        questions: [
          {
            id: "hsk1_q16",
            questionNo: 16,
            type: "listening_choice",
            content: "第 16 题：男：认识你很高兴。女：我也很高兴。问：男的怎么了？",
            pinyin: "Rènshi nǐ hěn gāoxìng.",
            points: 2.5,
            correctAnswer: "A",
            imageUrl: "",
            explanation: "Theo đoạn ghi âm: Nữ đáp lại 'Tôi cũng rất vui' => Đáp án A (很高兴).",
            options: [
              { id: "A", text: "很高兴", pinyin: "hěn gāoxìng" },
              { id: "B", text: "太少了", pinyin: "tài shǎo le" },
              { id: "C", text: "没关系", pinyin: "méi guānxi" },
            ],
          },
          {
            id: "hsk1_q17",
            questionNo: 17,
            type: "listening_choice",
            content: "第 17 题：男：你去哪儿？女：我去医院看朋友。问：女的去哪儿？",
            pinyin: "Wǒ qù yīyuàn kàn péngyou.",
            points: 2.5,
            correctAnswer: "B",
            imageUrl: "",
            explanation: "Người nữ nói: '我去医院看朋友' (Tôi đi bệnh viện thăm bạn) => Đáp án A (去医院).",
            options: [
              { id: "A", text: "去医院", pinyin: "qù yīyuàn" },
              { id: "B", text: "在学校", pinyin: "zài xuéxiào" },
              { id: "C", text: "去饭店", pinyin: "qù fàndiàn" },
            ],
          },
          {
            id: "hsk1_q18",
            questionNo: 18,
            type: "listening_choice",
            content: "第 18 题：男：你想喝点儿什么？女：我想喝茶。问：女的想喝什么？",
            pinyin: "Wǒ xiǎng hē chá.",
            points: 2.5,
            correctAnswer: "C",
            imageUrl: "",
            explanation: "Người nữ nói muốn uống trà '喝茶' => Đáp án C (喝茶).",
            options: [
              { id: "A", text: "买衣服", pinyin: "mǎi yīfu" },
              { id: "B", text: "看电影", pinyin: "kàn diànyǐng" },
              { id: "C", text: "喝茶", pinyin: "hē chá" },
            ],
          },
          {
            id: "hsk1_q19",
            questionNo: 19,
            type: "listening_choice",
            content: "第 19 题：男：现在几点了？女：现在上午九点。问：现在几点？",
            pinyin: "Xiànzài shàngwǔ jiǔ diǎn.",
            points: 2.5,
            correctAnswer: "B",
            imageUrl: "",
            explanation: "Người nữ nói hiện tại là 9 giờ sáng (九点) => Đáp án B (9点).",
            options: [
              { id: "A", text: "8点", pinyin: "bā diǎn" },
              { id: "B", text: "9点", pinyin: "jiǔ diǎn" },
              { id: "C", text: "10点", pinyin: "shí diǎn" },
            ],
          },
          {
            id: "hsk1_q20",
            questionNo: 20,
            type: "listening_choice",
            content: "第 20 题：男：桌子上有几个苹果？女：有五个。问：有几个苹果？",
            pinyin: "Yǒu wǔ gè píngguǒ.",
            points: 2.5,
            correctAnswer: "C",
            imageUrl: "",
            explanation: "Trên bàn có 5 quả táo (五个苹果) => Đáp án C (5个).",
            options: [
              { id: "A", text: "3个", pinyin: "sān gè" },
              { id: "B", text: "4个", pinyin: "sì gè" },
              { id: "C", text: "5个", pinyin: "wǔ gè" },
            ],
          },
        ],
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
        groupType: "matching_images",
        groupImages: pictureSlots(),
        instruction: "Đọc từng câu và chọn bức tranh A - F tương ứng.",
        questions: [26, 27, 28, 29, 30].map((i, idx) => ({
          id: `hsk1_q${i}`,
          questionNo: i,
          type: "matching",
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
        groupType: READING_REPLIES,
        groupReplies: replySlots(),
        instruction: "Đọc câu hỏi bên dưới và chọn câu trả lời A - F tương ứng.",
        questions: [31, 32, 33, 34, 35].map((i, idx) => ({
          id: `hsk1_q${i}`,
          questionNo: i,
          type: "matching",
          content: "",
          points: 2.5,
          correctAnswer: ["F", "A", "B", "C", "E"][idx],
          imageUrl: "",
          explanation: `Câu ${i}: Lời đáp phù hợp là ${["F", "A", "B", "C", "E"][idx]}.`,
          options: [],
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

  if (level === 2) {
    const audioUrl = sampleExamAudio(level);
    return [
      {
        id: "group_1",
        title: "Phần 1 Nghe: Phán đoán tranh Đúng / Sai (Câu 1 - 10)",
        skill: "LISTENING",
        instruction: "Nghe ghi âm từng câu và phán đoán xem câu nói có khớp với bức tranh hay không.",
        audioUrl,
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk2_q${idx + 1}`,
          type: "true_false",
          content: `第 ${idx + 1} 题：请听录音并判断正误 (对 / 错)。`,
          points: 2,
          correctAnswer: idx % 2 === 0 ? "true" : "false",
          imageUrl: "",
          explanation: `Đối chiếu nội dung ghi âm với tranh câu ${idx + 1}.`,
          options: [
            { id: "true", text: "Đúng (对)" },
            { id: "false", text: "Sai (错)" },
          ],
        })),
      },
      {
        id: "group_2",
        title: "Phần 2 Nghe: Nghe đối thoại ngắn chọn tranh A - F (Câu 11 - 20)",
        skill: "LISTENING",
        instruction: "Nghe đối thoại ngắn và chọn bức tranh A - F tương ứng.",
        audioUrl,
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk2_q${idx + 11}`,
          type: "matching",
          content: `第 ${idx + 11} 题：请听对话并选择正确的图片 (A-F)。`,
          points: 2,
          correctAnswer: ["A", "B", "C", "D", "E", "F", "B", "C", "A", "E"][idx],
          imageUrl: "",
          explanation: `Bức tranh tương ứng cho câu ${idx + 11}.`,
          options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Tranh ${l}` })),
        })),
      },
      {
        id: "group_3",
        title: "Phần 3 Nghe: Đối thoại 2 câu chọn đáp án A, B, C (Câu 21 - 30)",
        skill: "LISTENING",
        instruction: "Nghe đối thoại 2 câu giữa 2 người và chọn đáp án A, B, C cho câu hỏi.",
        audioUrl,
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk2_q${idx + 21}`,
          type: "multiple_choice",
          content: `第 ${idx + 21} 题：请听录音并选择正确答案 (A, B, C)。`,
          points: 2,
          correctAnswer: ["A", "C", "B", "A", "C", "B", "A", "B", "C", "A"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 21}.`,
          options: ["A", "B", "C"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_4",
        title: "Phần 4 Nghe: Đối thoại 4-5 câu chọn đáp án A, B, C (Câu 31 - 35)",
        skill: "LISTENING",
        instruction: "Nghe đoạn đối thoại 4-5 câu và chọn đáp án đúng nhất.",
        audioUrl,
        questions: Array.from({ length: 5 }, (_, idx) => ({
          id: `hsk2_q${idx + 31}`,
          type: "multiple_choice",
          content: `第 ${idx + 31} 题：请听长对话并选择正确答案。`,
          points: 2,
          correctAnswer: ["B", "C", "A", "B", "C"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 31}.`,
          options: ["A", "B", "C"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_5",
        title: "Phần 1 Đọc: Đọc câu ghép nối tranh A - F (Câu 36 - 40)",
        skill: "READING",
        instruction: "Đọc từng câu và chọn bức tranh A - F tương ứng.",
        questions: Array.from({ length: 5 }, (_, idx) => ({
          id: `hsk2_q${idx + 36}`,
          type: "matching",
          content: `第 ${idx + 36} 题：阅读句子并选择对应的图片 (A-F)。`,
          points: 2,
          correctAnswer: ["C", "A", "D", "B", "F"][idx],
          imageUrl: "",
          explanation: `Nội dung câu ${idx + 36} khớp với tranh.`,
          options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Tranh ${l}` })),
        })),
      },
      {
        id: "group_6",
        title: "Phần 2 Đọc: Chọn từ điền vào chỗ trống A - F (Câu 41 - 45)",
        skill: "READING",
        instruction: "Chọn từ ngữ thích hợp trong khung điền vào chỗ trống hoàn thành câu đối thoại.",
        questions: Array.from({ length: 5 }, (_, idx) => ({
          id: `hsk2_q${idx + 41}`,
          type: "fill_blank",
          content: `第 ${idx + 41} 题：选词填空 (请选择 A-F)。`,
          points: 2,
          correctAnswer: ["D", "B", "A", "F", "C"][idx],
          imageUrl: "",
          explanation: `Từ thích hợp điền vào câu ${idx + 41}.`,
          options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Từ ${l}` })),
        })),
      },
      {
        id: "group_7",
        title: "Phần 3 Đọc: Phán đoán Đúng / Sai theo câu ngắn (Câu 46 - 50)",
        skill: "READING",
        instruction: "Đọc 1-2 câu ngắn và phán đoán xem câu nhận xét bên dưới Đúng hay Sai.",
        questions: Array.from({ length: 5 }, (_, idx) => ({
          id: `hsk2_q${idx + 46}`,
          type: "true_false",
          content: `第 ${idx + 46} 题：阅读并判断句子正误 (对 / 错)。`,
          points: 2,
          correctAnswer: idx % 2 === 0 ? "true" : "false",
          imageUrl: "",
          explanation: `So sánh ý nghĩa của đoạn văn và câu phán đoán ${idx + 46}.`,
          options: [
            { id: "true", text: "Đúng (对)" },
            { id: "false", text: "Sai (错)" },
          ],
        })),
      },
      {
        id: "group_8",
        title: "Phần 4 Đọc: Nối câu hỏi với câu trả lời A - F (Câu 51 - 60)",
        skill: "READING",
        instruction: "Đọc câu hỏi và chọn câu đáp lại phù hợp nhất (A - F).",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk2_q${idx + 51}`,
          type: "matching",
          content: `第 ${idx + 51} 题：选择最佳的应答句子 (A-F)。`,
          points: 2,
          correctAnswer: ["C", "D", "E", "A", "B", "F", "B", "A", "D", "C"][idx],
          imageUrl: "",
          explanation: `Lời đáp phù hợp cho câu hỏi ${idx + 51}.`,
          options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Câu ${l}` })),
        })),
      },
    ];
  }

  if (level === 3) {
    const audioUrl = sampleExamAudio(level);
    return [
      {
        id: "group_1",
        title: "Phần 1 Nghe: Đối thoại ngắn chọn tranh A - F (Câu 1 - 10)",
        skill: "LISTENING",
        instruction: "Nghe đối thoại ngắn giữa 2 người và chọn bức tranh A - F tương ứng.",
        audioUrl,
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk3_q${idx + 1}`,
          type: "matching",
          content: `第 ${idx + 1} 题：请听对话并选择与录音内容相符的图片 (A-F)。`,
          points: 2,
          correctAnswer: ["B", "C", "A", "E", "F", "B", "A", "E", "C", "D"][idx],
          imageUrl: "",
          explanation: `Đáp án tranh chuẩn câu ${idx + 1}.`,
          options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Tranh ${l}` })),
        })),
      },
      {
        id: "group_2",
        title: "Phần 2 Nghe: Nghe đoạn văn phán đoán Đúng / Sai (Câu 11 - 20)",
        skill: "LISTENING",
        instruction: "Nghe một người nói một đoạn ngắn rồi phán đoán câu đưa ra Đúng hay Sai.",
        audioUrl,
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk3_q${idx + 11}`,
          type: "true_false",
          content: `第 ${idx + 11} 题：请听录音并判断正误 (对 / 错)。`,
          points: 2,
          correctAnswer: ["true", "false", "true", "false", "true", "true", "false", "false", "true", "false"][idx],
          imageUrl: "",
          explanation: `Đối chiếu nội dung ghi âm với câu phán đoán ${idx + 11}.`,
          options: [
            { id: "true", text: "Đúng (对)" },
            { id: "false", text: "Sai (错)" },
          ],
        })),
      },
      {
        id: "group_3",
        title: "Phần 3 Nghe: Đối thoại ngắn chọn đáp án A, B, C (Câu 21 - 30)",
        skill: "LISTENING",
        instruction: "Nghe đối thoại 2 câu và chọn đáp án A, B, C cho câu hỏi của người thứ 3.",
        audioUrl,
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk3_q${idx + 21}`,
          type: "multiple_choice",
          content: `第 ${idx + 21} 题：请听对话并选择正确答案 (A, B, C)。`,
          points: 2,
          correctAnswer: ["C", "B", "A", "C", "A", "B", "C", "A", "B", "C"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 21}.`,
          options: ["A", "B", "C"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_4",
        title: "Phần 4 Nghe: Đối thoại dài chọn đáp án A, B, C (Câu 31 - 40)",
        skill: "LISTENING",
        instruction: "Nghe đối thoại dài 4-5 câu và chọn đáp án A, B, C.",
        audioUrl,
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk3_q${idx + 31}`,
          type: "multiple_choice",
          content: `第 ${idx + 31} 题：请听长对话并选择正确答案 (A, B, C)。`,
          points: 2,
          correctAnswer: ["B", "A", "C", "A", "B", "C", "B", "A", "C", "A"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 31}.`,
          options: ["A", "B", "C"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_5",
        title: "Phần 1 Đọc: Ghép đôi câu tương quan A - F (Câu 41 - 50)",
        skill: "READING",
        instruction: "Đọc từng câu và ghép với câu tương ứng về ngữ nghĩa trong khung A - F.",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk3_q${idx + 41}`,
          type: "matching",
          content: `第 ${idx + 41} 题：阅读并找出意思相关的句子 (A-F)。`,
          points: 2,
          correctAnswer: ["D", "E", "A", "B", "C", "F", "B", "A", "E", "C"][idx],
          imageUrl: "",
          explanation: `Ghép cặp tương ứng cho câu ${idx + 41}.`,
          options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Câu ${l}` })),
        })),
      },
      {
        id: "group_6",
        title: "Phần 2 Đọc: Chọn từ điền vào chỗ trống A - F (Câu 51 - 60)",
        skill: "READING",
        instruction: "Chọn từ thích hợp trong khung điền vào chỗ trống trong câu đơn hoặc đối thoại.",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk3_q${idx + 51}`,
          type: "fill_blank",
          content: `第 ${idx + 51} 题：选词填空 (请选择 A-F)。`,
          points: 2,
          correctAnswer: ["B", "C", "D", "A", "E", "F", "A", "C", "B", "D"][idx],
          imageUrl: "",
          explanation: `Từ đúng điền vào câu ${idx + 51}.`,
          options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Từ ${l}` })),
        })),
      },
      {
        id: "group_7",
        title: "Phần 3 Đọc: Đọc hiểu đoạn văn chọn đáp án A, B, C (Câu 61 - 70)",
        skill: "READING",
        instruction: "Đọc đoạn văn ngắn bên dưới và chọn câu trả lời chính xác nhất.",
        passage: "每天早上，王经理都习惯先喝一杯热咖啡，然后开始看昨天的报纸。他认为，阅读能让人在一天的开始保持头脑清醒，这也是他多年来工作高效的秘密。",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk3_q${idx + 61}`,
          type: "multiple_choice",
          content: `第 ${idx + 61} 题：根据短文内容，下列哪项是正确的？`,
          points: 2,
          correctAnswer: ["C", "A", "B", "A", "C", "B", "A", "C", "B", "C"][idx],
          imageUrl: "",
          explanation: `Căn cứ vào đoạn văn, đáp án câu ${idx + 61} là chính xác.`,
          options: ["A", "B", "C"].map((l) => ({ id: l, text: `Lựa chọn ${l}` })),
        })),
      },
      {
        id: "group_8",
        title: "Phần 1 Viết: Sắp xếp các từ thành câu hoàn chỉnh (Câu 71 - 75)",
        skill: "WRITING",
        instruction: "Sắp xếp các từ ngữ cho sẵn thành một câu hoàn chỉnh, đúng ngữ pháp.",
        questions: [
          { num: 71, text: "那只小狗 / 跑 / 得 / 很快", ans: "那只小狗跑得很快。" },
          { num: 72, text: "请 / 声音 / 放 / 小 / 一点儿", ans: "请声音放小一点儿。" },
          { num: 73, text: "这台电脑 / 妹妹 / 昨天 / 买的 / 是", ans: "这台电脑是妹妹昨天买的。" },
          { num: 74, text: "把 / 门 / 关上 / 已经 / 他", ans: "他已经把门关上了。" },
          { num: 75, text: "图书馆 / 在 / 体育馆 / 的 / 旁边", ans: "图书馆在体育馆的旁边。" },
        ].map((item) => ({
          id: `hsk3_q${item.num}`,
          type: "sentence_order",
          content: `第 ${item.num} 题：请将以下词语排列成一句完整的句子：\n${item.text}`,
          points: 4,
          correctAnswer: item.ans,
          imageUrl: "",
          explanation: `Câu hoàn chỉnh: ${item.ans}`,
          options: [],
        })),
      },
      {
        id: "group_9",
        title: "Phần 2 Viết: Nhìn pinyin viết chữ Hán đúng (Câu 76 - 80)",
        skill: "WRITING",
        instruction: "Căn cứ vào phiên âm pinyin trong ngoặc đơn, viết chữ Hán chính xác vào chỗ trống.",
        questions: [
          { num: 76, py: "fāng", text: "听说这些鸟是从北（ fāng ）飞过来的。", ans: "方" },
          { num: 77, py: "gāi", text: "没有经过我的同意，你不（ gāi ）动我的东西。", ans: "该" },
          { num: 78, py: "máo", text: "这里一个鸡蛋只要八（ máo ）钱。", ans: "毛" },
          { num: 79, py: "chéng", text: "小东这次中文考试考了第一，（ chéng ）绩比上次高十分。", ans: "成" },
          { num: 80, py: "fǎ", text: "牛先生认为这个办（ fǎ ）不能解决问题。", ans: "法" },
        ].map((item) => ({
          id: `hsk3_q${item.num}`,
          type: "fill_blank",
          content: `第 ${item.num} 题：根据拼音写汉字：\n${item.text}`,
          pinyin: item.py,
          points: 4,
          correctAnswer: item.ans,
          imageUrl: "",
          explanation: `Chữ Hán tương ứng với phiên âm [${item.py}] là chữ "${item.ans}".`,
          options: [],
        })),
      },
    ];
  }

  if (level === 4) {
    const audioUrl = sampleExamAudio(level);
    return [
      {
        id: "group_1",
        title: "Phần 1 Nghe: Nghe đoạn ngắn phán đoán câu Đúng / Sai (Câu 1 - 10)",
        skill: "LISTENING",
        instruction: "Nghe đoạn văn ngắn và phán đoán câu khẳng định đưa ra là Đúng hay Sai.",
        audioUrl,
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk4_q${idx + 1}`,
          type: "true_false",
          content: `第 ${idx + 1} 题：请听短文并判断正误 (对 / 错)。`,
          points: 2.5,
          correctAnswer: idx % 2 === 0 ? "true" : "false",
          imageUrl: "",
          explanation: `So sánh đoạn ghi âm với câu phán đoán ${idx + 1}.`,
          options: [
            { id: "true", text: "Đúng (对)" },
            { id: "false", text: "Sai (错)" },
          ],
        })),
      },
      {
        id: "group_2",
        title: "Phần 2 Nghe: Đối thoại 2 câu chọn đáp án A, B, C, D (Câu 11 - 25)",
        skill: "LISTENING",
        instruction: "Nghe đối thoại 2 câu giữa 2 người và chọn đáp án A, B, C, D cho câu hỏi.",
        audioUrl,
        questions: Array.from({ length: 15 }, (_, idx) => ({
          id: `hsk4_q${idx + 11}`,
          type: "multiple_choice",
          content: `第 ${idx + 11} 题：请听对话并选择正确答案 (A, B, C, D)。`,
          points: 2,
          correctAnswer: ["B", "A", "C", "D", "A", "C", "B", "D", "A", "B", "C", "D", "B", "A", "C"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 11}.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_3",
        title: "Phần 3 Nghe: Đối thoại dài & đoạn văn chọn A, B, C, D (Câu 26 - 45)",
        skill: "LISTENING",
        instruction: "Nghe đối thoại 4-5 câu hoặc đoạn văn ngắn rồi chọn đáp án chính xác.",
        audioUrl,
        questions: Array.from({ length: 20 }, (_, idx) => ({
          id: `hsk4_q${idx + 26}`,
          type: "multiple_choice",
          content: `第 ${idx + 26} 题：请听录音并选择正确答案 (A, B, C, D)。`,
          points: 2,
          correctAnswer: ["C", "D", "B", "A", "C", "B", "D", "A", "C", "B", "A", "D", "C", "B", "A", "D", "B", "C", "A", "D"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 26}.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_4",
        title: "Phần 1 Đọc: Chọn từ điền vào chỗ trống A - E (Câu 46 - 55)",
        skill: "READING",
        instruction: "Chọn từ thích hợp trong khung điền vào chỗ trống hoàn thành câu hoặc đoạn đối thoại.",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk4_q${idx + 46}`,
          type: "fill_blank",
          content: `第 ${idx + 46} 题：选词填空 (请选择 A-E)。`,
          points: 2.5,
          correctAnswer: ["B", "C", "A", "E", "D", "C", "A", "D", "B", "E"][idx],
          imageUrl: "",
          explanation: `Từ thích hợp điền vào câu ${idx + 46}.`,
          options: ["A", "B", "C", "D", "E"].map((l) => ({ id: l, text: `Từ ${l}` })),
        })),
      },
      {
        id: "group_5",
        title: "Phần 2 Đọc: Sắp xếp 3 phân câu A, B, C thành đoạn văn (Câu 56 - 65)",
        skill: "READING",
        instruction: "Sắp xếp 3 phân câu A, B, C theo trình tự logic thời gian và ngữ nghĩa hợp lý.",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk4_q${idx + 56}`,
          type: "sentence_order",
          content: `第 ${idx + 56} 题：请将以下 3 个分句排列成正确的顺序 (A, B, C)。\n\nA. 后来慢慢适应了这里的气候\nB. 刚来北方的时候很不习惯\nC. 现在身体感觉越来越健康`,
          points: 2.5,
          correctAnswer: "B C A",
          imageUrl: "",
          explanation: `Thứ tự logic mạch lạc chuẩn là B -> A -> C hoặc tương ứng.`,
          options: [
            { id: "BAC", text: "B - A - C" },
            { id: "BCA", text: "B - C - A" },
            { id: "ABC", text: "A - B - C" },
            { id: "CAB", text: "C - A - B" },
          ],
        })),
      },
      {
        id: "group_6",
        title: "Phần 3 Đọc: Đọc hiểu đoạn văn chọn đáp án A, B, C, D (Câu 66 - 85)",
        skill: "READING",
        instruction: "Đọc các đoạn văn ngắn và chọn câu trả lời đúng nhất cho các câu hỏi bên dưới.",
        passage: "科学研究表明，每天坚持运动半小时以上，不仅能增强人体的免疫力，还能有效缓解工作和生活带来的心理压力。运动时大脑会分泌一种让人感到快乐的物质，因此运动后人的情绪通常都会变得更加积极乐观。",
        questions: Array.from({ length: 20 }, (_, idx) => ({
          id: `hsk4_q${idx + 66}`,
          type: "multiple_choice",
          content: `第 ${idx + 66} 题：根据上文，关于运动下列哪项是正确的？`,
          points: 2.5,
          correctAnswer: ["B", "A", "C", "D", "A", "B", "C", "D", "C", "B", "A", "D", "B", "C", "D", "A", "B", "C", "A", "D"][idx],
          imageUrl: "",
          explanation: `Theo nội dung đoạn văn, đáp án câu ${idx + 66} là chính xác.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_7",
        title: "Phần 1 Viết: Sắp xếp từ cho sẵn thành câu hoàn chỉnh (Câu 86 - 95)",
        skill: "WRITING",
        instruction: "Sắp xếp các từ ngữ cho sẵn thành một câu hoàn chỉnh, đúng quy tắc ngữ pháp HSK 4.",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk4_q${idx + 86}`,
          type: "sentence_order",
          content: `第 ${idx + 86} 题：请将给出的词语组合成一句完整通顺的句子。`,
          points: 5,
          correctAnswer: "他 经过 努力 终于 实现了 自己的 梦想。",
          imageUrl: "",
          explanation: `Câu hoàn chỉnh chuẩn ngữ pháp HSK 4.`,
          options: [],
        })),
      },
      {
        id: "group_8",
        title: "Phần 2 Viết: Nhìn tranh và dùng từ cho trước viết câu (Câu 96 - 100)",
        skill: "WRITING",
        instruction: "Quan sát bức tranh và sử dụng từ ngữ cho sẵn để viết một câu hoàn chỉnh miêu tả tranh.",
        questions: Array.from({ length: 5 }, (_, idx) => ({
          id: `hsk4_q${idx + 96}`,
          type: "writing",
          content: `第 ${idx + 96} 题：看图并使用词语「${["打招呼", "精彩", "严格", "商量", "骄傲"][idx]}」写出一个完整句子。`,
          points: 10,
          correctAnswer: `（参考答案）：使用词语「${["打招呼", "精彩", "严格", "商量", "骄傲"][idx]}」描写画面，语法正确，标点规范。`,
          imageUrl: "",
          explanation: `Viết 1 câu hoàn chỉnh kết hợp từ ngữ và tranh minh họa.`,
          options: [],
        })),
      },
    ];
  }

  if (level === 5) {
    const audioUrl = sampleExamAudio(level);
    return [
      {
        id: "group_1",
        title: "Phần 1 Nghe: Đối thoại 2 câu chọn đáp án A, B, C, D (Câu 1 - 20)",
        skill: "LISTENING",
        instruction: "Nghe đối thoại ngắn và chọn câu trả lời chính xác nhất.",
        audioUrl,
        questions: Array.from({ length: 20 }, (_, idx) => ({
          id: `hsk5_q${idx + 1}`,
          type: "multiple_choice",
          content: `第 ${idx + 1} 题：请听录音并选择正确答案 (A, B, C, D)。`,
          points: 2,
          correctAnswer: ["B", "A", "C", "D", "A", "C", "B", "D", "A", "B", "C", "D", "B", "A", "C", "D", "A", "C", "B", "D"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 1}.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_2",
        title: "Phần 2 Nghe: Đối thoại dài & bài nói ngắn chọn A, B, C, D (Câu 21 - 45)",
        skill: "LISTENING",
        instruction: "Nghe đoạn đối thoại dài hoặc đoạn văn tự sự / thuyết minh và chọn đáp án đúng.",
        audioUrl,
        questions: Array.from({ length: 25 }, (_, idx) => ({
          id: `hsk5_q${idx + 21}`,
          type: "multiple_choice",
          content: `第 ${idx + 21} 题：请听录音并选择正确答案 (A, B, C, D)。`,
          points: 2,
          correctAnswer: ["C", "D", "B", "A", "C", "B", "D", "A", "C", "B", "A", "D", "C", "B", "A", "D", "B", "C", "A", "D", "B", "C", "A", "D", "C"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 21}.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_3",
        title: "Phần 1 Đọc: Đọc đoạn văn điền từ vào chỗ trống (Câu 46 - 60)",
        skill: "READING",
        instruction: "Đọc các đoạn văn và chọn từ ngữ / cụm từ thích hợp điền vào các chỗ trống.",
        passage: "每个人都渴望成功，但在追求成功的路上，挫折和困难是不可避免的。关键在于我们用怎样的心态去面对它们。积极的人往往能把挫折看作是积累经验的宝贵财富。",
        questions: Array.from({ length: 15 }, (_, idx) => ({
          id: `hsk5_q${idx + 46}`,
          type: "multiple_choice",
          content: `第 ${idx + 46} 题：请选出最适合填入文中横线处的选项。`,
          points: 2.5,
          correctAnswer: ["A", "C", "B", "D", "A", "D", "B", "C", "A", "B", "C", "D", "A", "C", "B"][idx],
          imageUrl: "",
          explanation: `Từ ngữ điền vào chỗ trống câu ${idx + 46}.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Từ ngữ ${l}` })),
        })),
      },
      {
        id: "group_4",
        title: "Phần 2 Đọc: Đọc đoạn văn ngắn chọn ý nghĩa trùng khớp nhất (Câu 61 - 70)",
        skill: "READING",
        instruction: "Đọc đoạn văn ngắn và chọn câu có ý nghĩa trùng khớp nhất với nội dung bài viết.",
        passage: "中国传统茶文化源远流长，饮茶不仅是一种生活习惯，更是一种修身养性的生活哲学。通过品茶，人们能够在忙碌喧嚣的现代生活中找到内心的宁静与平衡。",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk5_q${idx + 61}`,
          type: "multiple_choice",
          content: `第 ${idx + 61} 题：根据上文，下列哪项说法是正确的？`,
          points: 2.5,
          correctAnswer: ["B", "D", "A", "C", "B", "A", "D", "C", "B", "A"][idx],
          imageUrl: "",
          explanation: `Đáp án câu ${idx + 61} thể hiện chính xác nội dung bài viết.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Khẳng định ${l}` })),
        })),
      },
      {
        id: "group_5",
        title: "Phần 3 Đọc: Đọc hiểu các bài văn dài (Câu 71 - 90)",
        skill: "READING",
        instruction: "Đọc các bài văn dài và trả lời các câu hỏi liên quan bên dưới.",
        passage: "在现代企业管理中，团队合作的重要性日益凸显。一个优秀的团队，成员之间不仅分工明确，而且能够互相理解与支持。当面对严峻挑战时，团队的凝聚力和创新精神往往是克服困难、赢得市场的最关键因素。",
        questions: Array.from({ length: 20 }, (_, idx) => ({
          id: `hsk5_q${idx + 71}`,
          type: "multiple_choice",
          content: `第 ${idx + 71} 题：根据文章内容，回答下列问题。`,
          points: 2.5,
          correctAnswer: ["C", "B", "A", "D", "C", "D", "A", "B", "C", "A", "B", "D", "C", "A", "B", "D", "A", "C", "B", "D"][idx],
          imageUrl: "",
          explanation: `Căn cứ vào bài đọc, đáp án câu ${idx + 71} là phù hợp nhất.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_6",
        title: "Phần 1 Viết: Sắp xếp các từ thành câu hoàn chỉnh (Câu 91 - 98)",
        skill: "WRITING",
        instruction: "Sắp xếp các từ ngữ cho sẵn thành một câu hoàn chỉnh, đúng ngữ pháp HSK 5.",
        questions: Array.from({ length: 8 }, (_, idx) => ({
          id: `hsk5_q${idx + 91}`,
          type: "sentence_order",
          content: `第 ${idx + 91} 题：请将以下词语排列成一句完整通顺的句子。`,
          points: 5,
          correctAnswer: "这次 国际 会议 取得了 令人 满意的 成果。",
          imageUrl: "",
          explanation: `Trật tự câu chuẩn ngữ pháp HSK 5.`,
          options: [],
        })),
      },
      {
        id: "group_7",
        title: "Phần 2 Viết: Dùng 5 từ cho sẵn viết đoạn văn ~80 chữ (Câu 99)",
        skill: "WRITING",
        instruction: "Sử dụng 5 từ ngữ cho sẵn để viết một đoạn văn ngắn khoảng 80 chữ, câu văn mạch lạc, đúng chủ đề.",
        questions: [
          {
            id: "hsk5_q99",
            type: "essay",
            content: "第 99 题：请结合下列 5 个词语，写一篇 80 字左右的短文：\n\n【 宴会、举杯、祝福、难忘、精彩 】",
            points: 30,
            correctAnswer: "（参考范文）：昨天晚上我们举行了一场温馨的宴会。大家举杯共同祝福彼此未来的发展，场面非常感人。晚会上的文艺表演精彩绝伦，给大家留下了深刻而难忘的印象。",
            imageUrl: "",
            explanation: "Đoạn văn khoảng 80 chữ, sử dụng đủ 5 từ ngữ đã cho, đúng ngữ pháp, mạch lạc.",
            options: [],
          },
        ],
      },
      {
        id: "group_8",
        title: "Phần 2 Viết: Nhìn tranh viết đoạn văn ~80 chữ (Câu 100)",
        skill: "WRITING",
        instruction: "Quan sát bức tranh và viết một đoạn văn ngắn khoảng 80 chữ kết hợp với ý nghĩa của bức tranh.",
        questions: [
          {
            id: "hsk5_q100",
            type: "essay",
            content: "第 100 题：请结合下面给出的图片，写一篇 80 字左右的短文，表达你的理解和感受。",
            points: 30,
            correctAnswer: "（参考范文）：画面中一位年轻人正在全神贯注地看着电脑屏幕，桌上放着厚厚的参考资料。为了实现心中的梦想，他在深夜依然坚持奋斗，这种坚持不懈的精神值得我们所有人学习。",
            imageUrl: "",
            explanation: "Đoạn văn khoảng 80 chữ mô tả và phân tích ý nghĩa bức tranh một cách thuyết phục.",
            options: [],
          },
        ],
      },
    ];
  }

  if (level === 6) {
    const audioUrl = sampleExamAudio(level);
    return [
      {
        id: "group_1",
        title: "Phần 1 Nghe: Nghe đoạn văn ngắn chọn đáp án A, B, C, D (Câu 1 - 15)",
        skill: "LISTENING",
        instruction: "Nghe các đoạn văn ngắn và chọn câu trả lời chính xác nhất.",
        audioUrl,
        questions: Array.from({ length: 15 }, (_, idx) => ({
          id: `hsk6_q${idx + 1}`,
          type: "multiple_choice",
          content: `第 ${idx + 1} 题：请听短文并选择正确答案 (A, B, C, D)。`,
          points: 2,
          correctAnswer: ["B", "A", "C", "D", "A", "C", "B", "D", "A", "B", "C", "D", "B", "A", "C"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 1}.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_2",
        title: "Phần 2 Nghe: Nghe phỏng vấn chọn đáp án A, B, C, D (Câu 16 - 30)",
        skill: "LISTENING",
        instruction: "Nghe 3 bài phỏng vấn dài và trả lời các câu hỏi trắc nghiệm liên quan.",
        audioUrl,
        questions: Array.from({ length: 15 }, (_, idx) => ({
          id: `hsk6_q${idx + 16}`,
          type: "multiple_choice",
          content: `第 ${idx + 16} 题：根据采访内容，选择正确答案 (A, B, C, D)。`,
          points: 2,
          correctAnswer: ["C", "D", "B", "A", "C", "B", "D", "A", "C", "B", "A", "D", "C", "B", "A"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 16}.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_3",
        title: "Phần 3 Nghe: Nghe bài nói ngắn chọn đáp án A, B, C, D (Câu 31 - 50)",
        skill: "LISTENING",
        instruction: "Nghe các bài phát biểu, bài nói chuyện và trả lời các câu hỏi liên quan.",
        audioUrl,
        questions: Array.from({ length: 20 }, (_, idx) => ({
          id: `hsk6_q${idx + 31}`,
          type: "multiple_choice",
          content: `第 ${idx + 31} 题：请听录音并选择正确答案 (A, B, C, D)。`,
          points: 2,
          correctAnswer: ["A", "B", "C", "D", "B", "C", "A", "D", "B", "A", "C", "D", "A", "B", "C", "D", "B", "A", "C", "D"][idx],
          imageUrl: "",
          explanation: `Đáp án chuẩn câu ${idx + 31}.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_4",
        title: "Phần 1 Đọc: Tìm câu có lỗi sai ngữ pháp (Câu 51 - 60)",
        skill: "READING",
        instruction: "Trong mỗi câu hỏi gồm 4 câu A, B, C, D, hãy tìm ra câu có lỗi sai về ngữ pháp hoặc dùng từ.",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk6_q${idx + 51}`,
          type: "find_error",
          content: `第 ${idx + 51} 题：下列 4 个句子中，存在病句（语病）的是哪一项？`,
          points: 2.5,
          correctAnswer: ["B", "A", "C", "D", "A", "C", "B", "D", "C", "A"][idx],
          imageUrl: "",
          explanation: `Câu có lỗi ngữ pháp hoặc dùng từ không chính xác.`,
          options: [
            { id: "A", text: "Câu A: Ngữ pháp chuẩn xác." },
            { id: "B", text: "Câu B: Có lỗi sai trật tự từ hoặc dùng từ thừa." },
            { id: "C", text: "Câu C: Ngữ pháp chuẩn xác." },
            { id: "D", text: "Câu D: Ngữ pháp chuẩn xác." },
          ],
        })),
      },
      {
        id: "group_5",
        title: "Phần 2 Đọc: Điền từ vào chỗ trống trong đoạn văn (Câu 61 - 70)",
        skill: "READING",
        instruction: "Đọc các đoạn văn và chọn nhóm từ ngữ phù hợp nhất để điền vào các chỗ trống.",
        passage: "中国传统园林强调‘天人合一’的哲学思想，巧妙地将自然山水与人工建筑融为一体。它不仅体现了古代文人的审美情趣，更是中华优秀传统文化在空间艺术上的生动展现。",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk6_q${idx + 61}`,
          type: "fill_blank",
          content: `第 ${idx + 61} 题：请选出最适合填入文中横线处的词语组合。`,
          points: 2.5,
          correctAnswer: ["C", "A", "B", "D", "A", "C", "B", "D", "B", "A"][idx],
          imageUrl: "",
          explanation: `Tổ hợp từ vựng chính xác cho câu ${idx + 61}.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Bộ từ vựng ${l}` })),
        })),
      },
      {
        id: "group_6",
        title: "Phần 3 Đọc: Chọn câu thích hợp điền vào đoạn văn (Câu 71 - 80)",
        skill: "READING",
        instruction: "Đọc bài viết có các câu bị khuyết, chọn câu thích hợp trong các phương án để điền vào chỗ trống.",
        passage: "人工智能技术的飞速发展正在深刻改变人类的生活方式。然而，在享受科技便利的同时，我们也面临着数据安全与伦理道德等多重挑战。如何在推动技术进步的同时确保其符合人类的长远利益，是当前国际社会共同关注的重要课题。",
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `hsk6_q${idx + 71}`,
          type: "matching",
          content: `第 ${idx + 71} 题：请选出最适合填入文中位置的句子。`,
          points: 2.5,
          correctAnswer: ["B", "D", "A", "C", "E", "B", "C", "A", "D", "E"][idx],
          imageUrl: "",
          explanation: `Câu văn mạch lạc phù hợp ngữ cảnh câu ${idx + 71}.`,
          options: ["A", "B", "C", "D", "E"].map((l) => ({ id: l, text: `Phương án ${l}` })),
        })),
      },
      {
        id: "group_7",
        title: "Phần 4 Đọc: Đọc hiểu các bài văn dài (Câu 81 - 100)",
        skill: "READING",
        instruction: "Đọc các bài luận văn, bài phân tích dài và trả lời các câu hỏi bên dưới.",
        passage: "生态文明建设关系人民福祉，关乎民族未来的长远发展。绿水青山就是金山银山，只有保护好我们赖以生存的自然生态环境，才能实现经济社会的高质量与可持续发展。近年来，我国在植树造林、节能减排方面取得了令世界瞩目的巨大成就。",
        questions: Array.from({ length: 20 }, (_, idx) => ({
          id: `hsk6_q${idx + 81}`,
          type: "multiple_choice",
          content: `第 ${idx + 81} 题：根据文章内容，下列哪项推断是合理的？`,
          points: 2.5,
          correctAnswer: ["A", "C", "B", "D", "A", "B", "C", "D", "C", "A", "B", "D", "C", "A", "B", "D", "B", "C", "A", "D"][idx],
          imageUrl: "",
          explanation: `Đáp án câu ${idx + 81} được chứng minh rõ trong bài viết.`,
          options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
        })),
      },
      {
        id: "group_8",
        title: "Phần Viết: Thu gọn bài văn 1000 chữ thành bài tóm tắt 400 chữ (Câu 101)",
        skill: "WRITING",
        instruction: "Đọc kỹ bài văn khoảng 1000 chữ trong 10 phút, sau đó thu gọn và viết lại thành một bài văn tóm tắt khoảng 400 chữ. Tự đặt tiêu đề, không đưa vào quan điểm cá nhân.",
        passage: "【1000字参考原文】：从前有一位著名的画家，他画了一幅自认为非常完美的画作。为了检验画作的质量，他把画放在集市中央，并在旁边写道：‘如果您觉得哪里有缺点，请用笔在旁边画一个圈。’傍晚他取回画作时，发现画上密密麻麻画满了圈，画家感到十分沮丧。\n\n他的老师得知后笑着对他说：‘明天你换一种做法，把画再放回去，请大家在觉得画得好的地方画圈。’结果第二天傍晚取回画时，画上也同样画满了圈！老师意味深长地对他说：‘现实中任何事物都不可能让所有人满意，有人看到缺点，有人看到优点。真正重要的是你自己心中对美的标准与坚持。’",
        questions: [
          {
            id: "hsk6_q101",
            type: "essay",
            content: "第 101 题：请根据给出的 1000 字原文，将其缩写成一篇 400 字左右的短文。要求：自拟题目，忠实于原文内容，语言流畅，标点正确。",
            points: 100,
            correctAnswer: "（参考缩写范文）：\n\n【坚持心中的标准】\n一位画家画了一幅得意之作，放在集市让人挑错，结果满幅被画圈，令他倍感沮丧。老师建议他第二天请人圈出精彩之处，结果同样画满了圈。老师借此开导他：世事难全，众口难调。批评与赞誉皆有其视角，创作者最关键的是坚持内心的艺术标准与操守，不因外界评价迷失方向。",
            imageUrl: "",
            explanation: "Bài viết khoảng 400 chữ tóm tắt đầy đủ cốt truyện và thông điệp triết lý của bài đọc.",
            options: [],
          },
        ],
      },
    ];
  }

  const sample = getSampleQuestionsForLevel(level);
  return unflattenToGroups(sample, level);
}


