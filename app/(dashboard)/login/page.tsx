import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCurrentAgency } from '@/lib/auth';
import { LoginDesigner } from './_components/login-designer';
import { getLoginDesigns, getDefaultLoginDesign } from './_actions/login-actions';

export default async function LoginPage() {
  const agency = await getCurrentAgency();
  const isPro = agency?.plan === 'pro' || agency?.plan === 'toolkit';

  if (!isPro) {
    return (
      <>
        <PageHeader
          title="Login Designer"
          description="Design a custom branded login page with drag-and-drop"
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <Badge variant="secondary" className="mb-2">
              Pro Feature
            </Badge>
            <h3 className="font-medium">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Login customization is available on the Pro plan. Upgrade to create
              custom branded login pages with drag-and-drop.
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  const [designs, currentDesign] = await Promise.all([
    getLoginDesigns(),
    getDefaultLoginDesign(),
  ]);

  return (
    <>
      <PageHeader
        title="Login Designer"
        description="Design a custom branded login page with drag-and-drop"
      />

      <LoginDesigner designs={designs} currentDesign={currentDesign} />
    </>
  );
}
