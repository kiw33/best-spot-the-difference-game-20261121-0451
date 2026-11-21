// Everything on screen: the two panels, HUD, markers, overlays, crosshair.
// The logical field is 1280x720 and scales to the window; the game never
// depends on the real screen size.

import { LEVELS, PANEL_W, PANEL_H } from './scenes.js';
import {
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_LEVEL_CLEAR,
  SCREEN_WIN,
  SCREEN_OVER,
  remaining,
  levelOf,
} from './game.js';

export const FIELD_W = 1280;
export const FIELD_H = 720;
const HUD_H = 64;
const PANEL_Y = 92;
const PANEL_GAP = 16;
const PANEL_X_LEFT = 8;
const PANEL_X_RIGHT = PANEL_X_LEFT + PANEL_W + PANEL_GAP;
const FOOTER_Y = PANEL_Y + PANEL_H + 22;

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFoundRing(ctx, x, y, r, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r + 11, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPanels(ctx, state, panels) {
  const level = levelOf(state);
  for (let p = 0; p < 2; p += 1) {
    const px = p === 0 ? PANEL_X_LEFT : PANEL_X_RIGHT;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, PANEL_Y, PANEL_W, PANEL_H);
    ctx.clip();
    ctx.translate(px, PANEL_Y);
    level.draw(ctx, p === 1);
    // Found differences get a ring on both panels.
    for (const diff of level.differences) {
      if (state.found.has(diff.id)) {
        drawFoundRing(ctx, diff.x, diff.y, diff.r, '#06d6a0', 4);
      } else if (state.hinted.has(diff.id)) {
        // A hinted one pulses gold.
        const pulse = 3 + Math.sin(state.now * 5) * 1.5;
        drawFoundRing(ctx, diff.x, diff.y, diff.r, '#ffd166', pulse);
      }
    }
    ctx.restore();
    // Panel frame + label.
    ctx.strokeStyle = '#f4f1de';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, PANEL_Y, PANEL_W, PANEL_H);
    ctx.fillStyle = 'rgba(20,16,32,0.85)';
    roundRect(ctx, px + 10, PANEL_Y + 10, 34, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#f4f1de';
    ctx.font = 'bold 20px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p === 0 ? 'A' : 'B', px + 27, PANEL_Y + 28);
  }

  // Wrong-click flash.
  if (state.wrongFlash && state.screen === SCREEN_PLAY) {
    const px = state.wrongFlash.panel === 0 ? PANEL_X_LEFT : PANEL_X_RIGHT;
    const fx = px + state.wrongFlash.x;
    const fy = PANEL_Y + state.wrongFlash.y;
    ctx.strokeStyle = '#ef476f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx - 12, fy - 12);
    ctx.lineTo(fx + 12, fy + 12);
    ctx.moveTo(fx + 12, fy - 12);
    ctx.lineTo(fx - 12, fy + 12);
    ctx.stroke();
  }

  // Keyboard crosshair.
  if (state.screen === SCREEN_PLAY) {
    const px = state.crosshair.panel === 0 ? PANEL_X_LEFT : PANEL_X_RIGHT;
    const cx = px + state.crosshair.x;
    const cy = PANEL_Y + state.crosshair.y;
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy);
    ctx.lineTo(cx - 6, cy);
    ctx.moveTo(cx + 6, cy);
    ctx.lineTo(cx + 18, cy);
    ctx.moveTo(cx, cy - 18);
    ctx.lineTo(cx, cy - 6);
    ctx.moveTo(cx, cy + 6);
    ctx.lineTo(cx, cy + 18);
    ctx.stroke();
  }
}

function drawHud(ctx, state) {
  const level = levelOf(state);
  ctx.fillStyle = '#141021';
  ctx.fillRect(0, 0, FIELD_W, HUD_H);
  ctx.fillStyle = '#f4f1de';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 26px ' + FONT;
  ctx.fillText('🔍 Lantern Lane', 16, 24);
  ctx.font = '15px ' + FONT;
  ctx.fillStyle = '#c9b8d6';
  ctx.fillText(`${level.name} — Level ${state.levelIndex + 1} of ${LEVELS.length}`, 16, 50);

  // Remaining counter — big and central.
  const left = remaining(state);
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px ' + FONT;
  ctx.fillStyle = left === 0 ? '#06d6a0' : '#ffd166';
  ctx.fillText(
    state.screen === SCREEN_PLAY ? `${left} difference${left === 1 ? '' : 's'} left` : 'Spot the Difference',
    FIELD_W / 2,
    26,
  );
  ctx.font = '14px ' + FONT;
  ctx.fillStyle = '#c9b8d6';
  ctx.fillText(level.subtitle, FIELD_W / 2, 50);

  // Right side: timer, score, hints.
  const t = Math.max(0, Math.ceil(state.timeLeft));
  const mm = Math.floor(t / 60);
  const ss = String(t % 60).padStart(2, '0');
  ctx.textAlign = 'right';
  ctx.font = 'bold 24px ' + FONT;
  ctx.fillStyle = t <= 15 && state.screen === SCREEN_PLAY ? '#ef476f' : '#f4f1de';
  ctx.fillText(`⏱ ${mm}:${ss}`, FIELD_W - 16, 24);
  ctx.font = '15px ' + FONT;
  ctx.fillStyle = '#c9b8d6';
  ctx.fillText(`Score ${state.score}   •   Hints ${state.hintsLeft} (H)`, FIELD_W - 16, 50);

  // Toast message under the HUD.
  if (state.message) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 17px ' + FONT;
    const w = ctx.measureText(state.message).width + 32;
    ctx.fillStyle = 'rgba(20,16,32,0.88)';
    roundRect(ctx, FIELD_W / 2 - w / 2, HUD_H + 6, w, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#ffe66d';
    ctx.fillText(state.message, FIELD_W / 2, HUD_H + 22);
  }
}

