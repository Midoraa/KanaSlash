import { Enemy } from './Enemy';

export class Samurai {
  public x: number;
  public y: number;
  private aimAngle = -Math.PI / 2;
  private slashAnimTimer = 0;
  private slashMaxTime = 0.22;
  private slashDirection = 1; // 1: chém vung từ trái sang phải, -1: chém vung từ phải sang trái
  private windPhase = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Kích hoạt động tác vung kiếm Katana chém ra luồng kiếm khí
   */
  public triggerSlash(target?: Enemy | null): void {
    this.slashAnimTimer = this.slashMaxTime;
    this.slashDirection *= -1;
    if (target) {
      this.aimAngle = Math.atan2(target.y - this.y, target.x - this.x);
    } else {
      this.aimAngle = -Math.PI / 2;
    }
  }

  public update(dt: number, lockedTarget: Enemy | null): void {
    this.windPhase += dt * 4.5;
    if (this.slashAnimTimer > 0) {
      this.slashAnimTimer = Math.max(0, this.slashAnimTimer - dt);
    }

    if (lockedTarget) {
      const targetAngle = Math.atan2(lockedTarget.y - this.y, lockedTarget.x - this.x);
      const diff = targetAngle - this.aimAngle;
      this.aimAngle += diff * Math.min(1, dt * 18);
    } else {
      const defaultAngle = -Math.PI / 2;
      this.aimAngle += (defaultAngle - this.aimAngle) * Math.min(1, dt * 8);
    }
  }

  /**
   * Vị trí xuất phát của luồng Kiếm Khí khi vung thanh Katana
   */
  public getKatanaTip(): { x: number; y: number } {
    return {
      x: this.x + Math.cos(this.aimAngle) * 38,
      y: this.y - 16 + Math.sin(this.aimAngle) * 38,
    };
  }

