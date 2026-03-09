---
id: "a0000001-0000-0000-0000-000000000019"
title: "Potential Outcomes Framework"
type: concept
tags: [causality, rubin, statistics, potential-outcomes, counterfactuals]
status: review
created: 2026-02-10
modified: 2026-03-01
source: "The Book of Why, Ch8 + general literature"
summary: >-
  Donald Rubin's framework for causal inference based on potential outcomes
  (what would happen under each possible treatment). An alternative to Pearl's
  graphical approach, widely used in statistics and economics.
links:
  - target: "./Causal Inference.md"
    type: related-to
  - target: "./Do-Calculus.md"
    type: contradicts
domain: statistics
maturity: established
aliases: [Rubin causal model, Neyman-Rubin framework, potential outcomes]
---

# Potential Outcomes Framework

The Potential Outcomes Framework, developed primarily by Donald Rubin (building on earlier work by Jerzy Neyman), defines causal effects in terms of potential outcomes: for each unit, there exists a potential outcome under each possible treatment. The causal effect is the difference between these potential outcomes.

## The Fundamental Problem

The fundamental problem of causal inference, in this framework, is that for any individual unit we can observe at most one potential outcome — the one corresponding to the treatment actually received. The counterfactual outcome (what would have happened under the alternative treatment) is inherently unobservable. Causal inference therefore reduces to a missing data problem.

## Comparison with Pearl's Framework

The potential outcomes framework and Pearl's graphical framework are mathematically compatible but differ in emphasis and methodology. Pearl's approach foregrounds causal assumptions through explicit DAGs, making them transparent and testable. The potential outcomes approach works with assignment mechanisms and focuses on estimating average treatment effects, often without explicitly drawing a causal diagram. Pearl has argued that his framework is more general: every SCM defines potential outcomes, but potential outcomes alone do not specify the causal mechanisms needed for some types of reasoning.

## Applications

The potential outcomes framework is widely used in economics (Angrist, Imbens), biostatistics, and political science. Methods like instrumental variables, regression discontinuity, and propensity score matching are naturally expressed in potential outcomes language. The framework's strength lies in its close connection to experimental design and its emphasis on clearly defining the causal estimand before estimation.
