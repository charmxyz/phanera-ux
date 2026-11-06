# Phanera
## MVP Product Requirements Document

**Version:** 1.1  
**Date:** November 2026  
**Status:** Development specification  
**Scope:** MVP only  
**Primary stack:** Next.js, shadcn/ui, Supabase, Resend, Claude API, Daytona

---

# 1. Product Overview

## 1.1 What is Phanera?

Phanera is an AI-powered platform that explores and evaluates websites using autonomous agents simulating different user personas.

A user provides a website URL. Phanera discovers the website's content, understands the product, generates relevant personas, and sends AI agents to explore the website independently.

These agents attempt realistic tasks, identify friction, and produce evidence-backed findings.

Phanera also checks whether website content and interfaces are accessible and understandable to AI agents.

## 1.2 Product Vision

**See your website through every perspective.**

Phanera helps website owners understand how their websites work for both people and autonomous AI systems.

## 1.3 MVP Goal

Build a functional SaaS in which a new user can:

1. Visit the landing page.
2. Enter a website URL.
3. Authenticate using an email magic link.
4. Arrive at the dashboard with the submitted URL preserved.
5. Start a website discovery scan.
6. Review the discovered website and suggested personas.
7. Launch an AI persona test.
8. Watch the test progress.
9. Review session evidence and actionable findings.
10. Revisit previous reports.

The MVP must execute real browser tests, not return fabricated AI-generated reports.

## 1.4 Non-Goals

The MVP will not include:

- CLI
- MCP server
- CI/CD integration
- Scheduled testing
- Authenticated target website testing
- Localhost testing
- Native mobile application testing
- Team collaboration
- Enterprise features
- Issue tracker integrations
- Custom AI model selection
- Dedicated error monitoring
- Dedicated product analytics
- Advanced billing and subscription management

These features can be added after the core testing workflow is validated.

---

# 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Application | Next.js App Router | Frontend and API |
| Language | TypeScript | Full application |
| Styling | Tailwind CSS | Styling system |
| UI | shadcn/ui | Components |
| Icons | Lucide | Interface icons |
| Animation | Motion | UI transitions |
| Hero visual | Canvas or WebGL | Animated murmuration |
| Database | Supabase PostgreSQL | Application data |
| Authentication | Supabase Auth | Magic-link sessions |
| Email delivery | Resend | Authentication emails |
| File storage | Supabase Storage | Screenshots and evidence |
| AI | Anthropic Claude API | All AI reasoning |
| Browser | Playwright | Browser automation |
| Agent interaction | Stagehand with Claude | AI-guided navigation |
| Sandbox | Daytona | Isolated execution |
| Jobs | Trigger.dev | Background scan orchestration |
| Deployment | Vercel | Web hosting |

### Technical Rules

- Use TypeScript throughout.
- Use the App Router.
- Prefer Server Components where appropriate.
- Use shadcn/ui components instead of building custom versions of standard controls.
- Keep all AI calls on the server.
- Never expose the Anthropic or Resend API keys to the browser.
- Use structured AI outputs validated with Zod.
- Use Supabase Row Level Security.
- Use isolated browser sandboxes for third-party websites.
- Ensure long-running tests are not dependent on frontend request lifetimes.

---

# 3. Brand and Design System

## 3.1 Brand Concept

Phanera represents the idea of making something visible.

The visual identity is inspired by **murmuration**, a natural phenomenon where large groups of birds move in coordinated patterns.

Each particle represents an individual agent exploring a website.

As agents work, the particles move independently before forming larger patterns that represent shared understanding.

The experience should feel:

- Minimal
- Intelligent
- Technical
- Calm
- Premium
- Slightly experimental
- Interactive without being distracting

## 3.2 Overall Visual Direction

Use a dark interface inspired by modern developer tools and AI SaaS products.

The design should feel native to shadcn/ui, with restrained colour, clean typography, subtle borders, and generous spacing.

Avoid oversized gradients, excessive glow, glassmorphism, and colourful cards.

