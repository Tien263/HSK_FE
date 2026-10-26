# Bài đọc, văn hóa và trình soạn câu hỏi

## Dữ liệu bài học

Giáo trình, `TeacherSavedLesson.content` và `ClassLesson.content` dùng cùng cấu trúc. Không cần xóa hoặc tạo lại database.

- `reading`: `id`, `titleZh`, `titleVi`, `contentZh`, `contentPy`, `contentVi`, `wordCount`, `extraVocabs`.
- Mỗi từ mở rộng: `id`, `hanzi`, `pinyin`, `meaningVi`, `exampleZh`, `examplePy`, `exampleVi`.
- `culturalNote`: `context`, `naturalExpressions`, `politeExpressions`, `cautionNotes`, `targetAudience`, `comparisonNote`, `practiceScenario`.
- Mỗi mẫu câu: `zh`, `py`, `vi`, `usage` hoặc `note`.
- `phonetics` vẫn là phần ngữ âm riêng. Không nối các trường này thành `context`.

File JSON toàn bài có thể chứa hai trường mới. Bản riêng của giáo viên có form sửa bài đọc và văn hóa; các trường được giữ khi lưu, mở lại và công bố cho lớp. Nội dung gốc chưa có bài đọc không được tự thay bằng đoạn văn hóa hoặc ngữ âm. Chữ Hán có thể được suy ra pinyin để đọc, nhưng không tự sinh bản dịch giả.

`hasReading` cùng `reading` trong payload lựa chọn giữ bài đọc hoặc chỉ các từ mở rộng đã chọn. `culturalNote` chỉ chứa những mục đã được chọn; không gửi toàn bộ phần văn hóa chỉ vì chọn một lưu ý. Từ mở rộng đã lưu cũng được đưa vào kho từ riêng của giáo viên.

## Câu hỏi

`SharedQuestionEditor` dùng chung tại kho câu hỏi, tạo đề và tạo bài tập từ nội dung bài học. Trình soạn toàn chiều rộng có hai cột và bốn thao tác lưu. `QuestionInteraction` được dùng cả trong mô phỏng lẫn bài làm thật. `Question.editorData.schemaVersion = 2` lưu thông tin đặc thù của 12 dạng, nguồn học liệu, ID ô trống, ID cặp nối, ID thẻ từ và cấu hình chấm.

Đáp án, transcript, rubric, bài mẫu và vị trí lỗi sai được loại khỏi JSON trả cho học sinh đang làm bài. Các bài chấm tay không được tự đánh dấu đúng chỉ vì đã nhập văn bản. Ảnh gốc và âm thanh tải lên được lưu thực; giới hạn hiện tại là 1 MB mỗi file.

CSV đọc theo tên cột, giữ ô rỗng, BOM, dấu phẩy và xuống dòng trong ô có dấu ngoặc kép. Dùng `correctAnswer`, `answer` hoặc `correct` cho đáp án; thiếu đáp án không được mặc định thành `A`. Pinyin chỉ là đáp án thay thế nếu được khai báo trong `alternatives`. Bộ so đáp án dùng chung cho xem thử và backend.

## Kiểm tra

- `node --test scripts/teacher-content.test.cjs scripts/curriculum.test.cjs`: cấu trúc dữ liệu, CSV, chọn nội dung, chấm điểm và ẩn đáp án.
- `PORTAL_TEST_URL=http://localhost:3001 node scripts/teacher-content-verify.cjs`: kiểm tra API và Chrome bằng các tài khoản/lớp cách ly, gồm 12 form, lưu nháp/tải lại, tạo đề, chọn bài đọc và từ mở rộng. Script tự dọn các bản ghi kiểm tra.
- `npx tsc --noEmit`: kiểm tra TypeScript.
