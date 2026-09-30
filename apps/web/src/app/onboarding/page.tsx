import { OnboardingWizard } from "@/components/onboarding-wizard";
import { getLocale, getMessages } from "@/lib/i18n";
import { listCanDoStatements } from "@/modules/placement/service";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const locale = await getLocale();
  let canDo: Awaited<ReturnType<typeof listCanDoStatements>> = [];
  try { canDo = await listCanDoStatements(); } catch { /* Local setup may not have a database yet. */ }
  return <OnboardingWizard messages={getMessages(locale)} locale={locale} canDo={canDo} />;
}
