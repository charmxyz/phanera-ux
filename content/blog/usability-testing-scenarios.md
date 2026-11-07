---
title: "Usability Testing Scenario Template, Tasks and Examples"
description: "A copyable usability testing scenario template, plus good and bad task examples for SaaS, ecommerce and mobile, so your tests measure behaviour, not guesses."
date: 2026-11-07
keyword: "usability testing scenario template"
readingTime: 9
---

A usability testing scenario template is a fixed structure for writing the tasks you give participants: a short, realistic situation, a clear goal, and a definition of success, written so it does not tell people where to click. A good scenario makes the participant behave as they would at home. A bad one turns the session into a treasure hunt for the words you used in the prompt. This guide gives you a template you can copy, the rules behind it, side-by-side good and bad usability testing tasks, and worked usability testing examples for SaaS, ecommerce and mobile.

## What a usability testing scenario is (and how it differs from a task)

People use "scenario" and "task" interchangeably, but it helps to separate them.

- **The task** is what you want to observe: "find the price of the Team plan".
- **The scenario** is the story that gives the participant a reason to do it: "Your manager has asked you to find out what this tool would cost for a team of eight. Find out."

The scenario supplies motivation. Without it, participants follow instructions literally. With it, they make the judgement calls real users make, such as whether the "Starter" plan is enough.

Each scenario also has a half the participant never sees: success criteria, the expected path and what you are watching for. That hidden half turns sessions into evidence you can compare.

## The usability testing scenario template

Copy this block for each task. Fill in every field before the first session, including the ones the participant will not see.

```text
SCENARIO ID: S1
RESEARCH QUESTION: What do we want to learn? (one sentence)

-- Shown to participant --
CONTEXT: Who you are and why you are here (1-2 sentences, no UI words)
GOAL: What you want to achieve (one outcome, not steps)
END POINT: How you will know you are done (e.g. "tell us the price")

-- Hidden from participant --
STARTING POINT: URL or screen the session begins on
SUCCESS CRITERIA: What counts as complete / partial / failed
EXPECTED PATH: The route we think is fastest (for comparison only)
TIME LIMIT: When to stop and move on (e.g. 5 minutes)
WATCH FOR: Specific moments, pages or labels we suspect are a problem
POST-TASK QUESTION: e.g. "How easy or difficult was that, 1-7?"
```

A filled-in example for a B2B software site:

```text
SCENARIO ID: S1
RESEARCH QUESTION: Can a first-time visitor work out what we cost?

CONTEXT: You run a small design agency. A friend mentioned this tool
and you want to know whether it fits your budget.
GOAL: Find out how much it would cost for your team of six.
END POINT: Tell us the monthly price you would expect to pay.

STARTING POINT: Homepage
SUCCESS CRITERIA: Complete = states correct price for 6 seats.
Partial = finds pricing page but misreads per-seat billing.
Failed = gives up or quotes the wrong plan.
EXPECTED PATH: Homepage > Pricing (top nav) > Team plan
TIME LIMIT: 4 minutes
WATCH FOR: Whether "per seat" is noticed; whether the annual toggle
confuses the figure; whether they open the FAQ.
POST-TASK QUESTION: How confident are you in that price, 1-7?
```

Notice what the participant-facing part does not contain: the word "Pricing", the word "plan", or any hint of where to go. That is deliberate.

## Seven rules for writing usability testing tasks

### 1. Write the research question first

"Can people find pricing?" is a research question. "Let's see what they do on the homepage" is not. If you cannot write it in one sentence, the scenario is not ready.

### 2. Do not use the words on the screen

This is the most common mistake. If your navigation says "Integrations" and your task says "find the integrations", you are testing word matching, not findability. Describe the need instead: "check whether this works with the tools your team already uses".

### 3. Give a goal, not steps

"Click Sign up, enter your email, then choose a plan" tests nothing. "Get yourself set up so you can try it this afternoon" lets you see which route people choose and where they hesitate.

### 4. Make the end point unambiguous

Participants need to know when they are finished, and you need to know whether they succeeded. Ask them to state an answer ("tell us the delivery cost"), reach a state ("get to the point where you would pay") or make a decision ("choose the plan you would pick").

### 5. Keep context realistic and short

One or two sentences. Long backstories get forgotten and turn participants into actors. Where possible, use their real situation: "think of a gift you need to buy soon" beats an invented one.

### 6. One goal per scenario

"Find a jacket, add it to your basket, apply a discount code and check delivery times" is four tasks. Fail at step two and you learn nothing about the rest. Split it up.

### 7. Stop at the point of commitment

Never ask for real payment details. End at "get to the point where you would pay", and use test accounts where a login is needed.

## Good vs bad usability testing tasks

The table below shows common bad versions and how to rewrite them. Most fixes come down to removing interface words, removing steps, or adding a clear end point.

| Bad task | Why it fails | Better scenario |
|---|---|---|
| "Go to the Pricing page." | Names the page and the destination. Tests nothing. | "Your boss wants a rough monthly cost before Friday. Find a figure you could send them." |
| "Use the search bar to find running shoes." | Prescribes the method. Hides whether people would browse instead. | "You need new running shoes for a half-marathon next month. Find a pair you would consider buying." |
| "Click on Integrations and check for Slack." | Uses the menu label. Gives the answer away. | "Your team lives in Slack. Find out whether this product would fit into how you already work." |
| "Sign up, verify your email, create a project and invite a colleague." | Four tasks in one. A failure early hides everything after it. | Split into: "Get set up so you can try this today" and, separately, "Get a colleague access to your work." |
| "Find the easy way to return an item." | Leading. "Easy" signals there is one and that it should be easy. | "The jacket you ordered does not fit. Find out what you would need to do to send it back." |
| "Imagine you are Sarah, a 42-year-old procurement manager at a mid-sized logistics firm who..." | Backstory too long. Participant performs a role instead of behaving naturally. | "You are responsible for approving software spend at work. Decide whether this product needs a sign-off from your finance team." |

