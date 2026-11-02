/**
 * Kho câu ví dụ chuẩn mực cho từ vựng HSK 2 theo Giáo trình Chuẩn HSK (HSK Standard Course 2)
 */

export interface VocabExampleDef {
  zh: string;
  pinyin: string;
  vi: string;
  tip?: string;
}

export const HSK2_VOCAB_EXAMPLES: Record<string, VocabExampleDef> = {
  // Bài 1
  旅游: {
    zh: "我们要去北京旅游，你觉得什么时候去最好？",
    pinyin: "Wǒmen yào qù Běijīng lǚyóu, nǐ juéde shénme shíhou qù zuì hǎo?",
    vi: "Chúng tôi muốn đi Bắc Kinh du lịch, bạn thấy đi lúc nào là tốt nhất?",
    tip: "Âm 'lǚ' chúm môi tròn âm 'ü', nâng giọng lên cao (thanh 2).",
  },
  觉得: {
    zh: "我觉得九月份去北京旅游最合适。",
    pinyin: "Wǒ juéde jiǔ yuèfèn qù Běijīng lǚyóu zuì héshì.",
    vi: "Tôi cảm thấy đi Bắc Kinh du lịch vào tháng chín là thích hợp nhất.",
    tip: "Âm tiết 'de' đọc thanh nhẹ, ngắn và nhẹ nhàng.",
  },
  最: {
    zh: "九月的北京天气最好，不冷也不热。",
    pinyin: "Jiǔ yuè de Běijīng tiānqì zuì hǎo, bù lěng yě bú rè.",
    vi: "Bắc Kinh vào tháng chín thời tiết đẹp nhất, không lạnh cũng không nóng.",
    tip: "Phó từ 'zuì' mang thanh 4 dứt khoát, đứng trước tính từ 'hǎo'.",
  },
  为什么: {
    zh: "你为什么不在家里休息，还要出去跑步呢？",
    pinyin: "Nǐ wèishénme bú zài jiālǐ xiūxi, hái yào chūqù pǎobù ne?",
    vi: "Tại sao bạn không nghỉ ngơi ở nhà mà còn muốn ra ngoài chạy bộ?",
    tip: "Cụm hỏi nguyên nhân 'wèishénme', âm 'wèi' thanh 4 rõ ràng.",
  },
  也: {
    zh: "我也想和你一起去北京旅游。",
    pinyin: "Wǒ yě xiǎng hé nǐ yìqǐ qù Běijīng lǚyóu.",
    vi: "Tôi cũng muốn cùng bạn đi Bắc Kinh du lịch.",
    tip: "Khi 3 thanh 3 đứng liền nhau (Wǒ yě xiǎng), 'yě' biến âm thành thanh 2.",
  },
  运动: {
    zh: "每天运动半个小时对身体非常有好处。",
    pinyin: "Měitiān yùndòng bàn gè xiǎoshí duì shēntǐ fēicháng yǒu hǎochu.",
    vi: "Mỗi ngày vận động nửa tiếng rất có lợi cho sức khỏe.",
    tip: "'Yùndòng' gồm 2 thanh 4 liền nhau, phát âm dứt khoát.",
  },
  踢足球: {
    zh: "下午天气很舒服，我们一起去踢足球吧。",
    pinyin: "Xiàwǔ tiānqì hěn shūfu, wǒmen yìqǐ qù tī zúqiú ba.",
    vi: "Buổi chiều thời tiết rất dễ chịu, chúng ta cùng đi đá bóng đi.",
    tip: "Âm 'tī' bật hơi nhẹ thanh 1, 'zú' đầu lưỡi uốn nhẹ thanh 2.",
  },
  一起: {
    zh: "周末我们一起去图书馆看书吧。",
    pinyin: "Zhōumò wǒmen yìqǐ qù túshūguǎn kànshū ba.",
    vi: "Cuối tuần chúng mình cùng nhau đi thư viện đọc sách nhé.",
    tip: "Chữ 'yì' biến điệu thành thanh 4 trước chữ 'qǐ' (thanh 3).",
  },
  要: {
    zh: "明天上午我们要去买几个新椅子。",
    pinyin: "Míngtiān shàngwǔ wǒmen yào mǎi jǐ gè xīn yǐzi.",
    vi: "Sáng mai chúng tôi muốn đi mua mấy chiếc ghế mới.",
    tip: "'Yào' biểu thị ý định, kế hoạch làm việc gì.",
  },
  新: {
    zh: "这是我昨天刚买的新手表，好看吗？",
    pinyin: "Zhè shì wǒ zuótiān gāng mǎi de xīn shǒubiǎo, hǎokàn ma?",
    vi: "Đây là chiếc đồng hồ mới tôi vừa mua hôm qua, đẹp không?",
    tip: "Âm 'xīn' kéo dài bằng phẳng ở thanh 1.",
  },
  买: {
    zh: "你想去超市买点儿什么水果？",
    pinyin: "Nǐ xiǎng qù chāoshì mǎi diǎnr shénme shuǐguǒ?",
    vi: "Bạn muốn đi siêu thị mua chút hoa quả gì?",
    tip: "Phân biệt 'mǎi' (thanh 3: mua) và 'mài' (thanh 4: bán).",
  },
  睛: {
    zh: "今天天气晴朗，太阳出来了。",
    pinyin: "Jīntiān tiānqì qínglǎng, tàiyáng chūlái le.",
    vi: "Hôm nay trời quang mây tạnh, mặt trời lên rồi.",
    tip: "Thuộc bộ Nhật (日) biểu thị thời tiết nắng ráo quang đãng.",
  },
  天气: {
    zh: "今天的北京天气非常晴朗，空气很好。",
    pinyin: "Jīntiān de Běijīng tiānqì fēicháng qínglǎng, kōngqì hěn hǎo.",
    vi: "Thời tiết Bắc Kinh hôm nay rất quang đãng, không khí trong lành.",
    tip: "Chữ 'qì' mang thanh 4 dứt khoát.",
  },
  北: {
    zh: "北京在中国北边，九月份天气最舒服。",
    pinyin: "Běijīng zài Zhōngguó běibian, jiǔ yuèfèn tiānqì zuì shūfu.",
    vi: "Bắc Kinh ở phía bắc Trung Quốc, tháng chín thời tiết dễ chịu nhất.",
    tip: "Âm 'běi' thanh 3 trầm, xuống sâu rồi bật nhẹ.",
  },

  // Bài 2
  生病: {
    zh: "他最近工作太忙，昨天生病住院了。",
    pinyin: "Tā zuìjìn gōngzuò tài máng, zuótiān shēngbìng zhùyuàn le.",
    vi: "Dạo này anh ấy làm việc bận quá, hôm qua bị ốm phải nhập viện rồi.",
    tip: "'Shēng' thanh 1, 'bìng' thanh 4 dứt khoát.",
  },
  每: {
    zh: "我每天早上六点起床跑步锻炼身体。",
    pinyin: "Wǒ měitiān zǎoshang liù diǎn qǐchuáng pǎobù duànliàn shēntǐ.",
    vi: "Mỗi ngày tôi thức dậy lúc sáu giờ sáng để chạy bộ rèn luyện sức khỏe.",
    tip: "Đại từ 'měi' thường đi kèm với 'dōu' ở vế sau.",
  },
  早上: {
    zh: "早上喝一杯温开水对身体非常好。",
    pinyin: "Zǎoshang hē yì bēi wēn kāishuǐ duì shēntǐ fēicháng hǎo.",
    vi: "Buổi sáng uống một cốc nước ấm rất tốt cho sức khỏe.",
    tip: "Âm 'shang' trong 'zǎoshang' đọc thanh nhẹ.",
  },
  跑步: {
    zh: "他每天坚持跑步，所以身体一直很健康。",
    pinyin: "Tā měitiān jiānchí pǎobù, suǒyǐ shēntǐ yìzhí hěn jiànkāng.",
    vi: "Anh ấy mỗi ngày kiên trì chạy bộ, nên sức khỏe luôn rất tốt.",
    tip: "Âm 'pǎo' bật hơi mạnh ở đầu môi.",
  },
  起床: {
    zh: "明天有中文考试，你一定要早点儿起床。",
    pinyin: "Míngtiān yǒu zhōngwén kǎoshì, nǐ yídìng yào zǎodiǎnr qǐchuáng.",
    vi: "Ngày mai có bài thi tiếng Trung, bạn nhất định phải dậy sớm nhé.",
    tip: "'Qǐchuáng' là cụm động tân (động từ ly hợp).",
  },
  药: {
    zh: "医生说这个药一天吃三次，饭后吃。",
    pinyin: "Yīshēng shuō zhège yào yì tiān chī sān cì, fànhòu chī.",
    vi: "Bác sĩ nói thuốc này uống ngày ba lần, sau bữa ăn.",
    tip: "Chữ 'yào' thanh 4 rơi giọng mạnh mẽ.",
  },
  身体: {
    zh: "工作虽然重要，但是身体健康才是第一位的。",
    pinyin: "Gōngzuò suīrán zhòngyào, dànshì shēntǐ jiànkāng cái shì dì-yī wèi de.",
    vi: "Công việc tuy quan trọng nhưng sức khỏe thân thể mới là số một.",
    tip: "Âm 'shēn' uốn lưỡi thanh 1, 'tǐ' thanh 3.",
  },
  出院: {
    zh: "医生说他的身体恢复得很好，下个星期就能出院了。",
    pinyin: "Yīshēng shuō tā de shēntǐ huīfù de hěn hǎo, xià gè xīngqī jiù néng chūyuàn le.",
    vi: "Bác sĩ nói sức khỏe anh ấy hồi phục rất tốt, tuần sau là có thể xuất viện rồi.",
    tip: "'Chū' thanh 1 uốn lưỡi, 'yuàn' thanh 4.",
  },
  高: {
    zh: "大卫比我高五厘米，他经常打篮球。",
    pinyin: "Dàwèi bǐ wǒ gāo wǔ límǐ, tā jīngcháng dǎ lánqiú.",
    vi: "David cao hơn tôi 5 cm, anh ấy thường xuyên chơi bóng rổ.",
    tip: "Tính từ 'gāo' đọc thanh 1 ngân dài.",
  },
  米: {
    zh: "这栋教学楼高二十多米，非常漂亮。",
    pinyin: "Zhè dòng jiàoxuélóu gāo èrshí duō mǐ, fēicháng piàoliang.",
    vi: "Tòa nhà học này cao hơn 20 mét, rất đẹp.",
    tip: "'Mǐ' là lượng từ đo độ dài (mét).",
  },
  忙: {
    zh: "你今天怎么这么忙？连午饭都没时间吃。",
    pinyin: "Nǐ jīntiān zěnme zhème máng? Lián wǔfàn dōu méi shíjiān chī.",
    vi: "Sao hôm nay bạn bận thế? Ngay cả cơm trưa cũng không có thời gian ăn.",
    tip: "Âm 'máng' thanh 2 lên giọng.",
  },
  时间: {
    zh: "明天下午你有时间吗？我们一起去喝茶。",
    pinyin: "Míngtiān xiàwǔ nǐ yǒu shíjiān ma? Wǒmen yìqǐ qù hē chá.",
    vi: "Chiều mai bạn có thời gian không? Chúng ta cùng đi uống trà.",
    tip: "'Shí' thanh 2, 'jiān' thanh 1 ngân ngang.",
  },

  // Bài 3
  手表: {
    zh: "这块黑色的手表三千多块钱，真漂亮。",
    pinyin: "Zhè kuài hēisè de shǒubiǎo sānqiān duō kuài qián, zhēn piàoliang.",
    vi: "Chiếc đồng hồ màu đen này hơn ba nghìn tệ, thật là đẹp.",
    tip: "'Shǒubiǎo' đi kèm lượng từ 'kuài' (块).",
  },
  千: {
    zh: "这台新电脑花了四千五百块钱。",
    pinyin: "Zhè tái xīn diànnǎo huā le sìqiān wǔbǎi kuài qián.",
    vi: "Chiếc máy tính mới này tốn bốn nghìn năm trăm tệ.",
    tip: "Âm 'qiān' bật hơi mạnh ở đầu lưỡi.",
  },
  报纸: {
    zh: "爷爷每天早上边喝茶边看今天的报纸。",
    pinyin: "Yéye měitiān zǎoshang biān hē chá biān kàn jīntiān de bàozhǐ.",
    vi: "Ông nội mỗi buổi sáng vừa uống trà vừa đọc báo hôm nay.",
    tip: "'Bào' thanh 4, 'zhǐ' uốn lưỡi thanh 3.",
  },
  送: {
    zh: "这是我送给你的生日礼物，希望你喜欢。",
    pinyin: "Zhè shì wǒ sòng gěi nǐ de shēngrì lǐwù, xīwàng nǐ xǐhuan.",
    vi: "Đây là món quà sinh nhật tôi tặng bạn, hy vọng bạn thích.",
    tip: "Động từ 'sòng' thanh 4 dứt khoát.",
  },
  一下: {
    zh: "请大家看一下黑板上的这道题。",
    pinyin: "Qǐng dàjiā kàn yíxià hēibǎn shang de zhè dào tí.",
    vi: "Mời mọi người nhìn một chút câu hỏi này trên bảng.",
    tip: "'Yíxià' biểu thị hành động diễn ra nhanh chóng hoặc ngữ khí nhẹ nhàng.",
  },
  牛奶: {
    zh: "晚上睡觉前喝一杯热牛奶对睡眠很好。",
    pinyin: "Wǎnshang shuìjiào qián hē yì bēi rè niúnǎi duì shuìmián hěn hǎo.",
    vi: "Buổi tối trước khi đi ngủ uống một cốc sữa nóng rất tốt cho giấc ngủ.",
    tip: "'Niú' thanh 2, 'nǎi' thanh 3.",
  },
  房间: {
    zh: "这个房间里放着两张床和一个大衣柜。",
    pinyin: "Zhège fángjiān lǐ fàngzhe liǎng zhāng chuáng hé yí gè dà yīguì.",
    vi: "Trong căn phòng này đặt hai chiếc giường và một chiếc tủ quần áo lớn.",
    tip: "'Fáng' thanh 2, 'jiān' thanh 1.",
  },
  丈夫: {
    zh: "那是她丈夫，两个人看起来非常幸福。",
    pinyin: "Nà shì tā zhàngfu, liǎng gè rén kàn qǐlái fēicháng xìngfú.",
    vi: "Đó là chồng của cô ấy, hai người trông rất hạnh phúc.",
    tip: "Âm 'fu' trong 'zhàngfu' đọc thanh nhẹ.",
  },
  旁边: {
    zh: "我家旁边有一家很大的新超市。",
    pinyin: "Wǒ jiā pángbiān yǒu yì jiā hěn dà de xīn chāoshì.",
    vi: "Bên cạnh nhà tôi có một siêu thị mới rất lớn.",
    tip: "'Páng' thanh 2, 'biān' thanh 1.",
  },
  真: {
    zh: "今天的菜真好吃，谢谢你的热情招待！",
    pinyin: "Jīntiān de cài zhēn hǎochī, xièxie nǐ de rèqíng zhāodài!",
    vi: "Đồ ăn hôm nay thật ngon, cảm ơn sự tiếp đãi nồng hậu của bạn!",
    tip: "Phó từ ngữ khí 'zhēn' đứng trước tính từ để biểu thị cảm thán.",
  },
  颜色: {
    zh: "你最喜欢什么颜色？我最喜欢红色。",
    pinyin: "Nǐ zuì xǐhuan shénme yánsè? Wǒ zuì xǐhuan hóngsè.",
    vi: "Bạn thích màu gì nhất? Tôi thích màu đỏ nhất.",
    tip: "'Yán' thanh 2, 'sè' thanh 4.",
  },
  粉色: {
    zh: "妹妹穿这条粉色的裙子真可爱。",
    pinyin: "Mèimei chuān zhè tiáo fěnsè de qúnzi zhēn kě'ài.",
    vi: "Em gái mặc chiếc váy màu hồng này thật dễ thương.",
    tip: "'Fěn' thanh 3, 'sè' thanh 4.",
  },
  红: {
    zh: "左边那个红色的杯子是我昨天买的。",
    pinyin: "Zuǒbian nàge hóngsè de bēizi shì wǒ zuótiān mǎi de.",
    vi: "Chiếc cốc màu đỏ bên trái kia là hôm qua tôi mua đấy.",
    tip: "'Hóng' thanh 2 lên giọng.",
  },
};

/**
 * Trả về câu ví dụ cho bất kỳ từ vựng nào dựa trên bảng từ chuẩn hoặc sinh động
 */
export function getVocabSentenceFallback(
  hanzi: string,
  pinyinStr: string,
  meaningVi: string,
  hskLevel: number
): VocabExampleDef {
  if (HSK2_VOCAB_EXAMPLES[hanzi]) {
    return HSK2_VOCAB_EXAMPLES[hanzi];
  }

  // Mẫu câu ứng dụng tự nhiên chuẩn theo từ loại
  return {
    zh: `在日常生活中，我们经常使用“${hanzi}”这个词。`,
    pinyin: `Zài rìcháng shēnghuó zhōng, wǒmen jīngcháng shǐyòng “${hanzi}” zhège cí.`,
    vi: `Trong cuộc sống hàng ngày, chúng ta thường sử dụng từ “${hanzi}” (${meaningVi}).`,
    tip: `Từ vựng HSK ${hskLevel}: '${hanzi}' (${pinyinStr}) mang nghĩa '${meaningVi}'.`,
  };
}
