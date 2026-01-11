'use client';

import type { LoginFormElementProps, LoginDesignFormStyle } from '@/types/database';

interface Props {
  props: LoginFormElementProps;
  formStyle: LoginDesignFormStyle;
}

export function LoginFormElement({ props, formStyle }: Props) {
  const isCompact = props.variant === 'compact';

  return (
    <div
      className="w-full h-full rounded-lg p-6 flex flex-col"
      style={{
        backgroundColor: formStyle.form_bg || 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Logo placeholder */}
      <div className="w-10 h-10 bg-white/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
        <span className="text-white/50 text-xs">Logo</span>
      </div>

      {/* Form fields */}
      <div className={`flex-1 flex flex-col ${isCompact ? 'gap-2' : 'gap-3'}`}>
        {/* Email */}
        <div>
          <label className="text-xs text-white/60 mb-1 block">Email</label>
          <div
            className="h-9 rounded-md px-3 flex items-center text-sm"
            style={{
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
          <label className="text-xs text-white/60 mb-1 block">Password</label>
          <div
            className="h-9 rounded-md px-3 flex items-center text-sm"
            style={{
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
            className="text-xs cursor-pointer"
            style={{ color: formStyle.link_color }}
          >
            Forgot password?
          </span>
        </div>

        {/* Submit button */}
        <button
          className="h-10 rounded-md font-medium text-sm mt-auto"
          style={{
            backgroundColor: formStyle.button_bg,
            color: formStyle.button_text,
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
