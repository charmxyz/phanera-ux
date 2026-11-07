---
title: "Synthetic Users: What They Are, Where They Help and Fail"
description: "Synthetic users are AI-simulated people used in research. Learn where synthetic user research helps, where it fails, and how to pair it with real users."
date: 2026-11-07
keyword: "synthetic users"
readingTime: 9
---

Synthetic users are AI-generated stand-ins for real people, used to answer research questions or test a product without recruiting participants. A synthetic user is usually a large language model given a persona (a goal, a context, some constraints) and asked to respond to questions, react to concepts or attempt tasks on a real interface. They are fast, cheap and repeatable. They are also not people, and the most useful thing you can know about synthetic user research is exactly where that difference matters.

This guide covers what synthetic users are, the main ways teams use them, what they are genuinely good for, what they cannot tell you, and a simple workflow for combining them with research on real users.

## What are synthetic users?

The term covers a few different things, and it helps to separate them because they have very different strengths.

| Type | What it does | Example question it answers |
|---|---|---|
| Synthetic interview respondent | An AI persona answers interview or survey questions in character | "What frustrates you about expense software?" |
| Synthetic concept reviewer | An AI persona reacts to a description, mock-up or landing page copy | "Would this headline make sense to you?" |
| Simulated user in a browser | An AI agent with a persona attempts a task on a live website, clicking and reading | "Can a new visitor find pricing?" |

The first two produce opinions. The third produces behaviour: a record of what the agent clicked, where it got stuck and whether it finished. Synthetic opinions and synthetic behaviour fail in different ways.

Synthetic users are built from AI personas. If you want the background on how those are defined, see [what is an AI persona](/blog/what-is-an-ai-persona).

## Why teams are interested in synthetic user research

Traditional user research is slow for reasons unrelated to its quality: screeners, recruitment, scheduling, sessions and synthesis. For a small team a round can take weeks, so research happens rarely, often after decisions are made.

Synthetic user research promises to remove most of that overhead:

- **Speed.** Results in minutes rather than weeks.
- **Cost.** No incentives, no recruitment fees, no researcher hours per session.
- **Repeatability.** You can run the same task with the same personas after every release and compare.
- **Coverage.** You can try many persona types against many tasks, including ones you would struggle to recruit for.

Those are real advantages. The question is what you are actually measuring when you use them.

## Where synthetic users genuinely help

Synthetic users are strongest when the question is about whether something in the interface works, rather than how a person feels about it.

### Findability

"Can someone find the pricing page?" "Can they find out whether you integrate with their CRM?" These are questions about structure, labels and navigation. An AI agent reading your page and choosing what to click is a reasonable proxy for a first-time visitor scanning for a link, especially for spotting problems like a pricing page that is two clicks deep or a key page missing from the main navigation.

### Clarity of copy and labels

If a simulated visitor whose goal is "find out what this product does, fast" reads your homepage and still cannot state it, that is a useful signal. The same goes for inconsistent naming: if a feature is called one thing on the homepage and another in the docs, an agent following the trail will often trip over it in the same way a person would.

### Flow breakage

Broken links, buttons that do nothing, forms that reject valid input, modals that cannot be closed, checkout steps that dead-end. These are mechanical failures, and an agent running through the flow in a real browser will hit them. This is where synthetic testing is closest to an automated check.

### Comparing versions

Because synthetic sessions are repeatable, they suit before-and-after checks: run the same tasks before and after a navigation redesign and see whether task completion moved.

### Filling the gaps between real studies

Most teams cannot run sessions with real people every sprint. Synthetic users can cover the weeks in between, so your real participants spend their time on harder questions.

## Where synthetic users fail

This is the part that matters most. Synthetic users are a model's prediction of how a person with a given description might behave. That prediction can be plausible without being true.

### Real emotions

A synthetic user can say "this is frustrating", but it does not feel frustration. It has no bad day, no competing deadline, no memory of being burned by a similar tool last year. Emotional responses such as anxiety at a payment form, delight at a clever interaction, or distrust of an unfamiliar brand come from lived experience. A model can describe what such a reaction might look like, but you cannot treat that description as evidence that real people will have it.

### Willingness to pay

Ask a synthetic user whether they would pay £30 a month and you will get a confident, reasonable-sounding answer. It is worth very little. Real willingness to pay depends on budget, alternatives, internal politics and how painful the problem actually is for that person this quarter. Even real people are poor at predicting their own purchasing; synthetic ones have no wallet at all. Pricing decisions need real signals: sales conversations, experiments, actual conversion.

### True motivations

Generative research, the kind that asks why people do what they do, is where synthetic users are weakest. The value of an interview with a real person is often the thing you did not expect: a workaround in a spreadsheet, a reason for buying that never appeared in your positioning, a job the product is quietly doing that you had not noticed. A model tends to give you the average, most predictable answer given its training data and the persona you wrote. It will rarely surprise you in the way a real customer does, and when it does surprise you, you cannot tell whether it is insight or invention.

### Accessibility needs of real disabled users

You can describe a persona as using a screen reader or having low vision, and an agent can read the structure of a page rather than its visuals. That can catch some structural problems, such as missing labels or a confusing heading order. It is not a substitute for testing with disabled people. Real assistive technology users have their own settings, habits and strategies, and the barriers they meet are often ones that neither a checklist nor a model anticipates. Treat synthetic checks here as a supplement to accessibility audits and research with disabled participants, never a replacement.

