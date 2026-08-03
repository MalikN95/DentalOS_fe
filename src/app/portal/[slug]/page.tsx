import { PortalLoginPageContent } from '@/app/portal/[slug]/PortalLoginPageContent';

type PortalLoginPageProps = {
  params: Promise<{ slug: string }>;
};

const PortalLoginPage = async ({ params }: PortalLoginPageProps) => {
  const { slug } = await params;

  return <PortalLoginPageContent clinicSlug={slug} />;
};

export default PortalLoginPage;
