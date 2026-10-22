# Lost Dutchman’s Compass

## Judge start here

- **Public demo:** https://lost-dutchmans-compass.onrender.com
- **Complete source:** https://github.com/scking21/Lost-Dutchmans-Compass · [MIT license](LICENSE) · [third-party notices](THIRD_PARTY_NOTICES.md).
- **Intended platform:** desktop web browser. The latest hosted rehearsal used cloud Chrome over HTTPS; mobile and accessibility coverage remain incomplete.
- **What it does:** helps a first-time Mesa-area visitor compare a small, explicitly confirmed set of places using one or two cultural favorites. Qloo supplies aggregate ranking; the visitor or external browser agent decides what to shortlist. No in-app conversational model or itinerary generator is configured.

1. Open **Build a broader Mesa-area comparison** and wait for the readiness message. Optional travel interests show local catalogue guidance without calling Qloo.
2. Choose two to four catalogue places. For each, click **Resolve selected place**, inspect the returned name/address/type, select the exact intended identity, then click **Confirm selected identity**. Stop or choose **None of these match** if no match is suitable.
3. Resolve and explicitly confirm one or two public cultural favorites, checking the intended work/version when offered. Select the confirmed-favorite checkbox(es) you want to use.
4. Click **Rank confirmed choices** once. Its label gives the exact upper bound, `places + selected favorites + 1`, at most seven provider dispatches. Read returned positions, missing-option coverage and **Inspect this operation’s evidence**. Omitted choices stay separately unranked; missing explanations stay missing.
5. Add cards to or remove them from your local shortlist. Use official venue links to check current visitor information independently. **Clear local selections** resets the comparison without calling Qloo.

Each resolve allows at most two dispatches and each confirmation one. Four submissions per minute per session/socket pair, a separate socket limit and one live submission at a time apply; this is not unlimited provider usage. Wait through a displayed busy/rate pause before choosing a new explicit attempt. Confirmations expire after 15 minutes; remove, resolve and confirm an expired identity again. Authentication pauses require owner recovery, described below. Never replace an unmatched identity or retry a failed evaluation silently.

The actual agentic-tool route is an **external browser-capable agent operating these visible controls and interpreting returned states**, backed by the official server-side CLI. [Workflow and evidence](docs/tool-use.md) distinguish those agent decisions from Qloo output. The documented October 22 rehearsal returned 2 of 3 places with 15 reported dispatches against 17 reserved. A later actual-app walkthrough was separately completed; its recording must not be treated as the receipt for those earlier counts. It demonstrates a bounded functional workflow, not a comparative quality win, sustained availability or organizer acceptance. The earlier blinded comparison was all ties. See [the dated verification record](evidence/october-22-verification.json).

## October 22 verification and defensive fixes

A clean lockfile install on Node 24.19.0 / npm 11.9.0 recovered the pinned official CLI 0.1.26. The previous source passed all 144 tests, including the nine previously blocked official-process cases. Independent adversarial review then identified same-title favorite deduplication and truncation-before-redaction edge cases. This revision uses session-scoped opaque identity equality for confirmed favorites, redacts provider display text before bounding it, and expires legacy candidate sets at exactly fifteen minutes. Explicit reconfirmation refreshes and selects the matching favorite; different identities sharing a title stay separate. The equality marker is never accepted as authorization.

All 149 offline tests pass, including five new regression tests that fail against the previous source. Separate clean installs passed with normal lifecycle scripts and with the Docker production flags (`--omit=dev --ignore-scripts`); the pinned CLI reported 0.1.26 in both. These tests do not establish recommendation quality or event eligibility. Mobile rendering remains unverified: the cloud browser's managed policy blocks DevTools/device-emulation access. No policy bypass was attempted. The subsequent scoped history cleanup is described in [source-history cleanup](#actual-screen-walkthrough-and-source-history-cleanup).

## October 22 hosted desktop rehearsal

The original execution corresponding to sanitized source `711bf3145a5f2257a6e91285c916fa70144bdf5a` was deployed on the existing free service. One fresh cloud-Chrome desktop session completed four explicit resolve/confirm pairs and one ranking: nine deliberate operations, 15 observed provider dispatches against a conservative 17-dispatch reservation, with complete accounting for every operation. No retry, substitution or reranking was used. The intended film year was explicitly selected by the operator; the minimal retained audit does not independently encode that year.

