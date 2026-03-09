# Migration: Next.js → React SPA + ASP.NET Core (Razor Pages Shell)

This document is a full, project-specific guide for replacing Next.js with an ASP.NET Core
backend that serves a Vite-bundled React SPA. Every section maps directly to existing code
in this repo.

---

## Architecture Overview

```
Before:
  Browser ──► Next.js (SSR, Server Actions, Middleware)
                 └──► .NET Backend API

After:
  Browser ──► ASP.NET Core (auth middleware, API proxy controllers, static files)
                 ├──► React SPA (Vite bundle served from wwwroot)
                 └──► .NET Backend API
```

The React codebase stays largely intact. The main changes are:

1. **Remove** `'use server'` actions — replace with ASP.NET controller endpoints
2. **Remove** Next.js middleware auth — replace with ASP.NET `[Authorize]` + JWT middleware
3. **Remove** `src/lib/cookies.ts` / `src/lib/rbac.ts` — their jobs move to C#
4. **Replace** `next/navigation` redirects with React Router
5. **Replace** `process.env.*` config with `appsettings.json`

---

## Part 1: New ASP.NET Core Project

### 1.1 Create the project

```bash
dotnet new web -n TimcastAdmin.Web
cd TimcastAdmin.Web
```

### 1.2 `Program.cs` — full setup

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using TimcastAdmin.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// ── JWT Auth ──────────────────────────────────────────────────────────────────
// The .NET backend already issues JWTs. We just validate them here so
// [Authorize] works. The token is read from the httpOnly "token" cookie.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        var cfg = builder.Configuration;
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = false,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = cfg["Jwt:Issuer"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                                           Encoding.UTF8.GetBytes(cfg["Jwt:Secret"]!)),
            NameClaimType            = "sub",    // matches cookies.ts: claims.sub
            RoleClaimType            = "role",   // matches cookies.ts: claims.role
        };

        // Read JWT from httpOnly cookie instead of Authorization header
        opts.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                ctx.Token = ctx.Request.Cookies["token"];
                return Task.CompletedTask;
            }
        };
    });

// ── Authorization Policies ────────────────────────────────────────────────────
// Mirrors src/lib/roles.ts and src/lib/roleHelpers.ts
builder.Services.AddAuthorization(opts =>
{
    // Admin tier: owner, admin, backup
    string[] adminTier = ["owner", "admin", "backup"];

    opts.AddPolicy("AnyRole",           p => p.RequireRole(
        "owner","admin","backup","ops","service",
        "con_publisher","con_writer","com_mod","com_appellate",
        "bot_verification","evt_manager","evt_tkt_manager",
        "member_manager","sub_manager"));

    opts.AddPolicy("AdminOrHigher",     p => p.RequireRole(adminTier));
    opts.AddPolicy("OwnerOnly",         p => p.RequireRole("owner"));

    opts.AddPolicy("ContentOrHigher",   p => p.RequireRole([.. adminTier, "con_publisher", "con_writer"]));
    opts.AddPolicy("PublisherOrHigher", p => p.RequireRole([.. adminTier, "con_publisher"]));

    opts.AddPolicy("CommentsOrHigher",  p => p.RequireRole([.. adminTier, "com_mod", "com_appellate"]));

    opts.AddPolicy("EventsOrHigher",    p => p.RequireRole([.. adminTier, "evt_manager", "evt_tkt_manager"]));

    opts.AddPolicy("MembersOrHigher",   p => p.RequireRole([.. adminTier, "member_manager"]));
    opts.AddPolicy("SubsOrHigher",      p => p.RequireRole([.. adminTier, "sub_manager"]));
});

// ── Backend HTTP Client ───────────────────────────────────────────────────────
builder.Services.AddHttpClient<BackendClient>(c =>
{
    c.BaseAddress = new Uri(builder.Configuration["BackendUrl"]!);
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// ── Static files: serve Vite build output ─────────────────────────────────────
// After `pnpm build`, output lands in ../it.admin-web/dist (configured in vite.config.ts)
var spaPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "spa");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(spaPath),
    RequestPath  = ""
});

app.MapControllers();

// ── SPA fallback: all non-API routes serve index.html ─────────────────────────
app.MapFallback(async ctx =>
{
    var indexPath = Path.Combine(spaPath, "index.html");
    ctx.Response.ContentType = "text/html";
    await ctx.Response.SendFileAsync(indexPath);
});

