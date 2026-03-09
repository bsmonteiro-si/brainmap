---
id: "a0000001-0000-0000-0000-000000000012"
title: "Structural Causal Models"
type: concept
tags: [causality, scm, structural-equations, formalization]
status: review
created: 2026-02-08
modified: 2026-03-01
source: "The Book of Why, Ch1 + Ch7 + Ch8"
summary: >-
  A unified mathematical framework combining structural equations with
  graphical models, providing the backbone for causal reasoning, interventions,
  and counterfactual analysis.
links:
  - target: "./Do-Calculus.md"
    type: contains
  - target: "./Bayesian Networks.md"
    type: extends
domain: causal-ml
maturity: foundational
aliases: [SCM, structural equation models, causal models]
---

# Structural Causal Models

Structural Causal Models (SCMs) are the mathematical backbone of Pearl's causal inference framework. An SCM consists of three components: a set of exogenous (external) variables, a set of endogenous (internal) variables, and a set of structural equations that determine each endogenous variable as a function of other variables.

## Structure and Semantics

Unlike traditional statistical models, structural equations carry causal meaning. The equation Y = f(X, U) does not merely assert a statistical relationship — it claims that Y is determined by X and U through the mechanism f. This asymmetry is crucial: the equation tells you that changing X will change Y (through f), but changing Y will not change X.

## Unifying Framework

SCMs unify three levels of causal reasoning. At the associational level, the model implies a joint probability distribution that can be compared with observational data. At the interventional level, the do-operator is defined by modifying structural equations — "do(X=x)" means replacing the equation for X with the constant x, severing all incoming causal influences. At the counterfactual level, the model supports reasoning about alternative scenarios by fixing exogenous variables and modifying selected equations.

## Relationship to Other Frameworks

SCMs extend Bayesian networks by adding causal semantics to the directed graph and providing formal definitions for interventions and counterfactuals. They also subsume the Potential Outcomes Framework: every SCM defines a set of potential outcomes, though the reverse is not always true. This makes SCMs the most general framework for causal reasoning currently available.
