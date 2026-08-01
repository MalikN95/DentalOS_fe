import { BookingPageContent } from '@/app/book/BookingPageContent';

type BookingPageProps = {
  params: Promise<{ slug: string }>;
};

const BookingPage = async ({ params }: BookingPageProps) => {
  const { slug } = await params;

  return <BookingPageContent clinicSlug={slug} />;
};

export default BookingPage;
