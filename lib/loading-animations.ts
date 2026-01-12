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
.at-ring{width:40px;height:40px;border:3px solid rgba(0,0,0,0.1);border-top-color:var(--loading-color,#3b82f6);border-radius:50%;animation:at-spin 0.8s linear infinite}
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
.at-squares span:first-child{top:0;left:0;animation:at-sq1 1s ease-in-out infinite}
.at-squares span:last-child{bottom:0;right:0;animation:at-sq2 1s ease-in-out infinite}
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
.at-gradient{width:40px;height:40px;border-radius:50%;background:conic-gradient(from 0deg,transparent,var(--loading-color,#3b82f6));animation:at-spin 0.8s linear infinite;-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px))}
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
    description: 'Equalizer-style bars',
    category: 'playful',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-wave{display:flex;gap:4px;align-items:center;height:32px}
.at-wave span{width:4px;height:100%;background:var(--loading-color,#3b82f6);border-radius:2px;animation:at-wave 1s ease-in-out infinite}
.at-wave span:nth-child(1){animation-delay:0s}
.at-wave span:nth-child(2){animation-delay:0.1s}
.at-wave span:nth-child(3){animation-delay:0.2s}
.at-wave span:nth-child(4){animation-delay:0.3s}
.at-wave span:nth-child(5){animation-delay:0.4s}
@keyframes at-wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
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

  // Custom 3x3 Grid Animations
  {
    id: 'grid-slide',
    label: 'Grid Slide',
    description: '3x3 sliding puzzle effect',
    category: 'creative',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-grid{display:grid;grid-template-columns:repeat(3,12px);gap:3px}
.at-grid span{width:12px;height:12px;background:var(--loading-color,#3b82f6);border-radius:2px;animation:at-grid-slide 2s ease-in-out infinite}
.at-grid span:nth-child(1){animation-delay:0s}
.at-grid span:nth-child(2){animation-delay:0.1s}
.at-grid span:nth-child(3){animation-delay:0.2s}
.at-grid span:nth-child(4){animation-delay:0.7s}
.at-grid span:nth-child(5){animation-delay:0.4s;opacity:0}
.at-grid span:nth-child(6){animation-delay:0.3s}
.at-grid span:nth-child(7){animation-delay:0.6s}
.at-grid span:nth-child(8){animation-delay:0.5s}
.at-grid span:nth-child(9){animation-delay:0.4s}
@keyframes at-grid-slide{0%,100%{transform:translate(0,0);opacity:1}25%{transform:translate(15px,0)}50%{transform:translate(15px,15px)}75%{transform:translate(0,15px)}}
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
    description: '3x3 folding around perimeter',
    category: 'creative',
    css: `
.at-loader{display:flex;align-items:center;justify-content:center;height:100%;background:var(--loading-bg,transparent)}
.at-grid-fold{display:grid;grid-template-columns:repeat(3,12px);gap:3px;perspective:120px}
.at-grid-fold span{width:12px;height:12px;background:var(--loading-color,#3b82f6);border-radius:2px;transform-style:preserve-3d}
.at-grid-fold span:nth-child(1){animation:at-fold-1 2.4s ease-in-out infinite}
.at-grid-fold span:nth-child(2){animation:at-fold-2 2.4s ease-in-out 0.3s infinite}
.at-grid-fold span:nth-child(3){animation:at-fold-3 2.4s ease-in-out 0.6s infinite}
.at-grid-fold span:nth-child(6){animation:at-fold-4 2.4s ease-in-out 0.9s infinite}
.at-grid-fold span:nth-child(9){animation:at-fold-5 2.4s ease-in-out 1.2s infinite}
.at-grid-fold span:nth-child(8){animation:at-fold-6 2.4s ease-in-out 1.5s infinite}
.at-grid-fold span:nth-child(7){animation:at-fold-7 2.4s ease-in-out 1.8s infinite}
.at-grid-fold span:nth-child(4){animation:at-fold-8 2.4s ease-in-out 2.1s infinite}
.at-grid-fold span:nth-child(5){opacity:0.4}
@keyframes at-fold-1{0%,20%,100%{transform:rotateY(0)}10%{transform:rotateY(90deg)}}
@keyframes at-fold-2{0%,20%,100%{transform:rotateX(0)}10%{transform:rotateX(-90deg)}}
@keyframes at-fold-3{0%,20%,100%{transform:rotateY(0)}10%{transform:rotateY(-90deg)}}
@keyframes at-fold-4{0%,20%,100%{transform:rotateX(0)}10%{transform:rotateX(-90deg)}}
@keyframes at-fold-5{0%,20%,100%{transform:rotateY(0)}10%{transform:rotateY(-90deg)}}
@keyframes at-fold-6{0%,20%,100%{transform:rotateX(0)}10%{transform:rotateX(90deg)}}
@keyframes at-fold-7{0%,20%,100%{transform:rotateY(0)}10%{transform:rotateY(90deg)}}
@keyframes at-fold-8{0%,20%,100%{transform:rotateX(0)}10%{transform:rotateX(90deg)}}
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
