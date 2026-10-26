import QRCode from "qrcode";
import React, { useEffect,useState } from "react";
import { X, QrCode, Copy, Check, ExternalLink } from "lucide-react";

interface LiveExamQrModalProps {
  assignment: { id: string; title: string; className?: string } | null;
  onClose: () => void;
}

export default function LiveExamQrModal({
  assignment,
  onClose,
}: LiveExamQrModalProps) {
  const [copied, setCopied] = useState(false);

  const [qr,setQr]=useState("");
  const examUrl=typeof window!=="undefined"&&assignment?window.location.origin+"/s/assignments/"+assignment.id:"";
  useEffect(()=>{let active=true;if(examUrl)QRCode.toDataURL(examUrl,{width:220,margin:1,color:{dark:"#204434",light:"#ffffff"}}).then(image=>{if(active)setQr(image);});return()=>{active=false;};},[examUrl]);
  if (!assignment) return null;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(examUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#204434] text-white flex items-center justify-center mx-auto shadow-xs">
          <QrCode className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="font-serif font-bold text-lg text-[#204434]">Phòng thi trực tuyến</h3>
          <p className="text-xs text-[#315E48]/80">{assignment.title}</p>
          {assignment.className && (
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F3EFE6] text-[#204434] text-[11px] font-medium">
              {assignment.className}
            </span>
          )}
        </div>

        {/* QR Code Graphic Placeholder */}
        <div className="p-4 bg-white rounded-2xl border border-[#E5DEC9] inline-block shadow-inner">
          <div className="h-44 w-44">{qr?<img src={qr} width={176} height={176} alt="Mã QR mở bài tập được giao"/>:<span className="text-xs">Đang tạo mã QR…</span>}</div>
        </div>

        {/* Copy Link */}
        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#204434] hover:bg-[#163024] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Đã sao chép liên kết!" : "Sao chép link làm bài"}
          </button>
        </div>
      </div>
    </div>
  );
}
