# Lost Dutchman’s Compass

A taste-to-place prototype for first-time Mesa-area visitors, using the official `@qloo/qloo-harness@0.1.26` CLI on the server. A cultural favorite is a discovery signal, not evidence of a person’s identity or future enjoyment.

## Current revision and evidence

The verified runtime revision is [`e9c725c96bb1b6d77f34676bbce3beac63a314b6`](https://github.com/scking21/Lost-Dutchmans-Compass/commit/e9c725c96bb1b6d77f34676bbce3beac63a314b6), tree `78e8b70570e59f5397ae2cba1ea9cf044091988c`, deployed on the existing free Render service on October 21, 2026 at 16:33 UTC. Independent review passed, and the full offline suite passed 110 tests, including eight installed pinned-CLI subprocess tests with synthetic provider fixtures.

Two sequential fresh-session checks completed local resolution → explicit identity confirmation → two-place ranking: Jurassic Park (1993) in the cloud browser, and Nina Simone through an independent HTTP cookie jar. The browser also verified returned-card rendering and local shortlist, hide and restore with no extra provider calls. Each successful run observed ten provider dispatches within a twelve-dispatch reservation bound. This establishes working access for these checks, not unrestricted throughput, recommendation quality or future service availability. Mobile and cold-start recovery remain unverified.

The preregistered four-profile diagnostic retained all outcomes: D1 (film), D2 (artist) and D4 (TV show) returned two ranked cards; D3 (book) stopped at cultural-identity ambiguity because neither offered match was the predeclared book. No favorite was substituted and no failed case was rerolled. Three complete Qloo-on/off pairs were assessed by two blinded native-model assessor replicates in both display orders: all twelve judgments were ties, with no order sensitivity or flagged hard failures. D3 was not scored. This test did not demonstrate a Qloo quality advantage; it is not real-visitor proof or evidence of equivalence.

The earlier twelve-call shared testing ceiling is removed in judging mode. Initial verification on `3ebf4bdd` exposed overlapping subprocess timeouts on the free instance; both failed attempts remain in the evidence record. The current revision serializes live submissions, returns an explicit retryable busy state to competing requests, and uses bounded subprocess deadlines. No paid upgrade or new service was introduced. The historical exhausted 04:39 UTC pilot is not the current access state or a provider quota reading.

Earlier source `64fd67a250c5ba882d2222caca2cc7b99d6174ad` supplies historical desktop describe→recommend evidence. The technically verified 106.6-second narrated screenshot walkthrough depicts that older discovery flow, not the new local-confirmation flow. Two later local-resolution pilots stopped unresolved before ranking; the older app did not retain enough issue detail to classify those failures. The successful newer run does not retroactively explain them. Public regression fixtures at the verified revision are synthetic; old public commits still retain response-derived material and that compliance concern remains unresolved.

## Broader reviewed corridor candidate

The new comparison flow lets a visitor select two to four of six addressed, unblocked catalogue entries across Mesa, Apache Junction and Superior. It does not claim a strict Mesa city boundary, travel-time constraint, safe route or current venue access. Every place and each of one or two cultural favorites is resolved separately, then explicitly confirmed by describing its server-retained identity. Names, full addresses and place types must match the independently sourced catalogue. Cultural matches require explicit selection even when only one candidate is returned; “None of these match” never submits a substitute.

Identity tokens are session-owned, bounded and expire after 15 minutes. Each explicit name-resolution action permits two dispatches; confirmation permits one. A separate rank action accepts two to four confirmed options and one or two confirmed signals, with an exact `N + M + 1` guard (at most seven dispatches) in one CLI subprocess. There is no automatic batching, retry, ranking or query rewrite. All returned options remain visible in provider order; provider omissions remain unranked. Confirmed-favorite checkboxes support comparing the same choices under one or both signals without resolving again. The app does not supply signal weights or compare affinities numerically across requests.

Broad discovery now preserves actual returned per-result `explainability` when present, bounded and displayed as text. The pinned rank schema has no `explain` parameter; the app does not send one, and reports missing per-result detail honestly. The reviewed flow was deployed at `42d7f52e3894ca49a9db44bf508e319446decfad`. Its frozen comparison stopped at the first place-resolution action: no usable exact identity passed the current app contract. Two dispatches were observed; zero identities were confirmed and zero of three ranks were attempted. The retained response cannot establish whether the cause was provider coverage or a metadata mismatch. The earlier three-pair tied diagnostic remains unchanged and does not prove value for the broader flow. A separate two-dispatch incident lookup on `7ab5fdee63f5047ce9cd19d784dc9a92f02a5f78` returned one successful describe result rejected for an exact catalogue name mismatch. No address, type or identity rejection category was flagged. The alternative name was not retained, so a legitimate alias versus wrong identity remains unresolved. No alias or acceptance rule was changed. The diagnostic revision passed 130 offline tests and independent review; no successful broader ranking is claimed. See [the dated diagnostic record](evidence/curated-diagnostic-verification.json).

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

Changing taste may rerank a retained result set, using a session-bound candidate handle; changing destination requires fresh discovery. No LLM provider or generated itinerary is configured. The in-app Qloo-off control honestly reports that a generator is unavailable. The separate frozen same-model diagnostic used an external evaluation harness; it does not add an in-app generator.

## Privacy and retention

- Qloo credentials stay in the existing server environment. Never paste a key into the UI, repository, query string or documentation.
- Newly resolved Qloo IDs and matched response facts stay only in bounded, expiring, session-owned server memory. They are not written to this repository. The browser receives returned cards only for its explicit request.
- The prior source included response-derived fixtures and a hardcoded provider mapping. This candidate removes them from the current tree and uses wholly synthetic fixtures. That does not erase historical commits; no history rewrite has been performed.
- `public/catalogue.mjs` retains independently sourced venue identity facts and official-source links. Those facts are separate from Qloo response data and do not establish current access.
- Catalogue and retained-candidate sessions expire after 15 minutes, enforce browser ownership and have a maximum of 1,000 stored sets. No cross-session identity cache is introduced.

## Budget and safety

### Deployed judging access

Production defaults to `ACCESS_MODE=judging`. The old shared 12-credit/three-submission testing ceiling no longer disables later judges. Existing `MAX_LIVE_RUNS` configuration does not activate pilot mode. Every explicit discovery/local resolution remains bounded by four provider dispatches, confirmation by one, and rank by seven. No automatic provider retries are introduced.

Four submissions per minute are allowed per browser-session/socket pair, with a separate 60-per-minute socket safety limit and one active live submission on the free instance. A competing request gets an explicit retryable busy response before any reservation or provider dispatch. Distinct judges behind the same hosting proxy do not share the old four-submission bucket. Forwarded IP headers are never trusted. Sessions and identities remain private, in memory and expire after 15 minutes; no cross-session provider cache is added.

Provider 401/403 pauses further execution for the process; 429 pauses for at least one minute and respects a valid longer Retry-After. A later request requires an explicit user action. Uncertain subprocess termination remains fail-closed. Status reports actual pause state, process start time and operation-scoped limits. Provider account allowance remains unknown; none of these controls claims unlimited provider capacity.

For an explicit bounded test, select `ACCESS_MODE=pilot`; its defaults remain 12 process reservations and three submissions, configurable with `MAX_DISPATCH_CREDITS` and `MAX_LIVE_RUNS`. Optional `LIVE_ACCESS_UNTIL` uses exact UTC format `YYYY-MM-DDTHH:mm:ss.sssZ`. There is no default expiry. Process counters reset on host restart and are not a durable account ledger. Failed/cancelled pilot reservations are never refunded.

There are no startup calls, automatic retries, bulk catalogue queries or arbitrary API proxy. Place resolution uses exactly two fixed allowlisted names; client-supplied identity lists cannot expand it. Ambiguity never guesses: only the bounded exact-match case can offer a separate confirmation click. Each action needs its own click. The deployed judging policy removes the shared testing ceiling; the two successful fresh-session checks are described above.

The API enforces same-origin POSTs, JSON input validation, a 4 KiB request bound, restrictive browser CSP, session-bound candidate handles, concurrency limits and per-socket-address throttling. Origin checks protect against CSRF; they are not authentication. A shared reverse proxy can conservatively share a rate bucket.

The CLI runs with fixed arguments, JSON stdin, private temporary HOME/QLOO_HOME and a restricted environment. Its egress guard restricts hosts, paths, methods and retry behavior. Each of at most two sequential subprocesses has a 35-second deadline and a two-second termination wait; the browser deadline is 90 seconds. Output/time bounds terminate failed subprocesses; uncertain termination disables further live execution in that process. Provider affinity is a raw finite aggregate number, not a probability about an individual. Query summaries are not per-place causal explanations.

## Run and test

Requires Node.js 22.19.0 or newer.

- `npm ci` installs the pinned official package from the lockfile.
- Configure `QLOO_API_KEY` only through an approved server secret flow and set `APP_ORIGIN` to the deployed origin (or `http://localhost:3000` locally). Supply these as process environment variables; `npm start` does not automatically load `.env.example` or a `.env` file.
- `npm start` serves the app; it makes no Qloo call until an explicit live action.
- `npm test` runs the complete offline suite. The official-process tests need the installed pinned package and use injected in-memory provider fixtures, not live credentials.
- The dependency-free suite can run with `node --test $(find tests -maxdepth 1 -name '*.test.mjs' ! -name 'official-process.test.mjs' | sort)`.

Mock/DOM fixtures establish contracts, not live package compatibility, real-browser layout or recommendation quality. Current access verification is recorded in `evidence/judging-access-verification.json`; `evidence/confirmation-verification.json` and older files remain dated historical records.

## Requirements and next evidence

Use the event’s complete current requirements, not whichever page is least demanding. The kit’s CLI route is supported; broader agentic and Qloo-on/off evidence requirements still need explicit evidence. Historical reported agent use must not be confused with an in-app agent or a newly reproduced run. Do not claim comparative quality, an autonomous product, current access, unrestricted judge readiness or event eligibility from a successful API call.

Judge access has passed the bounded checks above. Broader reliability and visitor usefulness still need evidence. Screenshots and the synthetic fixture lab do not replace a functional public demo. A subsequent audience study must use identical candidate facts and access caveats for both arms, preserve raw outcomes, and distinguish synthetic technical probes from real first-time visitors.

Project source is MIT. The pinned Qloo package is MIT; its license and notices are retained in `THIRD_PARTY_NOTICES.md` and `evidence/`. Do not remove third-party notices from runtime distributions.

## Submission references and remaining blockers

- Public source: https://github.com/scking21/Lost-Dutchmans-Compass
- Hosted demo: https://lost-dutchmans-compass.onrender.com (public page with live judging actions verified on the revision above).
- [Official rules](https://qloo.devpost.com/rules) require a working Qloo-integrated agentic tool, agent-framework application or existing-agent integration, public complete source with a detectable open-source license, a feature description and free unrestricted testing through the judging period.
- The [event overview](https://qloo.devpost.com/) requires an externally published end-to-end demo and says a video is optional. The existing walkthrough is supplementary historical evidence.
- The no-model official CLI route is implemented. A conversational/autonomous in-app agent is not implemented. Historical reported external browser-agent use is not a reproduced goal-driven agent run of the verified revision; agentic eligibility remains unestablished.
- Remaining evidence gaps include the unresolved agentic-route evidence, historical response-data retention and unproven audience benefit. This is not a claim of submission readiness.