## 3.3 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#0B0B10` | Main application background |
| Surface | `#18181B` | Cards and panels |
| Elevated | `#222228` | Dialogs and dropdowns |
| Border | `#303038` | Subtle dividers |
| Primary | `#6366F1` | Buttons and active actions |
| Foreground | `#FAFAFA` | Main text |
| Muted foreground | `#A1A1AA` | Supporting text |
| Success | `#22C55E` | Successful test results |
| Warning | `#F59E0B` | Warnings |
| Destructive | `#EF4444` | Failed states |

### Colour Rules

Primary indigo must primarily appear on:

- Primary CTA buttons
- Selected interactive states
- Keyboard focus indicators
- Active progress indicators
- Relevant action icons

Do not apply indigo to all cards, section backgrounds, or large decorative surfaces.

The hero murmuration should primarily use neutral white, grey, and muted particles.

## 3.4 Typography

Use **Geist Sans** for the interface.

Use **Geist Mono** for:

- URLs
- Session identifiers
- Timestamps
- Technical metadata
- Browser action logs

Typography guidelines:

- Large, confident hero heading
- Clear section titles
- Compact interface labels
- Muted supporting text
- Comfortable spacing
- No excessive uppercase text

## 3.5 Layout

Use:

- Maximum marketing content width around 1200px
- Maximum reading width around 720px
- Responsive 12-column grid
- 8px spacing system
- Moderate border radii
- Thin, low-contrast borders
- Minimal shadows
- Generous whitespace

## 3.6 shadcn/ui Components

Use existing shadcn components for:

- Button
- Input
- Card
- Dialog
- Sheet
- Tabs
- Badge
- Table
- Skeleton
- Progress
- Tooltip
- Dropdown Menu
- Alert
- Separator
- Sidebar
- Toast notifications
- Form controls

Custom components should be reserved for experiences unique to Phanera.

---

# 4. Murmuration Visual System

## 4.1 Hero Animation

The homepage hero contains an animated flock of particles, inspired by a murmuration of starlings.

The particles should create a fluid, organic shape, moving collectively while maintaining individual movement.

### Behaviour

1. On initial load, particles are distributed across the hero area.
2. Particles gradually form flowing organic patterns.
3. The collective shape continuously changes.
4. Cursor movement subtly influences nearby particles.
5. Particles return to natural motion after interaction.
6. The animation loops seamlessly.

### Visual Constraints

- Dark background
- Mostly white and muted grey particles
- No large coloured gradients
- No bright particle trails
- No photographic bird assets required
- No obvious repeating animation loop
- No unnecessary motion behind input text

### Technical Requirements

Prefer a performant Canvas or WebGL implementation.

Use requestAnimationFrame only while the animation is active.

Optimise particle count for device capability.

Pause when the page is not visible.

Provide a static visual fallback when reduced motion is enabled.

The animation must not block or delay interaction with the URL field.

## 4.2 Murmuration Throughout the Website

The murmuration concept should extend beyond the homepage without repeating the same animation everywhere.

Examples:

**Homepage Hero**

A large flock introduces the concept.

**How It Works**

Small groups of particles separate to represent independent personas.

**Persona Testing**

Each persona has an individual particle cluster.

**Running Test**

Small animated clusters represent agents currently exploring.

**Completed Report**

Clusters converge into a unified pattern representing the final insights.

**Empty States**

Small, static particle illustrations provide continuity.

Avoid full-screen animations inside the dashboard.

---

# 5. Information Architecture

## 5.1 Public Routes

| Route | Page |
|---|---|
| `/` | Landing page |
| `/pricing` | Pricing |
| `/login` | Magic-link login |
| `/auth/callback` | Authentication callback |

For the MVP, Product, How It Works, and FAQ can be sections on the landing page instead of separate pages.

## 5.2 Protected Routes

| Route | Page |
|---|---|
| `/dashboard` | Dashboard |
| `/dashboard/new` | Create test |
| `/dashboard/websites/[id]` | Website overview |
| `/dashboard/tests/[id]` | Test detail |
| `/dashboard/tests/[id]/sessions/[id]` | Agent session |
| `/dashboard/settings` | Account settings |

All dashboard routes require a valid session.

---

# 6. Landing Page Requirements

## 6.1 Reference

Use https://www.useswarm.co/ as a reference for:

- Content hierarchy
- Product storytelling
- Demonstration-led sections
- Persona examples
- Results presentation
- Pricing structure
- Clear calls to action

Do not duplicate Swarm's branding, artwork, written copy, or individual interface designs.

