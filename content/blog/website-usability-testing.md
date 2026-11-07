---
title: "Website Usability Testing: A Step-by-Step Guide"
description: "How to do website usability testing in eight steps: goals, tasks, participants, moderated vs unmoderated vs AI-simulated sessions, analysis and fixes."
date: 2026-11-07
keyword: "website usability testing"
readingTime: 10
---

Website usability testing is the practice of watching real or representative people try to complete specific tasks on your website, such as finding a price, buying a product or booking a demo, so you can see where they struggle and fix it. It measures behaviour, not opinion: whether people succeed, how long it takes, and where they hesitate or give up. This guide shows how to do usability testing on a website step by step, compares moderated, unmoderated and AI-simulated approaches, and covers how to turn what you see into changes that matter.

## Why website usability testing is worth the effort

Analytics tell you what happened, such as a drop-off at checkout step two, but rarely why. A usability test shows you the why: you watch someone scroll past the button they needed, misread a plan name, or open three tabs trying to find out whether you deliver to their country.

It is also cheaper than it sounds. You do not need a lab: a handful of sessions and an afternoon of analysis will usually surface problems that have been quietly costing you conversions.

What it will not do is tell you whether people want your product, how big your market is, or which of two prices is more profitable. Those need other methods. Our overview of [user research methods](/blog/user-research-methods) helps you pick the right one for the question you have.

## How to do usability testing on a website: eight steps

### Step 1: Decide what you need to learn

Start with two or three research questions, not a list of pages. Good questions are specific and tied to a business outcome:

- Can first-time visitors explain what we do after 30 seconds on the homepage?
- Can a budget holder find a price they could take to their manager?
- Can mobile shoppers complete checkout without help?

If a question would not change anything you build, drop it.

### Step 2: Choose your method

The main decision is how sessions are run: moderated, unmoderated, or AI-simulated. Each suits different questions, and the comparison table below covers them in detail. A rough rule:

- **Moderated** when you need to understand why, or when the product is complex.
- **Unmoderated** when the tasks are clear-cut and you want more sessions quickly.
- **AI-simulated** when you want fast, repeatable checks before or between rounds with people.

You also need to choose between in-person and remote usability testing. Remote is now the default for websites: participants use their own device in their own environment, and you can recruit beyond your city. In-person still helps for accessibility studies with assistive technology or audiences who are hard to reach online.

### Step 3: Write realistic tasks

Tasks are the heart of the test. Each one should give the participant a goal and a reason, without telling them where to click. "Go to the pricing page" is a bad task. "Your manager wants a rough monthly cost for a team of eight; find a figure you could send them" is a good one.

Write success criteria for each task before any session: what counts as complete, partial or failed. Our guide to [usability testing scenarios](/blog/usability-testing-scenarios) has a copyable template and good-vs-bad examples.

### Step 4: Recruit the right participants

Recruit people who match the visitors you care about, not colleagues or friends who already know the product. Use a short screener to filter by role, experience and the situation you are testing. Exclude anyone who works in UX, marketing or your industry if their expertise would distort the result.

How many? The well-known heuristic from Nielsen Norman Group is that around five users per round usually reveals most of the major usability problems for one set of tasks and one type of user. Two important caveats: it applies to qualitative, iterative testing, and each distinct audience (say, buyers and end users) needs its own group. If you need numbers you can report with confidence, such as task success rates, you need considerably more participants.

### Step 5: Prepare the script and environment

A simple script keeps sessions consistent:

1. **Welcome and consent.** Explain the session, recording and how data will be used.
2. **Reassurance.** "We are testing the website, not you. You cannot do anything wrong."
3. **Think-aloud instructions.** Ask them to say what they are looking at, thinking and expecting as they go.
4. **Background questions.** Two or three, to understand their context.
5. **Tasks.** One at a time, each followed by a short post-task question.
6. **Wrap-up.** Overall impressions, and a standard questionnaire such as the System Usability Scale (SUS) if you want a comparable score across rounds.

For the questions themselves, see our list of [usability testing questions](/blog/usability-testing-questions).

Check the environment too: test accounts work, nothing will charge a real card, and the device mix matches where your traffic comes from.

### Step 6: Pilot the test

Run the full session once with someone who did not write it. You will almost always find a task that is ambiguous, a link that is broken, or a script that runs too long. Fix it before the first real participant.

### Step 7: Run the sessions

If you are moderating, your main job is to stay quiet. Some practical habits:

- Let silences run. People often solve the problem, or reveal the cause, after a pause.
- Answer questions with questions: "What would you expect to happen?"
- Set a time limit per task and move on when it is reached, rather than rescuing people.
- Invite colleagues to observe quietly. Watching a real person struggle persuades more than any report.

For unmoderated tests, you cannot clarify anything during the session, so the task wording has to be clear on its own. Pilot it even more carefully.

### Step 8: Analyse, prioritise and fix

Straight after each session, write down the three things that stood out most while they are fresh. Once all sessions are done:

1. **Score each task attempt** as complete, partial or failed.
2. **List every observed problem** with the evidence: who, which task, what happened.
3. **Group duplicates** into distinct issues, written as plain statements, e.g. "Pricing is two clicks deep" or "Feature names change between pages".
4. **Rate severity** by how many participants hit it and whether it blocked the task, slowed it down, or was merely irritating.
5. **Suggest a fix** for each issue and assign an owner.
6. **Re-test** the same tasks after changes ship.

Keep the report short: a ranked list of issues, each with a clip, a severity and a proposed fix.

## Moderated vs unmoderated vs AI-simulated usability testing

