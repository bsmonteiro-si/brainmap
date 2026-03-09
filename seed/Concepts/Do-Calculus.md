---
id: "a0000001-0000-0000-0000-000000000011"
title: "Do-Calculus"
type: concept
tags: [causality, do-operator, intervention, formalization]
status: review
created: 2026-02-05
modified: 2026-03-01
source: "The Book of Why, Ch7"
summary: >-
  A complete set of three rules for computing interventional distributions
  P(Y|do(X)) from observational data P(Y|X), given a causal diagram. Developed
  by Pearl in 1995, with completeness proved in 2006.
links:
  - target: "./Structural Causal Models.md"
    type: extends
  - target: "./Causal Diagrams.md"
    type: depends-on
domain: causal-ml
maturity: foundational
aliases: [do calculus, calculus of interventions]
---

# Do-Calculus

The do-calculus is a set of three inference rules developed by Judea Pearl in 1995 that provide a complete method for computing the effects of interventions from observational data. Given a causal diagram and observational distributions, the do-calculus can determine whether a causal effect P(Y|do(X)) is identifiable and, if so, derive the formula to compute it from non-interventional data.

## The Three Rules

Each rule specifies conditions under which certain transformations of probability expressions involving the do-operator are valid. The conditions are expressed as graphical criteria on the causal diagram, making them mechanically verifiable:

1. **Rule 1 (Insertion/deletion of observations)** — allows adding or removing conditioning variables when they are irrelevant given the intervention
2. **Rule 2 (Action/observation exchange)** — allows replacing an observation with an intervention (or vice versa) when the causal diagram warrants it
3. **Rule 3 (Insertion/deletion of actions)** — allows adding or removing interventions when they have no effect on the outcome given the diagram

## Completeness

In 2006, Ilya Shpitser and Pearl proved that the do-calculus is complete: if a causal effect can be identified from observational data given a causal diagram, the three rules are sufficient to derive the identifying formula. This means there is no causal effect that is identifiable but unreachable by the do-calculus.

## Practical Significance

The do-calculus transforms causal inference from an art requiring domain-specific tricks into a systematic procedure. Algorithms based on the do-calculus can automatically determine identifiability and derive estimands, removing the need for case-by-case ingenuity.