Phanera must have its own messaging, visual language, and component composition.

## 6.2 Homepage Navigation

**Left:**
- Phanera logo

**Right:**
- Product
- How It Works
- Pricing
- Log in
- Get Started

Navigation items scroll to relevant sections where appropriate.

The navigation should remain simple and responsive.

## 6.3 Section 1: Hero

### Headline

**See your website through every perspective.**

### Description

Send autonomous AI personas to explore your website, discover friction, and reveal what humans and AI agents might miss.

### Primary Input

Placeholder:

`https://yourwebsite.com`

### Button

**Explore my website**

### Interaction

- User enters a URL.
- Client validates the basic URL format.
- If the URL has no scheme, automatically normalise it to HTTPS.
- User clicks Explore.
- If authenticated, navigate to `/dashboard/new` with the URL prefilled.
- If unauthenticated, open the login dialog with the submitted URL preserved.

The homepage must not start a paid or computationally expensive test before authentication.

### Visual

Animated murmuration positioned above or behind the headline, without reducing text legibility.

## 6.4 Section 2: How Phanera Works

### Heading

**One website. Many perspectives.**

### Description

Phanera explores your website through different personas, then brings their experiences together into one clear report.

Display three steps.

**Step 1: Discover your website**

Phanera maps your pages, understands your product, and identifies what visitors are likely trying to accomplish.

Visual: Website pages being discovered and organised.

**Step 2: Release the flock**

AI personas independently navigate your website, attempt tasks, and record what happens.

Visual: Three or more persona cards with individual progress states.

**Step 3: Reveal the findings**

See where agents succeeded, what blocked them, and which issues deserve attention.

Visual: A report with ranked findings and linked evidence.

## 6.5 Section 3: AI Personas

### Heading

**Different visitors. Different experiences.**

### Description

Not everyone explores a website the same way. Phanera generates personas with different goals, behaviours, and levels of familiarity.

Show example persona cards:

**Alex, First-time visitor**

Goal: Understand what the product does.

Behaviour: Skims content and expects simple explanations.

**Sam, Potential customer**

Goal: Compare plans and find pricing.

Behaviour: Detail-oriented and price-conscious.

**Taylor, Technical evaluator**

Goal: Identify integrations and technical requirements.

Behaviour: Searches for documentation and precise information.

**Morgan, AI assistant**

Goal: Extract reliable product information.

Behaviour: Prioritises structured, accessible and consistent content.

The persona cards are examples and must not imply real users participated in testing.

## 6.6 Section 4: Session Evidence

### Heading

**See where they get stuck.**

### Description

Follow each persona's journey through your website, including the pages they visited, actions they took, and problems they encountered.

Display an illustrative session interface containing:

- Browser preview
- Persona name
- Task
- Progress
- Screenshot
- Action timeline
- Final outcome

The demo should be clearly identified as illustrative until real test recordings are available.

## 6.7 Section 5: Findings

### Heading

**Findings you can actually fix.**

### Description

Turn agent sessions into clear, prioritised recommendations backed by evidence.

Show an example findings panel:

**High**
Pricing page is difficult to discover.

**Medium**
Product features use inconsistent terminology.

**Low**
Primary action is less prominent on mobile.

Each finding preview should include:

- Severity
- Short description
- Impacted personas
- Suggested improvement

## 6.8 Section 6: AI Agent Readiness

### Heading

**Built for people. Ready for agents.**

### Description

Your website is increasingly explored by autonomous AI systems. Phanera checks whether agents can discover your pages, interpret your content, and navigate important interactions.

Highlight:

- Content discovery
- Semantic HTML
- Navigation accessibility
- Product comprehension
- Agent interaction

This is Phanera's core differentiator.

## 6.9 Section 7: Pricing

Display three tiers.

### Free

**£0/month**

- 5 lifetime test runs
- Up to 3 personas per run
- 10 pages per website scan
- Basic findings
- Shareable report

CTA: Start for free

### Startup

**£99/month**

- 40 snapshot audits per month
- 10 live browser tests per month
- Up to 10 personas per live run
- 50 pages per audit
- Full session evidence
- Detailed findings
- PDF reports

CTA: Get started

### Enterprise

**Custom**

