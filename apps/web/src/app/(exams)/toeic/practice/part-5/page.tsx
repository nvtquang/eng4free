import { ToeicPart5Runner } from "@/components/toeic-part-5-runner";
import { getLocale, getMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ToeicPart5Page() {
  const messages = getMessages(await getLocale());
  return <ToeicPart5Runner copy={messages.toeicPractice} />;
}
