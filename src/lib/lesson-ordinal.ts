/** Format the actual curriculum number, rather than an array position. */
export function lessonOrdinal(number: number): string {
  if (!Number.isSafeInteger(number) || number < 1) return "Bài học";
  if (number > 9999) return `第${number}课`;
  const digits = "零一二三四五六七八九", units = ["千", "百", "十", ""];
  let remaining = number, value = "", zero = false;
  [1000, 100, 10, 1].forEach((divisor, index) => {
    const digit = Math.floor(remaining / divisor); remaining %= divisor;
    if (digit) { if (zero) value += digits[0]; value += digits[digit] + units[index]; zero = false; }
    else if (value && remaining) zero = true;
  });
  return `第${value.replace(/^一十/, "十")}课`;
}
