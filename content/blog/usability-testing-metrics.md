---
title: "Usability Testing Metrics: What to Measure and How"
description: "The usability testing metrics that matter: completion rate, time on task, errors, SEQ, SUS and more, with formulas, benchmarks, sample sizes and a reporting table."
date: 2026-11-20
keyword: "usability testing metrics"
readingTime: 10
---

Usability testing metrics are the numbers you collect during a usability test to show how well people can use a product. The core set covers three things: **effectiveness** (did they finish the task?), **efficiency** (how much time and effort did it take?) and **satisfaction** (how did it feel?). In practice that means task completion rate, time on task, errors, a post-task ease rating such as the Single Ease Question (SEQ), and a post-test score such as the System Usability Scale (SUS).

This guide explains each metric, how to calculate it, what a good result looks like, and how many participants you need before the numbers mean anything. It ends with a table you can copy into your report.

## Why measure usability at all?

Watching sessions tells you *what* went wrong. Metrics tell you *how much* it matters and whether things are getting better. They help in three situations:

- **Prioritising.** "2 of 8 people completed checkout" ends a debate faster than "checkout felt a bit confusing".
- **Comparing.** Old design against new, your product against a competitor, or this release against the last one.
- **Setting targets.** "90% of new users can invite a teammate without help" is a goal a team can design towards and check.

Metrics do not replace observation. A completion rate tells you a task is failing, not why. Always pair the numbers with the evidence behind them.

## The three dimensions of usability

The international standard for usability, ISO 9241-11, defines it as the extent to which specified users can achieve specified goals with effectiveness, efficiency and satisfaction in a specified context of use. Most usability testing metrics map onto those three words:

| Dimension | Question it answers | Main metrics |
|---|---|---|
| Effectiveness | Can people do it? | Task completion rate, error rate |
| Efficiency | How much effort does it take? | Time on task, number of steps, lostness |
| Satisfaction | How does it feel? | SEQ (per task), SUS or UMUX-Lite (per test) |

A good scorecard has at least one metric from each row. A design that people can complete but hate using is not usable, and neither is one they enjoy but cannot finish.

## Effectiveness metrics

### Task completion rate

The most important usability metric. It is the share of participants who completed a task successfully.

```text
Completion rate = participants who completed the task / participants who attempted it
```

Define success before the first session, and make it binary: the participant either reached the right end state or did not. "Found the pricing page" is vague. "Stated the monthly price of the Team plan correctly" is testable. If you allow partial credit, report it separately rather than blending it into the main number.

**What is good?** An analysis of around 1,100 tasks by MeasuringU put the average completion rate at about 78%. Treat that as a rough reference, not a target. A core task like signing up or paying should be well above it, and anything below about 70% on a key task deserves attention.

### Error rate

An error is any action that takes the participant away from the goal: a wrong click, a field filled in incorrectly, a dead end they have to back out of. Count them per task, and decide in advance what counts.

```text
Error rate = total errors / total opportunities for error
```

If counting opportunities is impractical, report the average number of errors per participant per task instead. Note which errors people recovered from on their own and which caused failure. A form that rejects a valid phone number twice before accepting it is a different problem from one that rejects it forever.

## Efficiency metrics

### Time on task

How long a participant takes to complete a task, from the moment they start to the moment they reach the success state. Only include successful attempts in the main figure, and report failures separately. Otherwise a person who gave up after 20 seconds makes the task look fast.

Task times are skewed: most people finish in a similar time, and a few take much longer. With small samples, the **geometric mean** describes a typical time better than the ordinary average, which a single slow participant can drag up. A spreadsheet will calculate it for you (`GEOMEAN` in Excel and Google Sheets). The median also works if you have more than about 25 participants.

Time on task only means something next to a comparison: a previous version, a competitor, or an expert's time on the same task. An expert completing the task in 40 seconds when participants average three minutes tells you far more than "three minutes" alone.

### Number of steps and lostness

Counting steps (page views, screens or clicks) against the shortest possible path shows how much people wander. A simple version:

