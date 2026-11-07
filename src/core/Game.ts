import { BOSS_PARRY_KANA, WORD_POOL, WordEntry } from '../data/dictionary';
import { Enemy, EnemyKind } from '../entities/Enemy';
import { ParticleSystem } from '../entities/ParticleSystem';
import { Projectile } from '../entities/Projectile';
import { Samurai } from '../entities/Samurai';
import { SoundFX } from './SoundFX';

export type GameMode = 1 | 2 | 3 | 4 | 5;

export interface HUDCallbacks {
  onUpdateHUD: (state: {
    score: number;
    wave: number;
    mode: GameMode;
    comboMultiplier: number;
    streak: number;
    hp: number;
    maxHp: number;
    fury: number;
  }) => void;
  onGameOver: (stats: {
    score: number;
    wave: number;
    maxStreak: number;
    accuracy: number;
  }) => void;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public sound: SoundFX;
  private callbacks: HUDCallbacks;

  public mode: GameMode = 1;
  public isRunning = false;

  // Trạng thái trận đấu
  public score = 0;
  public wave = 1;
  public hp = 5;
  public readonly maxHp = 5;
  public streak = 0;
  public maxStreak = 0;
  public comboMultiplier = 1.0;
  public bladeFury = 0; // 0 -> 100%

  private totalKeystrokes = 0;
  private correctKeystrokes = 0;

  // Thực thể trong game
  public samurai: Samurai;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: ParticleSystem;
  public lockedTarget: Enemy | null = null;

  // Quản lý sinh quái theo Wave
  private nextEnemyId = 1;
  private enemiesToSpawnInWave = 0;
  private enemiesSpawnedInWave = 0;
  private spawnTimer = 0;
  private waveBannerTimer = 0;
  private bossSpawnedThisWave = false;

  // Hiệu ứng Screen-shake & Hit-stop
  private shakeTimer = 0;
  private shakeMagnitude = 0;
  private hitStopTimer = 0;

  // Bộ đệm gõ từ khóa "ZAN" (斬) khi đầy 100% Kiếm Ý
  private zanBuffer = '';

  private lastFrameTime = 0;

  constructor(canvas: HTMLCanvasElement, sound: SoundFX, callbacks: HUDCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Không thể khởi tạo HTML5 Canvas 2D Context');
    }
    this.ctx = context;
    this.sound = sound;
    this.callbacks = callbacks;

