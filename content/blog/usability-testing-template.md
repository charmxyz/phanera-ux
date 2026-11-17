---
title: "Usability Testing Template: Plan, Script, Checklist and Report"
description: "A free usability testing template kit: test plan, session script, note sheet, checklist, SUS questionnaire and a summative report, with tips for choosing the right one."
date: 2026-11-17
keyword: "usability testing template"
readingTime: 10
---

A usability testing template is a fill-in-the-blanks document that keeps a test consistent from planning to report. Most teams need more than one: a **test plan** to agree what you are testing, a **session script** so every participant hears the same thing, a **note sheet** to capture what happened, a **checklist** so nothing is forgotten on the day, and a **report** that turns it all into decisions.

This page gives you all six as plain text you can copy into a doc, a spreadsheet or Figma. It also covers how to choose the right template for the kind of test you are running, because a template built for spotting problems is the wrong tool for measuring a score, and the other way round.

## Which usability testing template do you need?

Start with the question your test has to answer. That decides the template more than the tool you use.

| Your question | Type of test | Templates you need |
|---|---|---|
| "Where do people get stuck, and why?" | Formative (find problems while you can still change the design) | Plan, script, note sheet, checklist, findings report |
| "How usable is it, in numbers?" | Summative (measure against a target or a previous version) | Plan, script, note sheet, checklist, SUS, summative report |
| "Is the new version better than the old one?" | Comparative summative | Same as summative, with the same tasks run on both versions |
| "Can people find X in our navigation?" | Tree test or first-click test | A shorter plan plus a task list; the tool records the results |

**Formative** testing is the everyday kind. You watch a handful of people try tasks, spot problems, fix them, and test again. The output is a list of findings ranked by severity.

**Summative** testing comes later, when the design is close to done. You run the same tasks with more people and report numbers: completion rate, time on task, errors and a satisfaction score. The output is a scorecard you can compare against a target or a past round.

Most templates online mix the two, which is why reports often end up with percentages from five people. Pick one type per round and use the matching templates below.

## Tips for choosing the right usability testing template

- **Match the template to the decision.** If the team is deciding what to fix, use a formative template. If they are deciding whether to ship, or proving an improvement, use a summative one.
- **Keep the task wording in one place.** Your plan, script and report should all quote the same tasks word for word. If they drift, your results stop being comparable.
- **Prefer short over complete.** A one-page plan that everyone reads beats a ten-page plan nobody opens. Delete sections you will not use.
- **Choose the format your team already works in.** A Google Doc for the plan and report and a spreadsheet for notes is enough. A specialist tool only helps if people will actually open it.
- **Decide your metrics before the first session.** Adding "time on task" after the fact means you were not timing consistently.
- **Plan for the report on day one.** If the report needs screenshots, a count of who failed each task and quotes, make sure the note sheet captures them.

## 1. Usability test plan template

The plan is how you get agreement before anyone books a participant. Keep it to a page.

```text
USABILITY TEST PLAN: [Product / feature], [round or version]

PURPOSE
- What we want to learn: [one or two questions]
- Decision this informs: [what will change based on the results]
- Test type: [Formative / Summative / Comparative]

WHAT WE ARE TESTING
- URL, build or prototype link:
- Device(s): [desktop / mobile / both]
- Out of scope:

PARTICIPANTS
- Who: [role, experience, the behaviour that qualifies them]
- How many: [5 to 8 for formative, 20+ for summative]
- Recruiting from: [customers, panel, colleagues outside the team, AI personas]
- Incentive:

TASKS (exact wording)
1. [Scenario + task]
2.
3.

METRICS
- Task completion (pass / partial / fail)
- [Time on task, errors, SUS: summative only]

LOGISTICS
- Moderated or unmoderated:
- Dates and session length:
- Facilitator / note-taker:
- Recording and consent:

SUCCESS LOOKS LIKE
- [e.g. 4 of 5 people complete task 1 without help]
```

