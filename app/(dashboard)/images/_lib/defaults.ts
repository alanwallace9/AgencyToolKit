// Default values for image templates (not a server action file)

import type { ImageTemplateTextConfig } from '@/types/database';

export const DEFAULT_TEXT_CONFIG: ImageTemplateTextConfig = {
  x: 50,
  y: 80,
  width: 40,
  height: 10,
  font: 'Poppins',
  size: 32,
  font_weight: 'bold',
  text_align: 'center',
  text_transform: 'none',
  color: '#000000', // Black text (pairs with white box default)
  background_color: null,
  padding: 8,
  fallback: 'Friend',
  prefix: '', // Empty by default - user can add
  suffix: '', // Empty by default - user can add
};
