# VidEngine Frontend

A mobile-first web client for the VidEngine API. React 19, Vite and Tailwind CSS 4,
with no UI component library — the design system lives in `src/index.css`.

## Getting started

```bash
cd frontend
npm install
cp .env.sample .env      # optional; the defaults work with a local backend
npm run dev              # http://localhost:5173
```

The backend must be running separately (`cd backend && npm run dev`). In
development the dev server proxies `/api` to `VITE_PROXY_TARGET` (default
`http://localhost:8000`), so the browser sees a single origin and cookie auth
works without any CORS configuration.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload and the API proxy |
| `npm run build` | Production bundle into `frontend/dist` |
| `npm run preview` | Serve the built bundle locally |

### Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api/v1` | Base URL the browser calls |
| `VITE_PROXY_TARGET` | `http://localhost:8000` | Where the dev proxy forwards `/api` |

To deploy against an API on another origin, set
`VITE_API_BASE_URL=https://api.example.com/api/v1` at build time.

## Mobile-first approach

Every screen is designed at 360–390px first and enhanced upward.

- **Navigation follows the viewport.** A fixed bottom tab bar under the thumb on
  phones; from `md` it is replaced by a persistent sidebar, with the same links
  in a slide-in drawer for anything narrower.
- **Touch targets are at least 44px,** enforced by `min-h-11` in the shared
  button and field components rather than screen by screen.
- **Inputs use 16px text.** Anything smaller makes iOS Safari zoom the viewport
  when a field receives focus.
- **Safe-area insets** are respected on notched devices (`pt-safe`, `pb-safe`,
  `px-safe`). These utilities set padding outright, so they belong on a wrapper
  rather than on an element that already carries its own padding.
- **`100dvh`, not `100vh`,** so mobile browser chrome never clips the layout.
- **Overflowing rows scroll sideways** — chip rails, action bars, tab strips —
  instead of wrapping into a tall stack.
- **Bottom sheets on phones, centred dialogs on desktop:** one `Sheet`
  component, two presentations.
- **Light and dark themes** follow the system preference, are overridable from
  the top bar, and persist in `localStorage`.
- Routes are lazy-loaded, so a phone on a slow connection downloads only the
  screen it opened.

## Structure

```
src/
  api/          One module per backend router, plus the fetch client
  components/
    layout/     App shell, top bar, bottom tab bar, sidebar
    ui/         Buttons, fields, avatar, sheet, toasts, icons, skeletons
  context/      Auth, theme and toast providers
  hooks/        useAsync, useMediaQuery, useDocumentTitle
  pages/        One module per route
  utils/        Formatting helpers
```

## Screens

| Route | Purpose |
| --- | --- |
| `/login`, `/register` | Sign in and account creation (avatar upload included) |
| `/` | Channel stats, your videos, recently liked |
| `/search` | Channel lookup by username |
| `/watch/:videoId` | Player, description, comments (add, edit, delete, like) |
| `/upload` | Publish a video with thumbnail and draft toggle |
| `/channel/:username` | Videos, playlists and tweets, with subscribe |
| `/tweets` | Compose and manage your short posts |
| `/library`, `/history` | Liked videos and watch history |
| `/playlists`, `/playlists/:id` | Create, edit, delete, add and remove videos |
| `/studio` | Manage uploads: publish toggle, edit, delete |
| `/settings` | Profile, avatar, cover image, password, theme, sign out |

## Notes on the API

`src/api/client.js` accommodates three things about the backend:

1. **Success is not always 2xx.** Several controllers answer `302` or `202` on
   success, so the client trusts the `success` flag in the `ApiResponse`
   envelope rather than `response.ok`.
2. **Cookies are set with `secure: true`,** which browsers drop over plain
   `http://localhost`. The access token is therefore also kept in
   `localStorage` and sent as a bearer header, which `verifyJWT` accepts.
3. **A 401 triggers one refresh attempt** via `/users/refresh-token`, and
   parallel 401s share a single refresh call. That endpoint returns its payload
   inside an error envelope, so the client treats the presence of a new access
   token as the real signal.

Two API limitations shape the UI rather than being papered over:

- **There is no global video feed.** `GET /videos` requires a `userId`, so the
  home page shows your own channel and liked videos, and discovering other
  channels goes through username lookup.
- **There is no full-text search.** `GET /users/c/:username` matches an exact
  username, so the search page is presented as a username lookup.

Where a listing omits fields — `GET /videos` projects away the thumbnail —
components degrade gracefully instead of rendering broken images.
