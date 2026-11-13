# Roadmap-Bubbletea-Retro: review of the first implementation pass

**Status: complete.** Written after the manager's closing answers (2026-11-13). This is the summary to read first. The evidence is in the other files (see section 9); every claim here carries a reference in the form `B<n>` (a log entry) or `O<n>` (an observation) from `Roadmap-Bubbletea-Retro-notes.md`.

Scope: how the downloaded archive was generated, and how an AI agent (a "manager" that delegated to sub-agents) behaved when it implemented it. The prompts' own mistakes were left in on purpose as test input; they are not judged here.

## 1. What was tested

- **Archive:** `Roadmap-Bubbletea-Retro` (project "Globuland Retro"): 11 prompts in 4 threads (Maps 4, Skills 3, gacha 3, login stamps 1), a Mermaid roadmap, an `AGENTS.md` with rules and a plan, three helper scripts.
- **Receiving agent:** Claude Sonnet 5.5 at low effort, in Claude Code, on a real repository (a game server emulator). The manager delegated to Sonnet sub-agents (pre-flight readers on Haiku), one worktree and branch per thread.
- **Prompt used to start:** "I unarchived a Prompter roadmap export in <path>. Read its AGENTS.md and follow it." (B1).
- **Timeline:** pre-flight and questions, then p1 dispatched at 21:31 on 2026-11-12; prompts 1 to 11 over about four hours; a device playtest, three fix agents, an integration merge and a record update until about 03:00 on 2026-11-13.

## 2. Headline numbers

