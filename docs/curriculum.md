# Kho giáo trình dùng chung

Admin → Kho giáo trình HSK. Chọn HSK 1–9, tạo bài, sửa rồi bấm **Hoàn tất & Cập nhật bài học**. Tạo bài, lưu bài, xóa bài và xóa cấp HSK đều ghi ngay vào PostgreSQL; chỉ báo thành công khi server xác nhận. Sau F5 giữ nguyên cấp và tab đang chọn.

## Nhập từng phần

Chọn **Nhập file & tải mẫu** hoặc thẻ Bài học / Từ vựng / Ngữ pháp / Hội thoại / Phát âm / Văn hóa. Trong editor cũng có **Nhập file phần này & tải mẫu**, giới hạn vào bài đang sửa.

- Mỗi loại có mẫu CSV UTF-8 để mở bằng Excel và JSON. Tải mẫu, điền dữ liệu, chọn file, xem trước rồi xác nhận lưu. File tối đa 8 MB.
- Bài học: `number,titleZh,titleVi,pinyin,desc,durationMin`. JSON có thể chứa đầy đủ `vocabList`, `grammarList`, `dialogue`, `phonetics`, `culture`.
- Từ vựng: `lessonNumber,hanzi,pinyin,meaning,type,exampleZh,examplePy,exampleVi`.
- Ngữ pháp: `lessonNumber,title,structure,example,explanation`.
- Hội thoại: `lessonNumber,speaker,zh,pinyin,vi` — mỗi dòng là một lượt thoại.
- Phát âm: `lessonNumber,title,rule,examples`; trong CSV, phân cách ví dụ bằng `|`.
- Văn hóa: `lessonNumber,culture`.

Mặc định **Thêm và cập nhật**: bài được đối chiếu theo số bài; từ vựng theo chữ + pinyin; ngữ pháp theo tiêu đề + cấu trúc; hội thoại theo người nói + câu Trung. Các phần không có trong file được giữ nguyên. **Thay thế phần đã chọn** chỉ thay phần đó trong các bài có trong file; thay toàn cấp chỉ khi chọn loại Bài học và phạm vi toàn cấp. File sai cấp, sai số bài, thiếu trường hoặc trùng số bài bị từ chối trước khi lưu.

**Xuất bản sao JSON** tải bản đầy đủ của cấp đang chọn. Xóa toàn cấp giữ trạng thái đã xóa và không tự nạp lại bài mặc định. **Tạo kho HSK** tạo lại một kho rỗng. Các bản học liệu đã giao cho lớp được giữ riêng, cùng lịch sử học tập.

## Lưu trữ và triển khai

`CurriculumContent` là nguồn dữ liệu chuẩn: một hàng mỗi cấp HSK, toàn bộ cấu trúc bài trong JSONB, revision và trạng thái xóa. Không còn dùng file runtime hoặc localStorage làm kho giáo trình. Khi cấp chưa từng biên tập, HSK 1/2 đọc bộ mặc định, các cấp khác chưa được tạo. Bản rỗng đã lưu luôn có ưu tiên so với mặc định.

```powershell
npm install
npx prisma generate
npm run curriculum:setup
npm run curriculum:test
```

Setup chỉ tạo bảng bổ sung, không sửa hoặc xóa bảng bài học/lịch sử hiện có. Nếu có `data/curriculum/hsk_level_N.json` từ bản cũ, setup kiểm tra rồi nhập nguyên nội dung (kể cả danh sách rỗng), chỉ khi cấp đó chưa tồn tại trong database. Chạy lại không ghi đè bản đã lưu.

- `GET/POST /api/v1/admin/curriculum`: yêu cầu cookie đăng nhập có chữ ký, ADMIN đang hoạt động; POST kiểm tra Origin, dữ liệu và revision. Xung đột sửa trả 409; lỗi database trả 503, không giả báo thành công. Mọi thay đổi có AuditLog.
- `GET /api/v1/curriculum?level=N` hoặc không truyền level để đọc danh mục dùng chung. Không cache. Các workspace học sinh, quản lý lớp giáo viên và API phân phối bài học dùng nguồn này; không gộp lại bài mặc định đã xóa.
- Số bài từ 1 đến 9999 (không còn giới hạn 15); mỗi cấp tối đa 500 bài mỗi lần lưu.

Sau khi server chạy, `npm run curriculum:verify` kiểm tra trên cấp HSK 3–9 chưa được tạo bằng tài khoản/bài thử riêng rồi dọn trong `finally`. Kiểm tra quyền admin, CSRF, lưu bền vững, bản rỗng, xóa/tạo lại cấp, xung đột đồng thời, giao bài số 17 và giữ bản học liệu của lớp sau khi xóa nguồn. Có thể đặt `CURRICULUM_TEST_URL` để dùng server kiểm thử khác.