app.Run();
```

### 1.3 `appsettings.json`

```json
{
  "BackendUrl": "https://api.internal.timcast.com",
  "Jwt": {
    "Issuer": "timcast-auth",
    "Secret": "<same secret the .NET backend uses to sign tokens>"
  }
}
```

> **Note:** `Jwt:Secret` must match what your existing .NET auth service uses to sign
> the `token` cookie JWTs. Check your auth service's `appsettings.json` / secrets.

---

## Part 2: BackendClient Service

This replaces `authHeaders()` + `fetch()` in every server action. It forwards the
caller's JWT cookie to the backend as a `Bearer` header.

```csharp
// Services/BackendClient.cs
namespace TimcastAdmin.Web.Services;

public class BackendClient(HttpClient http)
{
    public async Task<T?> GetAsync<T>(string path, string? token,
        Dictionary<string, string>? query = null)
    {
        var url = query?.Count > 0
            ? $"{path}?{string.Join("&", query.Select(kv =>
                  $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"))}"
            : path;

        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        Authorize(req, token);
        var res = await http.SendAsync(req);
        if (!res.IsSuccessStatusCode) return default;
        return await res.Content.ReadFromJsonAsync<T>();
    }

    public async Task<T?> PostJsonAsync<T>(string path, string? token, object body)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, path);
        Authorize(req, token);
        req.Content = JsonContent.Create(body);
        var res = await http.SendAsync(req);
        return await res.Content.ReadFromJsonAsync<T>();
    }

    /// Post a pre-serialized JSON string (for Protobuf toJsonString payloads)
    public async Task<T?> PostRawJsonAsync<T>(string path, string? token, string jsonBody)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, path);
        Authorize(req, token);
        req.Content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json");
        var res = await http.SendAsync(req);
        return await res.Content.ReadFromJsonAsync<T>();
    }

    private static void Authorize(HttpRequestMessage req, string? token)
    {
        if (!string.IsNullOrEmpty(token))
            req.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }
}
```

A helper to pull the token from the incoming request cookie — used in every controller:

```csharp
// Controllers/ApiControllerBase.cs
using Microsoft.AspNetCore.Mvc;

namespace TimcastAdmin.Web.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected string? BearerToken => Request.Cookies["token"];
}
```

---

## Part 3: Auth Controller

Replaces `src/app/actions/auth.ts`.

```csharp
// Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimcastAdmin.Web.Services;

namespace TimcastAdmin.Web.Controllers;

[Route("api/auth")]
public class AuthController(BackendClient backend) : ApiControllerBase
{
    // Replaces: loginAction()
    // React calls: POST /api/auth/login  { Username, Password }
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var res = await backend.PostJsonAsync<LoginResponse>(
            "/auth/login", token: null, req);

        if (res?.ok != true)
            return Unauthorized(res);

        Response.Cookies.Append("token", res.BearerToken!, new CookieOptions
        {
            HttpOnly = true,
            Secure   = true,
            SameSite = SameSiteMode.Strict,
            Expires  = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new { ok = true });
    }

    // Replaces: logoutAction()
    [HttpPost("logout")]
    [AllowAnonymous]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("token");
        return Ok();
    }

    // Replaces: getSession() / UserProvider bootstrap
    // React fetches this once on mount to populate UserContext
    [HttpGet("me")]
    [Authorize(Policy = "AnyRole")]
    public IActionResult Me()
    {
        var roles = User.FindAll("role")
                        .SelectMany(c => c.Value.Split(','))
                        .Distinct()
                        .ToArray();

        return Ok(new
        {
            id          = User.FindFirstValue("Id"),
            userName    = User.FindFirstValue("sub"),
            displayName = User.FindFirstValue("Display"),
            roles
        });
    }

    // Replaces: renewToken()
    [HttpGet("renew")]
    [Authorize(Policy = "AnyRole")]
    public async Task<IActionResult> RenewToken()
    {
        var res = await backend.GetAsync<RenewTokenResponse>("/auth/renewtoken", BearerToken);
        if (res?.BearerToken is { Length: > 0 } newToken)
        {
            Response.Cookies.Append("token", newToken, new CookieOptions
            {
                HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict,
                Expires  = DateTimeOffset.UtcNow.AddDays(7)
            });
        }
        return Ok(res);
    }
}

