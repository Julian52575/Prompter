# Closing questions for the Globuland Retro manager

Purpose: the last chance to collect the manager's side before the review is finalised. Send the prompt below to the manager session (the one that ran the roadmap), then paste its answer back so it can be logged as the "Manager's answers" entry of `Roadmap-Bubbletea-Retro-notes.md`.

Why these questions: they cover what the review could not measure or verify from outside (per-agent cost and timing, the manager's own unverified claims, its reasons for key decisions, and its feedback on the archive and on the eight draft improvements). Anything the review could read itself (the brief, the record, the git history, the worktrees) was checked directly and is not asked again.

## Prompt to send

```
You ran the Globuland Retro roadmap (11 prompts, 4 threads), the playtest fixes and the integration merge. I am closing a review of how the archive and the process worked. This is the last chance to collect your side. Answer from what you know and can check read-only.

Rules for this answer
- Read-only: you may run git log/show/status, ls, grep, podman ps. Do not edit anything, do not commit, do not start or resume agents, do not run scenarios.
- Tag every fact: [V] you verified it now, [R] an agent or a harness notification reported it, [M] from your memory of the session, [G] a guess. Say "unknown" instead of guessing, and name the file or command that would settle it.
- Put the question id (A1, B2...) before each answer. Keep answers short and use the tables asked for. No device addresses, emails or other personal details in the answer.
- End with the list of things you could not verify.

A. Numbers I could not collect
A1. Table of every agent you started or resumed (pre-flight readers, p1 to p11, the three playtest fix agents, the coin follow-up agent, the merge agent, anything else): label, prompt or job, model, tool calls, tokens as the notification gave them, wall time, number of resumes or amends, outcome (completed, stopped with a question, cancelled).
A2. p1: the notification said about 28 min and 203k tokens for the first run; you later said about 55 min and 231k for all rounds; the user timed 40 min and 216k. Which figures are right and what does each cover?
A3. Pre-flight: how many readers, which prompts each, which model, what they cost. Why three reports for four threads?
A4. The integration merge: you said 13 conflicts, then listed 11 paths. Which is right (files or hunks)?
A5. For each agent that ran scenarios: compose project, ports, whether it left containers running. Which stack held ports 80, 443 and 5432, and who started it? Current container list, read-only.
A6. The archive ships three helper scripts in scripts/shared (read_md_section, agent_md_check, completion_to_md). Did anyone run any? What came out? If none, why not?
A7. Did you keep /usage or cost snapshots per phase? Give them (pre-flight, after p1, after p7, final).

B. Your own claims, audited
B1. List every statement you made to the user that turned out wrong or unverified, with its source and the check that would have caught it. Start from: "26 missions", "120 scramble maps", "dev-post-2.1.0 is the dev branch", "prompt 7 is blocked on a progression", the port numbers you gave (8085/8445, 5434, 5443), "the standard ports are held by your own stack", "the skill book is still unobtainable", and your estimates for p2 to p11 (including the missing rows for p8 and p9).
B2. The brief (.git/agent-brief.md) was not updated after the playtest. Which lines are stale now (for example the skill book "not obtainable yet", gacha 11011 as an "item-choice", "Map bosses ... Wib Wob lock concerns them")? Did you intend to keep it current? What would a fresh manager session lose if it started from the brief?

C. Why you decided as you did
C1. A new agent per prompt, although the archive says "typically one per thread". Why? What did you see about the cost of resuming against starting a new agent? What would you do now?
C2. You dispatched p8 and p9 although the pre-flight had flagged blocking questions the user left open. Why? What rule did you apply?
C3. List each time you treated something as approval without the word "approved", with the user's wording.
C4. List every place where user-provided text was changed by you or an agent (accents, names, spellings) and whether the user was told.
C5. The cost rule limited tests to the prompt's own scenario plus prod_data. Who decided, on what ground? Which scenarios exist but never ran on any branch, the integration branch included (read-only list)?
C6. You did some work yourself (resolving the Skills merge, reading the crash log, offers to edit files). Where do you draw the line between orchestrating and doing?
C7. What did the first briefings lack that you learned later (the cost rule, a port plan, stopping containers, the helper README, "established vs guessed")? Give the order in which you learned each, and what triggered it.

D. Feedback on the archive and the app
D1. Table, one row per section of the archive's AGENTS.md (First, Structure, Rules, Procedure, each Option, Completion record, Scripts, Plan): clear? followed? where you deviated and why? the one-line change you would make.
D2. The pre-flight: what was most useful, what cost most, what you would change.
D3. "Re-prompt first": how many agents changed the scope, and what did the step cost or save?
D4. Seeded flaws (101% total, missing destinations, "1st" against "2nd" slot, "items 1% each" with no items, and so on): which did the pre-flight catch, which did you meet only later, which did you never notice? How did you decide between asking and assuming?
D5. Rank the five pieces of information you most wanted in the archive before starting.
D6. Comment on the eight draft improvements, "agree / disagree / change", two lines each: P1 the manager prepares runnable worktrees, a user test slot and teardown; P2 a "Before you start" tips section on the Roadmap page with a copy-paste prompt; P3 follow-up prompts; P4 a model or effort hint per prompt; P5 cancelled prompts, and not dispatching a prompt with a blocking question; P6 thread notes handed between agents; P7 an integration-branch check; P8 a richer completion record (follow-ups, revisions, cost, integration, device checks).
D7. Anything else you would tell the authors of this tool.
```

## After the answer

Paste the manager's answer to the review session. It is logged as the next entry of the notes file (tags kept), the open items below are closed or moved to "still unknown", and the notes file is then restructured into a final review (summary first, log as evidence).

## Follow-up request (the first answer was truncated when copied)

The first answer reached the review with parts missing (rows of the agent table, the end of A2, the "standard ports" row of B1, the start of C2, the first half of C5, C7 item 6 onward, the last rows of D1, D2, D5 item 5, D6 P1 to P3). To avoid a second round of copy artifacts, ask the manager to write the full answer to a file that the review can read directly.

```
Your answer to the closing questions arrived with parts cut off. Please write the COMPLETE answer, in the same format and with the same tags, to this file: /home/julian/puniemu_prod_wsl/.git/manager-answers.md (it is inside .git, so it is never committed). Writing this one file is the only change you may make; everything else stays read-only as before. Then tell me it is done, in one line.

Include these parts that were missing, and add the new questions:
1. A1: the full agent table, with the rows for p6, p9, the gacha fix agent and the coin follow-up agent, and the outcome cells for p2 and the Skills fix.
2. A2: the end of the answer (what the user's 40 min and 216k figures correspond to).
3. B1: the row about "the standard ports are held by your own stack".
4. C2: the start of the answer (what the user's answer was for p9 and p8 when you dispatched).
5. C5: who decided the cost rule and on what ground, and the first half of the list of scenarios.
6. C7: item 6 onward.
7. D1: the last rows (the Plan section) and D2, D5 item 5, D6 P1 to P3.
New questions:
8. N1: what exactly does the token figure in a harness notification measure (cumulative total for the agent, tokens of the last run, or the size of its context)? What did the notification show for an agent while it was still running?
9. N2: for p1, p4 and the three fix agents, what was the biggest single cost (a long scenario run, many tool calls, a rebuild, rework)? One line each, tagged.
10. N3: which three changes to the archive or to your own process would have saved the most tokens and time in this run, in order, with a rough size [G] for each?
11. N4: which three would have prevented the most rework or false alarms (the worktree confusion, the stale facts, the open questions)? Same format.
```
