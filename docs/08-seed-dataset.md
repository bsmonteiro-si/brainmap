# BrainMap — Seed Dataset Specification

## Purpose

A reference dataset of ~33-35 notes based on "The Book of Why" by Judea Pearl, expanded with full realistic content. This dataset serves as:

1. **Implementation reference** — real data to build and test against
2. **Schema validation** — proves the frontmatter spec, edge types, and hybrid structure work
3. **UI development** — diverse node types, edge types, and graph topology for testing visualization
4. **CLI/MCP testing** — real queries to run (paths, neighborhoods, search)
5. **Negative testing** — deliberate broken links, orphan nodes, and federation stubs for validation testing

## Source Material

- **Book**: "The Book of Why: The New Science of Cause and Effect" by Judea Pearl & Dana Mackenzie (2018)
- **Existing notes**: User's personal notes on the Introduction and "A Blueprint of Reality" section
- **Structure**: 10 chapters covering the history, theory, and applications of causal inference

## Directory Structure

```
seed-dataset/
├── .brainmap/
│   └── config.yaml
├── The Book of Why/
│   ├── The Book of Why.md                          (index)
│   ├── Introduction - Mind Over Data/
│   │   ├── Introduction - Mind Over Data.md        (book-note)
│   │   └── A Blueprint of Reality/
│   │       └── A Blueprint of Reality.md           (book-note)
│   ├── Ch1 - The Ladder of Causation/
│   │   └── Ch1 - The Ladder of Causation.md        (book-note)
│   ├── Ch2 - Genesis of Causal Inference/
│   │   └── Ch2 - Genesis of Causal Inference.md    (book-note)
│   ├── Ch3 - Reverend Bayes Meets Mr Holmes/
│   │   └── Ch3 - Reverend Bayes Meets Mr Holmes.md (book-note)
│   ├── Ch4 - Confounding and Deconfounding/
│   │   └── Ch4 - Confounding and Deconfounding.md  (book-note)
│   ├── Ch7 - The Conquest of Mount Intervention/
│   │   └── Ch7 - The Conquest of Mount Intervention.md (book-note)
│   ├── Ch8 - Counterfactuals/
│   │   └── Ch8 - Counterfactuals.md                (book-note)
│   └── Ch10 - Big Data AI and the Big Questions/
│       └── Ch10 - Big Data AI and the Big Questions.md (book-note)
├── Concepts/
│   ├── Causal Inference.md                         (concept)
│   ├── Counterfactual Reasoning.md                 (concept)
│   ├── Do-Calculus.md                              (concept)
│   ├── Structural Causal Models.md                 (concept)
│   ├── Causal Diagrams.md                          (concept)
│   ├── Confounding.md                              (concept)
│   ├── Simpsons Paradox.md                         (concept)
│   ├── Randomized Controlled Trials.md             (concept)
│   ├── The Ladder of Causation.md                  (concept)
│   ├── Seeing vs Doing.md                          (concept)
│   ├── Bayesian Networks.md                        (concept)
│   ├── Potential Outcomes Framework.md             (concept)
│   └── Granger Causality.md                        (concept, deliberately isolated — no links)
├── People/
│   ├── Judea Pearl.md                              (person)
│   ├── Francis Galton.md                           (person)
│   ├── Karl Pearson.md                             (person)
│   ├── Sewall Wright.md                            (person)
│   └── Ronald Fisher.md                            (person)
├── Arguments/
│   └── Causal Reasoning is Formalizable.md         (argument)
├── Evidence/
│   └── Smoking and Lung Cancer Studies.md          (evidence)
├── Experiments/
│   └── Wrights Guinea Pig Genetics.md              (experiment)
├── Projects/
│   └── The Causal Revolution.md                    (project)
└── Questions/
    ├── Why Did Statistics Resist Causation.md       (question)
    └── Can Machines Think Causally.md               (question)
```

**Total: ~33 notes** covering all 10/10 note types defined in the data model (book-note, concept, person, question, index, argument, evidence, experiment, project, reference). Every note type is instantiated at least once, enabling full parser, type filter, and visualization coverage.

## Example Notes (Full Content)

Below are 11 representative notes showing the expected content depth and frontmatter. The remaining notes follow the same patterns.

---

### The Book of Why.md (index)