| Measure | Value | Source |
|---------|-------|--------|
| Prompts | 10 completed, 1 cancelled (p8) | B70, B81 |
| Defects found by the user on a device | 5: four data or design causes and one worktree confusion | B71 to B77 |
| Manager session cost (manager and sub-agents) | **$23.46** (Sonnet $23.28, Haiku $0.18) | B83 |
| Usage | weekly **0% to 17%**; session window 94% at the last reading (the user reported over 100%); includes the notes session | B82, B83 |
| Agent tokens (notifications, cumulative per agent) | **about 2.24M** | B85, B86 |
| Where those tokens went | pre-flight 12.6%; p1 to p7 44.0%; p8 to p11 20.5%; playtest fixes, coin follow-up and merge 23.0% | B86 |
| Agent wall time | about 254 min (4.2 h, partly parallel); manager API 1 h 47, wall 5 h 34 | B83, B86 |
| First-pass time per prompt | p2 6.2 min; p3 16; p4 25; p5 10.4; p6 13.8; p7 12; p10 9.8; p11 7.2 (p1 55 min with two rework rounds) | B85 |
| Estimates | time overestimated (manager's account: only the prompt's scenario ran); tokens roughly in range | B25, B85 |
| Re-prompt step | 5 of 11 agents changed scope; cheap | D3 in B85, O222 |
| Scenarios | about 71 exist; **15 ever ran**, 11 on the integration branch | B85 |
| The two stops on blocked prompts (p8, p9) | about 137k tokens (about 6%), about a minute | B86, O368 |
| Manager's own long context | probably **30% to 48% of the Sonnet cache reads** (derived) | B86, O365 |
| Cost model | cost is requests times the context re-read on each one: about 1,000 requests, cache reads about 230 times the output tokens | O198, O360 |
| Cost per completed prompt | about $2.35 (including fixes, merge and the manager's turns) | B83 |

Caveat: the account-level figures (weekly, session) include this notes session as well; the manager's `/usage` and the agents' notifications do not.

## 3. What worked

1. **The pre-flight did its job.** Readers found the seeded contradictions (the 101% total, "1st" against "2nd" slot, items with no names, missing warp destinations, an unnamed team, a spelling) and the manager asked once and waited (B1, D4 in B85). A scripts permission gate was honoured (B1).
2. **Agents stopped instead of guessing** when a mechanism did not exist (p8, p9) and returned precise questions with defaults (B52, B53). Interpretations were marked unverified; reports separated what was established from what was guessed (B67, B68, O270).
3. **Diagnoses came from evidence,** and the manager's own hypotheses were wrong twice. The login crash was traced in the client binary to missing manifest rows (B68); the unusable items to one column of the item table, found by diffing against a working reference (B72); the coin to the client's own rule, from the disassembly (B73). The instruction "find the cause from evidence, not guesses" paid off each time (O274, O301, O310).
4. **One commit per prompt held,** with amends before approval and follow-up commits after (B46, B71); the final record is valid, matches the repository and contains no private data (B81).
5. **Pauses were respected** (approval before dependents started), and the manager chose the reversible target for the merge: a new integration branch, nothing pushed, `table-live` untouched (B78, O329).
6. **The cost rule worked once given:** after it, routine prompts took 6 to 16 minutes (B15, B85).
7. **Honest self-audit.** The manager's closing answers list its own wrong claims with their sources and the check that would have caught each (B86, O361).

## 4. What went wrong, ranked by cost and recurrence

1. **Worktree and branch confusion.** The work lives on four partial branches that were never run together; the user tested on one that lacked prompts 2 to 4 and later fixes. The Wib Wob "failure" was not a bug, and the blueprint missions may have been the same. One fix agent (158k tokens, about 7% of the total) plus retests went on it. The user named it as the cause of most failures (B63, B71, B76, B77; O251, O306, O321, O325).
2. **The environment was left to each agent.** Port clashes, an isolated stack rebuilt by hand, containers left running on the standard ports for an hour, a user's start that failed on a bind error. Three of nine implementation agents had visible stack trouble (B8, B58, B64; O29, O81, O230, O255, O258).
3. **Proofs were narrower than the user's path.** Scenarios tested what the server accepts; the client needs more: a flag in the last item column, an alpha channel, manifest rows, a choice screen that lists yokai only. All five playtest defects came from the device, none from a scenario (B71; O264, O276, O292 to O295, O303, O300).
4. **Unverified claims relayed by the manager,** each one command away from being checked (26 missions, 120 maps, a branch that did not exist, "prompt 7 is blocked", port numbers, "the skill book is unobtainable", a guessed clone id). About six false statements (B86, O361).
5. **Prompts with blocking questions were dispatched** (p8, p9), costing two agent starts; the pre-flight had flagged both (B52, B53; O209, O213, O368).
6. **p1's first run:** 55 minutes and 231k tokens against a baseline of about 5 minutes and 50k, from a custom script, a wide regression run and a hand-built stack; the cost rule arrived afterwards (B9, B15; O18, O24, O43, O47).
7. **Scenario coverage:** 15 of about 71 scenarios ever ran; the older ones (`na_events` and others) never ran on the integrated branch (B85; O68, O217, O228, O335, O339, O363).
8. **Shared files across threads** conflict by design: 13 files in the merge, one resource id claimed twice (icon row 50775), the same helper flag added on two branches (B79, B80; O307, O337, O338).
9. **The brief went stale** after p10: it still says the skill book is unobtainable and the coin is an item-choice crank, and holds interpretations as decisions (B84; O8, O9, O356, O357).
10. **Follow-ups were improvised:** a task for an earlier prompt was put inside a running agent's work, causing a near loss of work (a dropped stash) (B40 to B46; O158, O178, O183, O260).
11. **The manager's own context** is likely a third to a half of the Sonnet cache reads (B86, O365).
12. **Loose approvals** ("all good", "merge") and **user text changed** (accents, spellings), always disclosed but not always to the user (B23, B37, B63; C3, C4 in B85; O77, O146, O218).

## 5. Improvements, with priority

Priority is this review's judgement from the evidence; "manager" is the manager's own opinion from D6 (B85, B86). Full wording and evidence are in the notes file under the same ids.

| # | Improvement | Where | Priority | Manager |
|---|-------------|-------|----------|---------|
| P1 | The manager makes each worktree runnable and conflict-free (own env, ports, compose project), keeps a **user test slot**, and stops stacks at the end | AGENTS.md | High | agree |
| P2 | A "Before you start" tips section on the Roadmap page with a copy-paste prompt that prepares worktrees and environment slots | App | High | agree |
| P3 | Follow-up prompts: a rule for changing an earlier prompt, and a follow-up node in the app, the export and the record | AGENTS.md, app | High | agree |
| P5 | Cancelled prompts: dependents build on the last completed prompt; **never dispatch a prompt with a blocking pre-flight question** | AGENTS.md, app | High | agree |
| P7 | An integration branch check before handing back (merge in roadmap order, report conflicts, one smoke check, a full scenario run) | AGENTS.md | High | agree |
| P9 | A short **device-test checklist and acceptance test per prompt**, built from known client constraints; when copying a mechanism, diff every column against a working reference | Archive and app | High | (D5, N4) |
| P10 | A **scenario policy** stated up front: which scenarios exist, which are slow, which are mandatory; the prompt's own scenario per prompt and one full run at the integration step | AGENTS.md | Medium to high | (N3) |
| P4 | A suggested model or effort per prompt, set by the user or proposed by the app; measure before recommending | App | Medium | agree |
| P6 | Thread notes handed between agents; make the run state an **append-only dated log**, updated at every approval, with "stated by the user" and "interpreted" kept apart | AGENTS.md | Medium | change (append-only, dated) |
| P8 | A richer completion record: follow-ups, revisions, cost, integration, device checks (optional fields) | Record format | Medium | agree |
| P11 | **Manager context hygiene:** keep the run state in files so a fresh manager can continue; short relays; restart at thread boundaries | AGENTS.md | Medium | (harness hint) |

Consolidated changes to the archive's `AGENTS.md`, from this review and the manager's section table (D1):
1. **First:** "Search the repository first; ask only what it cannot settle, each question with a recommended default; do not dispatch a prompt that still has a blocking question." Say how to size readers (B85 D1).
2. **Worktrees:** the manager prepares runnable slots and a user test slot, records them in the brief, and stops each stack at the end (P1).
3. **Rules:** state that fixes made on a parent branch do not reach its children, and that an integration check happens at the end (P7).
4. **Git branches:** after approval, changes are follow-up commits `<thread>: <prompt> (follow-up)`; amend only before approval (P3).
5. **Pauses:** define what counts as approval (the word "approved" or an explicit yes; a test result alone is not approval) (O77, O146).
6. **Shared context:** the brief is updated at every approval, append-only and dated; "stated by the user" and "interpreted, to confirm" are separate; the last section lists what is stale (P6, P11).
7. **Reporting:** tag facts as verified now, reported, or guessed; report any override such as `--force` with its reason; separate "established" from "guessed" (O138, O116, O270).
8. **Cancelled prompts:** record as `cancelled`, build dependents on the last completed prompt (P5).
9. **Scenario policy** (P10) and a briefing checklist: the helper README, a port plan, stop your containers, the cost rule, a stop rule ("stop and report after two failed proof runs"), the device checklist.
10. **Scripts:** say when they are worth running (the Markdown conversion of the record, for instance); they were shipped and approved and never used (A6, O359).
11. **Completion record:** a place for follow-ups, revisions and the integration result (P8).

## 6. Archive and app generation findings

| # | Finding | Suggested improvement |
|---|---------|-----------------------|
| A1 | Folder names are cut mid-word (`...-to-WibW`) | Truncate at a word boundary |
| A2 | Front matter has no `status`, although the list names `downloaded` | Write `status: "downloaded"` on export, or drop it from the list |
| A3 | A prompt says "read AGENTS.md" while the archive forbids touching the repository's own | Say that "AGENTS.md" in a prompt means the repository's file |
| A4 | The completion files are committed "on the branch you started from", with four branches | Say "the base branch" (the manager did exactly that, O286) |
| A5 | The same preamble and language line are repeated in all 11 prompts | Put them once in `AGENTS.md`, or make them an export option |
| A6 | The archive's `AGENTS.md` is about 2.7k tokens, small next to the repository's own (about 13k, loaded on every request) | Keep it small; do not add without cutting (O199) |

## 7. Measurement plan for the next pass

1. Record the manager's `/usage` and the user's weekly and session percentages **at the start, at each approval and at the end**, so the study session and the implementation session are separated (O348, O355).
2. Record per agent the tokens by category (fresh input, cached input, output), tool calls, resumes, amends and questions; the notification figure is a cumulative total and not the bill (O360).
3. Run one thread both ways: one fresh agent per prompt against one agent per thread, and compare cache reads, rework and questions (B57, O164, O193).
4. Time how long each agent spends getting a stack running, and count port collisions (P1, P2).
5. Test one routine prompt on a cheaper model (P4).
6. Count conflicts and id collisions at integration, and the defects found by device against by scenario (P7, P9).
7. Keep a per-prompt timing table from the start (this pass built it by hand).

## 8. Open items

- **Closed by the user after the manager's answers (B87):** the Retro art matches the assets provided; the gated skill at index 1 on a yokai with no skill works properly; the leftover containers were stopped by the user with the commands the manager proposed.
- **User, still open:** the integration branch has **not been tested** (it is the one branch that holds all four threads and all fixes); a fast-forward into `table-live` is undecided; the six worktrees and the integration branch are still in place.
- **Unknown, could not be settled:** the manager's own tokens; whether any agent ran the archive's scripts; whether `hololive_unlock_item` and `owner_boost_battle` ran anywhere; the hunk count of the merge; why two yokai share index 2057 in the group table (the base already has 129 such pairs, so nothing requires uniqueness, O341); the exact meaning of the notification token figure beyond "cumulative per agent".
- **Risks left in the repository:** about 56 scenarios never ran on any branch; `globuland-retro/maps` probably carries a stale `nostalgia_warp_items` scenario (fixed only on the integration branch, O340); the brief in `.git` is stale; nothing has been device-tested on the integration branch (O372).

## 9. Where the evidence is

All in `docs/examples/`:
- `Roadmap-Bubbletea-Retro-review.md` (this file): the summary.
- `Roadmap-Bubbletea-Retro-notes.md`: the evidence. Index of draft improvements at the top; findings A1 to A5; the log B1 to B87 with observations O1 to O373; the timing log; the estimates against actuals; the full text of P1 to P8 (P9 to P11 are described in section 5 of this review and indexed in the notes).
- `Roadmap-Bubbletea-Retro-manager-questions.md`: the closing prompt and its follow-up.
- `Roadmap-Bubbletea-Retro-manager-answers.md`: the manager's complete answers (agent table, self-audit, decisions, feedback).
- `Roadmap-Bubbletea-Retro/`: the archive as generated.
- In the receiving repository: `docs/prompter-project/globuland-retro-2026-11-13/` (the completion record and roadmap), commits `19ec34449` and `de5778d26` on `table-live`, the integration merge `df97265d3` on `globuland-retro/integration`.
