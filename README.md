# Lost Dutchman's Compass

An interactive taste-to-place web app using the **official @qloo/qloo-harness 0.1.26 CLI workflow runtime**. Enter a film, music artist, book or TV show and a public destination; clarify ambiguous matches; discover Qloo places; then shortlist, exclude or restore returned places locally.

Public source destination: https://github.com/scking21/Lost-Dutchmans-Compass

This candidate is prepared locally. **No external demo deployment or successful live Qloo result has been verified for this Node candidate.** Do not treat the earlier private Sites prototype as the public official-harness demo. The owner is handling public source publication and hosting approval separately.

## Official source integration

The official kit reference is [qloo/qloo-hackathon-kit revision80a82b26413142c6d60a71203d51836a2e708cf2](https://github.com/qloo/qloo-hackathon-kit/tree/80a82b26413142c6d60a71203d51836a2e708cf2), especially its CLI starter and safe-use guidance. We use its actual published npm harness rather than copying kit source. The package requires Node>=22.19.0; local verification used Node24.19.0.

The server starts the pinned official executable with fixed arguments equivalent to `qloo exec describe` and `qloo exec recommend`. Each input is one bounded JSON object on stdin. No shell string, arbitrary executable, model, MCP server, `setup`, `integrate`, `plan`, or `build` command is used.

The official package owns entity resolution, ambiguity handling, request construction, execution and its normalized `1.0-preview.1` result envelope. Compass renders the actual `ok`, `empty`, `needs_input`, `partial`, `degraded` and `error` states; it does not invent successful results for failed states.

1. `describe`: `{ "entity": "Arrival", "type": "movie" }`
2. If needed, the visitor selects a returned candidate. On resubmission, fresh official resolution checks that choice against the current candidates.
3. `recommend`: `{ "target_type": "place", "signals": ["resolved-Qloo-ID"], "filter_location": "Mesa", "explain": true, "limit": 3 }`
4. Local shortlist/exclude/restore leaves Qloo order and affinities intact and makes no additional calls. Changing the brief discards old choices and reruns the workflow.

Our adapter checks expected identities/types and fails closed on malformed output. Cards are direct Qloo place entities, not proxies for unverified monuments. Result position is provider order, not a newly calculated score. Affinity remains the raw finite provider number and is not a probability about an individual. The app's sentence summarizing the query is clearly distinguished from a Qloo causal explanation.

## Run locally

- `npm ci --ignore-scripts --no-audit --no-fund`
- `npm test`
- `APP_ORIGIN=http://localhost:3000 npm start`

Without a server credential, the complete form and controlled-failure/Qloo-off paths work, while live mode honestly reports not configured. Never paste a key into the UI. Configure `QLOO_API_KEY` only through an approved host's secret manager or trusted server process environment. Do not commit real `.env` files. `QLOO_HOME` is isolated in a private temporary directory for each execution; it does not read a developer's existing Qloo state and is removed afterward.

`npm run harness:version` checks the installed executable. Implementation verified actual `--version` and `exec --help` without credentials or provider calls. The first safe smoke check incorrectly used the same HOME/QLOO_HOME path; the package rejected it. Correcting QLOO_HOME to a dedicated child directory made both checks pass.

## Security and bounded pilot operation

- Public API uses fixed same-origin POSTs, 4KiB request limit, restrictive browser CSP and server-side validation. Origin validation is CSRF protection, **not authentication**.
- No browser provider calls, credentials in HTML/JS, raw subprocess errors, request-body logs, shell expansion, ambient model credentials or user-provided executable arguments.
- The child receives only a minimal environment. Its key is in the process environment, never arguments or stdin. stderr/stdout are capped together at1MB; unexpected failures become fixed safe error codes.
- Disconnect/abort propagates from the HTTP response through both workflows to the child process. No second workflow starts after cancellation. Timeout, cancellation or output overflow sends SIGKILL and waits for child close before cleanup/accounting. If close is not confirmed within2seconds, private temporary state is preserved and further live submissions are disabled for that server process; this is reported as uncertain termination. Each official workflow has a22-second process deadline. At most two workflows per submission; at most two concurrent live submissions.
- The stock harness client can retry. This app adds an explicitly separate `--import` egress guard around the process's Fetch API: fixed `https://hackathon.api.qloo.com`, GET-only approved endpoint paths, manual redirects rejected, repeated URLs denied before dispatch, at most two actual dispatches/workflow and a7-second dispatch timeout. The package is untouched; **the transport guard is app policy, not claimed stock harness behavior**. It only supports this narrow single-seed describe/recommend flow. Legitimate expansion needs a reviewed budget change.
- An actual official-process offline test observed search+entity hydration for describe, and entity verification+Insights for recommend: four fixture dispatches total. No external network is used in that test.
- `MAX_LIVE_RUNS=3` is the default total pilot ceiling **per server process**, counting even rejected live submissions conservatively. At most12 dispatches can be initiated within one process lifetime. It is not a durable global quota: restarts reset it. Track the separately authorized first-live14-call budget manually across all deployments and diagnostics. After three attempted live submissions, the pilot deliberately stops accepting live work. It is not ready for an unrestricted public judging demo at this cap. Increase this setting only after approved quota/billing review.
- Per-socket-address throttling permits four live submissions/minute; forwarding headers are not trusted. A hosting reverse proxy may share a socket address, conservatively sharing the bucket. No IP/account identity is sent to Qloo.

## Evidence and limits

The safe trace includes official harness version, operation, actual normalized status, correlation ID, retrieval time, output SHA-256 and dispatch count. It excludes raw provider bodies, keys and raw error buffers. Audit provenance links point to the official operation documentation; full request previews are intentionally not copied into browser output.

All access states are unknown until independently verified. Requiring verified access excludes every unverified place. No historical claim, safe route, permit or opening-hours claim is generated. The earlier eight-place research catalogue is not mixed into provider results. The original synthetic fixture lab remains clearly separate at `/fixture/`.

There is no model provider configured. Qloo-off makes zero workflow/provider calls and reports that the true same-model comparison is unavailable. This app is a deterministic interactive official-workflow integration, not an LLM agent and not a completed comparative-quality benchmark.

## Testing distinction

`npm test` currently contains23 passing tests:
- Three run the **actual installed official CLI subprocess** against an injected, test-only in-memory provider fixture: complete describe→recommend, ambiguity, and unresolved favorite. These verify real package workflow execution and schemas, **not live account compatibility**.
- Other tests cover subprocess termination/output bounds, fixed arguments/stdin, egress restrictions, normalized states, validation, budgets, secrets, access uncertainty and local refinement with mocks.

Tests never run `qloo setup`, use a real credential, or contact Qloo/model providers. Browser rendering, hosted external access, Docker build, live Qloo compatibility and deployment remain unverified in this candidate.

## Deployment candidate

`Dockerfile` uses a Node24.19.0 runtime, lockfile install with scripts disabled, and a non-root user. `render.yaml` proposes a Render **Free** Docker web service, `autoDeployTrigger: off`, no database/disk, `/api/status` health check, and manual secret/origin configuration. No service/account/credential has been created by this implementation. Source configuration is not proof that the selected Render workspace supports or has deployed it. Set APP_ORIGIN to the exact verified HTTPS service origin before interactive use; never guess the URL.

The UI and Docker assets contain only public app content. The private project-brief link was removed from the inherited fixture lab for this public-source candidate; it now links back to the app.

## License and attribution

Project source is MIT; see LICENSE. Qloo's published package is MIT, Copyright2026Qloo; its complete license and bundled notices are retained in THIRD_PARTY_NOTICES.md and evidence/. Exact package integrity/license hash are in evidence/package-provenance.json and package-lock.json. Do not remove third-party notices from runtime distributions. This does not assert that the separate kit repository has a license or that all event submission rules are already satisfied.
