import Link from "next/link";
import { ProfilePlanForm } from "@/components/profile-plan-form";
import { AccountData } from "@/components/account-data";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { getLocale, getMessages } from "@/lib/i18n";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { findLearnerProfile, type LearnerProfile } from "@/modules/onboarding/repository";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Hồ sơ học tập", description: "Hồ sơ học tập và dữ liệu của bạn." }, en: { title: "Learning profile", description: "Your learning profile and data." } }, "/profile", { index: false });
}

export const dynamic = "force-dynamic";

const skills = ["GRAMMAR", "VOCABULARY", "READING", "LISTENING", "SPEAKING", "WRITING"] as const;

export default async function ProfilePage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const copy = messages.profilePage;
  let profile: LearnerProfile | null = null;
  let hasLearner = false;
  try { const { learner } = await getRequestLearner(false); hasLearner = true; profile = await findLearnerProfile(learner); } catch { /* No learner yet. */ }
  const signedIn = Boolean((await auth().catch(() => null))?.user?.id);
  const data = hasLearner || signedIn ? <AccountData locale={locale} signedIn={signedIn} /> : null;

  if (!profile) return <Section className="max-w-2xl">
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-4xl font-bold">{copy.emptyTitle}</h1>
    <p className="mt-4 leading-7 text-muted">{copy.emptyText}</p>
    <Link className="mt-8 inline-flex" href="/onboarding"><Button>{copy.setup}</Button></Link>
    {data}
  </Section>;

  const source = profile.levelSource === "PLACEMENT" && profile.placementTotal
    ? copy.fromPlacement.replace("{score}", String(profile.placementScore ?? 0)).replace("{total}", String(profile.placementTotal))
    : copy.fromSelf;

  return <Section className="max-w-3xl">
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{copy.title}</h1>

    <Card className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-sm font-bold text-muted">{copy.levelTitle}</h2><p className="mt-2 font-serif text-5xl font-bold text-brand">{profile.cefrLevel}</p><p className="mt-2 text-sm text-muted">{source}</p></div>
        <Link href="/onboarding"><Button variant="secondary">{copy.retake}</Button></Link>
      </div>
      <h2 className="mt-8 font-serif text-xl font-bold">{copy.skillsTitle}</h2>
      {profile.skillLevels
        ? <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{skills.map((skill) => <div key={skill} className="rounded-ui border border-line p-3"><dt className="text-sm font-bold text-muted">{messages.onboarding.skills[skill]}</dt><dd className="mt-1 font-serif text-2xl font-bold text-brand">{profile.skillLevels?.[skill] ?? "—"}</dd></div>)}</dl>
        : <p className="mt-3 text-sm leading-6 text-muted">{copy.skillsNone}</p>}
    </Card>

    <Card className="mt-6">
      <h2 className="font-serif text-2xl font-bold">{copy.planTitle}</h2>
      <div className="mt-5"><ProfilePlanForm goal={profile.goal} minutesPerDay={profile.minutesPerDay} messages={messages} /></div>
    </Card>
    {data}
  </Section>;
}
