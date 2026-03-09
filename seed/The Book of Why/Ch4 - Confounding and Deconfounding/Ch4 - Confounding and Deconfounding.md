---
id: "a0000001-0000-0000-0000-000000000007"
title: "Ch4 - Confounding and Deconfounding"
type: book-note
tags: [causality, confounding, simpsons-paradox, statistics]
status: draft
created: 2026-01-28
modified: 2026-02-15
source: "The Book of Why, Chapter 4"
summary: >-
  Explores the confounding problem and Simpson's paradox as central
  challenges in causal inference, showing how causal diagrams resolve
  ambiguities that purely statistical approaches cannot.
links:
  - target: "../../Concepts/Confounding.md"
    type: contains
  - target: "../../Concepts/Simpsons Paradox.md"
    type: contains
chapter: "4"
page-range: "135-170"
---

# Ch4 - Confounding and Deconfounding

Confounding is perhaps the most important obstacle to drawing causal conclusions from observational data. A confounder is a variable that influences both the treatment and the outcome, creating a spurious association that can mislead researchers into seeing causal effects where none exist or missing real effects hidden beneath statistical noise.

Pearl uses Simpson's paradox as the central example of how confounding can produce deeply counterintuitive results. In Simpson's paradox, a trend that appears in several subgroups of data reverses when the groups are combined. The classic example involves a treatment that appears beneficial in every subgroup (men and women separately) but appears harmful when the data is aggregated. Without a causal model, there is no principled way to decide whether to aggregate or stratify — both are legitimate statistical operations, but they yield opposite conclusions.

The resolution requires thinking causally. A causal diagram specifies the relationships between treatment, outcome, and potential confounders. Given such a diagram, the back-door criterion provides an algorithmic test for whether a set of variables is sufficient to deconfound the relationship of interest. This transforms the question from a philosophical puzzle into a mechanical procedure: draw the diagram, apply the criterion, and either adjust for the right variables or conclude that the causal effect is not identifiable from the available data.
