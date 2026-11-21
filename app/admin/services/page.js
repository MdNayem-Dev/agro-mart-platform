export const dynamic = 'force-dynamic';
import { getTrustServicesData } from "@/lib/trustServices";
import TrustServicesClient from "./TrustServicesClient";

export const metadata = {
  title: "অঙ্গীকার ও সেবা স্লাইডার পরিচালনা | Admin Dashboard",
  description: "আমাদের অঙ্গীকার ও সেবা স্লাইডার এবং পরিসংখ্যান এডিট ও পরিচালনা করুন",
};

export default async function AdminTrustServicesPage() {
  const initialData = await getTrustServicesData();

  return <TrustServicesClient initialData={initialData} />;
}
