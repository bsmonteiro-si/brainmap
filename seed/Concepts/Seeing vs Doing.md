---
id: "a0000001-0000-0000-0000-00000000001b"
title: "Seeing vs Doing"
type: concept
tags: [causality, do-operator, intervention, observation, foundations]
status: review
created: 2026-02-05
modified: 2026-02-28
source: "The Book of Why, Introduction"
summary: >-
  The fundamental distinction between observational conditioning P(Y|X)
  and interventional conditioning P(Y|do(X)), which separates causal
  inference from traditional statistics.
links:
  - target: "./Do-Calculus.md"
    type: leads-to
  - target: "./Randomized Controlled Trials.md"
    type: related-to
  - target: "./Confounding.md"
    type: related-to
  - target: "./The Ladder of Causation.md"
    type: part-of
domain: causal-ml
maturity: foundational
aliases: [observation vs intervention, seeing versus doing]
---

# Seeing vs Doing

The distinction between *seeing* and *doing* is arguably the most important insight of the Causal Revolution. It separates causal inference from traditional statistics at a fundamental level.

## Seeing: P(Y | X)

Plain conditional probability. You observe the world passively and filter by what you see.

"Among all the people I observed taking the drug, how long did they live?"

The problem: when you merely observe, you're seeing a world where people *chose* to take the drug. Their choice is not random — it's driven by other factors:
- Maybe sicker people are more desperate and take the drug more
- Maybe wealthier people have access to the drug and also have better healthcare

The data you observe is contaminated by all the reasons people ended up in the treatment group. This is the problem of [confounding](./Confounding.md).

## Doing: P(Y | do(X))

Something fundamentally different. You *intervene* — you force the drug into someone's body regardless of who they are, how sick they are, or how wealthy they are. You've severed the connection between the drug and all the reasons someone would normally take it.

This is exactly what a [randomized controlled trial](./Randomized Controlled Trials.md) does: a coin flip decides who takes the drug, not the patient's condition or choice.

## Why It Matters

The [do-calculus](./Do-Calculus.md) provides rules for converting `do(X)` expressions into ordinary conditional probabilities — effectively computing interventional quantities from observational data alone, when the causal structure permits it.

This is one of the crowning achievements of the Causal Revolution: predicting the effects of an intervention without actually enacting it, through noninvasive means.

## On the Ladder of Causation

Seeing occupies rung 1 (Association). Doing occupies rung 2 (Intervention). The distinction maps directly to [The Ladder of Causation](./The Ladder of Causation.md), Pearl's hierarchy of causal reasoning capabilities.