```text
Path efficiency = minimum steps needed / steps taken
```

A more formal measure is **lostness**, proposed by Pauline Smith in 1996 for navigating hypertext:

```text
Lostness = √[ (N/S − 1)² + (R/N − 1)² ]

S = total pages visited (counting repeats)
N = different pages visited
R = minimum pages needed to complete the task
```

A score of 0 means the participant took the ideal path. Scores below about 0.4 suggest people were not lost. Above 0.5, they usually were. Lostness is especially useful for navigation and information architecture tests, where time alone can hide a lot of backtracking.

## Satisfaction metrics

### Single Ease Question (SEQ)

Ask it straight after each task:

```text
Overall, how difficult or easy was this task to complete?
1 = Very difficult ... 7 = Very easy
```

It takes a few seconds and correlates well with completion and time. The average across many studies sits at roughly 5.5, so a task scoring below 5 is harder than most. Follow a low score with "What made it difficult?" to get the reason. For more post-task prompts, see our list of [usability testing questions](/blog/usability-testing-questions).

### System Usability Scale (SUS)

SUS is a ten-item questionnaire given once, at the end of the session. It produces one score from 0 to 100 that you can compare across rounds, products and industries. It is not a percentage, which is a common misreading.

To score it:

1. For odd-numbered items (1, 3, 5, 7, 9), subtract 1 from the answer.
2. For even-numbered items (2, 4, 6, 8, 10), subtract the answer from 5.
3. Add the ten results and multiply by 2.5.

The average SUS score across hundreds of studies is about 68. Above 80 puts a product roughly in the top 10%. Below about 50 suggests serious problems. The full questionnaire is in our [usability testing template](/blog/usability-testing-template) kit, ready to copy.

### UMUX-Lite

If ten questions is too many, UMUX-Lite uses two items on a 7-point scale: "This system's capabilities meet my requirements" and "This system is easy to use". It tracks SUS closely and suits in-product surveys where every question costs you responses.

## Metrics people use that do not measure usability

- **Net Promoter Score.** Whether someone would recommend you reflects price, brand and support as much as usability. Fine to collect, but do not call it a usability score.
- **Page views and time on site.** In analytics, more time can mean more interest or more confusion. You cannot tell which without watching.
- **"Liked it" ratings from a demo.** Opinions about a design someone did not use are predictions, not measurements.

## How many participants do you need?

It depends on what the numbers are for.

**Finding problems (formative testing).** Around five participants per round, per type of user, usually reveals most of the major issues. Report counts ("4 of 5") rather than percentages, because a percentage implies a precision you do not have.

**Measuring (summative testing).** Small samples give very wide margins of error. Suppose 4 of 5 people complete a task. The observed rate is 80%, but a 95% confidence interval, calculated with the adjusted Wald method recommended for small samples, runs from about 36% to 97%. With 16 of 20 completing, the same 80% narrows to roughly 58% to 92%. Nielsen Norman Group suggests at least 20 participants per group for quantitative studies, and more if you need to detect small differences between designs.

To calculate the adjusted Wald interval at 95% confidence, add 2 to the successes and 4 to the attempts, then apply the usual formula:

```text
p = (successes + 2) / (attempts + 4)
n = attempts + 4
Interval = p ± 1.96 × √( p × (1 − p) / n )
```

Report the interval alongside the rate whenever you share numbers outside the research team. It stops a 20-point swing between two rounds of five people from being presented as a real improvement.

## Choosing metrics for your test

You do not need every metric in every study. Pick based on the decision the test supports:

| Your goal | Use | Skip |
|---|---|---|
| Find and fix problems in a prototype | Completion (as counts), observed errors, SEQ | Time on task, SUS |
| Check a redesign is better | Completion rate, time on task, SEQ, SUS on both versions | Lostness, unless navigation changed |
| Test navigation or information architecture | Completion rate, lostness or path efficiency | SUS |
| Track usability over releases | Completion rate, SEQ, SUS with the same tasks each time | Anything you cannot collect the same way twice |
| Benchmark against a competitor | Completion rate, time on task, SUS, with 20 or more participants | Small-sample percentages |

