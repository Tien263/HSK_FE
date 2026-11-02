"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Search,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  RefreshCw,
  Share2,
  ShieldCheck,
  FileCode,
} from "lucide-react";

interface SitemapItem {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

interface SeoFormData {
  siteName: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
  googleVerificationCode: string;
  allowIndexing: boolean;
  sitemapUrls: SitemapItem[];
}

export default function AdminSeoSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState<SeoFormData>({
    siteName: "Hanyu - NinjiStudy",
    title: "NinjiStudy · Học Tiếng Trung & Luyện Thi HSK 3.0 Chuẩn Quốc Tế",
    description:
      "Nền tảng học tiếng Trung và luyện thi HSK 1-6 chuẩn mới 3.0. Hệ thống lộ trình tự học, từ vựng thông minh, tra cứu chiết tự chữ Hán và luyện thi trực tuyến.",
    keywords:
      "ninjistudy, ninjistudy.click, học tiếng trung, luyện thi hsk, hsk 3.0, từ vựng hsk, ngữ pháp tiếng trung, chiết tự hán tự",
    canonicalUrl: "https://ninjistudy.click",
    ogImage: "https://ninjistudy.click/theme/bg-auth-master.jpg",
    googleVerificationCode: "",
    allowIndexing: true,
    sitemapUrls: [
      { path: "/", changeFrequency: "daily", priority: 1.0 },
      { path: "/login", changeFrequency: "monthly", priority: 0.8 },
      { path: "/register", changeFrequency: "monthly", priority: 0.8 },
      { path: "/onboarding", changeFrequency: "monthly", priority: 0.7 },
    ],
  });

  const [newPath, setNewPath] = useState("");
  const [newFreq, setNewFreq] = useState<SitemapItem["changeFrequency"]>("monthly");
  const [newPriority, setNewPriority] = useState<number>(0.8);

  useEffect(() => {
    fetchSeoConfig();
  }, []);