The hardest section is the tasks. Our guide to [usability testing scenarios](/blog/usability-testing-scenarios) has a template for writing them, with good and bad examples.

## 2. Session script template

A script keeps sessions consistent, especially when more than one person facilitates. Read the opening word for word, then use the rest as a guide.

```text
INTRO (about 3 minutes)
"Thanks for helping us today. We're testing the website, not you,
so there are no wrong answers. If something is confusing, that's
exactly what we need to hear. Please think out loud as you go:
say what you're looking at, what you expect, and what surprises you.
I may not answer questions during the tasks, because I want to see
what you would do on your own. Is it OK if we record the screen
and audio? [Wait for consent.] Any questions before we start?"

WARM-UP (2 to 3 minutes)
- "Tell me a little about your role."
- "When did you last [do the thing this product helps with]?"

TASKS (repeat for each task)
- Read the scenario aloud, then share it in writing.
- Stay quiet. If they're stuck for 2+ minutes, ask:
  "What are you looking for?" / "What would you do next?"
- After each task: "How easy or hard was that, from 1 to 7?"

WRAP-UP (5 minutes)
- "What was the most frustrating part?"
- "What, if anything, stood out as working well?"
- "Is there anything you expected to see that wasn't there?"
- Thank them and explain the incentive.
```

For more questions you can drop into each stage, see our list of [usability testing questions](/blog/usability-testing-questions).

**Unmoderated tests** need the same intro and tasks, written as on-screen instructions. Add one line telling participants what counts as finished ("When you think you've found it, click Done"), because no one is there to tell them.

## 3. Note sheet template

Notes are where most reports fall apart. A shared spreadsheet with one row per observation makes the report almost write itself.

| Participant | Task | Result | Time / steps | What happened | Quote | Screenshot or timestamp | Severity |
|---|---|---|---|---|---|---|---|
| P1 | 1. Find Startup price | Fail | 4:10 | Scrolled home page twice, opened menu, gave up | "I'd assume it's expensive if they hide it" | 03:42 | High |
| P2 | 1. Find Startup price | Pass | 1:05 | Found the link in the footer | | 01:01 | |
| P1 | 2. Sign up | Pass | 0:50 | No issues | | | |

Two rules make the sheet useful later:

1. **Write what people did, not what you think it means.** "Hovered over Pricing three times without clicking" is a note. "Pricing is confusing" is a conclusion, and it goes in the report.
2. **Log a timestamp or screenshot for anything you might report.** Evidence is what gets a finding prioritised instead of argued about.

## 4. Usability testing checklist

Use this checklist the day before and the day of each round.

```text
BEFORE
[ ] Plan agreed with product, design and engineering
[ ] Tasks piloted with one colleague (wording clear, tasks possible)
[ ] Test environment works: right URL, test account, sample data
[ ] Participants confirmed, with time zone and device
[ ] Consent form and recording set up
[ ] Note sheet shared with observers
[ ] Incentives ready

DURING
[ ] Read the intro word for word
[ ] Same task wording for every participant
[ ] Don't help, hint or explain the design
[ ] Note timestamps for key moments
[ ] Reset the environment between sessions (log out, clear cart)

AFTER
[ ] Debrief with observers within the hour
[ ] Fill gaps in the note sheet while it's fresh
[ ] Group observations into findings, then rate severity
[ ] Write the report summary first, share within a week
[ ] Book the retest
```

The piloting step is the one teams skip most often, and it costs the most. A task that is worded badly, or impossible on the test build, can waste a whole day of sessions.

## 5. SUS questionnaire

The System Usability Scale (SUS) is the most widely used post-test questionnaire. It gives you one number from 0 to 100 that you can compare across rounds and products. Use it in summative tests, straight after the last task.

Participants rate each statement from 1 (strongly disagree) to 5 (strongly agree):

1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

**Scoring.** For odd-numbered items, subtract 1 from the answer. For even-numbered items, subtract the answer from 5. Add the ten results and multiply by 2.5. An average score across many studies is about 68, so treat anything well below that as a sign of real problems.

