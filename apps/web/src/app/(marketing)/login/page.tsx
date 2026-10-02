import { auth, isEmailSignInEnabled, isGoogleSignInEnabled, signIn } from "@/auth";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n";
import { guestCookieName } from "@/modules/auth/request-actor";
import { isDemoSignInEnabled, openDemoSession, sessionCookie } from "@/modules/auth/demo-account";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata({ vi: { title: "Đăng nhập", description: "Đăng nhập để lưu tiến độ trên mọi thiết bị." }, en: { title: "Sign in", description: "Sign in to keep your progress on every device." } }, "/login", { index: false });
}

/** Signs in to the seeded demo account; only offered when isDemoSignInEnabled(). */
async function demoSignIn() {
  "use server";
  const cookieStore = await cookies();
  const session = await openDemoSession(cookieStore.get(guestCookieName)?.value ?? null);
  if (!session) redirect("/login?demo=missing");
  const forwarded = (await headers()).get("x-forwarded-proto");
  const cookie = sessionCookie(forwarded ? forwarded === "https" : Boolean(process.env.AUTH_URL?.startsWith("https:")));
  cookieStore.set(cookie.name, session.token, { httpOnly: true, sameSite: "lax", path: "/", secure: cookie.secure, expires: session.expires });
  redirect("/dashboard");
}

/** Sends a one-time sign-in link to the address typed in the form. */
async function emailSignIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) redirect("/login?error=email");
  await signIn("resend", { email, redirectTo: "/dashboard" });
}

const copy = {
  vi: {
    login: "Đăng nhập", intro: "Đăng nhập để giữ tiến độ trên mọi thiết bị. Tiến độ bạn đã học ở chế độ khách sẽ được gộp vào tài khoản.", none: "Đăng nhập chưa được bật trên máy chủ này. Bạn vẫn có thể học đầy đủ ở chế độ khách.",
    google: "Đăng nhập với Google", or: "hoặc", email: "Email", emailButton: "Gửi link đăng nhập", checkTitle: "Kiểm tra hộp thư của bạn", checkText: "Chúng tôi đã gửi một link đăng nhập tới email của bạn. Link chỉ dùng được một lần và hết hạn sau 24 giờ.",
    errorEmail: "Email chưa hợp lệ. Hãy kiểm tra lại.", error: "Chưa đăng nhập được. Link có thể đã hết hạn hoặc đã được dùng; hãy thử lại.", agree: "Khi đăng nhập, bạn đồng ý với", terms: "Điều khoản sử dụng", and: "và", privacy: "Quyền riêng tư",
    confirmed: "Bạn đã đăng nhập", dashboard: "Mở tiến độ học",
    demoTitle: "Tài khoản demo", demoText: "Một học viên có sẵn khoảng ba tuần lịch sử học. Tiến độ bạn vừa học ở chế độ khách sẽ được gộp vào tài khoản này.", demoButton: "Vào tài khoản demo", demoMissing: "Chưa có tài khoản demo. Chạy pnpm seed:demo-account rồi thử lại."
  },
  en: {
    login: "Sign in", intro: "Sign in to keep your progress on every device. What you studied as a guest is merged into your account.", none: "Sign-in is not enabled on this server. You can still use everything as a guest.",
    google: "Continue with Google", or: "or", email: "Email", emailButton: "Email me a sign-in link", checkTitle: "Check your inbox", checkText: "We sent a sign-in link to your email. It works once and expires in 24 hours.",
    errorEmail: "That email address does not look right. Please check it.", error: "Could not sign you in. The link may have expired or been used already; please try again.", agree: "By signing in you agree to the", terms: "Terms of use", and: "and", privacy: "Privacy policy",
    confirmed: "You are signed in", dashboard: "Open learning progress",
    demoTitle: "Demo account", demoText: "A learner with about three weeks of study history. What you just practised as a guest is merged into this account.", demoButton: "Use the demo account", demoMissing: "The demo account has not been created. Run pnpm seed:demo-account and try again."
  }
} as const;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ demo?: string; type?: string; error?: string }> }) {
  const text = copy[await getLocale()];
  const params = await searchParams;
  const session = await auth().catch(() => null);
  const demoEnabled = isDemoSignInEnabled();
  const anyMethod = isGoogleSignInEnabled || isEmailSignInEnabled;

  if (session?.user?.email) return <Section className="grid min-h-[60vh] place-items-center"><Card className="w-full max-w-md">
    <p className="text-sm font-bold uppercase tracking-[.16em] text-brand">English 4 Free</p>
    <h1 className="mt-4 font-serif text-4xl font-bold">{text.confirmed}</h1>
    <p className="mt-4 leading-7 text-muted">{session.user.name || session.user.email}</p>
    <Link className="mt-7 inline-flex" href="/dashboard"><Button>{text.dashboard}</Button></Link>
  </Card></Section>;

  if (params.type === "email" && !params.error) return <Section className="grid min-h-[60vh] place-items-center"><Card className="w-full max-w-md" role="status">
    <p className="text-sm font-bold uppercase tracking-[.16em] text-brand">English 4 Free</p>
    <h1 className="mt-4 font-serif text-4xl font-bold">{text.checkTitle}</h1>
    <p className="mt-4 leading-7 text-muted">{text.checkText}</p>
  </Card></Section>;

  return <Section className="grid min-h-[60vh] place-items-center"><Card className="w-full max-w-md">
    <p className="text-sm font-bold uppercase tracking-[.16em] text-brand">English 4 Free</p>
    <h1 className="mt-4 font-serif text-4xl font-bold">{text.login}</h1>
    <p className="mt-4 leading-7 text-muted">{anyMethod ? text.intro : text.none}</p>
    {params.error && <p className="mt-4 rounded-ui bg-amber-50 p-3 text-sm text-amber-950" role="alert">{params.error === "email" ? text.errorEmail : text.error}</p>}
    {isGoogleSignInEnabled && <form className="mt-7" action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }}><Button className="w-full" type="submit">{text.google}</Button></form>}
    {isGoogleSignInEnabled && isEmailSignInEnabled && <p className="mt-5 text-center text-sm text-muted">{text.or}</p>}
    {isEmailSignInEnabled && <form className={isGoogleSignInEnabled ? "mt-5" : "mt-7"} action={emailSignIn}>
      <label className="block text-sm font-bold" htmlFor="login-email">{text.email}</label>
      <input className="mt-2 min-h-11 w-full rounded-ui border border-line bg-canvas px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand" id="login-email" name="email" type="email" autoComplete="email" required placeholder="ban@example.com" />
      <Button className="mt-3 w-full" type="submit" variant={isGoogleSignInEnabled ? "secondary" : "primary"}>{text.emailButton}</Button>
    </form>}
    {anyMethod && <p className="mt-6 text-xs leading-5 text-muted">{text.agree} <Link className="font-bold text-brand hover:underline" href="/terms">{text.terms}</Link> {text.and} <Link className="font-bold text-brand hover:underline" href="/privacy">{text.privacy}</Link>.</p>}
    {demoEnabled && <div className="mt-8 border-t border-line pt-6">
      <h2 className="font-serif text-2xl font-bold">{text.demoTitle}</h2>
      <p className="mt-2 leading-7 text-muted">{text.demoText}</p>
      {params.demo === "missing" && <p className="mt-3 text-sm font-bold text-accent-terra" role="alert">{text.demoMissing}</p>}
      <form className="mt-4" action={demoSignIn}><Button type="submit" variant="secondary">{text.demoButton}</Button></form>
    </div>}
  </Card></Section>;
}
