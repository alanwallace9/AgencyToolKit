// Loading Animation Definitions
// Each animation includes CSS and HTML that will be injected into GHL

export type AnimationCategory = 'minimal' | 'playful' | 'professional' | 'creative';

export interface LoadingAnimation {
  id: string;
  label: string;
  description: string;
  category: AnimationCategory;
  css: string;
  html: string;
}

// CSS variable for color customization: var(--loading-color, #3b82f6)
// Background color: var(--loading-bg, transparent)

export const LOADING_ANIMATIONS: LoadingAnimation[] = [
  // Minimal
  {
    id: 'pulse-dot',
    label: 'Pulse Dot',
    description: 'Simple pulsing circle',
    category: 'minimal',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-pulse-dot{width:16px;height:16px;background:var(--loading-color,#3b82f6);border-radius:50%;animation:at-pulse 1.2s ease-in-out infinite}
@keyframes at-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.5}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-pulse-dot"></div></div>',
  },
  {
    id: 'spinning-ring',
    label: 'Spinning Ring',
    description: 'Rotating ring border',
    category: 'professional',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-ring{width:40px;height:40px;border:3px solid rgba(0,0,0,0.1);border-top-color:var(--loading-color,#3b82f6);border-radius:50%;animation:at-spin 1.5s linear infinite}
@keyframes at-spin{to{transform:rotate(360deg)}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-ring"></div></div>',
  },
  {
    id: 'bouncing-dots',
    label: 'Bouncing Dots',
    description: 'Three bouncing dots',
    category: 'playful',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-bounce{display:flex;gap:6px}
.at-bounce span{width:10px;height:10px;background:var(--loading-color,#3b82f6);border-radius:50%;animation:at-bounce 0.6s ease-in-out infinite}
.at-bounce span:nth-child(2){animation-delay:0.1s}
.at-bounce span:nth-child(3){animation-delay:0.2s}
@keyframes at-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-bounce"><span></span><span></span><span></span></div></div>',
  },
  {
    id: 'progress-bar',
    label: 'Progress Bar',
    description: 'Animated progress bar',
    category: 'professional',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-progress{width:120px;height:4px;background:rgba(0,0,0,0.1);border-radius:2px;overflow:hidden}
.at-progress-bar{height:100%;background:var(--loading-color,#3b82f6);border-radius:2px;animation:at-progress 1.5s ease-in-out infinite}
@keyframes at-progress{0%{width:0;margin-left:0}50%{width:100%;margin-left:0}100%{width:0;margin-left:100%}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-progress"><div class="at-progress-bar"></div></div></div>',
  },
  {
    id: 'morphing-square',
    label: 'Morphing Square',
    description: 'Shape-shifting square',
    category: 'creative',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-morph{width:24px;height:24px;background:var(--loading-color,#3b82f6);animation:at-morph 1.2s ease-in-out infinite}
@keyframes at-morph{0%,100%{border-radius:0;transform:rotate(0deg)}50%{border-radius:50%;transform:rotate(180deg)}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-morph"></div></div>',
  },
  {
    id: 'rotating-squares',
    label: 'Rotating Squares',
    description: 'Two rotating squares',
    category: 'creative',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-squares{position:relative;width:40px;height:40px}
.at-squares span{position:absolute;width:16px;height:16px;background:var(--loading-color,#3b82f6)}
.at-squares span:first-child{top:0;left:0;animation:at-sq1 2.5s ease-in-out infinite}
.at-squares span:last-child{bottom:0;right:0;animation:at-sq2 2.5s ease-in-out infinite}
@keyframes at-sq1{0%,100%{transform:translate(0,0)}25%{transform:translate(24px,0)}50%{transform:translate(24px,24px)}75%{transform:translate(0,24px)}}
@keyframes at-sq2{0%,100%{transform:translate(0,0)}25%{transform:translate(-24px,0)}50%{transform:translate(-24px,-24px)}75%{transform:translate(0,-24px)}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-squares"><span></span><span></span></div></div>',
  },
  {
    id: 'gradient-spinner',
    label: 'Gradient Spinner',
    description: 'Gradient colored spinner',
    category: 'creative',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-gradient{width:40px;height:40px;border-radius:50%;background:conic-gradient(from 0deg,transparent,var(--loading-color,#3b82f6));animation:at-spin 1.5s linear infinite;-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px))}
@keyframes at-spin{to{transform:rotate(360deg)}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-gradient"></div></div>',
  },
  {
    id: 'heartbeat',
    label: 'Heartbeat',
    description: 'Pulsing heart animation',
    category: 'playful',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-heart{position:relative;width:24px;height:22px;animation:at-heartbeat 1s ease-in-out infinite}
.at-heart:before,.at-heart:after{content:'';position:absolute;top:0;width:14px;height:22px;background:var(--loading-color,#3b82f6);border-radius:14px 14px 0 0}
.at-heart:before{left:12px;transform:rotate(-45deg);transform-origin:0 100%}
.at-heart:after{left:0;transform:rotate(45deg);transform-origin:100% 100%}
@keyframes at-heartbeat{0%,100%{transform:scale(1)}15%{transform:scale(1.15)}30%{transform:scale(1)}45%{transform:scale(1.1)}60%{transform:scale(1)}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-heart"></div></div>',
  },
  {
    id: 'wave-bars',
    label: 'Wave Bars',
    description: 'Voice/audio visualization',
    category: 'playful',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-wave{display:flex;gap:3px;align-items:end;height:32px}
.at-wave span{width:4px;background:var(--loading-color,#3b82f6);border-radius:2px}
.at-wave span:nth-child(1){animation:at-voice1 1.8s steps(4) infinite}
.at-wave span:nth-child(2){animation:at-voice2 1.6s steps(4) infinite}
.at-wave span:nth-child(3){animation:at-voice3 2s steps(4) infinite}
.at-wave span:nth-child(4){animation:at-voice4 1.7s steps(4) infinite}
.at-wave span:nth-child(5){animation:at-voice5 1.9s steps(4) infinite}
@keyframes at-voice1{0%{height:8px}25%{height:24px}50%{height:12px}75%{height:28px}100%{height:8px}}
@keyframes at-voice2{0%{height:20px}25%{height:8px}50%{height:32px}75%{height:16px}100%{height:20px}}
@keyframes at-voice3{0%{height:12px}25%{height:28px}50%{height:8px}75%{height:20px}100%{height:12px}}
@keyframes at-voice4{0%{height:28px}25%{height:12px}50%{height:24px}75%{height:8px}100%{height:28px}}
@keyframes at-voice5{0%{height:16px}25%{height:32px}50%{height:20px}75%{height:12px}100%{height:16px}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-wave"><span></span><span></span><span></span><span></span><span></span></div></div>',
  },
  {
    id: 'orbiting-dots',
    label: 'Orbiting Dots',
    description: 'Dots orbiting center',
    category: 'professional',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-orbit{position:relative;width:40px;height:40px;animation:at-spin 2s linear infinite}
.at-orbit span{position:absolute;width:8px;height:8px;background:var(--loading-color,#3b82f6);border-radius:50%}
.at-orbit span:nth-child(1){top:0;left:50%;margin-left:-4px}
.at-orbit span:nth-child(2){top:50%;right:0;margin-top:-4px;opacity:0.8}
.at-orbit span:nth-child(3){bottom:0;left:50%;margin-left:-4px;opacity:0.6}
.at-orbit span:nth-child(4){top:50%;left:0;margin-top:-4px;opacity:0.4}
@keyframes at-spin{to{transform:rotate(360deg)}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-orbit"><span></span><span></span><span></span><span></span></div></div>',
  },
  {
    id: 'typing-dots',
    label: 'Typing Dots',
    description: 'iPhone-style typing indicator',
    category: 'minimal',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-typing{display:flex;gap:4px;padding:12px 16px;background:rgba(0,0,0,0.08);border-radius:20px}
.at-typing span{width:8px;height:8px;background:var(--loading-color,#3b82f6);border-radius:50%;opacity:0.4;animation:at-typing-pulse 1.4s ease-in-out infinite}
.at-typing span:nth-child(2){animation-delay:0.2s}
.at-typing span:nth-child(3){animation-delay:0.4s}
@keyframes at-typing-pulse{0%,60%,100%{opacity:0.4;transform:scale(1)}30%{opacity:1;transform:scale(1.2)}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-typing"><span></span><span></span><span></span></div></div>',
  },

  // Custom 3x3 Grid Animations
  // Grid positions: 1 2 3 / 4 5 6 / 7 8 9
  // Full 8-step slide: 5 empty → 4→5 → 7→4 → 8→7 → 9→8 → 6→9 → 3→6 → 2→3 → 5→2 → loop
  // Each step ~10%, with pause at end before instant reset
  {
    id: 'grid-slide',
    label: 'Grid Slide',
    description: '3x3 sliding puzzle',
    category: 'creative',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-grid{display:grid;grid-template-columns:repeat(3,12px);gap:3px}
.at-grid span{width:12px;height:12px;background:var(--loading-color,#3b82f6);border-radius:2px}
.at-grid span:nth-child(5){opacity:0}
.at-grid span:nth-child(4){animation:at-s4 10s linear infinite}
.at-grid span:nth-child(7){animation:at-s7 10s linear infinite}
.at-grid span:nth-child(8){animation:at-s8 10s linear infinite}
.at-grid span:nth-child(9){animation:at-s9 10s linear infinite}
.at-grid span:nth-child(6){animation:at-s6 10s linear infinite}
.at-grid span:nth-child(3){animation:at-s3 10s linear infinite}
.at-grid span:nth-child(2){animation:at-s2 10s linear infinite}
@keyframes at-s4{0%{transform:translate(0,0)}10%,70%{transform:translate(15px,0)}80%,89%{transform:translate(15px,-15px)}90%,100%{transform:translate(0,0)}}
@keyframes at-s7{0%,10%{transform:translate(0,0)}20%,89%{transform:translate(0,-15px)}90%,100%{transform:translate(0,0)}}
@keyframes at-s8{0%,20%{transform:translate(0,0)}30%,89%{transform:translate(-15px,0)}90%,100%{transform:translate(0,0)}}
@keyframes at-s9{0%,30%{transform:translate(0,0)}40%,89%{transform:translate(-15px,0)}90%,100%{transform:translate(0,0)}}
@keyframes at-s6{0%,40%{transform:translate(0,0)}50%,89%{transform:translate(0,15px)}90%,100%{transform:translate(0,0)}}
@keyframes at-s3{0%,50%{transform:translate(0,0)}60%,89%{transform:translate(0,15px)}90%,100%{transform:translate(0,0)}}
@keyframes at-s2{0%,60%{transform:translate(0,0)}70%,89%{transform:translate(15px,0)}90%,100%{transform:translate(0,0)}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-grid"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div>',
  },
  {
    id: 'grid-rotate',
    label: 'Grid Rotate',
    description: '3x3 clockwise rotation',
    category: 'creative',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-grid-rotate{display:grid;grid-template-columns:repeat(3,10px);gap:4px;animation:at-grid-spin 3s linear infinite}
.at-grid-rotate span{width:10px;height:10px;background:var(--loading-color,#3b82f6);border-radius:2px}
.at-grid-rotate span:nth-child(1){animation:at-fade 1.5s ease-in-out 0s infinite}
.at-grid-rotate span:nth-child(2){animation:at-fade 1.5s ease-in-out 0.1s infinite}
.at-grid-rotate span:nth-child(3){animation:at-fade 1.5s ease-in-out 0.2s infinite}
.at-grid-rotate span:nth-child(6){animation:at-fade 1.5s ease-in-out 0.3s infinite}
.at-grid-rotate span:nth-child(9){animation:at-fade 1.5s ease-in-out 0.4s infinite}
.at-grid-rotate span:nth-child(8){animation:at-fade 1.5s ease-in-out 0.5s infinite}
.at-grid-rotate span:nth-child(7){animation:at-fade 1.5s ease-in-out 0.6s infinite}
.at-grid-rotate span:nth-child(4){animation:at-fade 1.5s ease-in-out 0.7s infinite}
.at-grid-rotate span:nth-child(5){opacity:0.3}
@keyframes at-grid-spin{to{transform:rotate(360deg)}}
@keyframes at-fade{0%,100%{opacity:0.3}50%{opacity:1}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-grid-rotate"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div>',
  },
  {
    id: 'grid-fold',
    label: 'Grid Fold',
    description: '3x3 domino fold effect',
    category: 'creative',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-grid-fold{display:grid;grid-template-columns:repeat(3,12px);gap:3px;perspective:200px}
.at-grid-fold span{width:12px;height:12px;background:var(--loading-color,#3b82f6);border-radius:2px}
.at-grid-fold span:nth-child(7){animation:at-f7 10s ease-in-out infinite;transform-origin:center top}
.at-grid-fold span:nth-child(4){animation:at-f4 10s ease-in-out infinite;transform-origin:center top}
.at-grid-fold span:nth-child(1){animation:at-f1 10s ease-in-out infinite;transform-origin:center right}
.at-grid-fold span:nth-child(2){animation:at-f2 10s ease-in-out infinite;transform-origin:center right}
.at-grid-fold span:nth-child(3){animation:at-f3 10s ease-in-out infinite;transform-origin:center bottom}
.at-grid-fold span:nth-child(6){animation:at-f6 10s ease-in-out infinite;transform-origin:center bottom}
.at-grid-fold span:nth-child(9){animation:at-f9 10s ease-in-out infinite;transform-origin:center left}
.at-grid-fold span:nth-child(8){animation:at-f8 10s ease-in-out infinite;transform-origin:center top}
@keyframes at-f7{0%,5%{transform:rotateX(0);opacity:1}10%{transform:rotateX(-90deg);opacity:0}90%{transform:rotateX(-90deg);opacity:0}95%,100%{transform:rotateX(0);opacity:1}}
@keyframes at-f4{0%,10%{transform:rotateX(0);opacity:1}15%{transform:rotateX(-90deg);opacity:0}85%{transform:rotateX(-90deg);opacity:0}90%,100%{transform:rotateX(0);opacity:1}}
@keyframes at-f1{0%,15%{transform:rotateY(0);opacity:1}20%{transform:rotateY(90deg);opacity:0}80%{transform:rotateY(90deg);opacity:0}85%,100%{transform:rotateY(0);opacity:1}}
@keyframes at-f2{0%,20%{transform:rotateY(0);opacity:1}25%{transform:rotateY(90deg);opacity:0}75%{transform:rotateY(90deg);opacity:0}80%,100%{transform:rotateY(0);opacity:1}}
@keyframes at-f3{0%,25%{transform:rotateX(0);opacity:1}30%{transform:rotateX(90deg);opacity:0}70%{transform:rotateX(90deg);opacity:0}75%,100%{transform:rotateX(0);opacity:1}}
@keyframes at-f6{0%,30%{transform:rotateX(0);opacity:1}35%{transform:rotateX(90deg);opacity:0}65%{transform:rotateX(90deg);opacity:0}70%,100%{transform:rotateX(0);opacity:1}}
@keyframes at-f9{0%,35%{transform:rotateY(0);opacity:1}40%{transform:rotateY(-90deg);opacity:0}60%{transform:rotateY(-90deg);opacity:0}65%,100%{transform:rotateY(0);opacity:1}}
@keyframes at-f8{0%,40%{transform:rotateX(0);opacity:1}45%{transform:rotateX(-90deg);opacity:0}55%{transform:rotateX(-90deg);opacity:0}60%,100%{transform:rotateX(0);opacity:1}}
    `.trim(),
    html: '<div class="at-loader"><div class="at-grid-fold"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div>',
  },
];

// Get animation by ID
export function getAnimationById(id: string): LoadingAnimation | undefined {
  return LOADING_ANIMATIONS.find((anim) => anim.id === id);
}

// Get animations by category
export function getAnimationsByCategory(category: AnimationCategory): LoadingAnimation[] {
  return LOADING_ANIMATIONS.filter((anim) => anim.category === category);
}

// Get all categories
export function getCategories(): AnimationCategory[] {
  return ['minimal', 'playful', 'professional', 'creative'];
}

// Generate CSS with custom colors
export function generateAnimationCSS(
  animation: LoadingAnimation,
  customColor?: string,
  backgroundColor?: string
): string {
  let css = animation.css;

  if (customColor) {
    css = css.replace(/var\(--loading-color,[^)]+\)/g, customColor);
  }

  if (backgroundColor) {
    css = css.replace(/var\(--loading-bg,[^)]+\)/g, backgroundColor);
  }

  return css;
}
