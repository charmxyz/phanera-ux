import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Phanera collects, uses and protects your data.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "10 November 2026";

export default function Page() {
  return (
    <article className="py-16 sm:py-24">
      <header className="container-reading">
        <h1 className="text-3xl leading-[1.08] font-medium tracking-[-0.03em] sm:text-[2.75rem]">Privacy Policy</h1>
        <p className="mt-6 font-mono text-xs text-muted-foreground">Last updated {UPDATED}</p>
      </header>
      <div className="container-reading blog-prose mt-10">
        <p>
          This policy explains what information Phanera (&quot;we&quot;, &quot;us&quot;) collects when you use phanera.com and
          the Phanera app, why we collect it, and the choices you have. If anything here is unclear, email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>Information we collect</h2>
        <h3>Information you give us</h3>
        <ul>
          <li><strong>Account details:</strong> your email address, and your name if you provide one.</li>
          <li><strong>Test inputs:</strong> the website URLs you submit, plus any tasks, personas, goals and notes you write or edit.</li>
          <li><strong>Messages:</strong> anything you send us by email.</li>
        </ul>
        <h3>Information created when you use Phanera</h3>
        <ul>
          <li>
            <strong>Website analysis and test results:</strong> page content we crawl from the URLs you submit, plus
            screenshots, session recordings, action logs, findings and reports that our AI personas produce while testing
            those sites.
          </li>
          <li><strong>Usage and plan data:</strong> how many tests you have run, your plan, and your subscription status.</li>
          <li>
            <strong>Technical data:</strong> standard server logs (IP address, browser type, timestamps), kept to operate and
            secure the service.
          </li>
        </ul>
        <h3>Payment information</h3>
        <p>
          Payments are handled by PayPal and Stripe. We do not see or store your full card details. We receive a
          subscription or customer identifier and payment status from them.
        </p>

        <h2>How we use your information</h2>
        <ul>
          <li>To provide the service: crawl the sites you submit, run AI usability tests and generate reports.</li>
          <li>To manage your account, sign-in, plan limits and billing.</li>
          <li>To send essential service emails, such as sign-in links and billing notices.</li>
          <li>To keep the service secure, prevent abuse and fix problems.</li>
          <li>To reply when you contact us.</li>
        </ul>
        <p>We do not sell your personal information, and we do not use your test data to advertise to you.</p>

        <h2>Service providers we share data with</h2>
        <p>We share data only with providers that help us run Phanera, and only as much as they need:</p>
        <ul>
          <li><strong>Supabase:</strong> database, authentication and file storage (including screenshots).</li>
          <li><strong>Vercel:</strong> hosting for the website and app.</li>
          <li><strong>Railway:</strong> hosting for the background worker that runs browser sessions.</li>
          <li><strong>Anthropic:</strong> AI models that power personas, analysis and reports. Page content, tasks and screenshots are sent to Anthropic to generate results.</li>
          <li><strong>Trigger.dev and Daytona:</strong> background job and sandboxed browser infrastructure.</li>
          <li><strong>PayPal and Stripe:</strong> payment processing.</li>
        </ul>
        <p>
          We may also disclose information if the law requires it, or to protect the rights, safety or property of
          Phanera, our users or others.
        </p>

        <h2>Shared reports</h2>
        <p>
          If you create a share link for a report, anyone who has the link can view that report, including its
          screenshots and findings. You can turn off sharing at any time.
        </p>

        <h2>Websites you test</h2>
        <p>
          Only submit websites you own or are allowed to test. Our personas visit those sites like a normal visitor
          would. Please avoid testing pages that show other people&apos;s personal data, because it may then appear in
          screenshots and reports.
        </p>

        <h2>Cookies</h2>
        <p>
          We use only the cookies needed to keep you signed in and to remember preferences such as your theme. We do not
          use advertising or third-party tracking cookies.
        </p>

        <h2>How long we keep data</h2>
        <p>
          We keep your account and test data while your account is active. If you ask us to delete your account, we
          delete your personal data and test results within 30 days. We may keep billing records for longer when the law
          requires it.
        </p>

        <h2>Security</h2>
        <p>
          Data is encrypted in transit. Access is restricted with row-level security, so your projects can only be read
          from your own account. No system is perfectly secure, but we take reasonable steps to protect your data.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have the right to access, correct, delete or export your personal data,
          and to object to or restrict how we process it. To use any of these rights, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. You can also complain to your local data protection
          authority.
        </p>

        <h2>Children</h2>
        <p>Phanera is not meant for children under 16, and we do not knowingly collect their data.</p>

        <h2>Changes to this policy</h2>
        <p>
          If we make significant changes, we will update the date above and tell signed-in users. See also our{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </article>
  );
}