- Higher usage limits
- Custom deployment requirements
- Advanced integrations
- Team features

CTA: Contact us

For MVP, Startup and Enterprise may be displayed as coming soon if billing and enterprise workflows are not implemented.

Do not accept paid subscriptions until the corresponding entitlements and billing flows work.

## 6.10 Section 8: FAQ

Questions:

1. What is Phanera?
2. How does Phanera test my website?
3. Are the personas real people?
4. Does Phanera test whether AI can understand my website?
5. Can I test any website?
6. How long does a test take?
7. How much does Phanera cost?

## 6.11 Final CTA

### Headline

**What would agents discover on your website?**

### Description

Enter your URL and see your website through a different perspective.

Repeat the URL input and Explore button.

## 6.12 Footer

- Logo
- Product
- Pricing
- Login
- Privacy
- Terms
- Copyright

---

# 7. Authentication

## 7.1 Authentication Method

Use passwordless email authentication.

**Supabase Auth** manages user identities, magic-link verification, and sessions.

**Resend** is used as the email delivery provider through Supabase's custom SMTP configuration.

Do not create an independent custom authentication token system.

## 7.2 Authentication Flow

### Scenario A: Visitor Submits URL

1. Visitor opens `/`.
2. Visitor enters a website URL.
3. Visitor clicks Explore my website.
4. Application normalises and validates the URL.
5. Application determines the visitor is not authenticated.
6. Login dialog opens.
7. The submitted URL is preserved.
8. Visitor enters their email.
9. Visitor clicks Send magic link.
10. Supabase initiates passwordless authentication.
11. Resend delivers the email.
12. User opens the magic link.
13. Authentication callback verifies the session.
14. Application creates the user profile if necessary.
15. Session cookies are established.
16. User is redirected to `/dashboard/new`.
17. Previously submitted website URL is prefilled.

### Scenario B: Existing User

1. User opens the homepage.
2. User enters a URL.
3. User clicks Explore.
4. Existing Supabase session is detected.
5. User goes directly to `/dashboard/new`.
6. URL remains prefilled.

### Scenario C: Login Without URL

1. User clicks Log in.
2. Login page or dialog opens.
3. User enters email.
4. Magic link is sent.
5. User verifies authentication.
6. User is redirected to `/dashboard`.

## 7.3 Login UI

Use a shadcn Dialog when authentication starts from the homepage.

### Title

**Continue with email**

### Description

Enter your email and we'll send you a secure sign-in link.

### Fields

Email address

### Primary Button

**Send magic link**

### Secondary Information

No password needed.

## 7.4 Email Sent State

After successful submission:

### Title

**Check your inbox**

### Description

We sent a sign-in link to your email. Open it to continue to Phanera.

Include:

- Masked or submitted email
- Resend link action
- Change email action

Apply a cooldown before allowing the user to request another link.

## 7.5 Magic-Link Requirements

- Links must be single-use.
- Links must expire.
- Authentication must occur server-side.
- The callback must validate the authentication token.
- Redirects must only target allowed application routes.
- Authentication requests must be rate limited.
- UI responses must not reveal whether an email already has an account.
- Cookies must use secure settings in production.

## 7.6 Cookie Persistence

Use Supabase's supported SSR authentication approach.

Requirements:

- Persist sessions using secure cookies.
- Enable `HttpOnly` where compatible with the selected session strategy.
- Use `Secure` in production.
- Use appropriate `SameSite` settings.
- Refresh sessions through the supported Supabase server-side flow.
- Validate user sessions when accessing protected routes.
- Never store raw authentication tokens in application database tables.
- Never rely on localStorage as the sole authentication mechanism.
- Logout must invalidate the session and clear relevant browser cookies.

An authenticated user should remain signed in across browser refreshes and subsequent visits until the session expires or is revoked.

## 7.7 Preserving the Submitted URL

The website URL must survive the email authentication process, including when the user opens the magic link in another browser tab.

Recommended approach:

1. Create a short-lived pending-intent record or signed server-side state reference.
2. Store the normalised website URL against that reference.
3. Include a safe opaque state identifier in the authentication redirect.
4. After authentication, validate and resolve the pending intent.
5. Redirect to the new test page with the URL restored.
6. Expire or consume the pending state appropriately.

