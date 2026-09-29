import { OnboardingWizard } from "@/components/onboarding-wizard";
import { getLocale, getMessages } from "@/lib/i18n";
import { publicPlacementQuestions } from "@/modules/placement/scoring";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  return <OnboardingWizard messages={messages} questions={publicPlacementQuestions()} />;
}
