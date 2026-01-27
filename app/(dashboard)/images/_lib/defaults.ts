// Default values for image templates (not a server action file)

import type { ImageTemplateTextConfig } from '@/types/database';

export const DEFAULT_TEXT_CONFIG: ImageTemplateTextConfig = {
  x: 50,
  y: 50,
  width: 20.3,  // 130px on 640px canvas
  height: 12.2, // 44px on 360px canvas
  font: 'Poppins',
  size: 32,
  font_weight: 'bold',
  text_align: 'center',
  text_transform: 'none',
  color: '#000000', // Black text
  background_color: '#FFFFFF', // White box
  padding: 12,
  fallback: 'Friend',
  prefix: '',
  suffix: '',
};
