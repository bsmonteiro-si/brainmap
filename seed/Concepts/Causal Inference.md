---
id: a0000001-0000-0000-0000-000000000010
title: Causal Inference
type: concept
status: archived
created: 2026-01-18
modified: 2026-03-14
source: The Book of Why, Introduction + Ch1
summary: The science of drawing conclusions about causal relationships from data and assumptions, formalized through causal models, the do-calculus, and counterfactual reasoning.
links:
- target: ./Do-Calculus.md
  type: contains
- target: ./Structural Causal Models.md
  type: contains
- target: ./Counterfactual Reasoning.md
  type: contains
- target: ./Causal Diagrams.md
  type: contains
- target: ./Confounding.md
  type: related-to
- target: ./Potential Outcomes Framework.md
  type: related-to
- target: ../People/Judea Pearl.md
  type: authored-by
- target: "Personal::Notes/Applied Causal Inference.md"
  type: related-to
aliases:
- causal analysis
- causal reasoning
maturity: foundational
domain: causal-ml
---

# Causal Inference

Causal inference is the science of drawing conclusions about cause-and-effect relationships. It goes beyond correlation (statistical association) to determine whether and how one variable actually influences another.

## The Core Problem

Statistics alone cannot answer causal questions. "Correlation is not causation" was used more as a stop sign than a starting point for centuries. Before Pearl's formalization, there was no systematic way to say *when* correlation **does** imply causation.

## The Inference Engine

Pearl proposes a general framework — the "inference engine" — that accepts three inputs:

1. **Assumptions** — encoded as a causal model (a DAG)
2. **Queries** — the causal question we want answered
3. **Data** — observations from the real world

And produces three outputs:

1. **Identifiability** — can this question be answered given our assumptions? (Yes/No)
2. **Estimand** — if yes, a mathematical recipe for the answer
3. **Estimate** — the actual numerical answer with uncertainty bounds

A fundamental insight: data is collected *after* the causal model and query are specified, not before. This inverts the typical data-first approach of machine learning.

## Historical Context

Before Pearl's work, causal inference was fragmented:
- **Statisticians** had tools (regression, randomized trials) but avoided causal language
- **Economists** (Heckman, Angrist) developed instrumental variables and other techniques, but these were domain-specific without unifying theory
- **Epidemiologists** used qualitative checklists like Bradford Hill's criteria

Pearl's contribution was a unified mathematical foundation: DAGs as formal language for assumptions, do-calculus as the algebra for interventions, and the inference engine as the algorithmic pipeline.

## Adoption

The framework is now mainstream in academia and growing in industry:
- **AI/ML research** — DAGs and do-calculus are standard language
- **Epidemiology** — causal diagrams standard in observational study design
- **Tech industry** — Microsoft (DoWhy/EconML), Uber (CausalML), Netflix built toolkits around it

It coexists with the [Potential Outcomes Framework](./Potential Outcomes Framework.md), which achieves similar goals with different formalism (the "Pearl vs. Rubin" divide).
