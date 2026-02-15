'use client';

import type { LoginFormElementProps, LoginDesignFormStyle } from '@/types/database';

interface Props {
  props: LoginFormElementProps;
  formStyle: LoginDesignFormStyle;
  width?: number; // Element width in canvas units for font scaling
  containerScale?: number; // Scale factor for WYSIWYG (actualContainerWidth / canvasWidth)
}

// Base width for scale calculation (from DEFAULT_LOGIN_FORM_ELEMENT)
const BASE_WIDTH = 400;

// Check if a color string has < 100% opacity (is rgba with alpha < 1)
function hasTransparency(color: string | undefined): boolean {
  if (!color) return false;
  const rgbaMatch = color.match(/rgba?\([\d\s,]+,\s*([\d.]+)\)/);
  if (rgbaMatch) return parseFloat(rgbaMatch[1]) < 1;
  if (color.length === 9 && color.startsWith('#')) {
    return parseInt(color.slice(7), 16) < 255;
  }
  return false;
}

export function LoginFormElement({ props, formStyle, width = BASE_WIDTH, containerScale = 1 }: Props) {
  const isCompact = props.variant === 'compact';
  const labelColor = formStyle.label_color || 'rgba(255, 255, 255, 0.6)';

  // Calculate scale factor based on width and container scale
  // The containerScale ensures WYSIWYG: form looks identical at any zoom level
  // Formula: (width / BASE_WIDTH) gives the logical scale based on element size
  //          containerScale adjusts for the actual rendered container size
  const logicalScale = Math.max(0.5, Math.min(1.5, width / BASE_WIDTH));
  const scale = logicalScale * containerScale;

  // Scaled font sizes
  const fontXs = `${Math.round(12 * scale)}px`;
  const fontSm = `${Math.round(14 * scale)}px`;
  const fontBase = `${Math.round(16 * scale)}px`;

  // Scaled heights
  const inputHeight = `${Math.round(36 * scale)}px`;
  const buttonHeight = `${Math.round(40 * scale)}px`;
  const padding = `${Math.round(24 * scale)}px`;

  // Border radius (default 8px, matching GHL)
  const borderRadius = formStyle.form_border_radius ?? 8;
  const borderWidth = formStyle.form_border_width ?? 0;

  // Scaled heading font size
  const headingFontSize = `${Math.round(24 * scale)}px`;

  const formBg = formStyle.form_bg || 'rgba(255,255,255,0.05)';

  return (
    <div
      className="w-full flex flex-col"
      style={{
        backgroundColor: formBg,
        ...(hasTransparency(formBg) ? { backdropFilter: 'blur(8px)' } : {}),
        padding,
        borderRadius: `${borderRadius}px`,
        border: borderWidth > 0 ? `${borderWidth}px solid ${formStyle.form_border || '#000000'}` : undefined,
      }}
    >
      {/* Form Logo — rendered via CSS ::before on .login-card-heading */}
      {formStyle.form_logo_url && (
        <img
          src={formStyle.form_logo_url}
          alt="Logo"
          className="w-auto mx-auto object-contain"
          style={{
            height: `${Math.round((formStyle.form_logo_height ?? 60) * scale)}px`,
            marginBottom: `${Math.round(12 * scale)}px`,
          }}
        />
      )}

      {/* Heading — hidden when blank (matches CSS export behavior) */}
      {formStyle.form_heading?.trim() && (
        <h2
          className="text-center font-semibold"
          style={{
            fontSize: headingFontSize,
            color: formStyle.form_heading_color || '#111827',
            marginBottom: `${Math.round(16 * scale)}px`,
          }}
        >
          {formStyle.form_heading}
        </h2>
      )}

      {/* Form fields */}
      <div
        className="flex flex-col"
        style={{ gap: isCompact ? `${Math.round(8 * scale)}px` : `${Math.round(12 * scale)}px` }}
      >
        {/* Email */}
        <div>
          <label
            className="block"
            style={{ color: labelColor, fontSize: fontXs, marginBottom: `${Math.round(4 * scale)}px` }}
          >
            Email
          </label>
          <div
            className="rounded-md flex items-center"
            style={{
              height: inputHeight,
              padding: `0 ${Math.round(12 * scale)}px`,
              fontSize: fontSm,
              backgroundColor: formStyle.input_bg,
              border: `1px solid ${formStyle.input_border}`,
              color: formStyle.input_text,
            }}
          >
            <span className="opacity-50">user@example.com</span>
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            className="block"
            style={{ color: labelColor, fontSize: fontXs, marginBottom: `${Math.round(4 * scale)}px` }}
          >
            Password
          </label>
          <div
            className="rounded-md flex items-center"
            style={{
              height: inputHeight,
              padding: `0 ${Math.round(12 * scale)}px`,
              fontSize: fontSm,
              backgroundColor: formStyle.input_bg,
              border: `1px solid ${formStyle.input_border}`,
              color: formStyle.input_text,
            }}
          >
            <span className="opacity-50">••••••••</span>
          </div>
        </div>

        {/* Forgot password link */}
        <div className="text-right">
          <span
            className="cursor-pointer"
            style={{ color: formStyle.link_color, fontSize: fontXs }}
          >
            Forgot password?
          </span>
        </div>

        {/* Submit button */}
        <button
          className="rounded-md font-medium"
          style={{
            height: buttonHeight,
            minHeight: buttonHeight,
            fontSize: fontSm,
            backgroundColor: formStyle.button_bg,
            color: formStyle.button_text,
            marginTop: `${Math.round(8 * scale)}px`,
          }}
        >
          Sign In
        </button>

        {/* "Or Continue with" divider + Google button — hidden when toggled off */}
        {!formStyle.hide_google_signin && (
          <>
            <div
              className="flex items-center"
              style={{
                gap: `${Math.round(8 * scale)}px`,
                marginTop: `${Math.round(12 * scale)}px`,
              }}
            >
              <div className="flex-1" style={{ height: '1px', backgroundColor: formStyle.input_border }} />
              <span style={{ fontSize: fontXs, color: formStyle.secondary_text_color || labelColor, whiteSpace: 'nowrap' }}>
                Or Continue with
              </span>
              <div className="flex-1" style={{ height: '1px', backgroundColor: formStyle.input_border }} />
            </div>

            <button
              className="rounded-md font-medium flex items-center justify-center"
              style={{
                height: buttonHeight,
                minHeight: buttonHeight,
                fontSize: fontSm,
                backgroundColor: 'transparent',
                color: labelColor,
                border: `1px solid ${formStyle.input_border}`,
                gap: `${Math.round(8 * scale)}px`,
                cursor: 'default',
              }}
            >
              <svg
                width={Math.round(16 * scale)}
                height={Math.round(16 * scale)}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </>
        )}

        {/* Terms and Conditions — matches GHL native */}
        <p
          className="text-center"
          style={{
            fontSize: `${Math.round(11 * scale)}px`,
            color: formStyle.secondary_text_color || labelColor,
            marginTop: `${Math.round(4 * scale)}px`,
          }}
        >
          By signing in you agree to our{' '}
          <span style={{ color: formStyle.link_color, cursor: 'pointer' }}>
            Terms and Conditions
          </span>
        </p>
      </div>
    </div>
  );
}
