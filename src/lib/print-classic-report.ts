"use client";
export function printClassicReport(){
 const source=document.querySelector("[data-classic-report]");if(!source)throw new Error("Chưa có báo cáo để in.");const printWindow=window.open("","_blank");if(!printWindow)throw new Error("Trình duyệt đã chặn cửa sổ in. Hãy cho phép popup cho website.");
 const doc=printWindow.document;doc.title="Báo cáo học tập Hanyu";doc.documentElement.lang="vi";
 document.querySelectorAll('link[rel="stylesheet"],style').forEach(style=>doc.head.appendChild(style.cloneNode(true)));
 const printStyle=doc.createElement("style");printStyle.textContent="body{padding:24px;background:#fffdf7;color:#204434}button{display:none!important}table{width:100%;border-collapse:collapse}svg{max-width:100%}@page{size:A4 landscape;margin:12mm}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:0}.fixed{display:none!important}section,table{break-inside:auto}tr{break-inside:avoid}}";doc.head.appendChild(printStyle);
 const clone=source.cloneNode(true) as HTMLElement;clone.querySelectorAll('.fixed,[role="dialog"]').forEach(node=>node.remove());doc.body.appendChild(clone);setTimeout(()=>{printWindow.focus();printWindow.print();},500);
}
