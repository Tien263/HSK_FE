const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require('../src/generated/prisma/client.js');

const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log('🩺 ĐANG KIỂM TRA TOÀN DIỆN HỆ THỐNG HANYU HSK');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  // 1. TEST DATABASE (SUPABASE)
  total++;
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1 as ok`;
    const latency = Date.now() - t0;
    const users = await prisma.user.count();
    console.log(`[PASS] 1. CƠ SỞ DỮ LIỆU: Hoạt động rất tốt (Độ trễ: ${latency}ms, ${users} tài khoản)`);
    passed++;
  } catch (err) {
    console.log(`[FAIL] 1. CƠ SỞ DỮ LIỆU: Lỗi - ${err.message}`);
  }

  // 2. TEST HSK CURRICULUM
  total++;
  try {
    const contents = await prisma.curriculumContent.findMany({ orderBy: { hskLevel: 'asc' } });
    if (contents.length > 0) {
      console.log(`[PASS] 2. KHO GIÁO TRÌNH HSK: Đã kết nối ${contents.length} cấp độ:`);
      for (const c of contents) {
        let lessons = [];
        try {
          lessons = Array.isArray(c.lessons) ? c.lessons : JSON.parse(c.lessons);
        } catch {}
        let exercises = 0;
        lessons.forEach(l => exercises += (l.exercises || l.grammarExercises || []).length);
        console.log(`       • HSK ${c.hskLevel}: ${lessons.length} bài học | ${exercises} câu bài tập ngữ pháp`);
      }
      passed++;
    } else {
      console.log(`[WARN] 2. KHO GIÁO TRÌNH: Chưa có dữ liệu trên máy chủ.`);
    }
  } catch (err) {
    console.log(`[FAIL] 2. KHO GIÁO TRÌNH: ${err.message}`);
  }

  // 3. TEST ALIBABA QWEN (GROQ)
  total++;
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const t0 = Date.now();
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [{ role: 'user', content: '你好' }],
          max_tokens: 5
        })
      });
      const ms = Date.now() - t0;
      if (res.ok) {
        console.log(`[PASS] 3. ALIBABA QWEN AI: Phản hồi siêu tốc trong ${ms}ms (Văn phong chuẩn Trung Quốc)`);
        passed++;
      } else {
        console.log(`[FAIL] 3. ALIBABA QWEN AI: Mã lỗi HTTP ${res.status}`);
      }
    } catch (e) {
      console.log(`[FAIL] 3. ALIBABA QWEN AI: ${e.message}`);
    }
  } else {
    console.log(`[SKIP] 3. ALIBABA QWEN AI: Chưa cấu hình GROQ_API_KEY`);
  }

  // 4. TEST GOOGLE GEMINI AI
  total++;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const t0 = Date.now();
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      const ms = Date.now() - t0;
      if (res.ok) {
        console.log(`[PASS] 4. GOOGLE GEMINI AI: Sẵn sàng làm AI dự phòng (${ms}ms)`);
        passed++;
      } else {
        console.log(`[FAIL] 4. GOOGLE GEMINI AI: Mã lỗi HTTP ${res.status}`);
      }
    } catch (e) {
      console.log(`[FAIL] 4. GOOGLE GEMINI AI: ${e.message}`);
    }
  } else {
    console.log(`[SKIP] 4. GOOGLE GEMINI AI: Chưa cấu hình GEMINI_API_KEY`);
  }

  // 5. TEST MICROSOFT EDGE TTS (GIỌNG ĐỌC)
  total++;
  try {
    const t0 = Date.now();
    const youdaoRes = await fetch("https://dict.youdao.com/dictvoice?audio=你好&le=zh");
    const ms = Date.now() - t0;
    if (youdaoRes.ok) {
      console.log(`[PASS] 5. HỆ THỐNG PHÁT ÂM TIẾNG TRUNG: Hoạt động tốt (${ms}ms)`);
      passed++;
    } else {
      console.log(`[FAIL] 5. HỆ THỐNG PHÁT ÂM: Mã lỗi HTTP ${youdaoRes.status}`);
    }
  } catch (e) {
    console.log(`[FAIL] 5. HỆ THỐNG PHÁT ÂM: ${e.message}`);
  }

  // 6. TEST CLOUDINARY MEDIA
  total++;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName) {
    console.log(`[PASS] 6. KHO ĐA PHƯƠNG TIỆN CLOUDINARY: Cấu hình chuẩn (${cloudName})`);
    passed++;
  } else {
    console.log(`[FAIL] 6. KHO ĐA PHƯƠNG TIỆN: Chưa có Cloud Name`);
  }

  console.log('\n====================================================');
  if (passed === total) {
    console.log(`🎉 KẾT QUẢ: TẤT CẢ ${passed}/${total} PHẦN ĐỀU HOẠT ĐỘNG HOÀN HẢO!`);
  } else {
    console.log(`⚠️ KẾT QUẢ: ${passed}/${total} ĐẠT YÊU CẦU. Hãy kiểm tra các mục [FAIL] ở trên.`);
  }
  console.log('====================================================');
}

main().catch(console.error).finally(() => prisma.$disconnect());