The ranking returned two of three submitted places. The omitted place appeared in a separate unranked section with no numerical affinity or provider position. Both returned and omitted cards could be shortlisted locally; changing the History interest preserved returned order and affinities. Removing a shortlist left the displayed operation audit unchanged. Clear removed results and confirmations, disabled ranking, and displayed the no-provider-request message. These local-control observations and source tests are not a separate network capture.

This is a functional desktop result, not recommendation-quality evidence or a future-availability guarantee. Mobile testing is outside the intended desktop scope and remains unrun. A later review reported one successful natural cold entry without login. That single observation is not a latency benchmark or general availability guarantee; allow time for the free host to wake and wait for the readiness message. No generator is configured for a same-model Qloo-on/off experiment. Historical response-data cleanup is described below. Earlier dated outcomes below are preserved as historical evidence, including their limitations. See [the sanitized October 22 verification record](evidence/october-22-verification.json).

## Previously deployed local travel interests

This revision adds optional History, Legends and local lore, and Nature and outdoors checkboxes to the broader comparison. These are local catalogue-topic guidance, not extra Qloo inputs, a combined score, or an automatic boost. Every eligible place stays selectable; returned Qloo positions and affinities stay unchanged. History matches use explicit human-history catalogue categories; natural history is a separate nature topic. Legend evidence is limited to Goldfield and Superstition Mountain Lost Dutchman Museum, using their linked official Attractions and About Us pages checked October 21, 2026. This does not label Arizona Museum of Natural History or Usery as legend attractions.

Submitted places omitted by Qloo are shown separately with independently sourced catalogue details, no provider position, and affinity unavailable. They retain source links and local shortlist controls. Their omission reason is unknown. Changing interests sends no request and preserves confirmed identities and the local shortlist. Clear resets the interests and results. No provider-call, identity, expiry, ownership or budget policy changes are included.

Exact local verification on October 21: 144 tests ran, 135 passed; the same nine official CLI fixture tests that failed on the recovered baseline remain blocked by the missing pinned harness dependency. No package was installed. The dependency-free suite excludes both `official-process.test.mjs` and `curated-official.test.mjs` and passes 135/135. Focused UI, interest and visual-contract tests pass 21/21. These are offline fixture results, not live Qloo or recommendation-quality evidence. The previous exploratory ratings and tied comparisons are unchanged.

A taste-to-place prototype for first-time Mesa-area visitors, using the official `@qloo/qloo-harness@0.1.26` CLI on the server. A cultural favorite is a discovery signal, not evidence of a person’s identity or future enjoyment.

## Current revision and evidence

Commit references below are sanitized source counterparts. Observations and deployment times belong to the original executions, not new runs or deployments. Four early snapshots had fixture/mapping sanitization; later application trees are unchanged.