Do not rely exclusively on client component state or localStorage.

## 7.8 User Profile

Create a profile after first successful authentication.

Fields:

- User ID
- Email
- Created at
- Updated at
- Plan
- Remaining trial usage

No password field is required.

---

# 8. Dashboard

## 8.1 Dashboard Layout

Use the shadcn Sidebar pattern.

### Sidebar

- Phanera logo
- Dashboard
- New Test
- Websites
- Test History
- Settings

### Bottom

- User email
- Plan label
- Remaining usage
- Sign out

## 8.2 Dashboard Home

### Header

**Your dashboard**

Supporting text:

Explore your websites, manage tests, and review findings.

### Main CTA

**New test**

### Main Content

- Website cards
- Recent tests
- Total completed tests
- Remaining trial usage
- Recent findings

## 8.3 New User Empty State

If the user signed in without submitting a website:

**Start with your website.**

Enter a URL to discover how AI personas experience your product.

Input: Website URL

CTA: Explore website

## 8.4 Returning User

Show previously added websites and recent reports.

Each website card displays:

- Domain
- Favicon, if available
- Last scan date
- Number of tests
- Latest test status

Selecting a website opens its overview.

---

# 9. Website Discovery

## 9.1 Trigger

Website discovery starts after the user confirms a URL in the dashboard.

The submitted homepage URL must not automatically consume a live persona test allowance before confirmation.

## 9.2 Discovery Process

1. Validate URL.
2. Check basic website reachability.
3. Read permitted sitemap information.
4. Discover internal pages.
5. Extract HTML content.
6. Render JavaScript when necessary.
7. Extract structured text and navigation.
8. Classify website pages.
9. Generate a website summary using Claude.
10. Identify likely user audiences.
11. Suggest meaningful test goals.

## 9.3 Discovery Limits

Free:
- Maximum 10 pages

Startup:
- Maximum 50 pages

Respect per-run page and time budgets.

If a site exceeds the limit, prioritise the homepage, primary navigation and high-value pages.

## 9.4 Website Summary

The discovery report contains:

- Website name
- Website type
- Product description
- Main audience
- Primary value proposition
- Main navigation
- Important pages
- Suggested user goals
- Content gaps
- Accessibility observations

The user can review this summary before starting a persona test.

## 9.5 Discovery Status

- Queued
- Fetching website
- Discovering pages
- Extracting content
- Analysing website
- Complete
- Partial
- Failed

Show progress in the dashboard.

---

# 10. Persona Generation

## 10.1 AI Provider

Use Anthropic Claude API for all AI-powered functions.

This includes:

- Website summarisation
- Page classification
- Persona generation
- Task suggestions
- Agent reasoning
- Session evaluation
- Findings generation
- Recommendations

Model selection should be configured through environment variables, not hardcoded throughout the codebase.

Use structured responses validated through Zod.

## 10.2 Automatic Persona Generation

After website discovery, Claude generates suggested personas.

Each persona must include:

- Name
- Role
- Context
- Goal
- Device
- Behaviour
- Patience
- Success criteria

Personas should be relevant to the detected website type.

## 10.3 Default Personas

For the MVP, suggest three personas by default.

Examples:

**First-time visitor**

Goal: Understand what the website offers.

**Potential customer**

Goal: Discover key features and pricing.

**AI assistant**

Goal: Find accurate product information and important pages.

The AI assistant persona should have its own access and navigation objective rather than pretending to represent a human visitor.

## 10.4 Persona Editing

Before starting a test, users may:

- Select suggested personas
- Remove personas
- Edit their goals
- Adjust persona descriptions
- Add a custom persona
- Regenerate suggestions

Enforce plan limits before running a test.

---

# 11. Test Creation

## 11.1 New Test Page

The creation flow contains:

### Step 1: Website

Display the selected URL and website summary.

### Step 2: Test Goal

Show suggested goals generated by Claude.

Examples:

- Can a new visitor understand this product?
- Can a potential customer find pricing?
- Can users discover the main features?
- Can an AI agent extract accurate product information?

Provide a custom text field:

**What would you like to test?**

### Step 3: Personas

Display suggested persona cards.

Allow users to select and edit them.

### Step 4: Review

Show:

