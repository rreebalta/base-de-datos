/**
 * Mobile Media Player — Spotify + YouTube Music Style
 * v2.0 - Fullscreen video, Spotify‑like subtitles, canonical sharing, improved timers & gestures
 */
(function () {
  'use strict';

  /* ─── helpers ─── */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const ce = (t) => document.createElement(t);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };
  const fmtLong = (s) => {
    if (!isFinite(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };
  function hexToHSL(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function luminance(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
  function textColor(hex) { return luminance(hex) > 0.55 ? '#111' : '#fff'; }
  function textColorSub(hex) { return luminance(hex) > 0.55 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)'; }

  /* ─── SVG icons (complete set) ─── */
  const icons = {
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`,
    prev: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>`,
    next: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2zM5.5 12 14 6v12z" transform="rotate(180 12 12)"/></svg>`,
    rewind: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="12" y="15.5" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor">10</text></svg>`,
    forward: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="12" y="15.5" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor">10</text></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    queue: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 10h12v2H4zm0-4h12v2H4zm0 8h8v2H4zm10 0v6l5-3z"/></svg>`,
    speed: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.38 8.57l-1.23 1.85a8 8 0 01-.22 7.58H5.07A8 8 0 0115.58 6.85l1.85-1.23A10 10 0 003 12a10 10 0 0020 0c0-1.22-.22-2.39-.62-3.43zM12 8v4l3 3"/></svg>`,
    timer: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61 1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 000-6 3 3 0 00-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9a3 3 0 000 6c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.88 2.88 0 002.88 2.88A2.88 2.88 0 0020.88 19a2.88 2.88 0 00-2.88-2.92z"/></svg>`,
    subtitle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`,
    video: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,
    audio: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    more: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`,
    repeatOne: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
    fullscreen: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
    exitFullscreen: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
  };

  /* ─── STYLES (improved for fullscreen, subtitles, drag areas) ─── */
  const style = ce('style');
  style.textContent = `
/* Reset for player */
.mp-m *, .mp-m *::before, .mp-m *::after { box-sizing: border-box; margin: 0; padding: 0; }
.mp-m { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-tap-highlight-color: transparent; }
.mp-m button { background: none; border: none; cursor: pointer; outline: none; color: inherit; -webkit-tap-highlight-color: transparent; }
.mp-m svg { width: 100%; height: 100%; display: block; }

/* Mini bar */
.mp-mini-m {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999;
  height: 64px; display: flex; align-items: center;
  padding: 0 8px; gap: 10px;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.25);
  will-change: transform;
}
.mp-mini-m.hidden { transform: translateY(100%); opacity: 0; pointer-events: none; }
.mp-mini-m .mp-mini-cover { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.mp-mini-m .mp-mini-info { flex: 1; min-width: 0; }
.mp-mini-m .mp-mini-title { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-mini-m .mp-mini-author { font-size: 11px; opacity: 0.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-mini-m .mp-mini-btn { width: 36px; height: 36px; padding: 6px; flex-shrink: 0; border-radius: 50%; }
.mp-mini-m .mp-mini-btn:active { opacity: 0.5; }
.mp-mini-m .mp-mini-progress { position: absolute; top: 0; left: 0; right: 0; height: 2.5px; background: rgba(255,255,255,0.15); }
.mp-mini-m .mp-mini-progress-fill { height: 100%; width: 0%; transition: width 0.3s linear; }

/* Expanded */
.mp-exp-m {
  position: fixed; inset: 0; z-index: 100000;
  display: flex; flex-direction: column;
  transition: transform 0.38s cubic-bezier(0.4,0,0.2,1);
  transform: translateY(100%);
  overflow: hidden;
  will-change: transform;
}
.mp-exp-m.open { transform: translateY(0); }
.mp-exp-m.dragging { transition: none; }

/* Drag handle - enlarged area (top 30% of screen) */
.mp-exp-drag-area {
  position: absolute; top: 0; left: 0; right: 0; height: 30%;
  z-index: 20;
  pointer-events: auto;
  background: transparent;
}
.mp-exp-handle {
  width: 100%; display: flex; justify-content: center; padding: 12px 0 4px; flex-shrink: 0;
  position: relative; z-index: 21;
}
.mp-exp-handle span { width: 40px; height: 5px; border-radius: 4px; background: rgba(255,255,255,0.4); }

/* Header row */
.mp-exp-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px 8px; flex-shrink: 0; position: relative; z-index: 10;
}
.mp-exp-header button { width: 36px; height: 36px; padding: 6px; border-radius: 50%; }
.mp-exp-header button:active { background: rgba(255,255,255,0.1); }

/* Media area */
.mp-media-area {
  flex: 1; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; min-height: 0;
  padding: 0 24px;
}
.mp-media-area img {
  max-width: 100%; max-height: 100%; border-radius: 12px;
  object-fit: cover; box-shadow: 0 8px 40px rgba(0,0,0,0.35);
  aspect-ratio: 1; width: min(75vw, 300px);
  transition: opacity 0.2s;
}
.mp-media-area video {
  max-width: 100%; max-height: 100%; border-radius: 8px;
  object-fit: contain; background: #000;
}
/* Spotify‑like subtitles (audio mode) */
.mp-subtitle-full {
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%; padding: 24px;
  text-align: center; font-size: clamp(1.4rem, 8vw, 2.2rem);
  font-weight: 700; line-height: 1.4; letter-spacing: -0.01em;
  background: transparent; color: white; text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  word-break: break-word;
}
/* Subtitles overlay on video */
.mp-subtitles-overlay {
  position: absolute; bottom: 20px; left: 16px; right: 16px;
  text-align: center; font-size: 16px; font-weight: 600;
  text-shadow: 0 1px 6px rgba(0,0,0,0.7);
  padding: 8px 12px; border-radius: 8px;
  background: rgba(0,0,0,0.6); line-height: 1.4;
  pointer-events: none;
}

/* Controls area */
.mp-controls-area { flex-shrink: 0; padding: 0 20px 12px; position: relative; z-index: 10; }
.mp-track-info { text-align: center; margin-bottom: 12px; }
.mp-track-title { font-size: 18px; font-weight: 700; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-track-author { font-size: 13px; opacity: 0.6; }
.mp-track-author a { color: inherit; text-decoration: underline; opacity: 0.8; }

/* Progress bar */
.mp-progress-wrap { margin-bottom: 8px; position: relative; padding: 8px 0; }
.mp-progress-track { width: 100%; height: 3px; border-radius: 3px; background: rgba(255,255,255,0.2); position: relative; overflow: visible; }
.mp-progress-fill { height: 100%; border-radius: 3px; position: relative; width: 0%; transition: width 0.15s linear; }
.mp-progress-thumb {
  position: absolute; right: -7px; top: 50%; transform: translateY(-50%);
  width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.3);
  opacity: 0; transition: opacity 0.2s;
}
.mp-progress-wrap.active .mp-progress-thumb { opacity: 1; }
.mp-progress-wrap.active .mp-progress-track { height: 5px; }
.mp-times { display: flex; justify-content: space-between; font-size: 11px; opacity: 0.5; margin-top: 4px; }

/* Main control buttons */
.mp-main-btns { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px; }
.mp-main-btns button { border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.mp-main-btns button:active { transform: scale(0.9); }
.mp-ctrl-sm { width: 36px; height: 36px; padding: 7px; }
.mp-ctrl-md { width: 44px; height: 44px; padding: 8px; }
.mp-ctrl-play { width: 58px; height: 58px; padding: 12px; border-radius: 50%; }

/* Extra buttons row */
.mp-extra-btns { display: flex; align-items: center; justify-content: space-around; padding: 4px 8px 6px; }
.mp-extra-btns button { width: 36px; height: 36px; padding: 6px; border-radius: 50%; opacity: 0.7; position: relative; }
.mp-extra-btns button.active { opacity: 1; }
.mp-extra-btns button:active { opacity: 0.5; }
.mp-extra-btns .mp-badge {
  position: absolute; top: 0; right: 0; font-size: 9px; font-weight: 700;
  background: currentColor; width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: black;
}
.mp-fullscreen-btn { margin-left: auto; }

/* Panel overlay */
.mp-panel-m {
  position: absolute; bottom: 0; left: 0; right: 0;
  max-height: 70vh; border-radius: 20px 20px 0 0;
  background: rgba(30,30,30,0.98); color: #fff;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  z-index: 15; overflow: hidden;
  display: flex; flex-direction: column;
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
}
.mp-panel-m.open { transform: translateY(0); }
.mp-panel-m.dragging { transition: none; }
.mp-panel-handle {
  display: flex; justify-content: center; padding: 12px 0 8px; flex-shrink: 0;
  background: transparent;
}
.mp-panel-handle span { width: 40px; height: 5px; border-radius: 4px; background: rgba(255,255,255,0.3); }
.mp-panel-head { display: flex; align-items: center; justify-content: space-between; padding: 0 16px 10px; flex-shrink: 0; }
.mp-panel-head h3 { font-size: 18px; font-weight: 700; }
.mp-panel-head button { width: 32px; height: 32px; padding: 6px; border-radius: 50%; }
.mp-panel-body { flex: 1; overflow-y: auto; padding: 0 16px 24px; -webkit-overflow-scrolling: touch; }

/* Queue item */
.mp-queue-item {
  display: flex; align-items: center; gap: 12px; padding: 12px 4px;
  border-bottom: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
}
.mp-queue-item:active { background: rgba(255,255,255,0.06); }
.mp-queue-item img { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; }
.mp-queue-item .qi-info { flex: 1; min-width: 0; }
.mp-queue-item .qi-title { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-queue-item .qi-author { font-size: 12px; opacity: 0.5; }
.mp-queue-item.playing { background: rgba(255,255,255,0.08); }

/* Speed options */
.mp-speed-opt {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 4px; border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 15px; font-weight: 500;
}
.mp-speed-opt.active { font-weight: 700; }
.mp-speed-opt .dot { width: 8px; height: 8px; border-radius: 50%; background: #1db954; display: none; }
.mp-speed-opt.active .dot { display: block; }

/* Timer options */
.mp-timer-opt { display: flex; align-items: center; justify-content: space-between; padding: 14px 4px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px; }
.mp-timer-opt.active { font-weight: 700; }
.mp-timer-opt .check { width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; }
.mp-timer-opt.active .check { border-color: #1db954; background: #1db954; }
.mp-timer-opt.active .check::after { content: '✓'; color: #000; font-size: 12px; font-weight: 700; }

/* Share buttons (SVG based) */
.mp-share-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 8px 0; }
.mp-share-item { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11px; opacity: 0.8; }
.mp-share-item button { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); }
.mp-share-item button:active { transform: scale(0.9); }
.mp-share-item button svg { width: 24px; height: 24px; }

/* Info panel */
.mp-info-content { font-size: 14px; line-height: 1.7; opacity: 0.8; padding: 4px 0; }
.mp-dl-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; font-weight: 600; width: 100%; justify-content: center; }

/* Fullscreen overlay (custom controls) */
.mp-fs-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  z-index: 200000;
  display: flex; flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 48px 20px 32px;
  transition: opacity 0.2s;
  backdrop-filter: blur(8px);
}
.mp-fs-overlay.hidden { display: none; }
.mp-fs-top { text-align: center; color: white; font-size: 18px; font-weight: 600; text-shadow: 0 1px 2px black; }
.mp-fs-center { display: flex; gap: 32px; align-items: center; }
.mp-fs-btn { width: 64px; height: 64px; border-radius: 50%; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; }
.mp-fs-play { width: 84px; height: 84px; }
.mp-fs-bottom { width: 100%; max-width: 500px; }
.mp-fs-progress { height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; margin-bottom: 12px; cursor: pointer; }
.mp-fs-progress-fill { height: 100%; background: white; width: 0%; border-radius: 2px; }
.mp-fs-time { display: flex; justify-content: space-between; color: white; font-size: 12px; margin-bottom: 16px; }
.mp-fs-exit { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.6); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }

/* Landscape fullscreen adjustment */
@media (orientation: landscape) {
  .mp-fs-center { gap: 48px; }
  .mp-fs-btn { width: 72px; height: 72px; }
  .mp-fs-play { width: 96px; height: 96px; }
}

/* Safe area */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .mp-mini-m { padding-bottom: env(safe-area-inset-bottom); height: calc(64px + env(safe-area-inset-bottom)); }
  .mp-controls-area { padding-bottom: calc(16px + env(safe-area-inset-bottom)); }
}
`;
  document.head.appendChild(style);

  /* ─── State ─── */
  const state = {
    mediaUrl: '', mediaVideo: '', mode: 'audio',
    coverUrl: '', coverInfo: '', title: '', detailUrl: '',
    author: '', queue: [], text: '', subtitlesUrl: '',
    bgColor: '#1a1a2e', allowDownload: false,
    isPlaying: false, isExpanded: false,
    currentTime: 0, duration: 0,
    playbackRate: 1, subtitlesOn: false,
    repeat: 0, shuffle: false,
    timerEnd: null, timerType: null,   // 'minutes' or 'end'
    cues: [], currentCue: '',
    queueIndex: -1,
    initialized: false,
    fullscreenActive: false,
  };

  /* ─── Audio/Video elements ─── */
  const audioEl = new Audio();
  audioEl.preload = 'metadata';
  const videoEl = ce('video');
  videoEl.preload = 'metadata';
  videoEl.playsInline = true;
  videoEl.setAttribute('playsinline', '');
  videoEl.setAttribute('webkit-playsinline', '');

  function activeMedia() { return state.mode === 'video' ? videoEl : audioEl; }

  /* ─── Build DOM ─── */
  const root = ce('div');
  root.className = 'mp-m';

  // Mini player
  const mini = ce('div');
  mini.className = 'mp-mini-m hidden';
  mini.innerHTML = `
    <div class="mp-mini-progress"><div class="mp-mini-progress-fill"></div></div>
    <img class="mp-mini-cover" src="" alt="">
    <div class="mp-mini-info">
      <div class="mp-mini-title"></div>
      <div class="mp-mini-author"></div>
    </div>
    <button class="mp-mini-btn mp-mini-play" aria-label="Play">${icons.play}</button>
    <button class="mp-mini-btn mp-mini-next" aria-label="Next">${icons.next}</button>
  `;

  // Expanded
  const exp = ce('div');
  exp.className = 'mp-exp-m';
  exp.innerHTML = `
    <div class="mp-exp-drag-area"></div>
    <div class="mp-exp-handle"><span></span></div>
    <div class="mp-exp-header">
      <button class="mp-btn-collapse" aria-label="Minimize">${icons.chevronDown}</button>
      <span class="mp-exp-source" style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;opacity:0.7;">Reproduciendo</span>
      <button class="mp-btn-more" aria-label="More">${icons.more}</button>
    </div>
    <div class="mp-media-area">
      <img class="mp-exp-cover" src="" alt="">
    </div>
    <div class="mp-controls-area">
      <div class="mp-track-info">
        <div class="mp-track-title"></div>
        <div class="mp-track-author"></div>
      </div>
      <div class="mp-progress-wrap">
        <div class="mp-progress-track"><div class="mp-progress-fill"><div class="mp-progress-thumb"></div></div></div>
        <div class="mp-times"><span class="mp-time-cur">0:00</span><span class="mp-time-dur">0:00</span></div>
      </div>
      <div class="mp-main-btns">
        <button class="mp-ctrl-sm mp-btn-shuffle" aria-label="Shuffle">${icons.shuffle}</button>
        <button class="mp-ctrl-md mp-btn-prev" aria-label="Previous">${icons.prev}</button>
        <button class="mp-ctrl-sm mp-btn-rew" aria-label="Rewind 10s">${icons.rewind}</button>
        <button class="mp-ctrl-play mp-btn-play" aria-label="Play">${icons.play}</button>
        <button class="mp-ctrl-sm mp-btn-fwd" aria-label="Forward 10s">${icons.forward}</button>
        <button class="mp-ctrl-md mp-btn-next" aria-label="Next">${icons.next}</button>
        <button class="mp-ctrl-sm mp-btn-repeat" aria-label="Repeat">${icons.repeat}</button>
      </div>
      <div class="mp-extra-btns">
        <button class="mp-btn-mode" aria-label="Mode">${icons.video}</button>
        <button class="mp-btn-subtitle" aria-label="Subtitles">${icons.subtitle}</button>
        <button class="mp-btn-speed" aria-label="Speed">${icons.speed}</button>
        <button class="mp-btn-timer" aria-label="Timer">${icons.timer}</button>
        <button class="mp-btn-queue" aria-label="Queue">${icons.queue}</button>
        <button class="mp-btn-share" aria-label="Share">${icons.share}</button>
        <button class="mp-fullscreen-btn" aria-label="Fullscreen" style="display:none;">${icons.fullscreen}</button>
      </div>
    </div>
    <div class="mp-panel-m">
      <div class="mp-panel-handle"><span></span></div>
      <div class="mp-panel-head"><h3></h3><button class="mp-panel-close">${icons.close}</button></div>
      <div class="mp-panel-body"></div>
    </div>
  `;

  root.appendChild(mini);
  root.appendChild(exp);
  document.body.appendChild(root);

  // Fullscreen overlay (custom)
  const fsOverlay = ce('div');
  fsOverlay.className = 'mp-fs-overlay hidden';
  fsOverlay.innerHTML = `
    <div class="mp-fs-top"><span class="mp-fs-title"></span></div>
    <div class="mp-fs-center">
      <button class="mp-fs-btn mp-fs-prev">${icons.prev}</button>
      <button class="mp-fs-btn mp-fs-play">${icons.play}</button>
      <button class="mp-fs-btn mp-fs-next">${icons.next}</button>
    </div>
    <div class="mp-fs-bottom">
      <div class="mp-fs-progress"><div class="mp-fs-progress-fill"></div></div>
      <div class="mp-fs-time"><span class="mp-fs-current">0:00</span><span class="mp-fs-duration">0:00</span></div>
    </div>
    <button class="mp-fs-exit">${icons.exitFullscreen}</button>
  `;
  document.body.appendChild(fsOverlay);

  /* ─── Element references ─── */
  const els = {
    mini, exp, fsOverlay,
    miniCover: $('.mp-mini-cover', mini),
    miniTitle: $('.mp-mini-title', mini),
    miniAuthor: $('.mp-mini-author', mini),
    miniPlay: $('.mp-mini-play', mini),
    miniNext: $('.mp-mini-next', mini),
    miniProgressFill: $('.mp-mini-progress-fill', mini),
    expCover: $('.mp-exp-cover', exp),
    mediaArea: $('.mp-media-area', exp),
    trackTitle: $('.mp-track-title', exp),
    trackAuthor: $('.mp-track-author', exp),
    progressWrap: $('.mp-progress-wrap', exp),
    progressTrack: $('.mp-progress-track', exp),
    progressFill: $('.mp-progress-fill', exp),
    progressThumb: $('.mp-progress-thumb', exp),
    timeCur: $('.mp-time-cur', exp),
    timeDur: $('.mp-time-dur', exp),
    btnPlay: $('.mp-btn-play', exp),
    btnPrev: $('.mp-btn-prev', exp),
    btnNext: $('.mp-btn-next', exp),
    btnRew: $('.mp-btn-rew', exp),
    btnFwd: $('.mp-btn-fwd', exp),
    btnShuffle: $('.mp-btn-shuffle', exp),
    btnRepeat: $('.mp-btn-repeat', exp),
    btnCollapse: $('.mp-btn-collapse', exp),
    btnMore: $('.mp-btn-more', exp),
    btnMode: $('.mp-btn-mode', exp),
    btnSubtitle: $('.mp-btn-subtitle', exp),
    btnSpeed: $('.mp-btn-speed', exp),
    btnTimer: $('.mp-btn-timer', exp),
    btnQueue: $('.mp-btn-queue', exp),
    btnShare: $('.mp-btn-share', exp),
    btnFullscreen: $('.mp-fullscreen-btn', exp),
    panel: $('.mp-panel-m', exp),
    panelHead: $('.mp-panel-head h3', exp),
    panelBody: $('.mp-panel-body', exp),
    panelClose: $('.mp-panel-close', exp),
    handle: $('.mp-exp-handle', exp),
    dragArea: $('.mp-exp-drag-area', exp),
    // fullscreen overlay elements
    fsTitle: $('.mp-fs-title', fsOverlay),
    fsPrev: $('.mp-fs-prev', fsOverlay),
    fsPlay: $('.mp-fs-play', fsOverlay),
    fsNext: $('.mp-fs-next', fsOverlay),
    fsProgress: $('.mp-fs-progress', fsOverlay),
    fsProgressFill: $('.mp-fs-progress-fill', fsOverlay),
    fsCurrent: $('.mp-fs-current', fsOverlay),
    fsDuration: $('.mp-fs-duration', fsOverlay),
    fsExit: $('.mp-fs-exit', fsOverlay),
  };

  /* ─── Colors ─── */
  function applyColors(hex) {
    const tc = textColor(hex);
    const tcs = textColorSub(hex);
    const hsl = hexToHSL(hex);
    const bg1 = `hsl(${hsl.h}, ${Math.min(hsl.s + 10, 100)}%, ${clamp(hsl.l - 15, 5, 35)}%)`;
    const bg2 = `hsl(${hsl.h}, ${Math.min(hsl.s + 5, 100)}%, ${clamp(hsl.l - 30, 3, 20)}%)`;
    const grad = `linear-gradient(180deg, ${hex} 0%, ${bg1} 45%, ${bg2} 100%)`;

    exp.style.background = grad;
    exp.style.color = tc;
    mini.style.background = bg1;
    mini.style.color = tc;

    els.miniProgressFill.style.background = tc;
    els.progressFill.style.background = tc;
    els.progressThumb.style.background = tc;

    const playBg = luminance(hex) > 0.55 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
    const playFg = luminance(hex) > 0.55 ? '#fff' : '#000';
    els.btnPlay.style.background = playBg;
    els.btnPlay.style.color = playFg;

    els.timeCur.style.color = tcs;
    els.timeDur.style.color = tcs;
  }

  /* ─── Subtitles (Spotify style) ─── */
  async function loadSubtitles(url) {
    state.cues = [];
    if (!url) return;
    try {
      const res = await fetch(url);
      const txt = await res.text();
      const blocks = txt.split(/\n\s*\n/);
      for (const block of blocks) {
        const lines = block.trim().split('\n');
        for (let i = 0; i < lines.length; i++) {
          const match = lines[i].match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
          if (match) {
            const start = +match[1] * 3600 + +match[2] * 60 + +match[3] + +match[4] / 1000;
            const end = +match[5] * 3600 + +match[6] * 60 + +match[7] + +match[8] / 1000;
            const text = lines.slice(i + 1).join('\n').replace(/<[^>]+>/g, '').trim();
            if (text) state.cues.push({ start, end, text });
            break;
          }
        }
      }
    } catch (e) { console.warn('Subtitle load failed:', e); }
  }

  function getCurrentCue(time) {
    for (const c of state.cues) if (time >= c.start && time <= c.end) return c.text;
    return '';
  }

  function updateSubtitlesDisplay() {
    const cue = getCurrentCue(state.currentTime);
    state.currentCue = cue;
    // For audio mode with subtitles on: replace cover with large text
    if (state.mode === 'audio' && state.subtitlesOn && state.cues.length && state.isExpanded) {
      const coverImg = $('.mp-exp-cover', els.mediaArea);
      const existingSub = $('.mp-subtitle-full', els.mediaArea);
      if (cue) {
        if (coverImg) coverImg.style.display = 'none';
        if (!existingSub) {
          const subDiv = ce('div');
          subDiv.className = 'mp-subtitle-full';
          els.mediaArea.appendChild(subDiv);
        }
        const subDiv = $('.mp-subtitle-full', els.mediaArea);
        subDiv.textContent = cue;
      } else {
        if (coverImg) coverImg.style.display = '';
        if (existingSub) existingSub.remove();
      }
    } else if (state.mode === 'video' && state.subtitlesOn && state.cues.length) {
      let subOverlay = $('.mp-subtitles-overlay', els.mediaArea);
      if (!subOverlay) {
        subOverlay = ce('div');
        subOverlay.className = 'mp-subtitles-overlay';
        els.mediaArea.appendChild(subOverlay);
      }
      subOverlay.textContent = cue || '';
      if (!cue && subOverlay) subOverlay.textContent = '';
    } else {
      // remove any subtitle elements
      const subAudio = $('.mp-subtitle-full', els.mediaArea);
      if (subAudio) subAudio.remove();
      const subVideo = $('.mp-subtitles-overlay', els.mediaArea);
      if (subVideo) subVideo.remove();
      // ensure cover is visible
      const coverImg = $('.mp-exp-cover', els.mediaArea);
      if (coverImg) coverImg.style.display = '';
    }
  }

  /* ─── Media Session API ─── */
  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.title,
      artist: state.author,
      artwork: [{ src: state.coverUrl, sizes: '512x512', type: 'image/png' }],
    });
    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    navigator.mediaSession.setActionHandler('seekbackward', () => seek(-10));
    navigator.mediaSession.setActionHandler('seekforward', () => seek(10));
    try {
      navigator.mediaSession.setActionHandler('seekto', (d) => { if (d.seekTime != null) activeMedia().currentTime = d.seekTime; });
    } catch (e) {}
  }

  /* ─── Playback ─── */
  function togglePlay() {
    const m = activeMedia();
    if (m.paused) m.play().catch(() => {});
    else m.pause();
  }
  function seek(delta) { const m = activeMedia(); m.currentTime = clamp(m.currentTime + delta, 0, m.duration || 0); }
  function setRate(r) {
    state.playbackRate = r;
    audioEl.playbackRate = r;
    videoEl.playbackRate = r;
    updateSpeedBadge();
  }

  function switchMode(mode) {
    if (mode === state.mode) return;
    const wasPlaying = !activeMedia().paused;
    const pos = activeMedia().currentTime;
    activeMedia().pause();
    state.mode = mode;
    const m = activeMedia();
    if (m.readyState < 1) {
      m.addEventListener('loadedmetadata', function once() {
        m.removeEventListener('loadedmetadata', once);
        m.currentTime = pos;
        if (wasPlaying) m.play().catch(() => {});
      });
    } else {
      m.currentTime = pos;
      if (wasPlaying) m.play().catch(() => {});
    }
    updateMediaArea();
    updateModeBtn();
    updateSubtitlesDisplay();
  }

  function updateModeBtn() {
    if (!state.mediaUrl || !state.mediaVideo) {
      els.btnMode.style.display = 'none';
      return;
    }
    els.btnMode.style.display = '';
    els.btnMode.innerHTML = state.mode === 'video' ? icons.audio : icons.video;
  }

  function updateMediaArea() {
    const area = els.mediaArea;
    // remove video if present
    if (videoEl.parentNode === area) area.removeChild(videoEl);
    // keep cover
    const cover = $('.mp-exp-cover', area);
    if (!cover) area.appendChild(els.expCover);
    if (state.mode === 'video') {
      els.expCover.style.display = 'none';
      area.insertBefore(videoEl, area.firstChild);
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
    } else {
      els.expCover.style.display = '';
      if (videoEl.parentNode === area) area.removeChild(videoEl);
    }
    // fullscreen button visibility
    els.btnFullscreen.style.display = (state.mode === 'video' && state.mediaVideo) ? 'flex' : 'none';
    updateSubtitlesDisplay();
  }

  /* ─── Fullscreen logic (custom + native) ─── */
  let fsInterval = null;
  function updateFsProgress() {
    if (!state.fullscreenActive) return;
    const m = activeMedia();
    const pct = m.duration ? (m.currentTime / m.duration) * 100 : 0;
    els.fsProgressFill.style.width = pct + '%';
    els.fsCurrent.textContent = fmt(m.currentTime);
    els.fsDuration.textContent = fmt(m.duration);
  }
  function showFullscreen() {
    if (state.mode !== 'video') return;
    const video = videoEl;
    if (!video) return;
    // request native fullscreen
    if (video.requestFullscreen) {
      video.requestFullscreen().catch(err => console.warn(err));
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen(); // iOS
    }
    // force landscape
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
    // show custom overlay after entering
  }
  function exitFullscreen() {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
  }
  function handleFullscreenChange() {
    const isFs = !!document.fullscreenElement || !!document.webkitFullscreenElement;
    state.fullscreenActive = isFs;
    if (isFs) {
      els.fsOverlay.classList.remove('hidden');
      els.fsTitle.textContent = state.title;
      if (fsInterval) clearInterval(fsInterval);
      fsInterval = setInterval(updateFsProgress, 250);
      updateFsProgress();
      // bind fs controls
      els.fsPlay.onclick = () => togglePlay();
      els.fsPrev.onclick = () => playPrev();
      els.fsNext.onclick = () => playNext();
      els.fsProgress.onclick = (e) => {
        const rect = els.fsProgress.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        activeMedia().currentTime = pct * (state.duration || 0);
      };
      els.fsExit.onclick = () => exitFullscreen();
    } else {
      els.fsOverlay.classList.add('hidden');
      if (fsInterval) clearInterval(fsInterval);
      fsInterval = null;
    }
  }
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

  /* ─── UI Updates ─── */
  function updateUI() {
    els.miniCover.src = state.coverUrl;
    els.miniTitle.textContent = state.title;
    els.miniAuthor.textContent = state.author;
    els.expCover.src = state.coverUrl;
    els.trackTitle.textContent = state.title;
    els.trackAuthor.innerHTML = state.detailUrl ? `<a href="${state.detailUrl}">${state.author}</a>` : state.author;
  }

  function updatePlayBtn() {
    const icon = state.isPlaying ? icons.pause : icons.play;
    els.btnPlay.innerHTML = icon;
    els.miniPlay.innerHTML = icon;
    if (els.fsPlay) els.fsPlay.innerHTML = icon;
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
  }

  function updateProgress() {
    const pct = state.duration ? (state.currentTime / state.duration) * 100 : 0;
    els.progressFill.style.width = pct + '%';
    els.miniProgressFill.style.width = pct + '%';
    els.timeCur.textContent = fmt(state.currentTime);
    els.timeDur.textContent = fmt(state.duration);
    updateSubtitlesDisplay();
    // timer check
    if (state.timerType === 'minutes' && state.timerEnd && Date.now() >= state.timerEnd) {
      activeMedia().pause();
      state.timerEnd = null;
      state.timerType = null;
    }
  }

  /* ─── Expand / Collapse with enlarged drag area ─── */
  let dragStartY = 0, dragCurrentY = 0, isDraggingExp = false;
  function onDragStart(e) {
    // ignore if target is a button or interactive element
    const target = e.target;
    if (target.closest('button') || target.closest('.mp-panel-m') || target.closest('.mp-fullscreen-btn')) return;
    dragStartY = e.touches ? e.touches[0].clientY : e.clientY;
    isDraggingExp = true;
    exp.classList.add('dragging');
  }
  function onDragMove(e) {
    if (!isDraggingExp) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    dragCurrentY = y - dragStartY;
    if (dragCurrentY < 0) dragCurrentY = 0;
    exp.style.transform = `translateY(${dragCurrentY}px)`;
  }
  function onDragEnd() {
    if (!isDraggingExp) return;
    isDraggingExp = false;
    exp.classList.remove('dragging');
    if (dragCurrentY > 100) collapse();
    exp.style.transform = '';
    dragCurrentY = 0;
  }
  function expand() {
    state.isExpanded = true;
    exp.classList.add('open');
    mini.classList.add('hidden');
    document.body.style.overflow = 'hidden';
    updateSubtitlesDisplay();
  }
  function collapse() {
    state.isExpanded = false;
    exp.classList.remove('open');
    mini.classList.remove('hidden');
    closePanel();
    document.body.style.overflow = '';
    updateSubtitlesDisplay();
  }

  // Bind drag events on both handle and dragArea
  els.handle.addEventListener('touchstart', onDragStart, { passive: true });
  els.dragArea.addEventListener('touchstart', onDragStart, { passive: true });
  document.addEventListener('touchmove', onDragMove, { passive: true });
  document.addEventListener('touchend', onDragEnd);

  /* ─── Panel with enlarged handle (bottom) ─── */
  let panelDragStart = 0, panelDragCurrent = 0, isDraggingPanel = false;
  const panelHandle = $('.mp-panel-handle', exp);
  function onPanelDragStart(e) {
    const target = e.target;
    if (target.closest('button')) return;
    panelDragStart = e.touches[0].clientY;
    isDraggingPanel = true;
    els.panel.classList.add('dragging');
  }
  function onPanelDragMove(e) {
    if (!isDraggingPanel) return;
    const y = e.touches[0].clientY;
    panelDragCurrent = y - panelDragStart;
    if (panelDragCurrent < 0) panelDragCurrent = 0;
    els.panel.style.transform = `translateY(${panelDragCurrent}px)`;
  }
  function onPanelDragEnd() {
    if (!isDraggingPanel) return;
    isDraggingPanel = false;
    els.panel.classList.remove('dragging');
    if (panelDragCurrent > 80) closePanel();
    els.panel.style.transform = '';
    panelDragCurrent = 0;
  }
  panelHandle.addEventListener('touchstart', onPanelDragStart, { passive: true });
  document.addEventListener('touchmove', onPanelDragMove, { passive: true });
  document.addEventListener('touchend', onPanelDragEnd);

  function openPanel(title, contentFn) {
    els.panelHead.textContent = title;
    els.panelBody.innerHTML = '';
    contentFn(els.panelBody);
    els.panel.classList.add('open');
  }
  function closePanel() { els.panel.classList.remove('open'); }

  /* ─── Panel builders ─── */
  function buildQueuePanel(body) {
    if (!state.queue.length) {
      body.innerHTML = '<p style="opacity:0.5;padding:20px 0;text-align:center;">No hay episodios en cola</p>';
      return;
    }
    state.queue.forEach((ep, i) => {
      const item = ce('div');
      item.className = 'mp-queue-item' + (i === state.queueIndex ? ' playing' : '');
      item.innerHTML = `
        <img src="${ep.coverUrl || state.coverUrl}" alt="">
        <div class="qi-info">
          <div class="qi-title">${escapeHtml(ep.title)}</div>
          <div class="qi-author">${escapeHtml(ep.author || '')}</div>
        </div>
      `;
      item.addEventListener('click', () => { state.queueIndex = i; playQueueItem(i); });
      body.appendChild(item);
    });
  }
  function buildSpeedPanel(body) {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    speeds.forEach(s => {
      const opt = ce('div');
      opt.className = 'mp-speed-opt' + (state.playbackRate === s ? ' active' : '');
      opt.innerHTML = `<span>${s === 1 ? 'Normal' : s + 'x'}</span><div class="dot"></div>`;
      opt.addEventListener('click', () => {
        setRate(s);
        $$('.mp-speed-opt', body).forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
      body.appendChild(opt);
    });
  }
  function buildTimerPanel(body) {
    const options = [
      { label: 'Desactivado', mins: 0 },
      { label: '5 minutos', mins: 5 },
      { label: '10 minutos', mins: 10 },
      { label: '15 minutos', mins: 15 },
      { label: '30 minutos', mins: 30 },
      { label: '45 minutos', mins: 45 },
      { label: '1 hora', mins: 60 },
      { label: 'Fin del episodio', mins: -1 },
    ];
    const activeType = state.timerType;
    options.forEach(opt => {
      const elDiv = ce('div');
      let isActive = false;
      if (opt.mins === 0 && !state.timerEnd && state.timerType !== 'end') isActive = true;
      else if (opt.mins === -1 && state.timerType === 'end') isActive = true;
      else if (opt.mins > 0 && state.timerType === 'minutes' && state.timerEnd && Math.round((state.timerEnd - Date.now()) / 60000) === opt.mins) isActive = true;
      elDiv.className = 'mp-timer-opt' + (isActive ? ' active' : '');
      let extra = '';
      if (opt.mins > 0 && state.timerType === 'minutes' && state.timerEnd) {
        const remaining = Math.max(0, (state.timerEnd - Date.now()) / 1000);
        extra = ` (${fmtLong(remaining)})`;
      }
      elDiv.innerHTML = `<span>${opt.label}${extra}</span><div class="check"></div>`;
      elDiv.addEventListener('click', () => {
        if (opt.mins === 0) { state.timerEnd = null; state.timerType = null; }
        else if (opt.mins === -1) { state.timerEnd = null; state.timerType = 'end'; }
        else { state.timerEnd = Date.now() + opt.mins * 60000; state.timerType = 'minutes'; }
        closePanel();
      });
      body.appendChild(elDiv);
    });
  }
  function buildSharePanel(body) {
    // canonical URL: replace origin with https://media.baltaanay.org
    let canonicalUrl = state.detailUrl ? (window.location.origin + state.detailUrl) : window.location.href;
    canonicalUrl = canonicalUrl.replace(/^https?:\/\/[^\/]+/, 'https://media.baltaanay.org');
    const shareData = [
      { name: 'Copiar', icon: '📋', action: () => { navigator.clipboard.writeText(canonicalUrl).then(() => {}); } },
      { name: 'WhatsApp', icon: '💬', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(state.title + ' ' + canonicalUrl)}`) },
      { name: 'Twitter', icon: '𝕏', action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(state.title)}&url=${encodeURIComponent(canonicalUrl)}`) },
      { name: 'Facebook', icon: '📘', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`) },
      { name: 'Telegram', icon: '✈️', action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(state.title)}`) },
      { name: 'Email', icon: '✉️', action: () => window.open(`mailto:?subject=${encodeURIComponent(state.title)}&body=${encodeURIComponent(canonicalUrl)}`) },
    ];
    if (navigator.share) {
      shareData.unshift({
        name: 'Compartir', icon: '📤',
        action: () => navigator.share({ title: state.title, url: canonicalUrl }).catch(() => {}),
      });
    }
    const grid = ce('div');
    grid.className = 'mp-share-grid';
    shareData.forEach(s => {
      const item = ce('div');
      item.className = 'mp-share-item';
      item.innerHTML = `<button>${s.icon}</button><span>${s.name}</span>`;
      $('button', item).addEventListener('click', () => { s.action(); closePanel(); });
      grid.appendChild(item);
    });
    body.appendChild(grid);
  }
  function buildInfoPanel(body) {
    body.innerHTML = `
      <div class="mp-info-content">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
          <img src="${state.coverInfo || state.coverUrl}" style="width:80px;height:80px;border-radius:8px;object-fit:cover;" alt="">
          <div>
            <div style="font-size:16px;font-weight:700;">${escapeHtml(state.title)}</div>
            <div style="font-size:13px;opacity:0.6;margin-top:4px;">${escapeHtml(state.author)}</div>
          </div>
        </div>
        <div style="white-space:pre-wrap;">${escapeHtml(state.text) || 'Sin descripción disponible.'}</div>
        ${state.allowDownload ? `<div style="margin-top:16px;"><button class="mp-dl-btn"><span style="width:20px;height:20px;display:inline-block;">${icons.download}</span>Descargar</button></div>` : ''}
      </div>
    `;
    const dlBtn = $('.mp-dl-btn', body);
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        const url = state.mode === 'video' && state.mediaVideo ? state.mediaVideo : state.mediaUrl;
        const a = ce('a'); a.href = url; a.download = state.title; a.target = '_blank';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      });
    }
  }
  function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); }

  function playQueueItem(idx) {
    if (idx < 0 || idx >= state.queue.length) return;
    const ep = state.queue[idx];
    state.queueIndex = idx;
    loadEpisode(
      ep.mediaUrl || '', ep.mediaVideo || '', ep.initialMode || 'audio',
      ep.coverUrl || '', ep.coverInfo || '', ep.title || '',
      ep.detailUrl || '', ep.author || '', state.queue,
      ep.text || '', ep.subtitlesUrl || '', ep.bgColor || '#1a1a2e',
      ep.allowDownload || false
    );
    closePanel();
  }
  function playNext() {
    if (!state.queue.length) return;
    let next = state.queueIndex + 1;
    if (state.shuffle) next = Math.floor(Math.random() * state.queue.length);
    if (next >= state.queue.length) { if (state.repeat === 2) next = 0; else return; }
    playQueueItem(next);
  }
  function playPrev() {
    if (activeMedia().currentTime > 3) { activeMedia().currentTime = 0; return; }
    if (!state.queue.length) return;
    let prev = state.queueIndex - 1;
    if (prev < 0) prev = state.repeat === 2 ? state.queue.length - 1 : 0;
    playQueueItem(prev);
  }

  function updateSpeedBadge() {
    const existing = $('.mp-badge', els.btnSpeed);
    if (existing) existing.remove();
    if (state.playbackRate !== 1) {
      const badge = ce('span');
      badge.className = 'mp-badge';
      badge.style.color = els.btnPlay.style.background;
      badge.style.background = els.btnPlay.style.color;
      badge.textContent = state.playbackRate + '';
      els.btnSpeed.appendChild(badge);
    }
  }

  /* ─── Event bindings ─── */
  function bindEvents() {
    [audioEl, videoEl].forEach(m => {
      m.addEventListener('play', () => { state.isPlaying = true; updatePlayBtn(); });
      m.addEventListener('pause', () => { state.isPlaying = false; updatePlayBtn(); });
      m.addEventListener('timeupdate', () => {
        state.currentTime = m.currentTime;
        state.duration = m.duration || 0;
        if (m === activeMedia()) { updateProgress(); }
      });
      m.addEventListener('loadedmetadata', () => { state.duration = m.duration || 0; updateProgress(); });
      m.addEventListener('ended', () => {
        if (state.timerType === 'end') {
          state.timerType = null;
          state.timerEnd = null;
          return;
        }
        if (state.repeat === 1) { m.currentTime = 0; m.play(); return; }
        playNext();
      });
    });

    els.btnPlay.addEventListener('click', togglePlay);
    els.miniPlay.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
    els.miniNext.addEventListener('click', (e) => { e.stopPropagation(); playNext(); });
    els.btnPrev.addEventListener('click', playPrev);
    els.btnNext.addEventListener('click', playNext);
    els.btnRew.addEventListener('click', () => seek(-10));
    els.btnFwd.addEventListener('click', () => seek(10));
    els.btnCollapse.addEventListener('click', collapse);
    els.panelClose.addEventListener('click', closePanel);
    els.btnMode.addEventListener('click', () => { switchMode(state.mode === 'video' ? 'audio' : 'video'); });
    els.btnSubtitle.addEventListener('click', () => {
      state.subtitlesOn = !state.subtitlesOn;
      els.btnSubtitle.classList.toggle('active', state.subtitlesOn);
      updateMediaArea();
      updateSubtitlesDisplay();
    });
    els.btnShuffle.addEventListener('click', () => {
      state.shuffle = !state.shuffle;
      els.btnShuffle.classList.toggle('active', state.shuffle);
    });
    els.btnRepeat.addEventListener('click', () => {
      state.repeat = (state.repeat + 1) % 3;
      if (state.repeat === 1) els.btnRepeat.innerHTML = icons.repeatOne;
      else els.btnRepeat.innerHTML = icons.repeat;
      els.btnRepeat.style.opacity = state.repeat ? '1' : '0.5';
    });
    els.btnSpeed.addEventListener('click', () => openPanel('Velocidad', buildSpeedPanel));
    els.btnTimer.addEventListener('click', () => openPanel('Temporizador', buildTimerPanel));
    els.btnQueue.addEventListener('click', () => openPanel('A continuación', buildQueuePanel));
    els.btnShare.addEventListener('click', () => openPanel('Compartir', buildSharePanel));
    els.btnMore.addEventListener('click', () => openPanel('Información', buildInfoPanel));
    els.btnFullscreen.addEventListener('click', showFullscreen);

    // Swipe up from bottom controls to open queue panel (existing gesture)
    const ctrlArea = $('.mp-controls-area', exp);
    let startY = 0;
    ctrlArea.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    ctrlArea.addEventListener('touchend', (e) => {
      const diff = startY - e.changedTouches[0].clientY;
      if (diff > 50 && !els.panel.classList.contains('open')) openPanel('A continuación', buildQueuePanel);
    }, { passive: true });
  }

  /* ─── Load episode ─── */
  function loadEpisode(mediaUrl, mediaVideo, initialMode, coverUrl, coverInfo, title, detailUrl, author, queue, text, subtitlesUrl, bgColor, allowDownload) {
    // reset timers
    if (state.timerType === 'minutes') { state.timerEnd = null; state.timerType = null; }
    if (state.timerType === 'end') state.timerType = null;

    state.mediaUrl = mediaUrl || '';
    state.mediaVideo = mediaVideo || '';
    state.coverUrl = coverUrl || '';
    state.coverInfo = coverInfo || '';
    state.title = title || '';
    state.detailUrl = detailUrl || '';
    state.author = author || '';
    state.queue = queue || [];
    state.text = text || '';
    state.subtitlesUrl = subtitlesUrl || '';
    state.bgColor = bgColor || '#1a1a2e';
    state.allowDownload = allowDownload === true || allowDownload === 'true';
    state.subtitlesOn = false;
    state.currentCue = '';

    if (initialMode === 'video' && state.mediaVideo) state.mode = 'video';
    else if (state.mediaUrl) state.mode = 'audio';
    else if (state.mediaVideo) state.mode = 'video';
    else state.mode = 'audio';

    if (state.mediaUrl) audioEl.src = state.mediaUrl;
    if (state.mediaVideo) videoEl.src = state.mediaVideo;

    els.btnSubtitle.style.display = state.subtitlesUrl ? '' : 'none';
    if (state.queue.length) {
      state.queueIndex = state.queue.findIndex(q => q.title === state.title);
      if (state.queueIndex === -1) state.queueIndex = 0;
    }

    applyColors(state.bgColor);
    updateUI();
    updateModeBtn();
    updateMediaArea();
    updateMediaSession();
    loadSubtitles(state.subtitlesUrl);

    mini.classList.remove('hidden');
    activeMedia().play().catch(() => {});
    expand();
  }

  /* ─── Init ─── */
  function init() {
    if (state.initialized) return;
    state.initialized = true;
    bindEvents();
  }

  /* ─── Global API ─── */
  window.playEpisodeExpanded = function (mediaUrl, mediaVideo, initialMode, coverUrl, coverInfo, title, detailUrl, author, queue, text, subtitlesUrl, bgColor, allowDownload) {
    init();
    loadEpisode(mediaUrl, mediaVideo, initialMode, coverUrl, coverInfo, title, detailUrl, author, queue, text, subtitlesUrl, bgColor, allowDownload);
  };
  window.mpCollapse = collapse;
  window.mpExpand = expand;
})();
