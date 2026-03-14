---
id: a0000001-0000-0000-0000-000000000031
title: Smoking and Lung Cancer Studies
type: evidence
tags:
- epidemiology
- smoking
- causality
- history
status: draft
created: 2026-02-12
modified: 2026-03-14
source: The Book of Why, Ch4 + Ch7
summary: The epidemiological evidence linking smoking to lung cancer — a landmark case in the history of causal inference, where the lack of formal causal tools delayed scientific consensus for decades.
links:
- target: ../Arguments/Causal Reasoning is Formalizable.md
  type: supports
- target: ../People/Ronald Fisher.md
  type: related-to
- target: ../Concepts/Confounding.md
  type: related-to
- target: ../Concepts/Randomized Controlled Trials.md
  type: related-to
domain: epidemiology
strength: strong
evidence-type: observational
---

# Smoking and Lung Cancer Studies

The debate over whether smoking causes lung cancer is one of the most consequential episodes in the history of causal inference. It illustrates both the power and the limitations of pre-Pearl causal reasoning.

## The Evidence

By the 1950s, overwhelming observational data showed a strong association between smoking and lung cancer:
- Doll and Hill's British Doctors Study (1951-2001)
- The US Surgeon General's report (1964)
- Dozens of cohort and case-control studies across multiple countries

## The Causal Edge: Smoking → Lung Cancer

The relationship between smoking and lung cancer is a canonical example of a `causes` edge: smoking directly increases the probability of developing lung cancer through biological mechanisms (tar deposits, DNA mutations, chronic inflammation).

## The Controversy

Ronald Fisher — one of the greatest statisticians of the 20th century — argued that the association could be explained by a confounding variable (a genetic predisposition that causes both the desire to smoke and susceptibility to cancer). Without formal causal tools, this objection could not be rigorously refuted.

## Resolution

Pearl shows that with a properly specified causal diagram, the confounding objection can be formally evaluated and, in this case, dismissed. The do-calculus provides the mathematical machinery to determine when observational data is sufficient to establish causation.
