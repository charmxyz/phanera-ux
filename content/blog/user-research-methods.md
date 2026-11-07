---
title: "User Research Methods: Which to Use and When"
description: "A practical guide to user research methods: generative vs evaluative, qual vs quant, a when-to-use table with effort levels, and how to pick the right one."
date: 2026-11-07
keyword: "user research methods"
readingTime: 9
---

User research methods are the techniques teams use to learn how people think, behave and make decisions, so they can build products that work for them. They range from interviews and diary studies, which explore needs before anything is built, to usability tests, surveys and analytics, which check how well a design performs. The right method depends on the question you are asking, how far along the product is, and how much time you have.

This guide sorts the main user research techniques into simple frameworks, gives you a table for picking one, and shows how to combine them.

## How to think about user research methods

Most methods can be placed on three axes. You do not need to memorise them, but they help you notice when you are using the wrong tool for the question.

### Generative vs evaluative

**Generative research** (also called discovery or exploratory research) helps you understand a problem before you design a solution. You are asking "what do people need, and why?" Interviews, field studies and diary studies are typical generative methods.

**Evaluative research** checks whether a solution works. You are asking "can people use this, and does it do what we hoped?" Usability testing, A/B tests and tree testing are typical evaluative methods.

A common mistake is running evaluative research when the real problem is generative. A usability test of the sign-up form tells you whether the form is confusing, not whether people want the product.

### Qualitative vs quantitative

**Qualitative** methods produce words, observations and reasons. They tell you *why* something happens. Sample sizes are small, often five to fifteen people.

**Quantitative** methods produce numbers. They tell you *how many* or *how much*. You need larger samples for the numbers to mean anything, and they rarely explain the cause.

The two work best together. Analytics might show that 60% of visitors leave the pricing page within ten seconds (your own number, not a benchmark). A handful of usability sessions can then show you why.

### Attitudinal vs behavioural

**Attitudinal** methods capture what people say: opinions, preferences, stated intentions. Surveys and interviews sit here.

**Behavioural** methods capture what people do. Usability tests, analytics and A/B tests sit here.

People are poor at predicting their own behaviour. Someone may say they always compare prices carefully, then pick the first plan they see during a test. When the two disagree, trust the behaviour.

## User research methods compared: a when-to-use table

The table below covers the methods most product teams use. "Effort" is a rough guide to time and cost for a small team doing it properly, including recruitment and analysis.

| Method | Type | Best for | When to use | Effort |
|---|---|---|---|---|
| User interviews | Generative, qual, attitudinal | Understanding needs, goals, context and language | Early discovery, before a big build, when entering a new market | Medium |
| Contextual inquiry / field study | Generative, qual, behavioural | Seeing real workflows and workarounds in their setting | Complex or professional tools, when interviews feel too abstract | High |
| Diary study | Generative, qual, mixed | Behaviour that unfolds over days or weeks | Habits, onboarding over time, infrequent tasks | High |
| Surveys | Generative or evaluative, quant, attitudinal | Measuring how common a need or opinion is | After interviews, to size what you heard; tracking satisfaction | Low to medium |
| Card sorting | Generative, qual or quant, attitudinal | How people group and label content | Designing or reworking navigation and information architecture | Low |
| Tree testing | Evaluative, quant, behavioural | Whether people can find things in a menu structure | After card sorting, before visual design | Low |
| Moderated usability testing | Evaluative, qual, behavioural | Finding why people struggle, with follow-up questions | Prototypes and live products, complex flows | Medium |
| Unmoderated usability testing | Evaluative, qual or quant, behavioural | Quick task-based feedback at scale | Simple, well-defined tasks; repeated checks | Low to medium |
| AI or simulated usability testing | Evaluative, qual, behavioural (simulated) | Fast first pass on findability, clarity and obvious friction | Before recruiting real users, after each release, on competitor sites | Low |
| First-click and five-second tests | Evaluative, quant, behavioural | Whether a page communicates its purpose or main action | Landing pages, homepages, key screens | Low |
| A/B and multivariate testing | Evaluative, quant, behavioural | Which version performs better on a metric | Live products with enough traffic to reach significance | Medium |
| Analytics review | Evaluative, quant, behavioural | Where people drop off, what they use | Ongoing; to choose what to research next | Low |
| Session recordings and heatmaps | Evaluative, qual, behavioural | Spotting patterns of confusion on live pages | After analytics flags a problem page | Low |
| Accessibility audit with disabled users | Evaluative, qual, behavioural | Barriers for people using assistive technology | Before launch and regularly after | Medium |
| Competitive analysis | Generative, qual | Conventions, gaps and expectations set by others | Early strategy, before redesigns | Low |

Low effort does not mean low value: analytics and tree tests are cheap and often answer the question outright. High-effort methods earn their cost when the risk is high. And quant methods need volume: an A/B test on a page with 200 visitors a month will take a very long time to say anything reliable.

## The core methods in more detail

### User interviews

One-to-one conversations, usually 30 to 60 minutes, about a person's goals, context and past behaviour. Ask about specific recent events ("Tell me about the last time you chose a project management tool") rather than hypotheticals ("Would you use a tool that..."). Hypothetical questions invite polite guesses.

Interviews are the best source of real language: the words people use for their problem belong on your website. If you are building personas, interviews are where the raw material comes from; see [how to create a user persona](/blog/how-to-create-a-user-persona) for a template.

### Contextual inquiry and diary studies

In contextual inquiry you watch someone do their real work in their real environment, which reveals the workarounds people forget to mention. Diary studies have participants log experiences over one to four weeks, for behaviour that is spread out over time.

