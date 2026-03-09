---
id: "a0000001-0000-0000-0000-00000000001c"
title: "Granger Causality"
type: concept
tags: [causality, time-series, econometrics, statistics]
status: draft
created: 2026-03-01
modified: 2026-03-09
source: "General knowledge; not directly from The Book of Why"
summary: >-
  A statistical test for whether one time series is useful in forecasting
  another. Despite its name, Granger causality measures predictive precedence,
  not true causation in Pearl's sense.
links: []
domain: econometrics
maturity: established
aliases: [Granger test, predictive causality]
---

# Granger Causality

Granger causality (Clive Granger, 1969) is a statistical concept for testing whether one time series helps predict another. Despite its name, it does not establish causation in the interventionist sense used by Pearl.

## Definition

A time series X "Granger-causes" Y if past values of X contain information that helps predict Y beyond what past values of Y alone provide.

## Limitations

Granger causality is purely predictive — it measures temporal precedence and correlation, not intervention. Pearl and others have shown that Granger causality can be misleading when confounders exist or when the true causal structure involves contemporaneous effects.

## Relevance

Granger causality is widely used in economics and neuroscience as a practical tool, but it occupies rung 1 (Association) of the Ladder of Causation, not rung 2 (Intervention). It is a useful statistical tool that should not be confused with genuine causal inference.
