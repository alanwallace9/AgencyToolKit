import { PageHeader } from '@/components/shared/page-header';
import { LoginDesigner } from './_components/login-designer';
import { getLoginDesigns, getDefaultLoginDesign } from './_actions/login-actions';
import { getDefaultColors } from '../colors/_actions/color-actions';

export default async function LoginPage() {
  const [designs, currentDesign, brandColors] = await Promise.all([
    getLoginDesigns(),
    getDefaultLoginDesign(),
    getDefaultColors(),
  ]);

  return (
    <>
      <PageHeader
        title="Login Designer"
        description="Design a custom branded login page with drag-and-drop"
      />

      <LoginDesigner
        designs={designs}
        currentDesign={currentDesign}
        brandColors={brandColors}
      />
    </>
  );
}
