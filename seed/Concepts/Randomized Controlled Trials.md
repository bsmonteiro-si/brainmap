---
id: "a0000001-0000-0000-0000-000000000016"
title: "Randomized Controlled Trials"
type: concept
tags: [causality, methodology, rct, experimentation, fisher]
status: review
created: 2026-02-03
modified: 2026-03-01
source: "The Book of Why, Ch2 + Ch4"
summary: >-
  The gold standard for establishing causal effects through randomization.
  By randomly assigning treatment, RCTs sever confounding paths and enable
  direct estimation of causal effects.
links:
  - target: "./Seeing vs Doing.md"
    type: related-to
  - target: "./Confounding.md"
    type: related-to
  - target: "../People/Ronald Fisher.md"
    type: related-to
domain: methodology
maturity: established
aliases: [RCTs, randomized trials, randomized experiments]
---

# Randomized Controlled Trials

Randomized controlled trials (RCTs) are the gold standard methodology for establishing causal effects. By randomly assigning subjects to treatment and control groups, RCTs ensure that the groups are statistically equivalent on all variables — observed and unobserved — thereby eliminating confounding by design.

## Mechanism

Randomization works by severing the causal connection between any confounders and the treatment assignment. When a coin flip determines who receives the drug, the treatment is independent of the patient's health status, socioeconomic background, or any other variable. This means the only systematic difference between groups is the treatment itself, and any observed difference in outcomes can be attributed to the treatment's causal effect.

## Limitations

Despite their power, RCTs are not always feasible. Ethical constraints prevent randomizing harmful exposures (you cannot randomly assign people to smoke). Practical constraints limit the scope of randomization (you cannot randomly assign countries to economic policies). Cost and time constraints make large-scale RCTs prohibitively expensive for many questions. These limitations motivate the development of methods for causal inference from observational data.

## Historical Context

Ronald Fisher introduced the concept of randomized experimentation in the 1920s at Rothamsted Experimental Station. Paradoxically, despite inventing RCTs as a causal tool, Fisher resisted formal causal language in statistics and famously argued against the causal link between smoking and lung cancer, demonstrating the consequences of lacking a formal framework for causal reasoning.
