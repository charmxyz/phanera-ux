---
title: "How to Write a Usability Testing Report (With Template)"
description: "A usability testing report turns sessions into decisions. Learn what to include, how to rate severity, and copy a simple template your team will actually read."
date: 2026-11-10
keyword: "usability testing report"
readingTime: 8
---

A usability testing report is a short document that turns what happened in your test sessions into decisions your team can act on. A good one answers three questions fast: what did we test, what went wrong, and what should we fix first. A bad one is a 40-page transcript dump that nobody opens after the meeting.

This guide covers what to put in a usability testing report, how to write findings people trust, how to rate severity, and a template you can copy. It works whether your sessions were with real participants or with AI personas.

## What a usability testing report is for

The report is not a record of everything that happened. It exists to change what the team builds next. That means its real readers are a product manager deciding priorities, a designer deciding what to rework and an engineer estimating fixes. Each of them wants different detail, so the report should be layered: a one-page summary on top, evidence underneath for anyone who wants to check it.

Keep that purpose in mind and most decisions become easy. If a section does not help someone decide what to fix, cut it or move it to an appendix.

## What to include

| Section | What goes in it | Length |
|---|---|---|
| Summary | The 3 to 5 most important findings and the recommended next step | Half a page |
| What we tested | Product, version or URL, date, tasks, participants or personas | A short list |
| Results by task | Completion rate, time or steps, and where people got stuck | A table |
| Findings | Each problem, its evidence, severity and a recommendation | The bulk of the report |
| What worked | Things people did easily, so nobody "fixes" them | A few bullets |
| Next steps | Owners, and what to retest | A short list |
| Appendix | Full task wording, raw notes, recordings | As long as needed |

### Summary first

Write the summary last, but put it first. Many readers will read only this part. Lead with the single biggest problem in plain language, for example: "4 of 5 participants could not find pricing from the home page because the link is hidden in the footer." Then list the other top findings in order of severity, and end with one clear recommendation.

### What you tested

Readers need context to judge the findings. Note the exact URL or build, the date, the tasks as you worded them, and who took part. If you tested with AI personas, say so and describe them. If you need help writing the tasks themselves, see our guide to [usability testing scenarios](/blog/usability-testing-scenarios).

### Results by task

A simple table makes patterns obvious at a glance:

| Task | Completed | Average steps | Main sticking point |
|---|---|---|---|
| Find the price of the Startup plan | 1 of 5 | 11 | Pricing link only in footer |
| Sign up for a free account | 5 of 5 | 4 | None |
| Invite a teammate | 2 of 5 | 9 | "Members" label not recognised |

Completion rate is the most useful number in the report. Time on task and number of steps help too, but only next to what caused the delay.

## How to write a finding

Each finding should stand on its own, so someone can copy it into a ticket. Use the same structure every time:

1. **What happened.** Describe the behaviour, not your interpretation. "Participants scrolled the home page twice, then opened the menu looking for pricing."
2. **Evidence.** How many people hit it, plus a screenshot, a quote or a timestamp in the recording.
3. **Why it matters.** The impact on the task or the business. "Visitors who cannot see the price are unlikely to start a trial."
4. **Severity.** See the scale below.
5. **Recommendation.** A concrete suggestion, not a full redesign. "Add Pricing to the main navigation."

Separate what you saw from what you think it means. "Three participants hesitated on the plan selector" is a fact. "The plan selector is confusing" is an interpretation. Both belong in the report, but readers should be able to tell which is which.

## Rating severity

A severity scale stops every finding looking equally urgent. Keep it to four levels and define them in the report so everyone uses them the same way:

| Severity | Meaning | Example |
|---|---|---|
| Critical | Stops people completing a key task | Checkout button does nothing on mobile |
| High | Many people struggle or need several attempts | Pricing hard to find from the home page |
| Medium | Causes delay or doubt, but people recover | Unclear label on a settings tab |
| Low | Cosmetic or rare | Inconsistent capitalisation in buttons |

Base severity on two things: how many people hit the problem, and how badly it blocked them. A problem one person hit that completely stopped them can still be critical if the task is core to your product.

## Common mistakes

- **Too long.** If your summary is longer than a page, it is not a summary.
- **No evidence.** Findings without a screenshot, quote or count are easy to dismiss in a prioritisation meeting.
- **Solutions disguised as findings.** "We need a new navigation" is a recommendation. Lead with the problem it solves.
- **Only bad news.** Listing what worked protects good design from being changed for no reason.
- **No owner.** A report with no next steps becomes a document people agree with and forget.

## A usability testing report template

Copy this structure and fill it in:

```text
USABILITY TESTING REPORT: [Product / page], [date]

SUMMARY
- Biggest problem: [one sentence, with how many people it affected]
- Other top findings: [2 to 4 bullets, highest severity first]
- Recommendation: [the one thing to do next]

WHAT WE TESTED
- URL / build:
- Tasks: [exact wording]
- Participants / personas: [number and short description]

RESULTS BY TASK
| Task | Completed | Avg steps or time | Main sticking point |

FINDINGS
[Finding title] - Severity: [Critical / High / Medium / Low]
- What happened:
- Evidence: [count, screenshot, quote, timestamp]
- Why it matters:
- Recommendation:

WHAT WORKED
- 

NEXT STEPS
- [Fix] - owner - retest by [date]

APPENDIX
- Task scripts, raw notes, recordings
```

If you are still planning the sessions, pair this template with our list of [usability testing questions](/blog/usability-testing-questions) so the report has the evidence it needs.

## Reporting on AI usability tests

The same structure works for tests run with AI personas, with two extra points. First, say clearly that the sessions were simulated, and describe each persona's goal and context so readers can judge how realistic the behaviour was. Second, check every high-severity finding against the screenshots or replay before it goes in the report. Mechanical problems, such as a broken link or a hidden button, are easy to confirm. Claims about how people would feel are not, and they should be marked as questions for research with real users. Our guide to [AI usability testing](/blog/ai-usability-testing) covers where simulation is reliable and where it is not.

[Phanera](/) produces this kind of report automatically: personas attempt your tasks in a real browser, an independent AI reviewer checks the sessions, and you get findings ranked by severity with screenshots and step-by-step replays. Your first five tests are free, and you can share the report with your team using a single link.

## FAQ

### How long should a usability testing report be?

Most readers only need one page: the summary and the top findings. Put detailed findings after that and raw notes in an appendix. Five to ten pages in total is plenty for most rounds of testing.

### What is the difference between a usability testing report and a research report?

A usability testing report evaluates whether people can use a specific interface to complete specific tasks. A broader research report might cover needs, motivations or market questions, using methods like interviews or surveys. See our overview of [user research methods](/blog/user-research-methods) for how they fit together.

### Should I include video clips?

Yes, when you can. A 20-second clip of someone failing to find a button convinces people faster than any paragraph. Link clips or timestamps from each finding rather than embedding everything in the document.

### How many findings should a report have?

As many as you found, but the summary should highlight no more than five. If everything is a priority, nothing is.

### Who should write the usability testing report?

Whoever ran or watched the sessions, ideally soon afterwards while details are fresh. Reviewing the draft with a designer and an engineer before sharing it widely helps make the recommendations realistic.
