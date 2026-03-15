---
id: a0000001-0000-0000-0000-000000000002
title: Introduction - Mind Over Data
type: book-note
tags:
- causality
- introduction
- causal-inference
- do-calculus
status: review
created: 2026-01-20
modified: 2026-03-15
source: The Book of Why, Introduction
summary: Introduces causal inference as the science studying cause-and-effect using causal models, formal language, and data. Presents the do-operator and the key distinction between seeing and doing.
links:
- target: ../../Concepts/Causal Inference.md
  type: contains
- target: ../../Concepts/Seeing vs Doing.md
  type: contains
- target: ../../Concepts/Do-Calculus.md
  type: contains
- target: ../../Concepts/Causal Diagrams.md
  type: contains
- target: ../../Concepts/Counterfactual Reasoning.md
  type: contains
- target: ../../Questions/Can Machines Think Causally.md
  type: leads-to
page-range: 1-38
chapter: Introduction
---

# Introduction - Mind Over Data

What is causal inference? The science that studies cause-and-effect relationships using a combination of a causal model, a formal language and data. It addresses seemingly straightforward questions like:

- How effective is a given treatment in preventing a disease?
- Did the new tax law cause our sales to go up, or was it our advertising campaign?
- What is the health-care cost attributable to obesity?
- Can hiring records prove an employer is guilty of a policy of sex discrimination?
- I'm about to quit my job. Should I?

These questions share a concern with cause-and-effect relationships, recognizable through words such as "preventing," "cause," "attributable to," "policy," and "should I."

## The Calculus of Causation

The calculus of causation consists of two languages: causal diagrams, to express what we know, and a symbolic language, resembling algebra, to express what we want to know.

Causal diagrams are dot-and-arrow pictures (directed acyclic graphs — DAGs) that summarize existing scientific knowledge.

## Seeing vs Doing

Probably the biggest insight the Causal Revolution introduces is the distinction between seeing and doing.

**Seeing**: P(L | D) — plain conditional probability.
**Doing**: P(L | do(D)) — something fundamentally different. You intervene, forcing the drug into someone's body regardless of who they are.

## Implications for AI

Pearl's background in machine learning gave him another incentive for studying causation. A causal reasoning module would give machines the ability to reflect on their mistakes, pinpoint weaknesses in their software, function as moral entities.
  