```markdown
---
title: "The Book of Why - The New Science of Cause and Effect"
type: index
tags: [causality, causal-inference, pearl, book]
status: review
created: 2026-01-15
modified: 2026-03-01
source: "Pearl, J. & Mackenzie, D. (2018). The Book of Why. Basic Books."
summary: >-
  A non-mathematical introduction to the Causal Revolution, covering
  the history, theory, and implications of causal inference.
links:
  - target: "../People/Judea Pearl.md"
    rel: authored-by
book-title: "The Book of Why: The New Science of Cause and Effect"
publisher: "Basic Books"
year: 2018
isbn: "978-0-465-09760-9"
---

# The Book of Why - The New Science of Cause and Effect

A comprehensive introduction to causal inference written for a general audience by Judea Pearl, winner of the Turing Award, and science writer Dana Mackenzie.

The book presents three main missions:
1. To present the Causal Revolution in non-mathematical language
2. To share scientific journeys confronting cause-effect questions
3. To explore implications for artificial intelligence and causal reasoning

## Chapters

- [Introduction - Mind Over Data](./Introduction - Mind Over Data/Introduction - Mind Over Data.md)
- [Ch1 - The Ladder of Causation](./Ch1 - The Ladder of Causation/Ch1 - The Ladder of Causation.md)
- [Ch2 - Genesis of Causal Inference](./Ch2 - Genesis of Causal Inference/Ch2 - Genesis of Causal Inference.md)
- [Ch3 - Reverend Bayes Meets Mr Holmes](./Ch3 - Reverend Bayes Meets Mr Holmes/Ch3 - Reverend Bayes Meets Mr Holmes.md)
- [Ch4 - Confounding and Deconfounding](./Ch4 - Confounding and Deconfounding/Ch4 - Confounding and Deconfounding.md)
- [Ch7 - The Conquest of Mount Intervention](./Ch7 - The Conquest of Mount Intervention/Ch7 - The Conquest of Mount Intervention.md)
- [Ch8 - Counterfactuals](./Ch8 - Counterfactuals/Ch8 - Counterfactuals.md)
- [Ch10 - Big Data AI and the Big Questions](./Ch10 - Big Data AI and the Big Questions/Ch10 - Big Data AI and the Big Questions.md)
```

---

### Introduction - Mind Over Data.md (book-note, adapted from existing notes)

```markdown
---
title: "Introduction - Mind Over Data"
type: book-note
tags: [causality, introduction, causal-inference, do-calculus]
status: review
created: 2026-01-20
modified: 2026-02-15
source: "The Book of Why, Introduction"
summary: >-
  Introduces causal inference as the science studying cause-and-effect
  using causal models, formal language, and data. Presents the do-operator
  and the key distinction between seeing and doing.
links:
  - target: "../../Concepts/Causal Inference.md"
    rel: contains
  - target: "../../Concepts/Seeing vs Doing.md"
    rel: contains
  - target: "../../Concepts/Do-Calculus.md"
    rel: contains
  - target: "../../Concepts/Causal Diagrams.md"
    rel: contains
  - target: "../../Concepts/Counterfactual Reasoning.md"
    rel: contains
  - target: "../../Questions/Can Machines Think Causally.md"
    rel: leads-to
chapter: "Introduction"
page-range: "1-38"
---

# Introduction - Mind Over Data

What is causal inference? The science that studies cause-and-effect relationships using a combination of a causal model, a formal language and data. It addresses seemingly straightforward questions like:

- How effective is a given treatment in preventing a disease?
- Did the new tax law cause our sales to go up, or was it our advertising campaign?
- What is the health-care cost attributable to obesity?
- Can hiring records prove an employer is guilty of a policy of sex discrimination?
- I'm about to quit my job. Should I?

These questions share a concern with cause-and-effect relationships, recognizable through words such as "preventing," "cause," "attributable to," "policy," and "should I."

> What about propositional and predicate logic? These are deductive systems dealing with truth preservation — given premises that are true, what conclusions must also be true? They're powerful, but they operate in a world of certainty and logical entailment. There's no notion of probability, no uncertainty, and critically — no directionality of causation. "If A then B" in logic is not the same as "A causes B."

Mathematical equations and pure algebra have difficulty expressing weight, variance and more implicit information, let alone seemingly unrelatable information, as "the rooster's crow does not cause the sun to rise." Before causal learning, there was no "mathematical language of causes."

## The Calculus of Causation

The calculus of causation consists of two languages: causal diagrams, to express what we know, and a symbolic language, resembling algebra, to express what we want to know.

Causal diagrams are dot-and-arrow pictures (directed acyclic graphs — DAGs) that summarize existing scientific knowledge. The dots represent variables, and the arrows represent known or suspected causal relationships — namely, which variable "listens" to which others.

> Pearl's analogy of "a map of one-way streets" is literally the definition of a directed graph. Each street has a direction you can travel, and you navigate by following allowed paths.

## Seeing vs Doing

Probably the biggest insight the Causal Revolution introduces is the distinction between seeing and doing.

**Seeing**: P(L | D) — plain conditional probability. You observe the world passively and filter by what you see. "Among all the people I observed taking the drug, how long did they live?" The problem: when you merely observe, the data is contaminated by all the reasons people ended up in the treatment group.

**Doing**: P(L | do(D)) — something fundamentally different. You intervene, forcing the drug into someone's body regardless of who they are, how sick they are, or how wealthy they are. You've severed the connection between the drug and all the reasons someone would normally take it. This is exactly what a randomized controlled trial does.

One of the crowning achievements of the Causal Revolution has been to explain how to predict the effects of an intervention without actually enacting it — the do-calculus enables this through noninvasive means.

## Implications for AI

Pearl's background in machine learning gave him another incentive for studying causation. In the late 1980s, he realized that machines' lack of understanding of causal relations was perhaps the biggest roadblock to giving them human-level intelligence.

A causal reasoning module would give machines the ability to reflect on their mistakes, pinpoint weaknesses in their software, function as moral entities, and converse naturally with humans about their own choices and intentions.

> This is closer to Causal AI or causal reasoning for artificial general intelligence — a cognitive architecture concern. Causal ML in practice is much more narrow: it takes Pearl's theory (do-calculus, DAGs, counterfactuals) and combines it with ML's estimation power to answer specific causal questions from data.
```

