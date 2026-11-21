export const dynamic = 'force-dynamic';
import { getFaqData } from "@/lib/faq";
import FaqClient from "./FaqClient";

export const metadata = {
  title: "FAQ Management | Admin Dashboard",
  description: "Manage frequently asked questions and section texts for Smart Agro Source",
};

export default async function AdminFaqPage() {
  const faqData = await getFaqData();

  return <FaqClient initialData={faqData} />;
}
