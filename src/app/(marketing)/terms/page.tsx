import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use Phanera.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "10 November 2026";

export default function Page() {
  return (
    <article className="py-16 sm:py-24">
      <header className="container-reading">
        <h1 className="text-3xl leading-[1.08] font-medium tracking-[-0.03em] sm:text-[2.75rem]">Terms of Service</h1>
        <p className="mt-6 font-mono text-xs text-muted-foreground">Last updated {UPDATED}</p>
      </header>
      <div className="container-reading blog-prose mt-10">
        <p>
          These terms apply when you use phanera.com and the Phanera app (the &quot;Service&quot;). By creating an account
          or using the Service, you agree to them. If you do not agree, do not use the Service.
        </p>

        <h2>1. The Service</h2>
        <p>
          Phanera runs AI usability tests. AI personas visit the websites you submit, attempt tasks and produce findings,
          screenshots and reports. We may add, change or remove features over time.
        </p>

        <h2>2. Your account</h2>
        <p>
          You must be at least 16 to use Phanera. You are responsible for keeping your sign-in secure and for everything
          that happens in your account. Tell us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you think
          someone else has accessed it.
        </p>

        <h2>3. Websites you test</h2>
        <p>Only submit websites that you own or have permission to test. You must not use Phanera to:</p>
        <ul>
          <li>test, scrape or load-test sites without the owner&apos;s permission;</li>
          <li>get around logins, paywalls, CAPTCHAs or other access controls;</li>
          <li>collect other people&apos;s personal data;</li>
          <li>break any law or anyone else&apos;s rights;</li>
          <li>interfere with, overload or reverse-engineer the Service, or get around plan limits.</li>
        </ul>
        <p>We may suspend tests or accounts that break these rules.</p>

        <h2>4. Your content</h2>
        <p>
          You keep ownership of what you submit and of the reports produced for you. You give us permission to process
          that content only as needed to run the Service for you, including sending it to the service providers listed in
          our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>5. AI-generated results</h2>
        <p>
          Findings come from AI models simulating users. They are not real people, and results can be incomplete or
          wrong. Use them as a guide, check important findings yourself, and do not treat them as a replacement for
          research with real users, accessibility audits or professional advice.
        </p>

        <h2>6. Plans, billing and cancellation</h2>
        <ul>
          <li>The Free plan includes limited usage. Paid plans are billed monthly in advance through PayPal or Stripe.</li>
          <li>Prices and limits are shown on the <Link href="/pricing">pricing page</Link>. We will give notice before we raise the price of an existing subscription.</li>
          <li>You can cancel at any time. Your plan stays active until the end of the current billing period, and then does not renew.</li>
          <li>Payments are non-refundable except where the law requires otherwise. If something went wrong, contact us and we will look at it fairly.</li>
          <li>Unused tests do not roll over to the next month.</li>
        </ul>

        <h2>7. Our property</h2>
        <p>
          The Service, including its software, design and branding, belongs to Phanera. The open-source code in our
          public repository is available under its own licence.
        </p>

        <h2>8. Availability</h2>
        <p>
          We work to keep Phanera running, but the Service is provided &quot;as is&quot; and &quot;as available&quot;. We do
          not promise it will always be available, error-free or suitable for a particular purpose.
        </p>

        <h2>9. Limitation of liability</h2>
        <p>
          To the extent the law allows, Phanera is not liable for indirect or consequential losses, such as lost profits,
          revenue or data. Our total liability for any claim is limited to the amount you paid us in the 12 months before
          the claim. Nothing in these terms limits liability that cannot be limited by law.
        </p>

        <h2>10. Ending your use</h2>
        <p>
          You can stop using Phanera and ask us to delete your account at any time. We may suspend or close accounts that
          break these terms. Sections 4, 5, 7 and 9 continue after your account ends.
        </p>

        <h2>11. Changes to these terms</h2>
        <p>
          We may update these terms. If changes are significant, we will update the date above and tell signed-in users.
          If you keep using the Service after the change, you accept the new terms.
        </p>

        <h2>12. Governing law</h2>
        <p>
          These terms are governed by the laws of England and Wales. Disputes will be handled by the courts of England and
          Wales, unless your local consumer law gives you the right to bring a claim elsewhere.
        </p>

        <h2>13. Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </article>
  );
}