---

### A Blueprint of Reality.md (book-note)

```markdown
---
title: "A Blueprint of Reality"
type: book-note
tags: [causality, causal-diagrams, models, introduction]
status: draft
created: 2026-01-22
modified: 2026-02-10
source: "The Book of Why, Introduction"
summary: >-
  Explores how causal diagrams serve as blueprints of reality — compact
  representations of causal assumptions that enable formal reasoning about
  cause and effect.
links:
  - target: "../../../Concepts/Causal Inference.md"
    rel: related-to
  - target: "../../../Concepts/Causal Diagrams.md"
    rel: contains
  - target: "../Introduction - Mind Over Data.md"
    rel: part-of
chapter: "Introduction"
page-range: "23-30"
---

# A Blueprint of Reality

Pearl argues that causal diagrams are not merely illustrations — they are blueprints of reality. They encode our assumptions about how the world works in a precise, testable form.

## Diagrams as Models

A causal diagram is a compact summary of what we know (or assume) about the causal relationships in a system. Each arrow represents a direct causal influence. The absence of an arrow is equally important — it asserts that no direct causal path exists between two variables.

## From Blueprint to Inference

The power of the blueprint metaphor is that, like an architectural blueprint, a causal diagram allows you to reason about properties of the system without building it. Given a diagram and data, the do-calculus can determine which causal questions are answerable and derive the formulas to answer them.
```

---

### Causal Inference.md (concept)

```markdown
---
title: "Causal Inference"
type: concept
tags: [causality, inference, methodology, foundations]
status: review
created: 2026-01-18
modified: 2026-03-05
source: "The Book of Why, Introduction + Ch1"
summary: >-
  The science of drawing conclusions about causal relationships from
  data and assumptions, formalized through causal models, the do-calculus,
  and counterfactual reasoning.
links:
  - target: "./Do-Calculus.md"
    rel: contains
  - target: "./Structural Causal Models.md"
    rel: contains
  - target: "./Counterfactual Reasoning.md"
    rel: contains
  - target: "./Causal Diagrams.md"
    rel: contains
  - target: "./Confounding.md"
    rel: related-to
  - target: "./Potential Outcomes Framework.md"
    rel: related-to
  - target: "../People/Judea Pearl.md"
    rel: authored-by
domain: causal-ml
maturity: foundational
aliases: [causal analysis, causal reasoning]
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
```

---

### Judea Pearl.md (person)