The sanitized source counterpart of the previously verified October 21 runtime is [`a774eb1e498b98468a47b360ad89b137473199c3`](https://github.com/scking21/Lost-Dutchmans-Compass/commit/a774eb1e498b98468a47b360ad89b137473199c3), reviewed tree `f821750bc7f8f3ad0c33804996b49bd31f15fd7b`. Render deploy `dep-dbcirk6i0phs73evbt10` reached live on the existing free service on October 21, 2026 at 21:26:37 UTC. Independent exact-source review passed; the then-current local test results and missing-harness limitations are preserved above. The established tan CSS is unchanged. No provider calls were made to implement, deploy or check this revision.

Post-deploy HTTPS browser verification covered the desktop viewport (1173 × 751): the discovery anchor, all three local interest controls, unchanged six selectable venues, no automatic identity selection, Clear/reset and rechecking an interest without reviving results. History/Legends identified the documented Goldfield and Superstition Mountain Museum topics; Nature included the arboretum, natural-history museum and Usery. The readiness message and current About wording were visible. The page had no horizontal overflow or app-origin console errors; extension metadata errors were unrelated to the app. The audit remained “No provider operation yet.” No resolve, confirm or rank action was taken. Mobile, live provider ranking, and rendered omitted-result/shortlist behavior were not retested; omitted-card behavior is covered by offline DOM tests.

The original runtime, represented here by sanitized source counterpart [`29f26b90a95dec721ba7ba3d5d804552409eef09`](https://github.com/scking21/Lost-Dutchmans-Compass/commit/29f26b90a95dec721ba7ba3d5d804552409eef09), tree `b523b347a02d60b09fd7b8e84ff026f44f014af6`, was deployed at 18:29:52 UTC and passed 137 offline tests in its original environment. That historical pass is not a test result for the current revision.

On that earlier runtime, a fresh, explicitly approved cloud-browser functional run resolved and confirmed three catalogue places and two cultural favorites, then executed one combined-taste ranking. Five confirmations succeeded; the rank returned **two of the three selected places**. The omitted option remains unranked. Both returned cards, the 2/3 coverage disclosure, access warnings, missing per-result explanations and local shortlist behavior were verified in the real UI. The run observed 20 provider dispatches within 21 reserved. This verifies a partial functional result for this exact workflow, not complete choice-set coverage, recommendation quality or future service availability. No retry was made to obtain a better result. See [the final functional record](evidence/final-functional-verification.json).

The rank button now displays the selected operation's exact upper bound: three places plus two signals plus one insights dispatch equals six. Expired confirmations are visibly marked and block ranking; recovery requires explicit removal, resolution and confirmation, up to three calls per identity. Nothing refreshes automatically. Server ownership and expiry checks remain authoritative if browser time differs.

Earlier revision `4e9ee7ada1353268b658be90c4fc482ac53d908e` passed 110 offline tests and two sequential fresh-session checks of local resolution → explicit confirmation → two-place ranking. Jurassic Park (1993) was tested in the cloud browser; Nina Simone used an independent HTTP cookie jar. Each observed ten provider dispatches within twelve reserved. Those earlier browser checks also covered local shortlist, hide and restore in the legacy two-place flow. Mobile and cold-start recovery were not verified in that earlier check; the later single cold-entry observation is described above.

The preregistered four-profile diagnostic retained all outcomes: D1 (film), D2 (artist) and D4 (TV show) returned two ranked cards; D3 (book) stopped at cultural-identity ambiguity because neither offered match was the predeclared book. No favorite was substituted and no failed case was rerolled. Three complete Qloo-on/off pairs were assessed by two blinded native-model assessor replicates in both display orders: all twelve judgments were ties, with no order sensitivity or flagged hard failures. D3 was not scored. This test did not demonstrate a Qloo quality advantage; it is not real-visitor proof or evidence of equivalence.

The earlier twelve-call shared testing ceiling is removed in judging mode. Initial verification on `8b5e065e` exposed overlapping subprocess timeouts on the free instance; both failed attempts remain in the evidence record. The current revision serializes live submissions, returns an explicit retryable busy state to competing requests, and uses bounded subprocess deadlines. No paid upgrade or new service was introduced. The historical exhausted 04:39 UTC pilot is not the current access state or a provider quota reading.

Earlier source `fb5c5d185070810ed1bde3859499289d50475d30` supplies historical desktop describe→recommend evidence. The technically verified 106.6-second narrated screenshot walkthrough depicts that older discovery flow, not the new local-confirmation flow. Two later local-resolution pilots stopped unresolved before ranking; the older app did not retain enough issue detail to classify those failures. The successful newer run does not retroactively explain them. Public regression fixtures are synthetic. The historical response-data cleanup described below replaces the earlier main-branch snapshots that contained response-derived fixtures.

## Broader confirmed corridor flow

The new comparison flow lets a visitor select two to four of six addressed, unblocked catalogue entries across Mesa, Apache Junction and Superior. It does not claim a strict Mesa city boundary, travel-time constraint, safe route or current venue access. Every place and each of one or two cultural favorites is resolved separately, then explicitly confirmed by describing its server-retained identity. Names, full addresses and place types must match the independently sourced catalogue. Cultural matches require explicit selection even when only one candidate is returned; “None of these match” never submits a substitute.

Identity tokens are session-owned, bounded and expire after 15 minutes. Each explicit name-resolution action permits two dispatches; confirmation permits one. A separate rank action accepts two to four confirmed options and one or two confirmed signals, with an exact `N + M + 1` guard (at most seven dispatches) in one CLI subprocess. There is no automatic batching, retry, ranking or query rewrite. All returned options remain visible in provider order; provider omissions remain unranked. Confirmed-favorite checkboxes support comparing the same choices under one or both signals without resolving again. The app does not supply signal weights or compare affinities numerically across requests.

Broad discovery now preserves actual returned per-result `explainability` when present, bounded and displayed as text. The pinned rank schema has no `explain` parameter; the app does not send one, and reports missing per-result detail honestly. The reviewed flow’s original deployment corresponds to sanitized source `ec6e17af988d2534200d3dc2bce78a1b8116a4e2`. Its frozen comparison stopped at the first place-resolution action: no usable exact identity passed the current app contract. Two dispatches were observed; zero identities were confirmed and zero of three ranks were attempted. The retained response cannot establish whether the cause was provider coverage or a metadata mismatch. The earlier three-pair tied diagnostic remains unchanged and does not prove value for the broader flow. A separate two-dispatch incident lookup on `9eff6b4c797abf7dd507b2a3e7de180467cbaa0c` returned one successful describe result rejected for an exact catalogue name mismatch. No address, type or identity rejection category was flagged. That first diagnostic did not retain the alternative name. A later read-only preview and independent tourism-source checks established a precise documented alias; the correction and subsequent outcomes are recorded below. The categorical diagnostic revision passed 130 offline tests and independent review. See [the dated diagnostic record](evidence/curated-diagnostic-verification.json).

## Product paths

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
- The prior source included response-derived fixtures and a hardcoded provider mapping. The current tree uses synthetic fixtures, and the targeted reachable-main history cleanup is described in [source-history cleanup](#actual-screen-walkthrough-and-source-history-cleanup), including its limits.
- `public/catalogue.mjs` retains independently sourced venue identity facts and official-source links. Those facts are separate from Qloo response data and do not establish current access.
- Catalogue and retained-candidate sessions expire after 15 minutes, enforce browser ownership and have a maximum of 1,000 stored sets. No cross-session identity cache is introduced.

## Budget and safety

### Deployed judging access

Production defaults to `ACCESS_MODE=judging`. The old shared 12-credit/three-submission testing ceiling no longer disables later judges. Existing `MAX_LIVE_RUNS` configuration does not activate pilot mode. Every explicit discovery/local resolution remains bounded by four provider dispatches, confirmation by one, and rank by seven. No automatic provider retries are introduced.

Four submissions per minute are allowed per browser-session/socket pair, with a separate 60-per-minute socket safety limit and one active live submission on the free instance. A competing request gets an explicit retryable busy response before any reservation or provider dispatch. Distinct judges behind the same hosting proxy do not share the old four-submission bucket. Forwarded IP headers are never trusted. Sessions and identities remain private, in memory and expire after 15 minutes; no cross-session provider cache is added.

Provider 401/403 pauses further execution for the process; 429 pauses for at least one minute and respects a valid longer Retry-After. A later request requires an explicit user action. Uncertain subprocess termination remains fail-closed. Status reports actual pause state, process start time and operation-scoped limits. Provider account allowance remains unknown; none of these controls claims unlimited provider capacity.

For an explicit bounded test, select `ACCESS_MODE=pilot`; its defaults remain 12 process reservations and three submissions, configurable with `MAX_DISPATCH_CREDITS` and `MAX_LIVE_RUNS`. Optional `LIVE_ACCESS_UNTIL` uses exact UTC format `YYYY-MM-DDTHH:mm:ss.sssZ`. There is no default expiry. Process counters reset on host restart and are not a durable account ledger. Failed/cancelled pilot reservations are never refunded.

There are no startup calls, automatic retries, bulk catalogue queries or arbitrary API proxy. The legacy local resolver uses exactly two fixed allowlisted names. The broader flow resolves one explicitly selected allowlisted catalogue place at a time; client-supplied provider identity lists cannot expand either path. Ambiguity never guesses: only the bounded exact-match case can offer a separate confirmation click. Each action needs its own click. The deployed judging policy removes the shared testing ceiling; the two successful fresh-session checks are described above.

The API enforces same-origin POSTs, JSON input validation, a 4 KiB request bound, restrictive browser CSP, session-bound candidate handles, concurrency limits and per-socket-address throttling. Origin checks protect against CSRF; they are not authentication. A shared reverse proxy can conservatively share a rate bucket.

The CLI runs with fixed arguments, JSON stdin, private temporary HOME/QLOO_HOME and a restricted environment. Its egress guard restricts hosts, paths, methods and retry behavior. Each of at most two sequential subprocesses has a 35-second deadline and a two-second termination wait; the browser deadline is 90 seconds. Output/time bounds terminate failed subprocesses; uncertain termination disables further live execution in that process. Provider affinity is a raw finite aggregate number, not a probability about an individual. Query summaries are not per-place causal explanations.

## Run and test

Requires Node.js 22.19.0 or newer.

- `npm ci` installs the pinned official package from the lockfile.
- Configure `QLOO_API_KEY` only through an approved server secret flow and set `APP_ORIGIN` to the deployed origin (or `http://localhost:3000` locally). Supply these as process environment variables; `npm start` does not automatically load `.env.example` or a `.env` file.
- `npm start` serves the app; it makes no Qloo call until an explicit live action.
- `npm test` runs the complete offline suite. The official-process tests need the installed pinned package and use injected in-memory provider fixtures, not live credentials.
- The dependency-free suite can run with `node --test $(find tests -maxdepth 1 -name '*.test.mjs' ! -name 'official-process.test.mjs' ! -name 'curated-official.test.mjs' | sort)`.

### Server configuration and recovery

Local setup is `npm ci`, configure the process environment, then `npm start`; open `http://localhost:3000`. Use an existing Qloo hackathon credential in `QLOO_API_KEY` through your server’s secret manager or a private local environment mechanism. `APP_ORIGIN` must exactly match the browser origin, including scheme and port; `PORT` defaults to 3000. `.env.example` is a variable reference, not an automatically loaded secrets file. Do not commit credentials or put them in client code. No model key is required. Installing/running the offline tests needs no live Qloo key; live actions require a valid server key and provider allowance.

`GET /api/status` is a no-provider-call readiness check: inspect `configured`, `liveExecutionAllowed`, `livePauseReason` and `providerRetryAt`. `configured: true` only means a key is present, not that it is valid. A 401/403 provider response latches an authentication pause in the server process. The owner must check/correct the existing server credential and restart that process; refreshing the browser alone cannot clear it. Restarting loses in-memory confirmations and retained candidates, so reload and explicitly resolve/confirm again before a new rank. Do not retry until the credential problem is addressed. Rate-limit pauses instead honor the displayed retry time and need a new explicit action; no automatic provider retry runs. An uncertain process-termination pause also needs owner investigation before restart. No recovery or restart is performed by this documentation update.

Mock/DOM fixtures establish contracts, not live package compatibility, real-browser layout or recommendation quality. Current access verification is recorded in `evidence/judging-access-verification.json`; `evidence/confirmation-verification.json` and older files remain dated historical records.

## Requirements and next evidence

Use the event’s complete current requirements, not whichever page is least demanding. The kit’s CLI route is supported. The event requires an eligible Qloo-integrated agentic tool; a Qloo-on/off baseline win or ablation is not a mandatory submission requirement. Comparative evaluation remains useful optional evidence, and the existing tied outcomes must not be represented as superiority. The current cloud-browser agent performed a source-bound goal-led run: reviewed identities, explicitly selected the intended matches, submitted the fixed combined-taste rank, inspected partial coverage and missing explanation, then selected a provisional local shortlist. Qloo supplied the ranking; the external agent made the UI decisions. This does not create an in-app model or establish organizer acceptance. Do not claim comparative quality, an autonomous product, current access, unrestricted judge readiness or event eligibility from a successful API call.

Judge access has passed the bounded checks above. Broader reliability and visitor usefulness still need evidence. Screenshots and the synthetic fixture lab do not replace a functional public demo. A subsequent audience study must use identical candidate facts and access caveats for both arms, preserve raw outcomes, and distinguish synthetic technical probes from real first-time visitors.

Project source is MIT. The pinned Qloo package is MIT; its license and notices are retained in `THIRD_PARTY_NOTICES.md` and `evidence/`. Do not remove third-party notices from runtime distributions.

## Submission references and remaining blockers

- Public source: https://github.com/scking21/Lost-Dutchmans-Compass
- Hosted demo: https://lost-dutchmans-compass.onrender.com (public page with live judging actions verified on the revision above).
- [Official rules](https://qloo.devpost.com/rules) require a working Qloo-integrated agentic tool, agent-framework application or existing-agent integration, public complete source with a detectable open-source license, a feature description and free unrestricted testing through the judging period.
- The [event overview](https://qloo.devpost.com/) requires an externally published end-to-end demo and says a video is optional. Lead with the existing approximately 1:36 actual-screen walkthrough with narration and captions. The separate atmospheric video is a concept overview, not footage of implemented interface changes. Neither video replaces the live demo.
- The no-model official CLI route is implemented. An external browser-agent workflow was reproduced on the current revision as described above. A conversational/autonomous in-app model is not implemented; whether this meets the event’s agentic-tool route remains for organizers to judge.
- Known limitations include partial ranked-option coverage, organizer interpretation of the agentic-tool route and unproven audience benefit. Final entry review and submission remain separate steps; this is not a submission receipt.

### Exact alias correction

A final separate two-dispatch incident lookup on `da32e709631f4cc53ec58c624468bcdb5e7c4dee` made the rejected public place name/address visible without accepting it. Independent Visit Mesa and Apache Junction tourism sources then confirmed the longer corporate name for the same venue; the catalogue now records that one precise alias with source links. Full address, place type, identity binding and explicit confirmation remain required. This correction passed offline regression coverage and subsequently resolved and explicitly confirmed the intended venue in fresh browser runs. That does not guarantee the provider will include it in ranking results. The original broader comparison remains blocked and unscored. The comparison plus both incident lookups consumed six observed dispatches, with no ranking.

### Preserved functional outcomes after the alias correction

- The fixed four-place rehearsal on `1aec64016b647bc716d24ec11a13485b8a24ea82` confirmed three places, then stopped because Airbase had no exact accepted match among the returned ambiguous candidates. It observed nine dispatches within eleven reserved; no tastes or rank were attempted.
- A separate adaptive three-place attempt confirmed the two predeclared favorites, using six further dispatches. Its final rank was blocked before submission, and the place confirmations expired while explicit approval was pending. Zero ranks ran in that attempt.
- After explicit approval of a fresh maximum-21-request run and the reviewed count/expiry UI fix, the current revision completed five fresh confirmations and one rank with partial 2/3 coverage. Twenty dispatches were observed against twenty-one reserved; no per-result explanations were returned.
- These activities plus the original blocked comparison and two incident lookups total 41 observed dispatches and 44 conservative reservations in this iteration. The earlier restoration's 64-reservation verification allowance is separate; incomplete historical dispatch counts are not invented.
- The frozen comparison remains blocked and unscored. The earlier three-pair blinded quality diagnostic remains all ties. The functional run does not demonstrate incremental Qloo recommendation-quality benefit.

## Actual-screen walkthrough and source-history cleanup

The October 22 actual-app walkthrough is approximately 1:36, with narration and captions, and was independently reviewed before delivery. It is distinct from the earlier dated rehearsal evidence above. Preserve the app’s partial-ranking and missing-explanation states; do not claim recommendation-quality superiority from a functioning demo or reuse earlier dispatch totals as this recording’s metrics. The original overnight recording/test artifacts are not re-audited by this documentation-only change.

The separate atmospheric concept overview is illustrative. It is not an actual-app recording and does not establish implemented UX changes. Lead with the actual-app walkthrough. The live public demo remains the primary functional deliverable; video is optional under the event rules.

The reachable main-branch history has been rewritten to remove the two old response-derived fixture files and associated embedded provider identities in four historical snapshots. Synthetic replacements are explicitly labeled. The 27 original commits retain their author, committer, timestamp and message metadata; unchanged file snapshots and the current application tree were verified. A private rollback preserves the pre-cleanup history. This describes reachable main history only: GitHub caches, dangling commit URLs, prior clones and third-party copies are not claimed erased. Commit links and hashes in this README and the workflow guide identify sanitized counterparts for source navigation. Observations belong to the original executions; these rewritten references are not new test runs or deployments. Four early snapshots had fixture and mapping sanitization; later application trees are unchanged. Dated evidence records themselves have not been rewritten.

No final Devpost submission receipt has been verified. These documentation changes do not submit the project or deploy a new runtime.
