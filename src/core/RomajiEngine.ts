export interface KanaToken {
  kana: string;          // Chuỗi hiển thị của âm tiết (VD: "し", "しゃ", "っ", "ん")
  options: string[];     // Các cách gõ Romaji hợp lệ (VD: ["shi", "si"])
  typed: string;         // Các ký tự người chơi đã gõ cho âm tiết này
  completed: boolean;    // Đã hoàn thành âm tiết này chưa
  chosenOption: string;  // Cách gõ đang khớp hiện tại để hiển thị Romaji Guide động
}

// Bảng ánh xạ cơ bản (Hiragana & Katakana -> Mảng các cách gõ Romaji)
const BASE_ROMAJI_MAP: Record<string, string[]> = {
  // Nguyên âm đơn
  'あ': ['a'], 'い': ['i', 'yi'], 'う': ['u', 'wu'], 'え': ['e'], 'お': ['o'],
  'ア': ['a'], 'イ': ['i', 'yi'], 'ウ': ['u', 'wu'], 'エ': ['e'], 'オ': ['o'],

  // Hàng K / G
  'か': ['ka', 'ca'], 'き': ['ki'], 'く': ['ku', 'cu', 'qu'], 'け': ['ke'], 'こ': ['ko', 'co'],
  'カ': ['ka', 'ca'], 'キ': ['ki'], 'ク': ['ku', 'cu', 'qu'], 'ケ': ['ke'], 'コ': ['ko', 'co'],
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'ガ': ['ga'], 'ギ': ['gi'], 'グ': ['gu'], 'ゲ': ['ge'], 'ゴ': ['go'],

  // Hàng S / Z (Hepburn + Kunrei-shiki)
  'さ': ['sa'], 'し': ['shi', 'si', 'ci'], 'す': ['su'], 'せ': ['se', 'ce'], 'そ': ['so'],
  'サ': ['sa'], 'シ': ['shi', 'si', 'ci'], 'ス': ['su'], 'セ': ['se', 'ce'], 'ソ': ['so'],
  'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  'ザ': ['za'], 'ジ': ['ji', 'zi'], 'ズ': ['zu'], 'ゼ': ['ze'], 'ゾ': ['zo'],

  // Hàng T / D (Hepburn + Kunrei-shiki + Nihon-shiki)
  'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],
  'タ': ['ta'], 'チ': ['chi', 'ti'], 'ツ': ['tsu', 'tu'], 'テ': ['te'], 'ト': ['to'],
  'だ': ['da'], 'ぢ': ['ji', 'di', 'zi'], 'づ': ['zu', 'du'], 'で': ['de'], 'ど': ['do'],
  'ダ': ['da'], 'ヂ': ['ji', 'di', 'zi'], 'ヅ': ['zu', 'du'], 'デ': ['de'], 'ド': ['do'],

  // Hàng N
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  'ナ': ['na'], 'ニ': ['ni'], 'ヌ': ['nu'], 'ネ': ['ne'], 'ノ': ['no'],

  // Hàng H / B / P (ふ -> fu, hu)
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],
  'ハ': ['ha'], 'ヒ': ['hi'], 'フ': ['fu', 'hu'], 'ヘ': ['he'], 'ホ': ['ho'],
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  'バ': ['ba'], 'ビ': ['bi'], 'ブ': ['bu'], 'ベ': ['be'], 'ボ': ['bo'],
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
  'パ': ['pa'], 'ピ': ['pi'], 'プ': ['pu'], 'ペ': ['pe'], 'ポ': ['po'],

  // Hàng M
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  'マ': ['ma'], 'ミ': ['mi'], 'ム': ['mu'], 'メ': ['me'], 'モ': ['mo'],

  // Hàng Y
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  'ヤ': ['ya'], 'ユ': ['yu'], 'ヨ': ['yo'],

  // Hàng R
  'ら': ['ra', 'la'], 'り': ['ri', 'li'], 'る': ['ru', 'lu'], 'れ': ['re', 'le'], 'ろ': ['ro', 'lo'],
  'ラ': ['ra', 'la'], 'リ': ['ri', 'li'], 'ル': ['ru', 'lu'], 'レ': ['re', 'le'], 'ロ': ['ro', 'lo'],

  // Hàng W & N
  'わ': ['wa'], 'を': ['wo', 'o'], 'ん': ['n', 'nn', 'xn'],
  'ワ': ['wa'], 'ヲ': ['wo', 'o'], 'ン': ['n', 'nn', 'xn'],

  // Âm ghép (Youon - 2 ký tự Kana)
  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],
  'キャ': ['kya'], 'キュ': ['kyu'], 'キョ': ['kyo'],
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],
  'ギャ': ['gya'], 'ギュ': ['gyu'], 'ギョ': ['gyo'],

  'しゃ': ['sha', 'sya', 'sixya'], 'しゅ': ['shu', 'syu', 'sixyu'], 'しょ': ['sho', 'syo', 'sixyo'],
  'シャ': ['sha', 'sya', 'sixya'], 'シュ': ['shu', 'syu', 'sixyu'], 'ショ': ['sho', 'syo', 'sixyo'],
  'じゃ': ['ja', 'zya', 'jya'], 'じゅ': ['ju', 'zyu', 'jyu'], 'じょ': ['jo', 'zyo', 'jyo'],
  'ジャ': ['ja', 'zya', 'jya'], 'ジュ': ['ju', 'zyu', 'jyu'], 'ジョ': ['jo', 'zyo', 'jyo'],

  'ちゃ': ['cha', 'tya', 'cya'], 'ちゅ': ['chu', 'tyu', 'cyu'], 'ちょ': ['cho', 'tyo', 'cyo'],
  'チャ': ['cha', 'tya', 'cya'], 'チュ': ['chu', 'tyu', 'cyu'], 'チョ': ['cho', 'tyo', 'cyo'],
  'ぢゃ': ['dya', 'ja', 'jya'], 'ぢゅ': ['dyu', 'ju', 'jyu'], 'ぢょ': ['dyo', 'jo', 'jyo'],
  'ヂャ': ['dya', 'ja', 'jya'], 'ヂュ': ['dyu', 'ju', 'jyu'], 'ヂョ': ['dyo', 'jo', 'jyo'],

  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],
  'ニャ': ['nya'], 'ニュ': ['nyu'], 'ニョ': ['nyo'],
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],
  'ヒャ': ['hya'], 'ヒュ': ['hyu'], 'ヒョ': ['hyo'],
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],
  'ビャ': ['bya'], 'ビュ': ['byu'], 'ビョ': ['byo'],
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],
  'ピャ': ['pya'], 'ピュ': ['pyu'], 'ピョ': ['pyo'],

  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],
  'ミャ': ['mya'], 'ミュ': ['myu'], 'ミョ': ['myo'],
  'りゃ': ['rya', 'lya'], 'りゅ': ['ryu', 'lyu'], 'りょ': ['ryo', 'lyo'],
  'リャ': ['rya', 'lya'], 'リュ': ['ryu', 'lyu'], 'リョ': ['ryo', 'lyo'],

  // Âm ngoại lai Katakana mở rộng
  'ヴァ': ['va', 'ba'], 'ヴィ': ['vi', 'bi'], 'ヴ': ['vu', 'bu'], 'ヴェ': ['ve', 'be'], 'ヴォ': ['vo', 'bo'],
  'ファ': ['fa', 'hua'], 'フィ': ['fi', 'hui'], 'フェ': ['fe', 'hue'], 'フォ': ['fo', 'huo'],
  'ティ': ['ti', 'thi', 'texi'], 'ディ': ['di', 'dhi', 'dexi'],
  'トゥ': ['tu', 'twu'], 'ドゥ': ['du', 'dwu'],
  'ウィ': ['wi', 'ui'], 'ウェ': ['we', 'ue'], 'ウォ': ['wo', 'uo'],
  'シェ': ['she', 'sye'], 'ジェ': ['je', 'jye', 'zye'], 'チェ': ['che', 'tye', 'cye'],

  // Âm nhỏ độc lập (fallback)
  'ぁ': ['xa', 'la'], 'ぃ': ['xi', 'li'], 'ぅ': ['xu', 'lu'], 'ぇ': ['xe', 'le'], 'ぉ': ['xo', 'lo'],
  'ァ': ['xa', 'la'], 'ィ': ['xi', 'li'], 'ゥ': ['xu', 'lu'], 'ェ': ['xe', 'le'], 'ォ': ['xo', 'lo'],
  'ゃ': ['xya', 'lya'], 'ゅ': ['xyu', 'lyu'], 'ょ': ['xyo', 'lyo'],
  'ャ': ['xya', 'lya'], 'ュ': ['xyu', 'lyu'], 'ョ': ['xyo', 'lyo'],
  'っ': ['xtu', 'ltu', 'xtsu'], 'ッ': ['xtu', 'ltu', 'xtsu'],
  'ー': ['-'],
};