public record LoginRequest(string Username, string Password);
public record LoginResponse(bool ok, string? BearerToken);
public record RenewTokenResponse(string? BearerToken);
```

---

## Part 4: Users (Admin) Controller

Replaces the bulk of `src/app/actions/auth.ts` — the admin user management functions.

```csharp
// Controllers/UsersController.cs
[Route("api/users")]
[Authorize(Policy = "MembersOrHigher")]
public class UsersController(BackendClient backend) : ApiControllerBase
{
    // Replaces: listUsers()
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] SearchUsersQuery q)
    {
        var query = new Dictionary<string, string>
        {
            ["PageSize"]        = (q.PageSize ?? 25).ToString(),
            ["PageOffset"]      = (q.PageOffset ?? 0).ToString(),
            ["IncludeDeleted"]  = (q.IncludeDeleted ?? true).ToString().ToLower(),
        };
        if (!string.IsNullOrEmpty(q.SearchString)) query["SearchString"] = q.SearchString;
        // Roles array — repeat key per value (same as listUsers() enc() loop)
        // Pass as multiple query params; controller framework handles array binding

        var res = await backend.GetAsync<object>("/auth/admin/search", BearerToken, query);
        return Ok(res);
    }

    // Replaces: adminGetUser()
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUser(string userId)
    {
        var res = await backend.GetAsync<object>($"/auth/admin/user/{userId}", BearerToken);
        return Ok(res);
    }

    // Replaces: createUser()
    [HttpPost]
    [Authorize(Policy = "AdminOrHigher")]
    public async Task<IActionResult> CreateUser([FromBody] object body)
    {
        var res = await backend.PostJsonAsync<object>("/auth/admin/createuser", BearerToken, body);
        return Ok(res);
    }

    // Replaces: adminEditOtherUser()
    [HttpPost("modify")]
    [Authorize(Policy = "MembersOrHigher")]
    public async Task<IActionResult> ModifyUser([FromBody] object body)
    {
        var res = await backend.PostJsonAsync<object>("/auth/admin/user", BearerToken, body);
        return Ok(res);
    }

    // Replaces: grantRolesToUser()
    [HttpPost("roles")]
    [Authorize(Policy = "AdminOrHigher")]
    public async Task<IActionResult> ModifyRoles([FromBody] object body)
    {
        var res = await backend.PostJsonAsync<object>("/auth/admin/user/roles", BearerToken, body);
        return Ok(res);
    }

    // Replaces: enableUser() / disableUser()
    [HttpPost("{userId}/enable")]
    public async Task<IActionResult> EnableUser(string userId, [FromBody] object body)
    {
        var res = await backend.PostJsonAsync<object>($"/auth/admin/user/{userId}/enable", BearerToken, body);
        return Ok(res);
    }

    [HttpPost("{userId}/disable")]
    public async Task<IActionResult> DisableUser(string userId, [FromBody] object body)
    {
        var res = await backend.PostJsonAsync<object>($"/auth/admin/user/{userId}/disable", BearerToken, body);
        return Ok(res);
    }

    // Replaces: adminGetUserTotpDevices() / adminDisableOtherTotp()
    [HttpGet("totp/{userId}")]
    public async Task<IActionResult> GetTotpDevices(string userId)
    {
        var res = await backend.GetAsync<object>($"/auth/admin/totp/{userId}", BearerToken);
        return Ok(res);
    }

    [HttpPost("totp/disable")]
    public async Task<IActionResult> DisableTotp([FromBody] object body)
    {
        var res = await backend.PostJsonAsync<object>("/auth/admin/totp/disable", BearerToken, body);
        return Ok(res);
    }

    // Replaces: adminEditOtherUserPassword()
    [HttpPost("password")]
    public async Task<IActionResult> ChangePassword([FromBody] object body)
    {
        var res = await backend.PostJsonAsync<object>("/auth/admin/password", BearerToken, body);
        return Ok(res);
    }
}

public record SearchUsersQuery(
    int? PageSize, int? PageOffset, string? SearchString,
    bool? IncludeDeleted, string[]? Roles, string[]? UserIDs);
```

---

## Part 5: Content Controller

Replaces `src/app/actions/content.ts`.

```csharp
// Controllers/ContentController.cs
[Route("api/content")]
[Authorize(Policy = "ContentOrHigher")]
public class ContentController(BackendClient backend) : ApiControllerBase
{
    private const string Base = "/cms/admin/content";

