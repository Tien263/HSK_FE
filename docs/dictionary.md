# Từ điển nội bộ

Node.js/Next.js 16, Prisma 6, PostgreSQL. Tra cứu và nét viết chỉ gọi endpoint nội bộ.

Dịch câu là chức năng online riêng: frontend gọi `/api/dictionary/translate`, server gọi Groq bằng khóa riêng. Từ đơn và nét viết tiếp tục dùng dữ liệu nội bộ.

## Thiết lập và nạp dữ liệu

```powershell
npm install
npm run dictionary:setup
npm run dictionary:download
npm run dictionary:import
npm run dictionary:vi
```

Hoặc dùng file ZIP có sẵn:

```powershell
npm run dictionary:import -- --cedict "path/to/cedict.zip" --unihan "path/to/Unihan.zip"
```

Script giữ nguyên các từ khác cách đọc/phồn thể, ghép âm Hán Việt theo từng chữ phồn thể, giữ cả âm đọc thay thế. Nạp lại bỏ qua các mục đã có, không ghi đè nghĩa Việt do admin sửa. Kho từ vựng bài học cung cấp nghĩa Việt ban đầu và đưa vào hàng chờ duyệt.

`dictionary:vi` nạp nghĩa Việt CVDICT từ gói YomiLens `cedict-vi.zip`, snapshot `86cc70dfa4aa83284771051da9c598c8efbd3c4a` (CC BY-SA 4.0, Phong Phan). SHA-256: `22729304b414d21b162abd3df2c4fec30ffcb750f66cd1ea0bfffc3353671f0e`. Có `--dry-run` để kiểm tra trước khi ghi.

Ghép nguyên tập chữ giản/phồn thể và cách đọc; chuẩn hóa thanh nhẹ 5. Chỉ bỏ khác biệt viết hoa khi cả nguồn và đích không có mục trùng cách đọc sau chuẩn hóa; chỉ nhận biến thể phát âm khi cả hai kho có duy nhất một mục cho tập chữ đó. Không ghép riêng theo giản thể (tránh nhầm 后 hoàng hậu với 後/后 phía sau). Không ghi đè bất kỳ nghĩa Việt nào đã có; các mục mới đặt GENERATED để admin duyệt. Báo cáo và checksum nằm trong `data/dictionary/vietnamese-import-report.json`.

## Bổ sung nghĩa Việt một lần, có lưu tiến độ

Tác vụ chuẩn bị dữ liệu sử dụng dịch vụ AI một lần, độc lập với dịch câu lúc tra cứu. Cấu hình `GROQ_API_KEY` có sẵn trên server, hoặc `DICTIONARY_TRANSLATION_API_KEY` cho endpoint tương thích được chỉ định bằng `--base-url`. Không đưa khóa vào frontend.

```powershell
npm run dictionary:translate -- --limit 1000
# Dịch toàn bộ mục còn thiếu; chú ý quota và chi phí dịch vụ:
npm run dictionary:translate -- --limit 0
# Mô hình khác trên cùng tài khoản Groq, nếu có quota phù hợp:
npm run dictionary:translate -- --limit 0 --batch 40 --model openai/gpt-oss-120b --reasoning-effort low
```

Mặc định dùng `qwen/qwen3.8-27b` qua Groq; có thể chọn `--model`. Script chỉ điền mục MISSING và mảng nghĩa Việt trống. Checkpoint `data/dictionary/translations-vi.jsonl` và báo cáo lưu trong thư mục bị Git bỏ qua. Nếu hết quota, chạy lại để tiếp tục. Không tự đổi nhà cung cấp hay mô hình.

Nạp bản dịch JSONL có sẵn bằng `--translations path/to/translations.jsonl`. Mỗi dòng gồm `traditional`, `simplified`, `pinyinNumbered`, `definitionsVi`, `source`.

## Endpoint và quản trị

