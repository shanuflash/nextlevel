import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for NextLevel — the gaming catalog app.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <Link
            href="/"
            className="text-xs text-white/30 hover:text-white/60 transition-colors mb-8 inline-block"
          >
            ← Back to NextLevel
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Privacy Policy</h1>
          <p className="text-sm text-white/40">Last updated: May 7, 2026</p>
        </div>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              1. Overview
            </h2>
            <p>
              NextLevel (&quot;we&quot;, &quot;us&quot;) is committed to
              protecting your privacy. This policy explains what data we
              collect, how we use it, and your rights regarding that data. The
              Service is operated by Shanu S and is available at{" "}
              <span className="text-white/90">nextlevel.shanu.dev</span>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              2. Data We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white/90 font-medium mb-1">
                  Account information
                </h3>
                <p>
                  When you sign up, we collect your email address and a display
                  name. If you sign in via Google or GitHub OAuth, we receive
                  your name, email, and profile picture from those providers.
                </p>
              </div>
              <div>
                <h3 className="text-white/90 font-medium mb-1">
                  Gaming catalog data
                </h3>
                <p>
                  Games you add to your catalog, ratings, status tags (playing,
                  completed, etc.), and any notes you attach.
                </p>
              </div>
              <div>
                <h3 className="text-white/90 font-medium mb-1">Usage data</h3>
                <p>
                  We use Vercel Analytics to collect anonymized usage statistics
                  such as page views and referrers. No personally identifiable
                  information is included in analytics data.
                </p>
              </div>
              <div>
                <h3 className="text-white/90 font-medium mb-1">
                  Cookies and sessions
                </h3>
                <p>
                  We use session cookies to keep you signed in. No advertising
                  or third-party tracking cookies are used.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              3. How We Use Your Data
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To authenticate you and provide access to your account.</li>
              <li>To store and display your gaming catalog and profile.</li>
              <li>To generate your public profile page (if you have one).</li>
              <li>To improve the Service using anonymized analytics.</li>
              <li>
                To contact you about important Service changes (no marketing).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              4. Data Sharing
            </h2>
            <p>
              We do not sell your personal data. We share data only in these
              limited cases:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong className="text-white/80">Infrastructure:</strong> Turso
                (database hosting) stores your data on their servers. Vercel
                hosts the application.
              </li>
              <li>
                <strong className="text-white/80">OAuth providers:</strong> If
                you sign in via Google or GitHub, those providers receive a
                sign-in event per their own privacy policies.
              </li>
              <li>
                <strong className="text-white/80">Legal:</strong> We may
                disclose data if required by law or to protect our rights.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              5. Public Profiles
            </h2>
            <p>
              If your profile is set to public, your username, gaming catalog,
              and stats are visible to anyone with your profile URL (
              <span className="text-white/90">
                nextlevel.shanu.dev/u/[username]
              </span>
              ). You can manage visibility in Settings at any time.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              6. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. When
              you delete your account, your profile and catalog data are
              permanently deleted from our database. Anonymized analytics data
              is retained by Vercel per their own retention policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              7. Security
            </h2>
            <p>
              Passwords are hashed before storage. We use HTTPS for all data in
              transit. Database access is restricted and credential-protected.
              While we take reasonable precautions, no system is perfectly
              secure — use a strong, unique password.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              8. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Access or export your data by contacting us.</li>
              <li>Correct inaccurate information via account Settings.</li>
              <li>
                Delete your account and all associated data from Settings.
              </li>
              <li>
                Withdraw OAuth access via your Google or GitHub security
                settings.
              </li>
            </ul>
            <p className="mt-3">
              For GDPR or CCPA requests, contact us directly and we will respond
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              9. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not directed to children under 13. We do not
              knowingly collect personal information from children. If you
              believe a child has created an account, please contact us for
              removal.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              10. Third-Party Links
            </h2>
            <p>
              The Service links to IGDB and other third-party sites. We are not
              responsible for the privacy practices of those sites. Review their
              policies independently.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this policy. We will update the &quot;last
              updated&quot; date at the top. Continued use of the Service after
              changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              12. Contact
            </h2>
            <p>
              Privacy questions or data requests:{" "}
              <a
                href="mailto:shanu.s@surveysparrow.com"
                className="text-white/90 hover:text-white transition-colors underline underline-offset-2"
              >
                shanu.s@surveysparrow.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/6 flex items-center justify-between">
          <span className="text-xs text-white/25">NextLevel</span>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
