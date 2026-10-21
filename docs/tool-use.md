# Supported browser workflow

A user or browser-capable agent can operate the public interface at https://lost-dutchmans-compass.onrender.com, subject to the current readiness indicator and separately authorized live-call allowance. Desktop returned cards and local interactions were verified on deployed `64fd67a` on October 21, 2026; earlier source also exercised live rank. The first deployed local-resolution pilot (91077a5, October 21 at 04:11 UTC) stopped unresolved with no rank or retry. A second pilot of the museum-and-park pair also stopped unresolved before ranking. Both live causes remain unknown because the older app discarded issue detail. This candidate adds safe diagnostics and explicit confirmation; no live success is claimed. A conversational or autonomous planning agent is not implemented.

1. Set a public destination city and a cultural favorite/category. Recommend places is the primary action. Current scope and mode summaries stay visible; open **Scope, test modes and pilot details** to change secondary options. Access, safety and historical truth require independent evidence.
2. Submit discovery only within an approved call budget. If `needs_input`, choose the intended provider identity. Otherwise inspect status; never substitute fabricated places on failure or interpret an empty result as proof no place exists.
3. Read the **resolved favorite and destination heading**: the actual resolved favorite, category and completed request’s destination. This is Compass’s query summary, not a Qloo causal explanation or personality inference. Rank reuses geography from earlier discovery; it does not recheck location.
4. Inspect returned place cards, addresses, raw affinity and provider positions. Broad discovery now defaults to explicitly unscoped results with a suitability warning. The optional local filter retains only session-reviewed catalogue matches; it never adds a recommendation. Open **Place evidence** for entity/type evidence and **Inspect source and request evidence** for the safe trace.
5. Shortlist, hide or restore locally. These actions make zero provider calls and do not supply a negative taste signal or change Qloo’s order/scores. The suggested next step changes from considering a shortlist to checking the venue’s own current visitor information. Shortlisting is not access verification, a booking or a generated itinerary.
6. Use **Edit your brief** to return to the favorite field. Changing inputs clears stale results. Explicitly change favorite/category to enable **Rerank retained places with changed taste**, subject to capacity. A shortlist restricts the retained set; otherwise all visible places are used. Changed destination requires fresh discovery.
7. Inspect official rank output, omitted IDs, prior/current positions and any query-level explanation. Do not compare numerical affinities across requests or infer individual behavior, access or safety. External factual checks are a separate task.

## Safe trace fields

requestId; operation; normalized workflowState; returned entity IDs/names/raw affinity/provider position; priorRequestId and ordinal position changes; providerExplanation.scope/status/bounded value; audit.runtime/workflowExecutions/networkDispatches/dispatchCountComplete; per-operation correlation ID/retrievedAt/output hash; pilotBudget upper-bound reservation and remaining credits; local refinement IDs with zero extra calls.

No keys, raw subprocess diagnostics or full provider response are exposed. User-submitted city/favorite and provider-derived names are visible in their own response, but are not server-logged. The browser session reference is not an authentication credential or a general Qloo capability.

## Evidence and remaining proof

The prior candidate’s complete offline suite passed 71 tests, including six actual installed official-CLI subprocess tests against an injected no-network provider fixture. The official-process fixture verifies two fixed place identities using the official types-array compaction contract and four fixture dispatches. These checks do not establish live account compatibility or audience value.

Desktop rendering/local interaction evidence belongs to deployed 64fd67a. This new candidate’s browser rendering, mobile layout, cultural benefit and current access remain unverified. A narrated screenshot walkthrough of that earlier deployed revision was rendered; it is not footage of this new flow. Historical reported external browser-agent use is not a reproduced agent run of this candidate. A fair same-model comparison remains a separately designed Qloo-evidence ablation. The limited pilot is not an unrestricted judging service.

## New local-shortlist contract

- Use Mesa, then explicitly click **Resolve two local places · up to 4 calls**. Only the named museum and regional park are resolved; arbitrary provider queries cannot be supplied.
- Verify a matched ready state before clicking **Rank matched local places · up to 7 calls**. A failure or mismatched identity stops with no automatic retry. When only the second place is ambiguous and exactly one candidate matches all fixed catalogue identity facts, **Confirm exact identity · up to 1 call** offers a separate, one-use identity verification; it never auto-selects or auto-ranks. A sole candidate is not a taste comparison.
- Resolution IDs are stored only in session-owned, 15-minute server memory. No provider mapping or response-derived fixture is bundled in the public source.
- Ranked cards automatically use the reviewed local scope; returned name/address changes fail closed. Omitted results remain unranked, and initial catalogue ordering is not misrepresented as prior Qloo ranking.
- Resolution and ranking reserve eleven existing pilot credits. The optional one-dispatch confirmation fits the same twelve-credit ceiling and third submission. Failure reservations remain charged, and a server restart is not a new authorization. Do not dispatch without a separate bounded verification allowance.


## Sponsor guidance behind the explanation

The official kit’s [submission guidance](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/SUBMISSION.md) recommends a clear product flow, inspectable Qloo evidence, entity choices and limitations. Its [safe-use guidance](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/SAFE_USE.md) asks builders to present sources and limits, distinguishing aggregate affinity from interpretation or predictions about individuals. The [starter workflow guidance](https://github.com/qloo/qloo-hackathon-kit/blob/main/starter/mcp-client/README.md) describes resolving and confirming identities before recommendation/ranking, handling non-success states, and using `qloo exec` when no model is in the loop.

Compass applies these ideas through the resolved-query summary, evidence disclosures, visible unknown-access state and local refinement controls. These are implementation choices informed by the kit, not a Qloo review or endorsement of the visual design. The event’s [Design criterion](https://qloo.devpost.com/rules) concerns a complete, coherent product experience; it does not establish that Qloo chose Compass’s typography, colors or layout. A supported no-model CLI route alone does not establish agentic-track eligibility.
