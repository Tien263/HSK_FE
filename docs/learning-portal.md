# Không gian lớp học thủy mặc

## Khởi chạy và triển khai

Website dùng Next.js 16, Prisma và PostgreSQL hiện có. Chạy `npm run portal:setup` một lần trên database triển khai, sau đó `npm run build` và `npm start`. Lệnh setup chỉ bổ sung bảng/cột/index; có thể chạy lại và không xóa dữ liệu. Không dùng `prisma db push --accept-data-loss`.

Các bảng mới: `TeacherVocabulary` (khóa riêng theo giáo viên/chữ/pinyin), `TeachingMaterial` (metadata và bytes file), `MaterialClass` (quyền chia sẻ theo lớp), `ClassSchedule` (quy tắc lặp tuần), `ScheduleException` (đổi/hủy một ngày gốc). `ClassLesson.content` giữ bản nội dung đầy đủ đã công bố, độc lập với những lần sửa hoặc xóa giáo trình chung sau đó.

## Các luồng sử dụng

- Giáo viên: `/t/dashboard`, chọn Lớp học để quản lý tổng quan, lộ trình, học sinh, bài tập, tài liệu, lịch và báo cáo. `/t/classes` và `/t/lessons` vẫn chuyển đúng mục tương ứng.
- Kho học liệu hiển thị toàn bộ các cấp giáo trình chưa bị admin xóa. Giáo viên đọc giáo trình chung và lưu từng từ hoặc toàn bộ từ của một bài vào kho riêng. Từ riêng có thể tạo câu hỏi riêng, đưa vào bộ đề rồi giao cho lớp.
- Chỉnh sửa câu hỏi/đề đã sử dụng bị chặn để giữ kết quả lịch sử. Cập nhật bài tập từ một từ đã được dùng tạo câu hỏi mới, giữ câu hỏi cũ trong đề đã giao.
- Công bố bài học có lựa chọn từ vựng, ngữ pháp, hội thoại, ngữ âm và văn hóa. Học sinh chỉ xem nội dung đã công bố của lớp đã được duyệt. Nội dung mở dưới danh sách bài, không dùng popup đọc bài.
- Tài liệu: tải file tối đa 15 MB vào thư viện riêng và chọn lớp được xem. Hỗ trợ PDF, DOC/DOCX, PPT/PPTX, XLSX, CSV, TXT, MP3/WAV/M4A, PNG/JPG/WebP. Học sinh đã duyệt tải đúng bytes gốc qua endpoint có kiểm tra quyền. Gỡ chia sẻ có hiệu lực ở cả danh sách và đường dẫn tải.
- Lịch học dùng múi giờ Việt Nam. Chọn thứ, ngày bắt đầu, giờ và ngày kết thúc tùy chọn; lịch tự mở rộng theo tuần khi xem. Đổi ngày/giờ, ghi chú hoặc hủy một buổi bằng ngày gốc của buổi đó. Các tuần khác giữ nguyên. Chống trùng lịch và cập nhật đồng thời bằng khóa transaction PostgreSQL theo giáo viên, cùng phiên bản ngoại lệ.
- Bài tập: tạo bộ đề từ câu hỏi thật, giao cho lớp, học sinh làm và nộp trên máy chủ. Lượt đang làm được dùng lại khi tải lại; giới hạn lượt làm và thời gian được kiểm tra trên máy chủ. Chấm từng câu và nhận xét được lưu vào database.

## Số liệu báo cáo

Không sinh số liệu mẫu hoặc suy diễn phần trăm tăng trưởng. Sĩ số chỉ tính học sinh `APPROVED`; số chờ duyệt tách riêng. Mẫu số hoàn thành là các cặp học sinh–bài tập đã mở được giao cho học sinh đang ở lớp, xét danh sách mục tiêu nếu có. Một học sinh nộp nhiều lượt cùng bài chỉ tính hoàn thành một lần. Bài chưa mở, nháp và lưu trữ không vào mẫu số. Bài quá hạn chưa nộp được đánh dấu cần hỗ trợ.

Điểm tính từ lượt `GRADED`, quy đổi về /100 theo `maxScore`, dùng quy tắc `BEST` hoặc lượt chấm gần nhất theo cấu hình bài tập. Chưa có bài tập hoặc điểm thì trả `null` và giao diện hiển thị dấu “—”. Ngưỡng điểm cần hỗ trợ lấy từ bảng `Setting` nếu tồn tại. Bộ lọc thời gian theo hạn nộp bài, bao gồm cả ngày theo múi giờ Việt Nam. CSV xuất các hàng học sinh thực tế đang hiển thị, có chống thực thi công thức bảng tính.

