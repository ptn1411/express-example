// ─── Severity word lists ────────────────────────────────────────────────────
// HIGH: explicit sexual content
const HIGH_WORDS: string[] = [
  // Male anatomy
  "buồi","buoi","dau buoi","daubuoi","caidaubuoi","nhucaidaubuoi",
  "dau boi","bòi","dauboi","caidauboi","đầu bòy","đầu bùi",
  "dau boy","dauboy","caidauboy","b`",
  "cặc","cak","kak","kac","cac","concak","nungcak","bucak","caiconcac","caiconcak",
  "cu","cặk","dái","giái","zái","kiu",
  // Female anatomy
  "lồn","l`","loz","lìn","nulo","matlon","cailon","matlol","matloz",
  "thangmatlon","thangml","đỗn lì",
  "xàm lol","xam lol","xạo lol","xao lol","con lol","ăn lol","an lol",
  "mát lol","mat lol","cái lol","cai lol","lòi lol","loi lol","ham lol",
  "củ lol","cu lol","ngu lol","tuổi lol","tuoi lol","mõm lol","mồm lol",
  "mom lol","như lol","nhu lol","nứng lol","nung lol","nug lol","nuglol",
  "rảnh lol","ranh lol","đách lol","dach lol","mu lol","banh lol",
  "tét lol","tet lol","vạch lol","vach lol","cào lol","cao lol","tung lol",
  "mặt lol","mát lol","mat lol",
  "xàm lon","xam lon","xạo lon","xao lon","con lon","ăn lon","an lon",
  "mát lon","mat lon","cái lon","cai lon","lòi lon","loi lon","ham lon",
  "củ lon","cu lon","ngu lon","tuổi lon","tuoi lon","mõm lon","mồm lon",
  "mom lon","như lon","nhu lon","nứng lon","nung lon","nug lon","nuglon",
  "rảnh lon","ranh lon","đách lon","dach lon","mu lon","banh lon",
  "tét lon","tet lon","vạch lon","vach lon","cào lon","cao lon","tung lon",
  "mặt lon","mát lon","mat lon",
  "cái lờ","cl","clgt","cờ lờ gờ tờ","cái lề gì thốn","đốn cửa lòng",
  "sml","sapmatlol","sapmatlon","sapmatloz","sấp mặt","sap mat",
  "vlon","vloz","vlol","vailon","vai lon","vai lol","vailol","nốn lừng",
  // Bodily waste
  "cứt","cuccut","cutcut","cứk","cuk","cười ỉa","cười ẻ",
  // Sexual acts
  "địt","đụ","đú","đù","đủ","đìu",
  "địt mẹ","địt mịe","địt má","địt mía","địt ba","địt bà","địt cha","địt con","địt bố","địt cụ",
  "đụ mẹ","đụ mịa","đụ mịe","đụ má","đụ cha","đụ bà",
  "đú cha","đú con mẹ","đú má","đú mẹ",
  "đù cha","đù má","đù mẹ","đù mịe","đù mịa",
  "đủ cha","đủ má","đủ mẹ","đủ mé","đủ mía","đủ mịa","đủ mịe","đủ mie","đủ mia",
  "đờ mờ","đê mờ","đờ ma ma","đờ mama","đê mama","đề mama","đê ma ma","đề ma ma",
  "dou","doma","duoma","dou má","duo má","dou ma","đou má","đìu má","á đù","á đìu",
  "đậu mẹ","đậu má",
  "dit","dis","diz","đjt","djt",
  "dis me","disme","dismje","dismia","dis mia","dis mie","đis mịa","đis mịe",
  "ditmemayconcho","ditmemay","ditmethangoccho","ditmeconcho",
  "dmconcho","dmcs","ditmecondi","ditmecondicho",
  "chịch","chich","xoạc","xoac","chich choac",
  "húp sò","đút đít","chổng mông","banh háng","xéo háng",
  "xhct","xephinh","la liếm","đổ vỏ",
  "nứng","nug","bỏ bú","buscu",
  // Prostitution/slurs
  "đĩ","di~","đuỹ","điếm","cđĩ","cdi~",
  "đilol","điloz","đilon","diloz","dilol","dilon",
  "condi","condi~","dime","di me","dimemay",
  "condime","condimay","condimemay","con di cho","condicho",
  "phò","4`","fuck","fck",
  "bitch","biz","bít chi","con bích","con bic","con bíc","con bít",
];

