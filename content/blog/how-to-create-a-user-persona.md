---
title: "How to Create a User Persona (With Free Template)"
description: "How to create a user persona in seven practical steps, from research to synthesis, plus a free user persona template you can copy and a filled-in example."
date: 2026-11-07
keyword: "how to create a user persona"
readingTime: 10
---

To create a user persona, gather evidence about real users (interviews, usability tests, support tickets, analytics), look for patterns in their goals and behaviour, group people who act alike, then write each group up as one specific person with a goal, context, motivation, frustrations and level of patience. Finally, check it with the team and use it to plan research and design decisions. That is how to create a user persona in one paragraph. The rest of this guide walks through each step, gives you a copyable user persona template, and shows a filled-in example.

If you are new to the idea, start with [what is a user persona](/blog/what-is-a-user-persona) for the definition and the main types.

## Before you start: decide what the persona is for

Personas made "because we should have personas" tend to be ignored. Before collecting anything, write one sentence on what decision the personas will help with. For example:

- "Redesign the website navigation so first-time visitors can find what they need."
- "Decide which onboarding steps to cut for small teams."
- "Choose who to recruit for next quarter's usability tests."

This keeps the scope tight.

Also decide early whether you are making **proto-personas** (assumption-based, quick, to be validated) or **research-based personas** (built from evidence). Both are legitimate. The mistake is presenting the first as the second.

## How to create a user persona in 7 steps

### Step 1: Gather what you already know

Most teams have more evidence than they think. Collect:

- Support tickets and live chat transcripts
- Sales call notes and the questions prospects ask most
- Analytics: top entry pages, devices, search terms, where people drop off
- Survey responses and reviews
- Recordings or notes from any past usability tests

Write down every claim you find about users as a separate note, with its source. "Prospects often ask whether it works with Slack (sales notes, March)" is useful. "Users want simplicity" is not, unless you can say who said it and in what context.

### Step 2: Fill the gaps with user research

Existing data rarely tells you why people behave as they do. For that you need to talk to and watch real users. The usual approach:

- **Interviews.** Five to eight per likely segment is a reasonable starting point. Ask about their situation, goals and recent behaviour, not about your product's features.
- **Observation or usability testing.** Watch people attempt real tasks. What people do often differs from what they say.
- **Short surveys** to check how common a pattern is once you have spotted it qualitatively.

Useful interview prompts:

- "Tell me about the last time you needed to [solve this problem]. What happened?"
- "What did you try first? What did you do next?"
- "What nearly made you give up?"
- "Who else was involved in the decision?"
- "How did you know it was working?"

Avoid leading questions such as "Would you find a comparison page useful?" People are polite and will say yes. Our list of [usability testing questions](/blog/usability-testing-questions) covers how to phrase questions neutrally. For choosing between interviews, surveys and other techniques, see [user research methods](/blog/user-research-methods).

### Step 3: Find the patterns

Put all your notes in one place (sticky notes, a whiteboard tool or a spreadsheet) and group them. This is often called affinity mapping. Look for clusters around:

- Goals: what people are ultimately trying to achieve
- Triggers: what made them start looking
- Behaviours: how they search, compare, read and decide
- Barriers: what slows them down or makes them leave
- Knowledge: how much they already understand about the problem and your category

A helpful technique is to plot participants on a few behavioural scales, for example:

| Scale | One end | Other end |
|---|---|---|
| Urgency | Just browsing | Must decide this week |
| Expertise | New to the category | Has used three competitors |
| Reading style | Skims headlines | Reads every detail |
| Decision role | Decides alone | Needs sign-off from a manager |

When the same people keep landing near each other across several scales, you have probably found a persona.

### Step 4: Choose a small set of personas

Aim for three to five personas, and mark one or two as primary. A primary persona is one whose needs, if met, mostly satisfy the others too, or whose needs are most important to the business.

Merge groups that would lead to the same design decisions. If two clusters differ only in job title but behave identically on your site, they are one persona.

### Step 5: Write each persona up

Now turn each cluster into one person. Use the template below. A few rules:

- **Lead with the goal.** It is the attribute designers use most.
- **Describe behaviour concretely.** "Opens pricing in a new tab and compares it with two competitors" beats "price sensitive".
- **Include patience.** How long will they give you? This drives a surprising number of decisions.
- **Use a representative quote** drawn from, or closely based on, what real participants said.
- **Leave out irrelevant detail.** Hobbies and a stock photo rarely help. Add demographic detail only when it changes behaviour, such as accessibility needs or a strong device preference.
- **Note your evidence.** List how many participants or sources support this persona. It keeps you honest and helps future readers judge how confident to be.

### Step 6: Review with the team

Share drafts with people who talk to customers: support, sales, customer success. Ask two questions:

1. "Do you recognise this person? Who is it like?"
2. "What is wrong or missing?"

If nobody recognises a persona, it is probably a composite of too many different people. Split it or drop it.

### Step 7: Put the persona to work, and keep it current

A persona earns its place when it changes what you build or test. Practical ways to use it:

- Write usability test tasks from each persona's goal. Our guide to [usability testing scenarios](/blog/usability-testing-scenarios) shows how.
- Use the persona's key attributes as a recruitment screener.
- Review new designs by asking what each primary persona would do in the first ten seconds.
- Add a date and an owner to each persona, and revisit them at least once a year, or whenever research contradicts them.

## User persona template

Copy this user persona template into your docs tool, design file or wiki. Every field has a short prompt to help you fill it in. Delete any field that does not help your team make decisions.

