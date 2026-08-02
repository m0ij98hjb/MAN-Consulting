// Spells out an integer amount in Arabic words (masculine agreement, matching
// "ريال") — the traditional "written in full" form used on formal Arabic
// financial documents/reports, shown under the numeric total.
const ONES = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
const TEENS = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
const TENS = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
const HUNDREDS = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
const SCALES = [
  null,
  { singular: "ألف", dual: "ألفان", plural: "آلاف" },
  { singular: "مليون", dual: "مليونان", plural: "ملايين" },
  { singular: "مليار", dual: "ملياران", plural: "مليارات" },
];

function threeDigitsToWords(n) {
  const parts = [];
  const h = Math.floor(n / 100);
  const rem = n % 100;
  if (h > 0) parts.push(HUNDREDS[h]);
  if (rem > 0) {
    if (rem < 10) parts.push(ONES[rem]);
    else if (rem < 20) parts.push(TEENS[rem - 10]);
    else {
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      parts.push(o > 0 ? `${ONES[o]} و${TENS[t]}` : TENS[t]);
    }
  }
  return parts.join(" و");
}

export function numberToArabicWords(value) {
  const num = Math.round(Math.abs(Number(value) || 0));
  if (num === 0) return "صفر";

  const groups = [];
  let n = num;
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const phrases = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;
    if (i === 0) {
      phrases.push(threeDigitsToWords(g));
    } else {
      const scale = SCALES[i];
      if (g === 1) phrases.push(scale.singular);
      else if (g === 2) phrases.push(scale.dual);
      else if (g >= 3 && g <= 10) phrases.push(`${threeDigitsToWords(g)} ${scale.plural}`);
      else phrases.push(`${threeDigitsToWords(g)} ${scale.singular}`);
    }
  }

  return phrases.join(" و");
}