API dùng cookie phiên đăng nhập được ký trên máy chủ; không nhận danh tính từ `x-user-id`, `studentId`, `teacherId` do trình duyệt tự khai báo để cấp quyền. Kho riêng không ghi vào giáo trình admin và không xuất hiện ở tài khoản giáo viên khác. Các thao tác tạo/sửa mới kiểm tra cùng nguồn yêu cầu.

## Phong cảnh

Được tạo bằng công cụ ImageGen tích hợp trong phiên làm việc, lưu thành asset trong repository:

- `public/theme/hsk/hsk-1-ink.png`: cảnh sông mờ sương, núi xa, tre và đình nhỏ phía phải; giấy ngà ấm, mực xanh rêu nhạt, khoảng trống bên trái cho chữ; không có chữ, logo hoặc người.
- `public/theme/hsk/hsk-2-ink.png`: cảnh núi đá vôi, thác nước, thông và đình phía phải; cùng chất giấy và màu mực, địa hình khác HSK 1, khoảng trống bên trái; không có chữ, logo hoặc người.

Prompt set: tranh thủy mặc Trung Hoa dạng banner ngang 3:1, giấy xuyến màu ngà, bút mực xanh rêu và xám nhạt, không khí tĩnh lặng, nhiều khoảng trống, bố cục cảnh về bên phải để đặt nội dung bên trái; biến thể HSK 1 là sông/tre/đình, HSK 2 là núi đá vôi/thác/thông/đình. Hai ảnh xuất ở 2172×724. Các cấp còn lại dùng asset phong cảnh sẵn có khác nhau. Mọi màn hình theo cấp dùng chung ánh xạ `src/lib/hsk-theme.ts`, bao gồm kho admin, thư viện giáo viên, thẻ lớp và chi tiết bài học học sinh.

## Kiểm tra

`npm run portal:test` kiểm tra lặp tuần, đổi/hủy buổi, buổi chuyển vào/ra khoảng xem, ngày nhuận và giao nhau lịch. `npm run portal:verify` cần server đang chạy và một cấp HSK 3–9 chưa sử dụng để tạo dữ liệu kiểm tra cách ly. Script tạo tài khoản/lớp riêng rồi dọn trong `finally`; không sửa lớp thật. Kiểm tra phân quyền, dữ liệu đủ bốn phần, tách kho giáo viên, file nguyên gốc, lưu điểm/báo cáo, lịch trùng đồng thời, đổi riêng từng buổi, đọc lại từ kết nối database mới. Có thể đặt `PORTAL_TEST_URL` để chọn server kiểm tra.

`npm run portal:browser` chạy thêm kiểm tra Chrome cho màn hình giáo viên/học sinh trên desktop và điện thoại, upload file rồi tải lại, mở bài đủ bốn phần trong trang, nộp bài và chấm điểm qua giao diện. Dùng Chrome tại đường dẫn Windows mặc định hoặc đặt `PUPPETEER_EXECUTABLE_PATH`. Ảnh kiểm tra lưu ở thư mục tạm `hsk-portal-ui-qa`, có thể đổi qua `PORTAL_SCREENSHOT_DIR`.

## Khôi phục giao diện giáo viên

`/t/dashboard` dùng lại bố cục cũ: sidebar phong cảnh, tổng quan, thẻ lớp và chi tiết bên dưới, kho câu hỏi 12 dạng, thư viện với giỏ nội dung, báo cáo 5 tab và lịch tháng/tuần/danh sách. Các thao tác ghi đều chờ API thành công; không dùng localStorage làm nguồn lưu dữ liệu.

Chạy lại `npm run portal:setup` để bổ sung `TeacherSavedLesson`, `Question.editorData` và `ClassSchedule.color`. Bản nháp, nội dung riêng đã tuyển chọn, điểm, màu lịch và thông tin hồ sơ lưu ở PostgreSQL. Kho riêng không thay đổi giáo trình admin. Câu hỏi đã sử dụng bị khóa sửa để bảo toàn kết quả.

Báo cáo giao diện cũ gọi `?classic=1`, mặc định lọc ngày mở bài theo múi giờ Việt Nam. Biểu đồ, trạng thái nộp và tăng trưởng lấy từ lượt làm thật; không có số liệu thì hiển thị —. Chưa theo dõi lượt học bài thì không suy diễn phần trăm hoàn thành bài học. Xuất PDF dùng hộp thoại in của trình duyệt với bộ lọc hiện tại. QR dẫn đến bài giao thực và vẫn kiểm tra quyền học sinh.

`npm run portal:browser` chạy `scripts/teacher-classic-browser.cjs`, kiểm tra bằng Chrome với tài khoản và lớp cách ly, sau đó dọn dữ liệu kiểm tra. Phủ lưu nháp/sửa/tải lại câu hỏi, metadata 12 dạng, giỏ học liệu riêng/công bố đầy đủ nội dung, báo cáo thật, lịch, học sinh nộp bài và giáo viên chấm điểm.
