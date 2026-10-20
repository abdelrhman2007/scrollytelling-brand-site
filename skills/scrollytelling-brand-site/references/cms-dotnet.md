# .NET CMS (optional): content, inbox, private QR cards

Build it when the client must edit content without a developer. **Write `docs/API.md` (the public contract) first**; the website types in `core/content/types.ts` mirror it exactly.

## Solution layout (Clean Architecture, .NET 10)
```
src/
├─ Demo.Cms.Domain           entities: Service, Project(+ProjectImage), Industry, TeamMember, SiteSettings,
│                            MediaAsset, ContactMessage, ContactCard · base Entity (Guid v7, audit) · ContentEntity (IsPublished, SortOrder)
├─ Demo.Cms.Application      generic ContentEditor<TEntity,TModel> (list/search/create/update/delete/duplicate/reorder/publish,
│                            unique slugs) · edit models + FluentValidation · MediaService · InboxService · SettingsService ·
│                            PublicContentService · PublicCardService · DashboardService · ports (ICmsDbContext, IMediaStorage, …)
├─ Demo.Cms.Infrastructure   EF Core SQL Server (schema "cms", split queries, retry), Identity, migrations, local file storage,
│                            SMTP notifier, seeder (roles, first admin, imports the website's current content + images)
└─ Demo.Cms.Web              Blazor Interactive Server admin (MudBlazor, brand theme, dark mode) · minimal public API ·
                             cookie auth · CORS · rate limiting · output cache with tag eviction on every admin save · /health
tests/                       xUnit: validators, mappers, upload guards, JSON contract names, endpoint auth (in-process)
```

## Admin UX checklist
- **Dashboard:** stats and the latest leads.
- **Inbox:** filters, search, paging, reply by email or WhatsApp, notes, statuses, empty spam, and an unread badge in the nav.
- **Content lists:** thumbnail, status chip, reorder arrows, publish toggle, duplicate as draft, delete with confirmation.
- **Editors:** grouped fields, slug suggested from the title, "Save" and "Save & close", toasts, inline validation errors.
- **Media library:** multi-upload, alt text, a usage count (images in use can't be deleted), copy URL.
- **Settings:** contacts and socials, plus the email address for new-lead alerts (Admin only).
- **Users and roles:** Admin or Editor, generated temporary passwords, lock and unlock, reset, and "always keep at least one admin".
- **Per-page DI scope:** `AdminPage : OwningComponentBase`, so each page gets a fresh DbContext rather than a circuit-long one.

## Security defaults
- **Sign-in:** Identity cookie (HttpOnly, SameSite=Lax), lockout after 5 attempts, passwords of 10+ characters, and local-only redirects after sign-in. Sign-in is a static SSR page; sign-out is a POST with antiforgery.
- **Session revalidation:** `RevalidatingServerAuthenticationStateProvider` every 5 minutes, using the security stamp.
- **Uploads:** an allow-list of raster formats only (no SVG), a magic-byte check, random file names and traversal-safe deletes.
- **Public contact API:** FluentValidation, a honeypot (bots get 202 and are stored as Spam), a rate limit of 5 per 10 minutes per IP, and only a truncated SHA-256 hash of the IP.
- **Secrets** live in `dotnet user-secrets` (dev) or environment variables (prod). Never print them.

## Public API
- `GET /api/v1/content` (cached 60 s; evicted when an admin saves), plus per-collection endpoints. Only published items are returned, sorted, with absolute media URLs.
- **Absolute URL gotcha:** build them from `PublicUrl:BaseUrl`. Don't use `Uri.TryCreate(path, Absolute)`: on Unix, `/uploads/x` parses as an absolute `file://` URI.
- `POST /api/v1/contact` returns `202` with `{ id, message }`, `400` with RFC 7807 `errors`, or `429`.

## Private QR contact cards
**What it is:** staff create digital business cards in the CMS. Each card lives at a **root address** on the website (`/qr`, `/alex`, or a random 12-character base36 code).

**Website side:**
- `src/app/[slug]/page.tsx` and `src/app/[slug]/vcard/route.ts`.
- Static routes such as `/about` and `/works` always win over this dynamic route.
- `getCard()` uses `cache: "no-store"`, so deactivating a card takes effect on the next scan.

**How cards stay hidden:**
- There is no list endpoint.
- Missing and inactive cards return the same 404.
- The CMS card endpoint is rate-limited to 60 requests per minute per IP.
- `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer` and `Cache-Control: private, no-store` are scoped to card-shaped paths in `next.config.ts` with a negative lookahead: `/:slug((?!about$|works$|…)[a-z0-9][a-z0-9-]*[a-z0-9]):rest(/vcard)?`.
- Cards are never linked from the site and never in the sitemap.

**Links:**
- **Reserved names:** `about`, `works`, `c`, `api`, `images` and the other site paths are blocked in **both** the CMS validator and the website's `core/content/cards.ts`. Keep the two lists in sync.
- **Guessability:** short readable links can be guessed, so the editor warns about it. Random codes keep a card private.
- **Old addresses:** `/c/:slug` redirects permanently to `/:slug`.

**QR codes:**
- Generated with QRCoder at error-correction level Q, with brand-navy modules and the quiet zone kept. SVG for print, PNG for digital use.
- Served from admin-only endpoints.
- The QR encodes `{Website:BaseUrl}/{slug}`. In development that is `localhost`, so generate printed codes after launch.

**Card page:** a photo with a yellow ring, name, role, "Save contact" (vCard 3.0 with RFC escaping and an international phone number), Call, WhatsApp, Email, Website, Location, socials, and Share (`navigator.share` with a clipboard fallback).

## Ops gotchas
- **SQL Server 2022 in Docker on Apple Silicon:** run with `--platform linux/amd64` and wait for "ready for client connections" (about 30 s). A CMS started earlier logs "pre-login handshake" errors and skips its migrations, so restart it.
- **Migrations without a database:** `dotnet ef migrations add X --project src/…Infrastructure --startup-project src/…Web --output-dir Persistence/Migrations`.
- **Testing the admin without a browser:** curl with a cookie jar. The antiforgery input renders as `type="hidden" name="__RequestVerificationToken" value="…"`; match on `name=` followed by `value=`.
- **Test data in SQL:** insert test rows with `sqlcmd -C` inside the container, run the checks, then delete them.
- **MudBlazor 9 API names:** `IMudDialogInstance`, `OpenFilePickerAsync`, `HtmlTag` (not `Component`). Inspect the package's XML docs before writing against an unfamiliar version.