```markdown
## Persona: [Name], the [short descriptor]

> "[A representative quote that captures their attitude]"

**Primary or secondary:** [Primary / Secondary]
**Last updated:** [Date]   **Owner:** [Name]
**Evidence:** [e.g. 6 interviews, 3 usability sessions, 40 support tickets]

### Summary
[Two sentences: who they are and what they want from you.]

### Goal
[What they are trying to achieve, in their own words.]

### Trigger
[What happened that made them start looking now.]

### Context
- Device and setting: [e.g. phone, between meetings]
- How they arrived: [e.g. search, a colleague's link, an ad]
- Others involved: [e.g. needs a manager's approval]

### Motivation
[Why it matters to them. What happens if they do nothing?]

### Behaviour
- [How they search, browse, compare and decide]
- [What they read closely and what they skip]
- [Tools or alternatives they already use]

### Knowledge and skills
- Domain knowledge: [Low / Medium / High, with a note]
- Technical confidence: [Low / Medium / High, with a note]
- Accessibility needs: [If any are relevant]

### Frustrations and barriers
- [What has gone wrong for them before]
- [What would make them leave]

### Patience
[How long they will give you, and what makes them give up.]

### What success looks like
[How they know they got what they came for.]

### Design implications
- [Concrete thing this means for the product or site]
- [Another one]

### Typical tasks to test
- [A realistic task, e.g. "Find the price for a team of ten"]
- [Another]
```

If you prefer a one-page table, here is a compact version:

| Field | Prompt |
|---|---|
| Name and descriptor | "[Name], the [descriptor]" |
| Quote | One line that captures their attitude |
| Goal | What they are trying to achieve |
| Trigger | Why they are looking now |
| Context | Device, setting, how they arrived, who else is involved |
| Motivation | Why it matters, cost of doing nothing |
| Behaviour | How they search, compare, read and decide |
| Knowledge | Domain and technical confidence |
| Frustrations | What has failed before, what makes them leave |
| Patience | How long before they give up |
| Success | How they know they are done |
| Design implications | Two or three concrete consequences |
| Tasks to test | Two or three realistic tasks |
| Evidence | Sources and number of participants |

## A filled-in example

Here is the template completed for a hypothetical project management tool's website. It is kept deliberately short, because short personas get read.

> **Persona: Dana, the budget owner**
>
> "I need a number and a reason I can take to my boss."
>
> **Primary.** Evidence: 5 interviews, 12 sales call notes, pricing page analytics.
>
> **Goal:** Find out what the tool costs for a team of twelve and whether it is worth switching from spreadsheets.
>
> **Trigger:** Her manager asked for a recommendation by Friday after a missed deadline.
>
> **Context:** Desktop at work, three competitor tabs open, arrived from a search for "project tracking for small teams".
>
> **Behaviour:** Goes straight to pricing. Reads plan limits carefully. Looks for customer logos or case studies near the price. Copies key figures into a message to her manager.
>
> **Frustrations:** "Contact sales" instead of a price. Plan names that do not explain what is included. Having to start a trial to see basic features.
>
> **Patience:** About five minutes. Will close the tab if she cannot find a price in the first minute.
>
> **Success:** She has a monthly cost, a list of what is included and one reason to choose this tool.
>
> **Design implications:** Pricing one click from every page. Plan comparison table with plain-English limits. Some form of proof near the price.
>
> **Tasks to test:** "Find out how much this would cost for a team of twelve." "Decide which plan you would recommend and why."

Notice how much of this is about behaviour and decisions, and how little is about Dana's age, hobbies or appearance.

## Common mistakes when creating personas

The usual failures are skipping research, making too many personas, averaging contradictory people into one, leading with demographics, and never linking a persona to a test task. One more: a persona that blends everyone describes nobody, so keep the edges.

## Can AI help you create personas?

Yes, with care. AI tools can help you synthesise interview notes, spot patterns across support tickets, or draft a first persona from your research. The risk is that a model will happily invent plausible details that are not in your data, and plausible is not the same as true. Always check generated personas against your evidence, and remove anything you cannot trace back to a source. Our guide to the [AI persona generator](/blog/ai-persona-generator) approach covers prompts and how to validate the output.

AI can also help after the persona exists. With [Phanera](/), you paste your website's URL and it suggests personas and tasks based on your pages, or you can edit them or describe your own, for example by pasting in Dana's goal, behaviour and patience. Each AI persona then attempts the task on your live site in a real browser, and you get a report with session replays, the persona's reasoning at each step and prioritised findings. It is not a substitute for real users: an AI persona only knows what you describe and what it can see, so use it to catch obvious problems early and to sharpen what you test with real people.

## FAQ

### How long does it take to create a user persona?

A proto-persona workshop can take an afternoon. Research-based personas typically take a few weeks, most of it spent running and synthesising interviews and usability sessions.

### How many people should I interview to create a persona?

There is no fixed number, but five to eight interviews per likely segment is a common starting point. Stop when new interviews stop revealing new patterns.

### What should a user persona template include?

At minimum: a goal, context, behaviour, frustrations, patience and design implications. A quote, trigger, success criteria and a note of your evidence make it more useful.

### Should personas include a photo and demographics?

Only if they help. Photos can introduce bias and demographic detail rarely changes design decisions. Include attributes such as device, expertise or accessibility needs when they genuinely affect behaviour.

### How often should personas be updated?

Revisit them at least once a year, and sooner when research, support trends or a product change contradicts what they say. Give each persona a date and an owner so this actually happens.
