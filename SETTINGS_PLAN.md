# Settings Pages Plan (Protobuf‑First)

Note: Validators, messages, and helpers referenced here come from `@inverted-tech/fragments`.

## Goals
- Single source of truth: `.proto` messages/enums for all settings
- Client renders forms from typed messages; submits serialized payloads
- Server decodes, validates via protobuf validators; returns typed errors
- Replace demo components with compact, task‑focused UIs

## Protobuf‑First Approach
- Define module `.proto` files:
  - `proto/settings/general.proto`
  - `proto/settings/subscriptions.proto`
  - `proto/settings/comments.proto`
  - `proto/settings/content.proto` (future: `notifications.proto`, `events.proto`)
- Generate TS into `src/gen/proto/**`; wire to validators from `@inverted-tech/fragments`
- Map validator error paths → field names for inline errors
- Prefer full‑message updates; support PATCH with field masks if needed
- Add `AuditInfo` fields (version, updated_at, updated_by) at top level

## Pages and Content

### Overview (`/settings`)
- Cards: General, Content, Comments, Subscriptions with status + last updated
- Critical warnings (e.g., provider misconfig, invalid tiers)
- Shortcuts to subsections; “pending changes” badge if drafts
- Export settings (JSON/Proto) and recent changes (audit feed)

### General: Personalization (`/settings/general/personalization`)
- Brand: siteName, logoLightUrl, logoDarkUrl, faviconUrl, primaryColor
- Theme: mode (SYSTEM/LIGHT/DARK), radius, fontScale (live preview)
- Locale: timezone, locale, date/time formats
- SEO defaults: titleSuffix, meta description, OpenGraph defaults

### Subscriptions (`/settings/subscriptions`)
- Tiers (CRUD): name, description, color, amountCents, order (drag)
- Constraints: allowOther, minAllowed, maxAllowed (with validation hints)
- Providers:
  - Manual { enabled }
  - Fortis { enabled, isTest }
  - Crypto { enabled }
  - Stripe { enabled, url }
  - Paypal { enabled, url, clientId }
- Currency + formatting preview; entitlement preview for gating

### Comments (`/settings/comments`)
- Basics: allowLinks toggle (show sanitizer rules)
- Defaults: defaultOrder (enum), defaultRestriction { minimumRole, level }
- Moderation: explicitModeEnabled, blacklistTerms[] (CRUD)
- Safety: link whitelist, max length, rate limits (optional)
- Preview: sample thread rendered with current settings

### Content (`/settings/content`)
- defaultLayout (LIST/GRID/MASONRY…) with live preview
- Channels (CRUD): channelId, parentChannelId, displayName, urlStub, imageAssetId, youtubeUrl, rumbleUrl, oldChannelId (tree view)
- Categories (CRUD): categoryId, parentCategoryId, displayName, urlStub, oldCategoryId (tree view + merge/move)
- Menu Labels: audio, picture, video, written (localization‑ready)
- Routing preview (example URL resolver)

### Notifications (Future) (`/settings/notifications`)
- Channels: Email, Web push, In‑app; enable/disable
- Providers: SMTP/Resend/SES setup; test send flow
- Templates: event‑driven with variables and preview
- Policies: quiet hours, digest cadence, per‑role defaults

### Events (Future) (`/settings/events`)
- TicketClasses (CRUD): ticketClassId, type, name, amountAvailable, countTowardEventMax, maxTicketsPerUser, isTransferrable, pricePerTicketCents
- Defaults: currency, fees, refund window, transfer rules
- Purchase flow preview stub

## Core Messages/Enums (Sketch)
- GeneralSettings
  - site_name, logo_light_url, logo_dark_url, favicon_url, primary_color
  - theme_mode (SYSTEM/LIGHT/DARK), radius, font_scale
  - locale, timezone, title_suffix, default_meta
- SubscriptionsSettings
  - Tier { name, description, color, amount_cents, order }
  - Constraints { allow_other, min_allowed, max_allowed }
  - Providers { Manual { enabled }, Fortis { enabled, is_test }, Crypto { enabled }, Stripe { enabled, url }, Paypal { enabled, url, client_id } }
- CommentsSettings
  - allow_links, default_order (NEWEST_FIRST/OLDEST_FIRST/TOP)
  - DefaultRestriction { minimum_role (ANON/SUBSCRIBER/PAID_SUB/COMMENT_MOD/ADMIN), level }
  - explicit_mode_enabled, blacklist_terms[]
- ContentSettings
  - default_layout (LIST/GRID/MASONRY/...)
  - Channel { channel_id, parent_channel_id, display_name, url_stub, image_asset_id, youtube_url, rumble_url, old_channel_id }
  - Category { category_id, parent_category_id, display_name, url_stub, old_category_id }
  - MenuLabels { audio, picture, video, written }
- Shared
  - AuditInfo { version, updated_at, updated_by }
  - FieldMask support (optional)

## UX & Validation Flow
- Load: GET returns message + audit; hydrate form from message
- Save: POST/PUT with full message → server validates via protobuf validators → returns updated message + audit or structured errors
- Error model example: `{ path: "providers.paypal.client_id", code: "REQUIRED", message: "Client ID is required" }`
- Inline errors mapped by path; scroll to first error; toasts for success/failure

## Data Flow
- Client: `fetchSettings(kind)` → message; `saveSettings(kind, message)` for mutations
- Server: decode protobuf → validate (`@inverted-tech/fragments`) → persist → revalidate/cache bust
- Prefer additive message evolution; migrations server‑side as needed

## Implementation Phases
1) Confirm proto toolchain and output path; generate TS types
2) Define `.proto` for General, Subscriptions, Comments, Content
3) Build server adapters (decode/validate/persist/audit)
4) Rebuild Subscriptions and Content pages with new primitives
5) Add previews and save/apply flows; then General + Comments
6) Expand to Notifications/Events when ready

