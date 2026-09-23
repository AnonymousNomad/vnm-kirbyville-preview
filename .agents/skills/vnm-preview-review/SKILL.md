---
name: vnm-preview-review
description: Prepare a locally reviewable Kirbyville website candidate, preserving static delivery, verified data, accessibility and evidence for later publication.
---

# Kirbyville preview review

Read the current user instructions before choosing a deployment target. The current correction is for local review; earlier permission to publish does not override that sequence. Keep the existing public preview until the user reviews this candidate.

Use `reference/REVIEW-MATRIX.md` for relevant risks, dependencies, checks and unresolved facts. Keep JavaScript, fonts and images local; avoid third-party widgets, API keys or backend services for a static information page. A local Google listing link does not require a Google script.

Use `npm.cmd` on this Windows workspace. Existing scripts use Playwright Core with installed Edge. Build before static smoke checks; browser/visual checks manage their own temporary servers. Avoid launching duplicate persistent servers on the review port. For a persistent Windows helper, use a hidden process, a workspace working directory, and log files under ignored `artifacts/`.

For authorized verification, retain all existing gates and investigate failures. Save reference-width desktop, mobile and active-motion frames. Document actual widths and remaining visual differences; do not equate green tests with reference fidelity. Bind the review server to loopback unless broader network access is requested. Provide its exact base path.

Commit only task files, excluding the untracked original user image and ignored research challenge pages. Never publish credentials, CAPTCHA output or unsupported business facts. Leave dependency/lockfile and deployment workflow changes out unless required by demonstrated evidence.

Primary security reference: [OWASP third-party JavaScript management](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html).
