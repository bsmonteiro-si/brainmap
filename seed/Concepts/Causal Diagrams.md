---
id: "a0000001-0000-0000-0000-000000000013"
title: "Causal Diagrams"
type: concept
tags: [causality, dag, graphs, visualization, formalization]
status: review
created: 2026-01-20
modified: 2026-03-01
source: "The Book of Why, Introduction + Ch1"
summary: >-
  Directed acyclic graphs (DAGs) used to encode causal assumptions about
  a system. Each node represents a variable, each arrow a direct causal
  influence, and the absence of an arrow asserts no direct effect.
links:
  - target: "./Causal Inference.md"
    type: part-of
  - target: "./Bayesian Networks.md"
    type: related-to
domain: causal-ml
maturity: foundational
aliases: [causal DAGs, causal graphs, directed acyclic graphs]
---

# Causal Diagrams

Causal diagrams are directed acyclic graphs (DAGs) that encode assumptions about causal relationships in a system. Each node represents a variable, each directed edge (arrow) represents a direct causal influence from one variable to another, and the absence of an arrow between two variables asserts that no direct causal path exists between them.

## Encoding Assumptions

A causal diagram is not derived from data — it is drawn from domain knowledge, scientific understanding, or explicit assumptions. The diagram represents what the researcher believes (or hypothesizes) about the causal structure of the system under study. This is a feature, not a limitation: making assumptions explicit and testable is a core contribution of the causal inference framework.

## Graphical Criteria

The structure of a causal diagram enables powerful graphical criteria for answering causal questions. The back-door criterion identifies sufficient adjustment sets for deconfounding. The front-door criterion provides an alternative identification strategy when back-door adjustment is impossible. D-separation reads conditional independence relations directly from the graph structure.

## From Bayesian Networks to Causal Diagrams

Causal diagrams evolved from Bayesian networks, which Pearl developed in the 1980s. While Bayesian networks encode probabilistic relationships and enable efficient inference, causal diagrams add causal semantics — the arrows represent not just statistical dependencies but directional causal influences. This seemingly small addition enables entirely new types of reasoning: interventions, counterfactuals, and the full machinery of the do-calculus.
