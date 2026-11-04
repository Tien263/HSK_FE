/**
 * safeLocalStorageSet
 *
 * An toàn ghi dữ liệu vào browser localStorage với cơ chế tự động dọn dẹp
 * bộ nhớ đệm cũ khi chạm giới hạn quota (QuotaExceededError - 5MB giới hạn trình duyệt).
 * Tuyệt đối không bao giờ ném ngoại lệ làm gián đoạn luồng công việc hay lưu trữ CSDL.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: unknown) {
    const isQuota =
      (err as { name?: string })?.name === "QuotaExceededError" ||
      (err as { name?: string })?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      (err as { code?: number })?.code === 22;

    if (isQuota) {
      console.warn(
        `[safeLocalStorageSet] QuotaExceededError khi ghi key "${key}". Đang dọn dẹp các bản sao lưu/cache cũ để phục hồi dung lượng...`
      );
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k) continue;
          // Xóa các snapshot lịch sử cũ và cache của cấp độ khác
          if (
            k.startsWith("hsk_curriculum_snapshots_v1_") ||
            k.startsWith("hsk_curriculum_history_") ||
            (k.startsWith("hsk_admin_custom_curriculum_level_") && k !== key)
          ) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          try {
            localStorage.removeItem(k);
          } catch {}
        }

        // Thử ghi lại sau khi dọn dẹp
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(
          `[safeLocalStorageSet] Bộ nhớ trình duyệt vẫn đầy sau khi dọn. Bỏ qua ghi cache cục bộ để ưu tiên lưu CSDL máy chủ.`,
          retryErr
        );
        return false;
      }
    }
    console.warn(`[safeLocalStorageSet] Không thể ghi vào localStorage:`, err);
    return false;
  }
}