    this.samurai = new Samurai(canvas.width / 2, canvas.height - 78);
    this.particles = new ParticleSystem(canvas.width, canvas.height);
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.samurai.setPosition(width / 2, height - 78);
    this.particles.initPetals(width, height, 42);
  }

  /**
   * Bắt đầu trận đấu mới ở chế độ `mode` (1 -> 5)
   */
  public startGame(mode: GameMode): void {
    this.mode = mode;
    this.score = 0;
    this.wave = 1;
    this.hp = this.maxHp;
    this.streak = 0;
    this.maxStreak = 0;
    this.comboMultiplier = 1.0;
    this.bladeFury = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;

    this.enemies = [];
    this.projectiles = [];
    this.lockedTarget = null;
    this.zanBuffer = '';

    this.isRunning = true;
    this.setupWave(1);
    this.syncHUD();
  }

  public stopGame(): void {
    this.isRunning = false;
    this.lockedTarget = null;
  }

  private setupWave(waveNum: number): void {
    this.wave = waveNum;
    this.enemiesSpawnedInWave = 0;
    this.enemiesToSpawnInWave = 5 + waveNum * 2;
    this.spawnTimer = 0.4;
    this.waveBannerTimer = 2.0;
    this.bossSpawnedThisWave = false;
    this.syncHUD();
  }

  /**
   * Lọc từ vựng chuẩn xác theo từng Chế độ chơi (1 -> 5) và độ khó của Wave
   */
  private pickWordForCurrentMode(forceDifficulty?: 1 | 2 | 3): {
    word: WordEntry;
    kind: EnemyKind;
    hasArmor: boolean;
  } {
    let candidates: WordEntry[] = [];

    if (this.mode === 1) {
      // Level 1: Đạo Trường Hiragana (Hiragana Only)
      candidates = WORD_POOL.filter((w) => w.category === 'hira');
    } else if (this.mode === 2) {
      // Level 2: Ám Khí Katakana (Katakana Only)
      candidates = WORD_POOL.filter((w) => w.category === 'kata');
    } else if (this.mode === 3) {
      // Level 3: Song Kiếm Loạn Vũ (Hiragana + Katakana Mix)
      candidates = WORD_POOL;
    } else if (this.mode === 4) {
      // Level 4: Thiết Giáp Hán Tự (Kanji Armor Mode)
      candidates = WORD_POOL.filter((w) => Boolean(w.kanji));
    } else {
      // Level 5: Bách Quỷ Dạ Hành (All-In Endless Chaos)
      candidates = WORD_POOL;
    }

    // Ưu tiên độ khó theo Wave
    const maxDiff: 1 | 2 | 3 = forceDifficulty
      ? forceDifficulty
      : this.wave <= 1
      ? 1
      : this.wave <= 3
      ? 2
      : 3;

    const diffFiltered = candidates.filter((w) =>
      forceDifficulty ? w.difficulty === forceDifficulty : w.difficulty <= maxDiff
    );
    const pool = diffFiltered.length > 0 ? diffFiltered : candidates;

    // Tránh trùng chữ cái bắt đầu với các quái đang có trên màn hình nếu có thể
    const activeFirstLetters = new Set(
      this.enemies.map((e) => e.romaji.tokens[0]?.options[0]?.[0]).filter(Boolean)
    );
    const nonConflicting = pool.filter((w) => {
      const firstChar = w.kana[0];
      return !activeFirstLetters.has(firstChar);
    });
    const finalPool = nonConflicting.length > 0 ? nonConflicting : pool;
    const word = finalPool[Math.floor(Math.random() * finalPool.length)];

    // Xác định chủng loại quái & trạng thái Giáp Kanji
    if (this.mode === 1) {
      return { word, kind: 'yokai', hasArmor: false };
    }
    if (this.mode === 2) {
      return { word, kind: 'ninja', hasArmor: false };
    }
    if (this.mode === 3) {
      return {
        word,
        kind: word.category === 'kata' ? 'ninja' : 'yokai',
        hasArmor: false,
      };
    }
    if (this.mode === 4) {
      return { word, kind: 'armored', hasArmor: true };
    }

    // Mode 5: Bách Quỷ Dạ Hành (Trộn cả Hira, Kata, Kanji Armor)
    const roll = Math.random();
    if (word.kanji && roll < 0.42) {
      return { word, kind: 'armored', hasArmor: true };
    }
    return {
      word,
      kind: word.category === 'kata' ? 'ninja' : 'yokai',
      hasArmor: false,
    };
  }

  public spawnEnemy(): Enemy {
    const margin = 110;
    const usableWidth = Math.max(200, this.canvas.width - margin * 2);
    const x = margin + Math.random() * usableWidth;
    const y = -30;

    // Kiểm tra xem có phải lúc xuất hiện Boss (mỗi 5 Wave ở Mode 5 hoặc cuối Wave 5, 10...)
    const shouldSpawnBoss =
      this.mode === 5 &&
      this.wave % 5 === 0 &&
      !this.bossSpawnedThisWave &&
      this.enemiesSpawnedInWave === this.enemiesToSpawnInWave - 1;

    if (shouldSpawnBoss) {
      this.bossSpawnedThisWave = true;
      const { word } = this.pickWordForCurrentMode(3);
      const boss = new Enemy(
        this.nextEnemyId++,
        this.canvas.width / 2,
        -45,
        word,
        'boss',
        26 + this.wave * 1.5,
        Boolean(word.kanji)
      );
      this.enemies.push(boss);
      this.enemiesSpawnedInWave++;
      this.particles.addFloatingText(
        this.canvas.width / 2,
        110,
        '⚠️ QUỶ VƯƠNG XUẤT HIỆN (BOSS)!',
        '#ff0055',
        'Đỡ các mũi tên ký tự đơn (Parry)!',
        1.25
      );
      return boss;
    }

    const { word, kind, hasArmor } = this.pickWordForCurrentMode();
    let baseSpeed = 42 + this.wave * 4.5;
    if (this.mode === 1) baseSpeed = 36 + this.wave * 3.5; // Level 1 chậm, đi thẳng
    if (kind === 'ninja') baseSpeed *= 1.22; // Ninja lao nhanh hơn
    if (kind === 'armored') baseSpeed *= 0.88; // Vũ sĩ giáp sắt đi trầm ổn

    const enemy = new Enemy(
      this.nextEnemyId++,
      x,
      y,
      word,
      kind,
      baseSpeed + Math.random() * 12,
      hasArmor
    );
    this.enemies.push(enemy);
    this.enemiesSpawnedInWave++;
    return enemy;
  }

  /**
   * Boss bắn ra các "mũi tên ký tự đơn" bay nhanh buộc người chơi phải gõ chặn đòn (Parry)
   */
  private spawnBossParryArrow(boss: Enemy): void {
    const arrowWord = BOSS_PARRY_KANA[Math.floor(Math.random() * BOSS_PARRY_KANA.length)];
    const offsetX = (Math.random() - 0.5) * 160;
    const x = Math.max(90, Math.min(this.canvas.width - 90, boss.x + offsetX));
    const arrow = new Enemy(
      this.nextEnemyId++,
      x,
      boss.y + 36,
      arrowWord,
      'parry_arrow',
      115 + this.wave * 5,
      false
    );
    this.enemies.push(arrow);
    this.sound.playKeySlash(4);
  }

  /**
   * Xử lý sự kiện bàn phím độ trễ bằng 0 (Zero-latency input)
   */
  public handleKeyDown(e: KeyboardEvent): void {
    if (!this.isRunning) return;

    // 1. Phím Tab: Phá Giáp Hán Tự (Armor Break)
    if (e.key === 'Tab') {
      e.preventDefault();
      this.triggerArmorBreak();
      return;
    }

    // 2. Phím Space: Kích hoạt Tuyệt Kỹ Iaijutsu (nếu đầy 100% Kiếm Ý), nếu chưa đầy thì hỗ trợ Phá Giáp
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (this.bladeFury >= 100) {
        this.triggerIaijutsuUltimate();
      } else {
        this.triggerArmorBreak();
      }
      return;
    }

    // 3. Phím Backspace hoặc Escape: Hủy khóa mục tiêu hiện tại để đổi mục tiêu
    if (e.key === 'Backspace' || e.key === 'Escape') {
      e.preventDefault();
      if (this.lockedTarget) {
        this.lockedTarget.romaji.reset();
        this.lockedTarget = null;
        this.particles.addFloatingText(
          this.samurai.x,
          this.samurai.y - 45,
          'ĐỔI MỤC TIÊU',
          '#05d5fa'
        );
      }
      return;
    }

    // Chỉ nhận các phím ký tự Romaji hợp lệ (a-z và '-')
    if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
    const key = e.key.toLowerCase();
    if (!/^[a-z\-]$/.test(key)) return;

    e.preventDefault();

    // Kiểm tra gõ từ khóa "ZAN" (斬) khi thanh Kiếm Ý đầy 100% và chưa khóa mục tiêu
    if (this.bladeFury >= 100 && !this.lockedTarget) {
      const nextZan = (this.zanBuffer + key).slice(-3);
      if ('zan'.startsWith(nextZan)) {
        this.zanBuffer = nextZan;
        if (this.zanBuffer === 'zan') {
          this.zanBuffer = '';
          this.triggerIaijutsuUltimate();
          return;
        }
      } else {
        this.zanBuffer = '';
      }
    }

    this.processRomajiInput(key);
  }

  /**
   * Cơ chế Phá Giáp (Armor Break - Phím Tab hoặc Space)
   * Nứt khiên của mục tiêu đang khóa (hoặc mục tiêu Thiết Giáp gần Samurai nhất),
   * hiển thị phiên âm Hiragana (Furigana) lên đầu quái, trừ 50% điểm thưởng & reset Combo.
   */
  public triggerArmorBreak(): boolean {
    let target: Enemy | null = null;

    if (this.lockedTarget && this.lockedTarget.hasKanjiArmor && !this.lockedTarget.armorBroken) {
      target = this.lockedTarget;
    } else {
      // Tìm con quái Thiết Giáp chưa vỡ giáp đang ở gần Samurai nhất (Y cao nhất)
      const armoredCandidates = this.enemies
        .filter((en) => en.hasKanjiArmor && !en.armorBroken)
        .sort((a, b) => b.y - a.y);
      if (armoredCandidates.length > 0) {
        target = armoredCandidates[0];
      }
    }

    if (!target) return false;

    target.breakArmor();
    this.sound.playArmorBreak();
    this.particles.spawnArmorShatter(target.x, target.y);
    this.particles.addFloatingText(
      target.x,
      target.y - 55,
      'PHÁ GIÁP! (-50% ĐIỂM)',
      '#ff9e00',
      `Furigana: ${target.word.kana}`
    );

    // Reset chuỗi Combo theo đặc tả
    this.streak = 0;
    this.comboMultiplier = 1.0;
    this.triggerScreenShake(5, 0.12);
    this.syncHUD();
    return true;
  }

  /**
   * Cơ chế Tuyệt Kỹ "Thu Kiếm - Iaijutsu" (Nhất Đao Lưỡng Đoạn)
   * Tiêu diệt tức khắc mọi kẻ địch hiện có trên màn hình.
   */
  public triggerIaijutsuUltimate(): boolean {
    if (this.bladeFury < 100) return false;

    this.bladeFury = 0;
    this.lockedTarget = null;
    this.sound.playIaijutsuUltimate();
    this.particles.triggerIaijutsuSlashStorm(this.canvas.width, this.canvas.height);
    this.triggerScreenShake(9, 0.28);
    this.hitStopTimer = 0.08;

    const killedCount = this.enemies.length;
    for (const enemy of this.enemies) {
      this.particles.spawnKillExplosion(enemy.x, enemy.y, '#05d5fa', '#f9f871');
      const pts = Math.round(150 * this.comboMultiplier);
      this.score += pts;
    }
    this.enemies = [];

    this.particles.addFloatingText(
      this.canvas.width / 2,
      this.canvas.height / 2,
      '斬 • NHẤT ĐAO LƯỠNG ĐOẠN!',
      '#f9f871',
      `Tiêu diệt ${killedCount} mục tiêu!`,
      1.6
    );

    this.syncHUD();
    return true;
  }

  /**
   * Xử lý phím gõ Romaji theo cơ chế ZType Target Locking
   */
  public processRomajiInput(key: string): void {
    this.totalKeystrokes++;

    // Trường hợp 1: Chưa khóa mục tiêu (lockedTarget === null)
    // Quét toàn bộ kẻ địch trên màn hình, chọn con có âm tiết đầu bắt đầu bằng `key` và ở gần Samurai nhất (Y cao nhất)
    if (!this.lockedTarget) {
      const candidates = this.enemies
        .filter((en) => en.romaji.canStartWith(key))
        .sort((a, b) => b.y - a.y);

      if (candidates.length === 0) {
        this.handleMissKey();
        return;
      }

      this.lockedTarget = candidates[0];
    }

    // Trường hợp 2: Đã khóa mục tiêu (lockedTarget !== null)
    const target = this.lockedTarget;
    const result = target.romaji.handleKey(key);

    if (!result.matched) {
      this.handleMissKey();
      return;
    }

    // Gõ đúng phím!
    this.correctKeystrokes++;
    this.streak++;
    if (this.streak > this.maxStreak) {
      this.maxStreak = this.streak;
    }

    // Tăng hệ số nhân Combo (x1.0 -> x5.0) và tích thanh Kiếm Ý (Blade Fury)
    this.comboMultiplier = Math.min(5.0, Number((1.0 + Math.floor(this.streak / 5) * 0.25).toFixed(2)));
    this.bladeFury = Math.min(100, this.bladeFury + 3.5);

    // Phóng kiếm khí từ Samurai tới mục tiêu & đẩy lùi (Knockback y -= 4px)
    const tip = this.samurai.getKatanaTip();
    this.projectiles.push(
      new Projectile(tip.x, tip.y, target.x, target.y, result.completedWord)
    );
    this.samurai.triggerSlash(target);
    target.applyKnockback(4.5);
    this.particles.spawnHitSparks(target.x, target.y);

    if (result.completedWord) {
      // KẾT LIỄU KẺ ĐỊCH!
      this.killEnemy(target);
    } else if (result.completedSyllable) {
      this.sound.playSyllableClang();
    } else {
      this.sound.playKeySlash(Math.floor(this.comboMultiplier * 2));
    }

    this.syncHUD();
  }

  private killEnemy(target: Enemy): void {
    this.sound.playKillSlash();
    this.particles.spawnKillExplosion(
      target.x,
      target.y,
      target.kind === 'ninja' ? '#b537f2' : '#ff2a6d',
      '#f9f871'
    );

    // Hit-stop & Screen-shake (4px trong 100ms theo đúng đặc tả)
    this.hitStopTimer = 0.035;
    this.triggerScreenShake(4, 0.1);

    // Tính điểm thưởng
    const baseScore =
      target.kind === 'boss'
        ? 500
        : target.kind === 'parry_arrow'
        ? 80
        : target.word.difficulty * 100;
    const earned = Math.round(baseScore * this.comboMultiplier * target.scoreMultiplier);
    this.score += earned;
    this.bladeFury = Math.min(100, this.bladeFury + 8);

    const popupLabel =
      target.kind === 'parry_arrow'
        ? `⚡ PARRY! +${earned}`
        : `+${earned}`;
    this.particles.addFloatingText(
      target.x,
      target.y - 20,
      popupLabel,
      target.armorBroken ? '#ff9e00' : '#00f59b',
      target.word.meaning
    );

    // Xóa quái khỏi danh sách
    this.enemies = this.enemies.filter((e) => e.id !== target.id);
    if (this.lockedTarget?.id === target.id) {
      this.lockedTarget = null;
    }
  }

  private handleMissKey(): void {
    this.sound.playError();
    this.streak = 0;
    this.comboMultiplier = 1.0;
    if (this.lockedTarget) {
      this.particles.addFloatingText(
        this.lockedTarget.x,
        this.lockedTarget.y - 45,
        'TRƯỢT PHÍM!',
        '#ff2a6d'
      );
    }
    this.syncHUD();
  }

  private triggerScreenShake(magnitude: number, durationSec: number): void {
    this.shakeMagnitude = magnitude;
    this.shakeTimer = durationSec;
  }

  public startLoop(): void {
    const step = (timestamp: number) => {
      if (!this.lastFrameTime) this.lastFrameTime = timestamp;
      const rawDt = Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
      this.lastFrameTime = timestamp;

      this.update(rawDt);
      this.render();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  public update(dt: number): void {
    // Luôn cập nhật hiệu ứng cánh hoa rơi nền ngay cả khi ở Menu
    this.particles.update(dt, this.canvas.width, this.canvas.height);

    if (!this.isRunning) return;

    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    }

    // Hiệu ứng Hit-stop khi chém kết liễu
    if (this.hitStopTimer > 0) {
      this.hitStopTimer = Math.max(0, this.hitStopTimer - dt);
      return;
    }

    if (this.waveBannerTimer > 0) {
      this.waveBannerTimer = Math.max(0, this.waveBannerTimer - dt);
    }

    // Sinh quái theo Wave
    if (this.enemiesSpawnedInWave < this.enemiesToSpawnInWave) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnEnemy();
        const baseInterval = Math.max(0.85, 2.3 - this.wave * 0.12);
        this.spawnTimer = baseInterval;
      }
    } else if (this.enemies.length === 0) {
      // Hoàn thành Wave -> Sang Wave kế tiếp
      this.setupWave(this.wave + 1);
    }

    this.samurai.update(dt, this.lockedTarget);

    // Cập nhật đường bay của kiếm khí
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.projectiles[i].update(dt);
      if (!this.projectiles[i].alive) {
        this.projectiles.splice(i, 1);
      }
    }

    // Cập nhật vị trí Quái & kiểm tra chạm đáy màn hình
    const dangerLineY = this.samurai.y - 24;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.canvas.width);

      // Boss bắn mũi tên ký tự đơn (Parry Projectiles)
      if (enemy.kind === 'boss' && enemy.bossArrowCooldown <= 0) {
        enemy.bossArrowCooldown = 2.8;
        this.spawnBossParryArrow(enemy);
      }

      if (enemy.y >= dangerLineY) {
        // Quái chạm vào Samurai -> Trừ HP
        if (this.lockedTarget?.id === enemy.id) {
          this.lockedTarget = null;
        }
        this.enemies.splice(i, 1);
        this.hp = Math.max(0, this.hp - 1);
        this.streak = 0;
        this.comboMultiplier = 1.0;
        this.sound.playDamage();
        this.triggerScreenShake(8, 0.22);
        this.particles.spawnKillExplosion(enemy.x, enemy.y, '#ff0055', '#ff2a6d');
        this.particles.addFloatingText(
          this.samurai.x,
          this.samurai.y - 50,
          '💔 TRÚNG ĐÒN (-1 HP)',
          '#ff0055'
        );
        this.syncHUD();

        if (this.hp <= 0) {
          this.handleGameOver();
          return;
        }
      }
    }
  }

  private handleGameOver(): void {
    this.isRunning = false;
    this.lockedTarget = null;
    const accuracy =
      this.totalKeystrokes > 0
        ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
        : 100;
    this.callbacks.onGameOver({
      score: this.score,
      wave: this.wave,
      maxStreak: this.maxStreak,
      accuracy,
    });
  }

  public render(): void {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.save();

    // Áp dụng Screen-shake nếu đang kích hoạt
    if (this.shakeTimer > 0) {
      const dx = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
      const dy = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
      ctx.translate(dx, dy);
    }

    // 1. Vẽ nền Cyber-Edo & cánh hoa anh đào
    this.particles.renderBackground(ctx, width, height);

    if (this.isRunning) {
      // Vạch ranh giới phòng thủ của Samurai
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 42, 109, 0.22)';
      ctx.setLineDash([12, 8]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, this.samurai.y - 24);
      ctx.lineTo(width, this.samurai.y - 24);
      ctx.stroke();
      ctx.restore();

      // 2. Vẽ Samurai & Tia chỉ đỏ (Laser Sightline)
      this.samurai.render(ctx, this.lockedTarget, this.bladeFury >= 100);

      // 3. Vẽ Phi kiếm / Kiếm khí
      for (const proj of this.projectiles) {
        proj.render(ctx);
      }

      // 4. Vẽ các kẻ địch chưa khóa trước, kẻ địch đang khóa vẽ trên cùng để nổi bật tuyệt đối
      for (const enemy of this.enemies) {
        if (enemy.id !== this.lockedTarget?.id) {
          enemy.render(ctx, false);
        }
      }
      if (this.lockedTarget) {
        this.lockedTarget.render(ctx, true);
      }

      // 5. Banner thông báo Wave mới phong cách Thư Pháp Nhật Bản
      if (this.waveBannerTimer > 0) {
        const alpha = Math.min(1, this.waveBannerTimer);
        ctx.save();
        ctx.globalAlpha = alpha * 0.92;
        ctx.textAlign = 'center';
        ctx.font = '900 32px "Zen Old Mincho", "Noto Sans JP", serif';
        ctx.fillStyle = '#fff8e7';
        ctx.shadowColor = '#d9383a';
        ctx.shadowBlur = 18;
        ctx.fillText(`🌸 ĐỢT TẤN CÔNG THỨ ${this.wave} (第${this.wave}波) 🌸`, width / 2, height * 0.24);
        ctx.restore();
      }
    }

    // 6. Vẽ hạt nổ, vệt kiếm bán nguyệt & chữ nổi
    this.particles.renderForeground(ctx, width, height);

    ctx.restore();
  }

  private syncHUD(): void {
    this.callbacks.onUpdateHUD({
      score: this.score,
      wave: this.wave,
      mode: this.mode,
      comboMultiplier: this.comboMultiplier,
      streak: this.streak,
      hp: this.hp,
      maxHp: this.maxHp,
      fury: this.bladeFury,
    });
  }
}