const SMALL_Y_OR_VOWEL = new Set([
  'ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ',
  'ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ'
]);

const VOWELS_AND_Y_N = new Set(['a', 'i', 'u', 'e', 'o', 'y', 'n']);

function extractLastVowel(romaji: string): string | null {
  for (let i = romaji.length - 1; i >= 0; i--) {
    const ch = romaji[i];
    if ('aiueo'.includes(ch)) return ch;
  }
  return null;
}

export class RomajiSequence {
  public readonly rawKana: string;
  public readonly tokens: KanaToken[];
  public activeTokenIndex = 0;
  private allowAbsorbExtraN = false;

  constructor(kanaWord: string) {
    this.rawKana = kanaWord;
    this.tokens = RomajiEngine.tokenize(kanaWord);
  }

  /**
   * Kiểm tra xem ký tự đầu tiên của từ (khi chưa gõ gì) có khớp với phím `key` không.
   * Dùng cho cơ chế ZType Target Locking.
   */
  public canStartWith(key: string): boolean {
    const k = key.toLowerCase();
    if (this.tokens.length === 0) return false;
    const firstToken = this.tokens[0];
    return firstToken.options.some((opt) => opt.startsWith(k));
  }

  /**
   * Xử lý 1 phím bấm từ người chơi.
   * Trả về:
   * - matched: Phím gõ có hợp lệ không
   * - completedSyllable: Có vừa hoàn thành 1 âm tiết Kana không
   * - completedWord: Đã gõ xong toàn bộ từ chưa
   */
  public handleKey(rawKey: string): {
    matched: boolean;
    completedSyllable: boolean;
    completedWord: boolean;
  } {
    const key = rawKey.toLowerCase();
    if (this.isCompleted()) {
      return { matched: false, completedSyllable: false, completedWord: true };
    }

    const current = this.tokens[this.activeTokenIndex];

    // Xử lý trường hợp người chơi gõ thêm chữ 'n' thứ 2 cho âm 'ん'/'ン' vừa tự động chuyển qua
    if (this.allowAbsorbExtraN && key === 'n') {
      const nextStartsWithN = current.options.some((opt) => opt.startsWith('n'));
      if (!nextStartsWithN) {
        this.allowAbsorbExtraN = false;
        // Cập nhật hiển thị âm 'ん' trước đó thành 'nn'
        if (this.activeTokenIndex > 0) {
          const prev = this.tokens[this.activeTokenIndex - 1];
          if (prev.kana === 'ん' || prev.kana === 'ン') {
            prev.typed = 'nn';
            prev.chosenOption = 'nn';
          }
        }
        return { matched: true, completedSyllable: false, completedWord: false };
      }
    }

    this.allowAbsorbExtraN = false;

    const candidateTyped = current.typed + key;
    const matchingOptions = current.options.filter((opt) => opt.startsWith(candidateTyped));

    if (matchingOptions.length === 0) {
      return { matched: false, completedSyllable: false, completedWord: false };
    }

    current.typed = candidateTyped;

    // Ưu tiên giữ nguyên chosenOption nếu nó vẫn nằm trong danh sách hợp lệ,
    // nếu không thì đổi sang option đầu tiên khớp với chuỗi người chơi đang gõ (VD: 'shi' -> 'si')
    if (!matchingOptions.includes(current.chosenOption)) {
      current.chosenOption = matchingOptions[0];
    }

    // Kiểm tra xem đã khớp hoàn toàn với một option của âm tiết hiện tại chưa
    const exactMatch = matchingOptions.find((opt) => opt === candidateTyped);
    if (exactMatch) {
      // Đặc biệt cho âm 'ん'/'ン':
      // Nếu người chơi mới gõ 1 chữ 'n' và âm tiếp theo bắt đầu bằng phụ âm (không phải nguyên âm/y/n),
      // hoàn thành âm 'ん' ngay nhưng bật cờ allowAbsorbExtraN phòng khi người chơi gõ 'nn'.
      if ((current.kana === 'ん' || current.kana === 'ン') && exactMatch === 'n') {
        const isLastToken = this.activeTokenIndex === this.tokens.length - 1;
        if (!isLastToken) {
          this.allowAbsorbExtraN = true;
        }
      }

      current.chosenOption = exactMatch;
      current.completed = true;
      this.activeTokenIndex++;

      const wordDone = this.activeTokenIndex >= this.tokens.length;
      return {
        matched: true,
        completedSyllable: true,
        completedWord: wordDone,
      };
    }

    return {
      matched: true,
      completedSyllable: false,
      completedWord: false,
    };
  }