- Website
- Goal
- Number of personas
- Maximum allowed pages
- Estimated usage allowance
- Safety restrictions

### Primary Button

**Start test**

## 11.2 Validation

Before starting:

- User must be authenticated.
- URL must be valid.
- Website must be publicly reachable.
- At least one persona must be selected.
- Usage must be available.
- Goal must be defined.
- Domain must pass network safety checks.

---

# 12. Browser Agent Execution

## 12.1 Execution Architecture

Use Daytona to run isolated browser environments.

Each persona operates in its own browser context or sandbox with independent navigation state.

Use Playwright for deterministic browser actions and Stagehand for Claude-guided interaction.

## 12.2 Agent Inputs

Each agent receives:

- Starting URL
- Persona description
- Test goal
- Device configuration
- Allowed domain
- Maximum actions
- Maximum duration
- Safety rules

Agents must not receive the full discovered site map as navigation instructions.

## 12.3 Agent Capabilities

Agents can:

- Navigate pages
- Click links
- Open menus
- Scroll
- Read visible content
- Fill non-sensitive fields
- Select options
- Go backward
- Follow internal navigation
- Report task completion
- Stop when blocked

## 12.4 Agent Limits

Suggested initial configuration:

| Limit | Free | Startup |
|---|---|---|
| Personas per test | 3 | 10 |
| Maximum actions per persona | 8 | 20 |
| Maximum duration per persona | 3 min | 8 min |
| Screenshots | Key steps | All meaningful steps |

The system must also enforce token and compute budgets.

## 12.5 Test Progress UI

Once started, redirect to:

`/dashboard/tests/[id]`

Show:

- Test title
- Website URL
- Overall status
- Number of completed personas
- Individual persona states
- Current activity
- Progress indicator

Example:

**3 of 5 personas completed**

- Alex: Completed
- Sam: Running
- Taylor: Completed
- Morgan: Running
- Jordan: Queued

Avoid presenting fabricated progress. Statuses should reflect actual worker execution.

## 12.6 Session Evidence

Record:

- Timestamp
- Current URL
- Action type
- Target element
- Action result
- Screenshot
- Browser error
- Final outcome

Store structured logs in Supabase and image files in Supabase Storage.

## 12.7 Browser Safety

- Block internal and private network destinations.
- Validate URLs and redirects.
- Restrict browsing to allowed domains.
- Do not allow real purchases.
- Do not submit destructive forms.
- Do not bypass CAPTCHAs.
- Do not collect sensitive information unnecessarily.
- Limit concurrency.
- Automatically terminate sandboxes.
- Treat all website content as untrusted input.

---

# 13. Evaluation and Findings

## 13.1 Independent Evaluation

Use Claude to evaluate the session results separately from the browser agent.

Evaluation inputs:

- Goal
- Persona
- Recorded actions
- Browser outcomes
- Screenshots or relevant visual evidence
- Website facts
- Final agent state

The evaluator must determine whether the task was actually completed.

## 13.2 Task Outcomes

- Success
- Partial success
- Failed
- Abandoned
- Blocked
- Inconclusive

Do not automatically mark agent mistakes or timeouts as website defects.

## 13.3 Finding Structure

Each finding contains:

- ID
- Title
- Description
- Category
- Severity
- Confidence
- Impacted personas
- Evidence
- Recommended fix

## 13.4 Severity

**Critical:** Essential task blocked by a confirmed problem.

**High:** Significant usability or functional issue.

**Medium:** Meaningful friction with possible workaround.

**Low:** Minor issue or improvement opportunity.

## 13.5 Finding Confidence

- Confirmed
- Likely
- Hypothesis

Only direct evidence can support a confirmed finding.

## 13.6 Report Summary

Show:

- Number of personas
- Number of successful tasks
- Number of partial outcomes
- Number of failures
- Findings grouped by severity
- AI agent readiness summary
- Top recommended fixes

Avoid presenting an arbitrary numerical score as more reliable than the underlying evidence.

---

# 14. Results UI

## 14.1 Test Overview

The results page uses shadcn Cards and Tabs.

Tabs:

- Overview
- Personas
- Sessions
- Findings
- Agent Readiness

## 14.2 Overview Tab

Display:

- Test status
- Goal
- Task completion count
- Number of findings
- Most important issues
- Short conclusion