### Bias you wrote yourself

A synthetic user is only as good as its persona. Describe your customer from assumptions and your synthetic users will act out those assumptions. They cannot tell you that you picked the wrong audience. Our guide to the [AI persona generator](/blog/ai-persona-generator) covers how to write and validate personas so this risk is smaller.

### Agents are not humans at reading screens

An AI agent does not perceive a page the way a person does. It may read text a human would skip, or miss a visual cue that is obvious to people. Expect some false alarms and some missed problems, and treat results as strong hypotheses, not verdicts.

## A quick way to judge any synthetic finding

Before acting on a result from synthetic users, ask three questions:

1. **Is this about behaviour or opinion?** "The agent could not find the pricing link" is behaviour and can be checked by looking at the page. "The persona felt the price was too high" is opinion and needs real evidence.
2. **Can I verify it myself in under five minutes?** Open the page and follow the same path. If you can see the problem, fix it. If you cannot, treat it as a question for real users.
3. **Would being wrong be expensive?** Changing a button label on a hunch is cheap. Changing your pricing model or target market on a synthetic opinion is not.

## Synthetic users vs real users: a comparison

| Question | Synthetic users | Real users |
|---|---|---|
| Can people find X? | Good first check | Best evidence |
| Is the copy clear? | Useful signal | Best evidence |
| Does the flow break? | Very good | Good, but costly to repeat |
| Did the redesign help task completion? | Good for quick comparison | Best for confirming |
| How do people feel about this? | Unreliable | Necessary |
| Would they pay for it? | Unreliable | Necessary, ideally via real behaviour |
| Why do they need this at all? | Unreliable | Necessary |
| Does it work for disabled users? | Limited supplement only | Necessary |

The pattern is simple. Synthetic users are useful for evaluative questions about interfaces. Real users are necessary for generative questions about people. Our overview of [user research methods](/blog/user-research-methods) goes into the generative vs evaluative split in more detail.

## How to use synthetic users well: a workflow

Here is a practical way to fit synthetic user research into a normal product cycle.

### 1. Start from real knowledge

Base your personas on what you already know from customers: support tickets, sales calls, analytics, past interviews. If you have none of that yet, say so, and treat your personas as explicit guesses to be tested.

### 2. Write concrete tasks, not opinion questions

Prefer "Find out whether this product works with Shopify" over "What do you think of the homepage?" Tasks produce behaviour you can verify. Opinion questions produce text you cannot. Our guide on [usability testing scenarios](/blog/usability-testing-scenarios) has templates for writing tasks.

### 3. Run several personas on the same task

A busy founder skimming for what you do, a budget owner who needs a price for their boss, and a technical evaluator checking compatibility will take different routes. Problems that trip up more than one persona are usually worth looking at first.

### 4. Review the evidence, not just the summary

Look at the screenshots and step-by-step reasoning. If the agent went wrong for a reason a person never would, discard the finding. If it went wrong for a reason you recognise, fix it.

### 5. Fix the obvious, then take open questions to real people

Use synthetic results to clear away the cheap, mechanical problems before you spend real participants' time. Then bring the questions synthetic users cannot answer, about motivation, trust, value and emotion, to interviews and usability sessions with real people. Once fixes ship, rerun the same synthetic tasks to check nothing regressed. Nielsen's well-known guidance that around five users per round reveals most usability problems is a reminder that real studies do not have to be huge; they do have to happen.

## A checklist you can copy

- [ ] Personas based on real customer evidence, or clearly marked as assumptions
- [ ] Tasks written as goals with a clear success condition
- [ ] At least three different personas per key task
- [ ] Findings reviewed against screenshots or session evidence
- [ ] Behavioural findings verified by a person on the live site
- [ ] Opinion, pricing and motivation questions moved to real-user research
- [ ] Accessibility checked with audits and disabled participants, not only simulation
- [ ] Same tasks rerun after each significant change

## Trying synthetic usability testing

If you want to try the behavioural kind of synthetic testing on your own site, [Phanera](/) does this: you paste a URL, it suggests tasks and personas, each persona attempts the task in a real browser, and an independent AI reviewer judges the sessions before you get prioritised findings with screenshots and replays. The first five usability tests are free. Use it the way this article suggests: as a fast check on findability, clarity and broken flows, and as a way to make your time with real users count for more.

## FAQ

### Are synthetic users a replacement for real user research?

No. They are a fast way to check whether an interface works, before and between studies with real people. They cannot tell you how people feel, what they would pay or why they need your product.

### What is synthetic user research best used for?

Evaluative questions about an interface: can people find something, is the copy clear, does the flow break, did a change improve task completion. These produce behaviour you can verify by looking at the site yourself.

### Can synthetic users test accessibility?

Only in a limited way. An agent that reads page structure can surface some structural issues, but it cannot represent how disabled people actually use assistive technology. Pair it with proper accessibility audits and research with disabled participants.

### How accurate are synthetic users?

It depends on the question. Mechanical findings, such as a broken button or a missing link, are easy to confirm or reject by checking the page. Predictions about opinions, emotions and purchasing are not reliable enough to act on without real evidence.

### How many synthetic personas should I use?

Three to five distinct personas per key task is a sensible start. Focus on personas whose goals genuinely differ, such as someone skimming, someone evaluating cost and someone checking technical fit, rather than many near-identical ones.
