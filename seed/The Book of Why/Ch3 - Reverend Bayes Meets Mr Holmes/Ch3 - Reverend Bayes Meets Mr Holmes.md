---
id: a0000001-0000-0000-0000-000000000006
title: Ch3 - Reverend Bayes Meets Mr Holmes
type: book-note
tags:
- causality
- bayesian-networks
- probability
- reasoning
status: draft
created: 2026-01-25
modified: 2026-03-13
source: The Book of Why, Chapter 3
summary: Introduces Bayesian reasoning and Bayesian networks as the foundation for probabilistic inference, showing how they connect to causal reasoning while also revealing their limitations without causal interpretation.
links:
- target: ../../Concepts/Bayesian Networks.md
  type: contains
chapter: '3'
page-range: 81-112
---

# Ch3 - Reverend Bayes Meets Mr Holmes

Pearl explores the connection between Bayesian reasoning and causal inference through the lens of his own contributions to artificial intelligence. Bayes' theorem, formulated by Reverend Thomas Bayes in the 18th century, provides a principled way to update beliefs in light of new evidence. Pearl's key insight was that Bayesian networks could make this updating computationally tractable by encoding the structure of probabilistic relationships in a directed graph.

The chapter illustrates Bayesian reasoning through vivid examples, including a burglar alarm scenario that became a classic in AI textbooks. If your alarm goes off and your neighbor calls to tell you, how should you update your beliefs about whether a burglary occurred versus an earthquake triggering the alarm? Bayesian networks provide an elegant framework for propagating evidence through chains of reasoning, handling multiple uncertain causes simultaneously.

However, Pearl is careful to distinguish between Bayesian networks as tools for probabilistic inference and the causal interpretation he later gave them. A Bayesian network encodes conditional independencies and allows efficient computation of probabilities, but it does not inherently represent causal direction. The same graph structure can represent different causal stories. It was only by adding causal semantics — interpreting arrows as causal influences rather than mere statistical associations — that Pearl transformed Bayesian networks into the foundation for his causal revolution.

[!ai-answer] {

}