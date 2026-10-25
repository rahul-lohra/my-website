# Rahul Kumar Lohra — portfolio & field notes

An editorial portfolio and technical blog, built as a TypeScript monorepo. Astro generates real HTML pages; React handles search and topic filtering. A small Cloudflare Worker serves a read-only API. The frontend never requires the API, so every article and project stays readable when the Worker is offline.

The frontend is live at https://www.rahullohra.com/ on GitHub Pages. Deployment remains manual through GitHub Actions. No paid hosting plan was enabled; the optional Cloudflare API has not been deployed.

## Structure

- `frontend/`: Astro static site, React search/filter islands, responsive styles, bundled article assets.
- `backend/`: TypeScript Worker and Wrangler configuration.
- `content/posts/`: shared Markdown articles with validated frontmatter.
- `content/profile.json`: professional headline, summary, skills, experience, and education from the user-supplied résumé.
- `content/projects.json`: structured portfolio projects, explicitly classified as original, contribution, or fork.
- `content/rag-notes/`, `content/rag-projects/`: future RAG content; currently unpublished examples only.
- `shared/schema.ts`: Zod schemas and reading time utility.
- `scripts/generate.ts`: validates content, excludes drafts, generates the Worker JSON bundle and static legacy redirect pages. Generated files must not be edited manually.
- `tests/`: API behavior, CORS, draft exclusion, article/code preservation, local asset and schema checks.
- `content/migration/`: unchanged original published Markdown for migration regression checks.
- `content/migration-report.json`: source URLs, migration counts, legacy URLs, and asset import results.

## Requirements & local development

Use Node 24 LTS and pnpm 11.25.0 (declared in `package.json`). With Corepack, run `corepack enable` and `corepack prepare pnpm@11.25.0 --activate`, or install pnpm through its official instructions. The checked-in lockfile records the resolved stable dependencies. TypeScript 6 is intentional: Astro's current checker does not support TypeScript 7 yet.

```bash
pnpm install --frozen-lockfile
pnpm generate
pnpm dev              # http://localhost:4321
```

In another terminal:

```bash
pnpm dev:api          # http://localhost:8787
```

The Worker development command regenerates its content snapshot. Restart it after content changes. Astro watches Markdown changes. No authentication, database, secrets, or external API is needed for local use. On locked-down machines, `ASTRO_TELEMETRY_DISABLED=1` prevents Astro from writing telemetry preferences outside the repository.

```bash
pnpm check           # schema validation, Astro and backend TypeScript
pnpm test            # API and migration regression tests
pnpm build           # generate content, then build frontend/dist
pnpm check:links     # verify local links/assets, base path and draft exclusion
pnpm verify          # all of the above
pnpm --dir backend build  # compile Worker with Wrangler, no upload
pnpm --dir frontend preview --port 4321
```

To verify a GitHub Pages project subpath:

```bash
SITE_URL=https://rahul-lohra.github.io BASE_PATH=/my-website/ pnpm verify
```

Use the same environment values for generation, build, and link checking. The root `.env.example` documents these build-time values; export them in the shell or set them in CI (the root example is not automatically loaded). No secrets belong in frontend variables.

## Content migration and provenance

