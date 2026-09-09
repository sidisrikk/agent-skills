---
name: library-first
description: >-
  Library-first scope check. Use before planning or writing substantial
  custom commodity capability to evaluate repository, platform, framework,
  and maintained dependency alternatives.
---

Evaluate one proposed capability before substantial custom implementation.

1. **Classify.** Name the commodity capability, its must-have requirements,
   and the product-specific behavior that stays custom. For small changes or
   primarily domain logic, state that classification and end the workflow.

2. **Reuse.** Inspect alternatives in this preference order:

   - existing repository implementation
   - existing repository dependency
   - language/platform capability
   - framework capability
   - mature external dependency
   - custom implementation

   Identify a plausible fit or a concrete requirement gap before moving to a
   lower preference. Once a fit is verified, proceed to the decision.

3. **Discover.** When earlier alternatives leave a gap, identify at most three
   realistic external candidates; one or two strong candidates suffice.
   Advance with a shortlist or the reason no viable candidate was found.

4. **Verify.** Map each must-have requirement to evidence or an explicit gap
   for the proposed choice. For version-specific APIs, supported features,
   compatibility, migration constraints, or documented guarantees, invoke the
   docs agent with dependency, ecosystem, version, precise question, and decision.
   Establish repository fit from local code and focused checks; establish
   maintenance status from release and repository activity. Mark unsupported
   claims as uncertainty, identifying any that could change the decision.

5. **Decide.** Select exactly one direction:

   - **ADOPT** — an existing implementation, platform/framework feature, or
     dependency provides the capability directly.
   - **WRAP** — an existing option provides the commodity core; a thin adapter
     supplies the product-specific boundary.
   - **BUILD** — the requirement gaps or adoption costs justify custom code.

   Weigh requirement and repository fit against maintenance, dependency,
   security, compatibility, reversibility, lock-in, and operational costs.
   If a decision-changing uncertainty remains, resolve it with a focused check
   or label the direction provisional and name the check needed to settle it.

6. **Reduce scope.** For a settled ADOPT or WRAP decision, update the plan until
   every superseded custom task is removed or narrowed to necessary integration,
   adapter, migration, configuration, tests, or verification work.

7. **Record.** State the direction and selected option, decisive evidence,
   materially viable alternatives rejected (if any), remaining uncertainty,
   and resulting scope changes. Link evidence so the decision is checkable.
