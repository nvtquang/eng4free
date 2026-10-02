import { OnboardingWizard } from "@/components/onboarding-wizard";
import { getLocale, getMessages } from "@/lib/i18n";
import { listCanDoStatements } from "@/modules/placement/service";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Bắt đầu", description: "Thiết lập lộ trình học." }, en: { title: "Get started", description: "Set up your learning path." } }, "/onboarding", { index: false });
}

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const locale = await getLocale();
  let canDo: Awaited<ReturnType<typeof listCanDoStatements>> = [];
  try { canDo = await listCanDoStatements(); } catch { /* Local setup may not have a database yet. */ }
  return <OnboardingWizard messages={getMessages(locale)} locale={locale} canDo={canDo} />;
}
