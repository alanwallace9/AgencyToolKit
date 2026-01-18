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
  const logoHeight = `${Math.round(40 * scale)}px`;
  const padding = `${Math.round(24 * scale)}px`;

  // Border radius (default 12px)
  const borderRadius = formStyle.form_border_radius ?? 12;
  const borderWidth = formStyle.form_border_width ?? 1;

  // Scaled heading font size
  const headingFontSize = `${Math.round(24 * scale)}px`;

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        backgroundColor: formStyle.form_bg || 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
        padding,
        borderRadius: `${borderRadius}px`,
        border: formStyle.form_border ? `${borderWidth}px solid ${formStyle.form_border}` : undefined,
      }}
    >
      {/* Logo */}
      {formStyle.logo_url ? (
        <img
          src={formStyle.logo_url}
          alt="Logo"
          className="w-auto mx-auto object-contain"
          style={{ height: logoHeight, marginBottom: `${Math.round(16 * scale)}px` }}
        />
      ) : (
        <div
          className="bg-white/10 rounded-lg mx-auto flex items-center justify-center"
          style={{
            width: logoHeight,
            height: logoHeight,
            marginBottom: `${Math.round(16 * scale)}px`,
          }}
        >
          <span className="text-white/50" style={{ fontSize: fontXs }}>Logo</span>
        </div>
      )}

      {/* Heading */}
      {formStyle.form_heading && (
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
      </div>
    </div>
  );
}
