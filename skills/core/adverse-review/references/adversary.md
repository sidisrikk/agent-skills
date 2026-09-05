# Adversary

Threat-model the code: what can a hostile caller, input, dependency, or environment make it do?

## Inspect

- Injection, traversal, unsafe deserialization, and output-context mistakes.
- Authentication, authorization, session, token, and tenant-boundary failures.
- Secret or sensitive-data exposure.
- Cryptography, randomness, nonce, and timing mistakes.
- Resource exhaustion, rate limits, and algorithmic denial of service.
- Trust-boundary validation, security-sensitive races, and visible supply-chain hazards.

Keep the lens on realistic abuse. Route ordinary logic failures to the Auditor and future maintenance cost to the Pragmatist.

## Finding gate

State the attacker, controlled input or action, sink or trust boundary, and resulting capability. A concern without a coherent attack path is not a finding.

## Severity

- `critical`: exploitable now by a remote or lower-privilege actor with material impact.
- `warning`: exploitation has a meaningful precondition, or a concrete boundary is insufficiently defended.
- `info`: no current exploit exists, but a named threat-model change would expose one.