These three approaches are complementary rather than competing. Here is how they compare in practice.

| | Moderated | Unmoderated | AI-simulated |
|---|---|---|---|
| **How it works** | A facilitator runs each session live, in person or over video, and can ask follow-up questions. | Participants complete tasks alone using a testing tool that records screen and voice. | AI personas with defined goals and behaviour attempt tasks on your live site in a real browser; each step is recorded. |
| **Who takes part** | Recruited real users | Recruited real users, often from a panel | No humans; simulated personas |
| **Time to results** | Days to weeks, mostly recruiting and scheduling | Hours to days | Minutes |
| **Depth of "why"** | Highest. You can probe motivation, expectations and feelings. | Medium. You hear think-aloud, but cannot ask follow-ups. | Shows step-by-step reasoning, but it is the model's reasoning, not a real person's. |
| **Best for** | Complex flows, early concepts, sensitive topics, understanding motivation | Clear tasks on live sites, larger samples, comparing versions | Fast checks for findability, clarity and broken paths; piloting tasks; re-testing after changes |
| **Main risks** | Facilitator bias; small samples; time-intensive | Participants misread tasks; low-effort sessions; no chance to clarify | Misses emotional reactions, trust, real context and accessibility needs; can behave differently from real people |
| **Cost driver** | Facilitator time and participant incentives | Tool subscription and incentives | Software subscription |
| **Repeatability** | Low; every session differs | Medium | High; the same personas and tasks can run again after every change |

### When to use each

- **Use moderated testing** when you need to understand why something happens, when the flow is complex or unfamiliar, or when you are still shaping the concept.
- **Use unmoderated testing** when tasks are straightforward, you want more sessions than you can facilitate, or you are comparing two versions on a live site.
- **Use AI-simulated testing** to get a fast first read before recruiting, to check tasks are clear and possible, and to re-run the same tasks after every release so regressions do not slip through.

A sensible rhythm: run AI-simulated tests on each significant change, fix the obvious problems, then spend your time with real participants on questions only people can answer.

## What to test on a typical website

If you are not sure where to start, these tasks cover the moments that most often decide whether a visitor converts:

- **Value proposition.** After 30 seconds on the homepage, can people say what you do and who it is for?
- **Navigation.** Can they find a specific piece of information, such as integrations, delivery areas or opening hours, without search?
- **Pricing.** Can they work out what they would pay, including billing period and any per-seat or per-unit costs?
- **Trust.** Can they find evidence that you are credible, such as case studies, reviews or security details, near where they make decisions?
- **Primary action.** Can they find and complete the main call to action, on both desktop and mobile?
- **Forms and checkout.** Can they complete them without errors, and do error messages help them recover?
- **Consistency.** Do product and feature names stay the same from page to page?

## Common mistakes in website usability testing

- **Testing with the wrong people.** Colleagues and power users know too much.
- **Leading tasks.** Using the interface's own words turns the task into a matching game.
- **Talking too much.** Every hint you give is a problem you will not see.
- **Asking for opinions instead of watching behaviour.** "Do you like this page?" tells you little.
- **Testing once.** It works best as a loop: test, fix, re-test.
- **Ignoring mobile.** A main button that is hard to spot on a small screen will not show up on desktop.

## A lightweight plan you can copy

```text
WEEK 1
- Write 2-3 research questions
- Draft 4-5 tasks with success criteria
- Run an AI-simulated pass to check tasks are clear and possible
- Fix obvious blockers found in that pass
- Write screener; start recruiting 5 participants per audience

WEEK 2
- Pilot the script with a colleague
- Run 5 moderated remote sessions (45 minutes each)
- Note top 3 observations after each session

WEEK 3
- Score tasks; group issues; rate severity
- Share a one-page ranked list with clips
- Ship fixes for the top issues
- Re-run the same tasks (simulated, then with people) to confirm
```

## Getting started without a research team

A useful first round needs only a video-call tool, five recruited participants and the steps above. For a quick read before that, [Phanera](/) runs AI-simulated usability tests on your live website. You paste a URL; it suggests tasks such as "Can a new visitor find pricing?", generates personas with different goals and levels of patience, and has each one attempt the task in a real browser. You get session replays with screenshots and the persona's reasoning at every step, plus prioritised findings with suggested fixes, in minutes. The first five tests are free. Treat the results as a fast first pass, not a substitute for real users: use them to fix the obvious problems, then put your real participants on the questions that need human judgement. Our guide to [AI usability testing](/blog/ai-usability-testing) covers the trade-offs.

## FAQ

### How many users do I need for website usability testing?

For qualitative testing, around five participants per audience per round usually reveals most major problems for a given set of tasks. Run several small rounds rather than one large one, and recruit separately for each distinct audience.

### What is remote usability testing?

Remote usability testing means participants take part from their own location, on their own device, rather than in a lab. It can be moderated over a video call or unmoderated through a testing tool. It is now the most common way to test websites.

### Is moderated or unmoderated testing better?

Neither is better overall. Moderated testing gives deeper insight into why people struggle and suits complex or early-stage work. Unmoderated testing is faster and scales better for clear tasks on live sites. Many teams use both.

### How long should a usability test session be?

Moderated sessions typically run 30 to 60 minutes with four to six tasks. Unmoderated sessions should be shorter, around 15 to 20 minutes, because participants lose focus without a facilitator.

### Can AI replace usability testing with real users?

No. AI-simulated testing is useful for fast, repeatable checks on findability, clarity and broken paths, but it cannot reproduce real emotions, trust, context or accessibility needs. Use it alongside testing with real people, not instead of it.