  const fetchSeoConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/seo");
      const data = await res.json();
      if (data.success && data.config) {
        setFormData({
          siteName: data.config.siteName || "",
          title: data.config.title || "",
          description: data.config.description || "",
          keywords: data.config.keywords || "",
          canonicalUrl: data.config.canonicalUrl || "https://ninjistudy.click",
          ogImage: data.config.ogImage || "",
          googleVerificationCode: data.config.googleVerificationCode || "",
          allowIndexing: data.config.allowIndexing !== false,
          sitemapUrls: Array.isArray(data.config.sitemapUrls) ? data.config.sitemapUrls : [],
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Không thể tải cấu hình SEO. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch("/api/v1/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Đã lưu và cập nhật toàn bộ cấu hình SEO & Sitemap thành công!" });
        if (data.config) {
          setFormData(data.config);
        }
      } else {
        setMessage({ type: "error", text: data.message || "Lỗi khi lưu cấu hình SEO." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Không thể kết nối đến máy chủ để lưu cấu hình." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSitemapUrl = () => {
    if (!newPath.trim()) return;
    const cleanPath = newPath.trim().startsWith("/") ? newPath.trim() : `/${newPath.trim()}`;
    if (formData.sitemapUrls.some((u) => u.path === cleanPath)) {
      alert("Đường dẫn này đã có trong danh sách Sitemap!");
      return;
    }
    setFormData({
      ...formData,
      sitemapUrls: [
        ...formData.sitemapUrls,
        { path: cleanPath, changeFrequency: newFreq, priority: newPriority },
      ],
    });
    setNewPath("");
  };

  const handleRemoveSitemapUrl = (index: number) => {
    setFormData({
      ...formData,
      sitemapUrls: formData.sitemapUrls.filter((_, idx) => idx !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#204434]">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#315E48]" />
        <p className="text-sm font-medium">Đang tải thông tin SEO & Sitemap...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Tiêu đề & Giới thiệu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#BC9B6B]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#204434]" />
            <h2 className="text-xl font-bold text-[#204434]">Quản lý SEO, Google & Sitemap</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#204434]/10 text-[#204434]">
              {formData.canonicalUrl}
            </span>
          </div>
          <p className="text-xs text-[#315E48]/80 mt-1">
            Tùy biến tiêu đề tìm kiếm, mô tả chuẩn Google, từ khóa SEO, mã xác minh Google Search Console và sơ đồ trang web động.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`${formData.canonicalUrl}/sitemap.xml`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#204434]/30 bg-white hover:bg-[#FAF7EE] text-xs font-medium text-[#204434] transition shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Mở sitemap.xml</span>
            <ExternalLink className="w-3 h-3 text-[#315E48]/60" />
          </a>

          <a
            href={`${formData.canonicalUrl}/robots.txt`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#204434]/30 bg-white hover:bg-[#FAF7EE] text-xs font-medium text-[#204434] transition shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mở robots.txt</span>
            <ExternalLink className="w-3 h-3 text-[#315E48]/60" />
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-md shadow-[#204434]/20 transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Đang lưu..." : "Lưu cấu hình"}</span>
          </button>
        </div>
      </div>

      {/* Thông báo kết quả */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-medium animate-fadeIn ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Box 1: Xem trước kết quả Google Tìm kiếm (SERP Preview) */}
      <div className="bg-[#FAF7EE] border border-[#BC9B6B]/30 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#204434]">
            <Eye className="w-4 h-4 text-[#315E48]" />
            <span>Xem trước kết quả hiển thị trên Google (SERP Preview)</span>
          </div>
          <span className="text-[11px] text-[#315E48]/70">Xem trước trực quan thời gian thực</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 max-w-2xl shadow-xs">
          <div className="flex items-center gap-2 text-xs text-gray-700 mb-1">
            <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
              N
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[12px] text-gray-900 font-medium">{formData.siteName || "NinjiStudy"}</span>
              <span className="text-[10px] text-gray-500">{formData.canonicalUrl}</span>
            </div>
          </div>
          <h3 className="text-blue-800 hover:underline text-base font-medium leading-snug cursor-pointer line-clamp-1 mb-1">
            {formData.title || "Tiêu đề trang web..."}
          </h3>
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
            {formData.description || "Đoạn mô tả ngắn gọn về website sẽ hiển thị tại đây khi người dùng tìm kiếm trên Google..."}
          </p>
        </div>
      </div>

      {/* Grid: 2 Cột cấu hình */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CỘT 1: Cấu hình Thẻ Meta Cơ Bản */}
        <div className="bg-white rounded-2xl border border-[#BC9B6B]/20 p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#204434] flex items-center gap-2 border-b border-[#BC9B6B]/15 pb-2">
            <Search className="w-4 h-4 text-[#315E48]" />
            <span>Thông tin Tìm kiếm (Google Meta Tags)</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#204434] mb-1">
              Tên thương hiệu / Trang web
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              placeholder="VD: Hanyu - NinjiStudy"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] focus:ring-1 focus:ring-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#204434]">Tiêu đề trang (Meta Title)</label>
              <span className={`text-[10px] ${formData.title.length > 60 ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                {formData.title.length}/60 ký tự
              </span>
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: NinjiStudy · Học Tiếng Trung & Luyện Thi HSK 3.0"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] focus:ring-1 focus:ring-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#204434]">Mô tả tìm kiếm (Meta Description)</label>
              <span className={`text-[10px] ${formData.description.length > 160 ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                {formData.description.length}/160 ký tự
              </span>
            </div>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả tóm tắt nội dung khóa học, nền tảng..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] focus:ring-1 focus:ring-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#204434] mb-1">
              Từ khóa tìm kiếm (Keywords, cách nhau bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="học tiếng trung, luyện thi hsk, ninjistudy..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] focus:ring-1 focus:ring-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#204434] mb-1">
              Tên miền chính thức (Canonical URL)
            </label>
            <input
              type="text"
              value={formData.canonicalUrl}
              onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
              placeholder="https://ninjistudy.click"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] focus:ring-1 focus:ring-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50"
            />
          </div>
        </div>

        {/* CỘT 2: Xác minh Google & Mạng xã hội */}
        <div className="bg-white rounded-2xl border border-[#BC9B6B]/20 p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#204434] flex items-center gap-2 border-b border-[#BC9B6B]/15 pb-2">
            <Share2 className="w-4 h-4 text-[#315E48]" />
            <span>Xác minh Google & Mạng xã hội (Social Meta)</span>
          </h3>

          {/* Google Search Console verification */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Mã xác minh Google Search Console</span>
              </label>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
              >
                Mở GSC <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-[#315E48]/80 leading-relaxed">
              Dán mã xác minh thẻ HTML từ Google Search Console (hoặc dán nguyên thẻ{" "}
              <code>&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;</code>, hệ thống sẽ tự tách lấy mã).
            </p>
            <input
              type="text"
              value={formData.googleVerificationCode}
              onChange={(e) => setFormData({ ...formData, googleVerificationCode: e.target.value })}
              placeholder="VD: wX9sK_j2..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:border-[#204434] outline-none text-[#204434] bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#204434] mb-1">
              Ảnh xem trước khi chia sẻ mạng xã hội (OpenGraph Image URL)
            </label>
            <input
              type="text"
              value={formData.ogImage}
              onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
              placeholder="https://ninjistudy.click/theme/bg-auth-master.jpg"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#BC9B6B]/30 focus:border-[#204434] focus:ring-1 focus:ring-[#204434] outline-none text-[#204434] bg-[#FAF7EE]/50"
            />
          </div>

          {/* Công tắc Bọ tìm kiếm */}
          <div className="border border-[#BC9B6B]/25 rounded-xl p-3.5 flex items-center justify-between bg-[#FAF7EE]/40">
            <div>
              <p className="text-xs font-bold text-[#204434]">Cho phép Bọ tìm kiếm lập chỉ mục (Robots Index)</p>
              <p className="text-[11px] text-[#315E48]/80">
                {formData.allowIndexing
                  ? "Đang bật: Googlebot được phép khám phá và lập chỉ mục website."
                  : "Đang tắt: Yêu cầu Google KHÔNG hiển thị website trên kết quả tìm kiếm (Noindex)."}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowIndexing}
                onChange={(e) => setFormData({ ...formData, allowIndexing: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#204434]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Box 3: Quản lý Danh sách Sitemap URLs */}
      <div className="bg-white rounded-2xl border border-[#BC9B6B]/20 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#BC9B6B]/15 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#204434] flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#315E48]" />
              <span>Cấu trúc Sơ đồ trang web (Sitemap URLs)</span>
            </h3>
            <p className="text-[11px] text-[#315E48]/80 mt-0.5">
              Các trang được khai báo tự động xuất hiện trong file <code>/sitemap.xml</code> cho Googlebot thu thập dữ liệu.
            </p>
          </div>

          <span className="text-xs font-semibold text-[#204434] bg-[#204434]/5 px-2.5 py-1 rounded-lg">
            Tổng cộng: {formData.sitemapUrls.length} đường dẫn
          </span>
        </div>

        {/* Bảng danh sách URL */}
        <div className="overflow-x-auto border border-[#BC9B6B]/20 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7EE] text-[#204434] font-semibold border-b border-[#BC9B6B]/20">
              <tr>
                <th className="py-2.5 px-3">Đường dẫn (Path)</th>
                <th className="py-2.5 px-3">Tần suất thay đổi</th>
                <th className="py-2.5 px-3">Độ ưu tiên</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BC9B6B]/15 text-[#204434]">
              {formData.sitemapUrls.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FAF7EE]/40 transition">
                  <td className="py-2.5 px-3 font-mono font-medium text-xs">
                    {item.path}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                      {item.changeFrequency}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#315E48]">
                    {item.priority}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveSitemapUrl(idx)}
                      className="p-1 rounded-md text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Xóa khỏi Sitemap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Khối thêm đường dẫn mới */}
        <div className="bg-[#FAF7EE]/60 border border-dashed border-[#BC9B6B]/40 rounded-xl p-3 flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              placeholder="VD: /s/roadmap hoặc /s/mock-exam"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#BC9B6B]/30 focus:border-[#204434] outline-none text-[#204434] bg-white font-mono"
            />
          </div>

          <div className="w-full md:w-36">
            <select
              value={newFreq}
              onChange={(e) => setNewFreq(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#BC9B6B]/30 focus:border-[#204434] outline-none text-[#204434] bg-white"
            >
              <option value="daily">daily (hàng ngày)</option>
              <option value="weekly">weekly (hàng tuần)</option>
              <option value="monthly">monthly (hàng tháng)</option>
              <option value="yearly">yearly (hàng năm)</option>
            </select>
          </div>

          <div className="w-full md:w-28">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(parseFloat(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#BC9B6B]/30 focus:border-[#204434] outline-none text-[#204434] bg-white font-semibold"
            >
              <option value="1.0">1.0 (Cao nhất)</option>
              <option value="0.9">0.9</option>
              <option value="0.8">0.8 (Chuẩn)</option>
              <option value="0.7">0.7</option>
              <option value="0.6">0.6</option>
              <option value="0.5">0.5</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddSitemapUrl}
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#315E48] hover:bg-[#204434] text-white text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm vào Sitemap</span>
          </button>
        </div>
      </div>
    </div>
  );
}