The seven published articles were imported from [myblog](https://github.com/rahul-lohra/myblog), checked against [rahullohra.com](https://rahullohra.com/). The supporting [blog-posts](https://github.com/rahul-lohra/blog-posts) and previous [blog-react](https://github.com/rahul-lohra/blog-react) sources were inspected. BLE part 4 in the supporting repository was not listed as published in Jekyll, so it was not silently promoted to a published article. `blog-backend` was unavailable publicly; the new API is independent.

Original prose and existing code blocks are preserved. Embedded Gists were expanded into static code blocks and original Medium images downloaded into `frontend/public/assets/`; articles have no remote image or Gist-script dependency. Supporting résumé files were deliberately not imported as current. Source-local publication dates are preserved. Compatibility HTML files cover both those dates and the previous day's UTC-rendered live URLs. On GitHub Pages these are HTML refresh/canonical redirects, not server-side HTTP 301s.

Project descriptions are grounded in the public repositories and READMEs for Snorkl, gql-formatter-plugin, circular_reveal_widget, and Ble-Chat-Android-app. Screenshots are from those repositories. Card artwork is a CSS illustration, not a claim of an actual product interface. Employment history and professional positioning were subsequently added from the résumé supplied by the user. No employment claims, performance numbers, endorsements, or RAG results were inferred from the old website.

## Add a blog post

Create `content/posts/my-post.md`:

```markdown
---
title: A useful discovery
slug: a-useful-discovery
description: A short summary for search, previews, and RSS.
date: 2026-10-25
topic: Android
tags: [Kotlin, Android]
draft: false
legacyUrls: []
projects: [snorkl]
---

## The idea

Write Markdown, including fenced code blocks, lists, images, and links.
```

Slugs must be unique lowercase letters, digits, and hyphens. Drafts are excluded from generated pages, listing data, RSS, sitemap, and API. `unpublished-example.md` intentionally exercises that boundary. Delete it or use it as a template. Add images in `frontend/public/assets/` and reference them as `/assets/name.png`; the Markdown processor adds the configured base path. Use `/blog/slug/` for cross-article links. Known dated local links and absolute `rahullohra.com` links are rewritten automatically. Raw HTML must be trusted author-written content.

To add a project, add an object to `content/projects.json` matching `shared/schema.ts`. Set `kind` accurately (`Original project`, `Contribution`, or `Fork`). `articles` contains published blog slugs. The generator validates related article references. A new visual can be added to `ProjectVisual.astro`; optional screenshots belong in public assets with a useful `imageAlt`.

When removing/unpublishing an old article, the generator removes its previously generated legacy HTML files as well. For a content migration, keep the original source snapshot and update the migration report/tests intentionally.

## Add RAG content

Create Markdown in `content/rag-notes/` or `content/rag-projects/` with the same frontmatter schema as a blog post. The corresponding index and `/rag/notes/[slug]/` or `/rag/projects/[slug]/` detail page appear automatically for non-drafts. These collections also feed `/api/notes` and `/api/rag-projects`. Update the RAG overview's introductory placeholder when publishing the first entries. Record methods, evaluations, and results only when real material is available.

## Update the résumé and experience

The supplied résumé is available at `frontend/public/resume/rahul-kumar-lohra.pdf`, unchanged from the original PDF. The Résumé page includes download/open links, an expandable PDF viewer with a fallback link, career history, skills, and education.

To replace it, overwrite that PDF and update `content/profile.json`. The shared profile schema validates the data; Home, About, and Résumé reuse the same experience component. Home shows the two latest roles and links to the full history. The professional headline is positioning, while each career entry retains its actual role title. The source résumé's “Principle Engineer” spelling is normalized to “Principal Engineer” in the website copy. Dates and career gaps are preserved. No performance metrics were added beyond the supplied material.

## API

- `GET /api/health`
- `GET /api/posts`, `GET /api/posts/:slug` (complete Markdown body)
- `GET /api/projects`, `GET /api/projects/:slug`
- `GET /api/notes`, `GET /api/notes/:slug`
- `GET /api/rag-projects`, `GET /api/rag-projects/:slug`

Supports GET, HEAD, and OPTIONS. Unknown resources return JSON 404; other methods on known routes return 405. CORS uses exact comma-separated origins in `ALLOWED_ORIGINS`, without wildcards. Disallowed Origin headers receive 403; public server-to-server requests without Origin can read content. CORS is a browser policy, not authentication. No user data is stored.

For local overrides, copy `backend/.dev.vars.example` to `backend/.dev.vars`. Production origins are set in `backend/wrangler.jsonc`; the repository Pages origin is configured by default. Add `https://rahullohra.com` only when the domain migration is ready. Origins never include paths or trailing slashes.

## GitHub Actions & deployment

PRs and pushes to main run validation for both `/` and `/my-website/`, including a Worker dry-run build. Validation has no deployment secrets dependency. Deploy workflows only support `workflow_dispatch`, so pushing code never changes hosting.

### Frontend: GitHub Pages

1. Push this source to the intended repository and enable Settings → Pages → GitHub Actions.
2. Set repository variables: `ENABLE_PAGES_DEPLOY=true`, `SITE_URL=https://rahul-lohra.github.io`, `BASE_PATH=/my-website/` (adjust to the actual repository name).
3. Manually run **Deploy frontend to GitHub Pages**. It validates/builds, uploads `frontend/dist`, and uses the standard Pages deployment action. No personal access token is required; the scoped `GITHUB_TOKEN` and OIDC permissions come from Actions.
4. Review the resulting repository URL before migrating the domain.

Do not configure a custom domain or add a CNAME until ready to replace the live site. If deploying to a different owner/repository, adjust the production origin, base, and Worker CORS list together.

### Backend: Cloudflare Workers

Use a free Cloudflare Workers account. Configure `CLOUDFLARE_API_TOKEN` (account-scoped Workers Scripts Edit token) and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets. Set `ENABLE_WORKER_DEPLOY=true`. Check the unique Worker `name` and exact CORS origins in `backend/wrangler.jsonc`, then manually run **Deploy backend to Cloudflare Workers**. Without credentials the deployment step skips with an explanation. PR validation still runs.

For an explicit manual deployment from a configured machine:

```bash
pnpm generate
pnpm --dir backend exec wrangler login
pnpm --dir backend deploy
```

The API uses a separate `workers.dev` URL; static pages do not need it. Keep tokens out of source, URLs, and frontend bundles.

### Production domain: www.rahullohra.com

The custom domain was connected on 26 October 2026. GitHub Pages is enabled for `rahul-lohra/my-website`, with these repository Actions variables:

```text
ENABLE_PAGES_DEPLOY=true
SITE_URL=https://www.rahullohra.com
BASE_PATH=/
```

The domain is verified under the `rahul-lohra` GitHub account. Keep the `_github-pages-challenge-rahul-lohra` DNS TXT record to retain verification. DNS uses `www` CNAME → `rahul-lohra.github.io` and the existing four GitHub Pages apex A records. HTTPS is enforced; `rahullohra.com` redirects to `https://www.rahullohra.com/`.

The custom-domain association was removed from `myblog`; the old repository remains available as a backup. The production deployment passed validation in [GitHub Actions run 40228654863](https://github.com/rahul-lohra/my-website/actions/runs/40228654863). The live domain, all public content pages, the résumé PDF, feeds, sampled dated article compatibility URLs, apex/HTTP redirects, and the custom 404 were checked after the handover.

For future updates, push changes and manually run **Deploy frontend to GitHub Pages**. Keep the production variables above. A CNAME file is not required with the custom Actions publishing workflow. If deploying the optional Worker later, add `https://www.rahullohra.com` to its exact allowed CORS origins before deployment.

### Free-tier constraints & official references

GitHub Pages serves static content and has documented repository/site/build limits; the API therefore runs separately. Workers Free currently allows 100,000 requests/day, with CPU and memory limits. The API is optional for browsing, so exhausting that limit does not remove the portfolio or blog. No paid plan, database, or AI service is enabled.

- [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro GitHub Pages deployment and base paths](https://docs.astro.build/en/guides/deploy/github/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

## Appearance

The header offers Light, Dark, and System themes. System is the default and follows the operating system, including changes while the site is open. An explicit choice is stored locally and applies before the page paints to avoid a theme flash. Preferences persist across pages and synchronize between tabs. If browser storage is blocked, theme switching still works for the current page. Without JavaScript, the CSS follows the system color scheme.

## Accessibility & SEO

Semantic navigation, skip link, visible keyboard focus, labeled search, filter pressed states, live result counts, reduced motion, responsive grids and local images. Full pages and initial search results render on the server. Articles include author/date/reading time, table of contents, copy controls, syntax highlighting, and previous/next navigation. Each route has a unique title/description, canonical and Open Graph metadata; sitemap, RSS and robots are generated for the configured origin and base. The Open Graph image is a bundled PNG, with its editable SVG source alongside it. External Google Fonts are progressive enhancement: system serif/sans fonts remain readable if unavailable.

## Implementation verification

Both origin-root and `/my-website/` production builds passed schema/TypeScript checks, eight behavioral test cases across three files, and 365 internal link/asset checks across 34 HTML files. All 34 generated HTML URLs responded directly; an unknown URL returned the custom HTTP 404. RSS and sitemap files parsed as valid XML. Wrangler's Worker dry-run build succeeded, and the real local Worker returned the expected 200/204/403/404/405 statuses and exact CORS headers.

Browser QA exercised blog search with combined topic filtering, empty results and reset, project search and details, article refresh, local images, code copying, and a legacy dated redirect. All 20 public pages were checked at 390px with no horizontal overflow or broken loaded images. Representative pages also passed at 320px and 768px, with desktop visual review. The frontend remained usable after the local API was stopped. No browser console errors were observed in the final preview.

The frontend deployment and custom-domain handover are complete. The optional Cloudflare Worker still requires account credentials and a separate deployment; it is not required to browse the website. Add real RAG content when ready; the user-supplied résumé is integrated.
