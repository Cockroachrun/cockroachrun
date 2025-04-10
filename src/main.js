import './styles/index.css';
import { Game } from './core/Game.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Cockroach Run...');

  const game = new Game();
  game.init();
});
