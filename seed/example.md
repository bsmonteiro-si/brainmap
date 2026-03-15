---
id: 3e5224be-cbe0-4049-bc83-cfef2b1490fa
title: example
type: concept
created: 2026-03-14
modified: 2026-03-14
---
%% Begin Waypoint %%
- **[[A Blueprint of Reality]]**
%% End Waypoint %%

What is causal inference? The science that studies cause-and-effect relationships using a combination of a causal model, a formal language and data. It addresses seemingly straightforward questions like these: 
- How effective is a given treatment in preventing a disease? 
- Did the new tax law cause our sales to go up, or was it our advertising campaign? 
- What is the health-care cost attributable to obesity? 
- Can hiring records prove an employer is guilty of a policy of sex discrimination? 
- I’m about to quit my job. Should I?
These questions have in common a concern with cause-and-effect relationships, recognizable through words such as “preventing,” “cause,” “attributable to,” “policy,” and “should I.”
> What about propositional and predicate logic?
> According to Claude: `These are deductive systems. They deal with truth preservation — given premises that are true, what conclusions must also be true? They're powerful, but they operate in a world of certainty and logical entailment. There's no notion of probability, no uncertainty, and critically — no directionality of causation. "If A then B" in logic is not the same as "A causes B." It's a symmetrical truth relation: if the ground is wet, you can conclude it rained (contrapositive), but wet ground doesn't cause rain.`

Mathematical equations and pure algebra have a difficult time really expressing weight, variance and more implicit information, let alone seemingly unrelatable information, as "the rooster’s crow does not cause the sun to rise". Before causal learning, there wasn't a "mathematical language of causes".

Probability and statistics were developed because someone needed them and no one stood in the way. Causal inference was stalled because the very people who should have developed it (statisticians) actively prohibited the language needed to even ask the questions, and our own natural causal intuition masked the urgency of the problem for centuries.
> This would benefit from more historic precision and evidence, but ok for now.

On the other hand, data itself is very limited, actually rather dumb as it can tell you what but not why. Though big data and data science is getting bigger and bigger, it cannot capture all the complexity you would need to solve difficult problems.

`The calculus of causation consists of two languages: causal diagrams, to express what we know, and a symbolic language, resembling algebra, to express what we want to know. The causal diagrams are simply dot-and- arrow pictures that summarize our existing scientific knowledge. The dots represent quantities of interest, called “variables,” and the arrows represent known or suspected causal relationships between those variables—namely, which variable “listens” to which others. These diagrams are extremely easy to draw, comprehend, and use, and the reader will find dozens of them in the pages of this book. If you can navigate using a map of one-way streets, then you can understand causal diagrams, and you can solve the type of questions posed at the beginning of this introduction.`
> Naturally graphs? 
> According to Claude: 
> ```
> Yes, exactly. Causal diagrams are directed acyclic graphs — DAGs.
   . Directed: the arrows have a direction. A → B means A "listens to" (causes) B, not the other way around. This is the asymmetry that logic couldn't express.
   . Acyclic: no loops. You can't follow the arrows and end up back where you started. A causes B causes C, but C doesn't circle back to cause A. (This is a simplification — feedback loops exist in reality, but the foundational theory assumes you can unfold them over time.)
   . Graph: nodes (variables) and edges (causal relationships).
   Pearl's analogy of "a map of one-way streets" is literally the definition of a directed graph. Each street has a direction you can travel, and you navigate by following allowed paths.```

Probably the biggest difference the Causal Revolution (this new science's introduction) is seeing vs doing. Take P(L | D) as the probability of a patient living after taking a certain drug.

Seeing: P(L | D)
- This is plain conditional probability. You observe the world passively and filter by what you see. "Among all the people I observed taking the drug, how long did they live?"
- The problem: when you merely observe, you're seeing a world where people chose to take the drug. Their choice is not random, it's driven by other factors. Maybe sicker people are more desperate and take the drug more. Maybe wealthier people have access to the drug and also have better healthcare in general. The data you observe is contaminated by all the reasons people ended up in the "took the drug" group.
Doing: P(L | do(D))
- This is something fundamentally different. You intervene, you force the drug into someone's body regardless of who they are, how sick they are, or how wealthy they are. You've severed the connection between the drug and all the reasons someone would normally take it.
- This is exactly what a randomized controlled trial does: a coin flip decides who takes the drug, not the patient's condition or choice.
`One of the crowning achievements of the Causal Revolution has been to explain how to predict the effects of an intervention without actually enacting it. It would never have been possible if we had not, first of all, defined the do- operator so that we can ask the right question and, second, devised a way to emulate it by noninvasive means.`

`As with predicting the effect of interventions (mentioned above), in many cases we can emulate human retrospective thinking with an algorithm that takes what we know about the observed world and produces an answer about the counterfactual world. This “algorithmization of counterfactuals” is another gem uncovered by the Causal Revolution.`
> Define more precisely counterfactual reasoning
> According to Claude: `It's reasoning about worlds that didn't happen, grounded in a model of the world that did happen. The key structure is always: given what I observed, what would have happened if something had been different?`

At the risk of sounding unscientific, counterfactual reasoning can be very useful as our minds make very reliable and reproducible judgments all the time about what might be or might have been. Two people sharing the same causal model will also share all counterfactual judgments.

`My background in machine learning has given me yet another incentive for studying causation. In the late 1980s, I realized that machines’ lack of understanding of causal relations was perhaps the biggest roadblock to giving them human-level intelligence. In the last chapter of this book, I will return to my roots, and together we will explore the implications of the Causal Revolution for artificial intelligence. I believe that strong AI is an achievable goal and one not to be feared precisely because causality is part of the solution. A causal reasoning module will give machines the ability to reflect on their mistakes, to pinpoint weaknesses in their software, to function as moral entities, and to converse naturally with humans about their own choices and intentions.
> It is important to research about causal inference here for AI. Or would it rather be in this case Causal Machine Learning?
> As pointed by Claude, `this is closer to Causal AI or causal reasoning for artificial general intelligence. It's a cognitive architecture concern — how do you build a mind that thinks causally? Causal ML in practice is much more narrow and pragmatic. It takes the theory Pearl developed (do-calculus, DAGs, counterfactuals) and combines it with ML's estimation power to answer specific causal questions from data. These tools don't "think" causally. They don't have an internal world model. They're statistical estimation techniques informed by causal theory. The human researcher still supplies the causal model (or uses discovery algorithms to propose one), formulates the query, and interprets the result. The ML part is just a better way to compute the estimand from data.

The book follows then to a general framework for the causal model that we follow on [[A Blueprint of Reality]]