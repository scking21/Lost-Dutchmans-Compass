# Lost Dutchman’s Compass

A taste-to-place prototype for first-time Mesa-area visitors, using the official `@qloo/qloo-harness@0.1.26` CLI on the server. A cultural favorite is a discovery signal, not evidence of a person’s identity or future enjoyment.

## Current revision and evidence

This candidate starts from public source `64fd67a250c5ba882d2222caca2cc7b99d6174ad`. That deployed revision had a real desktop describe→recommend check on 2026-10-21, including returned-card rendering, shortlist, hide, restore and stale-result clearing. The narrated screenshot walkthrough was rendered and technically verified separately. Earlier versions also exercised live rank. These historical checks do not verify this candidate’s new local-resolution path. Mobile remains unverified.

The new source is an offline implementation candidate pending independent review, publication, deployment and separately bounded live verification. Its public regression fixtures are wholly synthetic; they are not provider-response records. Do not infer current deployment state from this README.

## Two product paths

### Reviewed local shortlist

1. Enter Mesa and a film, artist, book or TV favorite.
2. Explicitly click **Resolve two local places · up to 4 calls**. The server resolves exactly Arizona Museum of Natural History and Superstition Mountain Lost Dutchman Museum through official `describe` with type `place`.
3. Each result must bind a valid provider identity to the exact independently sourced catalogue name/recorded alias, full normalized address and place type evidence. Unresolved names, ambiguity, contradictory types, duplicate IDs and mismatched addresses stop the operation without retry or ranking.
4. Once both identities match, explicitly click **Rank matched local places · up to 7 calls**. Official `rank` receives that server-owned fixed pool and the resolved cultural signal. The original catalogue order is never shown as a previous Qloo ranking. Omitted provider options remain unranked.
5. Shortlist, hide or restore returned cards locally. These controls never change provider order or affinity, create replacement recommendations, or make provider calls.

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

The unchanged process ceiling is 12 reserved provider dispatch credits, with at most three live submissions by default. Discovery or local resolution reserves four; rank reserves seven. Failures and cancellations are not refunded. Resolution plus one rank reserves eleven. A deployment/restart may technically reset process counters, but does not authorize new account spending or replenish any separate verification allowance.

There are no startup calls, automatic retries, bulk catalogue queries or arbitrary API proxy. Place resolution uses exactly two fixed allowlisted names; client-supplied identity lists cannot expand it. Ambiguity stops rather than guessing. Each action needs its own click. This capped pilot does not meet a promise of unrestricted judging access; judging access needs a separate explicit plan.

The API enforces same-origin POSTs, JSON input validation, a 4 KiB request bound, restrictive browser CSP, session-bound candidate handles, concurrency limits and per-socket-address throttling. Origin checks protect against CSRF; they are not authentication. A shared reverse proxy can conservatively share a rate bucket.

The CLI runs with fixed arguments, JSON stdin, private temporary HOME/QLOO_HOME and a restricted environment. Its egress guard restricts hosts, paths, methods and retry behavior. Output/time bounds terminate failed subprocesses; uncertain termination disables further live execution in that process. Provider affinity is a raw finite aggregate number, not a probability about an individual. Query summaries are not per-place causal explanations.

## Run and test

Requires Node.js 22.19.0 or newer.

- `npm ci` installs the pinned official package from the lockfile.
- Configure `QLOO_API_KEY` only through an approved server secret flow and set `APP_ORIGIN` to the deployed origin.
- `npm start` serves the app; it makes no Qloo call until an explicit live action.
- `npm test` runs the complete offline suite. The official-process tests need the installed pinned package and use injected in-memory provider fixtures, not live credentials.
- The dependency-free suite can run with `node --test $(find tests -maxdepth 1 -name '*.test.mjs' ! -name 'official-process.test.mjs' | sort)`.

Mock/DOM fixtures establish contracts, not live package compatibility, real-browser layout or recommendation quality. Current candidate test results are recorded in `evidence/audience-candidate-verification.json`; older verification files remain dated historical records.

## Requirements and next evidence

Use the event’s complete current requirements, not whichever page is least demanding. The kit’s CLI route is supported; broader agentic and Qloo-on/off evidence requirements still need explicit evidence. Historical reported agent use must not be confused with an in-app agent or a newly reproduced run. Do not claim comparative quality, an autonomous product, current access, unrestricted judge readiness or event eligibility from a successful API call.

The next live step, if separately authorized, is the four-dispatch maximum place-resolution pilot. Its stopping conditions are documented in the explicit UI and tests. Further ranking calls require their own bounded allowance. A subsequent audience study must use identical candidate facts and access caveats for both arms, preserve raw outcomes, and distinguish synthetic technical probes from real first-time visitors.

Project source is MIT. The pinned Qloo package is MIT; its license and notices are retained in `THIRD_PARTY_NOTICES.md` and `evidence/`. Do not remove third-party notices from runtime distributions.
