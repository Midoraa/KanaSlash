export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  shape: 'petal_burst' | 'spark' | 'ring' | 'ink_drop';
}

export interface SakuraPetal {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  angle: number;
  spin: number;
  flipPhase: number;
  flipSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  color: string;
  alpha: number;
}

export interface CrescentSlash {
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface ScreenSlashLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  subText?: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export class ParticleSystem {
  private sparks: SparkParticle[] = [];
  private petals: SakuraPetal[] = [];
  private slashes: CrescentSlash[] = [];
  private screenSlashes: ScreenSlashLine[] = [];
  private floatingTexts: FloatingText[] = [];
  private windTime = 0;
  public iaijutsuFlashTimer = 0;

  constructor(width: number, height: number) {
    this.initPetals(width, height, 68);
  }

  /**
   * Khởi tạo các cánh hoa anh đào (Sakura) bay phảng phất trong gió đêm Nhật Bản
   */
  public initPetals(width: number, height: number, count = 68): void {
    this.petals = [];
    const sakuraColors = [
      '#ffb7c5', // Hồng phấn Sakura truyền thống
      '#ffc8d6', // Hồng nhạt phớt trắng
      '#ff9ebb', // Hồng đào
      '#ffe4ec', // Trắng hồng ánh trăng
      '#f48fb1', // Hồng thẫm cánh hoa
    ];
    for (let i = 0; i < count; i++) {
      this.petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: 16 + Math.random() * 26,
        vx: -28 - Math.random() * 22, // Gió thổi nhẹ từ phải qua trái
        size: 5 + Math.random() * 6.5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.8,
        flipPhase: Math.random() * Math.PI * 2,
        flipSpeed: 1.5 + Math.random() * 2.2,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.2 + Math.random() * 1.5,
        color: sakuraColors[Math.floor(Math.random() * sakuraColors.length)],
        alpha: 0.45 + Math.random() * 0.48,
      });
    }
  }

  /**
   * Khi tiêu diệt kẻ địch: Bùng nổ cánh hoa anh đào + vệt chém Katana bán nguyệt sắc lẹm
   */
  public spawnKillExplosion(
    x: number,
    y: number,
    primaryColor = '#ffb7c5',
    accentColor = '#e6b422'
  ): void {
    const count = 34;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const speed = 75 + Math.random() * 290;
      const isPetal = i % 2 === 0;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isPetal ? 5 + Math.random() * 5 : 3 + Math.random() * 4,
        color: isPetal
          ? i % 4 === 0
            ? '#ff4d6d'
            : '#ffb7c5'
          : i % 3 === 0
          ? accentColor
          : primaryColor,
        alpha: 1,
        decay: 1.2 + Math.random() * 1.1,
        rotation: angle,
        vRot: (Math.random() - 0.5) * 9,
        shape: isPetal ? 'petal_burst' : 'spark',
      });
    }

    // Vòng sóng kiếm khí lan tỏa
    this.sparks.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 14,
      color: '#fff5e4',
      alpha: 0.9,
      decay: 2.6,
      rotation: 0,
      vRot: 0,
      shape: 'ring',
    });

    // 2 Nhát chém Katana bán nguyệt cắt chéo mục tiêu
    const slashAngle = -0.55 + (Math.random() - 0.5) * 0.4;
    this.slashes.push({
      x,
      y,
      angle: slashAngle,
      radius: 74,
      color: '#fff8e7',
      life: 0.28,
      maxLife: 0.28,
    });
    this.slashes.push({
      x,
      y,
      angle: slashAngle + Math.PI * 0.55,
      radius: 58,
      color: '#ff4d6d',
      life: 0.22,
      maxLife: 0.22,
    });
  }

  /**
   * Hiệu ứng khi luồng Kiếm Khí chém trúng mục tiêu (Tia lửa thép + cánh hoa anh đào bung ra)
   */
  public spawnHitSparks(x: number, y: number, color = '#fff3d1'): void {
    // Vệt chém gió nhỏ cắt ngang thân quái
    this.slashes.push({
      x,
      y,
      angle: (Math.random() - 0.5) * 1.8,
      radius: 36 + Math.random() * 12,
      color: '#ffffff',
      life: 0.14,
      maxLife: 0.14,
    });

    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 55 + Math.random() * 145;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 3.5 + Math.random() * 3.5,
        color: i % 2 === 0 ? '#ffb7c5' : color,
        alpha: 1,
        decay: 2.8 + Math.random() * 1.2,
        rotation: angle,
        vRot: 7,
        shape: i % 2 === 0 ? 'petal_burst' : 'spark',
      });
    }
  }

  /**
   * Hiệu ứng vỡ giáp sắt Samurai (Armor Break)
   */
  public spawnArmorShatter(x: number, y: number): void {
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 230;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 5,
        color: i % 2 === 0 ? '#e6b422' : '#d9383a',
        alpha: 1,
        decay: 1.7 + Math.random(),
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 14,
        shape: 'spark',
      });
    }

    this.slashes.push({
      x,
      y,
      angle: -0.4,
      radius: 68,
      color: '#e6b422',
      life: 0.26,
      maxLife: 0.26,
    });
  }

  /**
   * Hiệu ứng Tuyệt Kỹ "Thu Kiếm - Iaijutsu" (Nhất Đao Lưỡng Đoạn)
   */
  public triggerIaijutsuSlashStorm(width: number, height: number): void {
    this.iaijutsuFlashTimer = 0.26;
    const colors = ['#fff8e7', '#ffb7c5', '#e6b422', '#d9383a'];
    for (let i = 0; i < 16; i++) {
      const fromLeft = i % 2 === 0;
      const x1 = fromLeft ? -60 : Math.random() * width;
      const y1 = fromLeft ? Math.random() * height : -60;
      const x2 = fromLeft ? width + 60 : Math.random() * width;
      const y2 = fromLeft ? Math.random() * height : height + 60;

      this.screenSlashes.push({
        x1,
        y1,
        x2,
        y2,
        color: colors[i % colors.length],
        width: 3.5 + Math.random() * 5.5,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.65,
      });
    }
  }

  public addFloatingText(
    x: number,
    y: number,
    text: string,
    color = '#e6b422',
    subText?: string,
    scale = 1
  ): void {
    this.floatingTexts.push({
      x,
      y,
      text,
      subText,
      color,
      life: 0.95,
      maxLife: 0.95,
      scale,
    });
  }

  public update(dt: number, width: number, height: number): void {
    this.windTime += dt;

    if (this.iaijutsuFlashTimer > 0) {
      this.iaijutsuFlashTimer = Math.max(0, this.iaijutsuFlashTimer - dt);
    }

    // Cập nhật chuyển động lượn lờ, xoay lật 3D của từng cánh hoa anh đào
    const globalWind = Math.sin(this.windTime * 0.7) * 18;
    for (const p of this.petals) {
      p.swayPhase += dt * p.swaySpeed;
      p.flipPhase += dt * p.flipSpeed;
      p.y += (p.vy + Math.cos(p.swayPhase) * 6) * dt;
      p.x += (p.vx + globalWind + Math.sin(p.swayPhase) * 24) * dt;
      p.angle += p.spin * dt;

      if (p.y > height + 24) {
        p.y = -18;
        p.x = Math.random() * (width + 180);
      }
      if (p.x < -30) {
        p.x = width + 25;
        p.y = Math.random() * height * 0.85;
      }
      if (p.x > width + 40) {
        p.x = -20;
      }
    }

    // Cập nhật hạt nổ & cánh hoa tung tóe
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      if (s.shape === 'ring') {
        s.size += dt * 240;
        s.alpha -= s.decay * dt;
      } else {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 0.93;
        s.vy = s.vy * 0.93 + 25 * dt; // Trọng lực nhẹ cho cánh hoa rơi
        s.rotation += s.vRot * dt;
        s.alpha -= s.decay * dt;
      }
      if (s.alpha <= 0) {
        this.sparks.splice(i, 1);
      }
    }

    // Cập nhật vệt kiếm bán nguyệt
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const sl = this.slashes[i];
      sl.life -= dt;
      sl.radius += dt * 110;
      if (sl.life <= 0) {
        this.slashes.splice(i, 1);
      }
    }

    // Cập nhật đường kiếm Iaijutsu toàn màn hình
    for (let i = this.screenSlashes.length - 1; i >= 0; i--) {
      const sc = this.screenSlashes[i];
      sc.life -= dt;
      if (sc.life <= 0) {
        this.screenSlashes.splice(i, 1);
      }
    }

    // Cập nhật chữ nổi
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 40 * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * Vẽ 1 cánh hoa anh đào Nhật Bản (có khía chữ V đặc trưng ở đầu cánh hoa)
   */
  private drawSakuraPetalShape(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.bezierCurveTo(-size * 0.9, size * 0.35, -size * 0.85, -size * 0.65, -size * 0.22, -size);
    ctx.lineTo(0, -size * 0.68); // Khía chữ V ở đỉnh cánh hoa anh đào
    ctx.lineTo(size * 0.22, -size);
    ctx.bezierCurveTo(size * 0.85, -size * 0.65, size * 0.9, size * 0.35, 0, size);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Vẽ cảnh đêm Nhật Bản cổ trang:
   * - Bầu trời đêm tím thẫm ánh trăng thu
   * - Mặt trăng tròn khổng lồ (Mãn Nguyệt) tỏa sáng dịu
   * - Bóng núi Phú Sĩ (Mount Fuji), cổng Torii & cành cây Hoa Anh Đào hai bên
   * - Sàn gỗ Võ Đường (Dojo) dưới chân Samurai
   * - Cánh hoa anh đào bay phảng phất trong gió
   */
  public renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // 1. Bầu trời đêm Nhật Bản (Từ tím mực tàu trên cao xuống hồng sẫm chân trời)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#0f0a19');
    skyGrad.addColorStop(0.5, '#1d1228');
    skyGrad.addColorStop(0.82, '#2d1832');
    skyGrad.addColorStop(1, '#160c1a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Mặt Trăng Tròn Khổng Lồ (Full Moon / Nguyệt Quang)
    const moonX = width * 0.5;
    const moonY = height * 0.32;
    const moonRadius = Math.min(width, height) * 0.21;

    ctx.save();
    // Hào quang trăng
    const moonGlow = ctx.createRadialGradient(
      moonX,
      moonY,
      moonRadius * 0.6,
      moonX,
      moonY,
      moonRadius * 2.3
    );
    moonGlow.addColorStop(0, 'rgba(255, 236, 209, 0.22)');
    moonGlow.addColorStop(0.5, 'rgba(255, 183, 197, 0.08)');
    moonGlow.addColorStop(1, 'rgba(29, 18, 40, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.3, 0, Math.PI * 2);
    ctx.fill();

    // Đĩa trăng ngà ấm
    const moonDisc = ctx.createLinearGradient(
      moonX,
      moonY - moonRadius,
      moonX,
      moonY + moonRadius
    );
    moonDisc.addColorStop(0, '#fffaf0');
    moonDisc.addColorStop(0.7, '#ffe5cc');
    moonDisc.addColorStop(1, '#f9c6c9');
    ctx.fillStyle = moonDisc;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Bóng núi Phú Sĩ (Mount Fuji) & dãy núi xa mờ trong sương đêm
    const horizonY = height - 74;
    ctx.save();
    ctx.fillStyle = '#170e22';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width * 0.22, horizonY - 55);
    ctx.quadraticCurveTo(width * 0.38, horizonY - 65, width * 0.45, horizonY - 165);
    // Đỉnh núi Phú Sĩ bằng phẳng
    ctx.lineTo(width * 0.55, horizonY - 165);
    ctx.quadraticCurveTo(width * 0.62, horizonY - 65, width * 0.78, horizonY - 55);
    ctx.lineTo(width, horizonY);
    ctx.closePath();
    ctx.fill();

    // Tuyết trắng mờ trên đỉnh Phú Sĩ
    ctx.fillStyle = 'rgba(255, 240, 245, 0.12)';
    ctx.beginPath();
    ctx.moveTo(width * 0.45, horizonY - 165);
    ctx.lineTo(width * 0.55, horizonY - 165);
    ctx.lineTo(width * 0.585, horizonY - 115);
    ctx.lineTo(width * 0.54, horizonY - 128);
    ctx.lineTo(width * 0.5, horizonY - 110);
    ctx.lineTo(width * 0.46, horizonY - 128);
    ctx.lineTo(width * 0.415, horizonY - 115);
    ctx.closePath();
    ctx.fill();

    // 4. Bóng Cổng Thần Đạo Torii (鳥居) phía xa bên trái
    const toriiX = width * 0.16;
    const toriiY = horizonY - 10;
    ctx.fillStyle = '#26122c';
    // 2 cột đứng
    ctx.fillRect(toriiX - 26, toriiY - 68, 7, 70);
    ctx.fillRect(toriiX + 19, toriiY - 68, 7, 70);
    // Xà ngang trên cùng (Kasagi cong nhẹ)
    ctx.beginPath();
    ctx.moveTo(toriiX - 42, toriiY - 72);
    ctx.quadraticCurveTo(toriiX, toriiY - 64, toriiX + 42, toriiY - 72);
    ctx.lineTo(toriiX + 38, toriiY - 63);
    ctx.quadraticCurveTo(toriiX, toriiY - 57, toriiX - 38, toriiY - 63);
    ctx.closePath();
    ctx.fill();
    // Xà ngang phụ (Nuki)
    ctx.fillRect(toriiX - 32, toriiY - 50, 64, 5);
    ctx.restore();

    // 5. Cành cây Hoa Anh Đào cổ thụ (Sakura Branches) vươn ra từ góc trên trái & phải
    this.renderSakuraBranches(ctx, width);

    // 6. Lớp sương mù đêm là là mặt đất & Sàn Võ Đường (Dojo Bridge) nơi Samurai đứng
    const mistGrad = ctx.createLinearGradient(0, horizonY - 50, 0, height);
    mistGrad.addColorStop(0, 'rgba(255, 183, 197, 0)');
    mistGrad.addColorStop(0.5, 'rgba(42, 22, 48, 0.55)');
    mistGrad.addColorStop(1, 'rgba(15, 9, 22, 0.96)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, horizonY - 50, width, height - horizonY + 50);

    // Sàn gỗ cầu Nhật / Võ đường dưới đáy
    ctx.fillStyle = '#140b18';
    ctx.fillRect(0, horizonY, width, height - horizonY);
    ctx.strokeStyle = 'rgba(230, 180, 34, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    // 7. Vẽ các cánh hoa anh đào bay phảng phất trong gió (3D Flipping Sakura Petals)
    ctx.save();
    for (const p of this.petals) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      // Co giãn trục X theo cos(flipPhase) tạo hiệu ứng cánh hoa xoay lật 3D tự nhiên trong không trung
      const scaleX = Math.max(0.22, Math.abs(Math.cos(p.flipPhase)));
      ctx.scale(scaleX, 1);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      this.drawSakuraPetalShape(ctx, p.size);
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Vẽ bóng cành hoa anh đào rủ xuống ở 2 góc màn hình
   */
  private renderSakuraBranches(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.save();
    const sway = Math.sin(this.windTime * 1.1) * 4;

    // Cành bên trái
    ctx.strokeStyle = '#1b0d1e';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 28);
    ctx.quadraticCurveTo(95, 55 + sway, 210, 38 + sway);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(85, 45 + sway * 0.5);
    ctx.quadraticCurveTo(130, 95 + sway, 175, 110 + sway);
    ctx.stroke();

    // Cành bên phải
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(width + 10, 35);
    ctx.quadraticCurveTo(width - 110, 62 - sway, width - 230, 42 - sway);
    ctx.stroke();

    // Các chùm hoa anh đào nở trên cành
    const clusters = [
      { x: 65, y: 42 + sway * 0.4, r: 18 },
      { x: 135, y: 48 + sway * 0.7, r: 22 },
      { x: 198, y: 40 + sway, r: 16 },
      { x: 165, y: 105 + sway, r: 17 },
      { x: width - 75, y: 48 - sway * 0.4, r: 20 },
      { x: width - 155, y: 54 - sway * 0.7, r: 22 },
      { x: width - 220, y: 44 - sway, r: 16 },
    ];

    for (const c of clusters) {
      ctx.fillStyle = 'rgba(255, 183, 197, 0.28)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 216, 226, 0.42)';
      ctx.beginPath();
      ctx.arc(c.x - 4, c.y - 3, c.r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Vẽ các hiệu ứng Kiếm Khí bùng nổ, cánh hoa anh đào bung ra khi chém và vệt kiếm bán nguyệt
   */
  public renderForeground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Hiệu ứng chớp mực tàu trắng-đỏ khi tung Nhất Đao Lưỡng Đoạn (Iaijutsu)
    if (this.iaijutsuFlashTimer > 0) {
      ctx.save();
      const flashAlpha = (this.iaijutsuFlashTimer / 0.26) * 0.55;
      ctx.fillStyle =
        this.iaijutsuFlashTimer > 0.14
          ? `rgba(255, 248, 235, ${flashAlpha})`
          : `rgba(217, 56, 58, ${flashAlpha * 0.5})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    ctx.save();

    // 1. Vẽ cánh hoa anh đào tung tóe & tia lửa kiếm khi chém trúng
    for (const s of this.sparks) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.translate(s.x, s.y);

      if (s.shape === 'ring') {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (s.shape === 'petal_burst') {
        ctx.rotate(s.rotation);
        ctx.fillStyle = s.color;
        this.drawSakuraPetalShape(ctx, s.size);
      } else {
        ctx.globalCompositeOperation = 'lighter';
        ctx.rotate(s.rotation);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(-s.size * 2.2, 0);
        ctx.lineTo(0, -s.size * 0.45);
        ctx.lineTo(s.size * 2.2, 0);
        ctx.lineTo(0, s.size * 0.45);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Vẽ Vệt Kiếm Chém Bán Nguyệt (Crescent Katana Slash)
    ctx.globalCompositeOperation = 'lighter';
    for (const sl of this.slashes) {
      const ratio = sl.life / sl.maxLife;
      ctx.save();
      ctx.translate(sl.x, sl.y);
      ctx.rotate(sl.angle);
      ctx.globalAlpha = ratio;

      // Vẽ lưỡi kiếm khí hình trăng khuyết sắc lẹm (Dày ở bụng, nhọn hoắt ở 2 đầu)
      ctx.fillStyle = sl.color;
      ctx.shadowColor = '#ff4d6d';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius, -Math.PI * 0.55, Math.PI * 0.55, false);
      ctx.arc(-sl.radius * 0.18, 0, sl.radius * 0.92, Math.PI * 0.55, -Math.PI * 0.55, true);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // 3. Vẽ đường chỉ kiếm Iaijutsu toàn màn hình
    for (const sc of this.screenSlashes) {
      const ratio = Math.max(0, sc.life / sc.maxLife);
      ctx.save();
      ctx.globalAlpha = ratio;
      ctx.strokeStyle = sc.color;
      ctx.shadowColor = sc.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = sc.width * ratio;
      ctx.beginPath();
      ctx.moveTo(sc.x1, sc.y1);
      ctx.lineTo(sc.x2, sc.y2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // 4. Vẽ chữ nổi thư pháp
    for (const ft of this.floatingTexts) {
      const ratio = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.globalAlpha = ratio;
      ctx.font = `900 ${Math.round(16 * ft.scale)}px "Zen Old Mincho", "Noto Sans JP", serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#0d0711';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);

      if (ft.subText) {
        ctx.font = `700 ${Math.round(12 * ft.scale)}px "Noto Sans JP", sans-serif`;
        ctx.fillStyle = '#fff5e4';
        ctx.fillText(ft.subText, ft.x, ft.y + 17);
      }
      ctx.restore();
    }
  }
}
