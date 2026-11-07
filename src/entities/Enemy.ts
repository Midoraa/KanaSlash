import { WordEntry } from '../data/dictionary';
import { RomajiSequence } from '../core/RomajiEngine';

export type EnemyKind = 'yokai' | 'ninja' | 'armored' | 'boss' | 'parry_arrow';

export class Enemy {
  public id: number;
  public x: number;
  public y: number;
  public readonly baseX: number;
  public readonly speed: number;
  public readonly word: WordEntry;
  public readonly romaji: RomajiSequence;
  public readonly kind: EnemyKind;

  // Cơ chế Thiết Giáp Hán Tự (Level 4 & Level 5)
  public readonly hasKanjiArmor: boolean;
  public armorBroken = false;
  public scoreMultiplier = 1.0;

  // Chuyển động lượn cho Ninja / Yokai
  private readonly sinePhase: number;
  private readonly sineAmp: number;
  private readonly sineFreq: number;
  private timeAlive = 0;
  private rotAngle = 0;

  // Hiệu ứng giật lùi & chớp sáng khi trúng Kiếm Khí
  public hitFlash = 0;

  // Dành riêng cho Boss (bắn phi đao Kunai ký tự đơn)
  public bossArrowCooldown = 3.2;

  constructor(
    id: number,
    x: number,
    y: number,
    word: WordEntry,
    kind: EnemyKind,
    speed: number,
    hasKanjiArmor = false
  ) {
    this.id = id;
    this.x = x;
    this.baseX = x;
    this.y = y;
    this.word = word;
    this.romaji = new RomajiSequence(word.kana);
    this.kind = kind;
    this.speed = speed;
    this.hasKanjiArmor = hasKanjiArmor && Boolean(word.kanji);

    this.sinePhase = Math.random() * Math.PI * 2;
    this.sineAmp = kind === 'ninja' ? 38 + Math.random() * 26 : kind === 'yokai' ? 9 : 0;
    this.sineFreq = kind === 'ninja' ? 2.1 + Math.random() * 0.9 : 1.1;
  }

  /**
   * Đẩy lùi kẻ địch lên trên khi trúng Kiếm Khí
   */
  public applyKnockback(pixels = 4.5): void {
    this.y = Math.max(24, this.y - pixels);
    this.hitFlash = 0.12;
  }

  /**
   * Kích hoạt Phá Giáp (Armor Break - Phím Tab)
   * Hiển thị phiên âm Hiragana (Furigana) & Romaji, giảm 50% điểm thưởng của quái này.
   */
  public breakArmor(): boolean {
    if (!this.hasKanjiArmor || this.armorBroken) return false;
    this.armorBroken = true;
    this.scoreMultiplier = 0.5;
    this.hitFlash = 0.25;
    return true;
  }