Whatever you choose, decide before the first session and collect it the same way for everyone. Our guide to [usability testing scenarios](/blog/usability-testing-scenarios) covers writing tasks with clear success criteria, which every metric here depends on.

## How to report usability metrics

Show results per task, then the overall score. A table like this works for most audiences:

```text
| Task | Completed | 95% CI | Time (geo mean, successes) | Errors / person | SEQ |
|------|-----------|--------|----------------------------|-----------------|-----|
| Find the Team plan price | 14 of 20 (70%) | 48–85% | 1m 52s | 1.4 | 4.6 |
| Sign up for a free trial | 19 of 20 (95%) | 74–100% | 1m 10s | 0.3 | 6.3 |
| Invite a teammate | 11 of 20 (55%) | 34–74% | 2m 35s | 2.1 | 4.1 |

SUS: 64 (previous release: 59, industry average: about 68)
```

Then, for each task that missed its target, explain *why* with evidence: screenshots, quotes, and the step where people went wrong. Numbers say where to look. Observation says what to change. Our guide to writing a [usability testing report](/blog/usability-testing-report) covers turning those findings into ranked recommendations.

A few rules keep metrics honest:

- **Keep tasks identical across rounds.** Change the wording and you have a new task, not a comparison.
- **Do not average across tasks.** A 95% sign-up rate does not cancel out a 55% invite rate.
- **Show failures, not just averages.** "3 people never found the invite button" is more useful than a slightly lower mean.
- **Say who took part.** Metrics from five colleagues and metrics from 20 target customers are not the same thing.

## Usability metrics with AI personas

AI personas, which are AI agents given a goal and a profile that attempt tasks in a real browser, can produce some of these metrics automatically. Completion, steps taken, dead ends and errors such as rejected form inputs are all recorded as the agent works, so they are cheap to collect on every release.

Treat them as formative signals, though. An agent's task time does not predict a person's, and its "ease" rating is not a satisfaction score from a real user. They work best for spotting regressions: if a task that agents completed in 6 steps last week now takes 14, or stops completing at all, something changed and is worth a look before real users find it. Keep SUS, SEQ and any benchmark you publish for sessions with real people. Our guide to [AI usability testing](/blog/ai-usability-testing) covers where simulation is reliable and where it is not.

[Phanera](/) runs this kind of test for you: personas attempt your tasks in a real browser, and the report shows which tasks they completed, how many steps each took and where they got stuck, with screenshots and step-by-step replays. Your first five tests are free.

## FAQ

### What are the most important usability testing metrics?

Task completion rate, time on task, errors and a satisfaction measure. If you can only collect one, collect completion rate: a task people cannot finish is a problem however fast or pleasant the failed attempts were.

### What is a good task completion rate?

Across many studies the average is around 78%. For core tasks such as signing up, paying or the main job your product does, aim much higher, usually 90% or more. What counts as good depends on how important and how complex the task is.

### What is a good SUS score?

About 68 is average. Scores above 80 are excellent and put a product roughly in the top 10%. Scores below 50 point to serious usability problems. Remember that SUS is a score out of 100, not a percentage.

### What is the difference between qualitative and quantitative usability testing?

Qualitative testing watches a small number of people to find problems and understand why they happen. Quantitative testing measures a larger group to produce numbers you can compare and report with confidence. Most teams run qualitative rounds often and quantitative benchmarks occasionally. Our overview of [user research methods](/blog/user-research-methods) shows where each fits.

### Can I report percentages from five participants?

You can, but you should not without the margin of error. With five people, an 80% completion rate could plausibly be anything from about 36% to 97%. Report counts such as "4 of 5" instead, and save percentages for studies with 20 or more participants.

### Should time on task include failed attempts?

Report successful and failed attempts separately. Including failures in the main average mixes two different behaviours: people who gave up quickly can make a broken task look fast, and people who struggled for ten minutes before quitting can make it look slow.
