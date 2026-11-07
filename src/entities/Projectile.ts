export class Projectile {
  public x: number;
  public y: number;
  public targetX: number;
  public targetY: number;
  public readonly speed = 2200;
  public readonly isFinisher: boolean;
  public alive = true;
  private readonly tiltAngle: number;
  private afterimages: { x: number; y: number; angle: number }[] = [];

  constructor(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    isFinisher = false
  ) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.isFinisher = isFinisher;
    // Độ nghiêng ngẫu nhiên nhẹ cho luồng kiếm khí bán nguyệt thêm sống động như nhát chém thật
    this.tiltAngle = (Math.random() - 0.5) * 0.45;
  }

  public update(dt: number): void {
    const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
    this.afterimages.push({ x: this.x, y: this.y, angle });
    if (this.afterimages.length > 5) {
      this.afterimages.shift();
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.speed * dt || dist < 18) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.alive = false;
      return;
    }

    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
  }

  /**
   * Vẽ luồng Kiếm Khí Bán Nguyệt (Crescent Wind Slash / 剣気) phóng ra từ thanh Katana của Samurai
   */
  public render(ctx: CanvasRenderingContext2D): void {
    const moveAngle = Math.atan2(this.targetY - this.y, this.targetX - this.x);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 1. Vẽ các tàn ảnh gió kiếm (Wind Afterimages) phía sau luồng kiếm khí
    for (let i = 0; i < this.afterimages.length; i++) {
      const img = this.afterimages[i];
      const ratio = (i + 1) / (this.afterimages.length + 1);
      ctx.save();
      ctx.translate(img.x, img.y);
      ctx.rotate(img.angle + this.tiltAngle);
      ctx.globalAlpha = ratio * 0.42;

      const r = (this.isFinisher ? 34 : 22) * (0.75 + ratio * 0.25);
      ctx.strokeStyle = this.isFinisher ? '#e6b422' : '#ff7597';
      ctx.lineWidth = this.isFinisher ? 4 : 2.5;
      ctx.beginPath();
      ctx.arc(-r * 0.55, 0, r, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Vẽ Luồng Kiếm Khí Bán Nguyệt chính (Crescent Air Blade)
    ctx.translate(this.x, this.y);
    ctx.rotate(moveAngle + this.tiltAngle);

    const bladeRadius = this.isFinisher ? 38 : 25;
    const auraColor = this.isFinisher ? '#e6b422' : '#ff4d6d';

    // Hào quang kiếm khí màu Đỏ Anh Đào / Vàng Hoàng Kim
    ctx.fillStyle = auraColor;
    ctx.shadowColor = auraColor;
    ctx.shadowBlur = this.isFinisher ? 20 : 14;
    ctx.beginPath();
    ctx.arc(-bladeRadius * 0.5, 0, bladeRadius, -Math.PI * 0.48, Math.PI * 0.48, false);
    ctx.arc(
      -bladeRadius * 0.72,
      0,
      bladeRadius * 0.92,
      Math.PI * 0.48,
      -Math.PI * 0.48,
      true
    );
    ctx.closePath();
    ctx.fill();

    // Lõi phong nhẫn sắc trắng ngà ở mép trước của lưỡi kiếm khí
    ctx.fillStyle = '#fffdf7';
    ctx.beginPath();
    ctx.arc(-bladeRadius * 0.46, 0, bladeRadius * 0.94, -Math.PI * 0.4, Math.PI * 0.4, false);
    ctx.arc(
      -bladeRadius * 0.62,
      0,
      bladeRadius * 0.88,
      Math.PI * 0.4,
      -Math.PI * 0.4,
      true
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
