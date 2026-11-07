import './style.css';
import { Game, GameMode } from './core/Game';
import { RomajiEngine, RomajiSequence } from './core/RomajiEngine';
import { SoundFX } from './core/SoundFX';

const MODE_LABELS: Record<GameMode, string> = {
  1: 'LV1 • HIRAGANA',
  2: 'LV2 • KATAKANA',
  3: 'LV3 • HIRA + KATA',
  4: 'LV4 • KANJI ARMOR',
  5: 'LV5 • BÁCH QUỶ',
};

function initApp(): void {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const hud = document.getElementById('hud') as HTMLElement;
  const controlsBar = document.getElementById('controls-bar') as HTMLElement;
  const menuOverlay = document.getElementById('menu-overlay') as HTMLElement;
  const gameoverOverlay = document.getElementById('gameover-overlay') as HTMLElement;

  const hudScore = document.getElementById('hud-score') as HTMLElement;
  const hudWave = document.getElementById('hud-wave') as HTMLElement;
  const hudMode = document.getElementById('hud-mode') as HTMLElement;
  const hudCombo = document.getElementById('hud-combo') as HTMLElement;
  const hudStreak = document.getElementById('hud-streak') as HTMLElement;
  const hudHearts = document.getElementById('hud-hearts') as HTMLElement;
  const hudFuryText = document.getElementById('hud-fury-text') as HTMLElement;
  const hudFuryFill = document.getElementById('hud-fury-fill') as HTMLElement;
  const hudFuryPrompt = document.getElementById('hud-fury-prompt') as HTMLElement;

  const goScore = document.getElementById('go-score') as HTMLElement;
  const goWave = document.getElementById('go-wave') as HTMLElement;
  const goStreak = document.getElementById('go-streak') as HTMLElement;
  const goAccuracy = document.getElementById('go-accuracy') as HTMLElement;

  const btnMenuReturn = document.getElementById('btn-menu-return') as HTMLButtonElement;
  const btnRetry = document.getElementById('btn-retry') as HTMLButtonElement;
  const btnBackMenu = document.getElementById('btn-back-menu') as HTMLButtonElement;
  const chkSound = document.getElementById('chk-sound') as HTMLInputElement;

  const sound = new SoundFX();

  const game = new Game(canvas, sound, {
    onUpdateHUD: (state) => {
      hudScore.textContent = String(state.score).padStart(6, '0');
      hudWave.textContent = String(state.wave);
      hudMode.textContent = MODE_LABELS[state.mode];
      hudCombo.textContent = `x${state.comboMultiplier.toFixed(2).replace(/\.00$/, '.0')}`;
      hudStreak.textContent = `${state.streak} Chuỗi`;

      const pct = Math.floor(state.fury);
      hudFuryText.textContent = `${pct}%`;
      hudFuryFill.style.width = `${pct}%`;
      if (pct >= 100) {
        hudFuryPrompt.classList.remove('hidden');
      } else {
        hudFuryPrompt.classList.add('hidden');
      }

      // Render sinh mệnh (Hearts)
      let heartsHtml = '';
      for (let i = 0; i < state.maxHp; i++) {
        heartsHtml += i < state.hp ? '<span>❤️</span>' : '<span style="opacity:0.25">🖤</span>';
      }
      hudHearts.innerHTML = heartsHtml;
    },
    onGameOver: (stats) => {
      goScore.textContent = stats.score.toLocaleString('vi-VN');
      goWave.textContent = String(stats.wave);
      goStreak.textContent = `${stats.maxStreak} phím`;
      goAccuracy.textContent = `${stats.accuracy}%`;
      gameoverOverlay.classList.remove('hidden');
    },
  });

  const handleResize = () => {
    game.resize(window.innerWidth, window.innerHeight);
  };
  handleResize();
  window.addEventListener('resize', handleResize);

  // Chọn 1 trong 5 Chế độ chơi từ Menu
  const modeCards = document.querySelectorAll<HTMLButtonElement>('.mode-card');
  modeCards.forEach((card) => {
    card.addEventListener('click', () => {
      const modeVal = Number(card.dataset.mode) as GameMode;
      menuOverlay.classList.add('hidden');
      gameoverOverlay.classList.add('hidden');
      hud.classList.remove('hidden');
      controlsBar.classList.remove('hidden');
      game.startGame(modeVal);
    });
  });

  // Nút quay lại Menu chính
  const returnToMenu = () => {
    game.stopGame();
    hud.classList.add('hidden');
    controlsBar.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    menuOverlay.classList.remove('hidden');
  };

  btnMenuReturn.addEventListener('click', () => {
    btnMenuReturn.blur();
    returnToMenu();
  });

  btnBackMenu.addEventListener('click', () => {
    returnToMenu();
  });

  btnRetry.addEventListener('click', () => {
    gameoverOverlay.classList.add('hidden');
    game.startGame(game.mode);
  });

  chkSound.addEventListener('change', () => {
    sound.enabled = chkSound.checked;
  });

  // Lắng nghe sự kiện bàn phím toàn cục (Zero-latency input)
  window.addEventListener('keydown', (e) => {
    game.handleKeyDown(e);
  });

  // Khởi chạy Game Loop 60FPS
  game.startLoop();

  // Expose đối tượng cho quy trình kiểm thử tự động (Verification Plan)
  (window as unknown as Record<string, unknown>).__KANA_SLASH__ = {
    game,
    RomajiEngine,
    RomajiSequence,
  };
}

initApp();

