'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateLoginCss } from '@/app/(dashboard)/settings/_components/css-export-card';
import type {
  CanvasElement,
  LoginDesignBackground,
  LoginDesignFormStyle,
  LoginDesign,
} from '@/types/database';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: {
    width: number;
    height: number;
    background: LoginDesignBackground;
  };
  elements: CanvasElement[];
  formStyle: LoginDesignFormStyle;
}

/**
 * Scope CSS selectors to .ghl-preview-scope and replace vh units with %
 * so the preview container acts as the "viewport" instead of the browser window.
 */
function scopeAndAdaptCss(css: string): string {
  return css
    // Prefix selectors with .ghl-preview-scope
    .replace(
      /^(\.[a-z_-]|#[a-z_-]|p\.)/gm,
      '.ghl-preview-scope $&'
    )
    // Replace vh units with % (preview container = viewport)
    .replace(/(\d+)vh/g, '$1%');
}

export function PreviewModal({
  isOpen,
  onClose,
  canvas,
  elements,
  formStyle,
}: PreviewModalProps) {
  // Build a LoginDesign object from the current editor state
  const loginDesign: LoginDesign = useMemo(
    () => ({
      id: 'preview',
      agency_id: '',
      name: 'Preview',
      layout: 'centered' as const,
      canvas,
      elements,
      form_style: formStyle,
      is_default: false,
      created_at: '',
      updated_at: '',
    }),
    [canvas, elements, formStyle]
  );

  const css = useMemo(() => generateLoginCss(loginDesign), [loginDesign]);

  // Scope CSS and convert vh → % for the preview container
  const scopedCss = useMemo(() => scopeAndAdaptCss(css), [css]);

  // GHL baseline styles — the native styles our CSS builds on top of.
  // Without these, the generated CSS won't render correctly in the preview.
  const ghlBaseStyles = `
    .ghl-preview-scope .hl_login {
      height: 100%;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .ghl-preview-scope .hl_login--header {
      padding: 12px 24px;
    }
    .ghl-preview-scope .hl_login--body {
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .ghl-preview-scope .card {
      max-width: 550px;
      width: 100%;
      margin: 0 auto;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .ghl-preview-scope .card-body {
      padding: 32px 40px;
    }
    .ghl-preview-scope .heading2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 16px;
      color: #111827;
    }
    .ghl-preview-scope .hl-text-input-label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
    .ghl-preview-scope .hl-text-input,
    .ghl-preview-scope input[type="email"],
    .ghl-preview-scope input[type="password"] {
      height: 42px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #ffffff;
      outline: none;
    }
    .ghl-preview-scope button.hl-btn,
    .ghl-preview-scope button[type="submit"] {
      border-radius: 6px;
      cursor: default;
    }
    .ghl-preview-scope a {
      text-decoration: none;
      cursor: default;
    }
    .ghl-preview-scope .foot-note {
      margin: 0;
    }
    .ghl-preview-scope #wl_google_login_button button {
      background-color: #2563eb;
      color: #ffffff;
      border: none;
      font-weight: 500;
    }
  `;

  if (!isOpen) return null;

  const headingText = formStyle.form_heading?.trim() || '';
  const showHeading = headingText.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Preview container — 16:9 aspect ratio like the editor canvas */}
      <div
        className="relative"
        style={{
          width: `min(90vw, 1600px, calc(85vh * ${canvas.width / canvas.height}))`,
        }}
      >
        <div
          style={{ paddingBottom: `${(canvas.height / canvas.width) * 100}%` }}
          className="relative w-full"
        >
          {/* GHL mockup — scoped CSS styles the HTML just like GHL would */}
          <div className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl ghl-preview-scope">
            {/* GHL base styles first, then generated CSS overrides on top */}
            <style dangerouslySetInnerHTML={{ __html: ghlBaseStyles + '\n' + scopedCss }} />

            {/* GHL HTML structure mockup */}
            <div className="hl_login" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              {/* Header bar (logo + language picker) */}
              <div className="hl_login--header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 24px',
                position: 'relative',
                zIndex: 1,
              }}>
                {formStyle.logo_url ? (
                  <img src={formStyle.logo_url} alt="Logo" style={{ maxHeight: 48 }} />
                ) : (
                  <div style={{ height: 32 }} />
                )}
              </div>

              {/* Body — contains the form card */}
              <div className="hl_login--body" style={{ position: 'relative', zIndex: 1 }}>
                <div className="card">
                  <div className="card-body">
                    {/* Form logo */}
                    {formStyle.form_logo_url && (
                      <div className="login-card-heading" style={{ textAlign: 'center' }}>
                        <img
                          src={formStyle.form_logo_url}
                          alt="Form Logo"
                          style={{
                            height: formStyle.form_logo_height ?? 60,
                            objectFit: 'contain',
                            margin: '0 auto 12px',
                          }}
                        />
                      </div>
                    )}

                    {/* Heading */}
                    {showHeading && (
                      <div className="login-card-heading">
                        <h2
                          className="heading2"
                          style={{ textAlign: 'center', marginBottom: 16, fontSize: 24, fontWeight: 600 }}
                        >
                          {headingText}
                        </h2>
                      </div>
                    )}

                    {/* Email field */}
                    <div style={{ marginBottom: 12 }}>
                      <label className="hl-text-input-label" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
                        Email
                      </label>
                      <input
                        type="email"
                        className="hl-text-input"
                        placeholder="user@example.com"
                        readOnly
                        style={{ width: '100%', padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Password field */}
                    <div style={{ marginBottom: 12 }}>
                      <label className="hl-text-input-label" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
                        Password
                      </label>
                      <input
                        type="password"
                        className="hl-text-input"
                        placeholder="••••••••"
                        readOnly
                        style={{ width: '100%', padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Forgot password */}
                    <div style={{ textAlign: 'right', marginBottom: 16 }}>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-link" style={{ fontSize: 12 }}>
                        Forgot password?
                      </a>
                    </div>

                    {/* Sign In button */}
                    <button
                      type="submit"
                      className="hl-btn"
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'default',
                        border: 'none',
                        borderRadius: 6,
                      }}
                    >
                      Sign In
                    </button>

                    {/* Google sign-in section */}
                    <div className="mt-6" style={{ marginTop: 24 }}>
                      {/* "Or Continue with" divider */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
                        <span style={{ fontSize: 12, whiteSpace: 'nowrap', padding: '0 4px' }}>
                          Or Continue with
                        </span>
                        <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
                      </div>

                      {/* Google button — no inline bg/border so CSS can style it */}
                      <div id="wl_google_login_button">
                        <button
                          style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: 14,
                            borderRadius: 6,
                            cursor: 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                          }}
                        >
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Sign in with Google
                        </button>
                      </div>
                    </div>

                    {/* Terms footer */}
                    <p className="foot-note" style={{ textAlign: 'center', fontSize: 11, marginTop: 16 }}>
                      By signing in you agree to our{' '}
                      <a href="#" onClick={(e) => e.preventDefault()}>Terms and Conditions</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Preview label */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/50 text-white text-sm rounded backdrop-blur">
          Preview Mode — CSS output
        </div>
      </div>
    </div>
  );
}
