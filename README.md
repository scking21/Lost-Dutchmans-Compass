# Lost Dutchman’s Compass

A taste-to-place prototype for first-time Mesa-area visitors, using the official `@qloo/qloo-harness@0.1.26` CLI on the server. A cultural favorite is a discovery signal, not evidence of a person’s identity or future enjoyment.

## Current revision and evidence

The verified runtime revision is [`eedf07b161990c0df5059c988c52b6e101cfa86e`](https://github.com/scking21/Lost-Dutchmans-Compass/commit/eedf07b161990c0df5059c988c52b6e101cfa86e), tree `ef8546780d09134fdb5a73550fe2ae8f1ab5441f`, deployed on October 21, 2026. Its pre-publication offline suite passed 87 tests, including seven actual subprocess tests of the installed pinned CLI with synthetic, in-memory provider fixtures. The dated `evidence/confirmation-verification.json` records the state before live verification and is retained unchanged.

At 04:34–04:36 UTC on October 21, the deployed revision completed the bounded local-resolution → explicit identity-confirmation → two-place rank path. Desktop returned-card rendering and local shortlist, hide and restore controls were checked; those local controls made no additional provider calls. This establishes the feasibility of that one bounded run, not reliability across users or visitor usefulness. Private live receipts are not public fixtures. One synthetic development comparison found no demonstrated incremental benefit; it is not a same-model ablation or a real-visitor study.

At 04:39 UTC, a fresh browser session could open the public demo but had zero remaining pilot capacity and disabled live actions. The current deployment therefore does not provide end-to-end judging access. No reset, allowance increase or further provider run is implied by these documentation updates. Mobile, cold-start recovery and independent multi-session live operation remain unverified.

Earlier source `64fd67a250c5ba882d2222caca2cc7b99d6174ad` supplies historical desktop describe→recommend evidence. The technically verified 106.6-second narrated screenshot walkthrough depicts that older discovery flow, not the new local-confirmation flow. Two later local-resolution pilots stopped unresolved before ranking; the older app did not retain enough issue detail to classify those failures. The successful newer run does not retroactively explain them. Public regression fixtures at the verified revision are synthetic; old public commits still retain response-derived material and that compliance concern remains unresolved.

## Two product paths

### Reviewed local shortlist

1. Enter Mesa and a film, artist, book or TV favorite.
2. Explicitly click **Resolve two local places · up to 4 calls**. The server resolves exactly Arizona Museum of Natural History and Usery Mountain Regional Park through official `describe` with type `place`.
3. Each result must bind a valid provider identity to the exact independently sourced catalogue name/recorded alias, full normalized address and place type evidence. No-match, contradictory types, duplicate IDs and mismatched addresses stop without retry or ranking. Official needs_input is classified as ambiguous or not_found when its bound issue permits that distinction; unknown states remain unknown.
4. If the second place is ambiguous and exactly one returned candidate independently matches the fixed catalogue name/alias, full address and place type, the browser offers **Confirm exact identity · up to 1 call**. There is no automatic selection. This explicit click describes the server-retained UUID under a hard one-dispatch guard, then rechecks the returned ID, name, address and type before completing the pool. No raw provider ID is accepted from the browser. No exact match, multiple indistinguishable matches or first-place ambiguity stop honestly.
5. Once both identities match, explicitly click **Rank matched local places · up to 7 calls**. Official `rank` receives that server-owned fixed pool and the resolved cultural signal. The original catalogue order is never shown as a previous Qloo ranking. Omitted provider options remain unranked.
6. Shortlist, hide or restore returned cards locally. These controls never change provider order or affinity, create replacement recommendations, or make provider calls.

This is a feasibility pilot with two choices, not evidence of audience usefulness or superiority. Fewer than two visible choices cannot demonstrate a personalized destination choice. The catalogue covers a regional corridor; it is not a promise that every venue lies inside Mesa city limits. Current hours, accessibility, permission and safety remain unknown.

### Broad discovery

The existing path resolves a cultural favorite and requests up to three places using a public-city location filter. Returned addresses can be in neighboring cities. Broad results may be residential or unrelated to visitor needs. The local filter admits only matching runtime-reviewed identities; it does not invent catalogue recommendations. With no reviewed identity binding, no result passes that scope gate. Turning the scope off is explicit and shows a visitor-suitability warning.

Changing taste may rerank a retained result set, using a session-bound candidate handle; changing destination requires fresh discovery. No LLM provider or generated itinerary is configured. The Qloo-off control honestly reports that the same-model comparison is unavailable; it is not a completed comparison experiment.

## Privacy and retention

- Qloo credentials stay in the existing server environment. Never paste a key into the UI, repository, query string or documentation.
- Newly resolved Qloo IDs and matched response facts stay only in bounded, expiring, session-owned server memory. They are not written to this repository. The browser receives returned cards only for its explicit request.
- The prior source included response-derived fixtures and a hardcoded provider mapping. This candidate removes them from the current tree and uses wholly synthetic fixtures. That does not erase historical commits; no history rewrite has been performed.
- `public/catalogue.mjs` retains independently sourced venue identity facts and official-source links. Those facts are separate from Qloo response data and do not establish current access.
- Catalogue and retained-candidate sessions expire after 15 minutes, enforce browser ownership and have a maximum of 1,000 stored sets. No cross-session identity cache is introduced.

## Budget and safety

The unchanged process ceiling is 12 reserved provider dispatch credits, with at most three live submissions by default. Discovery or local resolution reserves four; rank reserves seven. Failures and cancellations are not refunded. Resolution plus one rank reserves eleven; one explicit identity confirmation adds one, fitting the same twelve-credit and three-submission ceilings. A failed or cancelled confirmation consumes its token and reservation; it is never automatically retried. A deployment/restart may technically reset process counters, but does not authorize new account spending or replenish any separate verification allowance.

There are no startup calls, automatic retries, bulk catalogue queries or arbitrary API proxy. Place resolution uses exactly two fixed allowlisted names; client-supplied identity lists cannot expand it. Ambiguity never guesses: only the bounded exact-match case can offer a separate confirmation click. Each action needs its own click. This capped pilot does not meet a promise of unrestricted judging access; judging access needs a separate explicit plan.

The API enforces same-origin POSTs, JSON input validation, a 4 KiB request bound, restrictive browser CSP, session-bound candidate handles, concurrency limits and per-socket-address throttling. Origin checks protect against CSRF; they are not authentication. A shared reverse proxy can conservatively share a rate bucket.

The CLI runs with fixed arguments, JSON stdin, private temporary HOME/QLOO_HOME and a restricted environment. Its egress guard restricts hosts, paths, methods and retry behavior. Output/time bounds terminate failed subprocesses; uncertain termination disables further live execution in that process. Provider affinity is a raw finite aggregate number, not a probability about an individual. Query summaries are not per-place causal explanations.

## Run and test

Requires Node.js 22.19.0 or newer.

- `npm ci` installs the pinned official package from the lockfile.
- Configure `QLOO_API_KEY` only through an approved server secret flow and set `APP_ORIGIN` to the deployed origin (or `http://localhost:3000` locally). Supply these as process environment variables; `npm start` does not automatically load `.env.example` or a `.env` file.
- `npm start` serves the app; it makes no Qloo call until an explicit live action.
- `npm test` runs the complete offline suite. The official-process tests need the installed pinned package and use injected in-memory provider fixtures, not live credentials.
- The dependency-free suite can run with `node --test $(find tests -maxdepth 1 -name '*.test.mjs' ! -name 'official-process.test.mjs' | sort)`.

Mock/DOM fixtures establish contracts, not live package compatibility, real-browser layout or recommendation quality. Current candidate test results are recorded in `evidence/confirmation-verification.json`; older verification files remain dated historical records.

## Requirements and next evidence

Use the event’s complete current requirements, not whichever page is least demanding. The kit’s CLI route is supported; broader agentic and Qloo-on/off evidence requirements still need explicit evidence. Historical reported agent use must not be confused with an in-app agent or a newly reproduced run. Do not claim comparative quality, an autonomous product, current access, unrestricted judge readiness or event eligibility from a successful API call.

The next decision is a verified allowance-backed judging-access plan; the completed pilot has exhausted the deployed process capacity. Further provider calls, capacity changes or deployments require separate authorization. Screenshots and the synthetic fixture lab do not replace a functional public demo. A subsequent audience study must use identical candidate facts and access caveats for both arms, preserve raw outcomes, and distinguish synthetic technical probes from real first-time visitors.

Project source is MIT. The pinned Qloo package is MIT; its license and notices are retained in `THIRD_PARTY_NOTICES.md` and `evidence/`. Do not remove third-party notices from runtime distributions.

## Submission references and remaining blockers

- Public source: https://github.com/scking21/Lost-Dutchmans-Compass
- Hosted demo: https://lost-dutchmans-compass.onrender.com (public page; live actions exhausted at the dated check above).
- [Official rules](https://qloo.devpost.com/rules) require a working Qloo-integrated agentic tool, agent-framework application or existing-agent integration, public complete source with a detectable open-source license, a feature description and free unrestricted testing through the judging period.
- The [event overview](https://qloo.devpost.com/) requires an externally published end-to-end demo and says a video is optional. The existing walkthrough is supplementary historical evidence.
- The no-model official CLI route is implemented. A conversational/autonomous in-app agent is not implemented. Historical reported external browser-agent use is not a reproduced goal-driven agent run of the verified revision; agentic eligibility remains unestablished.
- Current blockers include exhausted live access, the unresolved agentic-route evidence, historical response-data retention and unproven audience benefit. This is not a claim of submission readiness.