- `GET /api/dictionary/search?q=学习`: tối đa 50 mục; hỗ trợ giản/phồn thể, pinyin và nghĩa Việt không dấu. `hasMore` báo cần thu hẹp từ khóa. `ids=1,2` dùng cho từ đã lưu/lịch sử (tối đa 100).
- `GET /api/dictionary/strokes/学`: dữ liệu JSON từ gói npm nội bộ, không tải CDN lúc chạy.
- `/admin/dictionary`: lọc MISSING/GENERATED/REVIEWED, sửa từng nghĩa theo dòng, lưu nháp/duyệt.
- `GET/PATCH /api/admin/dictionary`: chỉ chấp nhận phiên đăng nhập có chữ ký và tài khoản ADMIN đang ACTIVE; không tin `x-user-id` hoặc role do frontend gửi. Khi chỉ còn thông tin tài khoản trong localStorage, trang hiển thị form xác thực lại tại chỗ. Cookie theo giao thức HTTP/HTTPS thực tế, kể cả reverse proxy. Khóa ký ưu tiên `DICTIONARY_SESSION_SECRET`, rồi `NEXTAUTH_SECRET`; nếu môi trường chỉ cấu hình database thì dùng khóa dẫn xuất từ thông tin kết nối server để không âm thầm bỏ tạo phiên.
- `GET /api/v1/auth/session`: kiểm tra phiên thật và làm mới cookie còn hạn; không lấy role từ localStorage. Đăng nhập nhanh ở trang chủ cũng gọi API đăng nhập để tạo phiên thật.
- `POST /api/dictionary/translate`: JSON `{ "text": "我今天想去图书馆。", "targetLanguage": "vi" }`; `targetLanguage` có thể bỏ qua để chọn hướng dịch theo chữ Hán. Chỉ tài khoản đăng nhập được dùng, tối đa 500 ký tự. Kiểm tra Origin, giới hạn 8 câu mới/phút/tài khoản trong mỗi server process; cache không tính lượt mới. Model cấu hình bằng `DICTIONARY_SENTENCE_MODEL`, mặc định `qwen/qwen3.8-27b`. Khóa `GROQ_API_KEY` chỉ ở server.
- Bản dịch câu lưu riêng trong `DictionarySentenceTranslation` theo hash nội dung/hướng dịch; không gắn user và không tự thêm vào mục từ được duyệt. API trả bản dịch và pinyin, không trả model hay trạng thái duyệt. `dictionary:setup` tự bổ sung bảng cache cho database đã có từ điển.
- Từ điển nhận diện câu dài/dấu câu và mở chế độ Dịch câu. Chỉ gọi AI sau khi nhấn Enter hoặc nút Dịch câu, không gọi theo từng phím. Tra từ vẫn có thể chọn thủ công cho tên riêng dài.
- Các câu ngắn như 我爱你 cũng vào Dịch câu. Giao diện giấy ngà/xanh mực dùng cùng ảnh `dashboard/banner-bg.webp` với dashboard. Trên desktop, nghĩa và nét viết đặt cạnh nhau; trên điện thoại xếp dọc. Bấm từ trong câu để tra riêng, có nút quay về bản dịch vừa xem. Ô nét viết chọn từng chữ, phát thứ tự nét hoặc tập viết bằng chuột/cảm ứng.
- Mỗi lần sửa kiểm tra revision, tăng revision và ghi AuditLog. Phiên bản cũ nhận HTTP 409, không ghi đè thay đổi mới.
- API học sinh dùng danh sách trường cho phép, không trả trạng thái duyệt, revision, nguồn sinh hoặc ghi chú quản trị. Nghĩa Việt đã sinh vẫn hiển thị bình thường theo yêu cầu.

Chạy `npm run dictionary:test` để kiểm tra parser, ghép nghĩa Việt và phiên đăng nhập. SQL bổ sung nằm tại `prisma/sql/dictionary-schema.sql`; tạo bốn bảng từ điển và cache dịch câu, không sửa bảng bài học.

Khi dev server đang chạy ở `http://localhost:3000`, chạy `npm run dictionary:verify` để kiểm tra đăng nhập, phân quyền, duyệt/sửa, xung đột phiên bản, audit log và các endpoint. Bài kiểm tra tạo tài khoản/mục từ thử riêng rồi xóa trong `finally`.

## Nguồn và triển khai

CC-CEDICT: https://www.mdbg.net/chinese/dictionary?page=cc-cedict (CC BY-SA 4.0). Unihan: https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip (Unicode License). Thông tin ghi công tại `/dictionary/sources`.

`next.config.ts` đưa `hanzi-writer-data/*.json` vào output file tracing. Giữ gói npm này trong dependencies production. Database nạp trên máy này và máy triển khai phải là cùng database hoặc phải chạy các lệnh nạp ở môi trường triển khai.

Tác vụ dịch nghĩa còn thiếu có `--min-id`, `--max-id`, `--checkpoint` để chia khoảng và lưu tiến độ riêng khi chạy nhiều worker. Chỉ ghi mục còn MISSING và rỗng nên không ghi đè admin hay worker khác. Các model/worker dùng quota của tài khoản Groq đã cấu hình; script không nâng quota hay mua thêm dịch vụ.
