# Kho giáo trình dùng chung

Admin → Kho giáo trình HSK. Chọn HSK 1–9 và dùng **Lưu & Xuất bản kho chung** để ghi các thay đổi đang soạn vào PostgreSQL. Nhập JSON và khôi phục từ lịch sử lưu ngay khi máy chủ xác nhận.

## Nhập từng phần

**Nhập bài học (.JSON)** mở màn hình xem trước. Chế độ gộp giữ các bài không có trong file và các trường hiện có mà file bỏ qua. Muốn thay toàn bộ cấp, chọn **Ghi đè** và xác nhận số bài sẽ bị bỏ. **Nhập câu hỏi (.JSON)** bổ sung câu hỏi theo số bài. Mã bài hoặc cấp ghi trong file phải khớp cấp đang mở.

**Xuất giáo trình (.JSON)** tải danh sách đang mở. **Lịch sử hoàn tác** cho phép tải JSON hoặc ghi lại một bản sao trước lần lưu. Bản nháp và lịch sử của phiên bản cũ, nếu trình duyệt còn giữ, xuất hiện trong cùng cửa sổ. Nhật ký cũ chỉ có số lượng bài thì không tạo được bản khôi phục.

## Lưu trữ và triển khai

`CurriculumContent` là kho chung. Mỗi cấp HSK có một hàng chứa bài học trong JSONB, số phiên bản và trạng thái xóa. Cấp chưa có dữ liệu hiển thị rỗng. Kho admin đọc dữ liệu từ máy chủ và chỉ mở bản trình duyệt cũ khi người dùng chọn trong lịch sử.

```powershell
npm install
npx prisma generate
npm run curriculum:setup
npm run curriculum:test
```

Setup chỉ tạo bảng bổ sung, không sửa hoặc xóa bảng bài học/lịch sử hiện có. Nếu có `data/curriculum/hsk_level_N.json` từ bản cũ, setup kiểm tra rồi nhập nguyên nội dung (kể cả danh sách rỗng), chỉ khi cấp đó chưa tồn tại trong database. Chạy lại không ghi đè bản đã lưu.

- `GET/POST /api/v1/admin/curriculum`: yêu cầu cookie đăng nhập có chữ ký của ADMIN hoặc TEACHER đang hoạt động. POST kiểm tra Origin, dữ liệu và phiên bản đang sửa. Xung đột trả 409. Mỗi lần ghi đè một cấp đã tồn tại, nội dung trước lần ghi được lưu trong `AuditLog` cùng giao dịch với bản mới. Nếu tài khoản ghi nhật ký bị xóa, ràng buộc hiện tại của `AuditLog` cũng xóa các bản sao thuộc tài khoản đó.
- `GET /api/v1/curriculum?level=N` hoặc không truyền level để đọc danh mục dùng chung. Không cache. Các workspace học sinh, quản lý lớp giáo viên và API phân phối bài học dùng nguồn này; không gộp lại bài mặc định đã xóa.
- Số bài từ 1 đến 9999 (không còn giới hạn 15); mỗi cấp tối đa 500 bài mỗi lần lưu.

Sau khi server chạy, `npm run curriculum:verify` kiểm tra trên cấp HSK 3–9 chưa được tạo bằng tài khoản/bài thử riêng rồi dọn trong `finally`. Kiểm tra quyền admin, CSRF, lưu bền vững, bản rỗng, xóa/tạo lại cấp, xung đột đồng thời, giao bài số 17 và giữ bản học liệu của lớp sau khi xóa nguồn. Có thể đặt `CURRICULUM_TEST_URL` để dùng server kiểm thử khác.
