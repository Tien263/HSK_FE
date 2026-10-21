import React from "react";

/**
 * 1. PANORAMIC LESSON HERO BANNER SVG
 * Tự vẽ hoàn toàn bằng Vector SVG thuần chất nghệ thuật thủy mặc Trung Hoa:
 * - Khung cảnh sơn thủy mờ sương, mặt hồ tĩnh lặng, thuyền nan nhỏ
 * - Góc lầu đình cổ bên cành đào/mai khoe sắc, bóng người ngồi đọc sách
 * - Ánh bình minh dịu nhẹ, dấu mộc son đỏ "生活如诗" (Đời đẹp như thơ)
 */
export function LessonHeroBannerSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full object-cover pointer-events-none select-none ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Nền giấy xuyến chỉ ngà cổ điển */}
        <linearGradient id="paperBg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F4EDE0" />
          <stop offset="35%" stopColor="#FAF5EC" />
          <stop offset="70%" stopColor="#F7F1E5" />
          <stop offset="100%" stopColor="#EDE3D2" />
        </linearGradient>

        {/* Lớp sương mù mặt hồ */}
        <linearGradient id="mistLake" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#F6F0E4" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FBF7EF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FAF5EC" stopOpacity="0" />
        </linearGradient>

        {/* Mặt trời hồng đào dịu ấm */}
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E9927A" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#E6A088" stopOpacity="0.4" />
          <stop offset="80%" stopColor="#FAF5EC" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FAF5EC" stopOpacity="0" />
        </radialGradient>

        {/* Núi xa viễn cảnh mực loang */}
        <linearGradient id="farMountain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8A9D92" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#ABC0B4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F4EDE0" stopOpacity="0" />
        </linearGradient>

        {/* Núi trung cảnh xanh rêu trầm */}
        <linearGradient id="midMountain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A6E5D" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#6C8D7E" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F4EDE0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Nền giấy xuyến cổ */}
      <rect width="1200" height="240" fill="url(#paperBg)" />

      {/* 2. Mặt trời sương sớm */}
      <circle cx="740" cy="115" r="42" fill="url(#sunGlow)" />
      <circle cx="740" cy="115" r="26" fill="#DE7D64" fillOpacity="0.45" />

      {/* 3. Dãy núi xa viễn sơn */}
      <path
        d="M520 160 Q 600 70 690 120 Q 760 60 850 130 Q 930 80 1020 145 L 1020 240 L 520 240 Z"
        fill="url(#farMountain)"
      />
      <path
        d="M750 155 Q 830 85 910 125 Q 980 75 1080 135 L 1200 150 L 1200 240 L 750 240 Z"
        fill="url(#midMountain)"
      />

      {/* 4. Thuyền nan cô độc giữa làn sương (Góc phải) */}
      <g transform="translate(710, 155) scale(0.65)" opacity="0.65">
        {/* Thân thuyền */}
        <path d="M 0 10 Q 25 15 50 10 Q 55 12 50 14 Q 25 16 0 14 Z" fill="#243C32" />
        {/* Người chèo thuyền */}
        <circle cx="28" cy="4" r="2.5" fill="#243C32" />
        <path d="M 27 6.5 L 29 11 L 25 11 Z" fill="#243C32" />
        {/* Mái chèo */}
        <line x1="26" y1="8" x2="36" y2="17" stroke="#243C32" strokeWidth="0.8" />
        {/* Bóng nước */}
        <line x1="10" y1="16" x2="45" y2="16" stroke="#243C32" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.4" />
      </g>

      {/* Đàn chim én liệng phương xa */}
      <g opacity="0.45" fill="#315E48">
        <path d="M 680 75 Q 685 71 689 75 Q 693 71 698 75 Q 693 73 689 77 Q 685 73 680 75 Z" />
        <path d="M 665 65 Q 669 62 672 65 Q 675 62 679 65 Q 675 63 672 66 Q 669 63 665 65 Z" transform="scale(0.8) translate(160, 10)" />
      </g>

      {/* 5. Góc trái: Kiến trúc Lầu đình & Người đọc sách bên hoa đào */}
      <g transform="translate(0, 0)">
        {/* Mái đình cổ góc trái */}
        <path
          d="M 0 0 L 220 0 L 260 25 Q 230 20 180 32 Q 220 52 245 68 Q 200 60 140 75 L 140 240 L 0 240 Z"
          fill="#314B40"
          opacity="0.12"
        />

        {/* Trụ đình & khung cửa sổ hoa văn */}
        <rect x="30" y="25" width="6" height="215" fill="#20382E" opacity="0.4" />
        <rect x="180" y="35" width="6" height="205" fill="#20382E" opacity="0.35" />
        <rect x="36" y="70" width="144" height="4" fill="#20382E" opacity="0.3" />
        <rect x="36" y="175" width="144" height="4" fill="#20382E" opacity="0.3" />

        {/* Chấn song cửa sổ chữ Vạn hoặc nan gỗ thanh nhã */}
        <g stroke="#20382E" strokeWidth="1" opacity="0.25">
          <line x1="72" y1="74" x2="72" y2="175" />
          <line x1="108" y1="74" x2="108" y2="175" />
          <line x1="144" y1="74" x2="144" y2="175" />
          <line x1="36" y1="122" x2="180" y2="122" />
        </g>

        {/* Người phụ nữ/Học giả ngồi đọc sách bên cửa sổ */}
        <g transform="translate(125, 115) scale(0.95)" opacity="0.85">
          {/* Búi tóc cổ trang & trâm cài */}
          <ellipse cx="20" cy="12" rx="6" ry="7" fill="#1C2E26" />
          <circle cx="23" cy="8" rx="2" ry="2" fill="#1C2E26" />
          <path d="M 23 8 L 29 4" stroke="#BC9B6B" strokeWidth="1.2" strokeLinecap="round" />
          {/* Gương mặt nghiêng thanh thoát */}
          <path d="M 21 16 Q 24 19 22 23 Q 19 23 17 21 Z" fill="#FCEBD9" />
          {/* Cổ áo xanh lục ngọc truyền thống */}
          <path d="M 17 22 L 23 23 L 26 38 L 10 38 Z" fill="#416F5E" />
          <path d="M 19 23 L 15 28 L 18 30 Z" fill="#DCE8DB" />
          {/* Tà áo dài thướt tha */}
          <path d="M 10 38 Q 6 55 2 70 L 40 70 Q 32 50 26 38 Z" fill="#315B4C" />
          {/* Cuốn sách trên bàn */}
          <rect x="32" y="44" width="22" height="15" rx="1.5" fill="#FAF5EB" stroke="#BC9B6B" strokeWidth="0.8" transform="rotate(-8 32 44)" />
          <line x1="36" y1="48" x2="48" y2="46" stroke="#204434" strokeWidth="0.8" opacity="0.6" />
          <line x1="37" y1="52" x2="49" y2="50" stroke="#204434" strokeWidth="0.8" opacity="0.6" />
          {/* Bàn trà gỗ */}
          <path d="M 28 56 L 68 56 L 66 70 L 26 70 Z" fill="#7A5636" opacity="0.5" />
        </g>

        {/* Cành đào/mai rủ từ trên lầu xuống */}
        <path
          d="M 140 0 Q 185 30 220 20 Q 255 12 290 35 Q 315 50 330 40"
          stroke="#423023"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 220 20 Q 235 45 250 55"
          stroke="#423023"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 280 32 Q 295 55 315 62"
          stroke="#423023"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Hoa đào nở hồng nhạt & chồi biếc */}
        {[
          { cx: 180, cy: 26, r: 5.5 },
          { cx: 205, cy: 16, r: 6 },
          { cx: 232, cy: 22, r: 7 },
          { cx: 248, cy: 42, r: 6.5 },
          { cx: 262, cy: 55, r: 5 },
          { cx: 285, cy: 30, r: 7.5 },
          { cx: 305, cy: 48, r: 6 },
          { cx: 326, cy: 40, r: 5.5 },
          { cx: 160, cy: 15, r: 4.5 },
          { cx: 295, cy: 20, r: 5 },
        ].map((f, i) => (
          <g key={i}>
            <circle cx={f.cx} cy={f.cy} r={f.r} fill="#EAA498" opacity="0.85" />
            <circle cx={f.cx} cy={f.cy} r={f.r * 0.6} fill="#F8CBC4" />
            <circle cx={f.cx} cy={f.cy} r={f.r * 0.22} fill="#A33E2B" />
          </g>
        ))}

        {/* Cánh hoa rơi lả tả theo gió */}
        <ellipse cx="255" cy="85" rx="3.5" ry="2" fill="#EAA498" opacity="0.7" transform="rotate(25 255 85)" />
        <ellipse cx="295" cy="105" rx="3" ry="1.8" fill="#EAA498" opacity="0.65" transform="rotate(-35 295 105)" />
        <ellipse cx="345" cy="95" rx="3.2" ry="1.9" fill="#EAA498" opacity="0.6" transform="rotate(45 345 95)" />
        <ellipse cx="210" cy="130" rx="3" ry="1.5" fill="#EAA498" opacity="0.5" transform="rotate(15 210 130)" />
      </g>

      {/* 6. Dấu mộc triện đỏ thư pháp: "生活如诗" (Đời đẹp như thơ) góc phải */}
      <g transform="translate(845, 60)">
        <rect
          x="0"
          y="0"
          width="28"
          height="52"
          rx="4"
          fill="#9E3524"
          fillOpacity="0.88"
          stroke="#7A2214"
          strokeWidth="1.2"
        />
        {/* Chữ triện chạm khắc âm bản */}
        <text
          x="14"
          y="18"
          textAnchor="middle"
          fill="#FFF4EE"
          fontSize="11"
          fontFamily="STKaiti, KaiTi, serif"
          fontWeight="bold"
          letterSpacing="1"
        >
          生
        </text>
        <text
          x="14"
          y="30"
          textAnchor="middle"
          fill="#FFF4EE"
          fontSize="11"
          fontFamily="STKaiti, KaiTi, serif"
          fontWeight="bold"
          letterSpacing="1"
        >
          活
        </text>
        <text
          x="14"
          y="42"
          textAnchor="middle"
          fill="#FFF4EE"
          fontSize="10"
          fontFamily="STKaiti, KaiTi, serif"
          fontWeight="bold"
          letterSpacing="1"
        >
          如诗
        </text>
        {/* Vết mòn cổ kính của ấn chương */}
        <circle cx="2" cy="12" r="1.5" fill="#FAF5EC" opacity="0.4" />
        <circle cx="26" cy="38" r="1.2" fill="#FAF5EC" opacity="0.4" />
      </g>

      {/* 7. Lớp sương nước phủ dưới đáy để êm ái hoà vào nền trang */}
      <rect x="0" y="160" width="1200" height="80" fill="url(#mistLake)" />
    </svg>
  );
}

