---
id: "a0000001-0000-0000-0000-000000000008"
title: "Ch7 - The Conquest of Mount Intervention"
type: book-note
tags: [causality, do-calculus, intervention, completeness]
status: draft
created: 2026-02-05
modified: 2026-02-20
source: "The Book of Why, Chapter 7"
summary: >-
  Presents the do-calculus as a complete system for computing interventional
  distributions from observational data. Demonstrates how the three rules
  of do-calculus can determine any identifiable causal effect.
links:
  - target: "../../Concepts/Do-Calculus.md"
    type: contains
chapter: "7"
page-range: "219-252"
---

# Ch7 - The Conquest of Mount Intervention

Pearl presents the do-calculus as the crowning achievement of the Causal Revolution. The central problem is deceptively simple: given a causal diagram and observational data, can we compute the effect of an intervention — P(Y | do(X)) — without actually performing the intervention? The do-calculus provides three rules that, together, form a complete system for answering this question.

The three rules of do-calculus govern when observations can substitute for interventions. Rule 1 deals with adding or removing observations, Rule 2 with exchanging interventions and observations, and Rule 3 with adding or removing interventions. Each rule has a graphical criterion that can be checked mechanically against the causal diagram. The completeness result, proved by Ilya Shpitser and Pearl in 2006, shows that if a causal effect can be identified from observational data at all, the three rules are sufficient to derive the formula.

The practical significance is profound. Many causal questions arise in contexts where experimentation is impossible, unethical, or prohibitively expensive. The do-calculus provides a principled way to extract causal answers from observational data whenever the causal structure permits it, and to determine conclusively when it does not. This transforms causal inference from an art requiring domain-specific tricks into a systematic, algorithmically solvable problem.