```markdown
---
title: "Judea Pearl"
type: person
tags: [causality, ai, turing-award, researcher]
status: review
created: 2026-01-15
modified: 2026-03-09
source: "The Book of Why"
summary: >-
  Computer scientist and philosopher, Turing Award winner (2011),
  who formalized causal inference through causal diagrams, do-calculus,
  and structural causal models.
links:
  - target: "../Concepts/Causal Inference.md"
    rel: authored-by
  - target: "../Concepts/Do-Calculus.md"
    rel: authored-by
  - target: "../Concepts/Bayesian Networks.md"
    rel: authored-by
  - target: "../Concepts/Structural Causal Models.md"
    rel: authored-by
  - target: "../The Book of Why/The Book of Why.md"
    rel: authored-by
  - target: "Concepts/Deleted Note.md"
    rel: related-to
affiliation: "UCLA, Computer Science Department"
field: "Artificial Intelligence, Causal Inference"
era: "1980s-present"
---

# Judea Pearl

Judea Pearl (born 1936) is an Israeli-American computer scientist and philosopher, best known for championing the probabilistic approach to artificial intelligence and for developing the theory of causal and counterfactual inference.

## Key Contributions

- **Bayesian Networks** (1980s) — formalized probabilistic reasoning in AI using directed acyclic graphs, enabling efficient computation of conditional probabilities in complex systems.
- **Causal Diagrams / DAGs** — extended Bayesian networks to encode causal (not just probabilistic) relationships, creating a visual language for causal assumptions.
- **Do-Calculus** (1995) — developed a complete set of rules for determining when causal effects can be identified from observational data, given a causal diagram.
- **Structural Causal Models** — unified framework combining structural equations with graphical models, providing the mathematical backbone for causal reasoning.
- **Counterfactual Formalization** — gave formal, computable semantics to counterfactual statements ("what would have happened if...").

## Recognition

Awarded the **Turing Award in 2011** for "fundamental contributions to artificial intelligence through the development of a calculus for probabilistic and causal reasoning."

## The Book of Why

In 2018, Pearl co-authored "The Book of Why" with Dana Mackenzie to present the Causal Revolution to a general audience. The book traces the history of causal thinking from [Galton](./Francis Galton.md) and [Pearson](./Karl Pearson.md) through [Wright](./Sewall Wright.md) to Pearl's own work, arguing that causal reasoning is both formalizable and essential for artificial intelligence.

## Significance for AI

Pearl argues that machines' lack of causal understanding is the biggest roadblock to human-level intelligence. His position: strong AI requires a causal reasoning module, not just bigger datasets or deeper networks. This contrasts with the data-centric approach of modern deep learning.
```

> **Deliberately broken link**: The `target: "Concepts/Deleted Note.md"` link in Judea Pearl's frontmatter points to a file that does not exist. This is intentional for testing that `brainmap validate` catches broken links.

---

### Why Did Statistics Resist Causation.md (question)

```markdown
---
title: "Why Did Statistics Resist Causation?"
type: question
tags: [history, statistics, causality, philosophy-of-science]
status: draft
created: 2026-02-01
modified: 2026-02-20
source: "The Book of Why, Introduction + Ch2"
summary: >-
  Why did the statistical establishment actively prohibit causal language
  for most of the 20th century, and what were the consequences?
links:
  - target: "../People/Ronald Fisher.md"
    rel: related-to
  - target: "../People/Karl Pearson.md"
    rel: related-to
  - target: "../Concepts/Causal Inference.md"
    rel: related-to
  - target: "../People/Sewall Wright.md"
    rel: related-to
answered: false
answer-in: null
---

# Why Did Statistics Resist Causation?

Probability and statistics were developed because someone needed them and no one stood in the way. Causal inference was stalled because the very people who should have developed it — statisticians — actively prohibited the language needed to even ask the questions.

## The Prohibition

For most of the 20th century, mainstream statistics treated "cause" as a dirty word. The mantra "correlation is not causation" became a stop sign rather than a starting point. Researchers were trained to describe associations, never causes.

## Key Figures in the Resistance

[Karl Pearson](../People/Karl Pearson.md) championed a purely descriptive, correlation-based approach to statistics. He believed science should only describe patterns in data, never claim to explain *why* those patterns exist.

[Ronald Fisher](../People/Ronald Fisher.md), despite inventing the randomized controlled trial — a fundamentally causal tool — paradoxically resisted formal causal language in statistical analysis. His famous defense of the tobacco industry's position on smoking and cancer illustrates the consequences of lacking formal causal reasoning tools.

## The Exception

[Sewall Wright](../People/Sewall Wright.md) was a notable exception. His path analysis (1920s) used diagrams with arrows to represent causal relationships in genetics — essentially a precursor to Pearl's causal diagrams. The statistical establishment rejected his approach for decades.

## Consequences

The prohibition delayed the development of formal causal tools by nearly a century. Fields like epidemiology, economics, and social science had to develop ad-hoc methods independently, without a unifying framework. The cost in human lives (delayed understanding of smoking, treatments, public policy) is incalculable.

## Resolution

Pearl's formalization showed that causal reasoning is not unscientific hand-waving but a rigorous, mechanizable process. The inference engine framework directly rebutted the objection that causation is too subjective for mathematics.
```