/**
 * 2. TOP HEADER MISTY MOUNTAINS & BAMBOO SVG
 * Khung cảnh núi mờ xa và khóm trúc u nhã ở góc trên bên phải
 */
export function HeaderMistyMountainsSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full object-cover pointer-events-none select-none ${className}`}
      preserveAspectRatio="xMaxYMid slice"
    >
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#204434" stopOpacity="0.12" />
          <stop offset="60%" stopColor="#315E48" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#F8F5ED" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Dãy núi sương mờ phía sau */}
      <path
        d="M 350 90 Q 450 35 560 65 Q 640 25 730 60 Q 820 15 920 70 L 1000 80 L 1000 120 L 350 120 Z"
        fill="url(#headerGrad)"
      />

      {/* Mặt trời hồng sớm nhỏ */}
      <circle cx="730" cy="45" r="18" fill="#EAA498" fillOpacity="0.25" />

      {/* Cành trúc buông lơi góc trên bên phải */}
      <g transform="translate(880, -10)" stroke="#264A3A" strokeWidth="1.8" strokeLinecap="round" opacity="0.55">
        {/* Thân trúc */}
        <path d="M 60 0 Q 30 35 -10 65" fill="none" />
        <path d="M 90 0 Q 55 45 20 85" fill="none" strokeWidth="1.4" />

        {/* Khóm lá trúc */}
        <g fill="#264A3A" stroke="none">
          {/* Nhóm lá 1 */}
          <path d="M -10 65 Q -25 72 -38 78 Q -24 74 -10 65 Z" />
          <path d="M -10 65 Q -20 82 -28 94 Q -16 80 -10 65 Z" />
          <path d="M -10 65 Q -6 85 -10 102 Q -5 83 -10 65 Z" />

          {/* Nhóm lá 2 */}
          <path d="M 20 85 Q 5 95 -8 102 Q 6 95 20 85 Z" />
          <path d="M 20 85 Q 12 105 5 120 Q 15 102 20 85 Z" />
          <path d="M 20 85 Q 26 106 28 124 Q 26 104 20 85 Z" />

          {/* Nhóm lá 3 */}
          <path d="M 45 35 Q 25 42 12 48 Q 28 42 45 35 Z" />
          <path d="M 45 35 Q 35 52 26 64 Q 38 48 45 35 Z" />
        </g>
      </g>
    </svg>
  );
}

/**
 * 3. VECTOR ARTWORK CHO CÁC THẺ BÀI HỌC LIÊN QUAN (Bài 4, 5, 6, 7, 8)
 * Mỗi bài học sở hữu một bức tranh minh họa thủy mặc độc bản:
 */
export function LessonThumbnailArtwork({
  lessonNumber,
  className = "",
}: {
  lessonNumber: number;
  className?: string;
}) {
  switch (lessonNumber) {
    case 4:
      // Bài 4: 这是我的家 (Nhà tứ hợp viện & rặng liễu rủ)
      return (
        <svg viewBox="0 0 200 120" className={`w-full h-full object-cover ${className}`}>
          <rect width="200" height="120" fill="#FAF6EE" />
          {/* Mái ngói nhà cổ */}
          <path d="M 20 70 L 60 45 L 100 70 Z" fill="#3D5A4C" opacity="0.75" />
          <rect x="30" y="70" width="60" height="35" fill="#EDE4D4" />
          <rect x="52" y="80" width="16" height="25" fill="#8C5835" />
          <path d="M 85 75 L 125 55 L 165 75 Z" fill="#2E4A3D" opacity="0.8" />
          <rect x="95" y="75" width="60" height="32" fill="#E8DEC9" />
          {/* Cây liễu xanh */}
          <path d="M 160 90 Q 165 40 145 25" stroke="#5A4332" strokeWidth="2.5" fill="none" />
          <path d="M 145 25 Q 130 50 125 80" stroke="#48735C" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
          <path d="M 145 25 Q 150 55 145 85" stroke="#48735C" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
          <path d="M 145 25 Q 165 50 170 78" stroke="#48735C" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
        </svg>
      );
    case 5:
      // Bài 5: 今天我休息 (Người ngồi bên đình & cành mai)
      return (
        <svg viewBox="0 0 200 120" className={`w-full h-full object-cover ${className}`}>
          <rect width="200" height="120" fill="#FBF7EE" />
          <circle cx="140" cy="45" r="24" fill="#ECA294" fillOpacity="0.4" />
          {/* Góc lầu đình */}
          <path d="M 0 0 L 70 0 L 85 25 L 0 45 Z" fill="#2A4B3D" opacity="0.35" />
          <rect x="15" y="20" width="4" height="100" fill="#2A4B3D" opacity="0.5" />
          {/* Người đọc sách */}
          <circle cx="55" cy="72" r="5" fill="#1C3329" />
          <path d="M 50 78 L 60 78 L 65 105 L 45 105 Z" fill="#3D6855" />
          {/* Cành hoa */}
          <path d="M 70 15 Q 110 30 135 25" stroke="#523B2A" strokeWidth="2" fill="none" />
          <circle cx="95" cy="22" r="4" fill="#EAA498" />
          <circle cx="118" cy="28" r="4.5" fill="#EAA498" />
          <circle cx="132" cy="24" r="3.5" fill="#EAA498" />
        </svg>
      );
    case 6:
      // Bài 6: 我喜欢音乐 (Đàn tỳ bà cổ phong & nét mực)
      return (
        <svg viewBox="0 0 200 120" className={`w-full h-full object-cover ${className}`}>
          <rect width="200" height="120" fill="#FAF5EA" />
          {/* Nét mực thư pháp uốn lượn như nốt nhạc */}
          <path d="M 20 95 Q 60 20 120 70 Q 160 100 185 30" stroke="#244436" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
          {/* Cây đàn Tỳ bà (Pipa) */}
          <g transform="translate(100, 20) rotate(22)">
            {/* Cần đàn & đầu đàn cuộn */}
            <rect x="14" y="0" width="4" height="35" fill="#6E482B" rx="1" />
            <ellipse cx="16" cy="-2" rx="4" ry="3" fill="#6E482B" />
            {/* Thân đàn hình quả lê */}
            <path d="M 16 32 C 6 45 0 65 4 80 C 8 92 24 92 28 80 C 32 65 26 45 16 32 Z" fill="#B88655" stroke="#6E482B" strokeWidth="1.2" />
            {/* Dây đàn */}
            <line x1="14" y1="10" x2="14" y2="78" stroke="#F5EDE0" strokeWidth="0.6" />
            <line x1="15.5" y1="10" x2="15.5" y2="78" stroke="#F5EDE0" strokeWidth="0.6" />
            <line x1="17" y1="10" x2="17" y2="78" stroke="#F5EDE0" strokeWidth="0.6" />
            {/* Dải lụa đỏ buộc đàn */}
            <path d="M 16 0 Q 30 -5 35 15" stroke="#A8392B" strokeWidth="1.5" fill="none" />
          </g>
        </svg>
      );
    case 7:
      // Bài 7: 你家有几口人 (Cầu đá & gia đình nhỏ bên bến nước)
      return (
        <svg viewBox="0 0 200 120" className={`w-full h-full object-cover ${className}`}>
          <rect width="200" height="120" fill="#F8F4EA" />
          {/* Cầu vòm đá cổ */}
          <path d="M 30 90 Q 90 40 150 90 L 170 90 Q 90 25 10 90 Z" fill="#586F63" opacity="0.6" />
          <path d="M 45 90 Q 90 55 135 90 Z" fill="#F8F4EA" />
          {/* Tháp chùa xa mờ */}
          <path d="M 160 35 L 168 35 L 172 65 L 156 65 Z" fill="#294639" opacity="0.3" />
          <polygon points="164,25 160,35 168,35" fill="#294639" opacity="0.4" />
          {/* Thuyền nan lướt dưới chân cầu */}
          <path d="M 75 92 Q 95 95 115 92 Q 100 98 75 92 Z" fill="#3D2B1F" />
        </svg>
      );
    default:
      // Bài 8: 我们去公园吧 (Cổng hoa viên & đình bát giác)
      return (
        <svg viewBox="0 0 200 120" className={`w-full h-full object-cover ${className}`}>
          <rect width="200" height="120" fill="#F9F5EC" />
          {/* Đầm sen & cầu ngoằn ngoèo */}
          <path d="M 20 85 L 60 75 L 85 85 L 125 70 L 155 80" stroke="#87684C" strokeWidth="3" fill="none" />
          {/* Đình bát giác nghỉ chân */}
          <path d="M 110 50 L 140 40 L 170 50 L 165 54 L 115 54 Z" fill="#2A4B3C" opacity="0.8" />
          <line x1="122" y1="54" x2="122" y2="70" stroke="#2A4B3C" strokeWidth="2" />
          <line x1="158" y1="54" x2="158" y2="70" stroke="#2A4B3C" strokeWidth="2" />
          {/* Lá sen nổi */}
          <ellipse cx="40" cy="100" rx="14" ry="4" fill="#57876F" opacity="0.5" />
          <ellipse cx="90" cy="105" rx="18" ry="5" fill="#436F5A" opacity="0.6" />
          <circle cx="95" cy="98" r="3" fill="#E88C9E" />
        </svg>
      );
  }
}