function drawFooter(ctx, state) {
  ctx.textAlign = 'center';
  ctx.font = '15px ' + FONT;
  ctx.fillStyle = '#8b7fa3';
  ctx.fillText(
    'Click a difference on either picture — or move the crosshair with the arrow keys and press Space.  H = hint (−25 pts)  •  M = sound  •  R = restart level',
    FIELD_W / 2,
    FOOTER_Y,
  );
  ctx.fillStyle = '#5c5470';
  ctx.font = '13px ' + FONT;
  ctx.fillText('Lantern Lane — an original game. Art drawn in code; no photos, no borrowed characters.', FIELD_W / 2, FOOTER_Y + 22);
}

function overlay(ctx, lines, accent) {
  ctx.fillStyle = 'rgba(10, 8, 18, 0.72)';
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.fillStyle = '#1d1830';
  roundRect(ctx, 340, 150, 600, 420, 20);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 40px ' + FONT;
  ctx.fillText(lines.title, FIELD_W / 2, 215);
  ctx.fillStyle = '#f4f1de';
  ctx.font = '19px ' + FONT;
  let y = 270;
  for (const line of lines.body) {
    ctx.fillText(line, FIELD_W / 2, y);
    y += 32;
  }
  ctx.fillStyle = accent;
  ctx.font = 'bold 20px ' + FONT;
  ctx.fillText(lines.action, FIELD_W / 2, 520);
}

export function render(ctx, state) {
  ctx.clearRect(0, 0, FIELD_W, FIELD_H);
  ctx.fillStyle = '#141021';
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);

  drawHud(ctx, state);
  if (state.screen === SCREEN_TITLE) {
    // Title shows the first level's scene behind a dim veil.
    ctx.save();
    ctx.globalAlpha = 0.35;
    drawPanels(ctx, state, null);
    ctx.restore();
    overlay(ctx, {
      title: '🔍 Lantern Lane',
      body: [
        'A spot-the-difference game in three hand-drawn scenes.',
        'Two pictures sit side by side. Seven things differ.',
        'Find them all before the clock runs out!',
        '',
        'Click with the mouse, or steer the crosshair',
        'with the arrow keys and press Space.',
      ],
      action: 'Click or press Enter to play',
    }, '#ffd166');
    return;
  }

  drawPanels(ctx, state, null);
  drawFooter(ctx, state);

  if (state.screen === SCREEN_LEVEL_CLEAR) {
    const level = levelOf(state);
    overlay(ctx, {
      title: 'Level Clear!',
      body: [
        `You found all 7 differences in ${level.name}.`,
        `Time bonus: +${state.levelBonus} pts   •   Score: ${state.score}`,
        '',
        'Ready for the next scene?',
      ],
      action: 'Click or press Enter for the next level',
    }, '#06d6a0');
  } else if (state.screen === SCREEN_WIN) {
    overlay(ctx, {
      title: '🏆 You found them all!',
      body: [
        'Every difference in all three scenes — sharp eyes!',
        `Final score: ${state.score}   •   Differences found: ${state.totalFound}`,
        `Wrong clicks: ${state.mistakes}`,
        '',
        'Thanks for playing Lantern Lane.',
      ],
      action: 'Click or press Enter to play again',
    }, '#ffd166');
  } else if (state.screen === SCREEN_OVER) {
    overlay(ctx, {
      title: "Time's up!",
      body: [
        `The clock beat you on ${levelOf(state).name}.`,
        `You found ${levelOf(state).differences.length - remaining(state)} of 7 differences.`,
        `Score so far: ${state.score}`,
      ],
      action: 'Click or press Enter to try the level again',
    }, '#ef476f');
  }
}

// Convert a client (canvas CSS pixel) point to field coordinates.
export function toField(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * FIELD_W,
    y: ((clientY - rect.top) / rect.height) * FIELD_H,
  };
}

// Convert a field point to a panel-space point, or null when outside both.
export function toPanel(fieldX, fieldY) {
  if (fieldY < PANEL_Y || fieldY > PANEL_Y + PANEL_H) return null;
  const y = fieldY - PANEL_Y;
  if (fieldX >= PANEL_X_LEFT && fieldX <= PANEL_X_LEFT + PANEL_W) {
    return { panel: 0, x: fieldX - PANEL_X_LEFT, y };
  }
  if (fieldX >= PANEL_X_RIGHT && fieldX <= PANEL_X_RIGHT + PANEL_W) {
    return { panel: 1, x: fieldX - PANEL_X_RIGHT, y };
  }
  return null;
}