---

### Seeing vs Doing.md (concept)

```markdown
---
title: "Seeing vs Doing"
type: concept
tags: [causality, do-operator, intervention, observation, foundations]
status: review
created: 2026-02-05
modified: 2026-02-28
source: "The Book of Why, Introduction"
summary: >-
  The fundamental distinction between observational conditioning P(Y|X)
  and interventional conditioning P(Y|do(X)), which separates causal
  inference from traditional statistics.
links:
  - target: "./Do-Calculus.md"
    rel: leads-to
  - target: "./Randomized Controlled Trials.md"
    rel: related-to
  - target: "./Confounding.md"
    rel: related-to
  - target: "./The Ladder of Causation.md"
    rel: part-of
domain: causal-ml
maturity: foundational
aliases: [observation vs intervention, seeing versus doing]
---

# Seeing vs Doing

The distinction between *seeing* and *doing* is arguably the most important insight of the Causal Revolution. It separates causal inference from traditional statistics at a fundamental level.

## Seeing: P(Y | X)

Plain conditional probability. You observe the world passively and filter by what you see.

"Among all the people I observed taking the drug, how long did they live?"

The problem: when you merely observe, you're seeing a world where people *chose* to take the drug. Their choice is not random — it's driven by other factors:
- Maybe sicker people are more desperate and take the drug more
- Maybe wealthier people have access to the drug and also have better healthcare

The data you observe is contaminated by all the reasons people ended up in the treatment group. This is the problem of [confounding](./Confounding.md).

## Doing: P(Y | do(X))

Something fundamentally different. You *intervene* — you force the drug into someone's body regardless of who they are, how sick they are, or how wealthy they are. You've severed the connection between the drug and all the reasons someone would normally take it.

This is exactly what a [randomized controlled trial](./Randomized Controlled Trials.md) does: a coin flip decides who takes the drug, not the patient's condition or choice.

## Why It Matters

The [do-calculus](./Do-Calculus.md) provides rules for converting `do(X)` expressions into ordinary conditional probabilities — effectively computing interventional quantities from observational data alone, when the causal structure permits it.

This is one of the crowning achievements of the Causal Revolution: predicting the effects of an intervention without actually enacting it, through noninvasive means.

## On the Ladder of Causation

Seeing occupies rung 1 (Association). Doing occupies rung 2 (Intervention). The distinction maps directly to [The Ladder of Causation](./The Ladder of Causation.md), Pearl's hierarchy of causal reasoning capabilities.
```

---

### Causal Reasoning is Formalizable.md (argument)

```markdown
---
title: "Causal Reasoning is Formalizable"
type: argument
tags: [causality, formalization, pearl, philosophy-of-science]
status: review
created: 2026-02-10
modified: 2026-03-01
source: "The Book of Why, Introduction + Ch10"
summary: >-
  Pearl's central claim that causal reasoning can and should be mechanized —
  that cause-and-effect relationships are amenable to formal mathematical
  treatment, not merely philosophical speculation.
links:
  - target: "../Concepts/Causal Inference.md"
    rel: supports
  - target: "../People/Judea Pearl.md"
    rel: authored-by
  - target: "../Concepts/Do-Calculus.md"
    rel: related-to
  - target: "../Concepts/Structural Causal Models.md"
    rel: related-to
claim: >-
  Causal reasoning is not inherently subjective or unscientific. It can be
  formalized into a rigorous mathematical framework (causal diagrams +
  do-calculus + counterfactuals) that is complete, testable, and mechanizable.
stance: for
---

# Causal Reasoning is Formalizable

Pearl's most fundamental argument, running through "The Book of Why" and his academic work, is that causal reasoning is not philosophical hand-waving but a rigorous, formalizable discipline.

## The Claim

For centuries, the statistical establishment treated causation as too subjective for formal mathematics. "Correlation is not causation" was a stop sign. Pearl argues this was a failure of imagination, not a fundamental limitation.

## Supporting Framework

The formalization rests on three pillars:
1. **Causal Diagrams** — a visual language (DAGs) for encoding causal assumptions
2. **Do-Calculus** — an algebraic system for deriving interventional quantities from observational data
3. **Counterfactual Logic** — formal semantics for "what if" questions within structural causal models

Together, these provide a complete calculus of causation — as rigorous as probability theory itself.

## Implications

If causal reasoning is formalizable, then:
- Machines can be taught to reason causally (not just correlate)
- Scientific claims about causation can be evaluated algorithmically
- The gap between data and policy can be bridged systematically
```