### Surveys

Good for measuring how widespread something is, poor for discovering things you did not think to ask. Write them after some qualitative work and keep them short. Standard instruments such as the System Usability Scale (SUS), a ten-item questionnaire scored from 0 to 100, let you compare results over time.

### Card sorting and tree testing

In a card sort, participants group topics into categories that make sense to them. In an open sort they name the groups; in a closed sort they use groups you provide. A tree test then checks a proposed structure: participants see a text-only menu and try to find where something lives.

Together they are a cheap way to fix navigation before it reaches a designed page.

### Usability testing

Participants attempt realistic tasks with a product while you observe. In a moderated test, a facilitator is present (in person or remote) and can ask follow-up questions. In an unmoderated test, participants complete tasks alone using a testing tool and their session is recorded.

The think-aloud protocol, where participants say what they are thinking as they go, is the standard way to capture reasoning. Jakob Nielsen's well-known guidance suggests that testing with around five users per round uncovers most of the common problems in that round, and that several small rounds beat one large one.

The quality of a usability test depends heavily on the tasks and questions. See [usability testing questions](/blog/usability-testing-questions) for copyable question lists and [usability testing scenarios](/blog/usability-testing-scenarios) for how to write tasks that do not give the answer away.

### AI and simulated usability testing

A newer category: AI agents, each given a persona with a goal and level of patience, attempt tasks on a live website in a real browser. Their steps and reasoning are recorded, and the sessions are reviewed for problems.

It is cheap enough to run after every release, and catches problems such as hard-to-find content, unclear labels, inconsistent naming and easy-to-miss calls to action. What it cannot do is tell you what real people feel, how they talk about the problem, or whether they want the product at all. It is a complement to research with real users, not a replacement. [AI usability testing](/blog/ai-usability-testing) covers what it catches and misses in detail.

### Analytics, A/B testing and recordings

These tell you what is happening at scale. Analytics shows where people drop off. Recordings and heatmaps show patterns on specific pages. A/B tests tell you which version moves a metric.

None of them explain intent. A high bounce rate could mean confusion, or that people found what they needed in five seconds. Use them to decide where to look.

## How to choose the right user research technique

Start with the question, not the method. Write your research question down in one sentence, then work through these prompts.

1. **Do we understand the problem, or are we checking a solution?** Problem: generative. Solution: evaluative.
2. **Do we need to know why, or how many?** Why: qualitative. How many: quantitative.
3. **Do we care what people say or what they do?** Usually what they do, so lean behavioural where you can.
4. **What exists to test?** Nothing yet: interviews, competitive analysis, card sorts. A prototype: moderated usability tests, tree tests. A live product: all of the above, plus analytics, A/B tests and unmoderated or simulated tests.
5. **What will we do with the answer?** If no result would change your decision, do not run the study.

### Example research questions and matching methods

| Research question | Suggested method |
|---|---|
| Why do trial users not convert to paid? | Interviews with recent churned trialists, then a survey to size the reasons |
| Can new visitors find our pricing? | Usability testing (moderated, unmoderated or simulated) on the live site |
| Does our new navigation make sense? | Card sort, then tree test |
| Which headline gets more sign-ups? | A/B test, if traffic allows; five-second test if not |
| Is the product getting easier to use over time? | SUS after each release, plus repeated task-based tests |

## Combining methods: a simple research plan

Good research rarely relies on one method. A practical rhythm for a small product team looks like this:

- **Continuously:** review analytics and recordings monthly to spot problem areas.
- **Every release:** run a quick task-based check on key journeys (find pricing, sign up, complete the core action). Simulated tests are well suited to this because they are cheap to repeat.
- **Every quarter:** run five to eight moderated sessions or interviews with real users on whatever the data says matters most.
- **Before big decisions:** do proper generative work. Interviews, field visits, a survey to size what you learned.


## Common mistakes to avoid

- **Asking people to predict the future.** "Would you pay for this?" is a weak signal. Ask what they do today.
- **Testing with the wrong people.** Colleagues and power users are not new visitors. Screen for your real audience.
- **Treating one method as the truth.** Look for where different methods agree.

## Where AI fits in your research toolkit

If you want a fast first pass on a live website before recruiting participants, [Phanera](/) runs AI personas through tasks you choose in a real browser and returns prioritised findings with session replays. It is useful for catching findability and clarity problems quickly, and for re-checking after each change. Pair it with interviews and usability tests with real users for anything that depends on how people actually feel, what they need, or whether they would buy.

## FAQ

### What are the main types of user research methods?

The main types are generative (understanding needs) and evaluative (testing solutions), qualitative (why) and quantitative (how many), and attitudinal (what people say) and behavioural (what people do). Most methods sit somewhere on all three axes.

### Which user research method should I start with?

If you are early and unsure of the problem, start with user interviews. If you have a live product and want quick wins, start with usability testing on your most important journey, alongside a look at your analytics.

### How many participants do I need for user research?

For qualitative methods such as interviews and usability tests, five to eight people per round is a common starting point. Quantitative methods such as surveys and A/B tests need much larger samples, depending on how precise you need the result to be.

### Can AI replace user research with real people?

No. AI and synthetic approaches can speed up evaluative work, such as spotting findability or clarity problems, but they cannot tell you what real people need, feel or will pay for. Use them alongside research with real users, not instead of it.

### What is the difference between user research and usability testing?

User research is the whole discipline of learning about users. Usability testing is one evaluative method within it, focused on whether people can complete tasks with a product.
