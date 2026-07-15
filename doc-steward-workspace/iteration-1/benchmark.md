# Skill Benchmark: doc-steward

**Model**: <model-name>
**Date**: 2026-07-15T17:37:15Z
**Evals**: 0, 1, 2, 3, 4 (3 runs each per configuration)

## Summary

| Metric | With Skill | Without Skill | Delta |
|--------|------------|---------------|-------|
| Pass Rate | 100% ± 0% | 45% ± 45% | +0.55 |
| Time | 79.5s ± 15.3s | 78.1s ± 22.7s | +1.4s |
| Tokens | 41668 ± 1224 | 37559 ± 1686 | +4109 |
## Analyst notes

- The delta comes entirely from behavior-shaping evals: refusal-rename (0/2 baseline), artifact-existence (0/2 baseline), nit-padding on a clean diff (clean-scan 1/2), and documenting a self-evident helper (write-jsdoc 3/4). These are exactly the failure modes the skill was built for.
- seeded-scan is non-discriminating (4/4 both): baseline Claude already catches planted doc flaws. Keep it as a regression guard, not as evidence of lift.
- Cost of the skill: +4,109 tokens (~11%) per run; wall time roughly equal (79.5s vs 78.1s).
- One run per configuration — stddev is not meaningful this iteration.
