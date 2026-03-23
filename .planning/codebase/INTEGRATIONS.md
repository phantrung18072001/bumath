# External Integrations

**Analysis Date:** 2026-03-23

## APIs & External Services

**Google Apps Script:**
- Service: Google Apps Script API
- What it's used for: Backend for consultation form submissions (`src/components/landing/ConsultationForm.tsx`)
- SDK/Client: Fetch API (built-in browser API)
- Auth: Script ID in environment variable
- Endpoint: `VITE_APPS_SCRIPT_ENDPOINT` environment variable
- Configuration: `.env` file (see `.env.example`)
- Request format: POST with JSON body
- Data submitted: Student name (ho_ten), birth year (nam_sinh), academic level (luc_hoc), phone (sdt), course selection (khoa_hoc)

**Google Fonts:**
- Service: Google Fonts CDN
- What it's used for: "Be Vietnam Pro" font (weights 400, 500, 600, 700, 800, 900) for Vietnamese language support
- Implementation: CSS import in `src/index.css`
- URL: `https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap`
- No authentication required (public CDN)

## Data Storage

**Databases:**
- Not detected - This is a static frontend application with no backend database integration

**File Storage:**
- Local filesystem only - Static assets served from public directory
- Asset paths use `import.meta.env.BASE_URL` for GitHub Pages compatibility
- Logo/Image: `bumath.jpeg` referenced in `src/components/landing/Header.tsx` and `src/components/landing/Footer.tsx`

**Caching:**
- TanStack React Query (React Query) - Infrastructure initialized in `src/App.tsx` with `QueryClient` and `QueryClientProvider` but currently not actively used for persistent caching
- Vite client-side caching handled by build output

## Authentication & Identity

**Auth Provider:**
- Custom validation only - No third-party authentication service
- Form validation: Vietnamese phone number regex pattern in `src/lib/validators.ts`
- Implementation: Client-side validation with `isValidVnPhone()` function
- Pattern: Supports Vietnamese phone numbers (0xx or +84xx format)

## Monitoring & Observability

**Error Tracking:**
- None detected - Standard browser error handling only

**Logs:**
- Browser console only (via `toast` notifications from Sonner library for user-facing feedback)
- No centralized logging service

**User Feedback:**
- Toast notifications via Sonner (`src/components/ui/sonner.tsx`) and shadcn toast (`src/components/ui/toaster.tsx`)
- Success/error messages displayed to users on form submission

## CI/CD & Deployment

**Hosting:**
- GitHub Pages
- Base path: `/bumath/` (set dynamically in `vite.config.ts` when `GITHUB_ACTIONS` environment variable is detected)
- Static site (no server runtime required)

**CI Pipeline:**
- GitHub Actions (detected by `GITHUB_ACTIONS` env variable check in vite.config.ts)
- Assumed workflow: Build Vite production bundle → Deploy to GitHub Pages

**Build Output:**
- Target: `dist/` directory (standard Vite output)
- Vite commands: `vite build` (production), `vite build --mode development` (dev-mode debugging)

## Environment Configuration

**Required env vars:**
- `VITE_APPS_SCRIPT_ENDPOINT` - Google Apps Script endpoint URL for form submissions (configured in `.env`)
  - Example: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
  - Must be valid HTTPS URL
  - Form submission fails gracefully if not set or invalid

**Optional env vars:**
- `BASE_URL` - Implicitly set by Vite; automatically switched to `/bumath/` during GitHub Actions builds

**Secrets location:**
- `.env` file (root directory, git-ignored)
- Template: `.env.example` with placeholder `YOUR_SCRIPT_ID`

## Webhooks & Callbacks

**Incoming:**
- Google Apps Script endpoint receives POST requests from consultation form
- Expected JSON body: `{ nam_sinh, luc_hoc, ho_ten, sdt, khoa_hoc }`
- Response codes: HTTP 200 (success), other codes treated as errors with user-facing error toast

**Outgoing:**
- None detected - This is a frontend-only application with no outbound webhook calls

## Form Integration

**Consultation Form (`src/components/landing/ConsultationForm.tsx`):**
- **Endpoint:** Google Apps Script
- **Method:** POST with `Content-Type: text/plain` header (workaround for CORS)
- **Fields:**
  - Student birth year (nam_sinh) - input field
  - Academic level (luc_hoc) - input field
  - Parent/Guardian name (ho_ten) - required input field
  - Phone number (sdt) - required, validated against Vietnamese phone format
  - Course selection (khoa_hoc) - dropdown with options: "Lớp 7", "Lớp 8", "Lớp 9", "Chuyên" (exam prep)
- **Validation:** Client-side Vietnamese phone number regex
- **Error Handling:** Toast notifications for invalid input or network failures
- **Success Flow:** Form reset on successful submission with success toast message

## Client-Side Libraries (Not External APIs)

**State Management:**
- React Router DOM v6 - Client-side routing (no external API)
- React Hook Form - Form state management (no external API)

**UI Components:**
- All Radix UI primitives and shadcn/ui components - Self-contained, no external API calls
- Embla Carousel - Carousel state management (no external API)
- Framer Motion - Animation library (no external API)

**Feature Flags:**
- Lovable tagger - Development-mode component tagging (no external API in production)

---

*Integration audit: 2026-03-23*