---

### Smoking and Lung Cancer Studies.md (evidence)

```markdown
---
title: "Smoking and Lung Cancer Studies"
type: evidence
tags: [epidemiology, smoking, causality, history]
status: draft
created: 2026-02-12
modified: 2026-03-05
source: "The Book of Why, Ch4 + Ch7"
summary: >-
  The epidemiological evidence linking smoking to lung cancer — a landmark
  case in the history of causal inference, where the lack of formal causal
  tools delayed scientific consensus for decades.
links:
  - target: "../Arguments/Causal Reasoning is Formalizable.md"
    rel: supports
  - target: "../People/Ronald Fisher.md"
    rel: related-to
  - target: "../Concepts/Confounding.md"
    rel: related-to
  - target: "../Concepts/Randomized Controlled Trials.md"
    rel: related-to
  - target: "Personal::Notes/Some Topic.md"
    rel: related-to
evidence-type: observational
strength: strong
domain: epidemiology
---

# Smoking and Lung Cancer Studies

The debate over whether smoking causes lung cancer is one of the most consequential episodes in the history of causal inference. It illustrates both the power and the limitations of pre-Pearl causal reasoning.

## The Evidence

By the 1950s, overwhelming observational data showed a strong association between smoking and lung cancer:
- Doll and Hill's British Doctors Study (1951-2001)
- The US Surgeon General's report (1964)
- Dozens of cohort and case-control studies across multiple countries

## The Causal Edge: Smoking → Lung Cancer

The relationship between smoking and lung cancer is a canonical example of a `causes` edge: smoking directly increases the probability of developing lung cancer through biological mechanisms (tar deposits, DNA mutations, chronic inflammation).

## The Controversy

Ronald Fisher — one of the greatest statisticians of the 20th century — argued that the association could be explained by a confounding variable (a genetic predisposition that causes both the desire to smoke and susceptibility to cancer). Without formal causal tools, this objection could not be rigorously refuted.

## Resolution

Pearl shows that with a properly specified causal diagram, the confounding objection can be formally evaluated and, in this case, dismissed. The do-calculus provides the mathematical machinery to determine when observational data is sufficient to establish causation.
```

> **Federated workspace stub**: The `target: "Personal::Notes/Some Topic.md"` link in the Smoking and Lung Cancer Studies note uses federation syntax (`WorkspaceName::path`). The referenced workspace does not exist. This is intentional for testing that the parser handles federation syntax without crashing.

---

### Wrights Guinea Pig Genetics.md (experiment)

```markdown
---
title: "Wright's Guinea Pig Genetics"
type: experiment
tags: [genetics, path-analysis, history, causality]
status: draft
created: 2026-02-15
modified: 2026-02-28
source: "The Book of Why, Ch2"
summary: >-
  Sewall Wright's path analysis work on guinea pig coat color inheritance —
  the first systematic use of causal diagrams in science, predating Pearl's
  formalization by decades.
links:
  - target: "../People/Sewall Wright.md"
    rel: authored-by
  - target: "../Concepts/Causal Diagrams.md"
    rel: leads-to
method: "Path analysis with directed diagrams representing causal relationships between genetic factors and phenotypic traits"
dataset: "Coat color inheritance data from controlled breeding of guinea pigs at the USDA"
result: "Demonstrated that directed diagrams could decompose complex genetic inheritance patterns into direct and indirect causal pathways, explaining observed correlations through underlying causal structure"
---

# Wright's Guinea Pig Genetics

Sewall Wright's work on guinea pig coat color inheritance (1920s) represents the first systematic use of directed diagrams to represent causal relationships in science.

## Method

Wright developed "path analysis" — a method using directed diagrams (arrows between variables) to decompose correlations into direct and indirect causal pathways. Each arrow represented a hypothesized causal influence, and the diagram as a whole encoded a complete causal model.

## The Experiment

Working at the USDA, Wright studied coat color inheritance in guinea pigs. He used directed diagrams to model how multiple genetic factors combined to produce observed coat color patterns, tracing causal pathways through intermediate variables.

## Significance

Wright's path diagrams were, in essence, the first causal DAGs — decades before Pearl formalized the framework. The statistical establishment (particularly Karl Pearson's followers) rejected Wright's approach, viewing the arrows as unscientific speculation rather than formal causal claims.

## Legacy

Wright's work is now recognized as a direct precursor to Pearl's causal diagrams. The line from Wright's path analysis to modern causal inference illustrates how a sound idea can be suppressed by disciplinary orthodoxy for generations.
```

