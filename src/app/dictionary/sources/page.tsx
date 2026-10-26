import Link from "next/link";

export default function DictionarySourcesPage() {
  return <main className="min-h-screen bg-[#fafbf5] px-6 py-12 text-[#304b39]"><div className="mx-auto max-w-2xl space-y-6">
    <Link href="/" className="text-sm underline">← Về trang chủ</Link>
    <h1 className="text-3xl font-bold">Nguồn dữ liệu từ điển</h1>
    <p>Tra từ và nét viết dùng dữ liệu lưu trên hệ thống. Chức năng Dịch câu gọi AI qua máy chủ và lưu bản dịch để dùng lại.</p>
    <ul className="space-y-4 text-sm leading-7">
      <li><a href="https://www.mdbg.net/chinese/dictionary?page=cc-cedict" className="underline">CC-CEDICT — MDBG và cộng đồng</a>: mục từ, giản/phồn thể, pinyin và nghĩa Anh. Giấy phép <a href="https://creativecommons.org/licenses/by-sa/4.0/" className="underline">CC BY-SA 4.0</a>. Nghĩa Việt dịch từ CC-CEDICT là nội dung phái sinh theo cùng giấy phép.</li>
      <li><a href="https://github.com/MarshNg/yomilens-dictionaries/tree/86cc70dfa4aa83284771051da9c598c8efbd3c4a" className="underline">CVDICT — Phong Phan, bản phân phối YomiLens</a>: nghĩa tiếng Việt dịch từ CC-CEDICT, có hiệu đính một phần. Giấy phép CC BY-SA 4.0. Dữ liệu được chuyển đổi và ghép theo chữ giản/phồn thể cùng cách đọc; có thể còn lỗi và được biên tập thêm bởi quản trị viên.</li>
      <li><a href="https://www.unicode.org/reports/tr38/" className="underline">Unicode Unihan</a>: trường kVietnamese cung cấp âm Hán Việt của từng chữ. <a href="https://www.unicode.org/license.txt" className="underline">Unicode License</a>.</li>
      <li><a href="https://hanziwriter.org/" className="underline">Hanzi Writer</a> (MIT) và <a href="https://github.com/chanind/hanzi-writer-data" className="underline">hanzi-writer-data</a>: dữ liệu nét viết có nguồn từ Make Me a Hanzi và phông Arphic; giấy phép Arphic Public License kèm gói dữ liệu.</li>
    </ul>
  </div></main>;
}