// MEDIUM: strong curses and family insults
const MEDIUM_WORDS: string[] = [
  "đéo","đếch","đếk","dek","đết","đệt","đách","dech","đeo","deo",
  "đel","đél","del",
  "dell ngửi","dell ngui","dell chịu","dell chiu","dell hiểu","dell hieu",
  "dellhieukieugi","dell nói","dell noi","dellnoinhieu","dell biết","dell biet",
  "dell nghe","dell ăn","dell an","dell được","dell duoc",
  "dell làm","dell lam","dell đi","dell di","dell chạy","dell chay",
  "deohieukieugi",
  "đệch","đệt",
  "đm","dm","đmm","dmm","đmmm","dmmm","đmmmm","dmmmm","đmmmmm","dmmmmm",
  "đcm","dcm","đcmm","dcmm","đcmmm","dcmmm","đcmmmm","dcmmmm",
  "vcl","vl","vleu","vãi","v~",
  "cmn","cmnl","tiên sư nhà mày","tiên sư bố","tổ sư",
  "tổ cha","bà cha mày",
  "mẹ bà","mẹ cha mày","mẹ cha anh","mẹ cha nhà anh","mẹ cha nhà mày",
  "me cha may","me cha nha may",
  "mả cha mày","mả cha nhà mày","ma cha may","ma cha nha may","mả mẹ","mả cha",
  "kệ mẹ","kệ mịe","kệ mịa","kệ mje","kệ mja",
  "ke me","ke mie","ke mia","ke mja","ke mje",
  "bỏ mẹ","bỏ mịa","bỏ mịe","bỏ mja","bỏ mje",
  "bo me","bo mia","bo mie","bo mje","bo mja",
  "chetme","chet me","chết mẹ","chết mịa","chết mja","chết mịe","chết mie",
  "chet mia","chet mie","chet mja","chet mje",
  "thấy mẹ","thấy mịe","thấy mịa","thay me","thay mie","thay mia",
  "ml","thml","tml","diml","dml",
  "hãm",
];

// LOW: mild insults
const LOW_WORDS: string[] = [
  "ngu","óc chó","occho","lao cho","láo chó","bố láo",
  "chó má","cờ hó","sảng",
  "thằng chó","thang cho","chó điên","thằng điên","thang dien","đồ điên",
  "sủa bậy","sủa tiếp","sủa đi","sủa càn",
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function escapeRegex(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Vietnamese + ASCII alphanumeric — used for word-boundary simulation via lookahead/lookbehind.
// Standard \b doesn't work for Vietnamese because diacritics aren't \w chars.
const VN_CHARS =
  "a-zA-Z0-9đĐáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ";
const BEFORE = `(?<![${VN_CHARS}])`;
const AFTER = `(?![${VN_CHARS}])`;

function buildRegex(words: string[]): RegExp {
  // Deduplicate and sort longest-first so multi-word phrases match before substrings
  const unique = [...new Set(words)].sort((a, b) => b.length - a.length);
  const patterns = unique.map((word) => {
    const escaped = escapeRegex(word);
    // Single-word entries (no spaces) get Vietnamese-aware boundaries to prevent
    // false positives: "ngu" ≠ "Nguyễn", "ml" ≠ "100ml", "cl" ≠ "class".
    // Multi-word phrases already match precisely enough without extra boundaries.
    return word.includes(" ") ? escaped : `${BEFORE}${escaped}${AFTER}`;
  });
  return new RegExp(patterns.join("|"), "gi");
}

// Normalize text to catch common bypass attempts before checking
function normalizeForDetection(text: string): string {
  return (
    text
      // Remove zero-width / invisible Unicode chars (U+200B, U+200C, U+200D, FEFF, soft-hyphen, word-joiner)
      .replace(/[​‌‍﻿­⁠]/g, "")
      // Remove separator characters inserted between letters to split a profanity (đ.m → đm)
      .replace(/([a-zA-ZđĐáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ])[.\-_*|]+([a-zA-ZđĐáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ])/gi, "$1$2")
      // Collapse 3+ consecutive identical characters down to 2 (đmmmm → đmm)
      .replace(/(.)\1{2,}/g, "$1$1")
  );
}

// ─── Module-level compiled regexes (compiled once) ──────────────────────────
const highRegex = buildRegex(HIGH_WORDS);
const mediumRegex = buildRegex(MEDIUM_WORDS);
const lowRegex = buildRegex(LOW_WORDS);
const allRegex = buildRegex([...HIGH_WORDS, ...MEDIUM_WORDS, ...LOW_WORDS]);

// ─── Public API ──────────────────────────────────────────────────────────────
export interface ProfanityResult {
  detected: boolean;
  matches: string[];
  severity: "high" | "medium" | "low" | null;
  censoredText: string;
}

export function detectProfanity(text: string): ProfanityResult {
  const normalized = normalizeForDetection(text);

  highRegex.lastIndex = 0;
  mediumRegex.lastIndex = 0;
  lowRegex.lastIndex = 0;

  const highMatches = normalized.match(highRegex) ?? [];
  const mediumMatches = normalized.match(mediumRegex) ?? [];
  const lowMatches = normalized.match(lowRegex) ?? [];

  const allMatches = [...highMatches, ...mediumMatches, ...lowMatches];
  const detected = allMatches.length > 0;
  const severity: ProfanityResult["severity"] = highMatches.length > 0
    ? "high"
    : mediumMatches.length > 0
    ? "medium"
    : lowMatches.length > 0
    ? "low"
    : null;

  return {
    detected,
    matches: [...new Set(allMatches.map((m) => m.toLowerCase()))],
    severity,
    censoredText: censorText(text),
  };
}

export function censorText(text: string): string {
  const normalized = normalizeForDetection(text);
  allRegex.lastIndex = 0;
  return normalized.replace(allRegex, (match) => "*".repeat(match.length));
}

export function hasProfanity(text: string): boolean {
  const normalized = normalizeForDetection(text);
  allRegex.lastIndex = 0;
  return allRegex.test(normalized);
}
