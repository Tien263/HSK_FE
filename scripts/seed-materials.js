const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS Material (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    hskLevel INTEGER DEFAULT 1,
    classId TEXT,
    fileUrl TEXT,
    fileName TEXT,
    fileSize TEXT,
    description TEXT,
    uploadedBy TEXT DEFAULT 'Cô Ning Ning',
    downloadCount INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.prepare('DELETE FROM Material').run();

const insert = db.prepare(`
  INSERT INTO Material (id, title, type, hskLevel, classId, fileUrl, fileName, fileSize, description, uploadedBy, downloadCount)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const items = [
  ['mat-1', 'Giáo trình Chuẩn HSK 1 (Standard Course HSK 1 Full PDF)', 'TEXTBOOK', 1, null, '/materials/hsk1-standard-course.pdf', 'HSK1_Standard_Course_Full.pdf', '24.5 MB', 'Bộ sách giáo khoa chuẩn HSK 1 từ Bài 1 đến Bài 15 kèm bảng từ vựng và phiên âm pinyin đầy đủ.', 'Cô Ning Ning', 42],
  ['mat-2', 'Sổ tay 150 Từ vựng HSK 1 cốt lõi kèm âm thanh & ví dụ', 'VOCABULARY', 1, null, '/materials/hsk1-150-vocab.xlsx', '150_Tu_Vung_HSK1_Kem_Vi_Du.xlsx', '2.8 MB', 'Bảng từ vựng chia theo 15 bài học, kèm nghĩa tiếng Việt, phân loại từ và câu ví dụ thông dụng.', 'Cô Ning Ning', 89],
  ['mat-3', 'Slide bài giảng Bài 4: Gia đình & Đại từ sở hữu (的)', 'SLIDE', 1, null, '/materials/slide-bai-4-gia-dinh.pptx', 'Slide_Bai4_GiaDinh_CoNingNing.pptx', '15.2 MB', 'Slide trình chiếu sinh động, có minh họa trực quan phục vụ buổi học trên lớp và tự ôn ở nhà.', 'Cô Ning Ning', 35],
  ['mat-4', 'Chuyên đề Ngữ pháp HSK 1: Trợ từ kết cấu & Câu chữ 是', 'GRAMMAR', 1, null, '/materials/grammar-hsk1-chuyen-de.pdf', 'ChuyenDe_NguPhap_HSK1_CanBan.pdf', '4.1 MB', 'Tổng hợp toàn bộ 12 hiện tượng ngữ pháp thường gặp nhất trong đề thi HSK 1 chuẩn 3.0.', 'Cô Ning Ning', 67],
  ['mat-5', 'Sách Bài tập HSK 1 (Workbook) có giải thích chi tiết', 'TEXTBOOK', 1, null, '/materials/hsk1-workbook.pdf', 'HSK1_Workbook_Exercise_Answer.pdf', '18.0 MB', 'Bộ bài tập củng cố sau mỗi bài học, rèn luyện kỹ năng nghe và đọc hiểu.', 'Cô Ning Ning', 51],
  ['mat-6', 'Trọn bộ Audio luyện nghe chuẩn giọng Bắc Kinh HSK 1', 'AUDIO', 1, null, '/materials/hsk1-full-audio.zip', 'HSK1_Audio_Full_MP3.zip', '65.4 MB', 'Toàn bộ file nghe MP3 chất lượng cao theo chuẩn phát thanh viên Đài phát thanh Trung ương.', 'Cô Ning Ning', 114],
];

for (const it of items) {
  insert.run(...it);
}
console.log('Clean UTF-8 materials re-seeded!');
