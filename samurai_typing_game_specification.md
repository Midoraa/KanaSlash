# DỰ ÁN: KANA SLASH (侍タイピング) - ZTYPE SAMURAI EDITION

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
**Kana Slash** là tựa game hành động phản xạ gõ phím (Action Typing Shoot-'em-up) lấy cảm hứng từ *ZType*, kết hợp phong cách kiếm đạo Samurai và hệ thống chữ viết tiếng Nhật (Hiragana, Katakana, Kanji). 
- **Mục tiêu cốt lõi:** Đạt tốc độ khung hình **60 FPS** ổn định, phản hồi bàn phím độ trễ bằng 0 (Zero-latency input), và đồ họa **Procedural Neon/Cyber-Samurai VFX** rực rỡ mà không phụ thuộc vào tài nguyên hình ảnh bên ngoài (External Sprite Assets).
- **Cơ chế chiến đấu:** Người chơi điều khiển một Samurai đứng ở cạnh dưới màn hình. Kẻ địch (Yokai, Ninja, Vũ sĩ giáp sắt) mang theo từ vựng tiếng Nhật liên tục tràn xuống từ phía trên. Mỗi âm tiết gõ đúng sẽ phóng ra một luồng kiếm khí (Air Slash) hoặc phi kiếm Katana; gõ hoàn tất từ sẽ kích hoạt nhát chém kết liễu (Iaijutsu) làm kẻ địch nổ tung thành các hạt ánh sáng.

---

## 2. KIẾN TRÚC CÔNG NGHỆ (TECH STACK)
AI Agent cần khởi tạo dự án với cấu trúc gọn nhẹ, hiệu năng cao:
- **Bundler & Language:** Vite + TypeScript (Vanilla TS hoặc kết hợp nhẹ với UI HTML/CSS phủ trên Canvas).
- **Rendering Engine:** **HTML5 Canvas 2D API** (tối ưu hóa `globalCompositeOperation = 'lighter'` để tạo hiệu ứng phát sáng Neon/Bloom giống ZType) hoặc **PixiJS v8**.
- **Audio Engine:** **Web Audio API (Procedural Sound Synthesizer)** — Tự tổng hợp âm thanh tiếng chém kiếm, tiếng kim loại va chạm (`KENG`), tiếng nổ và tiếng gõ phím bằng thuật toán (Oscillator + GainNode + White Noise) để game có âm thanh sống động ngay lập tức mà không cần tải file `.mp3`/`.wav`.
- **Japanese Fonts:** Nhúng Google Fonts (`Noto Sans JP` và `Zen Old Mincho` hoặc `Dela Gothic One`) để hiển thị chữ Nhật sắc nét, đậm chất thư pháp/hiện đại.

---

## 3. HỆ THỐNG 5 CHẾ ĐỘ CHƠI (GAME MODES)
Màn hình Menu chính cho phép người chơi chọn 1 trong 5 chế độ trước khi vào trận:

1. **Level 1: Đạo Trường Hiragana (Hiragana Only)**
   - Chỉ xuất hiện từ vựng hiển thị bằng chữ **Hiragana** (`さくら`, `かたな`, `しのび`).
   - Tốc độ quái di chuyển chậm, quỹ đạo đi thẳng.
2. **Level 2: Ám Khí Katakana (Katakana Only)**
   - Chỉ xuất hiện từ vựng ngoại lai hoặc từ tượng thanh bằng **Katakana** (`サムライ`, `スピード`, `ドラゴン`).
   - Quái vật là Ninja/Ám khí có quỹ đạo bay hơi lượn sóng (Sine-wave movement) hoặc lao nhanh.
3. **Level 3: Song Kiếm Loạn Vũ (Hiragana + Katakana Mix)**
   - Kết hợp ngẫu nhiên cả Hiragana và Katakana. Ép não bộ người chơi phải chuyển đổi phản xạ nhận diện nét chữ mềm và nét chữ cứng liên tục.
4. **Level 4: Thiết Giáp Hán Tự (Kanji Armor Mode)**
   - Kẻ địch là Samurai Thiết Giáp. Trên đầu **chỉ hiển thị chữ Kanji** (ví dụ: `刀`, `火炎`, `雷鳴`) kèm nghĩa tiếng Việt/Anh nhỏ bên dưới. Chữ Hiragana bị ẩn đi.
   - **Cơ chế Phá Giáp (Armor Break - Phím `Tab` hoặc `Space`):** Nếu người chơi không nhớ cách đọc chữ Kanji của mục tiêu đang khóa (hoặc mục tiêu gần nhất), bấm `Tab` sẽ tung nhát chém phá giáp: làm nứt hiệu ứng khiên và **hiển thị phiên âm Hiragana (Furigana)** lên đầu quái, nhưng bị trừ 50% điểm thưởng của con quái đó và reset chuỗi Combo.
5. **Level 5: Bách Quỷ Dạ Hành (All-In Endless Chaos)**
   - Trộn lẫn cả 3 loại (Hiragana, Katakana, Kanji) cùng lúc.
   - Có sự xuất hiện của **Boss** sau mỗi 5 Wave (Boss bắn ra các "mũi tên ký tự đơn" bay nhanh buộc người chơi phải gõ chặn đòn - *Parry*).

---

## 4. THUẬT TOÁN XỬ LÝ BỘ GÕ ROMAJI LINH HOẠT (FLEXIBLE ROMAJI PARSER)
**Yêu cầu tối quan trọng:** Người chơi dùng bàn phím tiếng Anh thông thường (QWERTY), **KHÔNG** cần bật bộ gõ IME của hệ điều hành. Hệ thống phải tự động phân tích chuỗi ký tự và chấp nhận nhiều kiểu gõ Romaji (Hepburn, Kunrei-shiki, Nihon-shiki) cho cùng một âm tiết tiếng Nhật.

### 4.1. Bảng ánh xạ đa phương thức (Multi-mapping Kana Table)
Mỗi âm tiết Kana phải được map với một mảng các cách gõ hợp lệ:
- `し`: `["shi", "si"]`
- `ち`: `["chi", "ti"]`
- `つ`: `["tsu", "tu"]`
- `ふ`: `["fu", "hu"]`
- `じ`: `["ji", "zi"]`
- `ぢ`: `["ji", "di"]`
- `づ`: `["zu", "du"]`
- `しゃ`: `["sha", "sya"]`, `しゅ`: `["shu", "syu"]`, `しょ`: `["sho", "syo"]`
- `ちゃ`: `["cha", "tya"]`, `ちゅ`: `["chu", "tyu"]`, `ちょ`: `["cho", "tyo"]`
- `じゃ`: `["ja", "zya", "jya"]`, `じゅ`: `["ju", "zyu", "jyu"]`, `じょ`: `["jo", "zyo", "jyo"]`
- Âm ngắt `っ` / `ッ` (Sokuon): Tự động nhận diện bằng cách **lặp lại phụ âm đầu của âm tiết kế tiếp** (ví dụ: `かった` -> `katta`, `にっぽん` -> `nippon`).
- Âm mũi `ん` / `ン` (N): Chấp nhận `n` hoặc `nn` (nếu đứng trước nguyên âm hoặc chữ `y`, bắt buộc hoặc ưu tiên tách rõ để không bị nhầm, nhưng nếu đứng trước phụ âm như `k`, `t`, `s` thì chỉ cần gõ 1 chữ `n` là tự nhảy sang âm tiết tiếp theo, ví dụ `けん` + `ど` trong `けんどう` chỉ cần gõ `kendou`).

### 4.2. Cơ chế Khóa Mục Tiêu (ZType Target Locking)
- **Chưa khóa mục tiêu (`lockedTarget = null`):** Khi người chơi gõ 1 phím chữ cái (ví dụ phím `k`), hệ thống quét toàn bộ kẻ địch trên màn hình. Con quái nào có âm tiết đầu tiên bắt đầu bằng chữ `k` và **đang ở gần Samurai nhất (Y cao nhất)** sẽ lập tức bị khóa (`lockedTarget`).
- **Đã khóa mục tiêu (`lockedTarget !== null`):** Mọi phím gõ tiếp theo chỉ áp dụng cho con quái đang bị khóa cho đến khi nó bị tiêu diệt hoàn toàn.
- **Đổi / Hủy mục tiêu:** Bấm `Backspace` hoặc `Escape` để hủy khóa mục tiêu hiện tại nếu lỡ khóa nhầm con ở xa trong khi có mũi tên/quái nhanh đang áp sát.

---

## 5. ĐỒ HỌA THUẬT TOÁN & HIỆU ỨNG "GAME FEEL" (PROCEDURAL VFX & JUICE)
Để đạt chất lượng thị giác mượt mà và cuốn hút như *ZType*, Agent phải cài đặt đầy đủ các lớp hiệu ứng Canvas sau:

1. **Tông màu & Ánh sáng (Cyber-Edo Palette):**
   - Nền (Background): Xanh đen thẫm (`#070913`) với lưới tọa độ mờ hoặc các cánh hoa anh đào/tàn lửa trôi nhẹ từ trên xuống (Parallax background particles).
   - Kẻ địch thường: Vòng tròn/Đa giác hình học sắc cạnh phát sáng màu Đỏ Hồng (`#ff2a6d`) hoặc Tím Neon (`#b537f2`).
   - Kẻ địch đang bị khóa (Locked Target): Đổi sang khung ngắm xoay tròn màu Vàng Rực (`#f9f871`) hoặc Xanh Cyan (`#05d5fa`), có **tia chỉ đỏ (Laser Sightline)** nối từ thanh kiếm của Samurai thẳng tới tâm con quái.
2. **Hiển thị Text trên đầu Quái (Dynamic Typography HUD):**
   - Khung chữ nổi rõ ràng ngay dưới hoặc trên thân quái.
   - **Dòng chính:** Chữ Nhật (Hira/Kata/Kanji) cỡ lớn, có viền tối để nổi bật tuyệt đối. Các âm tiết đã gõ xong chuyển sang màu Xám mờ hoặc Xanh lá phát sáng; âm tiết đang gõ dở sáng rực màu Vàng.
   - **Dòng phụ (Romaji Guide):** Hiển thị chuỗi Romaji động bên dưới. Ví dụ với chữ `しのび`: ban đầu hiện `shinobi`. Nếu người chơi gõ chữ `s` rồi gõ tiếp chữ `i` (kiểu Kunrei `si`), dòng gợi ý tự động cập nhật linh hoạt thành `sinobi` để khớp với luồng tay của người chơi!
   - *(Ở chế độ Kanji Level 4, dòng phụ Romaji và Furigana sẽ ẩn đi, chỉ hiện nghĩa tiếng Việt/Anh như `"Thanh kiếm"`, trừ khi người chơi bấm `Tab` phá giáp).*
3. **Hiệu ứng Phóng Kiếm & Trảm Kích (Katana Projectile & Slash VFX):**
   - Mỗi khi gõ xong 1 ký tự Romaji: Một tia lửa kiếm bắn nhanh từ Samurai tới mục tiêu, đẩy lùi (Knockback) con quái ngược lên trên một khoảng nhỏ (`y -= 4px`), tạo cảm giác kìm chân kẻ địch như súng máy trong ZType.
   - Khi gõ xong chữ cái cuối cùng của từ: Một **vệt chém cong bán nguyệt (Crescent Blade Slash)** cắt ngang người con quái kèm hiệu ứng **Hit-stop** (hạt nổ bung ra 30–40 mảnh vỡ phát sáng, màn hình rung nhẹ `Screen-shake` biên độ 4px trong 100ms).
4. **Cơ chế Tuyệt Kỹ "Thu Kiếm - Iaijutsu" (Thanh Nộ / Combo Meter):**
   - Gõ đúng liên tiếp không sai phím nào sẽ làm tăng hệ số nhân Combo (`x1.0` -> `x5.0`) và tích đầy thanh **Kiếm Ý (Blade Fury - 100%)**.
   - Khi đầy 100%, người chơi bấm phím `Space` (hoặc gõ từ khóa `斬 - ZAN` hiện giữa màn hình) để kích hoạt **Nhất Đao Lưỡng Đoạn**: Toàn bộ màn hình lóe trắng-đen trong 0.2 giây, hàng chục đường chỉ kiếm cắt chéo toàn màn hình, tiêu diệt tức khắc mọi kẻ địch hiện có.

---

## 6. CẤU TRÚC KHO TỪ VỰNG MẪU (INITIAL WORD POOL)
Hệ thống cần tích hợp sẵn tối thiểu **80 - 100 từ vựng** chia theo độ dài (từ 1 âm tiết đến 5 âm tiết) để phân bổ theo độ khó của Wave:

```typescript
export interface WordEntry {
  kana: string;       // Dùng cho Hira / Kata
  kanji?: string;     // Dùng cho chế độ Kanji
  meaning: string;    // Nghĩa tiếng Việt hiển thị phụ
  category: 'hira' | 'kata';
  difficulty: 1 | 2 | 3; // 1: Ngắn (2-3 âm), 2: Trung bình (3-4 âm), 3: Dài/Khó (4-6 âm)
}
```
- **Ví dụ nhóm Hiragana/Kanji:**
  - Ngắn: `かたな` (刀 - Thanh kiếm), `さくら` (桜 - Hoa anh đào), `かぜ` (風 - Gió), `やみ` (闇 - Bóng tối), `ほのお` (炎 - Ngọn lửa), `みず` (水 - Nước), `かみ` (神 - Thần), `おに` (鬼 - Quỷ).
  - Trung bình: `さむらい` (侍 - Võ sĩ), `しのび` (忍び - Ninja), `かみなり` (雷 - Sấm sét), `つばめ` (燕 - Chim én), `あかつき` (暁 - Bình minh), `しゅりけん` (手裏剣 - Phi tiêu).
  - Dài / Boss: `けんじゅつ` (剣術 - Kiếm thuật), `いあいぎり` (居合斬り - Bạt đao thuật), `ひっさつわざ` (必殺技 - Tuyệt kỹ tất sát), `かげぶんしん` (影分身 - Ảnh phân thân).
- **Ví dụ nhóm Katakana:**
  - Ngắn: `ケン` (Kiếm), `パス` (Pass), `ボス` (Boss), `ギア` (Gear), `ゼロ` (Zero).
  - Trung bình: `サムライ` (Samurai), `ニンジャ` (Ninja), `カタナ` (Katana), `スピード` (Speed), `ドラゴン` (Dragon), `レーザー` (Laser), `シールド` (Shield).
  - Dài / Boss: `エクスカリバー` (Excalibur), `バーサーカー` (Berserker), `アルティメット` (Ultimate), `サイバーパンク` (Cyberpunk).

---

## 7. CẤU TRÚC THƯ MỤC ĐỀ XUẤT CHO AGENT (DIRECTORY STRUCTURE)
```text
/src
  ├── main.ts                 # Entry point, khởi tạo Game Loop và quản lý UI Events
  ├── style.css               # Giao diện Cyberpunk/Samurai HUD, Menu chọn 5 Level
  ├── core/
  │   ├── Game.ts             # Vòng lặp chính (Update/Render 60FPS), quản lý Wave & State
  │   ├── RomajiEngine.ts     # Bộ phân tích cú pháp Kana -> Multi-Romaji & kiểm tra phím gõ
  │   └── SoundFX.ts          # Web Audio API Synthesizer (tiếng chém, tiếng nổ, tiếng phá giáp)
  ├── entities/
  │   ├── Samurai.ts          # Nhân vật chính ở đáy màn hình, hiệu ứng rút kiếm & Laser Sight
  │   ├── Enemy.ts            # Quái vật, logic di chuyển, vẽ khung chữ Hira/Kata/Kanji & Giáp
  │   ├── Projectile.ts       # Phi kiếm / Kiếm khí bay từ Samurai tới Enemy
  │   └── ParticleSystem.ts   # Hạt nổ, vệt chém bán nguyệt (Slash Trail), hoa anh đào rơi
  └── data/
      └── dictionary.ts       # Kho từ vựng tiếng Nhật phân loại sẵn (Hira, Kata, Kanji)
```

---

## 8. QUY TRÌNH KIỂM THỬ TỰ ĐỘNG CHO ANTIGRAVITY AGENT (VERIFICATION PLAN)
Sau khi viết code xong, AI Agent trong Antigravity cần thực hiện các bước kiểm thử sau:
1. Chạy lệnh `npm install` và `npm run dev` để bật Local Server.
2. Mở trình duyệt tích hợp (`/browser`), kiểm tra không có bất kỳ lỗi Console hoặc lỗi biên dịch TypeScript nào.
3. Kiểm tra giao diện Menu: Đảm bảo cả **5 nút chọn Chế độ chơi (Hiragana, Katakana, Hira+Kata, Kanji, Hỗn hợp)** đều hoạt động và lọc đúng loại chữ khi bắt đầu Wave 1.
4. Giả lập sự kiện `keydown` trên trình duyệt:
   - Thử gõ cả `shi` và `si` cho chữ `し` để xác nhận `RomajiEngine` hoạt động linh hoạt.
   - Ở chế độ **Kanji (Level 4)**, thử nhấn phím `Tab` để kiểm tra tính năng **Phá Giáp (Armor Break)** có làm hiện chữ Hiragana (Furigana) lên đầu quái hay không.
   - Kiểm tra hiệu ứng hạt nổ, vệt kiếm chém và âm thanh Web Audio API khi tiêu diệt kẻ địch.