## 14.3 Personas Tab

Display persona cards with:

- Name
- Role
- Goal
- Device
- Outcome
- Duration
- Actions taken

Selecting a persona opens its session.

## 14.4 Sessions Tab

Display:

- Screenshot viewer
- Timeline
- Page URLs
- Action history
- Observed errors
- Final result

For MVP, a step-by-step screenshot replay is sufficient. Continuous video recording is not necessary.

## 14.5 Findings Tab

Use a list sorted by severity.

Selecting a finding reveals:

- Detailed explanation
- Impacted personas
- Relevant page
- Screenshot
- Evidence timeline
- Suggested fix

## 14.6 Agent Readiness Tab

Show:

- Content accessibility
- Page discovery
- Semantic navigation
- Content comprehension
- Rendering issues
- Missing structured information

Clearly distinguish measured results from interpretation.

---

# 15. Data Model

## 15.1 Profiles

- id
- email
- plan
- created_at
- updated_at

## 15.2 Websites

- id
- user_id
- url
- domain
- title
- description
- created_at

## 15.3 Website Pages

- id
- website_id
- url
- title
- page_type
- content_summary
- crawl_status

## 15.4 Tests

- id
- user_id
- website_id
- title
- goal
- status
- configuration
- created_at
- completed_at

## 15.5 Personas

- id
- test_id
- name
- role
- goal
- configuration

## 15.6 Sessions

- id
- test_id
- persona_id
- status
- outcome
- duration
- action_count

## 15.7 Session Events

- id
- session_id
- timestamp
- action
- url
- result
- screenshot_path

## 15.8 Findings

- id
- test_id
- title
- description
- severity
- confidence
- recommendation
- evidence

## 15.9 Usage

- id
- user_id
- test_id
- usage_type
- quantity
- created_at

## 15.10 Pending Authentication Intents

- id
- normalized_url
- state_token_hash
- expires_at
- consumed_at

Only retain pending intents for the minimum necessary time.

---

# 16. Environment Variables

```env
NEXT_PUBLIC_APP_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=

RESEND_API_KEY=

DAYTONA_API_KEY=
DAYTONA_API_URL=

TRIGGER_SECRET_KEY=
```

Resend credentials used for Supabase Auth should be configured in the Supabase SMTP settings. A separate application-level `RESEND_API_KEY` is only required if the application itself sends emails through Resend's API.

Never expose server-side keys through public environment variables.

---

# 17. Development Requirements

## 17.1 Local Development

The application must work locally before deployment.

The developer should be able to:

1. Run the Next.js application.
2. Connect to a Supabase development environment.
3. Test magic-link authentication.
4. Submit a public URL.
5. Start discovery.
6. Execute a browser session through Daytona.
7. Generate a Claude-based evaluation.
8. View the report locally.

## 17.2 Code Organisation

Suggested structure:

```text
src/
  app/
    page.tsx
    pricing/
    login/
    auth/
      callback/
    dashboard/
      page.tsx
      new/
      websites/
      tests/
      settings/
    api/
      websites/
      tests/
      personas/

  components/
    ui/
    landing/
    dashboard/
    personas/
    sessions/
    findings/
    murmuration/

  lib/
    supabase/
    auth/
    claude/
    daytona/
    discovery/
    agents/
    evaluation/
    usage/
    validation/

  types/
  hooks/

supabase/
  migrations/

workers/
  discovery/
  browser/
  evaluation/
```

## 17.3 Application Architecture

Separate:

- UI components
- API handlers
- Authentication
- Database queries
- AI prompts
- Browser execution
- Evaluation
- Background orchestration

Avoid putting the full test pipeline inside one API route.

## 17.4 AI Prompt Management

Keep AI prompts in dedicated modules.

At minimum:

- Website summary prompt
- Persona generation prompt
- Goal generation prompt
- Browser agent instructions
- Evaluation prompt
- Findings prompt

Use structured output schemas and validate returned data.

Do not rely on parsing loosely formatted Markdown from Claude.

---

# 18. MVP User Flow Acceptance Tests

## Test A: Homepage to Authentication

**Given** an unauthenticated user visits the homepage,

**When** they enter `example.com` and click Explore,

**Then** the application normalises the URL, opens the email authentication dialog, and preserves the submitted website.