    // Replaces: getContent() / getAllContent() / adminSearchContent()
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ContentQuery q)
    {
        var query = new Dictionary<string, string>
        {
            ["PageOffset"] = (q.PageOffset ?? 0).ToString(),
            ["PageSize"]   = (q.PageSize ?? 10).ToString(),
            ["SubscriptionSearch.MinimumLevel"] = (q.MinLevel ?? 0).ToString(),
            ["SubscriptionSearch.MaximumLevel"] = (q.MaxLevel ?? 9999).ToString(),
        };
        if (q.CategoryId  != null) query["CategoryId"]  = q.CategoryId;
        if (q.ChannelId   != null) query["ChannelId"]   = q.ChannelId;
        if (q.ContentType != null) query["ContentType"] = q.ContentType.ToString()!;

        var res = await backend.GetAsync<object>(Base, BearerToken, query);
        return Ok(res);
    }

    // Replaces: adminGetContent()
    [HttpGet("{contentId}")]
    public async Task<IActionResult> GetOne(string contentId)
    {
        var res = await backend.GetAsync<object>($"{Base}/{contentId}", BearerToken);
        return Ok(res);
    }

    // Replaces: createContent()
    [HttpPost]
    [Authorize(Policy = "PublisherOrHigher")]
    public async Task<IActionResult> Create([FromBody] object body)
    {
        var res = await backend.PostJsonAsync<object>(Base, BearerToken, body);
        return Ok(res);
    }

    // Replaces: modifyContent()
    [HttpPost("{contentId}/modify")]
    [Authorize(Policy = "PublisherOrHigher")]
    public async Task<IActionResult> Modify(string contentId, [FromBody] object body)
    {
        var res = await backend.PostJsonAsync<object>($"{Base}/{contentId}", BearerToken, body);
        return Ok(res);
    }

    // Replaces: publishContent() / unpublishContent() / announceContent() /
    //           unannounceContent() / deleteContent() / undeleteContent()
    [HttpPost("{contentId}/{action}")]
    [Authorize(Policy = "PublisherOrHigher")]
    public async Task<IActionResult> ContentAction(string contentId, string action,
        [FromBody] object body)
    {
        var allowed = new[] { "publish", "unpublish", "announce", "unannounce", "delete", "undelete" };
        if (!allowed.Contains(action)) return BadRequest();
        var res = await backend.PostJsonAsync<object>($"{Base}/{contentId}/{action}", BearerToken, body);
        return Ok(res);
    }
}

public record ContentQuery(
    int? PageOffset, int? PageSize, string? CategoryId,
    string? ChannelId, int? ContentType, int? MinLevel, int? MaxLevel);
```

---

## Part 6: Settings Controller

Replaces `src/app/actions/settings.ts`.

```csharp
// Controllers/SettingsController.cs
[Route("api/settings")]
[Authorize(Policy = "AdminOrHigher")]
public class SettingsController(BackendClient backend) : ApiControllerBase
{
    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublic()
        => Ok(await backend.GetAsync<object>("/settings/public", BearerToken));

    [HttpGet("admin")]
    public async Task<IActionResult> GetAdmin()
        => Ok(await backend.GetAsync<object>("/settings/admin", BearerToken));

