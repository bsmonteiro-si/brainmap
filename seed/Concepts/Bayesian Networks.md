---
id: "a0000001-0000-0000-0000-000000000018"
title: "Bayesian Networks"
type: concept
tags: [ai, probability, graphical-models, pearl, reasoning]
status: review
created: 2026-01-25
modified: 2026-03-01
source: "The Book of Why, Ch3"
summary: >-
  Probabilistic graphical models developed by Pearl in the 1980s that
  use directed acyclic graphs to represent conditional independence
  relationships and enable efficient probabilistic inference.
links:
  - target: "./Causal Diagrams.md"
    type: precedes
domain: ai
maturity: established
aliases: [belief networks, probabilistic graphical models, Bayes nets]
---

# Bayesian Networks

Bayesian networks are probabilistic graphical models that represent a set of variables and their conditional dependencies using a directed acyclic graph (DAG). Developed by Judea Pearl in the 1980s, they revolutionized artificial intelligence by providing a principled and computationally efficient framework for reasoning under uncertainty.

## Structure and Semantics

In a Bayesian network, each node represents a random variable, and each directed edge represents a direct probabilistic dependency. The key property is the Markov condition: each variable is conditionally independent of its non-descendants given its parents. This allows the joint probability distribution over all variables to be decomposed into a product of local conditional distributions, one for each node given its parents.

## Computational Advantages

Before Bayesian networks, probabilistic reasoning in AI was intractable for realistic problems. The graph structure enables message-passing algorithms that perform exact or approximate inference efficiently by exploiting conditional independencies. Pearl's own algorithm for belief propagation in tree-structured networks was a landmark result.

## From Probabilistic to Causal

Bayesian networks represent statistical relationships but do not inherently encode causal direction. The same graph can be consistent with multiple causal interpretations. Pearl's later work added causal semantics — interpreting arrows as causal influences — transforming Bayesian networks into causal diagrams capable of supporting interventional and counterfactual reasoning. This evolution from probabilistic to causal graphical models is a central narrative in The Book of Why.
