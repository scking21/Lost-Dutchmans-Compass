# Lost Dutchman's Compass

An interactive taste-to-place web app using the **official @qloo/qloo-harness 0.1.26 CLI workflow runtime**. Enter a film, music artist, book or TV show and a public destination; clarify ambiguous matches; discover Qloo places; then shortlist, exclude or restore returned places locally.

Public source destination: https://github.com/scking21/Lost-Dutchmans-Compass

The official-harness Node app is deployed on Render Free at https://lost-dutchmans-compass.onrender.com. Deployed source4866c19 passed live describe, recommend and rank on2026-10-20. The local visitor-scope/capacity-UI changes in this source snapshot have passed offline tests and still require independent review and deployment verification. The earlier private Sites prototype is not this public official-harness demo.

## Official source integration

The official kit reference is [qloo/qloo-hackathon-kit revision80a82b26413142c6d60a71203d51836a2e708cf2](https://github.com/qloo/qloo-hackathon-kit/tree/80a82b26413142c6d60a71203d51836a2e708cf2), especially its CLI starter and safe-use guidance. We use its actual published npm harness rather than copying kit source. The package requires Node>=22.19.0; local verification used Node24.19.0.

The server starts the pinned official executable with fixed arguments equivalent to `qloo exec describe` and `qloo exec recommend`. Each input is one bounded JSON object on stdin. No shell string, arbitrary executable, model, MCP server, `setup`, `integrate`, `plan`, or `build` command is used.

The official package owns entity resolution, ambiguity handling, request construction, execution and its normalized `1.0-preview.1` result envelope. Compass renders the actual `ok`, `empty`, `needs_input`, `partial`, `degraded` and `error` states; it does not invent successful results for failed states.

1. `describe`: `{ "entity": "Arrival", "type": "movie" }`
2. If needed, the visitor selects a returned candidate. On resubmission, fresh official resolution checks that choice against the current candidates.
3. `recommend`: `{ "target_type": "place", "signals": ["resolved-Qloo-ID"], "filter_location": "Mesa", "explain": true, "limit": 3 }`
4. Local shortlist/exclude/restore leaves Qloo order and affinities intact and makes no additional calls. Change the favorite/category to request official rank over retained prior place IDs; changing destination requires fresh discovery.

Our adapter checks expected identities/types and fails closed on malformed output. Cards are direct Qloo place entities, not proxies for unverified monuments. Result position is provider order, not a newly calculated score. Affinity remains the raw finite provider number and is not a probability about an individual. The app's sentence summarizing the query is clearly distinguished from a Qloo causal explanation.

## Run locally

- `npm ci --ignore-scripts --no-audit --no-fund`
- `node --test tests/*.test.mjs` (direct offline test runner)
- `APP_ORIGIN=http://localhost:3000 npm start`

Without a server credential, the complete form and controlled-failure/Qloo-off paths work, while live mode honestly reports not configured. Never paste a key into the UI. Configure `QLOO_API_KEY` only through an approved host's secret manager or trusted server process environment. Do not commit real `.env` files. `QLOO_HOME` is isolated in a private temporary directory for each execution; it does not read a developer's existing Qloo state and is removed afterward.

`npm run harness:version` checks the installed executable. Implementation verified actual `--version` and `exec --help` without credentials or provider calls. The first safe smoke check incorrectly used the same HOME/QLOO_HOME path; the package rejected it. Correcting QLOO_HOME to a dedicated child directory made both checks pass.

## Security and bounded pilot operation

- Public API uses fixed same-origin POSTs, 4KiB request limit, restrictive browser CSP and server-side validation. Origin validation is CSRF protection, **not authentication**.
- No browser provider calls, credentials in HTML/JS, raw subprocess errors, request-body logs, shell expansion, ambient model credentials or user-provided executable arguments.
- The child receives only a minimal environment. Its key is in the process environment, never arguments or stdin. stderr/stdout are capped together at1MB; unexpected failures become fixed safe error codes.
- Disconnect/abort propagates from the HTTP response through both workflows to the child process. No second workflow starts after cancellation. Timeout, cancellation or output overflow sends SIGKILL and waits for child close before cleanup/accounting. If close is not confirmed within2seconds, private temporary state is preserved and further live submissions are disabled for that server process; this is reported as uncertain termination. Each official workflow has a22-second process deadline. At most two workflows per submission; at most two concurrent live submissions.
- The stock harness client can retry. This app adds an explicitly separate `--import` egress guard around the process's Fetch API: fixed `https://hackathon.api.qloo.com`, GET-only approved endpoint paths, manual redirects rejected, repeated URLs denied before dispatch, at most two actual dispatches for describe/recommend, or five for rank and a7-second dispatch timeout. The package is untouched; **the transport guard is app policy, not claimed stock harness behavior**. It supports this narrow single-seed describe/recommend/rank flow with at most three retained places. Legitimate expansion needs a reviewed budget change.
- An actual official-process offline test observed search+entity hydration for describe, and entity verification+Insights for recommend: four fixture dispatches total. No external network is used in that test.
- `MAX_LIVE_RUNS=3` is the default total pilot ceiling **per server process**, counting even rejected live submissions conservatively. At most12 dispatches can be initiated within one process lifetime. It is not a durable global quota: restarts reset it. Track the separately authorized first-live14-call budget manually across all deployments and diagnostics. Discovery reserves four dispatch credits and rank reserves seven before work starts. Four plus seven fits the unchanged twelve-credit process ceiling; another discovery then cannot run. Failed/cancelled runs remain fully reserved. Invalid input/candidate sets are rejected before reservation. The pilot stops on either the three-submission or twelve-credit ceiling. It is not ready for an unrestricted public judging demo at this cap. Increase this setting only after approved quota/billing review.
- Per-socket-address throttling permits four live submissions/minute; forwarding headers are not trusted. A hosting reverse proxy may share a socket address, conservatively sharing the bucket. No IP/account identity is sent to Qloo.

## Evidence and limits

The safe trace includes official harness version, operation, actual normalized status, correlation ID, retrieval time, output SHA-256 and dispatch count. It excludes raw provider bodies, keys and raw error buffers. Audit provenance links point to the official operation documentation; full request previews are intentionally not copied into browser output.

All access states are unknown until independently verified. The verified-access UI control is disabled and labeled unavailable. Supplying that requirement directly still excludes every unverified place. No historical claim, safe route, permit or opening-hours claim is generated. The frozen eight-place catalogue is now an explicit, optional local eligibility layer over provider results, described below. The original synthetic fixture lab remains clearly separate at `/fixture/`.

There is no model provider configured. Qloo-off makes zero workflow/provider calls and reports that the true same-model comparison is unavailable. This app is a deterministic interactive official-workflow integration, not an LLM agent and not a completed comparative-quality benchmark.

## Testing distinction

The direct Node test suite currently contains42 passing tests:
- Five run the **actual installed official CLI subprocess** against an injected, test-only in-memory provider fixture: complete describe→recommend, ambiguity, unresolved favorite, and describe→rank of three retained IDs (seven observed fixture dispatches). These verify real package workflow execution and schemas, **not live account compatibility**.
- Other tests cover subprocess termination/output bounds, fixed arguments/stdin, egress restrictions, normalized states, validation, budgets, secrets, access uncertainty and local refinement with mocks.

Tests never run `qloo setup`, use a real credential, or contact Qloo/model providers. The earlier4866c19 build has verified Docker deployment, public browser access and live official-harness workflows. These tests do not establish that the newer local-scope UI has been deployed or browser-verified.

## Deployment candidate

`Dockerfile` uses a Node24.19.0 runtime, lockfile install with scripts disabled, and a non-root user. `render.yaml` proposes a Render **Free** Docker web service, `autoDeployTrigger: off`, no database/disk, `/api/status` health check, and manual secret/origin configuration. The app has since been built and deployed on Render Free with automatic deployment disabled and server-only configuration. Source edits alone do not update that running deployment. Set APP_ORIGIN to the exact verified HTTPS service origin before interactive use; never guess the URL.

The UI and Docker assets contain only public app content. The private project-brief link was removed from the inherited fixture lab for this public-source candidate; it now links back to the app.

## License and attribution

Project source is MIT; see LICENSE. Qloo's published package is MIT, Copyright2026Qloo; its complete license and bundled notices are retained in THIRD_PARTY_NOTICES.md and evidence/. Exact package integrity/license hash are in evidence/package-provenance.json and package-lock.json. Do not remove third-party notices from runtime distributions. This does not assert that the separate kit repository has a license or that all event submission rules are already satisfied.

## Unpublished refinement candidate after e6cc6a9

Candidate sets are opaque UUID references stored server-side for fifteen minutes and bound to an HttpOnly, SameSite=Strict browser cookie (Secure on HTTPS). They retain the original destination and access policy but permit an explicitly changed cultural favorite/category. This is request continuity, not account authentication. They may be reused within expiry and the conservative process budget; they cannot authorize arbitrary provider IDs. Forged, duplicate, oversized or hidden selected IDs fail before dispatch. Browser input changes invalidate any selected seed identity.

Rank receives only option IDs, option_type and the new resolved signal. It does not recheck geography, opening hours, safety or access. Provider omissions remain unranked, not negative judgments. Prior/current ordinal positions are shown; numeric affinity scores across different queries are not compared. The bounded returned query-level explainability is shown separately from Compass's query summary, with an explicit absent state. The server does not manufacture per-place causal reasons.

Reservations are upper bounds. Audit networkDispatches counts completed subprocess reports; dispatchCountComplete=false means a failed or cancelled subprocess could have dispatched additional requests. The full reservation remains charged in that case. This is not an autonomous planning agent or live evidence of improved recommendations. See docs/tool-use.md for the planned human/agent-driven browser demonstration.

## Official compact entity type contract

Package0.1.26 resolution-provider.js reads provider `types[]`, while qloo-tools.js compactEntity omits that array. A types-only offline fixture reproduced `describe: ok` with two dispatches and our former `unresolved_seed` rejection. This is a proven compatibility defect; the first live failure's exact provider shape was not retained, so that exact failed response shape remains unproven. The subsequent deployed fix successfully completed live discovery and rank.

The adapter now accepts a missing scalar type for describe only with exactly one valid row and an interpretation.entity with the same UUID and expected type. Recommend's missing-type fallback requires the official operation's exact place target interpretation; rank additionally requires the same ID and place type in interpreted resolved options, plus retained-set membership. Explicit conflicting or malformed scalar types always fail. Fallback evidence is labeled separately, never represented as a provider-returned scalar field or verified access. Actual installed CLI tests exercise all three operations with types-only provider fixtures; adversarial identity, scope and contradiction tests remain fail-closed.

## Local visitor scope after the first live discovery/rank

The default browser-only heritage/outdoor filter is a factual eligibility join, separate from Qloo affinity. It makes zero calls, adds no catalogue-only suggestions, and preserves raw provider order/positions/scores. Users can uncheck it to inspect broad provider results with a visitor-suitability warning. It selects only a reviewed Qloo identity with exact catalogue name/recorded alias and full normalized street address. The historical provider mapping has been replaced with a synthetic-only regression identity; it is not a live Qloo identity or verified mapping. Matching normalizes punctuation/case and street suffixes, without fuzzy names, dropping locality, proximity substitution or coordinates.

The independently linked official Sun Communities operator identifies its Lost Dutchman property as residential. Synthetic fixtures check this exclusion without retaining a provider response. Catalogue closure conflicts remain fail-closed; access, opening hours and safe routes remain unverified.

Historical cleanup note: response-derived regression fixtures were removed. Replacement fixtures use independently sourced public catalogue/operator facts with invented identities, scores and ordering. They are synthetic contract checks, not retained Qloo output or new live verification. Original dated live-call accounting remains historical.

The browser reads remaining process credits/submissions, disables live discovery below four credits and rank below seven, refreshes after responses, and labels exhausted pilot capacity as paused/not judge-ready. No-call modes and local filters remain usable. This UI guard does not replace the server quota or replenish any allowance.

## Verified live baseline and current limits

On2026-10-20 deployed4866c19 resolved Raiders of the Lost Ark and returned three location-filtered places around Mesa in four observed dispatches. An explicit changed film preference to Arrival ranked the same three IDs in seven observed dispatches, changing their order. The initial14-dispatch verification allowance was consumed across earlier attempts and these successes (1+2+4+7). A separately bounded next verification allowance is managed outside these process-local counters; deployments do not authorize unlimited calls.

Historical discovery exposed visitor-domain mismatches. Response-derived result details have been removed from this snapshot; successful API execution alone did not establish heritage usefulness, safe access, autonomous reasoning or comparative quality.
