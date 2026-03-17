import type { Metadata } from 'next';

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ name?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { templateId } = await params;
  const { name = 'Friend' } = await searchParams;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toolkit.getrapidreviews.com';
  const imageUrl = `${appUrl}/api/images/${templateId}?name=${encodeURIComponent(name)}`;
  const title = name && name !== 'Friend' ? `Hi ${name}!` : 'Personalized image';

  return {
    title,
    openGraph: {
      title,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 450,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [imageUrl],
    },
  };
}

export default async function ImageSharePage({ params, searchParams }: Props) {
  const { templateId } = await params;
  const { name = '' } = await searchParams;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toolkit.getrapidreviews.com';
  const imageUrl = `${appUrl}/api/images/${templateId}?name=${encodeURIComponent(name)}`;

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        background: '#000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={name ? `Hi ${name}!` : 'Personalized image'}
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  );
}
