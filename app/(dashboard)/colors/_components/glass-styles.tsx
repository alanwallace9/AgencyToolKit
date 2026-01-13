'use client';

export function GlassStyles() {
  return (
    <style jsx global>{`
      .colors-page {
        position: relative;
      }

      .colors-page::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
          radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
        pointer-events: none;
        z-index: -1;
      }

      .glass-panel {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.05),
          0 2px 4px -2px rgba(0, 0, 0, 0.05),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      }

      @media (prefers-color-scheme: dark) {
        .glass-panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.2),
            0 2px 4px -2px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
        }
      }

      /* Smooth color transitions for preview */
      .colors-page [style*="backgroundColor"],
      .colors-page [style*="color"],
      .colors-page [style*="borderColor"],
      .colors-page [style*="stroke"],
      .colors-page [style*="fill"] {
        transition: all 0.3s ease-out;
      }
    `}</style>
  );
}
