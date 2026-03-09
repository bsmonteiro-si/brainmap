---
id: "a0000001-0000-0000-0000-000000000017"
title: "The Ladder of Causation"
type: concept
tags: [causality, hierarchy, reasoning, association, intervention, counterfactuals]
status: review
created: 2026-01-20
modified: 2026-03-01
source: "The Book of Why, Ch1"
summary: >-
  Pearl's three-rung hierarchy of causal reasoning: Association (seeing),
  Intervention (doing), and Counterfactuals (imagining). Each rung represents
  a qualitatively different cognitive and mathematical capability.
links:
  - target: "./Seeing vs Doing.md"
    type: contains
  - target: "./Counterfactual Reasoning.md"
    type: contains
  - target: "../Arguments/Causal Reasoning is Formalizable.md"
    type: related-to
domain: causal-ml
maturity: foundational
aliases: [ladder of causation, causal hierarchy, three levels of causation]
---

# The Ladder of Causation

The Ladder of Causation is Pearl's central organizing metaphor for understanding different levels of causal reasoning. It classifies causal questions into three qualitatively distinct rungs, each requiring more sophisticated cognitive and mathematical machinery than the one below.

## Rung 1: Association (Seeing)

The first rung deals with observational questions: "What is?" and "How are X and Y related?" At this level, one detects patterns, correlations, and conditional probabilities. Most current machine learning operates exclusively at this level. The typical question is P(Y|X) — what is the probability of Y given that we observe X?

## Rung 2: Intervention (Doing)

The second rung deals with interventional questions: "What will happen if I do X?" This requires the do-operator and distinguishes between seeing and doing. The key question is P(Y|do(X)), which cannot be answered from observational data alone without a causal model. Randomized controlled trials operate at this rung by physically implementing the do-operator through randomization.

## Rung 3: Counterfactuals (Imagining)

The third and highest rung deals with retrospective, hypothetical questions: "What would have happened if I had done things differently?" These questions require the most sophisticated causal machinery — structural causal models with fully specified functional relationships. Counterfactual reasoning is essential for attribution, explanation, and moral judgment. No purely data-driven system can reach this rung without an explicit causal model.
