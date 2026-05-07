import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for NextLevel — the gaming catalog app.",
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mt-4 mb-2">Terms of Service</h1>
          <p className="text-sm text-white/40">Last updated: May 7, 2026</p>
        </div>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using NextLevel (&quot;the Service&quot;), you agree to be
              bound by these Terms of Service. If you do not agree, do not use
              the Service. NextLevel is a personal gaming catalog and discovery
              platform. These terms govern your use of the website at{" "}
              <span className="text-white/90">nextlevel.shanu.dev</span>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              2. Description of Service
            </h2>
            <p>
              NextLevel lets you track, catalog, rate, and discover video games.
              Game metadata is sourced from IGDB (Internet Game Database),
              operated by Twitch Interactive, Inc. We display game data
              including titles, cover art, and descriptions under IGDB&apos;s
              API terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              3. User Accounts
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are responsible for keeping your credentials secure.</li>
              <li>
                You may sign up via email/password or through Google and GitHub
                OAuth. OAuth account access is governed by those providers&apos;
                respective terms.
              </li>
              <li>
                You may not create accounts for others or use the Service on
                behalf of another person without their consent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              4. User Content
            </h2>
            <p>
              You retain ownership of any content you submit (game notes,
              ratings, list names). By submitting content, you grant NextLevel a
              non-exclusive, royalty-free license to store and display it as
              part of the Service. You are solely responsible for the content
              you post.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              5. Prohibited Conduct
            </h2>
            <p>You may not:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to reverse-engineer, scrape, or abuse our APIs.</li>
              <li>Impersonate other users or create misleading profiles.</li>
              <li>Introduce malware, spam, or disruptive content.</li>
              <li>Circumvent any rate limits or access controls.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              6. Third-Party Services
            </h2>
            <p>
              The Service integrates with third-party services including IGDB
              (game data), Google and GitHub (OAuth), and Vercel (hosting). Your
              interactions with those services are governed by their own terms
              and privacy policies. We are not responsible for third-party
              conduct.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              7. Intellectual Property
            </h2>
            <p>
              The NextLevel name, logo, and original UI design are the property
              of the developer. Game metadata, cover art, and related assets
              belong to their respective rights holders and are used via
              IGDB&apos;s API. You may not reproduce or redistribute the
              Service&apos;s original content without permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              8. Disclaimers
            </h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of
              any kind. We do not guarantee uninterrupted access, data accuracy,
              or fitness for a particular purpose. Game data accuracy depends on
              IGDB&apos;s database.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, NextLevel and its
              developer are not liable for any indirect, incidental, or
              consequential damages arising from your use of the Service,
              including data loss or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              10. Account Termination
            </h2>
            <p>
              You may delete your account at any time from Settings. We reserve
              the right to suspend or terminate accounts that violate these
              terms. Upon termination, your data will be deleted per our
              retention policy described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              11. Changes to Terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of the
              Service after changes constitutes acceptance. We will update the
              &quot;last updated&quot; date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              12. Contact
            </h2>
            <p>
              Questions about these terms? Reach out at{" "}
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
              href="/privacy"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Privacy Policy
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