---

### The Causal Revolution.md (project)

```markdown
---
title: "The Causal Revolution"
type: project
tags: [causality, pearl, research-program, formalization]
status: review
created: 2026-02-18
modified: 2026-03-09
source: "The Book of Why"
summary: >-
  Pearl's decades-long research program to formalize causal inference,
  resulting in causal diagrams, do-calculus, structural causal models,
  and the counterfactual framework.
links:
  - target: "../Concepts/Do-Calculus.md"
    rel: contains
  - target: "../Concepts/Structural Causal Models.md"
    rel: contains
  - target: "../People/Judea Pearl.md"
    rel: authored-by
  - target: "../Concepts/Causal Inference.md"
    rel: related-to
  - target: "../Concepts/Bayesian Networks.md"
    rel: related-to
project-status: completed
start-year: 1988
end-year: null
---

# The Causal Revolution

"The Causal Revolution" is Pearl's term for the paradigm shift in how science handles cause-and-effect questions. It refers both to a body of theoretical work and to the broader movement it sparked across disciplines.

## Scope

The project encompasses several major contributions:
- **Bayesian Networks** (1980s) — probabilistic reasoning with directed graphs
- **Causal Diagrams** (1990s) — extending Bayesian networks to encode causal, not just probabilistic, relationships
- **Do-Calculus** (1995) — a complete set of rules for identifying causal effects from observational data
- **Structural Causal Models** — a unified mathematical framework combining structural equations with graphical models
- **Counterfactual Formalization** — formal semantics for "what would have happened if..."

## Impact

The Causal Revolution has transformed multiple fields:
- Epidemiology now uses causal diagrams as standard methodology
- AI/ML research increasingly incorporates causal reasoning
- Tech companies have built production toolkits around the framework (Microsoft DoWhy, Uber CausalML)

## Ongoing Work

While the theoretical foundations are largely established, the revolution continues: integration with machine learning, scalable algorithms for large causal models, and the quest to give machines genuine causal understanding.
```

---

### Granger Causality.md (concept, deliberately isolated)

```markdown
---
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
```

> **Deliberately isolated node**: Granger Causality has no links (`links: []`). This is intentional for testing that `brainmap validate` detects orphan nodes.

---

## Expected Graph Topology

The seed dataset produces a graph with:

- **~33 nodes**: 9 book-notes, 12 concepts (+ 1 isolated), 5 people, 2 questions, 1 argument, 1 evidence, 1 experiment, 1 project, 1 index
- **~85-95 edges** estimated:
  - ~15 `contains` / `part-of` (directory-derived hierarchy)
  - ~15 `contains` (explicit, book-note → concepts introduced)
  - ~10 `authored-by` (person → concept/book)
  - ~8 `extends` / `depends-on` (concept → concept)
  - ~6 `related-to` (cross-domain links)
  - ~5 `leads-to` / `precedes` (temporal/sequential)
  - ~4 `contradicts` / `supports` (logical)
  - ~5 `exemplifies` / `sourced-from` (instances and references)
  - ~1 `causes` (Smoking → Lung Cancer)
  - 1 broken link (Judea Pearl → Concepts/Deleted Note.md)
  - 1 federated stub (Smoking and Lung Cancer Studies → Personal::Notes/Some Topic.md)

### Interesting Query Paths

These are real queries the CLI and MCP should handle correctly:

| Query | Expected Result |
|-------|-----------------|
| `brainmap path "Seeing vs Doing" "Ronald Fisher"` | Seeing vs Doing → Confounding → ... → Ronald Fisher |
| `brainmap neighbors "Causal Inference" --depth 1` | Do-Calculus, SCMs, Counterfactuals, Causal Diagrams, Confounding, Potential Outcomes, Judea Pearl |
| `brainmap search "intervention" --type concept` | Seeing vs Doing, Do-Calculus, RCTs |
| `brainmap subgraph "Judea Pearl" --depth 2` | Pearl + all concepts he authored + their neighbors |
| `brainmap stats` | ~33 nodes, ~90 edges, 5+ clusters (book chapters, concepts, people, questions, arguments/evidence) |
| `brainmap validate` | Catches 1 broken link (Concepts/Deleted Note.md), 1 orphan (Granger Causality). Federation stub produces a warning, not an error. |
| `brainmap search --tag history` | Wright's Guinea Pig Genetics, Smoking and Lung Cancer Studies, Why Did Statistics Resist Causation, Francis Galton, Karl Pearson |
| `brainmap link list "Judea Pearl" --relationship authored-by` | Causal Inference, Do-Calculus, Bayesian Networks, SCMs, The Book of Why |
| `brainmap node list --status draft` | Why Did Statistics Resist Causation, Smoking and Lung Cancer Studies, Wright's Guinea Pig Genetics, Granger Causality, A Blueprint of Reality |
| `brainmap graph find-path "Francis Galton" "Do-Calculus" --edges precedes,leads-to,extends` | Galton → Pearson (precedes) → ... → Do-Calculus, or Galton → Regression → ... multi-hop path |
| `brainmap export --format json` | Valid JSON; structure includes nodes array, edges array, metadata. Validate with JSON schema. |