If you are also writing the questions you ask before and after each task, our guide to [usability testing questions](/blog/usability-testing-questions) covers wording that avoids leading the participant.

## Usability testing examples by product type

These are starting points. Adjust the context to your audience and your research questions.

### SaaS and B2B software

1. **First impression.** "Look at this page for 30 seconds. Then tell us what the product does and who it is for." Success: describes the core job in their own words.
2. **Cost.** "Your team of eight is considering this. Find out roughly what it would cost each month." Success: correct plan and figure.
3. **Fit with existing tools.** "Your company uses Google Workspace and HubSpot. Find out whether this would work alongside them." Success: finds a definitive answer, not a guess.
4. **Trust.** "Before recommending this to your boss, find something that would convince you other companies like yours use it." Success: identifies evidence they find credible. Watch for whether proof sits anywhere near pricing.
5. **Getting started.** "You want to try this today without talking to anyone. Get to the point where you could start using it." Success: reaches sign-up or trial without contacting sales.

### Ecommerce

1. **Product discovery.** "You need a waterproof jacket for walking in the rain, under £120. Find one you would buy." Success: selects a product that meets both criteria.
2. **Comparison.** "You are deciding between two of these coffee machines. Work out which would suit a household that drinks mostly espresso." Success: makes a reasoned choice using on-site information.
3. **Delivery.** "You need this by Saturday. Find out whether that is possible and what it would cost." Success: states the delivery option and price.
4. **Returns.** "Imagine your order arrived in the wrong size. Find out how you would send it back and whether you would pay for it." Success: correct returns process and cost.

### Mobile apps

1. **Onboarding.** "You have just downloaded this app on the bus. Get to the point where you could use it for the first time." Success: completes onboarding; note any skipped screens.
2. **Core action.** For a banking app: "Send £20 to a friend for dinner last night." Success: reaches confirmation using a test account.
3. **Settings.** "Notifications from this app are annoying you. Make it stop sending them, except for the important ones." Success: finds granular notification settings.
4. **One-handed use.** "You are holding a coffee in one hand. Find your most recent receipt." Watch for tap targets out of thumb reach and gestures people do not discover.

Test mobile scenarios on a real device. A resized desktop browser hides problems such as buttons that sit below the fold on small screens.

## How many scenarios to include

For a 45 to 60 minute moderated session, plan four to six scenarios plus an easy warm-up. For unmoderated sessions, three to five is safer, because participants tire faster without a facilitator.

Put the most important scenarios early, while attention is high. Keep dependent tasks in a fixed order; rotate the rest across participants so learning effects do not always favour the same task.

## Pilot your scenarios before the real sessions

Run every scenario once with a colleague who did not write it. Check for ambiguity (did they know what "done" looks like?), accidental hints, broken starting points or test accounts, timing, and whether the task is actually possible on the current build. A pilot almost always changes at least one scenario.

You can also pilot with simulated users before you book anyone. [Phanera](/) runs a scenario like "Can a new visitor find pricing?" with several AI personas in a real browser on your live site, recording each step with screenshots and the persona's reasoning. It is a quick way to find tasks that are ambiguous or blocked before you spend time with real participants. It does not replace them: AI personas cannot tell you how a real budget holder feels about your price. Our guide to [AI usability testing](/blog/ai-usability-testing) covers where that approach helps and where it does not.

## Turning scenarios into findings

Because success criteria are written in advance, analysis is straightforward: score each attempt as complete, partial or failed; note where and why people left the expected path; group observations into issues such as "Returns policy is only in the footer"; prioritise by frequency and severity; then re-test the same scenario after the fix. Keep the wording identical between rounds, or you cannot tell whether the design or the task caused the difference.

If your scenarios need personas behind them, start with a clear picture of who you are testing for. See [how to create a user persona](/blog/how-to-create-a-user-persona) for a template that pairs well with the one above.

## Scenario-writing checklist

Before you run a session, check each scenario against this list:

- [ ] Linked to a one-sentence research question
- [ ] Context is one or two sentences
- [ ] No words copied from the interface
- [ ] One goal, phrased as an outcome, not steps
- [ ] Clear end point the participant can recognise
- [ ] Success, partial and failure criteria written down
- [ ] Starting point and any test accounts ready
- [ ] Stops before real payment or personal data
- [ ] Piloted with someone who did not write it

## FAQ

### What is the difference between a usability testing scenario and a task?

The task is the action you want to observe, such as finding a delivery cost. The scenario is the short, realistic context that gives the participant a reason to do it. Good test scripts present the scenario and keep the expected task path hidden.

### How many tasks should a usability test have?

Four to six scenarios suit a 45 to 60 minute moderated session, plus an easy warm-up. Keep unmoderated tests shorter, three to five, as participants lose focus faster without a facilitator.

### Can I reuse the same scenarios after a redesign?

Yes, and you should. Keeping the wording identical is what lets you compare success rates and behaviour before and after the change. Only rewrite a scenario if the old one was flawed.

### Can AI personas run usability testing scenarios?

They can run the same scenarios in a real browser and show where tasks are confusing or blocked, which is useful for piloting and quick checks. They cannot replace real participants for understanding motivation, trust and emotional reactions, so use both.
