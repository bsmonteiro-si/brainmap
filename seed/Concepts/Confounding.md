---
id: "a0000001-0000-0000-0000-000000000014"
title: "Confounding"
type: concept
tags: [causality, confounding, bias, statistics]
status: review
created: 2026-01-28
modified: 2026-03-01
source: "The Book of Why, Ch4"
summary: >-
  The phenomenon where a third variable influences both treatment and outcome,
  creating a spurious association that can mislead causal conclusions. Central
  obstacle in observational studies, resolved through causal diagrams.
links:
  - target: "./Seeing vs Doing.md"
    type: related-to
  - target: "./Randomized Controlled Trials.md"
    type: related-to
domain: causal-ml
maturity: foundational
aliases: [confounders, confounding bias, spurious association]
---

# Confounding

Confounding occurs when a third variable (the confounder) causally influences both the treatment and the outcome under study, creating a non-causal path between them. This spurious association can lead to incorrect conclusions: a treatment may appear effective when it is not, or harmful when it is actually beneficial.

## The Problem

In observational studies, treatment assignment is not random. People who take a drug may differ systematically from those who do not — they may be sicker, wealthier, or more health-conscious. These differences can create associations between treatment and outcome that have nothing to do with the treatment's actual effect. Without accounting for confounders, any observed association is a mixture of causal effect and spurious correlation.

## Resolution Through Causal Diagrams

Pearl's back-door criterion provides a graphical test for identifying which variables must be controlled to eliminate confounding. Given a causal diagram, the criterion can be checked mechanically: if a set of variables blocks all back-door paths from treatment to outcome, adjusting for those variables eliminates confounding. This transforms confounding from a vague concern into a precise, algorithmically solvable problem.

## Relationship to Randomization

Randomized controlled trials solve confounding by design: random assignment ensures that treatment groups are balanced on all variables, observed and unobserved. The do-calculus extends this logic to observational settings, providing conditions under which observational data can achieve the same deconfounding as randomization.
