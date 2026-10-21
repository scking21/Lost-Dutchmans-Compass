# Supported browser workflow

A user or browser-capable agent can operate the public interface at https://lost-dutchmans-compass.onrender.com, subject to the current readiness indicator and separately authorized live-call allowance. Live describe, recommend and rank were verified on the earlier deployed `4866c19` build; the personalized-card build `592fbcec` was deployed and passed no-call browser checks. A conversational or autonomous planning agent is not implemented.

1. Set a public destination city and a cultural favorite/category. Access, safety and historical truth require independent evidence.
2. Submit discovery only within an approved call budget. If `needs_input`, choose the intended provider identity. Otherwise inspect status; never substitute fabricated places on failure or interpret an empty result as proof no place exists.
3. Read **Your discovery signal**: the actual resolved favorite, category and completed request’s destination. This is Compass’s query summary, not a Qloo causal explanation or personality inference. Rank reuses geography from earlier discovery; it does not recheck location.
4. Inspect returned place cards, addresses, raw affinity and provider positions. The default local heritage/outdoor filter only retains reviewed catalogue matches; it never adds a recommendation. Open **Place evidence** for entity/type evidence and **Inspect source and request evidence** for the safe trace.
5. Shortlist, hide or restore locally. These actions make zero provider calls and do not supply a negative taste signal or change Qloo’s order/scores. The suggested next step changes from considering a shortlist to checking the venue’s own current visitor information. Shortlisting is not access verification, a booking or a generated itinerary.
6. Use **Edit your brief** to return to the favorite field. Changing inputs clears stale results. Explicitly change favorite/category to enable **Rerank retained places with changed taste**, subject to capacity. A shortlist restricts the retained set; otherwise all visible places are used. Changed destination requires fresh discovery.
7. Inspect official rank output, omitted IDs, prior/current positions and any query-level explanation. Do not compare numerical affinities across requests or infer individual behavior, access or safety. External factual checks are a separate task.

## Safe trace fields

requestId; operation; normalized workflowState; returned entity IDs/names/raw affinity/provider position; priorRequestId and ordinal position changes; providerExplanation.scope/status/bounded value; audit.runtime/workflowExecutions/networkDispatches/dispatchCountComplete; per-operation correlation ID/retrievedAt/output hash; pilotBudget upper-bound reservation and remaining credits; local refinement IDs with zero extra calls.

No keys, raw subprocess diagnostics or full provider response are exposed. User-submitted city/favorite and provider-derived names are visible in their own response, but are not server-logged. The browser session reference is not an authentication credential or a general Qloo capability.

## Evidence and remaining proof

Historical offline fixtures exercised the actual pinned CLI contracts, including seven-dispatch three-place ranking. The current discovery-card source has 46 passing dependency-free tests, including nine DOM-handler tests; five installed-package subprocess tests were unavailable in the current workspace. Historical test records are dated in `evidence/` and are not a fresh full-suite pass.

Live API execution and public deployment have been verified separately. The latest card rendering in a real browser, mobile layout, cultural benefit, broader heritage coverage and current safety/access remain unverified. A fair same-model comparison is a separately designed Qloo-evidence ablation; the current Qloo-off readiness response is not such a comparison or a Qloo victory. The limited pilot is not an unrestricted judging service. See [the draft video script and shot list](video-script.md); no rendered or uploaded video is represented by that document.

## Sponsor guidance behind the explanation

The official kit’s [submission guidance](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/SUBMISSION.md) recommends a clear product flow, inspectable Qloo evidence, entity choices and limitations. Its [safe-use guidance](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/SAFE_USE.md) asks builders to present sources and limits, distinguishing aggregate affinity from interpretation or predictions about individuals. The [starter workflow guidance](https://github.com/qloo/qloo-hackathon-kit/blob/main/starter/mcp-client/README.md) describes resolving and confirming identities before recommendation/ranking, handling non-success states, and using `qloo exec` when no model is in the loop.

Compass applies these ideas through the resolved-query summary, evidence disclosures, visible unknown-access state and local refinement controls. These are implementation choices informed by the kit, not a Qloo review or endorsement of the visual design. The event’s [Design criterion](https://qloo.devpost.com/rules) concerns a complete, coherent product experience; it does not establish that Qloo chose Compass’s typography, colors or layout. A supported no-model CLI route alone does not establish agentic-track eligibility.