    [HttpGet("owner")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<IActionResult> GetOwner()
        => Ok(await backend.GetAsync<object>("/settings/owner", BearerToken));

    [HttpGet("channels")]
    public async Task<IActionResult> GetChannels()
        => Ok(await backend.GetAsync<object>("/settings/channel", BearerToken));

    [HttpPost("channels")]
    public async Task<IActionResult> CreateChannel([FromBody] object body)
        => Ok(await backend.PostJsonAsync<object>("/settings/channel/create", BearerToken, body));

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] object body)
        => Ok(await backend.PostJsonAsync<object>("/settings/category/create", BearerToken, body));

    [HttpPost("subscription/public")]
    public async Task<IActionResult> ModifySubPublic([FromBody] object body)
        => Ok(await backend.PostJsonAsync<object>("/settings/subscription/public", BearerToken, body));

    [HttpPost("subscription/owner")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<IActionResult> ModifySubOwner([FromBody] object body)
        => Ok(await backend.PostJsonAsync<object>("/settings/cms/public", BearerToken, body));

    [HttpPost("cms/public")]
    public async Task<IActionResult> ModifyCmsPublic([FromBody] object body)
        => Ok(await backend.PostJsonAsync<object>("/settings/cms/public", BearerToken, body));

    [HttpPost("events/public")]
    public async Task<IActionResult> ModifyEventsPublic([FromBody] object body)
        => Ok(await backend.PostJsonAsync<object>("/settings/events/public", BearerToken, body));

    [HttpPost("events/private")]
    public async Task<IActionResult> ModifyEventsPrivate([FromBody] object body)
        => Ok(await backend.PostJsonAsync<object>("/settings/events/private", BearerToken, body));

    [HttpPost("events/owner")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<IActionResult> ModifyEventsOwner([FromBody] object body)
        => Ok(await backend.PostJsonAsync<object>("/settings/events/owner", BearerToken, body));

    [HttpPost("notifications/owner")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<IActionResult> ModifyNotificationsOwner([FromBody] object body)
        => Ok(await backend.PostJsonAsync<object>("/settings/notifications/owner", BearerToken, body));
}
```

---

## Part 7: Dashboard + Other Controllers

Replaces `src/app/actions/dashboard.ts`, `assets.ts`, `auditLog.ts`, `careers.ts`,
`comments.ts`, `payment.ts`.

```csharp
// Controllers/DashboardController.cs
[Route("api/dashboard")]
[Authorize(Policy = "AnyRole")]
public class DashboardController(BackendClient backend) : ApiControllerBase
{
    // Replaces: getKpis()
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis()
        => Ok(await backend.GetAsync<object>("/dashboard", BearerToken));
}
```

For the remaining action files, follow the same pattern — one controller per file,
routes matching the existing backend API paths. The calendar/week/overview activity
helpers in `content.ts` were pure in-memory transformations on top of `getContent()`.
**These move to the React client** — fetch from `/api/content` and compute the
groupings client-side (no server involvement needed).

---

## Part 8: React — Replace Server Action Calls

### 8.1 Update Vite config

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  build: {
    outDir: '../TimcastAdmin.Web/wwwroot/spa',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Dev: forward /api/* to local ASP.NET instance
      '/api': 'https://localhost:5001'
    }
  }
})
```

### 8.2 Replace `'use server'` imports with fetch calls

Every place that imports from `src/app/actions/*` changes like this:

```ts
// Before
import { loginAction } from '@/app/actions/auth'
const res = await loginAction({ Username, Password })

// After — call the ASP.NET endpoint directly
const res = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',          // sends the httpOnly cookie
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ Username, Password }),
}).then(r => r.json())
```

The `credentials: 'include'` flag replaces `authHeaders()` — the browser automatically
sends the httpOnly `token` cookie. You no longer need to read or forward it manually.

### 8.3 Replace `UserProvider` bootstrap

`getSession()` decoded the JWT server-side. Now fetch `/api/auth/me`:

```tsx
// src/components/context/user-context.tsx
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setUser(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}
```

### 8.4 Replace `requireRole()` page guards

Next.js pages called `await requireRole(...)` at the top. React pages use a guard
component or hook instead:

```tsx
// src/components/RequireRole.tsx
import { useUser } from '@/components/context/user-context'
import { Navigate } from 'react-router-dom'

export function RequireRole({
  check, children, redirectTo = '/unauthorized'
}: {
  check: (roles: string[]) => boolean
  children: React.ReactNode
  redirectTo?: string
}) {
  const { user, loading } = useUser()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!check(user.roles)) return <Navigate to={redirectTo} replace />
  return <>{children}</>
}
```

Usage:

```tsx
// src/app/users/page.tsx  →  src/pages/users/UsersPage.tsx
import { RequireRole } from '@/components/RequireRole'
import { isMemberManagerOrHigher } from '@/lib/roleHelpers'

export default function UsersPage() {
  return (
    <RequireRole check={isMemberManagerOrHigher}>
      <UsersContent />
    </RequireRole>
  )
}
```

### 8.5 Replace middleware auth redirect

`src/middleware.ts` redirected unauthenticated requests to `/login`. The equivalent
in React is a top-level route guard:

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from '@/components/context/user-context'

function ProtectedLayout() {
  const { user, loading } = useUser()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <DashboardLayout />
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/*"            element={<ProtectedLayout />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  )
}
```

### 8.6 Replace `next/navigation` and `next/link`

| Next.js | React Router |
|---|---|
| `import { redirect } from 'next/navigation'` | `import { useNavigate } from 'react-router-dom'` |
| `redirect('/login')` | `navigate('/login')` |
| `import Link from 'next/link'` | `import { Link } from 'react-router-dom'` |
| `useRouter().push('/path')` | `useNavigate()('/path')` |
| `usePathname()` | `useLocation().pathname` |
| `useSearchParams()` | `useSearchParams()` (same API, react-router) |

### 8.7 Delete Next.js-only files

Once all pages are migrated, remove:

```
src/app/actions/          ← replaced by ASP.NET controllers
src/middleware.ts          ← replaced by ASP.NET auth middleware
src/lib/cookies.ts         ← replaced by /api/auth/me + cookie middleware
src/lib/rbac.ts            ← replaced by [Authorize(Policy=...)]
src/app/layout.tsx         ← replaced by src/App.tsx
src/app/page.tsx           ← replaced by React Router root route
next.config.*
```

---

## Part 9: revalidatePath / revalidateTag → Cache Busting

`settings.ts` used `revalidatePath` and `revalidateTag` to bust Next.js ISR caches
after mutations. There is no equivalent in a pure client SPA. Instead:

1. After a mutating fetch call succeeds, call your React Query / SWR `invalidate()` or
   trigger a re-fetch on the affected query.
2. If you use React Query:

```ts
const queryClient = useQueryClient()

async function handleSave(data) {
  await fetch('/api/settings/subscription/public', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  // Replaces revalidatePath('/settings/subscriptions')
  await queryClient.invalidateQueries({ queryKey: ['settings', 'admin'] })
}
```

---

## Part 10: Protobuf JSON Serialization

Your actions used `toJsonString(Schema, msg)` to produce proto-JSON before sending.
That logic stays in React — serialize the request body client-side the same way, then
POST the string to the ASP.NET proxy. The proxy passes it through as-is to the backend.

```ts
// React (unchanged)
const body = toJsonString(ModifyContentRequestSchema, req)

await fetch(`/api/content/${req.ContentID}/modify`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body,  // already a JSON string
})
```

In ASP.NET, `BackendClient.PostRawJsonAsync` handles forwarding the raw string.

---

## Migration Checklist

### ASP.NET project
- [ ] `Program.cs` — JWT auth reading `token` cookie, authorization policies, static files, SPA fallback
- [ ] `appsettings.json` — `BackendUrl`, `Jwt:Issuer`, `Jwt:Secret`
- [ ] `Services/BackendClient.cs` — HTTP client that forwards Bearer token
- [ ] `Controllers/ApiControllerBase.cs` — `BearerToken` helper
- [ ] `Controllers/AuthController.cs` — login, logout, me, renew
- [ ] `Controllers/UsersController.cs` — all admin user endpoints
- [ ] `Controllers/ContentController.cs` — all CMS endpoints
- [ ] `Controllers/SettingsController.cs` — all settings endpoints
- [ ] `Controllers/DashboardController.cs` — KPIs
- [ ] Additional controllers for assets, audit-log, careers, comments, payment

### React / Vite
- [ ] `vite.config.ts` — `outDir` pointing to ASP.NET `wwwroot/spa`, dev proxy to `/api`
- [ ] Remove `'use server'` imports, replace with `fetch('/api/...')` + `credentials: 'include'`
- [ ] `UserProvider` — fetch `/api/auth/me` instead of `getSession()`
- [ ] `RequireRole` component — replaces `requireRole()` page guard
- [ ] `App.tsx` — `BrowserRouter` + protected layout (replaces `middleware.ts`)
- [ ] Swap `next/link` → `react-router-dom` `Link`
- [ ] Swap `next/navigation` → `useNavigate`, `useLocation`, `useSearchParams`
- [ ] Remove `next.config.*`, `src/middleware.ts`, `src/lib/cookies.ts`, `src/lib/rbac.ts`
- [ ] Remove `src/app/` directory structure (replace with `src/pages/`)
- [ ] Replace `revalidatePath/revalidateTag` patterns with React Query `invalidateQueries`
- [ ] `pnpm remove next` — strip Next.js from `package.json`
- [ ] `pnpm add react-router-dom vite @vitejs/plugin-react`
