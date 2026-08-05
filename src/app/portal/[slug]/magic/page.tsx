import { MagicLoginPageContent } from '@/app/portal/[slug]/magic/MagicLoginPageContent';

type PortalMagicLoginPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
};

const PortalMagicLoginPage = async ({ params, searchParams }: PortalMagicLoginPageProps) => {
  const { slug } = await params;
  const { token } = await searchParams;

  return <MagicLoginPageContent clinicSlug={slug} token={token ?? null} />;
};

export default PortalMagicLoginPage;