  public update(dt: number, canvasWidth: number): void {
    this.timeAlive += dt;
    this.y += this.speed * dt;
    this.rotAngle += dt * (this.kind === 'ninja' ? 3.5 : 1.2);

    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt);
    }

    if (this.sineAmp > 0) {
      const nextX =
        this.baseX + Math.sin(this.timeAlive * this.sineFreq + this.sinePhase) * this.sineAmp;
      const margin = 95;
      this.x = Math.max(margin, Math.min(canvasWidth - margin, nextX));
    }

    if (this.kind === 'boss') {
      this.bossArrowCooldown -= dt;
    }
  }

  public render(ctx: CanvasRenderingContext2D, isLocked: boolean): void {
    ctx.save();

    // 1. Vẽ hình dáng Yokai / Ninja / Giáp Kabuto / Quỷ Vương Oni đậm chất Nhật Bản
    this.renderJapaneseSpiritBody(ctx, isLocked);

    // 2. Vẽ Bùa Giấy / Thẻ Gỗ Chữ Nhật (Ofuda / Ema HUD) trên đầu quái
    this.renderTypographyHUD(ctx, isLocked);

    ctx.restore();
  }

  private renderJapaneseSpiritBody(ctx: CanvasRenderingContext2D, isLocked: boolean): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    const radius =
      this.kind === 'boss'
        ? 34
        : this.kind === 'armored'
        ? 23
        : this.kind === 'parry_arrow'
        ? 14
        : 20;

    // Vòng Ấn Chú Chu Sa (Enso Target Seal) xoay quanh kẻ địch đang bị Samurai khóa mục tiêu
    if (isLocked) {
      ctx.save();
      ctx.rotate(this.rotAngle * 1.3);
      ctx.strokeStyle = '#e6b422';
      ctx.shadowColor = '#d9383a';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 11, 0, Math.PI * 1.75);
      ctx.stroke();

      // 4 dấu ấn bốn phương
      ctx.fillStyle = '#d9383a';
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * (radius + 11), Math.sin(a) * (radius + 11), 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (this.kind === 'parry_arrow') {
      // Phi đao Kunai Nhật Bản lao xuống
      ctx.save();
      ctx.rotate(Math.PI / 2);
      // Vòng tròn chuôi Kunai
      ctx.strokeStyle = '#e6b422';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-12, 0, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      // Lưỡi phi đao Kunai
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#e2e8f0';
      ctx.strokeStyle = '#d9383a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-2, -7);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-2, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (this.kind === 'ninja') {
      // Ám khí Shuriken 4 cánh cổ truyền bằng thép đen viền đỏ
      ctx.save();
      ctx.rotate(this.rotAngle);
      ctx.fillStyle = this.hitFlash > 0 ? '#fff5e4' : '#1e162b';
      ctx.strokeStyle = isLocked ? '#e6b422' : '#ff4d6d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? radius : radius * 0.36;
        const a = (i * Math.PI) / 4;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lỗ tròn đồng xu ở tâm Shuriken
      ctx.fillStyle = '#0f0a19';
      ctx.strokeStyle = '#e6b422';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (this.kind === 'armored') {
      // Mũ giáp Võ Sĩ Samurai Thiết Giáp (Kabuto có cặp sừng trăng khuyết vàng Maedate)
      ctx.save();
      // Tấm che cổ Shikoro hai bên
      ctx.fillStyle = '#2b1620';
      ctx.strokeStyle = '#d9383a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-radius, -2);
      ctx.lineTo(-radius - 5, 14);
      ctx.lineTo(radius + 5, 14);
      ctx.lineTo(radius, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vòm mũ sắt Kabuto
      ctx.fillStyle = this.hitFlash > 0 ? '#fff5e4' : '#1a1118';
      ctx.strokeStyle = '#e6b422';
      ctx.beginPath();
      ctx.arc(0, 2, radius * 0.85, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sừng trăng khuyết vàng kim (Kuwagata / Maedate) trên trán mũ Kabuto
      if (!this.armorBroken) {
        ctx.fillStyle = '#e6b422';
        ctx.shadowColor = '#e6b422';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, -10, 16, Math.PI * 0.15, Math.PI * 0.85, false);
        ctx.arc(0, -14, 15, Math.PI * 0.85, Math.PI * 0.15, true);
        ctx.closePath();
        ctx.fill();
      }

      // Đôi mắt phát sáng dưới mũ giáp
      ctx.fillStyle = this.armorBroken ? '#ff4d6d' : '#e6b422';
      ctx.fillRect(-8, 4, 5, 2.5);
      ctx.fillRect(3, 4, 5, 2.5);
      ctx.restore();
    } else if (this.kind === 'boss') {
      // Đại Quỷ Vương Oni (Mặt nạ Oni đỏ thẫm với 2 cặp sừng cong lớn & vòng lửa thần chú)
      ctx.save();
      // Vòng lửa phía sau lưng Boss
      ctx.strokeStyle = '#d9383a';
      ctx.shadowColor = '#d9383a';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      // 2 chiếc sừng Quỷ Oni màu vàng ngà
      ctx.fillStyle = '#f3d37a';
      ctx.strokeStyle = '#5c191b';
      ctx.lineWidth = 2;
      // Sừng trái
      ctx.beginPath();
      ctx.moveTo(-18, -14);
      ctx.quadraticCurveTo(-30, -34, -14, -42);
      ctx.quadraticCurveTo(-18, -26, -8, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Sừng phải
      ctx.beginPath();
      ctx.moveTo(18, -14);
      ctx.quadraticCurveTo(30, -34, 14, -42);
      ctx.quadraticCurveTo(18, -26, 8, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Khuôn mặt Quỷ Oni đỏ thẫm
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#9e1b22';
      ctx.strokeStyle = '#e6b422';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mắt vàng dữ tợn & nanh trắng
      ctx.fillStyle = '#f9f871';
      ctx.beginPath();
      ctx.arc(-9, -3, 4, 0, Math.PI * 2);
      ctx.arc(9, -3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Yokai Level 1: Đèn lồng ma Nhật Bản (Chochin-Obake) / Mặt nạ Hồ Ly - Tiểu Quỷ
      ctx.save();
      const bob = Math.sin(this.timeAlive * 4) * 2;
      ctx.translate(0, bob);

      // Nắp trên và đáy gỗ đen của đèn lồng Nhật
      ctx.fillStyle = '#1b0f18';
      ctx.fillRect(-9, -radius - 2, 18, 4);
      ctx.fillRect(-8, radius - 2, 16, 4);

      // Thân đèn lồng giấy đỏ rực
      const lanternGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, radius);
      lanternGrad.addColorStop(0, this.hitFlash > 0 ? '#ffffff' : '#ff8da1');
      lanternGrad.addColorStop(0.6, '#d9383a');
      lanternGrad.addColorStop(1, '#6e141e');
      ctx.fillStyle = lanternGrad;
      ctx.strokeStyle = isLocked ? '#e6b422' : '#ffb7c5';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.85, radius * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Các đường nan tre ngang trên đèn lồng
      ctx.strokeStyle = 'rgba(27, 15, 24, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.8, -6);
      ctx.lineTo(radius * 0.8, -6);
      ctx.moveTo(-radius * 0.8, 6);
      ctx.lineTo(radius * 0.8, 6);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Vẽ Bùa Giấy / Thẻ Gỗ Chữ Nhật (Ofuda / Ema Plaque) hiển thị từ vựng trên đầu quái
   */
  private renderTypographyHUD(ctx: CanvasRenderingContext2D, isLocked: boolean): void {
    const labelY = this.y - (this.kind === 'boss' ? 58 : 40);
    const { typedRomaji, remainingRomaji } = this.romaji.getDynamicRomajiParts();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const hidePhonetics = this.hasKanjiArmor && !this.armorBroken;

    const mainText = this.hasKanjiArmor && this.word.kanji ? this.word.kanji : this.word.kana;
    ctx.font = `900 22px "Noto Sans JP", sans-serif`;
    const mainWidth = ctx.measureText(mainText).width;
    const subWidth = Math.max(
      ctx.measureText(typedRomaji + remainingRomaji).width * 0.75,
      ctx.measureText(this.word.meaning).width * 0.65
    );
    const boxWidth = Math.max(mainWidth + 34, subWidth + 30, 98);
    const boxHeight = this.hasKanjiArmor && this.armorBroken ? 68 : 50;
    const boxX = this.x - boxWidth / 2;
    const boxY = labelY - boxHeight / 2;

    // Nền Thẻ Gỗ Sơn Mài Đen-Đỏ (Japanese Lacquer Plaque)
    ctx.fillStyle = isLocked ? 'rgba(32, 14, 24, 0.95)' : 'rgba(18, 10, 20, 0.88)';
    ctx.strokeStyle = isLocked
      ? '#e6b422'
      : hidePhonetics
      ? '#d97706'
      : 'rgba(217, 56, 58, 0.68)';
    ctx.lineWidth = isLocked ? 2.2 : 1.4;

    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
    ctx.fill();
    ctx.stroke();

    // Hoa văn góc thẻ bài Nhật Bản khi đang bị khóa
    if (isLocked) {
      ctx.fillStyle = '#d9383a';
      ctx.fillRect(boxX + 3, boxY + 3, 4, 4);
      ctx.fillRect(boxX + boxWidth - 7, boxY + 3, 4, 4);
    }

    if (hidePhonetics && this.word.kanji) {
      // ====================================================
      // CHẾ ĐỘ THIẾT GIÁP HÁN TỰ (CHƯA PHÁ GIÁP)
      // Chỉ hiển thị chữ Kanji + Nghĩa tiếng Việt bên dưới
      // ====================================================
      const progressRatio = this.romaji.activeTokenIndex / Math.max(1, this.romaji.tokens.length);

      ctx.font = `900 23px "Zen Old Mincho", "Noto Sans JP", serif`;
      ctx.strokeStyle = '#09040a';
      ctx.lineWidth = 4;
      ctx.strokeText(this.word.kanji, this.x, labelY - 8);

      ctx.fillStyle = progressRatio > 0 ? '#e6b422' : '#fff8e7';
      ctx.fillText(this.word.kanji, this.x, labelY - 8);

      ctx.font = `700 11.5px "Noto Sans JP", sans-serif`;
      ctx.fillStyle = isLocked ? '#e6b422' : '#f3d5b5';
      ctx.fillText(`⛩️ ${this.word.meaning}`, this.x, labelY + 13);
    } else {
      // ====================================================
      // CHẾ ĐỘ HIRAGANA / KATAKANA HOẶC ĐÃ PHÁ GIÁP KANJI
      // ====================================================
      const kanaY = labelY - 8;

      if (this.hasKanjiArmor && this.armorBroken && this.word.kanji) {
        // Furigana (Hiragana) hiển thị phía trên Kanji sau khi Phá Giáp
        this.renderColoredKanaTokens(ctx, this.x, labelY - 20, 14);

        ctx.font = `900 18px "Zen Old Mincho", "Noto Sans JP", serif`;
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(this.word.kanji, this.x, labelY - 1);

        this.renderDynamicRomajiLine(ctx, this.x, labelY + 18, typedRomaji, remainingRomaji);
      } else {
        this.renderColoredKanaTokens(ctx, this.x, kanaY, 20);
        this.renderDynamicRomajiLine(ctx, this.x, labelY + 13, typedRomaji, remainingRomaji);
      }
    }

    ctx.restore();
  }

  private renderColoredKanaTokens(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    y: number,
    fontSize: number
  ): void {
    ctx.font = `900 ${fontSize}px "Zen Old Mincho", "Noto Sans JP", serif`;
    const tokens = this.romaji.tokens;
    const widths = tokens.map((t) => ctx.measureText(t.kana).width);
    const totalWidth = widths.reduce((a, b) => a + b, 0);

    let currentX = centerX - totalWidth / 2;
    ctx.textAlign = 'left';

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      ctx.strokeStyle = '#09040a';
      ctx.lineWidth = 4;
      ctx.strokeText(token.kana, currentX, y);

      if (i < this.romaji.activeTokenIndex) {
        // Âm tiết đã chém xong -> Hồng Anh Đào / Ngọc bích sáng
        ctx.fillStyle = '#ff8da1';
      } else if (i === this.romaji.activeTokenIndex && token.typed.length > 0) {
        // Âm tiết đang gõ dở -> Vàng Hoàng Kim rực rỡ
        ctx.fillStyle = '#e6b422';
      } else {
        // Âm tiết chưa gõ -> Trắng ngà giấy Washi
        ctx.fillStyle = '#fff8e7';
      }

      ctx.fillText(token.kana, currentX, y);
      currentX += widths[i];
    }

    ctx.textAlign = 'center';
  }

  private renderDynamicRomajiLine(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    y: number,
    typedRomaji: string,
    remainingRomaji: string
  ): void {
    ctx.font = `700 13px "JetBrains Mono", monospace`;
    const typedW = ctx.measureText(typedRomaji).width;
    const remW = ctx.measureText(remainingRomaji).width;
    const totalW = typedW + remW;

    const startX = centerX - totalW / 2;
    ctx.textAlign = 'left';

    if (typedRomaji.length > 0) {
      ctx.fillStyle = '#e6b422';
      ctx.fillText(typedRomaji, startX, y);
    }

    ctx.fillStyle = '#d6c7b2';
    ctx.fillText(remainingRomaji, startX + typedW, y);

    ctx.textAlign = 'center';
  }
}