You can replace "system" with "website" or your product name. Don't change anything else, or your score is no longer comparable with other SUS results.

## 6. Usability testing report templates

### Formative report

For a formative round, the report is a ranked list of findings with evidence. We cover it in detail, including a severity scale and a copyable template, in [how to write a usability testing report](/blog/usability-testing-report).

### Summative usability test report template

A summative report leads with numbers, then explains them. Use it when you need to show whether a design meets a target or beats a previous version.

```text
SUMMATIVE USABILITY TEST REPORT: [Product], [version], [date]

SUMMARY
- Overall: [e.g. 3 of 4 tasks met the 80% completion target]
- SUS: [score] (previous round: [score], target: [score])
- Biggest gap: [the task furthest below target and why]
- Recommendation: [ship / fix X first / retest]

METHOD
- Participants: [number, who, how recruited]
- Moderated or unmoderated, device, dates
- Tasks: [exact wording]
- Success criteria for each task

RESULTS BY TASK
| Task | Completion | Avg time | Errors | Ease (1 to 7) | Target met? |
|------|------------|----------|--------|---------------|-------------|

COMPARISON (if comparative)
| Metric | Previous version | This version | Change |

WHAT CAUSED THE MISSES
- [Task]: [what people did, with evidence]

NEXT STEPS
- [Fix] - owner - retest by [date]

APPENDIX
- Per-participant results, SUS answers, recordings
```

Report numbers with the sample size next to them ("14 of 20 completed", not "70%"). With small samples, a percentage on its own suggests more certainty than you have.

## How many participants does each template assume?

For **formative** testing, five to eight people per round is the usual guidance. Jakob Nielsen's well-known argument is that about five users uncover most of the problems in a design, and you learn more by running three small rounds with fixes in between than one large one.

For **summative** testing, you need more: often 20 or more per group, because you are estimating numbers rather than spotting problems. With five people, one person changing their mind moves your completion rate by 20 points.

If you are new to the whole process, our step-by-step guide to [website usability testing](/blog/website-usability-testing) covers recruiting, moderated vs unmoderated sessions and analysis.

## Using these templates with AI personas

You can run the same plan and tasks with AI personas before you recruit anyone. It is a quick way to pilot your tasks and catch mechanical problems first, such as broken links, hidden buttons or forms that reject valid input, so real participants' time goes on the questions only people can answer. Treat simulated results as formative: they find problems well, but they are not a substitute for a summative score from real users. Our guide to [AI usability testing](/blog/ai-usability-testing) explains where simulation is reliable and where it is not.

[Phanera](/) does this for you: give it your site and a task, and personas attempt it in a real browser. You get a report with findings ranked by severity, screenshots and step-by-step replays, in the same shape as the report templates above. Your first five tests are free.

## FAQ

### What should a usability testing template include?

At minimum: the purpose of the test, who you are testing with, the exact task wording, how you will measure success, and where notes and results go. That is the plan. Most teams also use a session script, a note sheet and a report template so every round is run and written up the same way.

### What is the difference between formative and summative usability testing?

Formative testing finds problems during design, with small groups and quick iterations, and produces a list of findings. Summative testing measures usability once the design is close to done, with larger groups, and produces numbers such as completion rate, time on task and a SUS score.

### Is there a usability testing template for Excel or Google Sheets?

The note sheet and the results tables above work as spreadsheets: copy the column headings into the first row. Keep the plan, script and report in a document, where longer text is easier to read and comment on.

### What is the 5-user rule in usability testing?

It is the idea that testing with about five users reveals most of the usability problems in a design. It applies to formative testing, where the goal is finding problems. It does not apply to summative testing, where you need more people to get reliable numbers.

### How do I write a summative usability test report?

Lead with a summary of the results against your targets, then show each task's completion rate, time, errors and ease rating in a table, plus the SUS score. Explain what caused the misses with evidence, and finish with a clear recommendation. Use the summative template above as a starting point.
