# Supported browser workflow

A user or browser-capable agent can operate the same public interface once hosting, credential configuration and live testing have been approved. No arbitrary remote-tool endpoint or conversational agent is claimed.

1. State the goal as taste-led place discovery in a public city. Confirm cultural favorite/category. Access, safety and historical truth require independent evidence.
2. Submit discovery. If needs_input, choose the intended provider identity; otherwise inspect status and returned IDs. Do not substitute fabricated places on failure.
3. Review addresses and raw provider order. Shortlist or hide locally. These controls make zero provider calls and do not supply a negative taste signal.
4. Explicitly change favorite/category. Use “Rerank retained places with changed taste.” A shortlist restricts the retained set; otherwise all visible places are used. Changed destination requires fresh discovery.
5. Inspect official rank output, omitted IDs, prior/current positions and any query-level explanation. Do not compare numerical affinities across requests or infer individual behavior, access or safety.
6. Produce a useful shortlist with unresolved access/hours/heritage questions clearly marked. External factual checks are a separate task.

## Safe trace fields

requestId; operation; normalized workflowState; returned entity IDs/names/raw affinity/provider position; priorRequestId and ordinal position changes; providerExplanation.scope/status/bounded value; audit.runtime/workflowExecutions/networkDispatches/dispatchCountComplete; per-operation correlation ID/retrievedAt/output hash; pilotBudget upper-bound reservation and remaining credits; local refinement IDs with zero extra calls.

No keys, raw subprocess diagnostics or full provider response are exposed. User-submitted city/favorite and provider-derived names are visible in their own response, but are not server-logged. The browser session reference is not an authentication credential or a general Qloo capability.

## Proof still required

Offline fixtures establish that the actual pinned CLI executes these contracts, including seven-dispatch three-place ranking. They do not establish live API entitlement, event quota, cultural benefit, heritage coverage, independent safety/access verification, autonomous agent reasoning, or externally accessible deployment. A fair same-model comparison is a separately designed Qloo-evidence ablation; the current Qloo-off 503 readiness response is not such a comparison or a Qloo victory.