  public render(
    ctx: CanvasRenderingContext2D,
    lockedTarget: Enemy | null,
    furyReady: boolean
  ): void {
    // 1. Khi đã khóa mục tiêu: Vẽ sợi chỉ Sát Khí / Kiếm Ý mảnh nhẹ nối hướng nhìn tới mục tiêu
    if (lockedTarget) {
      ctx.save();
      const grad = ctx.createLinearGradient(
        this.x,
        this.y - 22,
        lockedTarget.x,
        lockedTarget.y
      );
      grad.addColorStop(0, 'rgba(217, 56, 58, 0.05)');
      grad.addColorStop(0.5, 'rgba(255, 183, 197, 0.25)');
      grad.addColorStop(1, 'rgba(230, 180, 34, 0.45)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - 22);
      ctx.lineTo(lockedTarget.x, lockedTarget.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // 2. Vòng Ấn Chú Thủy Mặc / Hoa Anh Đào dưới chân Samurai khi tích đầy Kiếm Ý
    ctx.save();
    ctx.scale(1, 0.36); // Phối cảnh mặt sàn gỗ Dojo
    ctx.strokeStyle = furyReady ? 'rgba(230, 180, 34, 0.75)' : 'rgba(255, 183, 197, 0.25)';
    ctx.lineWidth = furyReady ? 3 : 1.5;
    ctx.beginPath();
    ctx.arc(0, 28, 44 + Math.sin(this.windPhase) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Thông báo tuyệt kỹ Bạt Đao Thuật khi đầy 100% Kiếm Ý
    if (furyReady) {
      ctx.save();
      ctx.font = '900 14px "Zen Old Mincho", "Noto Sans JP", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e6b422';
      ctx.shadowColor = '#d9383a';
      ctx.shadowBlur = 10;
      ctx.fillText('🌸 [SPACE / ZAN] 居合斬り • NHẤT ĐAO LƯỠNG ĐOẠN 🌸', 0, 34);
      ctx.restore();
    }

    // 3. Vẽ Vệt Vung Kiếm Bán Nguyệt (Katana Swing Arc) ngay trước mặt Samurai mỗi khi gõ phím
    if (this.slashAnimTimer > 0) {
      const progress = 1 - this.slashAnimTimer / this.slashMaxTime;
      const alpha = 1 - progress * 0.75;
      ctx.save();
      ctx.translate(0, -18);
      ctx.rotate(this.aimAngle);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha;

      // Vòng cung vung kiếm rộng 140 độ
      const arcRadius = 48 + progress * 16;
      ctx.fillStyle = furyReady ? '#e6b422' : '#ff4d6d';
      ctx.shadowColor = '#ff4d6d';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, -Math.PI * 0.45, Math.PI * 0.45, false);
      ctx.arc(-10, 0, arcRadius * 0.85, Math.PI * 0.45, -Math.PI * 0.45, true);
      ctx.closePath();
      ctx.fill();

      // Ánh thép trắng của lưỡi Katana khi vung
      ctx.strokeStyle = '#fffdf7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, arcRadius - 2, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Vẽ Vỏ Kiếm (Saya) đeo bên hông trái của Samurai
    ctx.save();
    ctx.strokeStyle = '#8b1e24';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-38, 12);
    ctx.stroke();
    // Dây buộc Sageo màu vàng kim trên vỏ kiếm
    ctx.strokeStyle = '#e6b422';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, 1);
    ctx.lineTo(-16, -2);
    ctx.stroke();
    ctx.restore();

    // 5. Vẽ Cánh Tay & Thanh Kiếm Katana Cong Sắc Lẹm (vung qua lại khi chém)
    ctx.save();
    ctx.translate(0, -18);
    let currentSwordAngle = this.aimAngle + 0.35 * this.slashDirection;
    if (this.slashAnimTimer > 0) {
      const t = 1 - this.slashAnimTimer / this.slashMaxTime;
      // Quỹ đạo vung kiếm từ bên này quét mạnh sang bên kia
      const sweep = (-0.85 + t * 1.7) * this.slashDirection;
      currentSwordAngle = this.aimAngle + sweep;
    }
    ctx.rotate(currentSwordAngle);

    // Chuôi kiếm Katana (Tsuka quấn dây đen-đỏ)
    ctx.strokeStyle = '#2b1820';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(16, 0);
    ctx.stroke();

    // Chắn kiếm tròn (Tsuba bằng vàng đồng)
    ctx.strokeStyle = '#e6b422';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(16, -7);
    ctx.lineTo(16, 7);
    ctx.stroke();

    // Lưỡi kiếm Katana cong nhẹ (Sori) ánh bạc sắc lẹm
    ctx.strokeStyle = '#fffdf9';
    ctx.shadowColor = furyReady ? '#e6b422' : '#ffb7c5';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(17, 0);
    ctx.quadraticCurveTo(36, -3 * this.slashDirection, 56, -1 * this.slashDirection);
    ctx.stroke();
    ctx.restore();

    // 6. Vẽ Thân Võ Sĩ Samurai (Áo Haori đen tím, Giáp vai & Quần Hakama)
    const windSway = Math.sin(this.windPhase) * 2.5;

    // Tà áo khoác Haori bay nhẹ trong gió
    ctx.fillStyle = '#1b1124';
    ctx.strokeStyle = '#d9383a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-17, -22); // Vai trái
    ctx.lineTo(17, -22);  // Vai phải
    ctx.lineTo(22 + windSway * 0.5, 12); // Tà áo phải
    ctx.lineTo(-22 + windSway * 0.5, 12); // Tà áo trái
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cổ áo Kimono đỏ thẫm & Giáp vai
    ctx.fillStyle = '#8b1e24';
    ctx.beginPath();
    ctx.moveTo(-19, -22);
    ctx.lineTo(-9, -22);
    ctx.lineTo(-13, -8);
    ctx.lineTo(-21, -11);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(19, -22);
    ctx.lineTo(9, -22);
    ctx.lineTo(13, -8);
    ctx.lineTo(21, -11);
    ctx.closePath();
    ctx.fill();

    // Đai lưng Obi màu vàng kim
    ctx.fillStyle = '#e6b422';
    ctx.fillRect(-15, -3, 30, 4);

    // Gia huy Hoa Anh Đào (Sakura Kamon) in sau lưng áo Haori của Samurai
    ctx.fillStyle = 'rgba(255, 183, 197, 0.75)';
    ctx.beginPath();
    ctx.arc(0, -12, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Vẽ Đầu Samurai, Búi Tóc Võ Sĩ (Chonmage) & Dải Băng Trán Đỏ (Hachimaki) bay trong gió
    // Đầu
    ctx.fillStyle = '#120a18';
    ctx.strokeStyle = '#f5d0c5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -31, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Búi tóc cao của Samurai (Chonmage)
    ctx.fillStyle = '#0d0612';
    ctx.beginPath();
    ctx.ellipse(0, -41, 3.5, 5.5, -0.15, 0, Math.PI * 2);
    ctx.fill();
    // Dây buộc tóc trắng (Motoyui)
    ctx.strokeStyle = '#fff5e4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-3, -38);
    ctx.lineTo(3, -38);
    ctx.stroke();

    // Băng trán đỏ Hachimaki và 2 dải lụa đỏ bay phấp phới trong gió đêm
    ctx.strokeStyle = '#d9383a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-9, -32);
    ctx.lineTo(9, -32);
    ctx.stroke();

    // Dải lụa đỏ bay phảng phất
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-7, -32);
    ctx.quadraticCurveTo(
      -20,
      -36 + Math.sin(this.windPhase * 1.4) * 5,
      -34,
      -29 + Math.cos(this.windPhase * 1.4) * 6
    );
    ctx.stroke();

    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-7, -31);
    ctx.quadraticCurveTo(
      -18,
      -26 + Math.cos(this.windPhase * 1.2) * 4,
      -29,
      -21 + Math.sin(this.windPhase * 1.2) * 5
    );
    ctx.stroke();

    ctx.restore();
  }
}