## Test B: Magic Link

**Given** a valid email was submitted,

**When** the user opens the received magic link,

**Then** the application verifies authentication, creates a session, and redirects to the dashboard with the original website URL available.

## Test C: Persistent Session

**Given** an authenticated user,

**When** they refresh the dashboard or return in a new browser session while their authentication remains valid,

**Then** they remain signed in without another email link.

## Test D: Discovery

**Given** a supported public website,

**When** the user starts discovery,

**Then** Phanera returns a page inventory, website summary, and suggested test goals.

## Test E: Personas

**Given** a completed discovery,

**When** the user generates personas,

**Then** Phanera produces distinct, relevant personas with defined goals.

## Test F: Browser Test

**Given** a valid test configuration,

**When** the user starts a test,

**Then** browser agents execute within isolated environments and save their actual actions.

## Test G: Findings

**Given** completed sessions,

**When** evaluation finishes,

**Then** the user receives a structured report with outcomes, evidence and recommendations.

## Test H: Usage Limits

**Given** a user has exhausted their allowance,

**When** they attempt another test,

**Then** the application prevents execution and explains the applicable plan limit.

## Test I: Failed Execution

**Given** a browser worker fails,

**When** the failure is detected,

**Then** the interface shows a meaningful failure state, preserves available evidence and handles usage consistently.

## Test J: Session Security

**Given** a private report belongs to another user,

**When** an unauthorised user requests it,

**Then** the application denies access.

---

# 19. Build Order

## Milestone 1: Design Foundation

- Next.js project
- Tailwind CSS
- shadcn/ui installation
- Dark design tokens
- Geist typography
- App layouts
- Responsive homepage
- Murmuration animation

**Complete when:** The public website and dashboard shell are responsive and visually consistent.

## Milestone 2: Authentication

- Supabase Auth
- Resend SMTP
- Login dialog
- Magic-link callback
- Secure session persistence
- Protected routes
- URL intent preservation

**Complete when:** A user can enter a URL, authenticate, and arrive at the dashboard with the URL prefilled.

## Milestone 3: Website Discovery

- URL validation
- Safe crawling
- Page extraction
- Website classification
- Claude summarisation
- Database persistence
- Discovery progress UI

**Complete when:** A website can be scanned and summarised with actual content.

## Milestone 4: Personas and Tests

- Suggested test goals
- Persona generation
- Persona selection
- Test configuration
- Test database records
- Usage limits

**Complete when:** Users can configure a meaningful test from discovered website data.

## Milestone 5: Agent Execution

- Daytona integration
- Playwright
- Stagehand
- Claude agent reasoning
- Session isolation
- Action capture
- Screenshots
- Background execution
- Job status updates

**Complete when:** Multiple personas independently explore a website and produce recorded sessions.

## Milestone 6: Evaluation and Reports

- Claude evaluator
- Task outcomes
- Findings
- Severity classification
- Evidence links
- Results dashboard
- Session timeline
- Agent readiness results

**Complete when:** Users can inspect a complete, evidence-backed test report.

## Milestone 7: MVP Release

- Authentication verification
- Security checks
- Usage and cost controls
- Failed-job handling
- Responsive testing
- Deployment to Vercel
- Production Supabase configuration
- Resend sender-domain verification

**Complete when:** New users can complete the entire workflow without developer intervention.

---

# 20. Definition of Done

The MVP is complete when:

- The homepage explains Phanera and accepts a website URL.
- The landing page uses the dark shadcn visual system and murmuration branding.
- Authentication works through Supabase Auth and Resend magic links.
- Login sessions persist correctly through cookies.
- The original website URL survives authentication.
- Users can manage their websites and tests in a dashboard.
- Phanera discovers and understands real website content.
- Claude generates relevant personas and test goals.
- Daytona executes isolated browser tests.
- Sessions record actual interactions and screenshots.
- Claude evaluates real session evidence.
- Reports contain useful, traceable findings.
- The website's AI agent accessibility is assessed.
- Users can revisit previous reports.
- Usage limits and basic security protections are enforced.
- The entire workflow works locally and after deployment.

**The MVP should prioritise an end-to-end functional experience over integrations, enterprise capabilities, and advanced reporting features.**