## Remaining Notes (Skeleton)

The following notes need full content written during implementation. Their frontmatter and relationships are defined here.

### Concepts (skeleton)

| Note | Key links |
|------|-----------|
| Do-Calculus.md | extends → SCMs, depends-on → Causal Diagrams, authored-by → Pearl |
| Structural Causal Models.md | contains → Do-Calculus, extends → Bayesian Networks, authored-by → Pearl |
| Causal Diagrams.md | part-of → Causal Inference, related-to → Bayesian Networks, authored-by → Pearl |
| Confounding.md | related-to → Seeing vs Doing, related-to → RCTs, exemplifies ← Simpsons Paradox |
| Simpsons Paradox.md | exemplifies → Confounding, sourced-from → Book of Why Ch4 |
| Randomized Controlled Trials.md | related-to → Seeing vs Doing, related-to → Confounding, related-to → Fisher |
| The Ladder of Causation.md | contains → Seeing vs Doing, contains → Counterfactual Reasoning, authored-by → Pearl, related-to → Causal Reasoning is Formalizable |
| Bayesian Networks.md | precedes → Causal Diagrams, authored-by → Pearl |
| Potential Outcomes Framework.md | related-to → Causal Inference, contradicts → Do-Calculus (methodological) |
| Counterfactual Reasoning.md | part-of → The Ladder of Causation, related-to → Structural Causal Models |

### People (skeleton)

| Note | Key links |
|------|-----------|
| Francis Galton.md | precedes → Karl Pearson, leads-to → Regression concept. Created: 2026-01-25 |
| Karl Pearson.md | evolved-from → Galton, contradicts → Causal Inference. Created: 2026-01-28 |
| Sewall Wright.md | precedes → Pearl (conceptually), leads-to → Causal Diagrams. Created: 2026-02-01 |
| Ronald Fisher.md | authored-by → RCTs, contradicts → causal language (paradoxically). Created: 2026-02-03 |

### Book Notes (skeleton)

| Note | Key links |
|------|-----------|
| Ch1 - The Ladder of Causation.md | contains → The Ladder of Causation concept. Created: 2026-01-20 |
| Ch2 - Genesis of Causal Inference.md | contains → Galton, Pearson, Wright, Fisher historical context. Created: 2026-01-22 |
| Ch3 - Reverend Bayes Meets Mr Holmes.md | contains → Bayesian Networks. Created: 2026-01-25 |
| Ch4 - Confounding and Deconfounding.md | contains → Confounding, Simpsons Paradox. Created: 2026-01-28 |
| Ch7 - The Conquest of Mount Intervention.md | contains → Do-Calculus advanced applications. Created: 2026-02-05 |
| Ch8 - Counterfactuals.md | contains → Counterfactual Reasoning deep dive. Created: 2026-02-10 |
| Ch10 - Big Data AI and the Big Questions.md | contains → Can Machines Think Causally. Created: 2026-02-20 |

### Questions (skeleton)

| Note | Key links |
|------|-----------|
| Can Machines Think Causally.md | related-to → Causal Inference, related-to → Pearl, related-to → AI/ML discussion. Created: 2026-02-25 |

## Date Distribution

For date-query and sort-order testing, `created` dates are spread across the range 2026-01-15 to 2026-03-09:

- **January 2026**: The Book of Why (index), Judea Pearl, Causal Inference, Introduction, Ch1-Ch4, Francis Galton, Karl Pearson
- **February 2026**: Sewall Wright, Ronald Fisher, Why Did Statistics Resist Causation, Seeing vs Doing, A Blueprint of Reality, Causal Reasoning is Formalizable, Smoking and Lung Cancer Studies, Wright's Guinea Pig Genetics, The Causal Revolution, Ch7-Ch10, Can Machines Think Causally
- **March 2026**: Granger Causality, final modifications across multiple notes
