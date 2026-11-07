export interface WordEntry {
  kana: string;       // Dùng cho Hira / Kata
  kanji?: string;     // Dùng cho chế độ Kanji
  meaning: string;    // Nghĩa tiếng Việt hiển thị phụ
  category: 'hira' | 'kata';
  difficulty: 1 | 2 | 3; // 1: Ngắn (2-3 âm), 2: Trung bình (3-4 âm), 3: Dài/Khó (4-6 âm)
}

export const WORD_POOL: WordEntry[] = [
  // =========================================================
  // HIRAGANA / KANJI - DIFFICULTY 1 (Ngắn: 2-3 âm)
  // =========================================================
  { kana: 'かたな', kanji: '刀', meaning: 'Thanh kiếm', category: 'hira', difficulty: 1 },
  { kana: 'さくら', kanji: '桜', meaning: 'Hoa anh đào', category: 'hira', difficulty: 1 },
  { kana: 'かぜ', kanji: '風', meaning: 'Cơn gió', category: 'hira', difficulty: 1 },
  { kana: 'やみ', kanji: '闇', meaning: 'Bóng tối', category: 'hira', difficulty: 1 },
  { kana: 'ほのお', kanji: '炎', meaning: 'Ngọn lửa', category: 'hira', difficulty: 1 },
  { kana: 'みず', kanji: '水', meaning: 'Nước', category: 'hira', difficulty: 1 },
  { kana: 'かみ', kanji: '神', meaning: 'Thần linh', category: 'hira', difficulty: 1 },
  { kana: 'おに', kanji: '鬼', meaning: 'Quỷ Oni', category: 'hira', difficulty: 1 },
  { kana: 'つき', kanji: '月', meaning: 'Mặt trăng', category: 'hira', difficulty: 1 },
  { kana: 'ゆき', kanji: '雪', meaning: 'Tuyết trắng', category: 'hira', difficulty: 1 },
  { kana: 'そら', kanji: '空', meaning: 'Bầu trời', category: 'hira', difficulty: 1 },
  { kana: 'ほし', kanji: '星', meaning: 'Ngôi sao', category: 'hira', difficulty: 1 },
  { kana: 'あめ', kanji: '雨', meaning: 'Cơn mưa', category: 'hira', difficulty: 1 },
  { kana: 'くも', kanji: '雲', meaning: 'Đám mây', category: 'hira', difficulty: 1 },
  { kana: 'やま', kanji: '山', meaning: 'Ngọn núi', category: 'hira', difficulty: 1 },
  { kana: 'かわ', kanji: '川', meaning: 'Dòng sông', category: 'hira', difficulty: 1 },
  { kana: 'うみ', kanji: '海', meaning: 'Biển cả', category: 'hira', difficulty: 1 },
  { kana: 'もり', kanji: '森', meaning: 'Khu rừng', category: 'hira', difficulty: 1 },
  { kana: 'はな', kanji: '花', meaning: 'Bông hoa', category: 'hira', difficulty: 1 },
  { kana: 'とり', kanji: '鳥', meaning: 'Cánh chim', category: 'hira', difficulty: 1 },
  { kana: 'とら', kanji: '虎', meaning: 'Mãnh hổ', category: 'hira', difficulty: 1 },
  { kana: 'たか', kanji: '鷹', meaning: 'Chim ưng', category: 'hira', difficulty: 1 },
  { kana: 'きつね', kanji: '狐', meaning: 'Hồ ly', category: 'hira', difficulty: 1 },
  { kana: 'かぶと', kanji: '兜', meaning: 'Mũ giáp', category: 'hira', difficulty: 1 },
  { kana: 'よろい', kanji: '鎧', meaning: 'Áo giáp', category: 'hira', difficulty: 1 },
  { kana: 'やいば', kanji: '刃', meaning: 'Lưỡi đao', category: 'hira', difficulty: 1 },
  { kana: 'こころ', kanji: '心', meaning: 'Tâm trí', category: 'hira', difficulty: 1 },
  { kana: 'ちから', kanji: '力', meaning: 'Sức mạnh', category: 'hira', difficulty: 1 },
  { kana: 'ひかり', kanji: '光', meaning: 'Ánh sáng', category: 'hira', difficulty: 1 },
  { kana: 'いのち', kanji: '命', meaning: 'Sinh mệnh', category: 'hira', difficulty: 1 },

  // =========================================================
  // HIRAGANA / KANJI - DIFFICULTY 2 (Trung bình: 3-4 âm)
  // =========================================================
  { kana: 'さむらい', kanji: '侍', meaning: 'Võ sĩ Samurai', category: 'hira', difficulty: 2 },
  { kana: 'しのび', kanji: '忍び', meaning: 'Ninja ẩn thân', category: 'hira', difficulty: 2 },
  { kana: 'かみなり', kanji: '雷', meaning: 'Sấm sét', category: 'hira', difficulty: 2 },
  { kana: 'つばめ', kanji: '燕', meaning: 'Chim én', category: 'hira', difficulty: 2 },
  { kana: 'あかつき', kanji: '暁', meaning: 'Bình minh đỏ', category: 'hira', difficulty: 2 },
  { kana: 'しゅりけん', kanji: '手裏剣', meaning: 'Phi tiêu', category: 'hira', difficulty: 2 },
  { kana: 'ぶしどう', kanji: '武士道', meaning: 'Võ sĩ đạo', category: 'hira', difficulty: 2 },
  { kana: 'らいめい', kanji: '雷鳴', meaning: 'Tiếng sấm rền', category: 'hira', difficulty: 2 },
  { kana: 'かえん', kanji: '火炎', meaning: 'Hỏa diệm', category: 'hira', difficulty: 2 },
  { kana: 'しっぷう', kanji: '疾風', meaning: 'Cuồng phong', category: 'hira', difficulty: 2 },
  { kana: 'げっこう', kanji: '月光', meaning: 'Ánh trăng', category: 'hira', difficulty: 2 },
  { kana: 'せんこう', kanji: '閃光', meaning: 'Tia chớp lóe', category: 'hira', difficulty: 2 },
  { kana: 'ざんげき', kanji: '斬撃', meaning: 'Đòn trảm kích', category: 'hira', difficulty: 2 },
  { kana: 'めいとう', kanji: '名刀', meaning: 'Danh đao', category: 'hira', difficulty: 2 },
  { kana: 'ようかい', kanji: '妖怪', meaning: 'Yêu quái', category: 'hira', difficulty: 2 },
  { kana: 'おおかみ', kanji: '狼', meaning: 'Sói hoang', category: 'hira', difficulty: 2 },
  { kana: 'くれない', kanji: '紅', meaning: 'Sắc đỏ thẫm', category: 'hira', difficulty: 2 },
  { kana: 'まぼろし', kanji: '幻', meaning: 'Ảo ảnh', category: 'hira', difficulty: 2 },
  { kana: 'たましい', kanji: '魂', meaning: 'Linh hồn', category: 'hira', difficulty: 2 },
  { kana: 'にっぽん', kanji: '日本', meaning: 'Nhật Bản', category: 'hira', difficulty: 2 },
  { kana: 'しょうぐん', kanji: '将軍', meaning: 'Tướng quân', category: 'hira', difficulty: 2 },
  { kana: 'けんどう', kanji: '剣道', meaning: 'Kiếm đạo', category: 'hira', difficulty: 2 },
  { kana: 'しんげん', kanji: '神剣', meaning: 'Thần kiếm', category: 'hira', difficulty: 2 },

  // =========================================================
  // HIRAGANA / KANJI - DIFFICULTY 3 (Dài / Boss: 4-6 âm)
  // =========================================================
  { kana: 'けんじゅつ', kanji: '剣術', meaning: 'Kiếm thuật', category: 'hira', difficulty: 3 },
  { kana: 'いあいぎり', kanji: '居合斬り', meaning: 'Bạt đao thuật', category: 'hira', difficulty: 3 },
  { kana: 'ひっさつわざ', kanji: '必殺技', meaning: 'Tuyệt kỹ tất sát', category: 'hira', difficulty: 3 },
  { kana: 'かげぶんしん', kanji: '影分身', meaning: 'Ảnh phân thân', category: 'hira', difficulty: 3 },
  { kana: 'てんかむそう', kanji: '天下無双', meaning: 'Thiên hạ vô song', category: 'hira', difficulty: 3 },
  { kana: 'いっとうりょうだん', kanji: '一刀両断', meaning: 'Nhất đao lưỡng đoạn', category: 'hira', difficulty: 3 },
  { kana: 'ひゃっきやこう', kanji: '百鬼夜行', meaning: 'Bách quỷ dạ hành', category: 'hira', difficulty: 3 },
  { kana: 'しんらばんしょう', kanji: '森羅万象', meaning: 'Sâm la vạn tượng', category: 'hira', difficulty: 3 },
  { kana: 'ふうりんかざん', kanji: '風林火山', meaning: 'Phong Lâm Hỏa Sơn', category: 'hira', difficulty: 3 },
  { kana: 'めいきょうしすい', kanji: '明鏡止水', meaning: 'Minh kính chỉ thủy', category: 'hira', difficulty: 3 },
  { kana: 'でんこうせっか', kanji: '電光石火', meaning: 'Điện quang thạch hỏa', category: 'hira', difficulty: 3 },
  { kana: 'りゅうじんまる', kanji: '龍神丸', meaning: 'Long Thần Kiếm', category: 'hira', difficulty: 3 },

  // =========================================================
  // KATAKANA - DIFFICULTY 1 (Ngắn: 2-3 âm)
  // =========================================================
  { kana: 'ケン', meaning: 'Kiếm (Ken)', category: 'kata', difficulty: 1 },
  { kana: 'パス', meaning: 'Vượt qua (Pass)', category: 'kata', difficulty: 1 },
  { kana: 'ボス', meaning: 'Trùm (Boss)', category: 'kata', difficulty: 1 },
  { kana: 'ギア', meaning: 'Bánh răng (Gear)', category: 'kata', difficulty: 1 },
  { kana: 'ゼロ', meaning: 'Con số không (Zero)', category: 'kata', difficulty: 1 },
  { kana: 'ネオン', meaning: 'Ánh đèn Neon', category: 'kata', difficulty: 1 },
  { kana: 'ソード', meaning: 'Thanh gươm (Sword)', category: 'kata', difficulty: 1 },
  { kana: 'キラー', meaning: 'Sát thủ (Killer)', category: 'kata', difficulty: 1 },
  { kana: 'オーラ', meaning: 'Hào quang (Aura)', category: 'kata', difficulty: 1 },
  { kana: 'パルス', meaning: 'Xung nhịp (Pulse)', category: 'kata', difficulty: 1 },
  { kana: 'コンボ', meaning: 'Chuỗi đòn (Combo)', category: 'kata', difficulty: 1 },
  { kana: 'エッジ', meaning: 'Lưỡi sắc (Edge)', category: 'kata', difficulty: 1 },
  { kana: 'ノヴァ', meaning: 'Tân tinh (Nova)', category: 'kata', difficulty: 1 },
  { kana: 'レイジ', meaning: 'Cuồng nộ (Rage)', category: 'kata', difficulty: 1 },
  { kana: 'ソウル', meaning: 'Linh hồn (Soul)', category: 'kata', difficulty: 1 },

  // =========================================================
  // KATAKANA - DIFFICULTY 2 (Trung bình: 3-4 âm)
  // =========================================================
  { kana: 'サムライ', meaning: 'Samurai', category: 'kata', difficulty: 2 },
  { kana: 'ニンジャ', meaning: 'Ninja', category: 'kata', difficulty: 2 },
  { kana: 'カタナ', meaning: 'Đao Katana', category: 'kata', difficulty: 2 },
  { kana: 'スピード', meaning: 'Tốc độ (Speed)', category: 'kata', difficulty: 2 },
  { kana: 'ドラゴン', meaning: 'Rồng (Dragon)', category: 'kata', difficulty: 2 },
  { kana: 'レーザー', meaning: 'Tia Laser', category: 'kata', difficulty: 2 },
  { kana: 'シールド', meaning: 'Khiên chắn (Shield)', category: 'kata', difficulty: 2 },
  { kana: 'ブレード', meaning: 'Lưỡi kiếm (Blade)', category: 'kata', difficulty: 2 },
  { kana: 'シャドウ', meaning: 'Bóng ma (Shadow)', category: 'kata', difficulty: 2 },
  { kana: 'プラズマ', meaning: 'Năng lượng Plasma', category: 'kata', difficulty: 2 },
  { kana: 'サイボーグ', meaning: 'Chiến binh Cyborg', category: 'kata', difficulty: 2 },
  { kana: 'スナイパー', meaning: 'Xạ thủ (Sniper)', category: 'kata', difficulty: 2 },
  { kana: 'ストライク', meaning: 'Đòn công kích (Strike)', category: 'kata', difficulty: 2 },
  { kana: 'クリティカル', meaning: 'Chí mạng (Critical)', category: 'kata', difficulty: 2 },
  { kana: 'カウンター', meaning: 'Phản đòn (Counter)', category: 'kata', difficulty: 2 },
  { kana: 'トルネード', meaning: 'Lốc xoáy (Tornado)', category: 'kata', difficulty: 2 },
  { kana: 'イリュージョン', meaning: 'Ảo giác (Illusion)', category: 'kata', difficulty: 2 },

  // =========================================================
  // KATAKANA - DIFFICULTY 3 (Dài / Boss: 4-6 âm)
  // =========================================================
  { kana: 'エクスカリバー', meaning: 'Thánh kiếm Excalibur', category: 'kata', difficulty: 3 },
  { kana: 'バーサーカー', meaning: 'Cuồng chiến sĩ (Berserker)', category: 'kata', difficulty: 3 },
  { kana: 'アルティメット', meaning: 'Tối thượng (Ultimate)', category: 'kata', difficulty: 3 },
  { kana: 'サイバーパンク', meaning: 'Kỷ nguyên Cyberpunk', category: 'kata', difficulty: 3 },
  { kana: 'オーバードライブ', meaning: 'Quá tải (Overdrive)', category: 'kata', difficulty: 3 },
  { kana: 'ライトニング', meaning: 'Tia chớp (Lightning)', category: 'kata', difficulty: 3 },
  { kana: 'カタストロフィ', meaning: 'Đại thảm họa (Catastrophe)', category: 'kata', difficulty: 3 },
  { kana: 'インフィニティ', meaning: 'Vô cực (Infinity)', category: 'kata', difficulty: 3 },
  { kana: 'フェニックス', meaning: 'Phượng hoàng lửa (Phoenix)', category: 'kata', difficulty: 3 },
  { kana: 'アポカリプス', meaning: 'Khải huyền (Apocalypse)', category: 'kata', difficulty: 3 },
];

