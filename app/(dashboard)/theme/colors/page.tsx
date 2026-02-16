'use client';

import { ThemeStatusProvider } from '../_context/theme-status-context';
import { ColorsTabContent } from '../_components/tabs/colors-tab-content';

export default function ThemeColorsPage() {
  return (
    <ThemeStatusProvider>
      <div className="h-full overflow-auto py-8 px-8 lg:px-14">
        <ColorsTabContent />
      </div>
    </ThemeStatusProvider>
  );
}
