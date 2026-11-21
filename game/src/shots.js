// Screenshot scenes for ?shot=start|play|end. Each one drives the real game
// forward to a fixed, deterministic state, so the frame is exactly what a
// player would see — never a mock. The capture script waits for
// window.__shotReady before screenshotting.
//
//   ?shot=start — title screen over the first scene
//   ?shot=play  — level 1 mid-game: 3 of 7 found (rings on both panels),
//                 4 still unfound, counter reading "4 differences left"
//   ?shot=end   — the win screen after all three levels are cleared

import { newGame, startGame, startLevel, clickAt, SCREEN_WIN } from './game.js';
import { LEVELS } from './scenes.js';

const PLAY_FOUND = ['sun-moon', 'cloud', 'flower'];

export function stageShot(name) {
  const state = newGame();
  if (name === 'play') {
    startGame(state);
    state.timeLeft = 118; // a tidy 1:58 on the clock
    for (const id of PLAY_FOUND) {
      const diff = LEVELS[0].differences.find((d) => d.id === id);
      clickAt(state, diff.x, diff.y);
    }
    state.message = '';
    return state;
  }
  if (name === 'end') {
    startGame(state);
    // Clear every level the honest way: click each difference for real.
    for (let level = 0; level < LEVELS.length; level += 1) {
      for (const diff of LEVELS[level].differences) {
        clickAt(state, diff.x, diff.y);
      }
      // Step on to the next scene the same way a player does.
      if (level < LEVELS.length - 1) startLevel(state, level + 1);
    }
    state.screen = SCREEN_WIN;
    state.message = '';
    return state;
  }
  // start (and anything unknown): the title screen.
  return state;
}