// Mũi tên ký tự đơn do Boss bắn ra (Parry Projectiles)
export const BOSS_PARRY_KANA: WordEntry[] = [
  { kana: 'し', kanji: '死', meaning: 'Parry!', category: 'hira', difficulty: 1 },
  { kana: 'ち', kanji: '血', meaning: 'Parry!', category: 'hira', difficulty: 1 },
  { kana: 'つ', kanji: '突', meaning: 'Parry!', category: 'hira', difficulty: 1 },
  { kana: 'ふ', kanji: '封', meaning: 'Parry!', category: 'hira', difficulty: 1 },
  { kana: 'か', kanji: '火', meaning: 'Parry!', category: 'hira', difficulty: 1 },
  { kana: 'き', kanji: '気', meaning: 'Parry!', category: 'hira', difficulty: 1 },
  { kana: 'く', kanji: '空', meaning: 'Parry!', category: 'hira', difficulty: 1 },
  { kana: 'さ', kanji: '斬', meaning: 'Parry!', category: 'hira', difficulty: 1 },
  { kana: 'タ', meaning: 'Parry!', category: 'kata', difficulty: 1 },
  { kana: 'シ', meaning: 'Parry!', category: 'kata', difficulty: 1 },
  { kana: 'チ', meaning: 'Parry!', category: 'kata', difficulty: 1 },
  { kana: 'ツ', meaning: 'Parry!', category: 'kata', difficulty: 1 },
  { kana: 'フ', meaning: 'Parry!', category: 'kata', difficulty: 1 },
  { kana: 'ラ', meaning: 'Parry!', category: 'kata', difficulty: 1 },
  { kana: 'ザン', kanji: '斬', meaning: 'Trảm!', category: 'kata', difficulty: 1 },
];