  public isCompleted(): boolean {
    return this.activeTokenIndex >= this.tokens.length;
  }

  public reset(): void {
    this.activeTokenIndex = 0;
    this.allowAbsorbExtraN = false;
    for (const t of this.tokens) {
      t.typed = '';
      t.completed = false;
      t.chosenOption = t.options[0];
    }
  }

  /**
   * Trả về thông tin hiển thị Romaji động (phần đã gõ, phần đang gõ, phần còn lại)
   */
  public getDynamicRomajiParts(): {
    typedRomaji: string;
    remainingRomaji: string;
    fullRomaji: string;
  } {
    let typedRomaji = '';
    let remainingRomaji = '';

    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (i < this.activeTokenIndex) {
        typedRomaji += token.chosenOption;
      } else if (i === this.activeTokenIndex) {
        typedRomaji += token.typed;
        remainingRomaji += token.chosenOption.slice(token.typed.length);
      } else {
        remainingRomaji += token.chosenOption;
      }
    }

    return {
      typedRomaji,
      remainingRomaji,
      fullRomaji: typedRomaji + remainingRomaji,
    };
  }
}

export class RomajiEngine {
  /**
   * Tách chuỗi Kana (Hiragana/Katakana) thành mảng các KanaToken đa phương thức.
   * Xử lý tự động:
   * - Âm ghép 2 ký tự (しゃ, ちゅ, じょ, ティ, ファ...)
   * - Âm ngắt っ / ッ (Sokuon - lặp phụ âm đầu của âm tiết sau)
   * - Âm mũi ん / ン (1 chữ 'n' trước phụ âm hoặc cuối từ; 'nn' trước nguyên âm/y/n)
   * - Trường âm ー (chấp nhận cả dấu '-' hoặc lặp nguyên âm trước đó)
   */
  public static tokenize(kanaWord: string): KanaToken[] {
    const rawPieces: string[] = [];
    let i = 0;
    while (i < kanaWord.length) {
      if (i + 1 < kanaWord.length && SMALL_Y_OR_VOWEL.has(kanaWord[i + 1])) {
        const twoChar = kanaWord.slice(i, i + 2);
        if (BASE_ROMAJI_MAP[twoChar]) {
          rawPieces.push(twoChar);
          i += 2;
          continue;
        }
      }
      rawPieces.push(kanaWord[i]);
      i += 1;
    }

    // Khởi tạo danh sách options cơ bản cho từng mảnh Kana
    const optionsList: string[][] = rawPieces.map((piece) => {
      const mapped = BASE_ROMAJI_MAP[piece];
      return mapped ? [...mapped] : [piece];
    });

    // Xử lý Trường âm 'ー' (cho phép gõ nguyên âm của âm tiết liền trước HOẶC dấu '-')
    for (let idx = 0; idx < rawPieces.length; idx++) {
      if (rawPieces[idx] === 'ー' && idx > 0) {
        const prevPrimary = optionsList[idx - 1][0] || '';
        const lastVowel = extractLastVowel(prevPrimary);
        if (lastVowel) {
          // Cho phép cả nguyên âm (VD: supiido) lẫn dấu '-' (VD: supi-do)
          optionsList[idx] = [lastVowel, '-'];
        } else {
          optionsList[idx] = ['-'];
        }
      }
    }

    // Xử lý Âm ngắt 'っ' / 'ッ' (Sokuon) và Âm mũi 'ん' / 'ン' từ phải sang trái
    for (let idx = rawPieces.length - 1; idx >= 0; idx--) {
      const piece = rawPieces[idx];
      const nextOptions = idx + 1 < rawPieces.length ? optionsList[idx + 1] : null;

      if ((piece === 'っ' || piece === 'ッ') && nextOptions) {
        // Lấy tất cả phụ âm đầu tiên của âm tiết kế tiếp
        const consonants = new Set<string>();
        for (const nextOpt of nextOptions) {
          const firstChar = nextOpt[0];
          if (firstChar && !'aiueon'.includes(firstChar)) {
            consonants.add(firstChar);
          }
        }
        const sokuonOpts = Array.from(consonants);
        // Thêm fallback xtu / ltu
        sokuonOpts.push('xtu', 'ltu');
        optionsList[idx] = sokuonOpts;
      } else if (piece === 'ん' || piece === 'ン') {
        if (!nextOptions) {
          // Đứng cuối từ: chấp nhận 'n' (1 phím là xong từ) hoặc 'nn'
          optionsList[idx] = ['n', 'nn', 'xn'];
        } else {
          // Kiểm tra xem âm tiết kế tiếp có bắt đầu bằng nguyên âm, 'y' hoặc 'n' không
          const nextStartsWithVowelOrYN = nextOptions.some((opt) =>
            VOWELS_AND_Y_N.has(opt[0])
          );
          if (nextStartsWithVowelOrYN) {
            // Bắt buộc 'nn' hoặc 'xn' để tránh nhập nhằng (VD: しんい -> shinni)
            optionsList[idx] = ['nn', 'xn'];
          } else {
            // Đứng trước phụ âm (VD: けんどう -> kendou): chỉ cần 'n' (và hỗ trợ hấp thụ 'nn' ở handleKey)
            optionsList[idx] = ['n', 'nn', 'xn'];
          }
        }
      }
    }

    return rawPieces.map((piece, idx) => {
      const opts = optionsList[idx];
      return {
        kana: piece,
        options: opts,
        typed: '',
        completed: false,
        chosenOption: opts[0],
      };
    });
  }
}

