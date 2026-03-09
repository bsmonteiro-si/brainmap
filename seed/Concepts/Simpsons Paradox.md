---
id: "a0000001-0000-0000-0000-000000000015"
title: "Simpson's Paradox"
type: concept
tags: [causality, paradox, statistics, confounding]
status: review
created: 2026-01-30
modified: 2026-03-01
source: "The Book of Why, Ch4"
summary: >-
  A statistical phenomenon where a trend that appears in several subgroups
  of data reverses when the groups are combined. Resolution requires causal
  reasoning — no purely statistical criterion can determine the correct action.
links:
  - target: "./Confounding.md"
    type: exemplifies
  - target: "../The Book of Why/Ch4 - Confounding and Deconfounding/Ch4 - Confounding and Deconfounding.md"
    type: sourced-from
domain: statistics
maturity: established
aliases: [Simpson paradox, amalgamation paradox]
---

# Simpson's Paradox

Simpson's paradox occurs when a statistical trend observed in several subgroups of data reverses or disappears when the groups are combined. It is not merely a curiosity but a fundamental demonstration of why causal reasoning is necessary — no amount of statistical sophistication can resolve the paradox without a causal model.

## The Classic Example

Consider a treatment that improves outcomes in both men and women separately, but appears to worsen outcomes in the combined population. This can happen when the treatment is administered disproportionately to one group that already has worse outcomes. The aggregate data conflates the treatment effect with the group composition effect.

## Why Statistics Alone Fails

The paradox reveals that the decision to aggregate or stratify data is not a statistical question — it is a causal one. Both the aggregated and stratified analyses are mathematically correct descriptions of the data. The question "which analysis answers our causal question?" can only be answered by understanding the causal structure: is the stratifying variable a confounder (adjust for it) or a mediator (do not adjust)?

## Pearl's Resolution

Pearl showed that Simpson's paradox dissolves once you specify a causal diagram. The diagram makes explicit whether the stratifying variable lies on a back-door path (confounder) or a causal path (mediator), and the correct analysis follows mechanically from the diagram structure.
