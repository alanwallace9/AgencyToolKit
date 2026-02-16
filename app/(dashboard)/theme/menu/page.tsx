'use client';

import { ThemeStatusProvider } from '../_context/theme-status-context';
import { MenuTabContent } from '../_components/tabs/menu-tab-content';

export default function ThemeMenuPage() {
  return (
    <ThemeStatusProvider>
      <div className="h-full overflow-auto py-8 px-8 lg:px-14">
        <MenuTabContent />
      </div>
    </ThemeStatusProvider>
  );
}
