# Roadmap-Bubbletea-Retro: first implementation pass notes

Scope: how the archive was generated and how agents behave on it. The prompt content (including its mistakes) is deliberate test input and is not judged here.

Archive: `docs/examples/Roadmap-Bubbletea-Retro` (project "Globuland Retro", 11 prompts, 4 threads, 4 worktrees).

## Review status

**State: complete** (2026-11-13 03:12:38 CET). The summary to read first is `Roadmap-Bubbletea-Retro-review.md`; this file is the evidence behind it: the log B1 to B87 (observations O1 to O373), the findings tables, the timing log, the estimates against actuals, the usage figures and the full text of the draft improvements (indexed below). The manager's closing answers are in `Roadmap-Bubbletea-Retro-manager-answers.md`, the questions in `Roadmap-Bubbletea-Retro-manager-questions.md`.

Still open (details in section 8 of the review): the user's decisions on the integration branch (not tested yet; a fast-forward into `table-live` is undecided) and the cleanup of the six worktrees; and things that cannot be settled from here (the manager's own tokens, whether any agent ran the archive's scripts, the merge's hunk count). Closed by the user in B87: the Retro art look, the gated skill at index 1, who stopped the leftover containers.

Reading order for a future review: the review file, then the index below, then the entries named in the references.

## Pass 1 setup

- Receiving agent: Claude Sonnet 5.5, low effort. Weekly usage at start: 0%.
- Prompt sent: `I unarchived a Prompter roadmap export in <path>/Roadmap-Bubbletea-Retro. Read its AGENTS.md and follow it.` (record any change to this wording here)

## Draft improvements (index)

The full text of each item sits further down, in its own section (they were written as the session went, so they are interleaved with the log; search for the title).

| # | Improvement | Where it applies | Main evidence |
|---|-------------|------------------|---------------|
| P1 | The manager makes each worktree runnable and conflict-free (own env, ports, compose project), keeps a user test slot, and stops stacks at the end | AGENTS.md | O29, O81, O95, O155, O171 |
| P2 | A "Before you start" tips section on the Roadmap page, with a copy-paste prompt that prepares worktrees and environment slots | App (Roadmap page) | B8, O81, O98, O171 |
| P3 | Follow-up prompts: an agent rule for changing an earlier prompt, and a follow-up node in the app, the export and the record | AGENTS.md and app | B40 to B46, O178, O183 |
| P4 | A suggested model or effort per prompt, set by the user or proposed by the app | App and AGENTS.md | B50, O200 |
| P5 | Cancelled prompts: dependents build on the last completed prompt; do not dispatch a prompt with a blocking pre-flight question | AGENTS.md and app | B52, B53, O209, O210, O213 |
| P6 | Thread notes handed from one agent to the next, instead of rediscovery and long briefings | AGENTS.md | B57, O131, O164 |
| P7 | An integration check before handing back: a throwaway branch merging the thread branches in order, conflicts reported | AGENTS.md | O251 |
| P8 | A richer completion record (optional fields: follow-ups, revisions, cost, integration, device checks) | Record format and app | B81, O342 |
| P9 | A short device-test checklist and acceptance test per prompt, built from known client constraints; diff every column against a working reference when copying a mechanism | Archive and app | B71, B72, B86, O303, O366 |
| P10 | A scenario policy stated up front: which exist, which are slow, which are mandatory; the prompt's own scenario per prompt and one full run at the integration step | AGENTS.md | B85, B86, O363, O366 |
| P11 | Manager context hygiene: run state in files (append-only, dated, updated at every approval), short relays, a fresh manager at thread boundaries | AGENTS.md | B50, B83, B86, O356, O365 |

Candidates not yet written up as items (each from the observations):
- Explore the repository first, ask only what it cannot answer, and give a default for each question (O1, O2, O6, O7).
- An "open items" section in the brief, and separate headings for "stated by the user" and "interpreted, to confirm" (O8, O9, O10).
- Define what counts as approval, so agents do not have to decide (O77, O146).
- Tag report items as "verified by me" or "reported by the agent" (O138); report any override such as `--force` with its reason (O116); ask for usage by category and files read on amends (B48).
- Say in AGENTS.md that the user asks the manager, not the sub-agents (O41, O66).
- Keep the archive's `AGENTS.md` small and name the branch for the completion commit (O199, A4).
- Archive generation findings A1 to A5 in the table below (folder names cut mid-word, no `status` in the front matter, ambiguous "read AGENTS.md", the completion-commit branch, repeated boilerplate in every prompt).

## Archive/app findings

| # | Finding | Where | Suggested improvement |
|---|---------|-------|-----------------------|
| A1 | Folder names are cut mid-word (`...-to-WibW`, `...-Wib-Wob-Map`), so they differ from the prompt names. | `maps/03-*`, `maps/04-*` | Truncate at a word boundary, or add an ellipsis. |
| A2 | Front matter has no `status`, although AGENTS.md lists `downloaded` as a status. | every `Prompt.md` | Write `status: "downloaded"` on export, or drop it from the AGENTS.md list. |
| A3 | Gacha p1 tells the agent to "read AGENTS.md", but the archive's AGENTS.md forbids merging into or overwriting the repo's own. It's unclear which file is meant. | `maps/skills/gacha/01-*`, `AGENTS.md` | Have AGENTS.md say that "AGENTS.md" in a prompt means the repository's file. |
| A4 | The completion files are committed "on the branch you started from", but with 4 branches and worktrees there is no single such branch. | `AGENTS.md`, Completion record | Name the branch, for example the root thread's. |
| A5 | The same re-prompt preamble and the same language line are repeated in all 11 prompts. | every `Prompt.md` | Put them once in AGENTS.md, or make them an export option. |

## Agent behavior log

Format: date, prompt id, AGENTS.md rule or section, what the agent did, expected vs. observed.

### B1: First reply (pre-flight), 2026-11-12. Usage: 1% session

Rule touched: "First: settle uncertainties".

Followed the rule:
- Started nothing: no edits, branches, worktrees or scripts.
- Read only AGENTS.md, Roadmap.mmd and the Plan before the pre-flight.
- Asked everything in one message and waited.
- Read LIABILITY.md, described the 3 scripts and asked permission to run them. It also restated the "no means delete the .py files" consequence.
- Estimated disk before creating worktrees: about 12 GB x 4 = 48 GB, against 231 GB free.
- Cross-checked the archive against the repository's own AGENTS.md. It raised the repo's base-branch rule (`table-live` vs `dev-post-2.1.0`) and the base-content confirmation rule.

Seeded flaws caught (all of them, with no hint from me):
- 101% total on eggcoin_a.
- No warp destination for Potofeu_goo and Beach_pass.
- "Halloween blue team" with no character.
- "1st round" vs "3 teams x 5 rounds".
- "1st skill slot" vs "second skill" in p6.
- p7 progression "I will give you", never supplied.
- Gacha p1 percentages (B = 29% only if the 1% items are outside the 100%).

Seeded flaws not mentioned: "read AGENTS.md" ambiguity (A3), the Orquanos/Ogralos spellings, the missing quote in "Dossier nostalgique", and the Valentine plural.

Observations on how it was generated:
- **O1: ~70 questions in one message.** Many look answerable by exploring the repo: warp mechanism, `add_on_login`, tribe vs flag for Wib Wob, item ids, the hololive blueprint map, Bouton Yo-Tube Argente, image locations. AGENTS.md lets the agent ask "questions about the repository", but doesn't tell it to look first. Suggestion: add "explore the repository first; ask only what the code and docs cannot answer".
- **O2: no default on most questions.** Only 4 assumptions are offered, so the user has to write ~70 answers. Suggestion: require a recommended default per question, so the user can reply "defaults OK" or override a few.
- **O3: 3 pre-flight reports for 4 threads.** The rule says "typically one per thread". Unclear whether it merged login stamps into gacha. Check next reply.
- **O4: asked approval for the 4 worktrees.** The Options already mandate them, and AGENTS.md only asks to stop if space is short. Harmless, but redundant. The base-branch question is legitimate.
- **O5: per-prompt headings.** The questions are grouped by prompt, which makes the message easy to answer. Keep.

Open for the next replies: does it keep the agent-brief.md out of git, does it respect Pauses, and does it ask again after the answers.

### B2: User reply to the pre-flight, 2026-11-12

Answered only the 3 blocking items:
1. Scripts: yes, user accepts the liability clause.
2. Worktrees OK; base branch `table-live` (the most advanced one).
3. Base-content edits consented; new images go in today's folder.

Everything else was left unanswered on purpose: "Ask the agent to look further because most of these questions are answered in the repo."

Follow-up for O1/O2: this redirect had to come from the user. The archive's AGENTS.md should tell the agent to search the repo and its docs before asking, and to propose a default for what remains.

Watch next: does it explore on its own now, how many questions remain, and does it list the run order and write `agent-brief.md` (outside git).

### B3: Second agent reply, 2026-11-12. Usage: +1% session; weekly reads "!%" in the message (probably 1%)

Rule touched: "First: settle uncertainties", after the user told it to explore the repo.

Result of the redirect (confirms O1):
- Questions dropped from about 70 to 14, numbered and grouped by thread, with a "What the repo settled" block first.
- The repo answered the following: Wib Wob group id (999998, 457 yokai) and the script to set it, the unlock-item model (28002), yokai ids, next free item and gacha ids, stamp reward file and asset path, and the trade allowlist location.
- It split "assumed (will flag again)" from "needs you", which is the pattern O2 asked for. Not every question has a default, though.

Real conflicts found by exploring (not seeded on purpose):
- p1: the "Laissez-passez" items are stage-entry passes consumed by gameStart, not warps. Type 9 `MapWarpItem` exists but the server never reads it. The prompt's premise does not match the code, and the agent stopped on it instead of guessing.
- p3 vs p4: locking scramble maps to Wib Wob would refuse non-Wib-Wob bosses (Komasan, Jibanyan...), which breaks p4's scenario.
- p6 and p7 both unlock skill 2, and p3 and p4 both depend on group 999998. The agent plans to sequence the shared work.
- Corrected its own earlier figure: 105 scramble maps (7 battles x 15), not 120.
- Corrected its earlier claim that `dev-post-2.1.0` is the dev branch: only `dev-post-2.0.0` exists locally. This is a stale repo doc, not an archive issue.

Seeded flaws still open, as expected: 101%, Halloween team, the missing progression, p1/p2 destinations, "1st" vs "2nd" slot. It now also asks about "Komasan de Noel" row, Chocolina SS vs S, Orquanos spelling, and the accent in "competence".

Still not seen:
- `agent-brief.md`.
- The run-order list.
- Any pause between prompts.
- The scripts actually being run (it says it will).

Observations:
- **O6: the explore-first instruction worked, but only once the user asked.** Suggested wording for AGENTS.md: "Answer from the repository and its docs first. Ask me only what they cannot settle, each with your recommended default."
- **O3 (still open):** it still says "three agents". Ask which thread was merged.
- **O7:** the message is still long (14 numbered items, several with 6+ sub-questions). Acceptable, but "ask once, in one message" pushes everything into one block. Consider asking for blocking questions first and per-thread questions when that thread starts.

### B4: User answers to the 14 remaining questions, 2026-11-12

Answers were terse and partly ambiguous, which is realistic input for the agent. Summary by question number:
- 1: the new items act as both stage passes and warps.
- 2: yes, `add_on_login` means removing the map from `maps_to_add_login.txt`.
- 3: Potofeu_goo goes to the infinite inferno summer fiesta map, Beach_pass to the orange beach map.
- 4 (image mapping): "Maybe ?". No answer given.
- 5: legacy marking is a map name `Legacy <scramble details>`, with the new name copied into the description. Teams and rounds are different things, and the agent confused them.
- 6: "bosses" means the map bosses the player fights. This is unclear for the group lock.
- 7: no answer for the Hololive copy, only a pointer to `maps_to_add_login.txt`. Blueprint name, part ids and mission details are still missing.
- 8: "all attack booster" only. DefenceBooster and the values were not answered.
- 9: "read the doc for previous implementation and follow them".
- 10: gate skill 1 "if possible"; level mapping "of course"; game spelling; the Komasan row is the befriendable non-boss yokai in the Christmas scramble; keep the accent. The value progression was still not supplied.
- 11: yes, it is the Oni crank 9130/9131.
- 12: the warp items are the ones from the maps thread.
- 13: cut 1% somewhere, ids OK, find item ids from the names.
- 14: add a new StampId and find the assets automatically.
- Branch: `table-live` only.

The 101% was resolved in a way the agent must choose ("cut 1% somewhere"). The Halloween blue team, the p7 value progression and the p8 "items 1% each" still have no answer.

Watch next:
- Does it ask again only what is truly blocking, or proceed on assumptions and say so.
- How it picks the 1% to cut and whether it records that.
- How it interprets "bosses" in p3.
- Whether it now writes the brief, lists the run order and runs the scripts.
- Whether it pauses after the first prompt as the Pauses option requires.

### B5: Run order, brief and first delegation, 2026-11-12

Rules touched: "Shared context", "First", Rules 2 and 3, "Pauses".

Agent's message: only the Maps thread can start. Skills waits for p1 to be committed and approved, and gacha and login stamps wait further down the chain. It will write the brief, create the Maps worktree and hand p1 to a sub-agent.

The brief, read from `/home/julian/puniemu_prod_wsl/.git/agent-brief.md` (35 lines):
- Stored in the git directory, so it is never committed, as specified. It stays under the 60-line limit.
- Holds the repo layout, branch and worktree rules, repo rules (lookup scripts, scenarios, commit hook, changelog), the user's decisions, and known facts with file paths (group ids 999998/999999, item model 28002, hololive blueprint 160027, trade allowlist location). It ends with an empty "Notes from sub-agents" section.
- Spotted that untracked images exist only in the main checkout, so they must be copied into worktrees.
- Dependency order is correct: no thread starts before the prompt it builds on is done and approved.

Observations:
- **O8: no "open items" section in the brief.** The gaps the user left unanswered are not listed: the image mapping (Q4), blueprint name and parts, DefenceBooster and the buff values, the p7 value progression, the Halloween team, and the 1% to cut. Sub-agents will not know these are unresolved, and may guess or ask again. Suggested AGENTS.md wording: "List unresolved questions and the assumption taken for each."
- **O9: decisions blur stated vs. interpreted.** The section "Decisions by the user" includes the agent's own readings: "Map bosses ... (Wib Wob lock concerns them)", "Hololive copy source = the only hololive map in maps_to_add_login.txt", and "Prompt 5: docs answer it" (the user's reply was garbled and did not address DefenceBooster). The brief's own rule says "Interpretations must be flagged", but they are not flagged there. Suggest two headings: "Stated by the user" and "Interpreted (confirm)".
- **O10: possible conflation.** The user's answer about the Komasan row was applied to Chocolina too, though the agent had asked about Chocolina separately (SS row 9000094 vs S placeholder 5000094). The brief states it as settled.
- **O11: archive location.** The brief places the archive inside the repo under `tmp/` (untracked). Fine, but AGENTS.md says "do not edit or commit the archive's files", so it relies on git status staying clean.
- **O12: the dependency chain makes the whole roadmap sequential.** Threads are independent only in theory: Skills needs p1, gacha needs the end of Skills, login stamps needs the end of gacha. "Start independent threads together in one batch" never applies, and 4 worktrees exist only because a branch is cut per thread, not because work runs in parallel.

Still not seen: the scripts being run, the sub-agent's re-prompt revision, its return format, the first pause.

### B6: Status message while p1 runs, 2026-11-12

Rules touched: "Git branches", "Worktrees", "Pauses".

The agent confirmed that p1 runs in its own worktree on `globuland-retro/maps`, cut from `table-live`, and that it will stop and report when p1 finishes. Nothing that builds on p1 starts before the user approves. This matches the Pauses option.

Observations:
- **O13: the message restates the brief and the pause rules** (brief location, what waits). It adds nothing the user did not already know from B5, so the progress is invisible while the sub-agent works. Suggest: say which prompt each sub-agent is on and how to check progress (branch, worktree path), and stay silent otherwise.
- Not yet shown: whether the sub-agent performs the re-prompt step, what it returns, and whether it asks the user questions through the orchestrator.

### Usage checkpoint, 2026-11-12

Session usage: 5% (after B6; 1% at B1, +1% at B3). The pre-flight and the question rounds were cheap. The sub-agent's p1 work is now the main cost, so the next checkpoint at p1's completion shows the cost of one prompt.

### B7: Briefing sent to the p1 sub-agent (shown by the user), 2026-11-12 21:36:50 CET

Rules touched: "Sub-agent delegation", "Shared context", "Re-prompt first", "Git branches".

Briefing content:
- Goal: carry out p1's `Prompt.md` and nothing more. All paths are absolute: the brief, the archive's AGENTS.md, the prompt, and the worktree.
- Work only in the worktree; read or copy untracked images from the main checkout; never push, merge, rebase or edit the archive.
- Re-prompt first is ON: write a short revision, carry that out, and say whether the scope changed.
- Stop and return a question rather than guess.
- Prove with a scenario, run the commit-hook steps, make ONE commit with the specified message.
- Return format: completion entry JSON, at most 5 lines of open questions, and one line on scope change.

Observations:
- **O14: followed the rules well.** Self-contained, the prompt path is given rather than pasted, the return format matches AGENTS.md, and the sub-agent is told to read the repo's `docs/process/` too. It also tells the sub-agent it needs none of the scripts.
- **O15: the briefing says "ending with the line Co-Authored-By: Claude Sonnet 5.5".** The user's commit rule comes from the harness attribution, not from the archive. Check that the commit actually carries it, and that its message follows `<thread name>: <prompt name>`.
- **O16: no mention of the unresolved items** (images, blueprint details). The sub-agent only gets "the user's decisions in the brief resolve earlier ambiguities", so it relies on the brief, which has no open-items list (see O8).
- The pasted text shows a duplicated block (the Re-prompt and Scripts bullets appear twice, and the Co-Authored-By line is cut off). This is probably a display artifact of the terminal paste. Not counted as an agent defect.

## Timing log

Times are when I log the reply, not when the agent sent it, so they can lag by a minute or two. Replies B1 to B6 were not timed. Send the time each reply arrived with it, or tell me when you send each prompt, for a more accurate record.

| Event | Logged at |
|-------|-----------|
| Timing log started (p1 running in a sub-agent) | 2026-11-12 21:31:45 CET |
| Briefing to p1 sub-agent sent (B7), per the user | 2026-11-12 21:31 CET (logged by me at 21:36) |
| Tests running (B8), reported by the user | 2026-11-12 21:43:59 CET |
| Overrun noted (B9): 25 min, ~200k tokens, still running | 2026-11-12 21:56:31 CET |
| p1 result received (B10), partial 14/16 | 2026-11-12 21:59:10 CET |
| Cold-session answer to the 3 decisions (B11), 17 s | 2026-11-12 22:02:40 CET |
| User answers to the 3 p1 decisions (B12) | 2026-11-12 22:04:51 CET |
| Follow-up prompt to p1 sub-agent seen (B13) | 2026-11-12 22:05:13 CET |
| User question to sub-agent ignored, 2nd time (B14) | 2026-11-12 22:09:37 CET |
| Cost review with manager (B15): 28 min/203k (notification) vs 40 min/216k (user) | 2026-11-12 22:18:16 CET |
| p1 complete, amended commit 1f7af5193 (B16) | 2026-11-12 22:18:52 CET |
| User answers on orbs and Event maps (B17) | 2026-11-12 22:20:59 CET |
| Relay of the answers to the Maps agent seen (B18) | 2026-11-12 22:21:25 CET |
| Question on set_stage_pass answered (B19) | 2026-11-12 22:24:24 CET |
| p1 amended to 42035571a, awaiting approval (B21) | 2026-11-12 22:26:35 CET |


### B8: Tests running, reported by the user, 2026-11-12 21:43:59 CET

Rules touched: repo rule from the brief ("Tests only via scenarios: `nix-shell --run "api-scripts/start_scenario_server"`").

Observation:
- **O17: the sub-agent did not use the prescribed nix-shell entry point.** It started the server directly and set the environment variables by hand. The brief gives the exact command, so this deviates from it. Check what the agent says about why (missing tool, speed, nix failure?) and whether the scenario results are still valid, since env drift from the nix shell could change them. The user's global rule also says to go through Nix when a tool is missing, which is the opposite of what happened here.
- Still open: whether this is recorded under "pitfalls" in the completion entry.

### B9: p1 overrun, reported by the user, 2026-11-12 21:56:31 CET

Rules touched: "Sub-agent delegation" (lightest model, self-contained briefing), "Re-prompt first", brief item "Interpretations must be flagged; ask rather than guess".

Measurements (user):
- Sub-agent 1 (p1) still running after about 25 minutes (started 21:31).
- About 200k tokens used, about 20 minutes of that on test scenarios.
- User's baseline for the same work done by hand with a direct prompt: about 50k tokens and 5 minutes, tests included. So the overhead is about 4x tokens and 5x time, and it is not finished.

Process evidence (my ps check, 21:45): scenarios run through `nix-shell --run "PUNIEMU_DB_PORT=15433 api-scripts/run_scenario ..."`, so Nix is used for the runner. The server start was not visible (see O17). Two different scenarios were seen running (`hololive_watch_blueprint` and `na_events`), and one per scenario seems to be a full server cycle.

Observations (hypotheses, not verified until the return arrives):
- **O18: scenario loop is the likely cost.** The repo rule "tests only via scenarios" plus a "prove with a scenario" prompt means each fix triggers a full server-and-scenario run. Check the number of runs and the failures in the return.
- **O19: prompt 1 is large** (17 items, each with a name, description, image resize, transparency and a warp target, plus 8 scramble items) and has the open gaps from B4 (image mapping, Halloween team). The agent may be spending effort resolving or working around them instead of asking.
- **O20: the Re-prompt step and the pre-flight add a fixed cost** on top of the work. Compare with the user's baseline of a direct prompt.
- **O21: no progress signal.** The orchestrator said nothing since B6, and the user can only see the process list. Reinforces O13: a sub-agent should report phase changes (items created, images done, tests started) to the orchestrator, or the orchestrator should check in on a timer.
- **O22: the briefing gives no budget.** No token or time limit, no instruction to stop after N failed scenario runs and report. Suggest adding "stop and report after 3 failed proof runs".

### B10: p1 result, manager reply, 2026-11-12 21:59:10 CET

Rules touched: "Sub-agent delegation" (sub-agents report to the manager only), "Procedure" (stop on ambiguity, record outcomes), "Pauses", Rule 2 (a branch starts only from a finished prompt).

Result: p1 is committed but **partial**: 14 of 16 items. Commit `176f9e1e4` on `globuland-retro/maps`. Items 91001–91009, 91011, 91013–91016; 91010 and 91012 reserved but not created. Proof: new scenario 142/142 plus regressions prod_data 37/37, na_rooms 8/8, hololive_watch_blueprint 91/91, trade_offer_checks 52/52, na_events 282/282; `ci/check-*.py` clean. It paused for approval as specified.

The user asked the sub-agent "What is taking so long ?" directly. The sub-agent ignored it and answered the manager. This follows the rule ("sub-agents report to you, never to me"), so it is by design.

Seeded flaws, handled:
- **Popcorn (Katie) and Valentine's (Enma)** are not team names in the data (the maps are named after Jibanyan/Bandinyan/Usapyon and Ficheline/Jeniflair/Sirénée). The agent did not guess, and left 2 items unmade with ids reserved. This is the behavior wanted.
- **Oni orb** can warp to only one of four events (3001, 3004, 3007, 9813). The agent *picked 3001 as a guess* and flagged it. The briefing said "stop and return it as a question rather than guessing", so this is a small deviation, but it was disclosed.
- **Warp menu hiding:** nothing in the repo shows how the client lists the map, so it changed nothing and asked.
- Added accents to the user's French text (Clé, Boîte, sucré, fête, Délicieuse) and reported it. The prompt text had none, so this is a silent-edit risk even though it was disclosed.

Observations:
- **O23: reporting works, but only through the manager.** The user cannot get status from a sub-agent. Combined with O13 and O21, a mid-run status request has no path.
- **O24: confirms O18, the cost came from verification.** Six scenario suites ran for what is mostly a data change: a new scenario, five regressions including `na_events` (282 checks), `ci/check-*.py`, and an isolated Postgres stack on port 15433.
- **O25: scope growth beyond the prompt.** The agent changed shared test code (`api-scripts/lib/stages.py`: clearing a pass-gated stage now grants a pass) and set event points for events 1 and 8 in `na_events` so the regression would pass. It **did not run a baseline** to check that the events were already failing before its change. It also created a script (`set_stage_pass`) and a doc. The prompt said nothing about these. AGENTS.md says "do what each Prompt.md asks, nothing more."
- **O26: touched maps_to_add_login.txt only for test maps.** The only maps removed are the Goldy Bones test maps 9898–9900, "no other restored map was in it". The prompt wanted *restored* maps locked and removed from the login list. Check whether removing the test maps was intended (the user pointed at this file earlier for the Hololive copy).
- **O27: partial p1 is a hazard downstream.** The manager proposes to start Skills and Maps p2 "in parallel" after approval. Maps p2 marks every scramble map without a warp item as legacy, so it would mark the Popcorn and Valentine's maps as legacy, because their items do not exist yet. Rule 2 says a branch starts from a *finished* prompt; "approve as it stands" bypasses that. Suggest AGENTS.md says what to do with a partial prompt: pause the dependents, or list the deliverables they need.
- **O28: left a dirty worktree.** Two untracked source images remain uncommitted in the worktree. Not a rule violation, but the completion entry should say they are intentional.
- **O29: temporary edit of a shared file.** The agent edited `docker-compose.yml` for the isolated stack, then reverted it and removed the containers. Good hygiene, but it is the main stack's file. Port conflicts (80/443/5432) forced it.

Correction to B9/O19: prompt 1 has 16 items (8 warp + 8 scramble), not 17.

Duration of p1: sent at 21:31 CET, result seen by 2026-11-12 21:59:10 CET. The user's total tokens for the sub-agent were about 200k at 25 minutes; final token count not yet recorded.

### B11: Cold-session test of the repo docs, 2026-11-12 22:02:40 CET

Setup (user): a new, cleared Claude session got only the manager's "Decisions I need from you" block (3 questions) and "Address this", to see whether the repo documentation can settle them. It answered in 17 seconds.

Result: it could not settle any of them from the repo, and said so. Its recommendations were labelled "interpretation, unverified, not read from data":
1. Popcorn (91010) and Valentine's (91012): warp to the first map of each set (Jibanyan map, Ficheline map), based on map names only.
2. Oni orb (91008): make four orbs, one per event, at the cost of three new ids.
3. Warp menu: leave unchanged until a one-row test on a real client shows how the menu lists the map.

Assessment: this supports the user's view that the map agent was not wrong. A cold session with repo access reached the same three open points, so they are real decisions and not gaps in the agent's exploration. `docs/process/decisions.md` has no default for any of them.

Caveats (this is not a like-for-like test):
- **O30: it ran in the main checkout, not the worktree.** It found no items 91008, 91010 or 91012 because the work is on `globuland-retro/maps`. It guessed "another branch or uncommitted" but did not run `git worktree list` or `git branch`, which would have found it in seconds. A fair docs test should start in the worktree.
- **O31: it lacked the brief and the prompt**, so it could not know the prompt named one orb ("Gargaros/Ogralus/Orcanos orb -> Orbe Oni nostalgique"). Its recommendation of four orbs changes the prompt's scope, and the cost is stated. The map agent's guess (3001, one orb) kept the scope but was a coin flip. Both are defensible. Neither can be validated without the user.
- **O32: cost contrast.** Answering the questions took 17 seconds. The p1 run took more than 25 minutes and about 200k tokens (O18, O24). Questions are cheap. Verification is expensive.

Doc improvement candidates for the receiving project (not the Prompter app): a default rule for "one item, several destinations", and a note on how the client lists a type 9 map after `mapWarp`.

Still waiting: the user's decision on p1 (approve as it stands, or answer the three questions first).

### B12: User answers to the 3 p1 decisions, 2026-11-12 22:04:51 CET

Answers:
1. Popcorn "Katie" is the Banditnyan team; Valentine "Enma" is the Sirénée team. These are the two maps for items 91010 and 91012.
2. Oni orb: four images already exist in `dataDownload/to_be_implemented/`. "I laid down all the assets you need." This means four orbs, one per event.
3. Warp menu: yes, hide the nostalgia maps. The "needs a check on the real client" part was not addressed.

Observations:
- **O33: the prompt's character names were not in the data.** "Team Katie" and "team Enma" are the characters the user knows, while the map data names the team after a different character (Banditnyan, Sirénée). Only the user can map them. The agent was right to stop (B10). Prompt-side fix: give the map id or the name as it appears in the data.
- **O34: the answer to Q2 was already in the repo.** The agent had listed about 15 files in `to_be_implemented/` and asked "which image goes with which item" (B3, Q4) and the user answered "Maybe ?". Four Oni orb images next to one prompt item that warps to four events strongly implied four orbs. Neither the agent nor the cold session (B11, which recommended four orbs for the opposite reason: it never saw the images) used that evidence before asking. Suggest the agent compares the count of assets with the count of items before asking.
- **O35: "yes" to a question with a condition.** Q3 was "do you want them hidden ... that needs a check on the real client". The answer does not say whether the client check will be done, by whom, or whether to proceed without it. The agent will have to decide, or ask again.
- **O36: scope of p1 grows by decision.** Remaining for p1: 91010 (Popcorn), 91012 (Valentine's), plus 3 more Oni orbs (the existing 91008 becomes one of four), then the warp-menu hiding. That is 5 items and a menu change on top of the 14 done, and the p1 total becomes 19 items, not 16.

Next to watch: who finishes the remaining items (the same sub-agent or a new one), how many tokens and minutes the follow-up takes compared with the first run (21:31 start, about 200k tokens at 25 minutes), and whether the p1 commit is amended or a second commit is made. AGENTS.md says "one commit per prompt", so a second commit would conflict with it.

### B13: Follow-up prompt to the p1 sub-agent (shown by the user), 2026-11-12 22:05:13 CET

Rules touched: "Sub-agent delegation" (resume the same sub-agent), "Git branches" (one commit per prompt), "Procedure" (flag interpretations).

What the manager did right:
- Resumed the same sub-agent with the user's answers instead of starting a new one, so it does not re-read the context. This is what AGENTS.md asks for.
- Told it to **amend** the single p1 commit, keeping the message and Co-Authored-By line. This keeps "one commit per prompt". The watch point in B12 is settled in the agent's favor, subject to what the agent actually does.
- Gave the images' rules again: copy, never move, resize to 158x158, register in the manifest, bump versions.
- For the warp menu, it resolved the open condition (O35) by telling the agent to implement the best server-side option, flag it as interpretation/unverified, and list what the user must test on the client.
- Return format is repeated: the updated completion JSON plus at most five lines of questions.

Observations:
- **O37: stale item count.** The prompt says "status completed only if all 16 items exist". With four orbs the total is 19 (O36), so the completion condition is wrong. The agent may either stop at 16 or flag the mismatch. Watch which.
- **O38: the manager silently corrected the user's spelling.** The user wrote "Banditnyan", the manager passed "Bandinyan" (the data name from B10). This is probably right, but it was not flagged to the user as a correction.
- **O39: "run commit-hook checks again" can mean the whole regression set again.** The first run cost about 25+ minutes and about 200k tokens, mostly on regressions (O24). A follow-up that only adds 5 items and a menu change could repeat that. The prompt does not limit the re-run to the new scenario and to the suites that touch the changed files.
- **O40: image matching by approximate name** ("Gargaros/Ogralus/Orcanos_Ultra_Orb, OrquanosM_orb etc."). The manager is guessing filenames from memory, and it tells the agent to "match by name". If names are close but not equal, the agent will be guessing. Better to list the four exact filenames.

Timing: I am logging at the time shown above. Tell me the time the prompt was sent if it was earlier, so I can measure the follow-up run (the first run: 21:31 start, about 200k tokens at 25 minutes).

### B14: User question to the sub-agent ignored again, 2026-11-12 22:09:37 CET

The user asked the p1 sub-agent: "Why did your 1st reply to the supervising agent took so long ?". It did not answer and kept running tests. This is the second time (B10 was the first, "What is taking so long ?").

Observations:
- **O41: the sub-agent has no way to answer the user, and the user cannot see why.** This follows AGENTS.md ("sub-agents report to you, never to me"), but the rule leaves the user without an explanation while work runs, and the question is not forwarded to the manager either. Suggest: either say once to the user "ask the manager, I report only to it", or have the manager relay a user's question to its sub-agent and bring back the answer.
- **O42: user input mid-run may be ignored or queued.** It is unclear whether the message was seen and discarded, or queued for after the tests. If it is queued, the answer will arrive late. Check whether an answer appears in the agent's return.
- This is a UX finding about the sub-agent model, not a fault of the agent. The cost is that the only source of timing explanation is a question the user cannot get answered. The data to answer it exists in the first run: 21:31 start, 14 of 16 items, six scenario suites, about 200k tokens.

### B15: Cost review of p1 with the manager, 2026-11-12 22:18:16 CET

Rules touched: "Sub-agent delegation" (lightest model, self-contained briefing), "Shared context" (the brief), repo rule "edit data via scripts in Resources/scripts/".

Figures for the first p1 run:
- Manager (from the run notification): about 28 minutes, about 203k tokens, 88 tool calls.
- User (measured): 40 minutes, 216k tokens. The manager thinks the gap includes its own turns and the user's waiting.
- User baseline for a similar task done directly: about 50k tokens, about 5 minutes (B9). A previous agent registered similar items ("Orange mysterieuse", "Melon coriace", "Raisins inquietants") among 50+ stages cheaply, and image conversion and registration cost about 11k tokens.

Manager's explanation (from the report only, it did not read the transcript):
- Slow scenarios (`na_events` about 6 minutes, rerun once), an isolated test stack, a cold worktree, and the commit-hook.
- Tokens: "16 items, each needing an item row, icon, manifest rows, stage-pass gating, trade allowlist change", shared-code changes, a new script and doc, and 88 tool calls re-sending context.
- Its own part: unlimited regression scope, one agent for 16 items.

User's counterpoint: the items are simple, the repo has helper scripts, and the convention is to extend that library when a case is missing. Similar work was cheap before.

Manager's reaction: agreed at once ("You're right"). It added a cost rule to the brief (read `Resources/scripts/README.md` first, use the existing helpers, extend before writing new scripts, run only the own scenario plus `prod_data`, targeted show/grep) and sent the same rule to the running agent. It also asked the agent to record whether `add_item` could have created the first 14 items and why `set_stage_pass` was written. If `set_stage_pass` duplicates an existing helper, it will have it folded in before p1 is approved.

Observations:
- **O43: the explanation was a rationalization, not a diagnosis.** The manager had not read the transcript and said so. Its list (slow scenarios, cold worktree, hook, 88 calls) is plausible, but the user's evidence (same work done cheaply before) is what exposed the cause: a custom script and an over-wide test run, not the volume of work. Suggest the archive's AGENTS.md ask for an efficiency check before delegating ("list the repo's helpers for this kind of change and tell the sub-agent which to use").
- **O44: the brief did mention helpers, but not "use them first".** Line 9 of the brief names the scripts (`add_map, set_item, add_yokai_passive, set_stage_group_restriction, add_enemy_gimmick...`) and says "not by hand". The manager now says it "never pointed the agent at the helper library". Both are partly true: the names were there, but the instruction to read the README and extend before creating a script was not. A longer brief would not have fixed that. A specific rule would have.
- **O45: quick capitulation.** The manager accepted the user's argument without checking whether `add_item` could have covered the first 14 items ("I haven't verified"). The check was delegated to the running agent, which is fine, but the apology came before the evidence.
- **O46: the new cost rule overrides a repo rule.** The repo says to run every scenario touching what you changed; the manager noted this, and the user's instruction overrides it. The first run changed shared code (`stages.py`, `na_events`) with no baseline (O25), so a narrower run (`nostalgia_warp_items` plus `prod_data`) could miss a regression. The rule says to rerun the others "if you changed shared code again", which depends on the agent saying so.
- **O47: the cost rule arrived after the money was spent.** It came after the first 28 to 40 minutes and 203k tokens. Putting the "use the helper library" rule in the archive's AGENTS.md (or the repo's, which the agent reads) would have applied from the start.
- **O48: splitting.** The manager listed "one agent for 16 items" as its own mistake. AGENTS.md says "typically one per thread", which encourages this. Prompt 1 alone had 16 independent items.
- **O49: p1 may grow again.** Folding `set_stage_pass` into an existing helper adds rework to a prompt that is already partial and being amended.

To check next: the agent's note on whether `add_item` could have created the first 14 items, the cost of the second round compared with the first (203k tokens, 28 to 40 minutes), and whether the amended commit still passes with only `nostalgia_warp_items` and `prod_data`.

### B16: p1 completed, manager report, 2026-11-12 22:18:52 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record" (`completed` only when the proof is met), Rules 2 and 3 (a branch starts from a finished prompt).

Result:
- p1 (`2o5n3y2v0v3p`) is complete and **amended** into one commit, `1f7af5193` (was `176f9e1e4`), on `globuland-retro/maps`. The "one commit per prompt" rule held.
- All 19 items exist (ids 91001–91019). The count is now correct (O37 resolved): 91010 → map 3602 (Bandinyan team), 91012 → map 4303 (Sirénée team), and four Oni orbs 91008 → 3001, 91017 → 3004, 91018 → 3007, 91019 → 9813, each with its own icon.
- Proof: `nostalgia_warp_items` 211/211, `prod_data` 37/37, `stage_group_restriction` 99/99 (after the agent gave it a pass item for gated stages). `ci/check-*.py` show no new problems. The scenario now also checks that `mapWarp` leaves no `ywp_user_map` row.
- Warp menu: `MapWarpHandler` no longer creates the `ywp_user_map` row for a pass-gated map. Flagged as unverified on the client; it rests on the interpretation that the client lists only maps that have such a row. A client checklist was given to the user (Event tab and warp menu, battle and chain, the four orb icons).
- `OrquanosM_orb.png` was an opaque 1254 px image on black; the agent keyed out the black, cropped and resized it, and asked the user to check it.
- Paused for approval as required. After approval the manager will start Maps p2 and Skills p5 in parallel and pass on the cost rule.

Answer to the B15 question: the agent says `add_item` created all item rows, but no helper sets a stage's pass fields (`UseActionType`, `UseActionId`), so `set_stage_pass` was written for that only. The user's counterpoint was right for the items and partly wrong for the stage gating. The manager has not checked whether `set_stage_flags` or `set_map_field` could do it.

Observations:
- **O50: incomplete regression on the final code.** The manager's message says na_events was "started again after the MapWarpHandler" and the sentence stops there (the pasted text is cut, or the manager truncated it). The user needs to confirm the full text. If na_events was not rerun to pass, then p1 is marked complete after a change to `MapWarpHandler` (shared server code) with the regression that broke earlier (O25) unconfirmed. This is the risk raised in O46, and the cost rule allowed it.
- **O51: server code changed, not only data.** `MapWarpHandler` is shared. The change ("no row for a pass-gated map") may affect every pass-gated map, including the existing "Laissez-passez" items (27013, 90015), not only the 19 new ones. The report does not say it was checked. The user asked to hide the nostalgia maps "doing what the repo supports", and this goes further than data.
- **O52: two shared scenarios edited** (`na_events` earlier, now `stage_group_restriction`) to keep tests passing after a behavior change. Tests were adapted to the change, which hides regressions.
- **O53: the results are good, and the second round was fast.** The user says the agent "finished quickly" after the cost rule. The manager's cost rule (use helpers, narrow tests) seems to have worked. Time and tokens for the second round are not recorded yet: the user should send them for B15's comparison.
- **O54: three new decisions for the user** that the sub-agent surfaced instead of guessing: (1) four orbs share the name "Orbe Oni nostalgique" with only the icon differing (the prompt gave one name); (2) maps 2 and 3 of each event still get a `ywp_user_map` row after the boss via `nextMapId` and may show in the Event tab; (3) fold `set_stage_pass` into an existing helper first, or keep it as a new script. Good behavior: asks, not guesses.
- **O55: the final report is clear and structured** (state, how to check on the client, open questions, next step). This is the best report of the pass so far.

Timing: p1 started 21:31. Final report logged at the time above; the user should confirm the send and arrival times.

### B17: User answers on orbs and Event maps, manager relay, 2026-11-12 22:20:59 CET

Rules touched: "Pauses", "Git branches" (one commit per prompt), "Sub-agent delegation" (the manager relays, the sub-agent never contacts the user).

User answers: (1) the four orbs keep the same name and description. (2) Hide all three maps of each event from warping. The user added that the room maps (the one the "Raisins inquietants" warps to) already do not appear in the warp tab, as a model. Question 3 (`set_stage_pass`) was not answered.

Manager:
- Sent both answers to the Maps agent and pointed it at the room maps as the model.
- Will have the agent amend the p1 commit again (still one commit per prompt).
- Cost rule applies: only `nostalgia_warp_items` and `prod_data`; the agent will say if it skips `na_events`.
- Does **not** treat the answers as approval of p1, since there is more work. It waits for an explicit "approved" before starting p2 and Skills. This is the right reading of the Pauses option.
- Leaves `set_stage_pass` as a new script, because the user did not say otherwise.

Observations:
- **O56: the manager acted on the user's hint without being told to.** The user's note about room maps gave a working pattern; the manager passed it to the agent as the model. This is the sort of repo knowledge only the user had.
- **O57: silence became a decision.** "I'll leave it as is unless you say so" turns an unanswered question into the default of keeping a new script. This is stated openly, so the user can reverse it. It also answers the earlier open point about whether the agent could fold the helper: the default is no.
- **O58: the scenario promise helps with O50.** "It will tell me if it skips na_events" is the first sign that the manager will track the regression gap from O50 and O46. Still unconfirmed: whether `na_events` passed on the final code before the previous commit.
- **O59: the p1 scope grows once more** (from 16 items to 19 items, then menu changes for all three maps of each of the 11 events). Each round amends the same commit, so the commit has to carry more and more. Watch the final diff size and whether it still matches "do what the prompt asks, nothing more".

### B18: Relay of the user's answers to the sub-agent, 2026-11-12 22:21:25 CET

Rules touched: "Sub-agent delegation" (self-contained briefing, return format), "Git branches" (single commit).

The briefing to the Maps agent:
- Orbs keep the same name and description. Hide all three maps of each event from warping and listing.
- Points the agent at the room maps ("Raisins inquietants" target) as the existing mechanism, with the places to look (`mapType`/field, `docs/game-logic/maps.md`, `show map`). It tells the agent to reuse that mechanism "instead of the MapWarpHandler workaround if it is cleaner", and to keep what is still needed.
- Use the existing helpers (`set_map_field` etc.); cost rule: only `nostalgia_warp_items` and `prod_data`, plus `na_events` only if shared code it uses is touched, and say if it was not run.
- Amend the single p1 commit (same message and Co-Authored-By). Return the updated completion JSON plus at most five lines of open questions.

Observations:
- **O60: this addresses O51 and O52.** If the room mechanism works, the shared `MapWarpHandler` change can be removed or reduced, and the existing pass-gated maps are no longer at risk. This is a stated option ("if it is cleaner"), not an order, so the agent may keep the handler change.
- **O61: the agent receives the user's hint verbatim, with places to look.** Compared with O40 (image names from memory), this briefing points at the code and docs and not at guessed names. It reads better.
- **O62: the na_events condition is conditional on the agent's honesty** ("if you touch shared code it uses; say if not run"). It relies on the agent knowing which scenarios depend on which shared code. If the agent reverts the handler change, `na_events` may no longer be needed, but the earlier edit to `stages.py` and the event points (O25) was never baselined. Check the final diff for this.
- The briefing is one dense paragraph with no sections. It works, but it is harder to scan than the first briefing (B7).

### B19: What is set_stage_pass? 2026-11-12 22:24:24 CET

Rules touched: repo rule "edit data via scripts in Resources/scripts/" and "extend an existing helper before writing a new script" (the cost rule, B15).

The user asked the manager what `set_stage_pass` is. Answer: a 63-line script from p1. With `--item ITEM_ID` it sets a stage's `UseActionType` (column 18) to 1 and `UseActionId` (column 19) to the item. With `--clear` it resets both to 0. `GameStartHandler` then spends one item per battle or answers "You don't have the pass." It resolves every id before writing, supports `--dry-run`, and bumps the `ywp_mst_stage` version and registry row through the shared `mst_tables` helpers. It gates each nostalgia map's first stage behind its warp item, as 27013 gates map 5001.

User verdict: **this is a valid helper script.** This settles the open point from B16 and B17: keep `set_stage_pass` as a new helper. The manager's offer to check `set_stage_flags` and `set_map_field` and to fold the logic in is therefore not needed.

Observations:
- **O63: the first reading of the new script was too harsh.** O43, O44 and O49 treated `set_stage_pass` as a possible sign of avoidable cost. The user's own judgment is that it follows the repo's convention (a helper for a recurring case with `--dry-run`, id checks and version bumps). The actual cost cause was the over-wide regression scope and the rebuilt test stack, not this script. Keep O43/O44 for the missing helper-first instruction, drop the script as evidence of waste.
- **O64: the manager asked again** ("Should I check and fold it?") after saying earlier it would leave the script as is. Not a problem, but the question has an answer now and the manager should not spend more tokens on it. Suggest: the manager records the user's verdict in the brief, as a decision, so later agents do not reopen it.
- **O65: the manager described the script accurately and neutrally,** including its safety features, but it had not looked at whether a helper already covered the fields. It said so. The description came from the agent's report.
- **O66: the user can query the manager for facts during a run** and gets a quick, grounded answer. The earlier questions to the sub-agent (B10, B14) were ignored (O41). This is the working channel; it should be stated in the archive's AGENTS.md ("ask me, not the sub-agents").

### B20: Clarification, 2026-11-12 22:25:22 CET

The second copy of the B18 briefing was a paste error by the user, not a duplicate send by the manager, so there was no extra cost.

The user's real expectation after B19 was that the manager would **tell the Maps agent that `set_stage_pass` is a valid script**. The manager had asked "Should I check and fold it?" instead and did nothing until the user answered. Observation:
- **O67: a verdict given in a side question is not relayed.** The user answered the manager's question about the script, but the manager's only open action was to wait for a yes/no on folding. Suggest a rule in AGENTS.md: "When the user settles something a sub-agent or the brief depends on, relay it to the sub-agent and add it to the brief as a decision, without asking again." This is the same gap as O64.

### B21: p1 amended again, manager report, 2026-11-12 22:26:35 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record", Rule 2.

Correction first: the user says there was nothing wrong with the manager not relaying the `set_stage_pass` verdict, since the script was valid and needed nothing more. **O64 and O67 are withdrawn** as faults. The manager waited for a yes/no that was not needed, which cost nothing.

Result:
- p1 amended to commit `42035571a` on `globuland-retro/maps` (the third hash: `176f9e1e4`, then `1f7af5193`, now this one). Still one commit for the prompt.
- The agent reused the **Room mechanism**: all 140 maps in these events are now `mapType` 4, set with `set_map_field`. This covers every `nextMapId` chain (maps 2 and 3) and all maps of the scramble events.
- It **reverted the `MapWarpHandler` change**, so the shared server file is back to its previous state. This resolves O51 and O52 (shared-code risk) and confirms O60.
- Proof: `nostalgia_warp_items` 211/211, now also checking that every map in each item's chain is mapType 4, plus pass gating, trade and the stage 1 spend. `prod_data` 37/37. `ci/check-*.py` clean.
- **`na_events` was not rerun** after the mapType change. It passed 282/282 earlier. The agent says mapType 4 only affects map-list display, but did not verify it. The manager reported this openly, as promised.
- Unverified on the client: event chains with mapType 4 (event points and boss ball spawn, unlock of maps 2 and 3 after the boss, title and banner display); Room rows are created at account creation while these maps get theirs at `mapWarp` or the `nextMapId` unlock. Revert path: set mapType back to 3 on the same 140 maps (ids are in the doc and changelog). Open question: if the chains misbehave, revert to mapType 3 and use the earlier server-side workaround?
- Paused for approval. Next, after "approved": Maps p2 and Skills p5 in parallel, with the cost rule.

Observations:
- **O68: an old risk is still open, na_events.** The scenario that broke at the start of p1 (O25) and was patched without a baseline has not run on the final data. The change touches data it reads (events 1 and 8 among the 140 maps). Approval of p1 lets two threads branch from this commit, so a regression found later is carried by both. The manager said na_events takes about 6 minutes. One run before approval is cheap compared with finding it later.
- **O69: scramble maps are affected by p1 and p2 both.** mapType 4 now applies to all scramble maps, including those without a warp item, which p2 (Clean Scrambles) will rename as "Legacy ...". The two prompts overlap. The p2 agent needs to know this: the brief does not say it yet. Suggest a line in the brief: "p1 set mapType 4 on all scramble-event maps".
- **O70: inconsistent counts.** The manager says "six scramble events"; p1 has 8 scramble items, and the earlier pre-flight said 7 battles x 15 = 105 maps. The user should confirm which maps are in the 140.
- **O71: honest reporting of what was not run** ("na_events not rerun", "unverified in the client"). The report separates verified from unverified. This is the behavior wanted, even though O68 remains.
- The cost of this round (time and tokens) is not recorded. The user should send it.

### B22: User client test of p1, manager reply, 2026-11-12 22:37:10 CET

Rules touched: "Pauses" (explicit approval before dependents start), "Completion record" (proof).

User test, on the amended commit `42035571a`:
- From a clean start (nix-shell, `just reset`) the server runs and the client connects. `set_dev_account` works.
- All items appear and teleport correctly. The maps are hidden from the warp tab.
- Point shop, event ball spawn and the unlock of the next map are all correct on the mapType 4 maps. Titles show properly. Banners can no longer be seen because the maps are not in the warp tab, which is the wanted result. All four Oni orb icons are correct.

Manager: thanked the user, listed what was still unchecked (chain behavior, titles and banners, orb icons), and asked whether to finish those first or approve. The user's first message had not said "approved", and the manager did not treat it as approval. It started neither Maps p2 nor Skills. After the user's second message, nothing is recorded yet.

Observations:
- **O72: the "unverified" flags paid off.** Every item the agent and manager marked as unverified (Room mechanism on multi-stage chains, orb icon keying, hiding from the warp tab) was a precise client check, and all passed. The user tested exactly what the report listed, without searching for risks. This is the report format working as intended (O71).
- **O73: the clean-start run is evidence the commit is reproducible.** A fresh `just reset` plus `set_dev_account` on the worktree shows the data, scripts and registry rows are consistent, which no scenario covers.
- **O74: a client test cannot cover banners once the maps are hidden.** The checklist item "title and banner display" was moot by design. A checklist item that conflicts with the requested outcome should have been dropped by the agent.
- **O75: O68 is still open.** `na_events` was not rerun after the mapType change, and neither the user's test nor the manager's reply covers it. The client test passes the event chains by hand, but not the 282 checks.
- **O76: the pause rule works as written.** The manager waited for an explicit "approved" even after a full set of passing tests.
| User client test of p1, all checks passed (B22) | 2026-11-12 22:37:10 CET |

### B23: Implicit approval, p2 and p5 start, 2026-11-12 22:37:52 CET

Rules touched: "Pauses", Rules 2 and 3 (a branch starts from the commit that completed its prompt), "Git branches", "Worktrees".

The manager read the user's passing checks as approval of p1 ("All your checks pass, so I'm taking that as approval") and started Maps p2 (Clean Scrambles) and Skills p5 (New Custom Skills) in parallel. The user accepts this reading. The manager is preparing the worktree for Skills, which branches from the p1 commit.

Observations:
- **O77: the pause rule asks for approval but accepts an implied one.** The manager said out loud that it was inferring approval, and the user agreed. This is acceptable when stated. A stricter reading of "wait for my approval" would have asked once more. For the archive's AGENTS.md: define what counts (an explicit word, or any "all checks pass" message) so agents do not have to decide.
- **O78: first real parallel start.** Up to now only one thread ran at a time (O12). p2 and Skills p5 are independent after p1, so this is the first test of rule 3 (the branch and its parent thread are independent) and of two worktrees at once.
- **O79: open items to check on these two threads:** the `mapType` 4 note for p2 in the brief (O69), the cost rule, the `na_events` run (O68), and whether p5 gets a branch cut from `42035571a` and not from later work.
- Times and tokens for p2 and p5 will be recorded separately for comparison with p1 (about 28 to 40 minutes and about 203k to 216k tokens for the first run, with the rework after).
| p1 approved by implication; p2 and p5 starting (B23) | 2026-11-12 22:37:52 CET |

### B24: Briefings to the p2 and p5 sub-agents (shown by the user), 2026-11-12 22:38:49 CET

Rules touched: "Sub-agent delegation" (self-contained briefing, return format), "Shared context", "Git branches", "Worktrees", Rules 2 and 3.

Both briefings use the same template as B7 and are self-contained: absolute paths to the brief, the archive's AGENTS.md and the prompt; the worktree and branch; no push, merge or rebase; the archive is not edited; the re-prompt step; one commit with the specified message and the Co-Authored-By line; the return format (completion JSON, at most five lines of questions, one line on scope change). The cost rule is repeated inline (existing helpers, only the own scenario plus `prod_data`, targeted `show`/`grep`).
- **p2 (Clean Scrambles)**, worktree `maps`, branch `globuland-retro/maps`, commit "Maps: Clean Scrambles". Tells the agent what p1 did, via `docs/game-logic/nostalgia-warp-items.md`, and that scramble maps are mapType 4. Gives the decision on "legacy": map name "Legacy <scramble details>", the new name copied into the description, 2 lines/38 chars via `wrap_map_description`.
- **p5 (New Custom Skills)**, worktree `maps-skills`, branch `globuland-retro/maps-skills`, commit "Skills: New Custom Skills". Says it must not rely on later map prompts (rule 3). Tells it to use an isolated compose project and ports, because another agent works in parallel, and to revert `docker-compose.yml` edits. Gives the soultimate rule ("all AttackBooster types count"), the docs to follow for custom passives, and says to stop and ask if HP/ATK values are truly absent.

Observations:
- **O80: O69 is covered, but in the briefing and not in the brief.** p2 is told that scramble maps are mapType 4. Later agents will not learn it from the brief unless it is added there.
- **O81: port conflict between the two parallel agents is half handled.** p5's briefing says to use isolated ports "see brief"; p2's does not mention ports at all. p1 used Postgres on 15433. If p2 reuses that and p5 picks the same, the scenarios will collide. Check the brief for a port plan and the two runs for failures that are not real.
- **O82: Task 2 of p5 is not covered by the user's answer.** The decision quoted is "all AttackBooster soultimate types count". Task 2 of the prompt is **DefenceBooster** (SoultimatePresentBoost), and the user never answered for it (O8). The briefing says the docs answer it, which is true only for attack boosters as far as the briefing shows. Watch whether the agent flags it, assumes it by analogy, or asks.
- **O83: good: the p5 briefing names the stop condition** ("HP/ATK values truly absent: stop and return a question"). The prompt gives only an example (+30% ATK) and no HP/ATK values, so this is the kind of question to expect.
- **O84: "next free id ~8000073"** is an estimate from the pre-flight, not a verified id. The agent should check it with `show`.
- Start times: both agents started when the user sent the briefings; the user should confirm the times for p2 and p5.
| p2 and p5 briefings seen (B24) | 2026-11-12 22:38:49 CET |
| Manager's estimates per prompt seen (B25) | 2026-11-12 22:40:22 CET |
| p2 done, commit 1a3a70e77, about 7 min (B26) | 2026-11-12 22:45:31 CET |
| p2 approved, p3 started (B27) | 2026-11-12 22:47:02 CET |
| p5 done, commit 2546d5f19 (B28) | 2026-11-12 22:49:06 CET |
| User answers on p5 and approval (B29) | 2026-11-12 22:50:06 CET |
| Manager holds p6 until the p5 amend finishes (B30) | 2026-11-12 22:50:42 CET |
| User worry about --force, manager check (B31) | 2026-11-12 22:51:29 CET |
| User objection to boss yokai; correction sent (B32) | 2026-11-12 22:54:24 CET |
| p5 amend done in 3m32s, p6 started (B33) | 2026-11-12 22:55:00 CET |
| p6 briefing seen (B34) | 2026-11-12 22:55:34 CET |
| p3 status line: waiting on own background work, 9m24s (B35) | 2026-11-12 22:56:40 CET |
| p3 still waiting, 12m29s; manager clarifies source of the p5 gap (B36) | 2026-11-12 22:59:04 CET |
| p3 done, commit 2c19301e8, about 17 min (B37) | 2026-11-12 23:04:57 CET |
| p3 approved, p4 started (B38) | 2026-11-12 23:07:49 CET |
| p6 done, commit 209a65ca1; user sent suggested reply about the 11 boss yokai (B39) | 2026-11-12 23:09:17 CET |
| Manager acts on the suggested reply (B40) | 2026-11-12 23:09:35 CET |
| User questions routing of the group task to the p4 agent (B41) | 2026-11-12 23:12:25 CET |
| Manager explains routing; user says the reply was a test (B42) | 2026-11-12 23:17:18 CET |
| p6 approved; p7 progression question (B43) | 2026-11-12 23:24:30 CET |
| p7 started; device-check advice (B44) | 2026-11-12 23:25:33 CET |
| p4 done, commits fa8771f02 and b4b83cfba, about 23 min (B45) | 2026-11-12 23:31:01 CET |
| p4 approved; retrospective on the follow-up (B46) | 2026-11-12 23:36:19 CET |
| p7 done, commit 1c64ddb3e, about 13 min; answers given, not approved (B47) | 2026-11-12 23:38:49 CET |
| p7 answers relayed; token jump 10k to 140k on resume (B48) | 2026-11-12 23:39:43 CET |
| p7 amended to 92626110d, awaiting approval (B49) | 2026-11-12 23:43:41 CET |
| Manager usage report: $12.11, week 9% (B50) | 2026-11-12 23:45:28 CET |
| p7 approved, p8 started in a new worktree (B51) | 2026-11-12 23:45:40 CET |
| p8 stopped without editing; user cancels it (B52) | 2026-11-12 23:46:58 CET |
| p8 cancelled, p9 started and stopped on the mechanism (B53) | 2026-11-12 23:47:59 CET |
| User picks option A for p9; briefing sent (B54) | 2026-11-12 23:48:42 CET |
| p9 first briefing and the agent's stop, pasted in full (B55) | 2026-11-12 23:49:06 CET |
| Status while p9 builds (B56) | 2026-11-12 23:49:27 CET |
| User proposes one agent per thread (B57) | 2026-11-12 23:52:03 CET |
| p9 done, commit 8c4240976, about 7 min after the decision (B58) | 2026-11-12 23:55:34 CET |
| p9 approved; p10 started (B59) | 2026-11-12 23:57:42 CET |
| p10 done, commit 0924a25b9, about 10 min; approved (B60) | 2026-11-13 00:08:11 CET |
| p11 started in the fourth worktree (B61) | 2026-11-13 00:09:07 CET |
| p11 done as partial, commit c72d01412, about 8 min (B62) | 2026-11-13 00:16:39 CET |
| User decisions on p11; manager rechecks the pool and explains the test (B63) | 2026-11-13 00:19:07 CET |
| User's stack start fails on leftover agent containers (B64) | 2026-11-13 00:21:43 CET |
| Device crash on the login stamp popup; manager investigates (B65) | 2026-11-13 00:29:53 CET |
| Manager sends the crash to the p11 agent to fix (B66) | 2026-11-13 00:30:26 CET |
| Briefing for the crash fix seen (B67) | 2026-11-13 00:35:19 CET |
| Crash fix report: manifest rows missing, amended to 104ef90cd, device test steps (B68) | 2026-11-13 00:41:40 CET |
| p11 final commit aae6d34f2; user confirms login stamps on the device (B69), about 15 min after the crash report | 2026-11-13 00:45:10 CET |
| Completion record committed as 19ec34449 on table-live (B70) | 2026-11-13 00:47:54 CET |
| Playtest round 1: five defects, three fix agents started (B71) | 2026-11-13 01:01:41 CET |
| Skills fix b5ec2e409 reported, about 10 min (B72) | 2026-11-13 01:11:53 CET |
| Maps and gacha fix agents report; user drops the coin selection (B73), about 46 min after start | 2026-11-13 01:48:00 CET |
| Briefing for the random no-dupe coin seen (B74) | 2026-11-13 01:48:31 CET |
| Transparency fix confirmed; stale-data remark discussed (B75) | 2026-11-13 01:49:23 CET |
| Playtest round 1 closed on the maps and gacha worktrees (B76), about 72 min after the first findings | 2026-11-13 02:13:31 CET |
| User answers: merge and update the record; worktree confusion named as the cause (B77) | 2026-11-13 02:16:51 CET |
| Integration merge under way on a new branch (B78) | 2026-11-13 02:18:50 CET |
| Merge agent briefing seen (B79) | 2026-11-13 02:20:30 CET |
| Integration merge df97265d3 done; record updated as de5778d26 (B80) | 2026-11-13 02:40:51 CET |
| Completion record analysed (B81) | 2026-11-13 02:43:39 CET |
| Final usage: about 17% of the week, over 100% of a 5-hour session (B82) | 2026-11-13 02:45:20 CET |
| Final /usage of the manager session: $23.46, session 94%, week 17% (B83) | 2026-11-13 02:46:43 CET |
| Review closing prompt written; brief and worktrees checked (B84) | 2026-11-13 02:49:57 CET |
| Manager's answers to the closing questions received, with truncated parts (B85) | 2026-11-13 02:57:08 CET |
| Manager's complete answers read from the file (B86) | 2026-11-13 03:11:31 CET |
| User answers the open items: art OK, gated skill OK, integration not tested (B87) | 2026-11-13 03:13:58 CET |

### B25: Manager's estimates per prompt, 2026-11-12 22:40:22 CET

Rules touched: none directly. This is planning data that the user wants kept as a reference. All three p2 and p5 tasks started when each received its manager prompt.

The manager's figures are guesses, based on the pre-flight reports. It has not read the prompts itself. The only real data is p1: **about 55 minutes and 231k tokens, including three rounds of rework** (the first round alone was about 28 minutes and 203k tokens, B15). The token figures assume the cost rule works.

Observations:
- **O85: the table skips p8 and p9.** The estimate table has rows for p2, 3, 4, 5, 6, 7, 10 and 11. P8 (Oni crank-a-kai) and p9 (Nostalgia gacha coin) have no row, yet the notes below the table call p8 "cheapest" and p9 "riskiest". The user should ask for the two missing rows.
- **O86: the totals do not match the rows.** The eight listed rows add up to 3h25 to 7h05 and 0.74M to 1.43M tokens. The manager's total "5 to 10 hours and 0.9 to 1.7M tokens for all eleven" must therefore include the two missing prompts and, perhaps, p1's actual cost. It does not say which.
- **O87: calibration against the user's baseline.** The user's own experience is about 50k tokens and 5 minutes for a simple prompt, and about 11k tokens for registering an image. The manager's low-end estimate for the easiest prompt (p2: 40 to 80k tokens, 10 to 20 minutes) is already above that. P2 is the first real test: if it comes in near the user's baseline, the manager's estimates are about 2 to 4 times too high for routine work.
- **O88: p4, p5 and p9 are flagged as the riskiest, and p7 and p4 as blocked** on the skill value progression and on stage and part ids. Both gaps are the seeded ones (O8). The user will have to decide whether to answer or leave them.
- **O89: scenario time is the main cost driver** by the manager's account (na_events about 6 minutes). The narrow-test rule is the lever; the risk of that rule is O46 and O68.

#### Estimates against actuals (final; actuals are the harness notifications relayed by the manager, B85)

Actual time is the agent's wall time, cumulative over its resumes; tokens are the agent's cumulative notification total (not the bill, O360). The review's own timing log (B-entries) agrees within one or two minutes.

| Prompt | Difficulty (manager) | Estimate time | Estimate tokens | Actual time | Actual tokens | Tool calls | Note |
|--------|----------------------|---------------|-----------------|-------------|---------------|-----------|------|
| Pre-flight (3 readers, Haiku) | n/a | n/a | n/a | about 4.6 min in total | 281.1k | 49 | one resume each; gacha and stamps shared a reader |
| 1 Create new warp items | not estimated | n/a | n/a | 55 min (28 first run) | 231.0k (203k first) | 116 (88 first) | 2 resumes, 2 amends, 1 queued message |
| 2 Clean Scrambles | Low | 10-20 min | 40-80k | 6.2 min | 82.8k | 19 | |
| 3 Lock restored maps to Wib Wob | Low-medium | 10-25 min | 50-90k | 16 min | 92.9k | 37 | 1 message (`--force` objection) |
| 4 Pocket parts in Wib Wob maps | High | 40-90 min | 150-300k | 25 min | 175.3k | 79 | includes the 11-yokai follow-up |
| 5 New Custom Skills | High | 40-90 min | 150-300k | 10.4 + 3.5 min | 134.8k | 54 | 1 amend |
| 6 YKW1 Variant Skills | Medium-high | 30-60 min | 100-200k | 13.8 min | 122.6k | (cut) | |
| 7 Wib Wob 2nd Skills | Medium | 30-60 min | 100-180k | 12 + 2.6 min | 145.2k | 58 | 1 amend |
| 8 Oni crank-a-kai | (cheap, per the manager) | 15-30 min | 50-100k | 0.5 min | 66.4k | 5 | stopped, then cancelled |
| 9 Nostalgia gacha coin | (risky, per the manager) | 40-80 min | 120-250k | 40 s + 6.8 min | 115k | (cut) | stopped, then built |
| 10 Daily gacha coin | Medium | 30-50 min | 100-180k | 9.8 min | 128.5k | 51 | |
| 11 New login stamps | Low-medium | 15-30 min | 50-100k | 7.2 / 10.5 / 12 min | 148.8k | 64 | 2 resumes, 2 amends (device crash fix) |
| Fix: Maps (lock, visibility) | n/a | n/a | n/a | 19.5 min | 158.5k | 72 | |
| Fix: Skills (unlock items) | n/a | n/a | n/a | 11.3 min | 93.1k | 34 | |
| Fix: gacha and coin follow-up | n/a | n/a | n/a | (cut) | (cut) | (cut) | |
| Merge agent | n/a | n/a | n/a | 20 min | 118.9k | 63 | |
| **Total agent tokens** | | | | | **about 2.24M** | | manager's sum; the manager's own tokens unknown |

Reading: time was overestimated (the manager's account: agents ran only their own scenario plus `prod_data`); tokens were roughly within range, p2 slightly above.

### B26: p2 (Clean Scrambles) done, manager report, 2026-11-12 22:45:31 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record", "Procedure" (do what the prompt asks, nothing more), rule 4 (independent prompts).

Result:
- p2 committed as `1a3a70e77` on `globuland-retro/maps`. Paused for approval before p3.
- 97 of the 105 scramble maps are renamed "Legacy <old description>", with the same text wrapped to 2 lines of 38 characters in the description. The 8 round-1 maps that have a warp item are untouched: 3301, 3602, 3903, 4303, 9502, 9514, 9526, 9538. The count adds up (105 - 8 = 97) and matches the 8 scramble items from p1.
- Proof: `nostalgia_warp_items` 214/214 (three new static checks: 97 legacy maps, the "Legacy" prefix in name and description, and that warped maps are not marked), `prod_data` 37/37, `ci/check-*.py` clean except the old Libertynyan Crash warning. No other scenario was run.
- Scope unchanged, no open questions.
- Time: briefing seen at 22:38:49, report logged at about 22:45, so **about 7 minutes**. The manager had estimated 10 to 20 minutes and 40 to 80k tokens. The token figure was not given.

The agent working on p5 is having trouble starting its own stack at the same time (user report).

Observations:
- **O90: p2 came in under the manager's estimate**, at about 7 minutes against 10 to 20. It supports O87 (estimates too high for routine work), pending the token count.
- **O91: "<scramble details>" was interpreted, not asked.** Scramble maps have no details field, so the agent used the old description ("Scramble Original, manche 1 : équipe Komasan."). The report says so. The prompt's placeholder was ambiguous, and the agent resolved it from the repo and flagged it, as the briefing asked. "Open questions: none" is a little optimistic given this reading, but the interpretation is stated.
- **O92: one-off Python batch instead of an existing helper.** The agent used `Resources/scripts/lib/mst_tables.py` directly, saying `set_map_field` handles one map per call and does not wrap descriptions. The cost rule says to use helpers. This is a reasoned exception, reported. The batch is not kept in the repo, so the 97 edits cannot be replayed from a script; the changelog and the scenario are the trace.
- **O93: it reverted a diff it did not make.** An unrelated change to `Obtainable-Yokai.tsv` was present when the agent started, and it reverted it because obtainability did not change. If the diff came from the user or from another agent's hook, the revert discards it without asking. The report does not say where the diff came from. Worth checking.
- **O94: wrapping artifact.** `wrap_map_description` starts a line with ":" on a few Halloween maps. Cosmetic, and those maps are hidden.
- **O95: O81 has happened.** The p5 agent is struggling to start its isolated stack while p2 also runs scenarios. Two agents in parallel with a shared Docker host is the weakest point of the parallel start (ports, compose projects, the `docker-compose.yml` edits). Ask the user for the exact error.
- **O68 (na_events) stays open.** P2 renamed 97 maps and no regression was run. The risk is low for names and descriptions, but not shown.

### B27: p2 approved, p3 started, 2026-11-12 22:47:02 CET

Rules touched: "Pauses" (explicit approval before the next prompt), "Sub-agent delegation", "Git branches", rule 1 (a thread's prompts run in order).

The user wrote "approved". The manager started p3 (Lock restored maps to Wib Wob) in the `maps` worktree, on the same branch after p1 and p2. It told the user the commit will be "Maps: Lock wib wob restored map stages to WibWob group", that the agent must stop and ask if a map boss is not in group 999998 and the lock would refuse it, and that p5 is still running on the Skills thread.

The briefing to the p3 agent (shown by the user) follows the same template as B7 and B24. It adds the facts known from the pre-flight: Wib Wob group 999998 (457 yokai), YKW1 group 999999 (Ogralos maps 3007 to 3009, the restriction the prompt says to overwrite), the helper `Resources/scripts/set_stage_group_restriction` (`--map ID... --group GID --name NAME | --clear`), and the instruction to report which bosses are not in the group and ask, not guess.

Observations:
- **O96: the pasted briefing has a broken sentence.** Between the script's usage and the boss rule it reads "...| --clear); pfights); if some boss is not in group 999998...". Text is missing, apparently where the manager explained which maps count and what "map bosses" means (the user's answer in B4). This looks like the same paste truncation as before (B7, B16), but it matters here, because that is the passage that defines p3's scope. The user should check the original message.
- **O97: the set of maps to lock is not defined in what we can see.** The prompt says "all wib wob restored maps". Candidates: the 19 warp-item chains, the 140 mapType 4 maps, the 105 scramble maps (97 now "Legacy"). Locking legacy scramble maps has no use, while their bosses are probably outside the group. The manager's stop rule covers the bosses but not the map set. This is the seeded ambiguity (B3, Q6); watch how the agent decides and whether it flags it.
- **O98: no port or stack plan again (O81, O95).** P5 is struggling to start its isolated stack while p3 will also run a scenario (the briefing says "your own scenario plus prod_data"). The p3 briefing does not mention isolated ports or a compose project. A collision with p5's stack is likely.
- **O99: the manager's cost rule continues unchanged** (own scenario plus `prod_data`, targeted show/grep), so `na_events` is still out of the loop (O68). Lock changes touch battle init, which `na_events` might exercise.
- Time: p3 started when the user saw the briefing, at the time above. Manager's estimate: 10 to 25 minutes and 50 to 90k tokens.

### B28: p5 (New Custom Skills) done, manager report, 2026-11-12 22:49:06 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record", rule 3 (the branch must not rely on later prompts of its parent thread).

Result:
- p5 committed as `2546d5f19` on `globuland-retro/maps-skills`. Paused for approval before p6. Started at about 22:38 (B24), reported at the time above.
- Two custom passive types: 999999976 SoultimateMissingBoost and 999999975 SoultimatePresentBoost. The owner gets the boost when no ally (Missing) or at least one ally (Present) has a soultimate of the chosen family.
- Two dev-only host clones: 8000089 (+30% ATK, attack family) and 8000090 (+20% HP and +30% ATK, defense family). The brief's suggested id 8000073 was already a real yokai, so the agent used the next free id.
- Family sets taken from the Medal Battle role sets (`MedalBattleManager.AttackBoosters` and `DefenseBoosters`, made public). Attack: types 15, 24, 40, 55, 61, 82. Defense: 17, 61, 70.
- Proof: `soultimate_boost_battle` 45/45 and `prod_data` 37/37. Host 8000089 is boosted with no attack booster and unchanged with type 15 or 24. Host 8000090 is boosted with type 17 or 61 and unchanged with none or an attack-only booster. `ci/check-*.py` show only baselined or old warnings. No other scenario was run.
- Files: `PassiveUnityManager.cs`, a new doc `soultimate-boost-skills.md`, clone assets, plus `item_drop.txt` and `ywp_mst_youkai_view_2d.txt` as clone side effects.

Three open questions, each an unverified interpretation: (1) whether "no member of the team" includes the owner's own soultimate (the agent excluded it, so the owner can still get the Missing bonus); (2) whether type 61 (attack up plus damage cut) counts in both families (assumed yes); (3) whether the extra variants 40 (attack plus fever) and 70 (damage cut plus heal) are wanted.

Observations:
- **O100: O84 was right.** The pre-flight's "next free id ~8000073" was already a real yokai. The agent checked and moved on, as the briefing said. A guessed id in a briefing is a hazard; here it was caught.
- **O101: O82 resolved well.** The user's decision covered AttackBooster only. For DefenceBooster the agent found the existing Medal Battle role sets, used them, and listed the extra types as questions (Q2 and Q3), not as silent choices.
- **O102: O83 did not trigger.** The prompt gave only "+30% ATK" and no HP value. The agent chose values (+30% ATK for attack, +20% HP and +30% ATK for defense) and did not stop, although the briefing said to stop if the values were "truly absent". The +20% HP is invented; it is shown only in the host and skill text. Check whether the user wants to set these numbers.
- **O103: shared C# changed with narrow tests.** `PassiveUnityManager.cs` and `MedalBattleManager` visibility are shared battle code. Only the new scenario and `prod_data` ran. A change to the passive pipeline can affect Medal Battle and other passives. This is the same risk as O46 and O68, with a bigger blast radius than the data-only prompts.
- **O104: the stack trouble from B26 was solved** (the agent finished with a passing 45/45 scenario). The manager does not say how. The notes should still record what the fix was.
- **O105: the clone side effects in `item_drop.txt` and `ywp_mst_youkai_view_2d.txt`** are not explained beyond "clone side effects". Fine if the helper produces them, but unreviewed.

### B29: User answers on p5 and approval, 2026-11-12 22:50:06 CET

Rules touched: "Pauses", Rule 2 (a branch starts from the commit that completed the prompt it builds on), "Git branches" (one commit per prompt).

User answers to the three p5 questions, with "approved" in the same message:
1. "No member of the team" **includes the owner's own soultimate.** The agent had excluded it, so the code has to change.
2. Type 61 counts in both families (yes).
3. Extra variants wanted: attack boost plus fever (type 40) in the attack family, and "damage cut" in the defense family.

Observations to watch:
- **O106: approval and a change request in one message.** Answer 1 reverses what the agent built, so p5 needs another amend. The user also said "approved". With p1 (B17) the manager did not treat the answers as approval because there was more work. Here the approval is explicit. Check what the manager does: amend p5 first and then start p6, or start p6 now.
- **O107: rule 2 against an amend.** p6 builds on p5. If p6 is branched from `2546d5f19` and p5 is then amended, p6 sits on a hash that no longer exists in the branch, and it lacks the owner fix. This is the case the rule "from its result, not later work" does not cover. The safe order is amend p5, then branch p6.
- **O108: answer 3 is ambiguous for the defense family.** The user wrote "damage cut for defence boost". The agent's defense set is types 17, 61 and 70, where 70 is "damage cut plus heal". It is unclear whether the user means keeping 70 as it is, or damage cut alone. Check whether the manager asks or assumes.
- **O109: the +20% HP value (O102) was not addressed in this answer.** It stays as the agent's choice unless the user says otherwise.

### B30: Manager's handling of the p5 answers, 2026-11-12 22:50:42 CET

Rules touched: Rule 2, "Git branches" (one commit per prompt), "Pauses".

The manager sent p5 back for the owner rule (Missing: nobody on the team, owner included, has a soultimate of the family; Present: at least one does, owner included), kept type 61 in both families, kept type 40 in the attack family and the damage-cut types in the defense family. The agent updates code, scenario, doc and changelog and amends the single commit, running only `soultimate_boost_battle` and `prod_data`. The manager **holds p6 until the amend finishes**, because p6 builds on p5 and "starting it first would put it on a commit that's about to be rewritten". p3 is still running.

Observations:
- **O110: O106 and O107 resolved correctly.** The manager saw the amend hazard on its own and chose the safe order, treating "approved" as approval to proceed once p5 is stable. It is the same reasoning as in B17 but better: it names the reason.
- **O111: O108 was assumed, not asked.** "The damage-cut types stay in the defense family" keeps types 17, 61 and 70 as they were, which reads the user's "damage cut for defence boost" as "no change". This may be right, but the manager did not say that type 70 (damage cut plus heal) is included on that reading. It is the kind of interpretation the brief says to flag.
- **O112: the time cost of holding p6.** p6 is the next prompt in the Skills thread. While p5 is amended, only p3 and the p5 amend run. Waiting is the correct call, but it is the reason this roadmap stays mostly sequential (O12).
- **O113: another narrow-test run on shared C# code** (the owner rule changes the passive logic again). `na_events` and Medal Battle regressions are still not in the loop (O103, O68).

### B31: Worry about a `--force` flag, manager check, 2026-11-12 22:51:29 CET

Rules touched: "Procedure" (do what the prompt asks, nothing more), repo rule "edit data via scripts", brief line "Interpretations must be flagged".

The user saw something that looked like an agent adding a `--force` flag to one of the repo's scripts and asked the manager. The manager **checked the uncommitted changes in both worktrees** and reported:
- No script gained a flag. The p3 agent (still running) changed `api-scripts/scenarios/stage_group_restriction.py` so that `add_yokai` is called with `--force`, and added three extra candidates to the pool of yokai outside the group.
- `--force` already exists in `Database/scripts/add_yokai` (documented in its usage). Without it the script refuses to grant yokai the game never lets a player own, such as boss rows. The agent did not touch `Database/scripts`.
- Likely reason (not verified): the p3 scenario needs yokai both inside and outside the Wib Wob group, including boss yokai. The p5 agent met the same refusal and worked around it with non-boss carriers.
- Effect: used only on a throwaway scenario account, so no server behaviour changes. The manager will ask the agent to explain in its report, and can have it switch to non-boss carriers.

Observations:
- **O114: the manager verified before answering.** It read the actual diffs in both worktrees and separated what it saw (the call, the documented flag) from what it guessed (the reason). This is the monitoring channel that O21 and O41 said was missing, and it works on request.
- **O115: two agents, two answers to the same obstacle.** p5 avoided the refusal with non-boss carriers, p3 bypasses it with `--force`. The brief has "Notes from sub-agents (append one line each)", but neither one's workaround is shared. A line in the brief ("add_yokai refuses boss rows: use non-boss carriers, or --force in scenarios only") would have made the choice once.
- **O116: a safety refusal overridden with a flag.** Both uses are in test code, so the risk is low. Still, "an agent bypasses a guard" is the kind of event the user wants to hear about before the commit, not after. The manager's plan to ask for the reason in the report is right. A rule for it: "Report any use of --force or similar overrides, with the reason".
- **O117: `stage_group_restriction.py` has now been edited by p1 (a pass item for gated stages, B16) and p3.** A shared scenario modified by successive prompts for their own needs is the same pattern as O52.
- **O118: the user's wording ("adding a --force flag to one of our scripts") and the actual change (calling an existing flag) differ.** The user was right to ask, because the effect looked like a change to shared tooling. The report format could name "uses of existing overrides" separately from "changes to scripts".

### B32: User objection to boss yokai in the scenario, manager correction, 2026-11-12 22:54:24 CET

Rules touched: "Sub-agent delegation" (the manager is the user's only contact), "Procedure" (flag interpretations, ask rather than guess), the brief's "Decisions by the user".

The user asked why the p3 agent uses a boss yokai at all, since many non-boss, non-YKW1-group yokai exist. The manager answered:
- It does not know and will not guess the agent's reasoning. One possible cause: **its own briefing** mentioned "map bosses" in the Wib Wob lock context, and the agent may have read that as "the scenario needs boss yokai". That would be the manager's wording, not a real need.
- It sent the agent the user's objection and three orders: use only non-boss yokai for the outside-group case (and the inside case), drop `--force` and the extra boss candidates `[4133000, 4134000, 4221000]` from `stage_group_restriction.py`, and return a one-line reason if it still thinks a boss is required. It also clarified that "map bosses" in its earlier text concerned which yokai the map's stage restriction applies to, not what the scenario must own.
- The message is queued for the agent's next tool round, or the agent is resumed with it if it finishes first. The manager will report when the agent is back and says not to resend before the notification.

The user reports that the agent stopped its scenario runs and is waiting for the notification before proceeding.

Observations:
- **O119: the brief's wording of the "bosses" decision is misleading.** Brief line 21 reads: 'Map bosses = the yokai the player fights on the map (Wib Wob lock concerns them)'. A group restriction applies to the *player's team*, not to the yokai the player fights. The user's answer in B4 was "They meant to be the map bosses the player fights :/", which was about a different question (whether scramble bosses would be refused). The manager's paraphrase merged the two and wrote it into the shared brief, where the p3 agent read it. This is the cascade of a seeded ambiguity (B3, Q6) through the brief (O9, O10). The brief line should be corrected, otherwise p4 inherits it.
- **O120: the manager admitted a probable cause of its own and did not claim to know.** It separated "I don't know" from "possible cause: my wording". This is good practice, and it matches B31 (O114).
- **O121: the correction came after the agent had spent runs.** The agent ran scenarios with boss candidates before the user's objection, so those runs are wasted. The earlier question (B31) came before any commit, which is the right moment, and it saved the commit from carrying `--force`.
- **O122: possible stall.** The agent stopped and "is waiting for the notification", and the manager waits for the agent. If the notification is what delivers the message, it should arrive at the agent's next tool round, but an agent that has stopped may not have one. Watch whether the agent proceeds; if not, the manager must resume it.
- **O123: the correction message to the agent is complete.** It names the file, the exact edit, the candidate ids, the user's reason, an escape ("stop and state the one-line reason"), and the clarification of the earlier wording. It is a better briefing than the original (O96).
- **O124: the user's domain knowledge corrected a design choice** that no check in the workflow would have caught: the scenario passed with `--force`. Only the user's review of the diff stopped it. This is the most direct evidence so far that user spot-checks catch what scenarios do not.

### B33: p5 amend finished, p6 started, 2026-11-12 22:55:00 CET

Rules touched: Rule 2 (p6 builds on p5, so it starts only after p5 is final), "Git branches", "Pauses", "Shared context".

Facts:
- The p5 amend agent finished in **3 m 32 s** (user's notification). Total for p5: about 11 minutes first round plus 3.5 minutes amend, so about 15 minutes.
- The manager started p6 (YKW1 Variant Custom Skills) in the `maps-skills` worktree. Planned commit: "Skills: YKW1 Variant Custom Skills". It told the p6 agent **not to use `--force` and to use non-boss yokai**, passing on the lesson from B32. p3 is still running on the Maps thread.
- The manager disclosed a gap in p5, which is already approved: no scenario covers the case where the owner itself has a family soultimate. Both hosts are Buchinyan clones without a booster soultimate, and no cheap helper gives a host one. Only the code change covers the owner rule. It asks whether to add a third clone to close the gap, or whether the code change is enough.

Observations:
- **O125: the amended p5 result is missing.** The message gives no new commit hash, no scenario count and no "tests pass" for the amend. The user has to ask for it, and the completion record needs it. (The first p5 commit was `2546d5f19`; the amend has a new hash.)
- **O126: the gap is real and is about the user's own change.** The owner-included rule is the one the user reversed in B29. It is now the only rule with no scenario. A third clone, a host that has a booster soultimate itself, is the only way to test it. The manager asked rather than deciding, which is right since it costs another clone and its side effect files (O105).
- **O127: lesson propagated, but only through the briefing.** The `--force` rule reached p6, yet it is still not in the brief (O115, O116), so p7 and later agents depend on the manager remembering to repeat it. Same for the corrected "map bosses" line (O119): the manager has not said it fixed it.
- **O128: the manager flagged a weakness after approval, unprompted.** It could have said nothing. This is good reporting (O71), though earlier would have been better: the user approved p5 without knowing about the gap.
- **O129: parallel again.** p6 and p3 now run at once in different worktrees. p5's stack trouble is over (it finished), so a port collision is less likely, but p6 will need a stack for its scenario while p3 may still hold one.

### B34: Briefing to the p6 sub-agent (shown by the user), 2026-11-12 22:55:34 CET

Rules touched: "Sub-agent delegation" (self-contained briefing), "Shared context", Rule 2 (p6 builds on p5), "Procedure" (flag interpretations).

The p6 briefing follows the same template as B7, B24 and B27, with more facts than any before:
- Helpers to use (`add_yokai_passive`, `set_item`, `add_item`, `add_version_resources`, `add_skill2_placeholder`), the docs to read (`skill-unlock-items.md`, `custom-passive-hosts.md`, `soultimate-boost-skills.md`), and the recipe: `add_yokai_passive ... --item ITEM --flag 1`, then `set_item ITEM --type 21 --param 0 --description`. Model item 28002 ("Bouton Yo-Tube Argenté").
- Decisions: gate the skill slot if possible; the "1st slot" in the prompt is probably the 2nd (flag 1), "state your reading"; image `ykw1_skill_book.png` is in the main checkout (read-only folder, copy never move), register in `20261112`, downscale to 158x158, duplicate check first; base-content edits approved; **do not use `--force`, use non-boss yokai** (the B32 lesson).
- Ids already resolved in the pre-flight: the 12 yokai ids (Damona 2133010 ... Dente 2209010, "verify cheaply with show"), group ids (999999 YKW1, 999998 Wib Wob, 44 Hololive, 3 girls) and tribe ids (1 Brave, 2 Mysterious, 6 Shady, 8 Slippery).
- Stop and return a question rather than guess; one commit "Skills: YKW1 Variant Custom Skills"; the usual return format.

Observations:
- **O130: a good briefing.** Specific paths, the recipe, the exact items, the user's decisions, a verification note for the ids, and the stop condition. The "state your reading" instruction on the 1st/2nd slot conflict is the right way to handle a seeded ambiguity.
- **O131: the facts live in the message, not in the brief.** The recipe, group and tribe ids and the 12 yokai ids will be needed again by p7 (Wib Wob 2nd Skills, same recipe on about nine yokai) and by p11 and p10 in other forms. If they are not in the brief (O80, O127), the manager has to paste them again and p7's agent may rediscover them.
- **O132: inferred ids presented as known facts.** The tribe ids (1, 2, 6, 8) and the mapping "single shady = tribe 6, single slippery = tribe 8" come from the pre-flight's reading of the docs. The user only said "read the doc ... and follow them" (B4), and the briefing lists them under "Known facts". They are probably right, but they were never confirmed, and the briefing's "verify cheaply with show" covers only the yokai ids.
- **O133: parts of the prompt are left to the agent.** The briefing does not mention how "ykw1 allies" and "unity" bonuses are capped per ally, or whether +35% and +5% apply on a 1/1 row. Those were open questions in B1 and B3 and the user's answer was "follow the docs". Watch for how the agent reads them and whether it flags it.
- **O134: no port or stack instruction beyond "isolated compose project/ports (see brief)".** Same as B24. p3 may still hold a stack. Watch for collisions.

### B35: p3 status, 2026-11-12 22:56:40 CET

Rules touched: "Sub-agent delegation" (progress visibility).

The user reports: `Agent "Maps thread: prompt 3" is waiting on its own background work · 9m 24s`. The other agents (p6) are still running and the manager has produced no output.

Observations:
- **O135: p3 is waiting on its own background work.** This is probably a scenario or stack start. The p3 agent started at 22:47 (B27) and the notice says 9 m 24 s, so the notice and the start time agree. B32 told it to drop `--force` and the boss candidates, so it is probably rerunning its scenario. It is not stalled as in O122 if it is waiting on its own process. Nothing to conclude until it returns.
- **O136: the harness shows a status line per agent, which is the progress signal O13 and O21 asked for.** It says what the agent is doing ("waiting on its own background work") and for how long, but not what the work is. The manager has no output because it has nothing to report, which is correct.
- Running now: p3 (Maps thread, since 22:47; the manager's estimate is 10 to 25 minutes) and p6 (Skills thread, since about 22:56).

### B36: Where did the p5 gap come from? 2026-11-12 22:59:04 CET

Rules touched: "Sub-agent delegation" (the manager merges sub-agents' returns), "Procedure" (flag interpretations).

Status: p3 is still "waiting on its own background work", now at 12 m 29 s (it was 9 m 24 s in B35, so it is still running).

The user asked the manager how it found the gap in p5 (B33: no scenario covers the owner-has-a-soultimate case). Answer: **it did not find it.** The p5 agent reported it in its last hand-back; the manager relayed it as a question and did not check it. It has not read the scenario or the code, so "only the code change covers the owner rule" is the agent's claim.

Observations:
- **O137: correcting the attribution.** In B33 I wrote that the manager "volunteered" the gap, and in O128 that it "flagged a weakness unprompted". The credit belongs to the p5 agent: the manager passed it on. The sub-agent's honesty is the good behavior here (it reported a gap in its own proof), and the manager's honesty now about not having verified it is also good. O128 should read "the sub-agent reported a gap in its own work and the manager relayed it".
- **O138: unverified claims are passed up the chain without a mark.** In B33 the manager wrote "Only the code change covers that rule" as a plain statement. Only after the user's follow-up did it say this was the agent's claim. A relay rule would help: tag each item in a report as "verified by me" or "reported by the agent".
- **O139: the user's follow-up question works as an audit.** Asking "how did you find it?" surfaced where each claim came from, at the cost of one short turn. The same pattern worked in B31 and B32.
- **O140: p3 at 12 m 29 s** is inside the manager's 10 to 25 minute estimate.

## Proposed changes to the archive (AGENTS.md) and the app

Collected from the observations above. Each one names its evidence.

### P1: The manager makes each worktree runnable and conflict-free

Proposed by the user, 2026-11-12.

- **Now:** AGENTS.md "Worktrees" says to create one worktree per thread on its branch at the Plan's path, check disk space, and never put two threads in one directory. Everything needed to run the project inside it (env variables, service ports, compose project, `.env`) is left to each sub-agent.
- **Expected:** the manager creates the worktree **and** makes it safe to run next to the other worktrees: its own env variables, unique service ports and compose project name, with no overlap with any other active worktree and with the main checkout. It hands this to the sub-agent ready to use and records it in the brief.
- **Evidence:**
  - O29, B8/O17: the p1 agent edited and reverted `docker-compose.yml`, built an isolated Postgres on port 15433 and passed env variables by hand, because ports 80, 443 and 5432 were held by the main stack.
  - O81, O95, O98, O134: p5 struggled to start its own stack while p2 and p3 were running. The p2, p3 and p6 briefings gave no port plan, and p5's said only "see brief".
  - B9, B15: stack setup was part of the p1 overrun (cold worktree, new `.env`, containers, build).
- **Suggested wording for AGENTS.md ("Worktrees"):** "After creating a worktree, make it runnable on its own: give it its own env file or variables, a unique compose project name and unique service ports, and check that none of them are used by the main checkout or another worktree. Write them in the brief, one row per worktree (path, branch, ports, compose project). Sub-agents use these and never edit shared config files such as `docker-compose.yml`."
- **Caveat:** how a project is run is specific to the repository, so the archive can only state the rule and tell the manager to read the repo's own docs for the mechanism. Checking that a worktree starts (one smoke run) belongs to the manager, once, instead of each sub-agent finding out.
- **Measure in the next pass:** time and tokens each agent spends on getting a stack running, and the number of port or compose conflicts.

### B37: p3 (Lock restored maps to Wib Wob) done, manager report, 2026-11-12 23:04:57 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record", "Procedure" (flag interpretations).

Result:
- p3 committed as `2c19301e8` on `globuland-retro/maps`. Started 22:47:02, reported about 23:04: **about 17 minutes** (estimate 10 to 25 minutes). Token count not given.
- All 3672 stages on the 140 restored maps now require group 999998 "Wib Wob", set with `set_stage_group_restriction --map`. The YKW1 rule on the Ogralos maps (3007 to 3009) is overwritten and no stage uses 999999 any more.
- Proof: `stage_group_restriction` 284/284 (one stage per restored map, refuses an out-of-group deck with "Équipe non valide", accepts a Wib Wob deck, a stage outside the file is untouched), `prod_data` 37/37, `ci/check-*.py` clean except the old Libertynyan flag.
- The scenario was rewritten to use plain obtainable non-boss yokai from `Obtainable-Yokai.tsv`, because the old hard-coded outsiders are now all Wib Wob members. **No `--force` and no boss candidates remain**, as the user asked in B32.
- Interpretation, unverified: the 140 maps are exactly the mapType 4 maps from commit `42035571a`.
- Open question from the manager: 11 yokai that appear as enemies or bosses on the restored maps are not in group 999998 (Blizzaria, Kyubi, Venoct, Boyclops, Lady Longnek, Pallysol, Maginyan, Sir Nyansalot, Libertynyan, Smashibull, Dromp). Add them to the group so players can field them? The agent left the group unchanged.

User answer: bosses are not recruitable, so the group does not need them. (Read as "no, do not add them". The message did not say "approved".)

Observations:
- **O141: the "bosses" confusion is resolved and the question is now correct.** The manager states that "the lock checks the player's deck, not the enemies", which matches the correction in B32 (O119). Its question is the right one: can a player field these yokai? The user's answer settles it with a rule: bosses are not recruitable.
- **O142: O97 resolved by a stated interpretation.** The agent took "restored maps" to mean all 140 mapType 4 maps, including the 97 legacy scramble maps from p2, and said so. Locking legacy maps is harmless but uses no value. Worth knowing for p4, which builds blueprint missions on top of "map 3 bosses".
- **O143: the user's correction in B32 held.** No `--force`, no boss candidates, and the scenario got better, not worse: it now derives outsiders from the obtainable list instead of hard-coded ids, so it does not break the next time a yokai joins the group.
- **O144: the cost rule worked here.** 3672 stages changed with one helper call per map set, with only the own scenario and `prod_data`: about 17 minutes. The manager's estimate window was met, unlike p1.
- **O145: p3 and p7 may touch the same yokai.** Libertynyan is in the list of 11, and p7 (Wib Wob 2nd Skills) buffs "Libertynyan S". These are probably different rows (boss versus befriendable), but the user's rule "bosses are not recruitable" depends on that. Check at p7 whether any yokai of p7's list is among the 11.
- **O146: approval is still implicit.** The user answered the question but did not write "approved". The manager treated "all your checks pass" as approval in B23 (O77). Watch whether it waits this time.

### B38: p3 approved, p4 started, 2026-11-12 23:07:49 CET

Rules touched: "Pauses", "Sub-agent delegation", Rule 2 (p4 builds on p3), "Procedure" (stop on ambiguity).

The user wrote "approved". The manager started p4 (Pocket parts in Wib Wob maps) in the `maps` worktree, on the same branch after p1, p2 and p3. Planned commit: "Maps: Yo-kai watch Pocket parts in Wib Wob Maps". The user also pasted the manager's visible reasoning, which was duplicated and cut off mid-sentence, then its briefing to the agent and its summary to the user.

What the manager decided:
- **The 11-yokai question counts as unanswered.** It told the agent to leave group 999998 unchanged, and to stop and ask if the scenario or prompt needs a boss-only yokai (Blizzaria, Kyubi, ...) in the player's deck.
- Hololive source map: the only Hololive map in `maps_to_add_login.txt` (the user's decision from B4).
- Images: from the untracked images in the main checkout (`Yo-kai_Watch_Pocket_HQ.png`, `3DS - Yo-kai Watch - User Interface - Items.png`), copied not moved, registered in `20261112` at 158x158 for item icons.
- Ids by `show` and `find_stage`; stop and return a question if an id, name or language truly cannot be resolved. No `--force`. Cost rule, isolated ports.

User's comment on p4: it is a bit difficult, since it needs new images, items and missions. Everything is covered by scripts or documentation **except the png creation**, which is "purely on Claude".

Observations:
- **O147: the user's answer on the 11 yokai never reached the manager.** In B37 the user told me "bosses are non-recruitable so we don't care". The user then sent only "approved" to the manager, so the manager says "you haven't answered". Its default (leave the group unchanged) matches what the user wants, but the agent now carries a stop condition that is moot: a player cannot field a boss that is not recruitable, so the scenario can never need one in the deck. My own part: in B37 I logged the answer as meant for the manager and did not say it still had to be sent. The user can send it to remove the stop condition.
- **O148: the manager's visible reasoning was pasted by the user.** It is duplicated and cut off. This is a display issue, not a process one, but the reasoning shows what the manager considered (whether the 11-yokai question blocks p4) and could be useful for audits.
- **O149: the image step is the unscripted part.** The briefing gives sprite sheets and a headquarters image, and says to use "existing helpers" for registration. Cropping or composing new icons from those sheets has no helper, so the agent will do it ad hoc. This matches the user's comment. It is the likeliest place for token cost on p4 (compare the ~11k tokens the user quoted for converting and registering one image, B9). Suggest, for the repo, a small image helper (crop, resize to 158x158, key out the background) that agents reuse. Measure how much of p4's cost goes to images.
- **O150: p4 still has gaps from B3 and B4:** blueprint item name and description, part ids, mission title language, "normal tab" mechanism. The briefing says to resolve them from the repo and to stop if they cannot be. Watch how many questions come back, and whether the agent invents names.
- **O151: "approved" was explicit this time.** The manager waited for it (O146 resolved), unlike B23.
- p4 is estimated by the manager at 40 to 90 minutes and 150 to 300k tokens (B25), with p6 running in parallel since about 22:56.

### B39: p6 (YKW1 Variant Custom Skills) done, and a suggested reply sent as a test (first logged as a mistake, see B42), 2026-11-12 23:09:17 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record", "Procedure" (flag interpretations), "Scripts" (helpers).

**Reply sent by the user to the manager: `Add the 11 boss yokai to group 999998`.** The Claude Code CLI offered it as a suggested reply and the user pressed tab and sent it. It contradicts the user's own words in B37 ("bosses are not recruitable, so we don't care about the bosses not being in the group"). If the manager acts on it, group 999998 grows from 457 to 468 yokai after p3 has locked 3672 stages to it, and the p4 agent was just told to leave the group unchanged (B38). Not yet known: whether the manager has done anything. The user should correct it now if it was not meant.

p6 result:
- Committed as `209a65ca1` on `globuland-retro/maps-skills`. Paused for approval before p7. Started about 22:56, reported at the time above.
- Item 28003 "Techniques tip-top" (type 21, tradable), icon 158x158 registered in `4.76/20261112`, copied not moved, duplicate check passed.
- 12 base YKW1 yokai each got one passive, level 1/1, gated by item 28003 with flag 1. None had a passive before, so it is their only skill row (EffectIdx 1). Types: Damona AllGroupBoost; Cho-cho and Vitapillon GroupBoost; Éterna and Morféa group-3 unity (type 50); Dynamo, Tata Câlin and Oronyan YKW1 unity (type 50); Scarnage, Barakabo, Octorgombre and Dente SingleTribeBoost (tribes 1, 2, 8, 6).
- Proof: `ykw1_skill_book` 12/12 (locked skill adds nothing; after `useItem` Scarnage +35% ATK, Cho-cho +20% ATK with 4 YKW1 allies, Damona +20% HP; Okayu refused; unlock survives a fresh login), `prod_data` 37/37, `ci/check-*.py` clean except the old Libertynyan warning.
- Also: group names 999999 "YKW1" and 999998 "WibWob" added to `passive_skill_presets.json`; level texts passed with `--text` because `set_skill_wording` skips unlock rows.
- Interpretations, unverified: "single X" means no other X on the team; "ykw1 allies" means group 999999. To check on a device: the client draws a gated skill at EffectIdx 1 (Pekora's gated skill is at idx 2); if it needs a "Non su." box, the fix is to move these skills to idx 2 with a placeholder at idx 1.
- Left running: the `maps-skills` Postgres (port 5434) and puniemu containers. It used an override file and never edited `docker-compose.yml`. The manager has not stopped them.
- Open question: should the book be obtainable? The prompt says not to worry, so it stays unobtainable.
- Manager says p7 is blocked on a skill value progression it never received.

Observations:
- **O152: a suggested reply contradicted the user.** The CLI's suggested next message is derived from the conversation and can read as a decision. It was sent by a keystroke and states the opposite of B37. In a multi-agent session, where a reply to the manager can trigger changes in shared data, accepting a suggestion should be a deliberate act. This is a tooling finding for Claude Code, not for the archive.
- **O153: "reported at the time above" beats the estimate again.** p6 took about 14 minutes (22:55 to 23:09 by my log times) against the manager's 30 to 60 minutes and 100 to 200k tokens. The token count is not given. That is the third prompt under its estimate.
- **O154: the p7 block may be a misreading.** p7's prompt lists the level values in braces for every SS-rank yokai (for example Orquanos M {10,11,12,13,15}, Libertynyan S {5,6,7,8,10}), and says S ranks are single-level. The "I will give you the skill values progression" line sits in front of them. The manager has not read the prompts (B25) and treats the sentence as a missing input. Ask whether anything is missing besides the numbers already in the prompt before the user spends effort.
- **O155: leftover containers are the cleanup side of P1.** A per-worktree plan (ports 15433 for `maps`, 5434 for `maps-skills`, an override file, no edit of `docker-compose.yml`) is a real improvement over p1 (O29). Teardown is not covered: nobody owns stopping the stacks. Add "stop each worktree's stack when its agent finishes" to P1.
- **O156: a good, specific device checklist** (idx 1 against idx 2, with the fix stated). The agent knows what it could not test.
- **O157: the report table is the clearest form of a result so far.**

Addition to P1: teardown. When a sub-agent finishes, the manager stops that worktree's stack (containers and its Postgres), so leftovers like the `maps-skills` stack on port 5434 do not pile up (B39, O155).

### B40: The manager acted on the suggested reply, 2026-11-12 23:09:35 CET

Rules touched: "Procedure" (do what each prompt asks, nothing more), "Git branches" (one commit per prompt, never rebase), "Pauses", rule 4 (each prompt is standalone).

The manager took the reply from B39 (`Add the 11 boss yokai to group 999998`) as a real decision. It sent it to the **p4 agent**, which will add Blizzaria, Kyubi, Venoct, Boyclops, Lady Longnek, Pallysol, Maginyan, Sir Nyansalot, Libertynyan, Smashibull and Dromp to group 999998 with the `add_youkai_group` helper, then run `stage_group_restriction` and `prod_data`. Because this is a follow-up to p3, whose commit already sits under p4's work, and the archive says never to rebase, it goes in as **its own commit**, "Maps: Wib Wob group: add 11 boss yokai", before p4's single commit. The manager notes that this is one extra commit beyond "one per prompt" and asks whether to fold it into p4's commit. It also repeats that p6 waits for the user's "approved" and that p7 waits for the skill value progression.

Observations:
- **O158: the suggested reply is now work in progress (a deliberate test by the user, see B42; first logged as a mistake).** The user's own statement in B37 was that bosses need not be in the group. The suggested reply sent in B39 reversed it, the manager relayed it, and the p4 agent is changing group 999998 and rerunning tests. The cost so far is small, but each round adds scope to p4. Reversing it later means another commit or a revert on top of work that p4 is building on.
- **O159: the p4 agent now does a p3 follow-up inside p4's run.** This breaks "one prompt per agent". The manager chose it to avoid a rebase. A cleaner route would be a separate short task for a fresh agent, with its own commit, run before p4 starts. The manager did not have that option because p4 was already running.
- **O160: the manager asked, not assumed.** It stated the commit-count deviation and gave the user the choice between a separate commit and folding it into p4. That is the right behavior. Its default (separate commit) keeps the history honest.
- **O161: the manager did not question a decision that contradicts an earlier one.** It had been told in B37 (via the user's message to me, not to the manager) that bosses are not recruitable, but it never saw that. It could not have caught the contradiction. This reinforces O147: a decision the user states to one party is lost to the other.

### B41: Routing a p3 follow-up to the p4 agent, 2026-11-12 23:12:25 CET

Rules touched: "Worktrees" (never two threads in one directory), "Git branches" (one commit per prompt, never rebase), "Sub-agent delegation" (one agent per prompt, briefing self-contained).

The manager's message to the p4 agent (shown by the user): add the 11 boss-only yokai to group 999998 **first**, before the rest of p4, with `add_youkai_group` (check `--help` and `docs/game-logic/stage-group-restriction.md`, resolve ids with `show`), run `stage_group_restriction` and `prod_data`, update docs and changelog, make it its own commit "Maps: Wib Wob group: add 11 boss yokai", record it under p3's notes, then continue p4 with its own single commit and return both commits.

The user's question: is sending this to an agent working on watch parts a miss that wastes tokens, and are the manager's reasons understood?

Assessment (inferred, the manager did not state its reasons beyond "never rebase"):
- **Likely reasons:** the `maps` worktree and branch hold p3 and p4 together, and AGENTS.md says never two agents in one directory, so a fresh agent cannot work there while p4 has uncommitted changes. p3's commit cannot be amended under p4's work (no rebase). The p4 agent already holds the group context: its briefing named `stage-group-restriction.md` and group 999998, and its scenarios run on maps locked to that group.
- **Why it is less wasteful than it looks:** the reading overhead is small, because the doc is already in the p4 agent's context and the helper needs one `--help`. The expensive part is the test runs, which p4 needs anyway.
- **Why the user's concern is still right in principle (O159):** a prompt-sized task is mixed into another prompt's run, the p4 return and commit history get a second purpose, and every later tool call of that agent carries the larger context.
- **The largest waste is the task itself (O158):** it reverses the user's own statement in B37 and came from a suggested reply (O152). If the decision was not meant, cancelling it saves more than any routing choice.

Observations:
- **O162: the alternative was a manager-side fix or a pre-p4 task.** Before p4 started, the same change would have been a one-call task for a fresh agent with its own commit. After p4 started, the choice was this routing or waiting for p4's commit. A manager rule would help: "when the user changes a decision for an earlier prompt, apply it to that prompt's branch state in a separate short task, not inside a running agent".
- To measure: p4's final tokens and time against the manager's estimate (40 to 90 minutes, 150 to 300k), and what the follow-up added.

### B42: Correction, and the manager explains its routing, 2026-11-12 23:17:18 CET

**Correction to B39, B40 and B41.** I logged the reply `Add the 11 boss yokai to group 999998` as a mistaken keystroke. It was not. The user never told the manager or an agent about adding the bosses to the group, and followed the Claude Code CLI's suggested reply deliberately **to see how the manager would react**. Findings that treated it as a mistake (O152, the wording of O158, the "cancel it" advice) are superseded: the cost of the decision is a test cost, and the user's own position (bosses need not be in the group) still stands.

The user asked the manager why it sent the task to the p4 agent. The manager answered:
- Reason 1: the `maps` worktree is shared by p3 and p4. The p3 agent had finished, and resuming it while p4 ran would put two agents on the same branch. The group change also touches `stage_group_restriction.py`, which p4 might change.
- Reason 2: p3's commit is under p4's work and nothing is rebased, so it used a separate follow-up commit and gave it to the agent already in the tree. It says this second reason "was weaker than I made it sound".
- It admits it did not weigh the alternative enough. p4 does not depend on the group change (it was told to stop and ask if it needs a boss-only yokai), so it could have waited until p4 committed and then resumed the p3 agent, which already holds the group's context.
- It offers to retract: tell the p4 agent to drop the task, then resume the p3 agent after p4 is committed.

The user's figures: **each agent used about 50k tokens right after dispatch**, and the added task cost about **20k tokens** when it was sent.

Observations:
- **O163: by the user's numbers the routing was cheaper than it looked.** 20k for the follow-up against about 50k just to start another agent. The manager's claim that the p3 agent would have done it "more cheaply than a fresh read" is not measured: a resumed agent also re-sends its whole context on each call. The earlier concern in B41 (O159) about token waste is overstated. What remains is scope mixing and commit order, not tokens.
- **O164: about 50k tokens of startup per agent is the largest fixed cost seen so far.** It is the brief, AGENTS.md, the prompt, the docs it names and the first orientation. At one new agent per prompt it adds about 500k over eleven prompts, a third of the manager's total estimate (0.9 to 1.7M, B25). The low end of the manager's estimates (for example 40 to 80k for p2) is close to startup alone. AGENTS.md says "typically one per thread", but the manager has started a new agent for each prompt, except for amends, where it resumed the same one (the p5 amend took 3 m 32 s). Test in the next pass: resume the thread's agent for its next prompt and compare startup cost with growing context.
- **O165: the manager's answer is honest about its own weaker reason and offers to undo.** It did not defend the choice and it separated the facts (shared worktree, no rebase) from its judgment. It asks the user and does not retract on its own.
- **O166: the test shows how a user's reply is trusted.** The manager relayed the message as "User decision" in its briefing to the agent, without asking whether the user was sure, even though the p3 answer a few minutes earlier (not seen by the manager) went the other way. It could not have known. What it did know: the question had been open and the reply came as a plain statement, so acting was reasonable. The stated cost is small, because it is a separate commit.

Suggested handling of the offer (user's choice): the group change is its own commit, so it can be dropped when the user stops, by not merging or reverting that commit. Retracting now costs another round of messages and the p4 agent switching tasks again, which is likely to cost more than the 20k already spent.

### B43: p6 approved, pending items, 2026-11-12 23:24:30 CET

Rules touched: "Pauses", Rule 2 (p7 builds on p6), "Procedure" (stop on a missing input), P1.

The manager, after the user's decision to keep the boss-yokai task in p4's run (B42), listed what waits on the user: p6 approval (commit `209a65ca1`), the p7 "skill value progression", the device check (gated skill at EffectIdx 1) and whether the skill book should be obtainable. It will report when p4 finishes.

The user answered:
- p6: **approved**.
- p7 progression: "Which prompt 7 skill progression? I don't see it in recent history."
- Device check: "how can I run the server without blocking an agent?"
- Skill book: out of scope for the implementation agent, it will be added in the login prompt.

Observations:
- **O167: the p7 "missing input" is not missing; the manager never read it.** p7's prompt says "I will give you the skill values progression", but it then lists the level values in braces for every SS-rank yokai: Orquanos M ATK {10,11,12,13,15}%, Libertynyan S stats {5,6,7,8,10}%, Domniscian 2.0 stats {5,6,7,8,10}%, Creme Chantiwhisp M ATK {5,6,7,8,10}%, Komasan de Noël HP&ATK {5,6,7,8,10}%, Chocolina stats {5,6,7,8,10}%. The S-ranks are single-level (Gargaros +5% stats, Ogralos +10% ATK per ally, Orquanos +5% HP&ATK per ally, Oranyan M +10% HP&ATK). The user cannot find the progression because there is no separate one: the numbers are in the prompt. The manager has repeated "blocked" in B25, B33, B39, B42 and B43 (five times) without checking, because it only read the pre-flight reports (B25). This is the cost of a manager that does not read the prompts. What is actually undefined is "the new standards" for rewording the skill text. The right move: the manager points the p7 agent at the braces and tells it to ask only about wording.
- **O168: the device test conflicts with agent stacks.** The user wants to run the server from a worktree for a device check while agents keep working. The agents use isolated ports (15433 for `maps`, 5434 for `maps-skills`), and the main stack holds 80, 443 and 5432 (B15). The leftover `maps-skills` stack from p6 (B39) sits where p7 will start. There is no reserved slot for the user. This is P1: add a **user test slot** (a worktree or checkout at a chosen commit, with its own ports and compose project, and the command to start it), so a human check never competes with an agent.
- **O169: the skill book is already obtainable through p10.** The p10 gacha pools list "Techniques tip-top" (2%, 5%, 10%) and "Orbe nostalgique". Together with p11 (login stamps handing out the coins) the book becomes obtainable. The user's answer is consistent. The p11 prompt itself lists only coins, so "added in the login prompt" is the user's intent, not something the archive says.
- **O170: pending items were well presented** (four short bullets, each with what is needed from the user). Compare B21 and B26.

Addition to P1: a **user test slot**. The manager reserves one worktree or checkout, with its own ports and compose project, for the user's device checks, and tells the user the command to start it, so human testing never blocks or collides with an agent (B43, O168).

### B44: p7 started, device-check advice, 2026-11-12 23:25:33 CET

Rules touched: "Pauses", Rule 2 (p7 builds on p6), "Worktrees" (never two threads in one directory), "Sub-agent delegation", P1.

The manager started p7 (Wib Wob 2nd Skills) in the `maps-skills` worktree, planned commit "Skills: Wib Wob 2nd Skills". p4 is still running on the `maps` worktree.

The manager's answers to the user:
- **p7 progression:** it is in the prompt. The braces are the level 1 to 5 values for SS yokai, S ranks are single level. The pre-flight agent called it "not supplied" and the manager passed that on without reading the prompt. "I was wrong to tell you it was blocked." (This closes O167.)
- **Skill book:** out of scope here, to be added in the login-stamp prompt. It will note this for p11.
- **Device check, "my reading of what the agents reported", not tested:** the agents use separate ports and compose projects, so the standard ports are the user's. Run `just reset` from the worktree to test (`maps-skills` for skills, `maps` for maps). The compose project name probably comes from the directory name, so the worktree gets its own database. Run `./Database/scripts/set_dev_account user` again there. Stop the main-checkout stack first (`just rm`) to avoid fighting over 80, 443 and 5432. The worktree needs a `.env`; one was copied into `maps-skills` and the maps agent copied one too.

The p7 briefing (shown by the user) is the most complete so far. It states that the progression is in the prompt, gives the yokai ids to verify with `show` (Gargaros 2360000, Ogralos 2361000, Orqanos 2362000, Orqanos M 9000154, Oranyan M 9000152, Libertynyan S 9000134, Domniscian 2.0 1441010, Crème Chantiwhisp M 9000161, Chocolina 9000094 SS row, Komasan de Noël as the befriendable non-boss yokai of the Christmas scramble hidden stage), the orb details (real line break, accent on "compétence"), the unlock mechanism (item type 21, flag 1 unlocks skill 2, gate skill 1 if possible), no `--force`, and **"stop your own containers when done"**.

Observations:
- **O171: the device-check advice does not answer "without blocking an agent".** It tells the user to run `just reset` from the worktree being tested, including `maps-skills`, where p7 is running now, and `maps`, where p4 is running. That puts the user and an agent in the same directory, with a compose project name that likely comes from the directory. That conflicts with "never two threads in one directory" and may reset or collide with the agent's database. The risk is the manager's own assumption ("probably"), untested. The fix is P1's user test slot: a separate worktree at a chosen commit with its own ports.
- **O172: the port claims do not match earlier evidence.** The manager says the p1 and p5 agents used 8085/8445 for traefik and 5434 for Postgres. The p1 report (B10) says its Postgres was on port 15433, and my process check showed `PUNIEMU_DB_PORT=15433`. The 5434 stack was p6's (B39). The advice rests on a mixed-up recollection. Both numbers are from relayed reports, not from the manager's own check.
- **O173: P1's teardown rule is now in a briefing.** "Stop your own containers when done" is a response to p6's leftovers (O155). The lesson went into the briefing, not the brief (O127, O131).
- **O174: the same text corruption appears again in a long briefing.** The p7 briefing shows a sentence cut at "if the mechanism allows:" and the same fragment repeated ("wording presets used by the previous prompts ... If something truly blocks you, stop and return it as a question." twice). The same pattern was seen in B7, B16 and B27. It may come from pasting, but it recurs only in long briefings. If the manager's text really is corrupted, the agent receives a broken instruction. The user should check the original once. A structural fix: the manager writes each briefing to a file in the git directory and sends the path (the pattern the archive already prescribes for the brief).
- **O175: the admission on the progression is complete and brief.** It says what was wrong, why, and that the user need not send anything.

### P2: A "Before you start" tips section on the Roadmap page, with a copy-paste prompt

Proposed by the user, 2026-11-12.

- **Idea:** add an info/tips section to the Roadmap page that helps the user prepare the repository before a full project implementation. The first tip is to **prepare the worktrees** for the coming agents. The app gives the user a well-thought prompt to copy-paste into their own AI assistant, so the repo is set up before the roadmap session. Setting up a worktree means, for example, preparing its `.env`; for a web app it means making sure several agents and the user can run the stack in parallel without blocking each other.
- **Relation to P1:** P1 asks the manager to make each worktree runnable and conflict-free during the session. P2 moves that work before the session and onto the user's own assistant, which knows the repo. They complement each other: with P2 done, the manager's P1 duty shrinks to checking that the prepared slots exist and recording them in the brief.
- **Evidence:** the p1 agent built an isolated stack by hand, edited and reverted `docker-compose.yml` and set env variables manually (B8, O17, O29); p5 struggled to start its stack while others ran (O81, O95); briefings had no port plan (O98, O134); leftover containers (O155); advice to run `just reset` inside a busy worktree (O171); cold worktree setup in the p1 overrun (B9, B15); the untracked images living only in the main checkout (B5).
- **A design constraint to handle:** a child thread's branch is cut from the commit that completes its parent prompt (AGENTS.md, Rule 2 and "Git branches"). So its git worktree cannot exist before that prompt is done. What the user can prepare in advance is the **environment slots**: for each worktree the plan needs (4 in this project), a `.env` template, a unique set of ports, a compose project name and a database name. The manager attaches a slot to a worktree when it creates it. Root-thread worktrees can be created straight away.
- **Where it could live:** a collapsible "Before you start" panel on the Roadmap page, filled with project facts the app already knows: number of threads and worktrees, branch names and worktree paths from the Plan, the base branch. A copy button for the prompt, and a short list of further tips.

Draft of the prompt (placeholders in angle brackets are filled by the app from the roadmap):

```
I am about to run a roadmap with <N> parallel worktrees on this repository, using several AI agents plus me testing by hand. Prepare the repository so that nothing collides. Do not implement anything from the roadmap itself.

1. Read this repository's own docs (README, AGENTS.md or similar, docs on running and testing) and tell me how the project is started and tested: services, ports, database, env files, compose project names.
2. Create the worktrees for the root threads now, at <worktree path pattern>, on the branches <branch list>, from <base branch>. Do not create worktrees for threads that branch from a later commit; only prepare their environment slot.
3. For each of <N> slots plus one extra slot reserved for me: give it its own env file (copied from the main one, never edited in place), a unique port for every service, a unique compose project name and a unique database name. Use an override file or env variables, never edit shared config files such as docker-compose.yml.
4. Copy into each worktree any untracked files the work will need and that git does not carry (for example images or data dumps in <asset folders>). Copy, never move.
5. Check it works: start each slot's stack one at a time, run the repository's quickest smoke check, then stop it. Then start two slots at once to prove they do not collide. Leave everything stopped.
6. Write a table (slot, worktree path, branch, ports, compose project, database, start command, stop command) to <file in the git directory, for example the output of `git rev-parse --git-common-dir`>/worktree-slots.md. Do not commit it.
7. Check free disk space against <N> times the working tree size and tell me if it is short.
8. Report what you did, what you could not verify, and the exact commands I use to start my own slot.
```

Further tips for the same section (each from the observations above):
- Tell the agent where the repo's helper scripts are documented, and say to extend a helper before writing a new script (B15, O43, O44).
- Say which scenarios or test suites make up the quick check and the full regression, and who runs the full one (O46, O68).
- Pre-approve the scripts in `scripts/shared/` or decide up front (B1).
- Decide on a cost cap or a stop rule such as "stop and report after 3 failed proof runs" (O22).
- Put the user's own decisions in one file before the session (a list of known answers), so the first question round is shorter (O1, O2).
- Note the expected startup cost of about 50k tokens per agent (B42, O164) and the estimate table, so the user sees the fixed cost.

Open points for the design: whether the prompt may name the repo's own tools (it cannot know them; the assistant must discover them), how to keep the prompt short enough to paste, and whether the tips should be per project type (web app, CLI, library) or one generic list.

### B45: p4 (Pocket parts in Wib Wob maps) done, manager report, 2026-11-12 23:31:01 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record", "Procedure" (flag interpretations), rule 4.

Correction: the p6 duration in the table and in B39 said 17 minutes from a wrong end time. It is **about 14 minutes** (22:55 to 23:09).

Result:
- Two commits on `globuland-retro/maps`: `fa8771f02` "Maps: Wib Wob group: add 11 boss yokai" (the follow-up to p3 from the user's test, B42) and `b4b83cfba` "Maps: Yo-kai watch Pocket parts in Wib Wob Maps" (p4). Started 23:07:49 (B38), reported at the time above: **about 23 minutes** including the follow-up (estimate 40 to 90 minutes, 150 to 300k tokens). Token count not given.
- Follow-up: group 999998 now has 468 yokai. Eleven boss ids were added (Blizzaria 4133000 ... Dromp 4148000). The normal Blizzaria 2133000 was already a member.
- p4: blueprint item 160028 (tradable, icon from `Yo-kai_Watch_Pocket_HQ.png` at 158x158) opens parts map 5128, a copy of the Hololive room 5127 with the Jibanyan drop table replaced by the Pocket watch parts. 24 independent "[Nostalgie] Vaincre <boss>" missions (330001 to 330024) give 2 blueprints each.
- Proof (both of the prompt's scenarios): `pocket_watch_blueprint` 106/106: with no parts the watch is refused, the boss stage is refused without a blueprint, 22 boss battles each consume one blueprint and drop a part, the parts match the recipe (1/1/5/5/10), the watch builds and shows unlocked after a fresh login. A new account clears all 24 boss stages, claims all missions and holds 48 blueprints after a fresh login. `prod_data` 37/37, `stage_group_restriction` 285/285 (a new check for the 11 bosses), `ci/check-*.py` only old warnings.
- Scope: "slightly" changed (the follow-up is its own commit; p4 used a map-and-missions approach plus a one-line trade allowlist change in `TradeManager.cs`).
- Pitfalls reported: no mission type means "clear stage X", so type 10103 with params [stageId, 9999] was used, the same pattern as mission 118094; blueprint id 160028, map 5128 and stages 5128001/2 are the agent's own picks; three Oni boss stages need 200 Oni Balls and the scenario grants the points; the agent accidentally dropped its own git stash while splitting the two commits, restored the files from backup copies and checked that nothing was lost.
- Four confirmations asked: (1) "Hinozall stage 38" is stage 3703015 (the data names that boss Domniscian, but the map is the Hinozall chain and client stage 38 matches); (2) "Octorgone" read as Venoct (stage 9502023), unverified; (3) Potofeu is the boss of the 4th map of its chain (stage 9808017, client stage 64), not the 3rd; (4) is the French wording of the titles fine?

Observations:
- **O176: 24 missions is the right number.** The pre-flight said "26 missions x 2" (B1). The prompt lists 10 boss maps and 7 scrambles of 2 bosses each, so 24. The agent counted from the prompt, not from the pre-flight claim.
- **O177: the seeded flaws in the mission list (stage 38, "Octorgone", "map 3 boss") were resolved with evidence and flagged, not stopped on.** All three were readable from the data (client stage numbers, the boss of that stage). The briefing said to stop only if truly unresolvable, which is the behavior seen. The price is a possible amend if the user disagrees, so the four questions matter.
- **O178: mixing the follow-up into p4 caused a near loss.** The agent had to split one working tree into two commits, used `git stash`, dropped its own stash by accident and recovered from backups. This is the cost of O159 in concrete form: no data lost, but a recovery that a separate task would have avoided. The agent disclosed it. It is good behavior, and a reminder that "restored from backup copies" is a claim the user may want checked (a diff of the two commits against the working files).
- **O179: both of the prompt's proofs are met in a single scenario**, in the exact terms asked (0 parts fails, 22 battles, build succeeds; a new player clears all stages, claims all missions, checks the blueprint count). The proof definition in the prompt worked as a contract.
- **O180: p4 came in at about half of its time estimate** despite being the "high difficulty" prompt, with the image step being the part the user expected to cost most (O149). Tokens are needed to say whether the image cost was high.
- **O181: the Maps thread is finished.** p1 to p4 took from 21:31 (p1 start) to about 23:30, with the user-driven rework on p1 and the follow-up on p4 included.

### B46: p4 approved, retrospective on the follow-up, 2026-11-12 23:36:19 CET

Rules touched: "Pauses", "Git branches" (one commit per prompt, never rebase), "Worktrees", "Sub-agent delegation".

The user wrote "Approved for prompt 4 once it's done", before reading the p4 report. The manager applied it to the report that arrived later and said it takes the approval as accepting the agent's readings of the four open points (Hinozall stage 38, Octorgone as Venoct, Potofeu's stage, the French titles), and that the user should say so if any is wrong. Status table from the manager: Maps 1 to 4 approved, Skills 5 and 6 approved, p7 running, gacha 8 to 10 waits for p7, login stamps 11 waits for p10.

The user asked whether the follow-up was a good idea and what the alternatives were. The manager's retrospective:
- Verdict: "acceptable, not good". It cannot say what it cost, because the agent reported one total for both pieces of work.
- Went right: the 11 yokai are in group 999998 (468 members) with a new check (285/285), as a clean separate commit `fa8771f02`; the agent did not need to stop in p4 over boss-only yokai.
- Went wrong: the stash incident (a mixed working tree made it possible), an overloaded agent with two jobs and a more complex git state, and an extra commit that splits p3's change across two commits.
- Alternatives: (1) wait, then resume the p3 agent, with context and a clean tree: "the better option"; (2) fold into p4's commit, simpler but it buries a p3 fix inside p4; (3) defer to a final cleanup commit, same split-commit result; (4) amend p3's commit, ruled out by "never rebase" and by p4's work on top.
- Future default: option 1, finishing the running prompt first.

My assessment (the user asked for it):
- The follow-up task came from the user's deliberate test (B42), so its value was in what it showed about the manager, not in the group change. Judged as routing only: **defensible, not best.**
- **In its favor:** by the user's numbers (B42) it cost about 20k tokens against about 50k to start another agent, and p4 still finished in about 23 minutes.
- **Against:** the near loss (stash), the git state that had to be untangled, a history in which p3's result lives in two places, and one total cost for two jobs, which hides the price of the follow-up.
- I agree with the manager's ranking. I would add a fifth alternative, **batch cross-prompt fixes** into one cleanup task at the end of a thread (one agent startup instead of one per fix), which suits changes that nothing depends on, as here. A sixth, the manager doing a one-helper-call change itself, is cheap in tokens only if its own context is small. After hours of messages it is not, so delegation is probably right.

Observations:
- **O182: the approval came before the report.** "Once it's done" meant "approved if it passes", but the manager reads it as accepting the four open points, which the user had not seen. The manager says so openly and invites a correction, which is the safe way. The user should say if any of the four was wrong.
- **O183: the archive has no home for a change to an earlier prompt.** "One commit per prompt" and "never rebase" leave no rule for it. The manager invented one under pressure, and its completion record instruction ("record it under prompt 3's notes") has no field for a second commit (the format has `commits[]` per prompt, which can hold it, but the rule is not written).
- **O184: the retrospective is the manager's second honest self-assessment** (after B42) and it ends with a new default for itself. A default of this kind belongs in the brief, so later agents and a resumed manager keep it.

### P3: A rule for changes to an earlier prompt

Evidence: B40 to B46 (the follow-up to p3 inside p4's run).

- **Now:** AGENTS.md says one commit per prompt and never rebase. It says nothing about what to do when the user changes a decision for a prompt that is already committed and has dependents.
- **Suggested wording:** "A change to an earlier prompt's result is made after the running prompt is committed, by an agent of that prompt's thread, in its own commit named `<thread name>: <prompt name> (follow-up)`. Never amend a committed prompt that other work builds on. Record the commit under that prompt's entry in the completion record (`commits[]`, with a line in `notes`). Cheap, independent fixes may be batched into one cleanup task at the end of the thread."
- **Why:** it avoids mixing two jobs in one working tree (the stash incident, O178), keeps each agent's report to one purpose (the single cost total hid the price, B46), and tells the manager what to do without inventing a rule.

**P3, app side (added at the user's request: follow-up prompts must be part of the improvement draft).** The rule above only covers the agent's behavior. The app should also model the case, because today the roadmap has no way to say "this changes a prompt that is already done":
- A **follow-up prompt** is a node attached to a completed prompt, shown on the Roadmap page under it (not as a new thread step), and exported in the archive as its own `Prompt.md` with `follow-up-of: <prompt id>` in the front matter and its own `id`.
- `Roadmap.mmd` and the Plan list it after its parent with a different edge style, and say it **does not block** later prompts unless the user marks it as blocking.
- AGENTS.md says when it runs (after the currently running prompt of that thread commits, by an agent of that thread, own commit `<thread>: <prompt> (follow-up)`).
- The completion record gets a place for it: either its own entry with `followUpOf`, or `commits[]` on the parent with a note. Prompter pastes `completion.json` back by `id`, so an own entry with its own `id` is simpler.
- Decisions the user changes during a session (like the ones that reached the manager as chat messages in B37 and B39) can then be written as follow-up prompts instead of being lost in a conversation, and show up in the export and the record.
- Open design points: can a follow-up have its own follow-ups; does its status roll up into its parent's; how the Roadmap page marks "completed, with follow-up pending".

### B47: p7 (Wib Wob 2nd Skills) done, answers, no approval yet, 2026-11-12 23:38:49 CET

Rules touched: "Pauses", Rule 2 (gacha builds on p7, so it waits for p7's final commit), "Git branches" (one commit per prompt), "Procedure" (flag interpretations).

Result:
- p7 committed as `1c64ddb3e` on `globuland-retro/maps-skills`. Started 23:25:33 (B44), reported at the time above: **about 13 minutes** (estimate 30 to 60 minutes, 100 to 180k tokens). Token count not given.
- Item 28004 "Orbe nostalgique" (type 21, tradable), icon `ywp_itemicon_wib_wob_orb.png` registered in `4.76/20261112`.
- The orb unlocks a gated Wib Wob skill on 10 yokai: Gargaros, Ogralos, Orqanos and Libertynyan S have no skill and get it as skill 1; Orqanos M, Oranyan M, Crème Chantiwhisp M, Komasan de Noël (9000085) and Chocolina (9000094) replace their "Non su." skill 2; Domniscian 2.0 already has two skills and gets the new one as skill 3 (flag 2).
- Types: group unity (type 50) for Gargaros, Libertynyan S, Domniscian 2.0, Chocolina; GroupBoost for Ogralos, Orqanos, Crème Chantiwhisp M; AllGroupBoost for Orqanos M and Komasan de Noël; a **new AnyGroupBoost 999999974** for Oranyan M.
- Scope change (minor): the new AnyGroupBoost type, and a `--gated` flag added to `set_skill_wording` so it can word item-gated skills.
- Proof: `wibwob_orb` 14/14 (skills locked at the start, orb accepted on 4 yokai, Ogralos +30% ATK with 3 Wib Wob allies, Oranyan M +10% HP/ATK with a Wib Wob ally and nothing without, Orqanos M +10% ATK with all allies Wib Wob, Domniscian flag and +5%, the unlock persists after a fresh login), `prod_data` 37/37, `ci/check-*.py` only the old Libertynyan warning. Other scenarios not run; the agent says `hololive_unlock_item` and `owner_boost_battle` cover the code it touched.
- Not reworded: skill 1 of Oranyan M, Crème Chantiwhisp M and Komasan de Noël (type 6 damage-reduction text). Unverified on a device: a gated skill 1 on a yokai with no skill (EffectIdx 1).
- Housekeeping: containers stopped, `docker-compose.yml` and `.env` restored; the `maps-skills_postgres_data` volume remains.

The manager's four questions, and the user's answers:
1. Libertynyan S is S rank (single level) but the prompt gives {5...10}; the agent used the first value, 5%. **User: "Only 5%".**
2. Oranyan M is SS but has a single value (10%); the agent applied 10% at all 5 levels. **User: {5, 6, 7, 8, 10}%.**
3. Domniscian 2.0 already has two skills; the agent put the new one in the free skill 3 slot. **User: tell the agent to be careful about the distinction between the skill 1 slot having 2 entries and the skill 2 slot.**
4. Reword the type 6 rows with `--proposed`? **User: yes.**
The user also wrote: **Not approved yet.**

Observations:
- **O185: correction to O167 and O154.** I wrote that there was no separate progression and nothing was missing. That holds for the six SS yokai whose braces are in the prompt, but not for **Oranyan M**: it is SS, its prompt line has a single value (10%), and the user's answer now **supplies its progression**, {5,6,7,8,10}%. So the prompt's "I will give you the skill values progression" was partly literal. The seeded flaw is real, the manager's "blocked" was still wrong for the rest (B44), and the agent handled the missing one by applying 10% to all levels and asking. Libertynyan S is the opposite case: braces given for an S rank (single level), and the user chose the single value 5%.
- **O186: answer 3 is a caution, not a decision.** The user does not say "replace" or "add". It points to a structure that the agent may have misread: skill slot 1 holding two entries, against skill slot 2. The manager must relay this faithfully and the agent must inspect how Domniscian's two skills are stored before choosing. Risk: the manager reduces it to a yes or no. Watch the relay and the agent's finding.
- **O187: "approved" withheld on purpose, so p7 will be amended.** As with p5 (B30), the answers change data, so the amend comes first and the gacha branch must be cut from the amended commit, not from `1c64ddb3e`. Watch that the manager holds p8.
- **O188: coverage claimed, not run.** "hololive_unlock_item and owner_boost_battle cover the code it touched" is the agent's reasoning, unchecked, with the narrow-test rule (O68, O103). Item and skill code that three prompts now share (unlock items 28003, 28004, the hololive item) is the place where a regression would hide.
- **O189: the agent extended tools, as the user wants** (`--gated` for `set_skill_wording`, a new mode type documented in the passive docs). It is the repo's convention (B15), and it reported the change as a scope change.
- **O190: the p7 questions are all real conflicts in the prompt** (S rank with a list, SS rank with one value, a yokai with two skills, unreworded rows), found by reading the data against the prompt. This is the best result so far of "flag, do not guess".

### B48: Relay of the p7 answers, and the token jump on resume, 2026-11-12 23:39:43 CET

Rules touched: "Sub-agent delegation" (resume the same agent), "Pauses", Rule 2, "Procedure" (flag interpretations).

The manager sent the four answers to the p7 agent, which will amend its single commit. p7 stays unapproved and the gacha thread waits. Relay details:
- Libertynyan S: 5% only. Oranyan M: levels {5, 6, 7, 8, 10}% HP&ATK, keeping the "ally present" rule. Type 6 rows (Oranyan M, Crème Chantiwhisp M, Komasan de Noël): reword with `--proposed`.
- **Domniscian 2.0:** the manager said it was not sure what the user meant by "the skill 1 slot having 2 entries", read it as a data-layout caution (marked unverified), and told the agent to check how Domniscian's rows are laid out (which slot holds what, whether skill 1 carries two entries), place the gated skill so it does not collide with or silently replace anything, report what each slot holds before and after, and ask the user if it is still ambiguous. It asks the user to say if they meant something different.

The user observed the p7 agent's token figure go from about 10k to about **140k** after the resume, and asked whether it re-read everything.

Observations:
- **O191: O186 was handled well.** The manager did not reduce a caution to a yes or no. It admitted it did not understand, chose a reading, labelled it unverified, and gave the agent a check and a report format.
- **O192: the 140k is probably mostly re-sent context, not new reading, but this cannot be settled from the outside.** An agent resumed after a full prompt carries its whole history (brief, AGENTS.md, prompt, docs, scenario output, tool results). A counter that restarts at the resume and then climbs can show the whole context as it is re-sent on each tool call (billed as cached input, cheaper than fresh input), plus the real new work: inspecting Domniscian's rows, three data changes, `--proposed` rewording, a rerun of the scenario, docs and changelog. The usage figure alone does not separate re-sent context, new reads and output.
- **How to tell:** the usage breakdown per category (fresh input, cached input, output) for the resume, and the list of files the agent read after the resume. Compare with the p5 amend, which took 3 m 32 s (B33; tokens not recorded). Ask the manager to have the agent report "tool calls made, files read, tokens by category" for amends.
- **O193: this is the resume cost the manager assumed was cheap (B42, O163).** The user's earlier figures were 50k for a new agent and 20k for the extra task. A resume that reaches 140k puts that comparison in doubt: resuming a long-lived agent can cost more than starting a new one, because the history is paid for on every call. Test in the next pass: the same small change done by a resumed agent and by a fresh one, with the usage breakdown.

### B49: p7 amended, awaiting approval, 2026-11-12 23:43:41 CET

Rules touched: "Pauses", Rule 2 (the gacha branch must start from the final p7 commit), "Git branches" (one commit per prompt).

Result:
- p7 amended to `92626110d` (was `1c64ddb3e`) with the four answers applied. The manager waits for approval before the gacha thread (p8 from this commit, in a new worktree).
- Libertynyan S: 5% at its single level. Oranyan M: +5/6/7/8/10% HP&ATK, applied once if at least one Wib Wob ally is present, level 1 text "+5%PV,ATK si présent". The type 6 damage-reduction rows (Oranyan M, Crème Chantiwhisp M, Komasan de Noël) now read "Garde contre les X: 10%".
- **Domniscian 2.0:** the agent followed `docs/game-logic/passive-text-layout.md`, where the skill 1 box holds every skill without an unlock item. Before and after: idx 1 "Unité des Sombres" (type 3) unchanged; idx 2 score-attack bonus (type 1007) same effect, reworded "Score Attack Boost: N%"; idx 3 "Non su." placeholder (item 99999999) replaced by the gated Wib Wob unity +5/6/7/8/10% HP&ATK with item 28004, flag 1. Nothing existing is overwritten. The other yokai are unchanged and consistent with the rule; each existing skill 1 box still fits in 4 lines (Domniscian's level 5 exactly 4).
- Proof: `wibwob_orb` 14/14 (now also checks Domniscian's flag and +5% HP/ATK, and Oranyan M's +5% at level 1 with and without a Wib Wob ally), `prod_data` 37/37. Only those two were run.
- Housekeeping: docs and changelog updated, containers removed, `docker-compose.yml` and `.env` restored. Unverified on a device: a gated skill at idx 1 (Gargaros, Ogralos, Orqanos, Libertynyan S), same check as for p6.

Observations:
- **O194: the user's caution was exactly right.** "The skill 1 slot having 2 entries" is the layout in the doc: box 1 holds idx 1 and idx 2, box 2 holds the unlocked one. The first attempt put the new skill in a free slot 3 with flag 2; the amend uses the existing box 2 placeholder with flag 1. The manager's reading ("a data-layout caution, unverified") and the instruction to report before and after is what made this work. A one-line hint from the user pointed the agent to the doc it had not used.
- **O195: the count did not change.** `wibwob_orb` was 14/14 before and is 14/14 after, although the manager says new checks were added. Either checks were replaced or merged, or the earlier run had them. The report does not say. Worth one question if the scenario matters.
- **O196: no token figure and no duration for the amend.** The user asked about the jump to 140k (B48). The report does not include the usage breakdown or the files read, which the manager was not asked to collect. The user's own reading of the harness is the only source.
- **O197: the gacha thread waits for the final hash**, as it should (O187). Once p7 is approved, `92626110d` is the commit p8 branches from.

### B50: Usage report of the manager session, 2026-11-12 23:45:28 CET

Source: `/usage` on the manager session, pasted by the user. The figures cover that session and its sub-agents, not this notes session. After p7 was amended and before p8, so seven of the eleven prompts are done.

| Item | Value |
|------|-------|
| Total cost | $12.11 |
| API time / wall time | 57 m 8 s / 2 h 32 m 29 s |
| `claude-haiku-5-5` | 268.3k input, 74.6k output, 2.6m cache read, 424.3k cache write, $0.1428 |
| `claude-sonnet-5-5` | 15.7k input, 255.6k output, 60.1m cache read, 1.3m cache write, $11.97 |
| Prompt cache (main) | 73 requests, 98% of input tokens from cache, no misses, warm (1 h TTL) |
| Account usage windows | session 33% used, week 9% used (0% at the start), Fable week 0% |
| Harness hints | start fresh when switching tasks (59%), cheaper model for general-purpose subagents (44%), trim `~/puniemu_prod_wsl/AGENTS.md` at 13k tokens per request (12%); general-purpose subagents are 37% of usage |

Sizes measured here: the archive's `AGENTS.md` is 10,695 bytes (about 2.7k tokens), the brief 5,856 bytes (about 1.5k tokens), the repository's own `AGENTS.md` 51,304 bytes (about 13k tokens, which matches the harness figure).

Observations:
- **O198: cost is almost all re-read context, not new tokens.** 60.1m cache-read tokens against 255.6k Sonnet output tokens. Each tool call re-sends the agent's whole history (cached, so cheap per token, but very many tokens). This agrees with B48 (O192, the jump to 140k on resume) and with the 88 tool calls of the first p1 run (B15). The cost driver is tool calls multiplied by context size, so fewer calls and a smaller standing context are the levers, more than shorter prompts.
- **O199: the repository's own `AGENTS.md` is the largest standing context, about five times the archive's.** It is loaded on every request of every agent working in that repo (about 13k tokens, 12% of the usage per the hint). The archive's `AGENTS.md` and the brief together are about 4k tokens, read once by each agent. For the receiving project: trim or split its `AGENTS.md`. For Prompter: keep the archive's file as small as it is, and do not add to it without cutting something.
- **O200: Haiku was used where AGENTS.md asked for the lightest model, Sonnet everywhere else.** The pre-flight readers ran on Haiku ($0.14 total, 268k input). Implementation agents ran on Sonnet, 98.8% of the cost. The harness suggests a cheaper model for general-purpose subagents. Routine prompts (p2 Clean Scrambles, p3 lock) might run on a cheaper model, while code-changing ones (p5, p7) likely need the stronger one. See P4.
- **O201: rough cost per prompt.** $12.11 over seven approved prompts, including the pre-flight, the manager's own turns and the rework, is about $1.7 per prompt. This is a rough figure (the session total is shared with the manager and rework), and it is a baseline for the next pass.
- **O202: the whole run so far used 9% of the weekly allowance** (from 0%) and 33% of the current session window, on Sonnet 5.5 at low effort. This includes any other sessions on the account, so it is an upper bound for this run.
- **O203: "start fresh" applies to the manager.** Its context has grown over 2.5 hours and 73 requests. The brief now holds thread state (see B51), which is what makes a fresh manager possible. A rule for AGENTS.md: "keep the state of the run in the brief (done, running, waiting, decisions) so a new manager session can continue from it".

### P4: Suggested model or effort per prompt

Evidence: B50 (O200), the manager's difficulty estimates (B25), the actual times (p2 7 min, p3 17, p5 15, p6 14, p7 13, p4 23, p1 55).

- **Now:** AGENTS.md says "use the lightest model that can do the job" and leaves the choice to the manager, which has not read the prompts (B25, O167). The user cannot set it.
- **Suggested:** the user marks a difficulty (or a model and an effort) on each prompt in the Roadmap page, or the app proposes one from the template and the number of items. The archive carries it in the front matter (`model-hint`, `effort-hint`) and AGENTS.md tells the manager to use it unless a prompt proves harder, in which case it says so.
- **Why:** the harness itself flags a cheaper model for sub-agents as the second biggest saving. The user knows which prompts are routine (data edits through helpers) and which touch code (new passive types, handler changes).
- **Caution:** a cheaper model may need more rework and more questions, which would cost more than it saves. Measure it on one routine prompt before recommending it.

### B51: p7 approved, gacha thread started with p8, 2026-11-12 23:45:40 CET

Rules touched: "Pauses", Rule 2 (a branch starts from the commit that completed its parent prompt), "Git branches", "Worktrees", "Shared context".

The user approved p7. The manager started the gacha thread: p8 (Oni crank-a-kai) in a **new worktree** `maps-skills-gacha` on branch `globuland-retro/maps-skills-gacha`, **cut from `92626110d`**, the amended p7 commit. Planned commit: "gacha: Oni crank-a-kai". It added the thread's state to the brief, including the note that the skill book 28003 is not obtainable yet and that p11 must add it. P9, p10 and p11 follow in order, each after approval.

The briefing to the p8 agent: the same template as before, with the known facts to verify cheaply (the only Oni crank in the repo is "Bingo-kai Oni", gacha 9130/9131, current SS rate 4%, a ten-pull already guarantees an S; next free coin item id 90059 and gacha id 11011; the coin description standard in `docs/process/decisions.md`; the trade allowlist in `TradeManager.cs`). The prompt's "1% items" are unnamed: resolve from the prompt or the repo and **stop and ask rather than guess** if unresolved. The scenario must cope with random draws. Isolated compose project and ports distinct from other stacks, stop own containers when done, revert any `docker-compose.yml` edit.

Observations:
- **O204: O187 and O197 resolved.** The gacha branch was cut from the final amended hash, after the user's approval, as the rule needs.
- **O205: the same corruption in a long briefing again.** The p8 briefing shows a fragment repeated ("ten-pull already guarantees an S, see Resources/Changelog/Gacha.md); next free coin item id 90059, next free gacha id 11011; coin item description standard in") and a cut sentence. This is the fifth long briefing with it (B7, B16, B27, B44, now this one), so it is systematic, probably at the paste or display step. See O174; the "briefing in a file" fix still applies.
- **O206: the manager now keeps run state in the brief**, which supports O203 (a fresh manager can continue).
- **O207: possible overlap on the skill book.** The manager says "p11 must add" the book 28003. The p10 gacha pools already list "Techniques tip-top" (2%, 5%, 10%), so the book becomes obtainable through p10's coins. The user said it would be added in the login prompt (B43). Whether p11 needs a separate addition, or the manager's note duplicates p10, is open. Check at p10 and p11.
- **O208: the worktree count.** Three of the four planned worktrees now exist (`maps`, `maps-skills`, `maps-skills-gacha`); the login-stamps one is last. Stacks per worktree remain the agents' business (P1).

### B52: p8 stopped on an under-specified prompt, user cancels it, 2026-11-12 23:46:58 CET

Rules touched: "Procedure" (stop on an ambiguous prompt), "Completion record" (`cancelled` only if the user said so; list every prompt), Rule 2 (a branch's next prompt starts once the one it builds on is done), "Pauses".

p8 (Oni crank-a-kai) result: the agent **stopped without editing or committing anything** and returned its findings through the manager (unverified by the manager):
- Target: the "Bingo-kai Oni" crank, gacha 9130 (1 pull) and 9131 (10 pulls), sharing one pool. Current weights SS 4%, S 11%, A 84% as buckets; SS 4 yokai, S 16, A 19, one item at 1% (Secrets de l'Âme, 20703). The ten-pull guaranteed S (`guaranteeMinRank` 6) already exists.
- Four questions with defaults offered: (1) "Items: 1% each": only the existing Secrets de l'Âme (B ranks then 28%) or more items? (2) the pool has no rank-4 bucket: take B-rank yokai from the Oni A roster? (3) "SS 5%": do the 4 SS yokai share 5%, or add a fifth? (4) apply to both 9130 and 9131, no new ids? Suggested defaults: option A, B-rank from the A roster, the 4 SS share 5%, both ids, no new ids.

The user's answer: **"Ah the prompt is empty, cancel it then but keep the prompt that depends on it."** The user added: "Let's see how it handles cancelation."

What to watch: whether the manager records p8 as `cancelled` (with no commit), keeps `roadmap.mmd` coherent (class `cancelled` on p8), starts p9 from the existing gacha branch (cut from `92626110d`, nothing from p8), and still pauses for approval.

Observations:
- **O209: the ideal stop, at a cost that was avoidable.** The agent did what the briefing said: it stopped before editing, gave precise findings and defaults, and offered a way out. But p8's weakness ("Items 1% each" names no items) was flagged in the first pre-flight (B1) and never answered (B4). A new worktree and a new agent (about 50k tokens of startup, B42) were spent to learn what the pre-flight already knew. A rule for AGENTS.md: "do not dispatch a prompt that still has a blocking question from the pre-flight; ask first, or mark it blocked".
- **O210: the archive has no rule for a cancelled prompt in the middle of a chain.** `cancelled` exists in the status list and in the completion format. Rule 2 says a dependent starts "once that prompt is done (finished and committed)", which a cancelled prompt never is. The roadmap here makes p9 build on p8 and p10 on p9. A rule is needed: when a prompt is cancelled, its dependents build on the last completed prompt of the thread (here p7's commit), unless they need its work, in which case the manager asks. See P5.
- **O211: "cancel it but keep the prompt that depends on it" is the user's decision, but it needs a place in the archive.** In the app the user could cancel p8 before exporting. Here the export already carried it. After the session, the completion JSON gives p8 status `cancelled` and Prompter updates the roadmap by `id`.

### P5: Cancelled prompts

Evidence: B52 (O209 to O211).

- **Now:** the status list and the completion format have `cancelled` ("only if I said so"), but no rule says how dependents behave, and the archive carries cancelled prompts as if they were live.
- **Suggested wording for AGENTS.md:** "If I cancel a prompt, record it as `cancelled` with no commit. Its dependents are not blocked: they build on the last completed prompt of the thread (or the branch start), unless they need work from the cancelled prompt, in which case ask me. Do not dispatch a prompt that has a blocking question from the pre-flight."
- **App side:** a cancelled prompt exported from the app could be marked in `Prompt.md` (`status: cancelled`), drawn differently on the roadmap and in `Roadmap.mmd`, and excluded from the Plan's list of prompts to run. The edge from it to the next prompt would be re-pointed to its parent.

### B53: p8 cancelled, p9 started and stopped, 2026-11-12 23:47:59 CET

Rules touched: "Procedure" (stop on a missing mechanism), "Completion record" (`cancelled`), Rule 2, P5.

How the manager handled the cancellation (B52):
- p8 is cancelled with nothing edited or committed. It will be recorded as `cancelled` in the completion file, with the note that the prompt was empty.
- It started **p9 (Nostalgia Gacha Coin) in the same `maps-skills-gacha` worktree** and told the agent that p8 does not exist and that it must not depend on it. This is what P5 suggests (build on the last completed prompt of the thread). Planned commit: "gacha: Nostalgia Gacha Coin". Coin ids 90059 and 11011, coin kept non-tradable. If the agent cannot settle the mechanism or the "Selection impossible !" reply from the repo, it stops and returns a question with its two best options.

Then p9's agent **stopped before writing anything**:
- Verified: choice cranks are yokai only (`ExecuteGachaHandler`, line 218, checks `RequestYoukaiId` against `ywp_mst_gacha_youkai_choice`); nothing in the repo or in `docs/game-logic/gacha*.md` selects an item. The refusal channel exists: `MsgBoxResponse(message, title)` is used by `EventPointTradeHandler` and `NuzlockManager.LockedResponse`, so the reply would be `new MsgBoxResponse("<name>\nest déjà dans votre\ninventaire !", "Sélection impossible !")`. "Already owns" would mean `ywp_user_item` count above 0. Not rechecked: that ids 90059 and 11011 are free.
- The decision for the user: **(A)** a choice crank for items (new item-roster table, `RequestYoukaiId` treated as an item id when the gacha is flagged; whether the client crank screen can show items is unverified and needs a one-row device test; it keeps the coin a real gacha coin) or **(B)** a trade-page route in the style of EventPointTrade (the coin is the currency, each warp item is a catalogue entry limited to one per account; needs no new client UI; the coin would no longer be a gacha). The manager leans to (B) because it is testable without guessing at the client, but says (A) matches the prompt's "gacha coin" better. If (A): may the agent add a column or table for the item roster?

Observations:
- **O212: O210 was handled as P5 suggests**, without a rule: the dependent starts on the existing branch and is told the parent does not exist.
- **O213: a second stop on a question the pre-flight already raised.** B1 and B3 asked "which endpoint sends 'Selection impossible !'" and noted that the choice-crank table is yokai only. The user left it unanswered (on purpose, for the test, B4). Two agents in a row (p8, p9) were started and stopped, each costing about 50k tokens of startup (B42) plus a worktree step. This strengthens the P5 rule: do not dispatch a prompt that has a blocking question from the pre-flight. In this test the price is the experiment's, not the process's.
- **O214: the id plan may collide.** The manager gave p9 ids 90059 and 11011. In B1 and B4 the same ids (90059 to 90061, gacha 11011 and up) were agreed for p10's three coins. p10 runs after p9, so its agent will check what is free, but the manager's brief should say that p9 took the first ones.
- **O215: "trade-page route" is ambiguous in the user's vocabulary.** The prompt says the coin "cannot be traded in the player trade web page", which is the player-to-player trade page. Option B uses an in-game exchange in the style of EventPointTrade, which is another thing. The user should not read B as touching the web trade page.
- **O216: the agent's report separates verified (code lines, existing refusal channel) from unverified (client screen, ids)**, and the manager gives a lean and states its limit ("I haven't read the client side"). This is the same quality as p4 and p7.
- To decide (user): A or B, and, if A, whether to allow a new table or column. A reasonable way to reduce risk is A with one test row first, falling back to B if the client cannot show items. This is a suggestion, not the user's decision.

### B54: Option A chosen for p9, briefing sent, 2026-11-12 23:48:42 CET

Rules touched: "Procedure" (flag interpretations), "Shared context", cost rule, P5.

The user's reply to the manager was the CLI's suggested reply, accepted with tab: "Go with A, add the roster table". It matches the recommendation in B53 (A first, with one device row).

The manager's message to the p9 agent (shown by the user): option (A), a choice crank; the agent may add the item-roster table and must keep `ywp_mst_gacha_youkai_choice` yokai only. Content: a new coin item (id from 90059, name 'Pièce Nostalgique', description per prompt with accents and a real line break, `nostalgia_coin.png` from the main checkout, copied, 158x158); a gacha (id from 11011) wired to the coin; the roster is the 19 warp items 91001 to 91019; an `ExecuteGachaHandler` change (item choice when the gacha is flagged); the refusal `MsgBoxResponse` with title 'Sélection impossible !' and body '<item name>\nest déjà dans votre\ninventaire !' when `ywp_user_item` count is above 0; the coin **not** in the `TradeManager` allowlist. Use existing helpers (`add_gacha_coin`, `set_gacha_pool`, `add_item`) and extend them for the roster instead of throwaway scripts. Docs, changelog and a scenario (unowned item: granted and coin spent; owned item: refused with that message and coin kept; the grant survives a fresh login; coin not tradable). Flag the client crank screen as unverified and list exactly what the user must test on the device (one row). Cost rule: own scenario plus `prod_data`. One commit "gacha: Nostalgia Gacha Coin" with the Co-Authored-By line; return the completion JSON plus at most five lines of questions.

Observations:
- **O217: shared handler changed, narrow tests again.** `ExecuteGachaHandler` serves every gacha, including the existing yokai choice cranks. The cost rule limits the run to the new scenario and `prod_data`, so the existing choice-crank scenario would not run. This is the same risk as O46, O68 and O103, now on a handler that other cranks depend on. The user may want the existing gacha scenarios added for this prompt.
- **O218: accents added by the manager.** The prompt writes "Piece Nostalgique" and "Piece de Bingo-kai", with no accents. The briefing says 'Pièce Nostalgique' and "description per prompt with accents". It is the repo's French and matches earlier practice (B10, p7), but it is stated, not flagged as a choice. Later prompts name the coin without accent ("Piece Nostalgique x1" in p11, "Piece P'tit Dejeuner" in p10), so agents must match names ignoring accents.
- **O219: the roster is the manager's reading** ("the 19 warp items 91001 to 91019"). It follows from the user's earlier remark that the warp items are in the maps thread (B4). It includes the eight scramble items and the four Oni orbs. If the user wanted fewer, it is a one-line change.
- **O220: the briefing is complete and testable.** Each requirement is paired with a scenario case, and the device check is defined up front. It is a better brief than the p3 and p4 ones (B27, B38) because the behavior is spelled out.

### B55: The p9 agent's first briefing and reply, in full, 2026-11-12 23:49:06 CET

The user pasted the original p9 briefing (before the decision in B54) and the agent's first reply (the stop in B53).

The briefing: the same template as before. Notable content: p8 is cancelled ("prompt was empty") and nothing of it exists; the worktree is "at the end of the skills thread, clean"; ids 90059 and 11011 "user OK'd" (verify cheaply); the coin description standard is in `docs/process/decisions.md`; `nostalgia_coin.png` is in the main checkout (copy, 158x158); the trade allowlist is `TradeManager.cs:163`; the warp items to offer are the 19 of p1; "no existing item-choice mechanic was found, follow the closest precedent, find where comparable refusals are sent; if the mechanism or reply channel cannot be settled, stop and return a precise question with the two best options".

The agent's reply:
- It first printed a short plan summary (read the brief and prompt, write a revised prompt, check ids, find the precedent, stop if unsettled), then worked for about 15 seconds of thinking, listed one directory and ran five shell commands.
- It stopped and wrote nothing: "I stopped at the mechanism question, as the brief required."
- **Revised prompt** (the first one seen from any agent): intent and structure unchanged, with two clarifications: the coin opens a select-one-item screen listing the 19 warp items, and "already owns" means `ywp_user_item` count above 0.
- Verified: the choice crank is yokai only (`ExecuteGachaHandler` line 218, `GachaYoukaiChoiceManager.IsChoiceOk`); the refusal channel is `MsgBoxResponse(message, title)`, used in `EventPointTradeHandler` and `NuzlockManager.LockedResponse`. Not rechecked: ids 90059 and 11011.
- Return JSON: id `57613y2a6914` (matches the front matter), status `not-done`, proof "none", two pitfalls, no commits or files, notes "worktree clean; no containers started; no docker-compose.yml edits". One extra pitfall the manager did not pass on: **EventPointTrade supports items (TradeItemType 1) but is paid in event points, not a coin item.**

Observations:
- **O221: a stop is cheap, and the agent's JSON is exactly the requested format.** Five commands and a few seconds of thinking; the entry is valid, with `not-done` and an empty `commits` list. This is the cost of an under-specified prompt once the agent exists (the startup was the main cost, O213).
- **O222: the re-prompt step produces a short, useful revision.** Two clarifications, no scope change. Compared with the worry in O20 (a fixed cost), it looks small here.
- **O223: the manager left out one pitfall when it relayed.** The agent noted that EventPointTrade already moves items, which is the precedent for option B. The manager's summary says the same in its description of B, so no information was lost, but the pitfall list itself was not carried over.
- **O224: revision of O96, O174 and O205 (the "corrupted briefings").** In this paste, spaces are missing exactly where a terminal line would wrap: "artdataDownload", "themaps-skills-gacha", "composeproject", "warpitems", "onadd_yokai", "withCo-Authored-By", "besettled". The earlier cut sentences and repeated fragments are likely the same terminal copy artifact (wrapped lines and redraws), not damage in the text the agent received. The agent's reply shows no sign of confusion. So the "briefing in a file" suggestion in O174 is lower priority, and the recurrence is evidence about copying from a terminal, not about the manager. Keep it only as a way to make briefings easy to audit.

### B56: Status while p9 builds, 2026-11-12 23:49:27 CET

The manager confirms that option A was sent and that the p9 agent is building the coin: the "Pièce Nostalgique" item (ids from 90059), a new gacha (ids from 11011) with the 19 warp items as roster in a new table (`ywp_mst_gacha_youkai_choice` stays yokai only), the `ExecuteGachaHandler` change, the "Sélection impossible !" popup, the coin out of the trade allowlist, and the docs flag with the one device row. It will report when the commit is made.

Observation:
- **O225: the status message restates B54 and adds nothing new** (same as B6, O13). The progress channel is the harness status line, not the manager's text.
- Started: p9 resumed building at about the time of B54 (the user sent the decision then). Manager's estimate for p9 (the "riskiest"): not given in the table (O85).

### B57: One agent per thread instead of one per prompt? 2026-11-12 23:52:03 CET

The user believes a single agent per thread would have cut token usage by about half, since each thread is dedicated to one part of the codebase (maps, yokai skills, items). The archive already says "typically one per thread" (AGENTS.md, Sub-agent delegation), but the manager started a new agent for each prompt (about nine implementation agents so far for four threads, plus the Haiku pre-flight readers), and resumed an agent only for amends.

Assessment (a hypothesis, not measured):
- **For it:** each new agent pays about 50k tokens to start (B42), of which about 13k is the repository's own `AGENTS.md` (O199). Nine starts against four is about 250k fewer start tokens. A thread agent also keeps what it learned: the unlock-item recipe (p6 then p7), the scenario patterns, the helper scripts, the ids. The manager had to paste those into each briefing (O131), and agents rediscovered some of them. Fewer cold starts also means fewer first-hour mistakes of the kind seen in p1 (a custom script, a wide test run).
- **Against halving:** the bill is mostly cache reads (60.1m against 255.6k output, O198). Every tool call re-reads the whole context. A fresh agent re-reads about 50k per call. A thread agent on its second or third prompt re-reads that plus everything it did before (a finished prompt left 100k or more of history, and the p7 resume reached 140k, B48). The start tokens saved are real, but each later call costs more. For thread lengths of 3 to 4 prompts, the saving in cache reads may be small or negative, even if the start tokens fall by half.
- **Other factors:** context growth near the limit lowers quality or triggers compaction; an idle agent waiting for approval for more than an hour loses its cache (1 h TTL, B50); amends on a large context cost more (p7). Threads are not as uniform as they look: Skills mixes C# passive code (p5) with data work (p6, p7); Maps mixes items, map data, the group lock and missions.
- **A middle path:** keep a fresh agent per prompt, but cut the start cost and keep the knowledge. (1) Each agent writes a short **thread notes file** at the end (recipes, ids, gotchas, commands that worked, in about 20 lines) that the next agent of the thread reads instead of rediscovering. (2) Trim the standing context (the repository's `AGENTS.md`, 13k tokens, is the largest part of the 50k). (3) Resume the thread agent only when its context is small, for example for an amend directly after its own prompt.

To measure, the next pass runs one thread both ways and records, per prompt: usage by category (fresh input, cached input, output), tool calls, questions asked and rework. Without that breakdown the choice is a guess either way. Evidence available now: p1 (a cold agent, 88 calls, 203k tokens, 28 minutes) against p2 to p7 (cold agents with the brief, 13 to 23 minutes each).

### P6: Thread notes handed from one agent to the next

Evidence: B57, O131, O164, O199.

- **Now:** the brief holds decisions and facts written by the manager. Sub-agents "add one line for anything new" but the lines are not structured, and recipes (how an unlock item is built, which helper does what) are pasted into briefings.
- **Suggested:** AGENTS.md asks each sub-agent to leave a short thread notes file (about 20 lines: what it did, commands and helpers that worked, ids it picked, traps, what the next prompt can reuse) next to the brief, and each new agent of the thread reads it first. The manager keeps the notes out of the briefing text.
- **Why:** it captures the main advantage of a thread agent (knowing the thread) without carrying the whole history into every call.

### B58: p9 (Nostalgia Gacha Coin) done, manager report, 2026-11-12 23:55:34 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record", "Worktrees", P1.

The user reports that the p9 agent struggled with the docker compose stack again.

Result:
- p9 committed as `8c4240976` "gacha: Nostalgia Gacha Coin" on `globuland-retro/maps-skills-gacha`. After the decision in B54 (23:48) it took **about 7 minutes** (to about 23:55), on top of the first stop (B53). The manager gave no estimate for p9 (O85). Token count not given.
- Coin: item 90059 "Pièce Nostalgique" (type 4), icon `nostalgia_coin_x1.png` at 158x158 registered in `4.76/20261112`; not in the trade allowlist.
- Gacha 11011, built with `add_item` and `add_gacha_coin`. The roster (items 91001 to 91019) is a new **`itemChoice` field inside the existing `gacha_pool.txt` entry**, not a new table; `ywp_mst_gacha_youkai_choice` is untouched.
- `ExecuteGachaHandler` treats a `requestYoukaiId` in that list as an item pick. If the player already owns the item (count above 0), it replies with the "Sélection impossible !" popup **before the coin is taken**, with the body `<name>\nest déjà dans votre\ninventaire !`.
- Proof: `nostalgia_coin` 11/11 (unowned pick grants the item and spends the coin, a fresh login keeps both; an owned pick is refused with that title and body and the coin is kept; a second unowned pick works; an id outside the roster grants nothing; a coin trade offer is refused), `prod_data` 37/37, `ci/check-*.py` only the old Libertynyan warning. Other scenarios not run. The GitNexus impact and detect-changes analyses were skipped because its index is stale.
- Pitfall: the pool entry has empty weights and yokai, so the banner contents page and any random roll of 11011 have nothing to show; only item picks work.
- Device row for the user: give an account coin 90059 and open the Nostalgia Coin crank. Does it list the 19 items and send the picked item id? If not, fall back to option B (the trade-page route).
- Open question: a banner or shop row for 11011? None requested, none added.

Observations:
- **O226: the agent chose a simpler data shape than the manager allowed.** The manager's briefing said the agent could add a roster table. The agent put the roster in a field of the existing pool entry. It reported this and keeps the yokai choice table untouched. A smaller change than the permission, which is the safe direction.
- **O227: the refusal happens before the coin is taken**, which is what the prompt asks ("the server will reply with a message"; the coin is kept in the scenario). The scenario covers the owned case, the second pick and an out-of-roster id, so the mechanism is tested on the server side.
- **O228: shared handler changed, existing gacha scenarios not run** (O217), and the code-impact tools were skipped because the index is stale. Both reduce safety on `ExecuteGachaHandler`, which every crank uses. The user may want one run of the existing gacha and choice-crank scenarios before approving.
- **O229: a random roll on 11011 has nothing to show.** If the client or any test pulls the coin as a normal crank, it hits an empty pool. The agent noted it as a pitfall. It matters if the crank screen is not flagged as an item choice on the client side (the unverified part).
- **O230: the stack trouble is the third time** (p1 B8, p5 O81 and O95, now p9). The manager's briefing again said "isolated compose project/ports distinct from other stacks (see brief)", which leaves the setup to the agent. This is the P1 evidence, and P2's prepared slots would remove it. Count: three of nine agents had visible stack trouble.
- **O231: the GitNexus index being stale** is a tooling note: the agent could not use the impact analysis that the repository's rules (or the environment) expect before editing a shared symbol.

### B59: p9 approved, p10 started, 2026-11-12 23:57:42 CET

Rules touched: "Pauses", Rule 1 (a thread's prompts run in order), "Shared context", P5.

The user approved p9 and said no banner or shop row for the coin. The manager started p10 (Daily gacha coin) in the `maps-skills-gacha` worktree after p9's commit; planned commit "gacha: Daily gacha coin".

Briefing and manager message, in short:
- Ids: coins from 90060 and gachas from 11012, since p9 took 90059 and 11011 (this resolves O214).
- The 101% pool: the agent cuts 1% in eggcoin_a itself and states where and why in its return and docs, as its own choice; b and c sum to 100%.
- Item ids from names with `show find`; if a name is not found, stop and ask with candidates. Coin art `ywp_global_eggcoin_{a,b,c}-20160428.png` from the main checkout (copy, 158x158). The coins should be tradable per the prompt (allowlist, `docs/game-logic/trade-market.md`, the help tab in `Resources/templates/trade.html`). Coin description standard in `docs/process/decisions.md`. The scenario must cope with random draws. No `--force`. One commit.
- Isolated compose project and ports ("internal postgres port matters, see `docs/scenario-testing.md`"), stop containers when done, revert `docker-compose.yml` and `.env` edits.
- The manager adds that p11 will need the coin ids from this prompt and "also adds the skill book from prompt 6".

Observations:
- **O232: the skill book and p11 are still unclear.** The p11 prompt lists only coins as stamp rewards. The p10 gacha pools already list "Techniques tip-top" (2%, 5%, 10%), which makes the book obtainable. The user said it would be added "in the login prompt" (B43). The manager now says p11 "also adds the skill book" (as a stamp reward?). That would add a reward the prompt does not list. The user should say whether p11 adds the book as a day reward, or whether p10's pools are enough.
- **O233: name lookups are a risk in p10.** The pools name items such as "Secrets de l'ame", "Livre de competences", "Diamanyan", "Piece Speciale" and "EXPorbe Paradisiaque", written without accents, while the game's names have them (O218). The briefing says to stop and ask with candidates if a name is not found, which is the right fallback, but an accent-insensitive search would avoid the stop.
- **O234: the trade instruction is conditional in the briefing text** ("only if the prompt says tradable"), and p10's prompt does say tradable. The agent reads the prompt, so it should add the three coins to the allowlist; the conditional wording is just clumsy. (The briefing paste also shows the copy artifact, O224.)
- **O235: the manager keeps handing the cut choice to the agent** ("it chooses where; state it and why"). The user told the manager "cut 1% somewhere" (B4), so this is faithful. The user can check the choice in the return.

### B60: p10 (Daily gacha coin) done and approved, 2026-11-13 00:08:11 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record", Rule 1.

Result:
- p10 committed as `0924a25b9` "gacha: Daily gacha coin" on `globuland-retro/maps-skills-gacha`. Started at 2026-11-12 23:57:42 (B59), reported at the time above: **about 10 minutes** (manager's estimate 30 to 50 minutes, 100 to 180k tokens). Token count not given. The user approved it ("Prompt 10 is approved").
- Coins: three tradable 1-pull coins "Déjeuner" P'tit, Moyen and Grand, items 90060 to 90062, gachas 11012 to 11014, following the prompt's percentage tables; art copied from `ywp_global_eggcoin_*` at 158x158; no banner or shop row.
- **Currency prizes needed code.** Gacha prizes could only be items or yokai, so Y-Money and Âmes were not grantable. The agent added a currency field to the pool entry (read by `GachaPoolManager`) and made `ExecuteGachaHandler` pay Y-Money or Âmes. The display-only items for them (90063 to 90067 for 3000, 4500, 9000, 15000 and 30000 Y-Money; 90068 to 90070 for 50, 100 and 500 Âmes) are never stored in the inventory. The reply looks like a normal item prize.
- **The 101% cut:** eggcoin_a summed to 101%, so the agent cut the 3000 Y-Money prize from 20% to 19% (the most common and least valuable prize), stated as its own choice in the docs. b and c sum to 100%.
- **Diamanyan** is a yokai (2156000, rank A), not an item. For its maxed-out convert item the agent chose Super Secrets (29001). Diamanyan is now obtainable, so `Obtainable-Yokai.tsv` was regenerated and `ci/check-open-dt.py` reports no problems.
- Proof: `breakfast_coins` 67/67 (for each coin, draws until an item prize and a Y-Money prize land, plus an Âmes prize for coins a and b; checks item counts, the Y-Money and Âmes change, that currency items are not stored, the coin count, a fresh login, and trade validation), `prod_data` 37/37, `ci/check-*.py` only the old Libertynyan warning. The Diamanyan draw is rare, so the scenario checks it only if it lands. Other scenarios not run.
- Trade: the three coins are in `TradeManager.TradableItems`, `trade-market.md` updated.
- Device test: `add_item 90060 5`, then draw until a currency capsule appears. The capsule icons are scaled copies of existing client icons (unverified); the fallback is to send the currency through the present box. The item type 7 chosen for the display items is a guess; it should not matter since they are never stored.
- The manager will start p11 (New login stamps), "which also adds the skill book 28003 as a reward", with coin ids 90060 to 90062.

Observations:
- **O236: the shared gacha handler changed twice in one thread** (p9: item picks; p10: currency prizes), plus `GachaPoolManager`. No existing gacha scenario has been run in either prompt (O217, O228). Each change is tested by its own scenario only, so a regression in the older cranks (yokai, choice, shop) would not show. A **regression pass at the end of a thread** would be a better use of the narrow-test rule than a pass at every prompt.
- **O237: a prompt that looked like data needed code.** The manager rated p10 "medium" with helpers (`add_gacha_coin`, `set_gacha_pool`). The prompt lists "3000 ymoney (20%)" and "50 spirits" as prizes, which the pool could not express. The estimate missed it because the pre-flight did not read the pool format. A pre-flight question could be "can the pool express each prize type this prompt lists?".
- **O238: three agent choices made and reported, each needing the user's eye:** 3000 Y-Money 20% to 19%; Super Secrets (29001) as the convert item for a duplicate Diamanyan; item type 7 for the display items. All three are stated, none was an invented fact, and the user can overrule them with an amend.
- **O239: a rare draw is checked only if it happens** (Diamanyan 1%). That makes the scenario non-deterministic for that prize. A seeded or forced draw would test it every time; the agent chose not to add a test hook.
- **O240: the skill book is going into p11 as a stamp reward**, as the manager planned in B59 (O232), without the user having answered. The user approved p10 and said nothing on it. p11's prompt lists only coins. If the user disagrees, it is cheaper to say so before p11 starts.

### B61: p10 approved, p11 started in the fourth worktree, 2026-11-13 00:09:07 CET

Rules touched: "Pauses", Rule 2 (the login-stamps branch starts from the commit that completed p10), "Worktrees" (this plan needs 4), "Completion record", A4.

The manager started p11 (New login stamps) in a **new worktree** `maps-skills-gacha-login-stamps` on branch `globuland-retro/maps-skills-gacha-login-stamps`, **cut from `0924a25b9`** (p10's commit). Planned commit "login stamps: New login stamps". All four planned worktrees now exist. After p11 and the user's approval, the manager will write the completion record.

Briefing, in short: create a new StampId (find the next free one, leave StampId 1 "WWR Starter Login Stamp", 15 days, alone); day 14 and later cycles automatically (verify how the server cycles, do not invent a mechanism); rewards are `ywp_mst_login_stamp_reward.txt` rows (StampId, day, type, id, count; types in `RewardType.cs`: 1 Item, 2 Yokai, 3 YMoney, 4 Hitodama); coins are items 90059 (nostalgia) and 90060 to 90062 (breakfast), resolve names with `show find` and ask with candidates if one does not resolve; the Retro art is in `dataDownload/logstp/Retro/` (14 date-suffixed files) and its mapping to the four columns is not verified, derive it or ask. **The skill book 28003 "must be made obtainable here"**: if the prompt lists it as a stamp reward, use it, otherwise ask where.

Observations:
- **O241: the manager's statement about the book is stale.** The briefing calls 28003 "currently unobtainable". Since p10, the three breakfast coins list "Techniques tip-top" as a prize (2%, 5%, 10%), so the book is already obtainable through the gacha, and so is the "Orbe nostalgique" 28004. The p11 prompt lists only coins as stamp rewards, so the agent will find nothing to use and will ask "where" about something p10 already did. The user can settle it now: p10's pools are enough, or add the book as a stamp reward too.
- **O242: the manager attributes the requirement to the user.** The user said in B43 that the book "will be added in the login prompt" and then (B59, B60) did not answer the manager's note. The briefing writes it as a user decision. It is a fair reading of B43, but the p10 outcome changes the situation, and the user was never told that the book became obtainable in p10.
- **O243: the completion record is next, and A4 is live.** The manager will write `completion.json` and `roadmap.mmd` after p11. AGENTS.md says to commit them "on the branch you started from", but there are four branches. Watch which branch the manager picks and whether it says why. Also watch that p8 is recorded as `cancelled`, the follow-up commit appears under p3 or p4, and the two amended chains (p1, p5, p7) list the final hashes.
- **O244: the briefing is accurate and verifiable** (file names, column order, types, doc paths), and it tells the agent to verify cheaply, which has been the pattern since p6.

### B62: p11 (New login stamps) done as partial, manager report, 2026-11-13 00:16:39 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record" (`completed` only when the proof is met; `partial` means started, not finished), A4.

Result:
- p11 committed as `c72d01412` "login stamps: New login stamps" on `globuland-retro/maps-skills-gacha-login-stamps`. Started 2026-11-13 00:09:07 (B61), reported at the time above: **about 8 minutes** (manager's estimate 15 to 30 minutes, 50 to 100k tokens). Token count not given. Status reported by the manager: **partial**, because the skill book 28003 is "still unobtainable".
- New StampId 2 "Retro Login Stamp" (14 days). Rewards are the coins 90059 (Pièce Nostalgique), 90060 (P'tit Déjeuner), 90061 (Moyen Déjeuner) and 90062 (Grand Déjeuner), each as an item reward. The Retro art is copied to `dataDownload/logstp/2/`. After day 14 the card cycles back to day 1.
- **Scope change:** the agent fixed a card-picking bug in `LoginStampHandler.cs`. The old code used `Random.Next(1, tableCount)`, which with two rows only returns card 1, so the new card could never be served. The handler now always serves the newest StampId, so card 1 is no longer served to new cycles.
- Proof: `login_stamp_retro` 33/33 (a new account gets card 2, each of the 14 days queues the expected present, day 15 cycles to day 1, the art files exist, a claimed gift is in a fresh login's inventory), `prod_data` 37/37, `ci/check-*.py` only old warnings. Other scenarios not run.
- No login-stamp helper exists, so the agent edited the tables through `lib/mst_tables.py` with registry version bumps, and restored the table's version to an integer after the shared lib saved it as a string.
- Three decisions asked: (1) which day or reward carries the skill book 28003 (a swap in the 14-day table, an extra gift, or another source); (2) newest card always (what the agent did) or a random pick between cards 1 and 2; (3) the Retro art mapping, derived from image sizes and filenames only: Main `logstp_bg_01`, Title `logstp_ttl_title01_01`, Header `all_ttl_dialog_logstp01_01`, Footer `all_ttl_dialog_logstp02_01`, Caution `logstp_text_caution01_01`.

**Checked here against p10's commit (`0924a25b9`, worktree `maps-skills-gacha`):** `Resources/gacha_pool.txt` lists item 28003 ("Techniques tip-top") and item 28004 ("Orbe nostalgique") as prizes in **all three** breakfast gachas (11012, 11013 and 11014). So the skill book is already obtainable.

Observations:
- **O245: the "partial" status and decision 1 rest on a stale premise (O241, now verified).** The book became obtainable in p10. The manager still reports it as unobtainable, so it marked p11 `partial` and asks where to put the book. If the user considers p10's pools enough, p11 is complete. This changes the completion record. The user never told the manager (my O241 went to the user only).
- **O246: the manager's facts come from agent reports and the brief, not from the repository.** It can only know the book's state through p10's report, which did list "Techniques tip-top" among the pool items but did not tie it to the "obtainability" question. This is the cost of a manager that does not look at the data (B25, B36, B44).
- **O247: the card-picking bug is a real find**, in shared code outside the prompt. The fix is the minimal one that makes the new stamp servable, and the agent reported it as a scope change. Decision 2 asks the user to confirm the behavior it implies (card 1 retired). A random pick would have kept both.
- **O248: four or five columns?** The briefing and the Plan speak of "the four exact filenames of the row" and "the four columns". The mapping lists **five** roles (Main, Title, Header, Footer, Caution). One of them may not be a column of the row. Worth a question before the user checks the art on a device.
- **O249: a one-off table edit again, with a lib bug found.** The agent edited through `lib/mst_tables.py` instead of adding a helper, the pattern of O92. The user's convention is to extend the helper library (B15). The shared lib saving a version as a string is a latent bug the agent worked around, which should be reported to the repository's owner.
- **O250: the last prompt came in at about the length of the others,** with the same shape: a short report, honest scope changes, an open question, and a partial status that the data contradicts.

### B63: Decisions on p11, manager's recheck, how to test the last worktree, 2026-11-13 00:19:07 CET

Rules touched: "Completion record" (`completed` only when the proof is met), Rule 3 (independent threads), "Pauses", P1.

The user's answers: (1) the skill book is **indirectly** in the stamp rewards, since it comes from a coin the stamp gives; "a decision change was made between prompts" (B43 to B60). (2) Always the newest card, for all players. (3) Asked how to test in this worktree.

The manager:
- Checked `Resources/gacha_pool.txt` in the login-stamps worktree itself: the daily coin eggcoin_a pool contains 28003 (index 6, weight 2) and 28004 (index 7, weight 2), each a 2% prize. So p11 needs no change and will be recorded as **completed**, with a note, not partial. It admits one gap: it has not checked which of the stamp's coins is eggcoin_a.
- The agent's code already serves the newest card to everyone, so answer 2 needs no change.
- How to test (its reading of the justfile and the reports, not run): stop the main stack (`just rm`) so 80/443/5432 are free; old agent containers (`maps_*`, `maps-skills_postgres_1`) use other ports; `cd ../puniemu_prod_wsl-worktrees/maps-skills-gacha-login-stamps` (it has a copy of `.env`); copy the main checkout's `certificates/` folder instead of regenerating (a suggestion, not verified); `nix-shell`, `just reset`; run `./Database/scripts/set_dev_account user` again (the worktree gets its own database). What this worktree contains: prompts 1, 5 to 7 and 9 to 11 only. Maps prompts 2 to 4 are on `globuland-retro/maps`.
- On the device: card 2 and the Retro art (the five-file mapping is an unverified guess) and day 1's coin; the nostalgia coin crank (`add_item <friend_code> 90059 1`: 19 warp items listed, an owned item shows "Sélection impossible !"); the daily coins (`add_item ... 90060 5`, capsule display, whether the book and orb drop); unlocking skills with 28003 and 28004, which also checks a gated skill at idx 1.
- It asks for "approved" for p11 and will then write `completion.json`, `roadmap.mmd` and a docs folder `docs/prompter-project/globuland-retro-2026-11-13/`.

Cross-check, done here with the pool data: items 28003 and 28004 are prizes in **all three** breakfast gachas (11012, 11013, 11014), not only eggcoin_a, so whichever of the stamp's coins 90060 to 90062 is drawn, the book can drop. This closes the manager's gap.

Observations:
- **O251: the final state is four branches that have never been run together.** The login-stamps worktree has p1, p5 to p7 and p9 to p11, and lacks p2 to p4 (the legacy scramble maps, the Wib Wob lock, the Pocket parts map). This is by design (independent threads, Rule 3, and "never merge"), but the user can only test the whole result by merging the branches themselves. Both threads edit shared files (`Resources/ywp_mst_version_resource.txt`, the Changelog, docs, `gacha_pool.txt` and others), so conflicts are likely and nobody has looked. Cross-thread effects (the Wib Wob lock on the maps that the warp items reach, the legacy marking on the scramble maps) are also untested together.
- **O252: the manager corrected itself with evidence,** after the user's answer, by reading the data. It also stated what it had not checked. This closes O245 and O246 for p11. The statement it checked only eggcoin_a was true but narrower than the data: all three pools contain both items.
- **O253: the test instructions are the P1 problem again.** Stopping the main stack, copying certificates and an `.env`, and starting a stack on the right ports are manual and unverified for each worktree. A prepared test slot (P1, P2) would turn this into one command, and a certificate step is the kind of thing the P2 prompt should cover.
- **O254: "decision change between prompts" is how a user's decision reached the data:** the book became obtainable in p10 because the p10 prompt lists it, not because of any later choice. The user's phrase is a fair description of how the roadmap's prompts interact, and p11's partial status came from the manager's stale note, not from the prompt.

### P7 (candidate): An integration check before handing back

Evidence: O251 (B63).

- **Now:** the manager finishes with one branch per thread, never merged (AGENTS.md: "Never push, merge, rebase or open a pull request unless I ask"). Nothing says to check that the branches fit together.
- **Suggested:** at the end, the manager (or a last agent) creates a **throwaway integration branch and worktree**, merges the thread branches in roadmap order, reports conflicts and fixes nothing without asking, runs the repository's quick smoke check once, and then leaves the throwaway for the user to delete. The completion record gets an "integration" note (conflicts found, files involved, whether the smoke check passed) and the user's own device checks run against that branch.
- **Why:** the user will have to merge anyway, and the threads were declared independent but touch the same shared files. Finding conflicts costs one short task now and avoids a surprise later.
- **Constraint:** it must not change what the archive says about the thread branches (they stay untouched), and it must be an option the user can switch off.

### B64: The user's stack start fails on leftover agent containers, 2026-11-13 00:21:43 CET

Rules touched: "Worktrees", the cost rule and briefings ("stop your own containers when done"), P1, P2.

The user's `just reset` in the login-stamps worktree failed: "no such container" lines for `maps-skills-gacha-login-stamps_puniemu_1` and `_postgres_1` (cleanup of a stack that never existed), then `rootlessport listen tcp 127.0.0.1:5432: bind: address already in use`. The user asked which containers are still up.

The manager's answer (from its own listing; I could not check it, `podman` is not on this shell's path): four containers from the agents' scenario runs are up. `maps_postgres_1` holds `127.0.0.1:5432` (this is why the start failed), `maps_traefik_1` holds `0.0.0.0:80` and `443`, `maps_puniemu_1` has no port, and `maps-skills_postgres_1` is on `127.0.0.1:5443` (harmless). The `maps_*` stack has been up about an hour. It does not know which agent started it; the p4 agent mentioned using "the existing maps stack". It admits that its earlier advice (the standard ports are held by the user's own stack, B44 and B63) was wrong for these containers. No agent is running, so they can be stopped. Suggested, unrun: `podman stop maps_traefik_1 maps_puniemu_1 maps_postgres_1`, optionally `podman rm` the same three, optionally `podman stop maps-skills_postgres_1`. Stopping frees the ports; the database volume stays and only holds scenario data. It asks whether to stop them itself.

Observations:
- **O255: the Maps agents left a stack on the standard ports.** The p1 to p4 briefings said to use an isolated compose project and ports, and to revert `docker-compose.yml`, but **not to stop containers**. That sentence appears only from p7 on (B44), after p6 left its Postgres running (B39). The `maps` worktree's stack ran on the default ports (80, 443, 5432) for the whole Maps thread and was never stopped. This is the cost of the teardown rule arriving late (O155, P1).
- **O256: the manager's earlier port claims are now contradicted twice.** In B44 it said the p1 and p5 agents used 8085 and 8445 for traefik and 5434 for Postgres; in B39 the leftover was on 5434; now it is on 5443 and the `maps` stack is on 80, 443 and 5432. Early evidence also showed 15433 for p1 (B10). Either the agents used different ports at different times, or the manager's figures were recollections (O172). Anything the user must run should come from the worktree's real state, not from the manager's memory.
- **O257: "a shared stack for one worktree" is a reasonable choice that the user then pays for.** Agents p1 to p4 share a branch and a worktree, so one stack for all four is efficient. Nothing then stopped it. P1's wording needs two parts: a stack per worktree on reserved ports, and a stop at the end of each thread, not each prompt.
- **O258: unverified advice cost the user a failed start.** This is the second time (O171, now this). The manager says its commands are unrun and asks permission to run them. It is right to ask before stopping containers, since a stack may still hold something the user wants (here only scenario data, by its claim, unverified).
- **O259: the user was the first to notice,** by running the stack. P2's "smoke test each slot, leave everything stopped" step would have caught it before the session ended.
- A rule for the end of a run, to add to P1: "when the last agent of a worktree finishes, stop its containers and report what is still running (`podman ps` or the equivalent)".

### B65: Device test finds a client crash, the manager investigates itself, 2026-11-13 00:29:53 CET

Rules touched: "Sub-agent delegation" ("You orchestrate and are my only contact; sub-agents report to you"), "Procedure", "Pauses", P3.

The user connected a device with adb after the stack came up, and reported: the client **crashes on the login stamps popup**. The manager opened with a plan summary ("read the crash from logcat, then check whether the cause is the new StampId 2 data, the art files or the handler change, using docs/process/ and the login-stamp docs first; read only, no edits"), and later reported:
- Crash: SIGSEGV null dereference (address 0x68) in `PatternAnimWidget::size(sgf::Vec2 const&)` in `libSGF.so`, called from the success handler of the login stamp request (`ProtocolBase<ProtocolLoginStamp,...>::doRequestSuccess`), right after the server's reply, while the client builds the popup. The cause is not confirmed. Nothing in the repo documents `PatternAnimWidget`; the Ghidra trace of the login stamp does not mention it.
- Difference between the stamps (from `ywp_mst_login_stamp.txt`): StampId 1 has no caution image (column 8 is the literal null, skipped at `LoginStampHandler.cs:126`); StampId 2 has a caution file (`logstp_text_caution01_01-20170126.png`) and different main, title, header and footer art. Best guess, unverified: the caution image, since it is the one thing StampId 1 never sends. Another possibility: the Retro art is a different kind of resource from what the popup expects.
- Cheapest test: (1) set StampId 2's column 8 to null in the worktree (restart or `just reset`, the server caches the table); if the crash is gone, the caution image is the cause; (2) if not, point StampId 2 at StampId 1's four image names; (3) also look for 404s on `logstp/2/...` in the server log. The scenario only checks that the art exists on disk, not that the client can use it.
- The manager offers to do step 1 or 3 in the worktree, or to pull the client's disassembly (more expensive), and asks which. It touched nothing yet.

The CLI suggested the reply "Try step 1 and set the caution column to null". The user asked whether the manager forgot its managing role.

Assessment:
- **The diagnosis is fine for a manager to do,** because it is read-only, short, and it is the user's single contact (AGENTS.md). The cost sits in the manager's long context (B50), but reading a crash log is not worth a new agent's 50k start (B42).
- **The proposal to edit the worktree and to read disassembly is the departure.** AGENTS.md assigns implementation to sub-agents, and the manager's own default from B46 was "resume the earlier agent". The p11 agent holds the stamp rows, the art mapping (its own unverified guess, decision 3) and the scenario, and the fix belongs in its commit (amend) or a follow-up commit. The manager making edits would break "one commit per prompt" or leave an uncommitted change in the agent's worktree.
- **A counterweight:** step 1 is a one-cell edit. Resuming the p11 agent for it would cost more than the edit (a resume re-reads a large context, B48). So the cheapest honest route is a **test edit by the user** (no commit), then the p11 agent for the fix.

Observations:
- **O260: device-test failures have no home in the archive's model.** The prompt is done and committed, the user finds a defect, and no rule says who fixes it or how. This is the same gap as P3: a follow-up to a completed prompt. A rule: "a defect found by the user after a prompt is approved is a follow-up prompt for that thread, handled by an agent of that thread, with its own commit". Add the device-test case to P3's evidence.
- **O261: the "Plan summary" block** (`@=@=@ Plan summary @=@=@`) is the format the implementation agents used (B55), here in the manager's message. The manager is behaving as a working agent, which fits O262.
- **O262: roles blur when no agent is running.** With every agent finished, the manager is the only active worker, and it falls back to doing the work, offering edits and disassembly. The rule "if you cannot delegate, work alone" exists, but delegation is possible here (resume or a fresh agent).
- **O263: the manager did the right thing on the unverified part:** it labelled its best guess unverified, gave the cheapest test first, said what the scenario cannot catch, and touched nothing before asking.
- **O264: the scenario passed and the client crashed.** `login_stamp_retro` (33/33) checks the server's reply and that the art files exist, not that the client can render them. Art mapping and the caution image were flagged as unverified in B62 (O248), and the crash is the first device result. This is the cost of an unverified guess on something only the client can check, and it supports flagging such items for the user's test (O72) and testing them before the commit is approved.
- **O265: the crash comes from a decision the user asked about.** Decision 3 in B62 ("is the Retro art mapping right?") was answered by "tell me how to test on this worktree" (B63), so the mapping went to the device as a guess. The test did its job.

### B66: The user asks the manager to have the login agent fix the crash, 2026-11-13 00:30:26 CET

Rules touched: "Sub-agent delegation" (resume the same agent), "Git branches" (one commit per prompt), P3.

The user told the manager: "Please tell the login agent to fix it". The manager resumed the p11 agent with the crash details, with its own caution-image guess marked **unverified**, and told it to find the real cause from evidence before fixing and to amend its single commit.
- Evidence available to the agent: the login-stamp Ghidra trace, the asset doc, git history, and the optional `re_disasm` disassembly of `libSGF.so` over adb. The crash offset and caller addresses are in the briefing.
- Likely fix (a guess): set the caution column of StampId 2 to null.
- The agent cannot run the client, so it will list exactly what to retest on the device and mark each reading as unverified.

Observations:
- **O266: the user's instruction settled the question of roles (B65).** The manager delegated the fix to the agent that owns the stamp, as AGENTS.md and its own B46 default say, and kept the diagnosis it had already made.
- **O267: the guess travels with a label.** The briefing says "unverified" and asks for evidence first. This keeps the agent from simply applying the likeliest fix, at the price of more tokens on the disassembly path. The cheap test (null the caution column, B65) is still the user's to run on the device.
- **O268: the p11 agent is resumed for a defect after its report,** which is the follow-up case of P3. It amends the single commit, so the record keeps one hash for p11. A follow-up commit would have kept the earlier hash visible, but p11 had not been approved, so an amend is consistent with p1, p5 and p7.
- Cost to watch: the resume of an agent that has run the p11 prompt (compare B48, 10k to 140k on the p7 resume), plus the disassembly if it is used.

### B67: The briefing the p11 agent received for the crash fix (shown by the user), 2026-11-13 00:35:19 CET

Rules touched: "Sub-agent delegation" (self-contained briefing, return format), "Procedure" (flag interpretations), "Git branches" (amend), P3.

Content: the user asks the agent to fix the client crash on the login-stamp popup with StampId 2, in the login-stamps worktree, amending its single commit `c72d01412` (same message and Co-Authored-By; the cost rule applies). It gives the logcat facts (arm64 `libSGF.so`, SIGSEGV null dereference at fault address 0x68 in `PatternAnimWidget::size(sgf::Vec2 const&)+32`, called from the lambda of `ProtocolBase<ProtocolLoginStamp,...>::doRequestSuccess`, so while the client builds the popup right after the server reply), and the data facts: StampId 1 has Caution = literal `null` (the handler skips it, `LoginStampHandler.cs:126`) and the `e005_logstp_*` art; StampId 2 has a real caution file and the Retro art (mapping by filename and size, unverified). The manager's guess (caution image) is labelled unverified. The job: find the actual cause from real evidence ("not guesses"): the Ghidra trace `docs/ghidra-traces/loginstamp-usercommit-puni-x86_64-2026-10-10.md`, `docs/game-logic/login-stamp-assets.md`, `git log` for the original e005 stamps, any retail login-stamp data in the untracked `tmp/` dumps (read-only), and optionally `Resources/scripts/re_disasm` (`llvm-objdump` first; the device is reachable over adb; crash pc offset 0x25ee498, callers 0x233e2cc and 0x233c414). Then fix it: "the most likely safe change first is Caution = 'null' for StampId 2 (and/or using resource files of the expected kind)". The agent cannot run the client, so it lists exactly what the user must test and marks every interpretation unverified, updates the scenario, docs and changelog, and returns the new sha, what it established versus guessed, the device test steps, and at most five open questions.

Observations:
- **O269: the briefing mixes "find the cause, not guesses" with "the most likely safe change first is...".** The second sentence invites the agent to apply the guessed fix without proof. The evidence-first order and the "established vs guessed" return format limit the risk, and the guess is a safe, reversible change.
- **O270: the return format asks for "established vs guessed".** This is the reporting rule suggested in O138, now used for the first time. Compare how the agent's answer separates the two.
- **O271: no budget on the disassembly path.** The `re_disasm` route is marked optional but has no cap, and the briefing says "cost rule applies" although that rule was written for scenario runs. A stop rule would help here (O22): for example "after two attempts at reading the disassembly without a result, stop and report".
- **O272: the user is the test loop.** The agent cannot run the client, so every fix variant costs the user a device session. Better to ask for two or three variants the user can swap in one session (for example, caution null; the Retro art under the original stamp's file names; the Retro art without the footer), each a one-column change, than a single most-likely fix per round trip.
- **O273: privacy.** The briefing carries the device's real LAN address and adb port. The user had masked it in their message. It stays on the local machine, but it is a detail of the user's network in a text that could be saved or shared, and the manager got it from the machine, not from the user. I left it out of these notes.

### B68: The crash fix, the agent's evidence and the device test, 2026-11-13 00:41:40 CET

Rules touched: "Procedure" (what is established vs guessed), "Git branches" (one commit per prompt, amend), P3.

From the instruction to fix (B66, logged 2026-11-13 00:30:26) to this report: **about 11 minutes**. Token count not given.

What the agent established (the manager's relay):
- It pulled `libSGF.so` from the device. The popup builder is at 0x233db7c, called from the `ProtocolLoginStamp` success lambda at 0x233c414; it builds a `PatternAnimWidget` from one of the row's resource strings and calls `size` straight away at 0x233e2cc, which hits the null member.
- Every StampId 1 art file has a `ywp_mst_version_resource.txt` row under `image/logstp/`. **None of the five Retro files had one**, and retail's own manifest lists the undated `logstp_*` names.

What is still a guess: the cause (a file with no manifest row is never downloaded, so the widget's image is null: it fits the crash, unconfirmed); which string feeds the widget (the manager's caution-image idea is possible, unshown); the file-to-column mapping (by filename and size only).

The fix, amended to `104ef90cd` (not device-tested): StampId 2 now uses four manifest-registered names copied from `dataDownload/4.76/20260828/` (`logstp_bg_01.png`, `logstp_ttl_title01_01.png`, `all_ttl_dialog_logstp01_01.png`, `all_ttl_dialog_logstp02_01.png`); Caution is null as on card 1; the table version went from 239 to 240 with the `ywp_mst_version_master` entry bumped; the scenario now checks that every art file has a manifest row and that no caution image is sent (`login_stamp_retro` 35/35, `prod_data` 37/37). The agent's `rm` of the five dated Retro copies in `dataDownload/logstp/2/` was blocked by a safety check; the manager told it (see below) to `git rm` just those five, keep the originals in `Retro/`, and re-amend.

Device test (manager): (1) fresh account or reset the login_stamp field, make sure the client re-syncs resources and master data (table version 240); (2) log in: expected no crash, Retro art shows, day 1 queues 3 P'tit Déjeuner coins in the present box; (3) if it still crashes, send a new logcat, the next experiment is giving card 2 card 1's `e005_logstp_*` names (if that works, the cause is the art or layout, not the manifest); (4) if it works, try the registered caution file `logstp_text_caution01_01.png`, and say whether Main, Title, Header and Footer sit in the right slots. One more point for the user's eyes: the 20260828 files differ byte-wise from both the Retro and Taiwan copies, so the agent could not confirm they are the Retro art; does the look match?

The manager's message to the agent: `git rm` only the five unused dated Retro files in `dataDownload/logstp/2/` (originals stay in `Retro/`, touch nothing else), fix docs and scenario if they mention those files, rerun `login_stamp_retro`, amend the single commit, return only the new sha and the proof line. It also says the skill-book question is settled and the user chose "always the newest card", so the agent must not ask again.

Observations:
- **O274: a root cause found from evidence, on the real device binary.** The agent pulled the library, traced the popup builder and the crash site, and compared the two stamps' manifest rows. It did not apply the guessed fix. The caution-image guess in the briefing was not what it found. This answers the worry in O269 and O271 for this case, and it is the clearest "established vs guessed" report so far (O270).
- **O275: the fix swaps the art instead of registering it.** The hypothesis is that the Retro files have no manifest rows. The repository has `add_version_resources` (used for every icon in this run). The simplest fix of the cause would be to register the five Retro files. The agent instead switched to four retail files that are already registered, which are not byte-identical to the user's Retro art. The p11 prompt says to use the Retro login stamp assets. Ask the manager why the agent did not register the Retro files, and whether a client that downloads by manifest accepts a dated name. The user's eyes decide whether the retail files look like what they wanted.
- **O276: the first scenario passed and missed it.** `login_stamp_retro` (33/33) checked that the art exists on disk, not that each file had a manifest row. Now it does (35/35). Same lesson as O264: "the file exists" is not "the client can fetch it". `docs/game-logic/login-stamp-assets.md` is the place for a one-line rule: every art file needs a manifest row.
- **O277: p11 is now on its third hash** (`c72d01412`, `104ef90cd`, then the re-amend). The completion record must carry the final one, and the record should say that p11 was amended after a device test (P3).
- **O278: settled decisions are passed on.** The manager tells the agent what the user already decided, so the agent does not ask twice. In B48 and B53 this had not been needed; here it avoids a repeat of B62's questions.
- **O279: the manager asks the user a question only the user can answer** (does the look match). Everything else in the device test is stated as an observable result, with a next experiment for each outcome.
- **O280: a safety check blocked an `rm`.** The manager's substitute (`git rm` of five committed files, nothing else, originals kept) is narrower and reversible. The block did what it is for, and cost one extra message.

### B69: p11 final commit and device confirmation, 2026-11-13 00:45:10 CET

Rules touched: "Git branches" (one commit per prompt), "Pauses", "Completion record", P3.

The manager: p11 is now commit `aae6d34f2` on `globuland-retro/maps-skills-gacha-login-stamps`, amended from `104ef90cd`. The five dated Retro copies in `dataDownload/logstp/2/` are removed with `git rm` (the originals in `Retro/` are untouched); the only doc edit was one sentence in `docs/game-logic/login-stamp-retro.md`; `login_stamp_retro` passes 35/35 after the amend; the stack is stopped and `docker-compose.yml` is reverted. p11 is not approved yet and the completion record waits on it.

The user's retest: **"All good! Login stamps confirmed working on new account!"** The user did not write the word "approved".

From the crash report (B65, logged 2026-11-13 00:29:53) to this confirmation: **about 15 minutes**, including the user's device retest.

Observations:
- **O281: the device confirms the fix, not the diagnosis.** Three things changed at once: the art files are the registered retail ones, the caution image is null, and the table version went from 239 to 240. The popup works, so the manifest hypothesis (B68) is consistent, but the test did not isolate which change mattered. If the exact cause matters later, the next step would be one change at a time (the plan in the manager's step 3 and 4 was built for that). The fix works for the user, and the evidence on the device binary supports the hypothesis.
- **O282: p11 is the only prompt where a device test changed the code**, after the server-side proof had passed. Total p11 work: one first run (about 8 minutes, B62), one fix cycle, three amends (hashes `c72d01412`, `104ef90cd`, `aae6d34f2`). The scenario that now checks manifest rows would have caught the defect (O276), at the cost of a rule in the asset doc.
- **O283: approval is implied again** ("All good", with the manager's words "Say approved once your retest looks fine"). The same reading as B23, B37 and B63. The manager has treated a confirmation as approval before; watch whether it does so now, and whether it records p11 as completed with the fix noted.
- **O284: the manager's last message keeps the pause rule intact** (it will not write the completion record until the user approves) while the user's wording is informal. This is the point of O77 in practice: a clear rule on what counts as approval would remove the guess.
- Next: the completion record (`completion.json`, `roadmap.mmd`), the docs folder, and the commit of those files. Items to check in it: p8 as `cancelled` with no commit; the follow-up commit `fa8771f02` listed under p3 (or p4) as agreed in B45; the final hashes after amends (p1 `42035571a`, p5 and p7 amended chains, p11 `aae6d34f2`); the three agent choices to report from p10 (B60); the "unverified" items still open for the device (gated skill at idx 1, the crank screen for items, the currency capsule icons); the branch on which the record is committed (A4).

### B70: The completion record, 2026-11-13 00:47:54 CET

Rules touched: "Completion record" (two mandatory files, valid JSON, one commit on the branch started from), "Git branches", A4, P3, P7.

The manager reports all eleven prompts accounted for and the record committed as `19ec34449` on `table-live`, containing only the two record files, in `docs/prompter-project/globuland-retro-2026-11-13/`. Ten prompts completed, p8 cancelled, p11 recorded completed (the book and orb are 2% prizes of eggcoin_a, the stamp works on a new account, the crash cause is noted as an interpretation). It lists the final commits per branch and what is still unverified on a device: the gated skill at idx 1 (p6, p7), the item-choice crank (p9), the currency capsules (p10), the Retro art slots. Housekeeping: nothing pushed or merged, four worktrees remain (removed only on request), the `maps_*` and `maps-skills_postgres_1` containers may still run, `agent-brief.md` is in `.git/` and uncommitted, the GitNexus index is stale (`gitnexus analyze --index-only`).

**Checked here against the repository (read-only):**
- `19ec34449` changes exactly two files (`completion.json` 287 lines, `roadmap.mmd` 56 lines), on `table-live` only.
- `completion.json` is valid JSON: `format` "prompter-completion", `version` 1, project, date 2026-11-13, an `agent` field, four threads with `path`, `name`, `branch`, `worktree` and `startsFrom`, eleven prompts, each with all nine fields (`id`, `name`, `status`, `summary`, `proof`, `pitfalls`, `commits`, `files`, `notes`).
- The eleven prompt ids match the front matter ids of the archive. `startsFrom` is correct for each thread (Maps null; Skills p1; gacha p7; login stamps p10).
- Statuses: ten `completed`, p8 `cancelled` (no commits, summary "the prompt is empty (rates only, no gacha, items or B roster named). Nothing edited or committed.", notes "Prompt 9 and 10 were kept").
- All eleven recorded hashes exist; every subject follows `<thread name>: <prompt name>`; the follow-up `fa8771f02` is listed under p3 (as agreed in B45). Branch containment fits the topology: p1's commit is in all four branches, the Skills commits in the three later ones, the gacha commits in the last two, `aae6d34f2` only in the login-stamps branch; the Maps commits after p1 are only on `globuland-retro/maps`.
- `roadmap.mmd` is the original plus the four `classDef` lines and eleven `class` lines (p8 `cancelled`, the rest `completed`), as the format says. `Co-Authored-By` is present on the p11 commit.

Observations:
- **O285: the record is complete and correct against the repository,** better than several of the manager's chat reports (B44, B62). Where the record and a report differ, trust the record, because it was written from the agents' returns and the git state, and I could check the hashes.
- **O286: A4 resolved in practice.** The record was committed on `table-live`, the branch the manager started from, with only the two files. The thread branches do not carry it. For AGENTS.md: say "the base branch" instead of "the branch you started from", since that is what was meant.
- **O287: intermediate hashes are gone, as they should be.** Amended chains (p1, p5, p7, p11) list only the final hash. The record's `notes` mention the rework (for example "owner-counts rule changed after the first pass"), so the history of amends is told in words, and `git` cannot show it.
- **O288: the record's caveats match what the user must still test** (four device items). The user's play test starts from this list.
- **O289: housekeeping is a to-do for the user, not for an agent,** and the manager says so (worktrees remain, containers may run, GitNexus index stale). The stale containers are the same ones that blocked the user's start (B64).
- **O290: the user will play test and send the manager a list of changes.** Each change is a follow-up to a completed prompt (P3). Plan to record, per item, which prompt it touches, which agent handled it, the extra commit or amend, and the cost. The record file then needs an update (a new commit on `table-live`, or an addendum), which AGENTS.md does not cover.
- **To capture at the end:** `/usage` on the manager again (B50 showed $12.11 after p7), the per-prompt token counts the user can read from the harness, and the total wall time (start 21:31 for p1, record at about 00:50).

### B71: Playtest round 1, triage and three fix agents, 2026-11-13 01:01:41 CET

Rules touched: P3 (follow-ups to completed prompts), P7 (integration), "Sub-agent delegation", "Git branches" (never amend after approval), "Procedure" (stop on a user decision).

The user played the result on a device and sent the findings to the manager (the pasted message repeats itself and ends in a cut-off log; one server stack trace was included).

| # | Finding (user) | Prompt | Was it flagged unverified in the report? |
|---|----------------|--------|------------------------------------------|
| 1 | Login stamps work | p11 | yes (art slots), fixed in B66 to B69 |
| 2 | Daily coins and item grants work | p10 | n/a |
| 3 | Currency is shown through a wrapper item. "A smart workaround", but the item icons have no transparent background | p10 | yes ("capsule icons are scaled copies, whether the client shows them is unverified") |
| 4 | Event warping with items works | p1 | n/a |
| 5 | Wib Wob lock failed: the server let a player enter stage 13 of Orquanos M with Slurpent Noble (Nyarthur content, should not be in the group) | p3 | **no** |
| 6 | On a `set_dev_account` account the watch-part missions and the blueprint are not visible, every other item is | p4 | **no** |
| 7 | "Techniques tip-top" and "Orbe nostalgique" are not usable in the client, unlike the Hololive reference button | p6, p7 | partly (the gated skill at idx 1, not the item) |
| 8 | Server error on "Pièce Nostalgique": `POST gacha.nhn` with `gachaId` 11011 and `requestYoukaiId` 0, then `InvalidOperationException: Invalid weights for pool roll` at `GachaPoolManager.RollPool` (line 457), HTTP 500 | p9 | yes (the item-choice crank screen) and the pitfall in the p9 report ("a random roll on 11011 has nothing to show") |

The manager's first message listed "six issues" but one of them was "warp items work, no action", so five need work. It then routed them to **three agents, one per worktree that holds the code**, each with one follow-up commit, no rebase and no amend:
- **Maps worktree** (HEAD `b4b83cfba`): Wib Wob lock (is Slurpent Noble in group 999998; is that stage in the restriction file; does the check need all deck members or only some; does it apply to every request path; report other Nyarthur yokai wrongly in the group without removing unsure ones; add a scenario that reproduces it) and watch visibility (how `set_dev_account` grants items and missions, which differs from a login on a scenario account; fix and add a scenario on that path). Commit "Maps: fix playtest issues (wib wob lock, pocket watch visibility)".
- **Skills worktree** (HEAD `92626110d`): diff 28003 and 28004 against the working reference 28002 field by field (item row, bonus-effect rows, unlock columns), with the manager's unverified suspicion that the reference is tied to one yokai and one item for 10 or 12 yokai fails the client's usability check; disassembly of the client allowed; extend the scenario to check the property that was wrong. Commit "Skills: fix unusable unlock items".
- **Gacha worktree** (HEAD `0924a25b9`): the coin (the client sent a plain crank, so option A did not make it show a selection; find how the client decides a gacha is a choice crank; if it can list items, fix it; **if the client cannot list items, stop before implementing and return the evidence with the trade-page alternative, because the user chose A and must re-decide**; either way the server must never return a 500 here, and a scenario shows `requestYoukaiId` 0 on 11011 neither crashes nor takes the coin) and the icons (find why alpha was lost; regenerate with alpha; check the coin icons too). Commit "gacha: fix playtest issues (nostalgia coin choice, currency icons)".
- Every agent: mark interpretations unverified, list the device retest steps, return the new sha, causes (established vs guessed), proof and at most five open questions. The gacha briefing says the login-stamps branch is built on these commits and "do not worry about it".

Observations:
- **O292: five defects, three of them anticipated.** The failing areas that the reports had already marked as unverified on a device (the coin crank, the icons, part of the unlock items) failed, and the two that were not marked (the group lock on one stage, and the dev-account path) failed too, in places where the scenario proved something narrower. The flags pointed to the right places; the unflagged ones show where the proof was thinner than it looked.
- **O293: the p9 pitfall was a prediction that came true.** The p9 report said an empty pool means a random roll on 11011 has nothing to show; the client sent exactly that. It was reported, and the manager listed it as "pitfall", but nothing in the proof covered the plain-crank request. A pitfall that names a reachable 500 should be a scenario check, not a note.
- **O294: the scenario path and the user's path differ.** p4's proof created accounts the scenarios' way and found the blueprint and missions; the user's `set_dev_account` account does not have them (the agent's own earlier note says missions are seeded only when a login syncs them into an existing save). A proof defined as "a new player does X" is only as good as how the player is created. For the repository: have the scenario create accounts the same way `set_dev_account` does, or test both.
- **O295: p3's sample and its outsider list may hide the failure.** The proof sampled one stage per map and (B37, O143) took outsiders from `Obtainable-Yokai.tsv`. Slurpent Noble is Nyarthur content and may not be in that list, while a `set_dev_account` account owns every yokai. The better scenario of B37 could be blind to exactly the yokai the user tried. This is a hypothesis for the agent to confirm.
- **O296: the manager applied P3 as written.** Follow-up commits per worktree, never amend an approved and recorded prompt (the p11 amend of B66 was before approval), one commit per agent. It also kept the rule "stop and return evidence if the user must re-decide" for the coin. This is the clearest example of the follow-up rule working.
- **O297: fix commits on parent branches are not in the child branches.** The Skills and gacha follow-ups land on branches that the later threads were built from (gacha is built from Skills, login stamps from gacha). The login-stamps branch will not carry the fixes for p6, p7, p9 and p10, and the user's device test of the whole result needs all four. "Do not worry about it" is true for the agent's job and not for the user's final merge. This is the case P7 describes (an integration check) and it adds a second need: say how fixes on a parent branch reach its children (a merge in order, or a cherry-pick).
- **O298: three cold starts for three fixes.** Each of the three agents pays the start cost (about 50k tokens, B42) and reads the brief and docs again, although the agents that wrote these prompts exist (p3 and p4's, p7's, p9 and p10's). This is the test of B57 in real conditions: compare what the three fix agents cost with what resuming the thread agents would have cost (B48), per bug.
- **O299: the manager's miscount ("six issues" with one "no action")** is minor and harmless; the briefings carry the right scope.
- **O300: the user is now the quality gate.** Of five defects, none was found by a scenario or a report; all came from the user's device. P2's tips could say it plainly: reserve time for a device test after each thread, not only at the end.

### B72: Skills fix agent reports (unusable unlock items), 2026-11-13 01:11:53 CET

Rules touched: "Procedure" (established vs guessed), "Git branches" (a follow-up commit, no amend), P3, P7.

From the start of the three fix agents (B71, logged 2026-11-13 01:01:41) to this report: **about 10 minutes**. Token count not given. The Maps and gacha fix agents are still running.

Report (the manager's relay): follow-up commit `b5ec2e409` on `globuland-retro/maps-skills`, evidence-backed, not confirmed on the client.
- **Cause (interpretation, strongly backed):** the `ywp_mst_item.txt` rows for 28002, 28003 and 28004 are identical (type 21, param 0, same columns) **except the last column, column 10**: 28002 has 1, 28003 and 28004 had 0, because `add_item` defaults it to 0 (right for coins). Across the whole table column 10 is 1 for every item type the client lets you use and 0 for Food, CrankCoin, FuseItem and Watchpart. The warp items 91001 and up have column 10 = 1 and the user confirmed they work. The bonus-effect rows have the same shape as 28002's, so they are not the cause. The client binary was not checked.
- **Fix:** `set_item 28003 --extra10 1` and `set_item 28004 --extra10 1`; the item registry version went from 263 to 265; a new `--extra10 0|1` flag on the existing `set_item`; both scenarios now compare each item's type and last column to the 28002 row; `docs/resources/item.md` (flagged as an interpretation), `skill-unlock-items.md` (recipe step 0: `add_item --type 21 --extra10 1`) and the Items changelog updated.
- **Proof:** `ykw1_skill_book` 13/13, `wibwob_orb` 15/15, `prod_data` 37/37, `ci/check-*.py` clean except the old Libertynyan warning; other scenarios not run.
- **Device retest:** rebuild or redeploy so item table version 265 is served; re-download master data or restart the client; give the account 28003 and 28004 (not obtainable in game except as daily coin prizes); open the item list, tap 28003, pick Scarnage, Cho-cho or Damona and check they are selectable and the skill unlocks; same with 28004 and Ogralos, Oranyan M, Orqanos M or Domniscian 2.0. If still unusable, the next suspect is column 7 (28002 has an empty string, the 91001+ warp items carry `all_ef_item01_01.dat`).
- The Skills branch now has a fix that the gacha and login-stamps branches do not contain; they were cut earlier and will not be rebased.

Observations:
- **O301: the manager's hypothesis was wrong again, and the agent's evidence was right.** The manager suspected that the reference item is tied to one yokai (B71); the agent found that the item rows differ in one column and the bonus rows do not. Same as B68, where the manager's caution-image guess was not the cause either (missing manifest rows). Two for two: the instruction "find the cause from real evidence, not guesses" paid off both times. A rule for the manager: label hypotheses as such (it did) and do not ask the agent to start from them.
- **O302: the cause was in the recipe, not in the agents' work.** The p6 briefing (B34) quoted the recipe from `skill-unlock-items.md`: `add_yokai_passive ... --item ITEM --flag 1`, then `set_item ITEM --type 21 --param 0 --description`. That recipe left out column 10 and `add_item` defaults it to 0. The p6 and p7 agents followed the repository's own doc, and the doc is what the agent has now corrected (recipe step 0).
- **O303: "the server accepts it" is not "the client can use it" (third time).** The p6 and p7 scenarios tested `useItem` on the server. Column 10 is a client-facing flag. B68 was the same class (the files exist on disk, the client cannot fetch them without manifest rows, O276), and p9's coin screen (B71). The new scenario check, comparing each item to the working reference row, is the right shape: when you copy a mechanism, **diff every column against a working reference**. That is also how the agent found it. A line for the briefing template and for P6's thread notes.
- **O304: the diagnosis was cheap.** The agent compared tables, not binaries: about 10 minutes from the start of all three agents, for a fix with a clear cause, a helper extension (`--extra10`) and two scenario checks. This is the agent following the repository's convention (extend the helper, B15).
- **O305: O297 confirmed.** The manager says the fix exists only on the Skills branch until the user merges. The gacha and login-stamps branches built on it will not have items usable by the client.

### B73: Maps and gacha fix agents report, user's decisions, 2026-11-13 01:48:00 CET

Rules touched: P3 (follow-ups to completed prompts), P7 (integration), "Procedure" (stop on a decision for the user), A4.

All three fix agents had reported by this entry, about 46 minutes after they started (B71, logged 2026-11-13 01:01:41). Token counts not given.

**Maps agent** (commit `4027a4156` on `globuland-retro/maps`, on top of `b4b83cfba`):
- **Wib Wob lock: not reproduced.** Slurpent Noble is 8000087 (SS) and 9001279 (Z), both only in group 41 (Nyarthur), not in group 999998; no yokai of the Nyarthur set (101) is in 999998 either. The user's stage resolves to 9813013; the restriction file has a rule for all 3672 stages of the 140 maps. The check in `GameStartHandler` needs all five deck slots in the group, and runs only there (`gameContinue` and friend/assist yokai are not checked). New scenario `maps_playtest_fixes` 10/10: Slurpent Noble in each of the 5 slots of stage 9813013 gives "Équipe non valide", a full group team starts; `stage_group_restriction` 285/285. No data or code changed for this bug. Unverified guesses: an older server image, or the client's team was never synced (the server checks its own saved deck, because the request carries `activeDeckId` and no team).
- **Blueprint and missions on a dev account:** the server side is fine: after `set_dev_account` and a fresh login the payload holds 160028 (count 99) and all 24 missions with IsAppear 1. Data defect (established): 160028 was the only item of types 9, 21, 22 or 23 with 0 in the last `ywp_mst_item` column (apart from dev item 99999), because `add_item` defaulted it to 0. Interpretation, unverified: the client lists such items only when that column is 1, and the missions vanish because their reward item is unknown to the client. Fix: 160028 now has 1; `--extra10` added to `set_item`; `add_item` now defaults the column to 1 for those types; item registry 263 to 264. `pocket_watch_blueprint` 106/106, `prod_data` 37/37.
- Its open questions: which server build and branch did the user run for the lock bug (its own check says the login-stamps worktree has none of the Maps prompts 2, 3 and 4); `generate_obtainable_yokai` fails inside `set_dev_account --obtainable` in the scenario environment though it works directly (not investigated).

**Gacha agent** (commit `daded76e3` on `globuland-retro/maps-skills-gacha`):
- **Icons (fixed, established):** `ywp_itemicon_prize_money.png` and `ywp_itemicon_prize_spirit.png` were indexed PNGs (colour type 3) with no `tRNS` chunk, because the ffmpeg scale dropped it. Both were regenerated as RGBA 158x158; names and manifest rows unchanged. The other coin icons already carry transparency.
- **Coin crash (established from the arm64 `libSGF.so` disassembly, not tried live):** `ItemScene::onUseBtn` reads one field of the item master (found by data comparison to be `ywp_mst_item` column 4, the param); below 2 the client sends a plain crank with `requestYoukaiId` 0; 2 or more opens the yokai choice screen (`GachaYoukaiSelectView`). Coin 90059 has 0 there, the Sélect-S coins 10119 and 10120. **The choice screen lists yokai only** (`YoukaiTableCell::createCell` takes a `YoukaiMaster const*`), so an item id would probably give a blank cell or a crash (unverified). The agent added no choice rows for 11011.
- **Server fix, independent of that:** `requestYoukaiId` 0 on an item-choice pool now returns the popup "Sélection impossible !" with the body "Choisis un objet dans la\nliste pour utiliser cette pièce.", before the coin is taken; `nostalgia_coin` has two new checks. Proof: `nostalgia_coin` 13/13, `breakfast_coins` 46/46, `prod_data` 37/37.
- **Decision asked:** switch the coin to the trade-page route (the coin as currency, one warp item per account, same refusal popup, no new client UI; no longer a gacha, the 19-item roster unused), and replace or follow the p9 commit?

**The user's answers:** (1) after `just nuke` and `set_dev_account` on the `maps-skills` worktree, **both skill unlock items work, and the skills work in battle**. (2) **"Drop the coin selection then, item pull will be random but without dupes."** (3) asked which folder holds the transparency fix.

**Answer to (3), checked here:** the two PNGs are in `dataDownload/4.76/20261112/`, in the gacha worktree (`/home/julian/puniemu_prod_wsl-worktrees/maps-skills-gacha/dataDownload/4.76/20261112/`), commit `daded76e3` on `globuland-retro/maps-skills-gacha`. In that commit both files are PNG colour type 6 (RGBA, 8-bit), 158x158, with alpha 0 at all four corners (read from the blobs).

**Checked here for the pending merge** (read-only diffs of `4027a4156` and `b5ec2e409`): both add a `--extra10` flag to `set_item` with the same meaning (column 10, values 0 or 1); Maps names the index with a constant and also changes the default of `add_item` to 1 for types 9, 21, 22, 23; Skills writes `row[10]` inline. Both rewrite the one-line `tableData` of `ywp_mst_version_master.txt` (264 and 265), so that line **will conflict**; the item rows themselves differ (160028 against 28003 and 28004).

Observations:
- **O306: the two Maps findings may be test-environment mismatches, not bugs.** The login-stamps and Skills worktrees do **not** contain Maps prompts 2, 3 and 4 (B63, and the Maps agent's own check). The Wib Wob lock (p3) and the whole Pocket parts work (p4, blueprint 160028 and its 24 missions) exist only on `globuland-retro/maps`. If the user ran the server from the `maps-skills` or login-stamps worktree, the lock is not there and the blueprint and missions are absent for that reason alone. The agent reproduced nothing on the right branch, which fits. The col-10 defect on 160028 is real in its own right, but the symptom the user saw can come from the wrong branch. This is O251 coming true: no single branch had everything to test. Ask the user which worktree ran for each test.
- **O307: the same defect found independently by two agents** (column 10 on 160028 and on 28003 and 28004), each adding the same helper flag on its own branch. A shared helper changed twice in parallel is the P7 case. After the merge the version line must be bumped again above both (the item registry above 265), or clients will not re-download one of the changes.
- **O308: the coin decision shows why the agent stopped.** The gacha agent found from the binary that option A could not list items, stopped before building the alternative, and asked, as briefed. The manager offered two paths (keep, or the trade route). The user chose a third: a random item pull without duplicates. Offering the user's own wording of the goal ("the player gets a warp item they do not own") would have found it sooner, and the original prompt said "select 1 item" and not "random".
- **O309: the design change is now a design change to a recorded prompt** (p9: selection dropped, random and no duplicates). The roster, the refusal popup and the new "plain crank" popup all change meaning. It is a new follow-up on the gacha branch (not an amend, P3), and the completion record's p9 entry will need a note. Open design points for the agent: equal weights or not, what happens when the player owns all 19 (the `excludedPools` parameter of `RollPool` may already support exclusion, unverified), and whether a refusal popup still exists.
- **O310: the disassembly finding is the most valuable of the round.** One rule (item master column 4 below 2 sends a plain crank) explains the crash, rules out option A for items, and was found without running the client. Still unverified live.
- **O311: committed scenario traces change heavily with random draws.** The gacha commit shows `breakfast_coins.json` with 7,134 changed lines, and the reported check count went from 67/67 (B60) to 46/46. Draws are random and the scenario loops until cases occur, so counts and traces differ per run. A committed trace that changes by thousands of lines per run hides real changes in review.
- **O312: three agents, three kinds of result.** One could not reproduce (Maps lock), one found a data defect plus an unverified client interpretation (Maps dev account, Skills items), one found a client constraint from the binary (gacha). Only the Skills fix is confirmed on a device so far (item 1 of the user's answers).

### B74: Briefing for the random no-duplicates coin, 2026-11-13 01:48:31 CET

Rules touched: P3 (a follow-up commit, no amend), "Procedure" (flag interpretations), "Git branches", P7.

The manager's message to the gacha agent (shown by the user), on the user's decision to drop the item selection (B73): the Nostalgia coin (gacha 11011, item 90059) does a **random pull of one of the 19 warp items (91001 to 91019) without duplicates**, never an item the player owns (`ywp_user_item` count above 0). Same worktree (HEAD `daded76e3`), cost rule, **one new follow-up commit** "gacha: Nostalgia coin random no-dupe pull" (no amend). Keep the coin's item param column at 0 (the client sends a plain crank below 2). Steps: (1) replace the `itemChoice` mechanism with a normal weighted pool of the 19 items (equal weights) plus a server-side exclusion of owned items, reusing what `GachaPoolManager` already has (`excludedPools`, the maxed-yokai modes) or, if nothing fits, a small generic "noDuplicateItems" pool option instead of 11011-specific code; (2) when the player owns all 19, a clean refusal `MsgBoxResponse` before the coin is taken (title "Sélection impossible !", a body saying every item is already in the inventory), never a 500; (3) remove the now-dead `itemChoice` code, the roster field and the "Choisis un objet" refusal, if nothing else uses them (check the breakfast coins and other cranks first); (4) update `nostalgia_coin` (a draw grants exactly one unowned warp item and spends the coin, repeated draws never repeat an item, draw until all 19 are owned, the 20th draw is refused with the coin kept, a fresh login keeps everything, the coin is still not tradable); (5) rewrite `docs/game-logic/nostalgia-coin.md` short, the Gacha changelog, and the coin's description only if it still promises a selection (the text "Du jamais vu depuis 2018." stays). Note for the device test: the user's dev account holds 99 of every warp item, so all 19 are owned and the user will see the refusal; a clean account or removing the items is needed. Return: new sha, proof, device retest steps, at most five open questions.

Observations:
- **O313: a briefing that keeps the design generic.** "Reuse the existing exclusion, else add a generic `noDuplicateItems` option instead of 11011-specific code" avoids a special case for one coin, which is the repository's convention (extend what exists, B15).
- **O314: it anticipates the user's own test.** The dev account owns 99 of everything, so a no-duplicates coin shows only the refusal there. Saying so in the briefing, and in the device steps, saves a false bug report. This is the same lesson as the dev-account issue (O294): the account you test with decides what you see.
- **O315: the refusal text is an interpretation.** The title "Sélection impossible !" came from a prompt about picking an owned item. There is no selection now, and the body for "all owned" is left to the agent. A visible game string chosen by the agent; the user can change it in one line.
- **O316: the decision undoes a fix made minutes earlier.** The gacha agent's popup "Choisis un objet dans la liste pour utiliser cette pièce." (B73) is part of the code the new commit removes. The fix was right for the question at the time (never a 500). Asking the user before building it would have saved one change, but the briefing for it said to build it either way.
- **O317: the login-stamps branch carries the old coin.** It is built on `0924a25b9` and gives coin 90059, which on that branch still opens an item choice that the client cannot show. With the Skills fix and this one on parent branches, the login-stamps branch lacks two fixes (O297, O307). The merge (P7) is where this is resolved.
- **Still open from B73:** which worktree ran for the Wib Wob test (O306), and how the `--extra10` merge conflict is handled.

### B75: Transparency fix confirmed, and what "stale client data" means, 2026-11-13 01:49:23 CET

Rules touched: "Procedure" (established vs guessed), "Completion record" (notes), P7.

The manager answered the folder question (the gacha worktree, `dataDownload/4.76/20261112/`, the two prize icons, commit `daded76e3`) and added that the Skills, Maps and login-stamps branches lack the fixed icons because they were cut earlier; they appear only on the gacha branch or after a merge. It also said the skill items work in battle, which confirms the column cause. The user then wrote: **"Transparency fix confirmed! Stale client data was the cause."** The manager replied that the old icons genuinely lacked a transparency chunk and the regenerated ones are RGBA, "so both could have contributed", and asked whether to note stale client data as the only cause in the record. The coin agent is still building the no-duplicates pull.

**Checked here (git blobs):** `ywp_itemicon_prize_money.png` and `ywp_itemicon_prize_spirit.png` in `0924a25b9` (the p10 commit) are PNG colour type 3 (palette) with a `PLTE` chunk and **no `tRNS`**, so they had no transparency in the file itself. In `daded76e3` both are colour type 6 (RGBA). The agent's cause is therefore real: the old files were opaque.

Observations:
- **O318: the two statements are compatible.** The old files had no transparency (verified), and a client that kept the old icons would have shown the old look until it re-downloaded. "Stale client data" most likely explains why the user saw the fix only after refreshing, not why the original icons were opaque. If the user meant that the icons were fine and only the cache was wrong, the data above says otherwise. The record's wording should say both: the files lacked alpha (fixed), and the client needed a resource refresh to show it.
- **O319: the manager checked its own claim against what the agent had established,** and asked before changing the record. This is the correct handling when a user's remark and an agent's evidence differ.
- **O320: a refresh step belongs in every device retest.** Three of the failures so far (the stamp art, the items, the icons) needed the client to re-download resources or master data (B68, B72, B73). Putting "clear cached data" at the top of each retest list, and saying which version number to expect, would avoid mistaking an old cache for a bug or a fix.

### B76: Playtest round 1 closed, what is still open, 2026-11-13 02:13:31 CET

Rules touched: "Completion record", P3, P7, "Pauses".

The user's results this round:
- On the `maps-skills-gacha` worktree: **the Nostalgia coin works** as a random pull without duplicates.
- On the `maps` worktree with a new dev account: (1) **the blueprint missions exist and work** (tested on the Valentine scramble bosses); (2) **Slurpent Noble is now blocked** because it is not in the Wib Wob group, and **a full Wib Wob team is allowed** to fight.

The manager's status (a turn of about 15 minutes, "done 2:01 AM"): confirmed on a device are the login stamps, the daily coins, event warping and the warp items, the skill items 28003 and 28004 and the skills in battle, the transparency fix, and the coin as a random no-duplicates pull. Open, per the manager: (1) the Maps fixes, which the user has now tested; (2) the merge conflict between the Maps and Skills branches (both add `--extra10` to `set_item` and bump the item registry to 264 and 265): how to handle it, the manager offers a combined fix on a new branch; (3) `completion.json` is out of date (p9 still lists its option A commit, the follow-up fix commits are not recorded): update and commit to `table-live`?

From the first playtest message (B71) to this entry: about 72 minutes, including the fixes and the retests.

Outcome of the five defects:
| Defect | Result |
|--------|--------|
| Wib Wob lock let Slurpent Noble in (p3) | No code or data change. The lock works on the `maps` worktree. The earlier failure matches a server without p3 (O306), not a bug |
| Blueprint and missions missing on a dev account (p4) | Column 10 of 160028 fixed (real defect); the user now sees the missions on the `maps` worktree (the earlier absence may also have come from a worktree without p4) |
| Skill items unusable (p6, p7) | Column 10 of 28003 and 28004 fixed, confirmed in battle |
| Coin crashed the server (p9) | Option A impossible (the client lists yokai only, from the disassembly); replaced by a random no-duplicates pull, confirmed |
| Icons with an opaque background (p10) | Palette PNGs without alpha regenerated as RGBA, confirmed |

Observations:
- **O321: the lock "bug" was not a bug,** and it cost one agent run to find out. The user's own retest on the right worktree settles it. The agent's note that "an older server image or an unsynced deck" might explain it was a guess; the worktree explanation (O306) fits the data (the lock is only on `maps`). The lesson is the one in O251: with four unmerged branches a tester needs to know which branch has what. P7's integration branch removes the question.
- **O322: four real defects and one false alarm,** all five found by the user on a device, each in a place where the proof was narrower than the user's path (O292 to O295). The three fix agents plus the coin follow-up solved all of them in one evening, with the diagnosis coming from evidence (table diff, disassembly, PNG headers) every time, and the manager's own hypotheses wrong twice (O301).
- **O323: the open items are decisions for the user, not work for an agent:** how to merge, whether to update the record, and the housekeeping. The manager asks, and offers a concrete option for each.
- **O324: the record is now behind the repository.** The completion JSON lists p9 with its option A commit and omits the follow-ups (`4027a4156`, `b5ec2e409`, `daded76e3` and the coin commit). AGENTS.md has no rule for updating a record after a playtest (O290). A natural shape: keep each prompt's original `commits[]`, add the follow-up commits to the prompt they repair with a line in `notes`, rewrite p9's summary (the design changed), and commit the update to `table-live` as a separate commit.
- **Still unverified, by the user's wording:** whether the Retro art matches what the user wanted (the stamp works; the look and slots were not confirmed), the `generate_obtainable_yokai` failure inside `set_dev_account --obtainable` (the Maps agent did not investigate), and whether the gated skills at idx 1 show properly (the user said the skills work in battle).

### B77: Decisions on the merge and the record, and the user's explanation of the failures, 2026-11-13 02:16:51 CET

Rules touched: "Never push, merge, rebase or open a pull request unless I ask" (AGENTS.md, Git branches), "Completion record", P2, P3, P7.

The manager's list of what remains: (1) the `--extra10` conflict between the Maps and Skills branches (both add the flag to `set_item` and bump the item registry to 264 and 265), "I won't merge without your say"; (2) `completion.json` is out of date (p9 still lists its option A commit; missing: the follow-ups `4027a4156` Maps, `b5ec2e409` Skills, `daded76e3` and `15cde89fd` gacha), with an offer to commit an update with a short "playtest fixes" note per prompt to `table-live`; (3) the branches do not contain each other's fixes (the gacha follow-ups are not on the login-stamps branch, the Skills fix is not on gacha or stamps, the Maps branch has neither), nothing is pushed or merged. Unverified, no action unless noticed: a gated skill at index 1 on a no-skill yokai (Gargaros, Ogralos), the Retro art slots, the currency capsule display, the lock bug's cause. Housekeeping: stale containers, the four worktrees, `agent-brief.md` in `.git/`, the stale GitNexus index, the uninvestigated `generate_obtainable_yokai` failure inside `set_dev_account --obtainable`.

The user's answers: **"1. Merge. 2. Update."** and an explanation: "Most of the failure couldn't be reproduced, since they never existed on their worktree, only on the one I was testing. Confusion between worktrees caused it."

Observations:
- **O325: worktree confusion explains most of the failures, by the user's own account.** This goes further than O306 (the lock and the Maps data). The user tested on one worktree that held a mix of the work, and several things "never existed" on the worktree the agents used. So a large share of the fix round (three agents, the reproduction attempts, the retests) was spent on the topology of four partial branches and not on defects. The defects that are confirmed as real are the ones with a data cause visible in the files: column 10 of the items (160028, 28003, 28004), the palette icons, and the coin design (the client cannot list items). This is the strongest evidence yet for P2 (a test slot, and worktrees prepared before the session) and P7 (an integration branch the user tests on). A one-line rule for P2's tips: "name which worktree has which prompts, and test on the integration branch".
- **O326: "Merge" is a short instruction with a missing target.** AGENTS.md says never to merge unless asked, and the user has now asked. It does not say into what: a new integration branch (the manager's earlier offer), or `table-live`, which is the user's working branch and holds the completion record. It does not say in what order, or whether to run the full scenario suite afterwards (O217, O228). A merge into `table-live` is hard to undo, so the safe reading is a new branch. Watch whether the manager asks, or picks the new branch and says so.
- **O327: the record update has a clear scope** (add the four follow-up commits to the prompts they repair, rewrite p9's summary, note the playtest), but no format rule in AGENTS.md (O290, O324). The manager proposes per-prompt notes and a commit on `table-live`. A cleaner record would also carry an "integration" line once the merge is done (the combined branch, conflicts found, scenario results).
- **O328: the manager's closing list is crisp** (three needs, four unverified, four housekeeping items), each with its own owner. The same format would suit the archive's own final report.
- **Count revised:** B76 said four real defects and one false alarm. With O325 the number of real defects is uncertain; "four data or design causes found and fixed, one environment confusion confirmed" is the safer statement.

### B78: The integration merge starts, 2026-11-13 02:18:50 CET

Rules touched: "Never push, merge, rebase or open a pull request unless I ask" (the user asked, B77), "Worktrees" (the plan needs 4), "Completion record", P7.

The manager chose the safe reading of "Merge" (O326): a **new integration worktree** `/home/julian/puniemu_prod_wsl-worktrees/integration` on branch `globuland-retro/integration`. It already holds the login-stamps tip plus the gacha and Skills branches; the Maps merge is in progress. An agent resolves the **13 conflicts as row-level unions of the data tables**, not text merges, keeps one coherent `set_item --extra10` and `add_item` default, then runs the scenarios these branches added plus `prod_data` and the `ci/check-*.py` scripts. `table-live` and the four thread branches stay untouched, nothing is pushed. The manager holds the record update until the merge is done, to put the merge commit and the verification results in one commit; then it updates `completion.json` and `roadmap.mmd` on `table-live` for the follow-up fixes and the integration branch.

Observations:
- **O329: the manager picked the reversible target and said so.** Nothing touches the user's branch until the user decides. This is what O326 asked to watch for.
- **O330: row-level unions are the right way to merge tables keyed by id,** and text merges are the wrong one. Two risks remain in what the merge produces: the one-line `ywp_mst_version_master.txt` (it must end above both 264 and 265, so a client re-downloads both changes), and the item rows of 160028, 28003 and 28004 (column 10 must be 1 in all three). I will check both on the integration branch when the agent reports, read-only.
- **O331: the verification scope is wider than the narrow rule but still not the whole suite.** "The scenarios these branches added plus `prod_data`" covers p1 to p11 and the fixes. It leaves out the older scenarios (`na_events` and the rest) that were never run in any prompt (O68, O103, O217, O228). The integration branch is the first place where every change meets, so it is the most useful place to run them once. Ask for it.
- **O332: a fifth worktree and another stack.** AGENTS.md says the plan needs four worktrees and asks for a disk estimate first; the integration worktree is an extra (about the size of a working tree each), and a scenario run needs its own ports, the old problem (O255, P1).
- **O333: batching the record update with the merge result is sound.** One commit with the merge sha and the proof is easier to read than two. It delays the record, which is out of date until then (O324).
- **For the user (P2, O325):** once the integration branch passes, test everything there and only there. Testing on one branch that holds all the work is what removes the worktree confusion.

### B79: The briefing for the merge agent, 2026-11-13 02:20:30 CET

Rules touched: "Sub-agent delegation" (self-contained briefing, return format), "Never merge unless asked" (asked, B77), P7, cost rule, O68.

The manager's briefing (shown by the user; the paste has the usual copy artifacts at a few line breaks, one of which cuts a sentence about the registry rows and another the middle of the stack instruction) finishes a `git merge --no-ff globuland-retro/maps` that is **in progress** in the integration worktree: do not abort, touch no other worktree or branch, never push or rebase.
- State: integration is the login-stamps tip plus the gacha and Skills branches, already merged. **The manager resolved the Skills merge itself**: it took "ours" for `ywp_mst_item.txt`/`.json` and `ywp_mst_version_master.txt`, then reran `set_item 28003 --extra10 1` and `set_item 28004 --extra10 1` (item registry now 277). The Maps merge stopped with conflicts in 11 paths: the Items and Yokai changelogs, `item_drop.txt`, `set_item`, `ywp_mst_item` (txt and json), `ywp_mst_version_master`, `ywp_mst_version_resource`, `ywp_mst_youkai_group` (txt and json), `TradeManager.cs`, `docs/scenario-testing.md` and `docs/scenario-traces/prod_data.json`.
- Rules: master tables are single-line `tableData` strings with `*`-separated rows, so **do not text-merge them**: take ours, then re-apply the Maps branch's row-level changes since the merge base (diff by row id with `lib/mst_tables.py`), keep ours' changes, flag any row changed on both sides; table version is the max of both plus one, registry rows consistent; keep one coherent `--extra10` and `add_item` default (col 10 = 1 for types 9, 21, 22, 23, from Maps) with no duplicates; `ywp_mst_version_resource` and `ywp_mst_youkai_group` and `item_drop` are unions (duplicate check with `ci/check-duplicate-ids.py --version-resources-only`); `TradableItems` is a union keeping the coin decisions (90059 not tradable, 90060 to 90062 tradable, 28003, 28004 and 160028 as each branch decided); keep both sides' changelog and doc entries.
- Verification: build through the scenario image (a failed C# build is a failed merge); run the scenarios that these branches added or changed (`nostalgia_warp_items`, `pocket_watch_blueprint`, `maps_playtest_fixes`, `stage_group_restriction`, `ykw1_skill_book`, `wibwob_orb`, `soultimate_boost_battle`, `nostalgia_coin`, `breakfast_coins`, `login_stamp_retro`, `prod_data`), all `ci/check-*.py` against `ci/baseline-known-issues.json`; **if a scenario fails because of the merge, fix the merge, not the scenario, unless the scenario is stale**; if unable, stop and report.
- Return: the merge sha, a per-file list of how each conflict was resolved (rows added from which side, rows changed on both sides), the scenario results (PASS x/y), the ci result, anything unresolved, at most five open questions.

Observations:
- **O334: a careful merge specification.** Row-level resolution by id, versions at max plus one, one implementation of the shared flag, unions where the data is a set, and an explicit rule on scenario failures ("fix the merge, not the scenario") that prevents hiding a regression. It also names the decisions that must survive (the trade status of each coin and item). This is the best-specified briefing of the session.
- **O335: the scenario list omits scenarios that these branches changed.** p1's agent edited `na_events` (event points for events 1 and 8) and `api-scripts/lib/stages.py` (B16, O25, O52) and p4's regressions ran `hololive_watch_blueprint` and `trade_offer_checks`. None is in the list, and `na_rooms`, `hololive_unlock_item` and `owner_boost_battle` (named by agents as covering the code they touched, B47) are missing too. `na_events` is the most important: it broke at the start of p1, was patched with no baseline, and the integration branch holds both the `mapType` 4 change on 140 maps and everything after. This is O68 coming due. Ask the manager to add at least `na_events`, `hololive_watch_blueprint`, `trade_offer_checks`, `na_rooms`, `hololive_unlock_item` and `owner_boost_battle`, or the whole suite, to the integration run.
- **O336: the manager did part of the merge itself** (resolving the Skills merge and reapplying two `set_item` calls) before handing the rest to an agent. A small, mechanical preparation, stated openly in the briefing; the roles question of O262 again, with the mitigation that the state is described so the agent can verify it.
- **O337: the merge is the first place where all four branches meet** (P7). The 11 conflicting paths are almost all shared registries and changelogs (version tables, item and group tables, the trade allowlist), the files the threads were never separated on, as predicted in O251 and O307.

### B80: The integration merge is done and the record is updated, 2026-11-13 02:40:51 CET

Rules touched: "Completion record", P7, O68, O217, O228, O335, "Worktrees".

Merge agent's report (the manager's relay; the agent's run was about 20 minutes at the time the harness showed it "waiting on its own background work"): merge commit `df97265d3` on `globuland-retro/integration` (worktree `.../worktrees/integration`) merges all four thread branches into the login-stamps tip; `table-live` and the thread branches are untouched, nothing is pushed. Data conflicts resolved as row-level unions; no row was changed on both sides except **one id collision**: the Maps branch's pocket-blueprint icon row (50775) clashed with the `8000089.ayd` row on the Skills side and was renumbered to 50795. Versions: `ywp_mst_item` 278, `ywp_mst_version_resource` 1959, `ywp_mst_youkai_group` 91. `set_item` has one `--extra10` implementation, `add_item` already had the default, `TradeManager.cs` has the union (90059 still not tradable). C# build succeeds and **11 scenarios pass**: `nostalgia_warp_items` 214/214, `pocket_watch_blueprint` 106/106, `maps_playtest_fixes` 10/10, `stage_group_restriction` 285/285, `ykw1_skill_book` 13/13, `wibwob_orb` 15/15, `soultimate_boost_battle` 45/45, `nostalgia_coin` 7/7, `breakfast_coins` 55/55, `login_stamp_retro` 35/35, `prod_data` 37/37. CI: no failures, the old Libertynyan warning and 8 baselined sound references. One scenario change: `nostalgia_warp_items` first failed with "deckEdit: You dont have this yokai", because group 999998 now starts with boss rows that `add_yokai` refuses; the agent changed `group_deck()` to take the first five members `add_yokai` accepts. It did not run that scenario on the Maps branch alone. Open question from the agent: group 999998 has two rows with idx 2057 (yokai 8000089 and 8000090, Skills side); is idx required to be unique in `ywp_mst_youkai_group`?

The manager also updated the record: commit `de5778d26` on `table-live`.

**Checked here (read-only, against the repository):**
- Merge history: `df97265d3` merges `4027a4156` (Maps) into `ee7618676`, which merges `b5ec2e409` (Skills) into `fe52723bb`, which merges `15cde89fd` (gacha) into the login-stamps tip `aae6d34f2`. In that order, as briefed.
- On the integration branch: `ywp_mst_item` version 278, `ywp_mst_version_resource` 1959, `ywp_mst_youkai_group` 91. **Column 10 of the item row is 1 for 160028, 28002, 28003, 28004 and 91001, and 0 for the coin 90059**, as intended.
- **The idx question is answered by the data:** `ywp_mst_youkai_group` is a JSON `{"data": [{"idx", "youkaiGroupId", "youkaiId"}...]}`. On `table-live` there are already **129 (group, idx) pairs used more than once**, so uniqueness is not enforced there. The three rows at (999998, 2057) are yokai 2343000 (base), 8000089 and 8000090 (the Skills side). The two dev hosts are members of group 999998 on the Skills branch (459 rows against 457 on the base). The 11 boss yokai from the Maps follow-up sit at idx 2262 to 2272, so group 999998 has 470 rows on the integration branch.
- `de5778d26` changes only `completion.json` (29 insertions, 18 deletions), parent `19ec34449`, valid JSON with 11 prompts. It adds the follow-up commits to the prompts they repair: p4 `4027a4156`, p6 `b5ec2e409`, p7 `b5ec2e409`, p9 `daded76e3` and `15cde89fd`, p10 `daded76e3`; p9's summary is rewritten (random no-duplicates pull, the generic `noDuplicateItems` option, the "all owned" popup) and its notes record the user's decision. `roadmap.mmd` is unchanged (it ends with the same class lines, all prompts "completed" except p8 "cancelled").

Observations:
- **O338: the merge worked, with one real collision.** An icon row id (50775) claimed independently by two branches is the same kind of clash as the ids 90059 and 11011 (O214): each agent picked "the next free id" without knowing the other's. The agent found it and renumbered. Any client that downloaded the Maps branch's icon under 50775 now sees a different id; the name is what the client fetches, so this should be harmless, unverified.
- **O339: O335 was not acted on.** The 11 scenarios are exactly the briefed list. `na_events` (changed by p1), `hololive_watch_blueprint`, `trade_offer_checks`, `na_rooms`, `hololive_unlock_item` and `owner_boost_battle` did not run on the first branch where all the changes meet. This is the last cheap moment to run them. Ask the manager for a run of the full suite on the integration branch.
- **O340: the user's boss-yokai test had a downstream effect, found only at the merge.** The follow-up that added 11 boss yokai to group 999998 (B42) made `nostalgia_warp_items` fail (its helper picked the first five members, which are now boss rows `add_yokai` refuses). On the Maps branch alone that scenario, which the narrow rule did not rerun after the follow-up, is probably stale. The agent fixed the helper on the integration branch only, so `globuland-retro/maps` carries a scenario that likely fails (unverified). This is the cost of narrow tests (O217) plus a cross-prompt follow-up (P3).
- **O341: the agent's open question has an answer from the data,** (group, idx) is not unique in the base, so the two rows at 2057 are consistent with existing practice. But 2057 duplicates an existing base row inside the same group (2343000) on the Skills side, a pattern the base shows 129 times. Not a defect by the data; the repository owner may still prefer unique idx. The dev hosts being in the Wib Wob group is a side effect of p5 and p7 worth knowing.
- **O342: the record is current again,** with the follow-ups under the prompts they repair, p9's design change recorded, and one commit on `table-live`. It does not yet mention the integration merge result beyond the manager's note (the manager says it added "the integration branch"; the final `completion.json` has no `integration` field, because the format has none). The record's `roadmap.mmd` was not updated for the follow-ups, which the format does not need.
- **O343: the user now has one place to test everything.** `globuland-retro/integration` holds all four threads and all fixes; moving it into `table-live` is a fast-forward the manager will not do unless asked.

### B81: Analysis of the generated completion record, 2026-11-13 02:43:39 CET

Source: `docs/prompter-project/globuland-retro-2026-11-13/completion.json` in the main checkout on `table-live`, commits `19ec34449` (first) and `de5778d26` (playtest follow-ups and the integration note); `roadmap.mmd` from the first commit, unchanged since. The user had asked which files hold the record; the manager answered, adding that it "can't check from here that the files on disk match those commits".

**Checked here:** `git status` is clean for `docs/prompter-project/` and `git diff HEAD` on the file is empty, so **the file on disk is the committed one**. The file is 17,416 bytes of valid JSON. A search for a LAN address, an email address, `adb` and the user's name finds **nothing**: the device address and the account details that appeared in the briefings did not reach the record.

What the record gets right:
- **Format:** `format` "prompter-completion", `version` 1, an `agent` field, four threads with `path`, `name`, `branch`, `worktree` and `startsFrom`, eleven prompts, all nine fields on each; ids match the archive's front matter; statuses are ten `completed` and one `cancelled` (p8, no commits, proof null, summary says why, notes "Prompt 9 and 10 were kept").
- **Follow-ups under the prompts they repair:** p3 `2c19301e8` plus `fa8771f02`; p4 `b4b83cfba` plus `4027a4156`; p6 `209a65ca1` plus `b5ec2e409`; p7 `92626110d` plus `b5ec2e409`; p9 `8c4240976`, `daded76e3`, `15cde89fd`; p10 `0924a25b9` plus `daded76e3`. Amended chains (p1, p5, p7, p11) carry only the final hash.
- **Honest pitfalls:** p1 still says "na_events not re-run after the mapType 4 change"; p1 notes "Accents were added to the user's item texts"; p7 and p10 keep the device items "unverified" (the gated skill 1, the currency capsule display); p10 names the agent's own choices (the 101% cut, Super Secrets as the convert item) and records that the icons lacked alpha and that stale client data was also involved.
- **The user's confirmations and decisions are in the text:** "User confirmed it works on device" (p9), the p3 note that the lock failure "came from testing on a worktree without this branch's lock", p9's design change (selection dropped, random pull without duplicates, `15cde89fd`).
- **p8's summary** records the cancellation as the user's, with the reason.

Gaps and weak points:
1. **The integration is in p11's notes (559 characters), not in a field.** The merge commit, the resolution of the conflicts, the renumbered resource row 50775 to 50795, the unified `--extra10`, "11 scenarios pass" are about the whole run but attached to one prompt. The format has nowhere else (O342).
2. **Proof fields are scenario counts where the prompt defined a behaviour.** AGENTS.md says `completed` only when "the proof the prompt defines, if any, is met; record it". p3's prompt asks "Battle init refused if using any yokai that is not of the Wib wob group" and p5's "Buchinyan clone gets stronger in a team without attack booster"; the record gives "stage_group_restriction 284/284 then 285/285" and "soultimate_boost_battle 45/45, prod_data 37/37" (p3's note and the scenario names carry the behaviour; p4's proof is the exception and quotes the prompt's own steps).
3. **Check counts of random-draw scenarios are unstable.** `breakfast_coins` appears as 67/67 (p10), 57/57 (p9 proof) and 55/55 (the integration run); it draws until cases occur, so the total varies (O311). A count is not evidence that the same checks ran.
4. **One commit under two prompts** (`b5ec2e409` under p6 and p7, `daded76e3` under p9 and p10). Correct, because one fix repaired both, but a consumer that adds commits or files up counts it twice.
5. **No cost or time.** Nothing records minutes, tokens, number of agents or amends per prompt, although this run measured them (about 7 to 23 minutes per prompt at first pass, 55 for p1 with rework).
6. **Unverified device items are spread over `pitfalls`,** not listed once. The Retro art slots, the gated skill 1 and the currency capsules are the open ones.
7. **`completed` hides revision history.** p6, p7, p9, p10 and p11 were each repaired after a device test; the status is the same as p2's, which was never touched again.
8. **`roadmap.mmd` was not touched by the follow-ups,** which the format allows. It draws p8 as cancelled and the rest as completed; it cannot show "completed, then fixed after a playtest".

Observations:
- **O344: the record is accurate and safe to paste.** It passes the format, matches the repository, contains no private details, and tells the truth about what is unverified. For a document that was updated by hand twice by an agent during a long session this is a good result.
- **O345: the update after the playtest was done well** (follow-ups under the right prompts, one commit, the design change written down) and shows what the format lacks: a place for the integration, for revisions and for cost (see P8).
- **O346: the user's check "can't check from here that the files on disk match those commits"** is a fair statement from the manager, and it is answered by one `git status`, which the manager could have run. The same pattern as O258: a claim of not knowing where a command would tell.

### P8: A richer completion record (format version 2, optional fields)

Evidence: B81 (O342, O344 to O346), B76, B80.

- **Per prompt:** a `proof` that quotes the prompt's own proof criterion followed by the result (keep counts as extra); `followUps`: a list of `{sha, reason}` (for example "playtest: item column", "user decision: drop selection") instead of mixing them with the first commits; `revisions` (number of amends and follow-ups); `cost`: `{minutes, tokens, agents}` as measured by the harness.
- **Top level:** an `integration` object (`branch`, `worktree`, `mergeSha`, conflicts and how they were resolved, scenarios run and results) so the whole-run fact has a home; a `deviceChecks` object with `verified` and `pending` lists; a `run` object with start and end times and total cost.
- **For random-draw scenarios,** record "passes" and the cases covered, not a total.
- **Compatibility:** all fields optional; Prompter keeps finding prompts by `id` and updating the status as before. An unknown field should be ignored, not rejected (not checked here).
- **App side:** the Roadmap page could show the follow-ups and revisions per prompt and the integration result as a banner.

### B82: Final usage figures, 2026-11-13 02:45:20 CET

Reported by the user: this single project consumed **about 17% of the weekly usage** and **more than 100% of a 5-hour session** (the session limit was passed). The user adds that the figure includes noise from the conversation in this notes session, which ran alongside the whole run (about 80 log entries, many repository checks and long write-ups).

Earlier readings for comparison (all account-level, so they included this notes session too):
- Start of the run: weekly 0%.
- B9 (p1 still running): session 5%.
- B50 (after p7, manager session cost $12.11, API time 57 min, wall time 2 h 32 min): session 33%, weekly 9%.
- Now: weekly about 17%, session over 100%.

So the weekly figure went from 0% to about 17% over roughly a night (p1 started 21:31 on 2026-11-12; the record and playtest rounds ran past 02:00 on 2026-11-13), and the session limit was reached at least once. The manager's own session accounted for $12.11 by p7; later work (p8 to p11, the crash fix, the playtest round with three fix agents, the integration merge, the record update) was added on top, and its cost is not in the figures above.

Observations:
- **O347: the cost of one roadmap was 17% of a week and more than a 5-hour session, on Sonnet 5.5 at low effort.** This is the main number for the draft. A user with a smaller plan, or a larger roadmap, would not finish it. The cost is the argument for P4 (model or effort per prompt), P6 (thread notes), P1 and P2 (fewer failed stacks and worktree confusion) and the explore-first rule (O1, O2, B57).
- **O348: the noise cannot be separated here.** The figures are account-level. This notes session logged every message with repository checks, which is part of the total. The user's estimate of the share is the only one; no per-session breakdown was available after the manager's `/usage` at B50. For the next pass, record `/usage` of each session at start and end, so the study session and the implementation session are measured separately.
- **O349: where the cost went, by the evidence in this study.** (a) cache reads of long contexts (60.1m cache-read tokens against 255.6k output at B50, O198); (b) about 50k tokens of start per agent, with about nine implementation agents plus three pre-flight readers and, later, three fix agents and a merge agent (B42, O164, O298); (c) the first run of p1, which cost about 4 times the user's baseline (B9, B15); (d) rework that came from decisions left open on purpose (p8, p9's option A, the boss follow-up) and from testing on the wrong worktree (O325); (e) the repository's own 13k-token `AGENTS.md` loaded on every request (O199).
- **O350: the cost was uneven.** Prompts 2 to 7 took 7 to 23 minutes each; p1 took 55 with rework; the playtest round about 72 minutes and the integration about 20. Most of the money was probably in the long agents (p1, the three fix agents, the merge) and in the manager's long context, not in the routine prompts.

### B83: Final `/usage` of the manager session, 2026-11-13 02:46:43 CET

Source: `/usage` on the manager session at the end of the run (pasted by the user). It covers the manager and its sub-agents, not this notes session ("sessions on this machine only", approximate). It closes the gap left by B82, which said that the later work was not in the earlier figures.

| Item | At B50 (after p7) | Final | Change |
|------|-------------------|-------|--------|
| Total cost | $12.11 | **$23.46** | +$11.35 |
| API time | 57 m 8 s | 1 h 46 m 43 s | +49 m 35 s |
| Wall time | 2 h 32 m 29 s | 5 h 33 m 47 s | +3 h 1 m |
| Haiku 5.5 | 268.3k in, 74.6k out, 2.6m cache read, 424.3k cache write, $0.1428 | 511.4k in, 101.4k out, 2.6m cache read, 424.3k cache write, $0.1805 | +243.1k in, +26.8k out |
| Sonnet 5.5 | 15.7k in, 255.6k out, 60.1m cache read, 1.3m cache write, $11.97 | 24.8k in, 499.0k out, 115.8m cache read, 2.5m cache write, $23.28 | +9.1k in, +243.4k out, +55.7m cache read, +1.2m cache write, +$11.31 |
| Main requests | 73 | 133 | +60 |
| Prompt cache | 98% of input from cache | 99% | |
| Session window | 33% | **94%** (resets 3:40 am) | +61 points |
| Week (all models) | 9% | **17%** (resets Nov 19, 8 pm) | +8 points |
| General-purpose sub-agents' share | 37% | 43% | |
| Harness hints | start fresh (59%), cheaper model for sub-agents (44%), trim the repo `AGENTS.md` (12%) | start fresh (55%), cheaper model for sub-agents (53%) | |
| Code changes by the manager itself | 36 lines added, 0 removed | 36 lines added, 0 removed | none |

Reading:
- **The second half cost about as much as the first.** Prompts 1 to 7 plus the pre-flight cost $12.11. Prompts 8 to 11 (one cancelled, one stopped before building), the crash fix, the playtest round with three fix agents and the coin follow-up, the integration merge and the record updates cost another $11.35, with the same ratio of cache reads to output (about 230 to 1 for Sonnet, as at B50).
- **Cost per completed prompt:** $23.46 over ten completed prompts is about $2.35 each, in this order of magnitude (it includes the cancelled prompt's agent, the fixes, the merge and the manager's own turns). At B50 the rough figure was about $1.7 per prompt.
- **Haiku is 0.8% of the cost** ($0.18) and did the pre-flight reads and, later, more input (+243k). All the rest is Sonnet.
- **Wall time is 3 times API time** (5 h 34 min against 1 h 47 min): the agents ran in parallel or the session waited on the user's device tests and decisions, as in B22, B64 to B69 and the playtest.

Observations:
- **O351: the session reading and the user's statement differ.** This `/usage` shows the session window at **94%** (resetting at 3:40 am, the same reset time as at B50), while the user reported "more than 100%" in B82. The user's figure may include the noise of this notes session, or a different view (account-level) and, possibly, an earlier window. The weekly figure is the same in both: 17%. Treat the weekly 17% as reliable and the session figure as "between 94% and over 100%, depending on what is counted".
- **O352: the manager session made 36 lines of direct changes, the same as at B50.** That is the brief (about 35 lines in `.git`). All other edits, including the two record commits, were made by agents or by shell commands. This shows that, apart from some mechanical steps (O336) and the record, the manager did stay an orchestrator.
- **O353: the harness's own advice is consistent with this study.** It asks for a cheaper model for the sub-agents (53%, P4) and for starting fresh when switching tasks (55%, O203). The earlier hint about trimming the repo's `AGENTS.md` (12% at B50) no longer appears at the end.
- **O354: the per-prompt cost is dominated by what surrounds the work,** not by the edits: start cost per agent, the long context re-read on every call, rework and testing in the wrong place. This is the case for P4, P6, P1, P2 and P7, with a measured total: **$23.46 for ten prompts, a cancelled one, three fix agents, a merge and a record**.
- **O355: for the next pass,** record the manager's `/usage` at start, at each approval and at the end, and the user's weekly and session percentages at the same points, so the cost of each phase (pre-flight, first run, fixes, integration) is measured and not inferred.

### B84: Closing the review, state of the brief and the worktrees, 2026-11-13 02:49:57 CET

The user asked what could still be asked of the manager, since this is the last chance, and asked for a prompt to close the review and leave it in a completed state. The prompt is in `docs/examples/Roadmap-Bubbletea-Retro-manager-questions.md` (23 questions: A numbers, B the manager's own claims, C reasons for decisions, D feedback on the archive and on P1 to P8). It is read-only for the manager (no edits, no commits, no agents, no scenarios), asks for each fact to be tagged verified, reported, memory or guess, and ends with a list of what it could not verify. Questions that the review could answer by reading were not included.

**Checked here (read-only):**
- **The brief is stale at the end.** `.git/agent-brief.md` is 40 lines. It still says "Skill book item 28003 (prompt 6) is NOT obtainable yet: the login-stamp prompt (11) must add it" (the book is a prize of the three breakfast coins since p10, O241 and B63), and "Prompt 9 done (8c4240976): ... gacha 11011 item-choice of 91001-91019" (replaced by a random no-duplicates pull in `15cde89fd`). It has no line for the playtest decisions (selection dropped, the boss yokai in group 999998), the follow-up commits, the worktree confusion or the integration branch. Its "Decisions by the user" section still mixes stated decisions and interpretations (for example "Map bosses = ... (Wib Wob lock concerns them)", O119; "Chocolina/Komasan de Noël = the befriendable non-boss yokai ...", O10), and it never gained an "open items" section (O8). The cost rule is there, in strong terms.
- **Six worktrees exist.** The main checkout on `table-live` (`de5778d26`, the record update), `integration` (`df97265d3`), `maps` (`4027a4156`), `maps-skills` (`b5ec2e409`), `maps-skills-gacha` (`15cde89fd`), `maps-skills-gacha-login-stamps` (`aae6d34f2`). The plan said four; the integration worktree is the fifth, plus the main checkout.
- **The archive's helper scripts are still present** in `scripts/shared/` (`read_md_section.py`, `agent_md_check.py`, `completion_to_md.py`, `README.tsv`, `LIABILITY.md`). The user agreed to the liability clause (B2). Nothing in the session shows that any script was run; the question is in A6.

Observations:
- **O356: a handoff from the brief would carry wrong facts.** The harness itself advises "start fresh when you switch tasks" (O203, O353). A fresh manager reading this brief would believe the skill book is unobtainable and that the coin is an item-choice crank. The brief was meant to hold the run's state (B51, O206), and it stopped being updated at p10. Rule for the archive: the brief is updated at every approval, including playtest decisions, and its last section says what is stale.
- **O357: the brief never separated decisions from interpretations,** although the manager's own first rule in it says "Interpretations must be flagged as such". The one line the user corrected in conversation (the "bosses" meaning, B32) is still wrong in the file.
- **O358: the integration worktree and the stale containers are the run's remaining state:** six worktrees, and the user will need to remove them and stop the stacks (B64, B80).
- **O359: the helper scripts were shipped, approved and probably never used.** If A6 confirms it, either the archive should not ship them for this kind of roadmap, or AGENTS.md should say when they are worth running (for example `completion_to_md.py` for the Markdown version of the record, which the user never asked for).

### B85: The manager's answers to the closing questions, 2026-11-13 02:57:08 CET

Source: the manager's answer to the closing prompt (23 questions, A1 to D7), pasted by the user. **The paste is truncated in several places** (the usual terminal copy artifact, now at a larger scale): the tables lose rows, and a few answers are cut in the middle. Tags `[V]` verified now, `[R]` reported by an agent or a harness notification, `[M]` memory, `[G]` guess are the manager's own. What follows records what the paste contains; the missing parts are listed at the end and were requested again (see `Roadmap-Bubbletea-Retro-manager-questions.md`, "Follow-up request").

**A. Numbers (all from harness notifications, `[R]`; for resumed agents the latest cumulative figure).**
| Agent | Tool calls | Tokens | Wall time | Resumes / amends | Outcome |
|-------|-----------|--------|-----------|------------------|---------|
| Pre-flight Maps (p1 to p4) | 5, then 21 | 66.9k, then 97.1k | 45 s, then 58 s | 1 resume | completed |
| Pre-flight Skills (p5 to p7) | 4, then 12 | 60.6k, then 93.4k | 25 s, then 62 s | 1 resume | completed |
| Pre-flight gacha and stamps (p8 to p11) | 5, then 16 | 61.6k, then 90.6k | 26 s, then 57 s | 1 resume | completed |
| p1 warp items | 88, 111, 116 | 203k, 224.5k, 231.0k | 28, 48, 55 min | 2 resumes (and 1 queued message), 2 amends | completed |
| p2 Clean Scrambles | 19 | 82.8k | 6.2 min | n/a (cut) | completed |
| p3 Wib Wob lock | 37 | 92.9k | 16 min | 1 message (the `--force` objection) | completed |
| p4 Pocket parts | 79 | 175.3k | 25 min | 1 message (the 11 boss yokai) | completed |
| p5 New Custom Skills | 48, then 6 | 130.3k, then 134.8k | 10.4, then 3.5 min | 1 resume, 1 amend | completed |
| p6 YKW1 Variant Skills | (cut) | 122.6k | 13.8 min | 0 | completed |
| p7 Wib Wob 2nd Skills | 54, then 4 | 139.4k, then 145.2k | 12, then 2.6 min | 1 resume, 1 amend | completed |
| p8 Oni crank | 5 | 66.4k | 28 s | 0 | stopped with questions, then cancelled |
| p9 Nostalgia coin | (cut) | 115k (from the estimates table) | 40 s, then 6.8 min | (cut) | stopped, then built |
| p10 Daily coin | 51 | 128.5k | 9.8 min | 0 | completed |
| p11 Login stamps | 39, 62, 64 | 114.7k, 147.2k, 148.8k | 7.2, 10.5, 12 min | 2 resumes, 2 amends | completed |
| Fix: Maps | 72 | 158.5k | 19.5 min | 0 | completed |
| Fix: Skills | 34 | 93.1k | 11.3 min | (cut) | completed |
| Fix: gacha and the coin follow-up | (cut) | (cut) | (cut) | | |
| Merge agent | 63 | 118.9k | 20 min | 0 | completed (interim figure) |
Total about **2.24M agent tokens** (the manager's sum of latest figures, derived). Its own tokens are unknown. Models: all Sonnet except the three pre-flight readers on Haiku `[M]`. Whether tool counts are cumulative is unknown `[G]`.

- **A2.** p1: first run 88 calls, 203,303 tokens, 1,676,251 ms (28 min); after round two 111 calls, 224,504 tokens, 47.6 min; after round three 116 calls, 231,005 tokens, 54.7 min. The figures look cumulative per agent; "55 min and 231k for all rounds" matches the last notification. The rest of the answer (the user's 40 min and 216k, and a note about a cheaper figure of about 189k) is cut.
- **A3** is answered inside D1: the manager merged gacha and stamps into one reader. The reader table above gives the pre-flight cost: about 281k tokens and under 5 minutes of wall time in total, on Haiku.
- **A4.** `git status` showed **13 conflicted paths** (`UU`) `[V]`. The merge agent's report grouped the `.json` mirrors with their `.txt` tables, so it listed 11. Hunk counts unknown.
- **A5** (per agent, `[R]`): p1 project `maps`, postgres 15433, no traefik; p2 and p4 "the existing `maps_*` stack"; p5 traefik 8085/8445, postgres 5434; p6 postgres 5434 and an override file; p7 8081/8444/5443; p9 5450, 8180/8543; p10 5444, 8180/8543; p11 8461/8462, 5461; Fix: Skills 5445; Fix: gacha 5447/8380/8743; merge agent project `integration`, 5461. Who started the `maps_*` stack and who stopped it: unknown.
- **A6.** The manager never ran any of the archive's scripts, never told an agent to, and told p1 they were "user-approved but you need none". Reasons: it read sections with `sed` and `grep`, wrote the record directly, and nothing called for `agent_md_check.py`. Whether any agent ran one: unknown (the absence of `__pycache__` proves nothing).
- **A7.** No cost snapshots kept; the manager has no `/usage` access.

**B. The manager's own claims, audited.**
- Wrong or unverified, with source: "26 missions" and "52 blueprints" (pre-flight reader, relayed; p4 made 24 and 48); "120 scramble maps" (pre-flight inference; the data has 105); "dev-post-2.1.0 is the dev branch" (the repo's `AGENTS.md`; the branch does not exist locally); "prompt 7 is blocked on a progression" (pre-flight reader; the braces are the progression); "the standard ports are held by your own stack" (cut, but the fragment shows the check that would have caught it: `podman ps` before saying it); "skill book still unobtainable" (the p6 and brief note; it was a 2% prize since p10; `grep 28003 Resources/gacha_pool.txt` would have caught it); "next free clone id 8000073" (pre-flight reader; taken; p5 used 8000089 and 8000090); "Map bosses ... Wib Wob lock concerns them" (the manager's own wording; it misled p3 into `--force` and boss rows; asking the user what was meant would have caught it).
- The manager says rows for p8 and p9 **were present** in the estimates table it sent `[V]`, so "missing rows" does not match what it sent, and that it gave no p1 estimate. Estimates against actuals (manager's table): p2 10 to 20 min / 40 to 80k against 6 min / 83k; p3 10 to 25 / 50 to 90k against 16 / 93k; p4 40 to 90 / 150 to 300k against 25 / 175k; p5 40 to 90 / 150 to 300k against 10 + 3.5 / 135k; p6 30 to 60 / 100 to 200k against 14 / 123k; p7 30 to 60 / 100 to 180k against 12 + 2.6 / 145k; p8 15 to 30 / 50 to 100k against 0.5 / 66k (cancelled); p9 40 to 80 / 120 to 250k against 40 s + 6.8 min / 115k; p10 30 to 50 / 100 to 180k against 10 / 129k; p11 15 to 30 / 50 to 100k against 7 + 10 + 2 / 149k. Pattern, per the manager `[G]`: time was overestimated because agents ran only their own scenario plus `prod_data`; tokens were roughly right except p2.
- **B2, stale lines in the brief `[V]`:** "Wib Wob group 999998 (457 yokai)" (now 468); "Skill book 28003 NOT obtainable yet"; "Gacha 11011 item-choice"; "Ports 80/443/5432 are taken by the main stack" (wrong); the "Map bosses" line; nothing after the first seven prompts (no playtest fixes, `--extra10`, integration branch, merge commit, worktree-to-branch map). Intent: a start-of-work brief with one-line notes from agents, never a living document `[M]`. A fresh manager would lose which branch holds which fix, the `--extra10` rule, the decision to drop item selection, the integration branch, the unverified device checks and which scenarios ran.

**C. Decisions.**
- **C1.** One agent per prompt: it did not measure resume against start; it judged that a resumed agent drags 100k to 230k tokens into a different job and wanted each to start clean `[M]`. Resumes for narrow amends were cheap (5 to 6 tool calls, 2 to 4 minutes). Now: resume for small amends of the same prompt, start fresh for new jobs, and say so at the start.
- **C2.** p8 and p9: the rule it applied was "dispatch once the user's answer covers the headline question and rely on the stop-and-ask instruction". The two stops cost about **137k tokens** `[M]` (p8 66.4k and p9's first stop).
- **C3.** Approvals without the word: the p1 checks ("all maps are still proper ... all 4 oni orbs are correct") started p2 and Skills; p11's "All good!" led to the record; "1. Merge" was read as permission to merge onto a **new** integration branch, not onto `table-live`; "Approved for prompt 4 once it's done" was explicit although p4 was already done. Others were explicit.
- **C4.** Text changed: told to the user, the accents in p1 (Clé, Boîte, sucré, fête, Délicieuse), "Orquanos" to "Orqanos" by the user's decision, "Pièce Nostalgique", "Sélection impossible !", a real line break for `<newline>`, French mission titles; possibly not told, the p10 coin names and descriptions.
- **C5** (first half cut): the list of scenarios that ran at least once is **15**: `na_events`, `na_rooms`, `hololive_watch_blueprint`, `trade_offer_checks`, `stage_group_restriction`, `prod_data`, `soultimate_boost_battle`, `ykw1_skill_book`, `wibwob_orb`, `nostalgia_coin`, `breakfast_coins`, `login_stamp_retro`, `pocket_watch_blueprint`, `maps_playtest_fixes`, `nostalgia_warp_items`. **About 56 never ran** on any branch, including `hololive_unlock_item` and `owner_boost_battle` (two agents said these "cover" the code they touched; no evidence they ran). The merge agent ran 11 of the 15, so `na_events`, `na_rooms`, `hololive_watch_blueprint` and `trade_offer_checks` did not run on the integration branch. Who decided the narrow rule and on what ground: cut.
- **C6.** Did itself: worktree creation, `ls`, `grep`, `podman ps`, reading logs, writing the brief and the record, committing the record, and resolving the Skills merge by hand. Delegated: multi-step investigation, anything touching data tables, running scenarios. Arguable: reading the crash log and the prompts itself.
- **C7** (order learned, cut after item 5): isolated ports (from p1's report, then into the brief); stop containers and revert `docker-compose.yml` (from p5 and p6 leftovers); the cost rule and the helper README (from the user's complaint about p1); no `--force` or boss rows (from the user's objection during p3); "established vs guessed" (from the crash briefings); item 6 ("Which worktree ...") is cut.

**D. Feedback.**
- **D1** (table, last rows cut): First: clear, followed, merged gacha and stamps into one reader, say how to size readers; Structure: none; Rules: "standalone prompts" conflicts with stacked branches, state that later fixes do not propagate; Procedure: none; Re-prompt first: ask agents to return only scope changes; Sub-agent delegation: deviated (one per prompt), state the trade-off; Shared context: partly followed, the brief went stale, add "update it at each phase"; Git branches: follow-up commits and a few amends, say which is allowed; Worktrees: the fifth (integration) was its own addition; Pauses: approvals were sometimes loose, define what counts; Completion record: needed an update after the playtest, add a field for follow-ups; Scripts: never used, say when they are worth it; Plan: cut.
- **D2** (the pre-flight) is cut except one line: have readers search the repo in their first pass and ask only what it cannot answer.
- **D3.** Re-prompt first: five agents changed scope (p4, p7, p8, p10, p11), six did not (p1, p2, p3, p5, p6, p9) `[R]`; the step surfaced the p8 gap; no evidence it saved tokens `[G]`.
- **D4.** Caught by the pre-flight: the 101%, "1st" against "2nd" slot, unnamed 1% items, the Potofeu and Beach pass destinations, "Halloween blue team", the Orquanos spelling. Met later: the choice-crank limit, the last-column usable flag, the stamp manifest, the lock checking decks only. Never noticed: two rows sharing idx 2057 in the group table. Ask or assume: asked when the repo could not settle it and a wrong guess meant rework; assumed when `decisions.md` or a doc gave a default; over-asked early.
- **D5** (cut after item 4): 1. which branch or worktree to test on and how to start it; 2. the item-to-image-to-map mapping; 3. the helper-script list and cost expectations; 4. client constraints already known from device tests (usable flag, choice crank is yokai only, stamp ...). Item 5 is cut.
- **D6** (P1 to P3 cut): P4 agree (always sonnet; p8 and p9 stopped almost at once); P5 agree (would have saved two stops); P6 **change**: the brief did this and went stale, make it append-only with dates; P7 agree (the merge found a duplicate manifest id that no single branch showed); P8 agree (its update needed follow-ups, revisions and device checks).
- **D7.** Tell agents which scenarios exist, which are slow and which are mandatory; linear branch stacks hide cross-branch conflicts until the end, so run an integration check regularly; a device-test checklist per prompt would have caught the last-column flag, the choice-crank limit and the manifest problem earlier.
- **Could not verify (manager's list):** its own tokens and cost; whether tool counts are cumulative or per run; who started and who stopped the `maps_*` stack; whether any agent ran the archive scripts; whether `hololive_unlock_item` and `owner_boost_battle` ran anywhere; whether the p8 to p11 hand-offs lost information; why the idx 2057 duplicate exists; hunk counts for the merge.

**Missing from the paste (to request again):** A1 rows for p6's label and counts, p9, the gacha fix and coin follow-up agents, the outcome cells for p2 and Fix: Skills; the end of A2; the "standard ports" row of B1; the start of C2; the first half of C5; C7 item 6 and after; the last rows of D1 (the Plan row); D2; D5 item 5; D6 P1 to P3.

**Checked against the review's own data:**
- The merge agent's "13 files, listed 11" is consistent with the briefing: 11 paths in the list, two of them marked "(+.json)" (`ywp_mst_item`, `ywp_mst_youkai_group`), so 13 files (A4). Closed.
- The agents' wall times agree with the times logged in this review within one or two minutes (p2 6.2 against 7, p3 16 against 17, p4 25 against 23, p5 10.4 + 3.5 against 11 + 3.5, p6 13.8 against 14, p7 12 + 2.6 against 13, p10 9.8 against 10).
- The total of 2.24M agent tokens is consistent with the rows shown: the rows present add up to about 2.09M, so the cut rows (p9 and the gacha fixes) account for the rest.

Corrections to earlier entries:
- **O85 and the B25 table (p8 and p9 rows "missing"):** the manager says the rows were in its message; the omission is an artifact of the paste. The estimates are p8 15 to 30 min / 50 to 100k and p9 40 to 80 min / 120 to 250k. The table is updated below.
- **B48, O192, O193 and B57 (a resume "reaching 140k"):** the manager's figures show that a resumed agent's counter is **cumulative**. p7 went from 139.4k to 145.2k with 4 tool calls and 2.6 minutes; p5 from 130.3k to 134.8k with 6 calls. The "10k to 140k" the user saw at the p7 resume was most likely the counter showing the agent's earlier total again, not the agent re-reading everything. A resume for a narrow amend cost about 5k tokens and 3 minutes. The concern in O193 (resuming can cost more than a fresh start) is **not supported for narrow amends**; for a new job in a large context it remains untested.
- **O3 (three pre-flight reports for four threads):** answered, the manager merged gacha and stamps into one reader.
- **O172 and the ports of B44:** confirmed that the manager's earlier port figures were a mix of different agents' stacks (p1 15433, p5 8085/8445 and 5434, p6 5434, p7 5443).
- **O209 and O213 (cost of the two blocked dispatches):** the manager measures them at about **137k tokens**, under 6% of the 2.24M, and about a minute of wall time. They were cheap in tokens and time; the cost to avoid is a wrong guess, not the stop.

Observations:
- **O360: the notification token figures are cumulative per agent and not the bill.** The agents' latest totals add up to about 2.24M, while the manager session shows 115.8m cache-read tokens for Sonnet (B83). The two measure different things. A rough check: the manager and the agents together made about 1,000 requests (the tool-call counts shown add up to about 700, the manager made 133, and the cut rows add the rest), so the cache reads average about 115k tokens per request. **Cost is requests times the context re-read on each one,** which is O198 with numbers (derived, not measured).
- **O361: the manager's answers show a clear self-audit habit** (B1 lists each wrong claim with its source and the check that would have caught it), and it separates what it knows from what it relayed. Each wrong claim came from a reader's report relayed without a check that one command would have made: `git branch --list`, `podman ps`, `grep`, `show`, or reading the prompt.
- **O362: the manager's own proposals match this review's:** P4, P5, P7 and P8 agreed; P6 changed to an append-only dated log; D7's advice (scenario list, regular integration check, device-test checklist per prompt) overlaps P7 and P2.
- **O363: the full-suite gap is now measured:** 15 scenarios ever ran, about 56 never did, and four of the 15 did not run on the integration branch. This closes O68, O217, O228, O331, O335 and O339 as findings; the risk itself remains open for the user.
- **O364: the truncation affected the answer, not only the briefings.** About a fifth of the manager's reply is missing from the paste. A follow-up that asks the manager to write the answer to a file, so the review can read it directly, avoids a second round of copy artifacts.

### B86: The manager's complete answers, read from the file, 2026-11-13 03:11:31 CET

Source: `/home/julian/puniemu_prod_wsl/.git/manager-answers.md` (read directly, 271 lines; a copy is kept at `docs/examples/Roadmap-Bubbletea-Retro-manager-answers.md`). It is the complete version of the answer that arrived truncated in B85. The file contains no personal data (checked for addresses and emails). The manager says it changed only that file.

What the complete answer adds to B85 (the rest matches B85):
- **A1, the cut rows:** p6 47 tool calls, 122.6k tokens, 13.8 min; p9 7 then 38 calls, 71.5k then 115.2k tokens, 40 s then 6.8 min, 1 resume; Fix: gacha 61 then 72 calls, 130.0k then 143.8k tokens, 19.6 then 4.9 min, one resume (the coin follow-up is that resume, +11 calls, +13.8k tokens); p2's and Fix: Skills' resumes are 0. Models: the pre-flight readers on Haiku, every other agent on Sonnet, the model passed explicitly `[M]`.
- **A2:** the user's "40 min and 216k" matches no notification; it sits between p1's first and second completions, probably a reading taken while the second round ran `[G]`. The 40 minutes may include the manager's turns and the user's waiting `[G]`.
- **A3:** the pre-flight cost about 189k tokens for the first pass and about 281k with the follow-up search `[R]`. Gacha and stamps shared one reader because the stamp prompt depends on gacha p3 and they share the item and coin tables.
- **A5:** the `maps_*` containers held 80, 443 and 5432 at the time `[V]`; which agent started them is unknown, probably p2, p3 or p4 `[G]`. **Now `[V]`:** only `maps-skills-gacha_postgres_1` (5447) and `maps-skills-gacha_puniemu_1` are up, about an hour; the `maps_*` and `maps-skills_postgres_1` containers are gone and the manager did not stop them. Containers left running at some point: p6's, and the `maps_*` stack of the Maps worktree.
- **B1** also lists the row "The standard ports are held by your own stack" (source: the p1 agent's note about "the main stack" plus the manager's assumption; it was the agents' `maps_*` stack; `podman ps` would have caught it, run only after the user's bind error).
- **C2:** at the p8 dispatch the user had said "yes" to "is this the existing Oni crank 9130/9131" and the manager took that as settling the headline question; at the p9 dispatch the user had said the warp items are handled in the maps thread. Rule applied: dispatch when the answer covers the headline question and rely on "stop and ask". Cost about 137k tokens in two stops `[M]`.
- **C5:** the cost rule was the manager's decision after the user said items, images and scenarios were cheap before; "own scenario plus `prod_data`" was the manager's wording, not the user's `[V in the brief]`. **71 scenario files exist on the integration branch**; 15 were reported as run by some agent; about 56 never ran; the merge agent ran 11 of the 15.
- **C7, items 6 to 8:** which worktree holds what (after the lock confusion); a port plan per agent (after the pasted bind error); one-command check before relaying a pre-flight claim (after the prompt-7 and 26-missions errors).
- **D1, the Plan row:** "A cancelled prompt is not modelled. Add a 'cancelled' convention."
- **D5, item 5:** a per-prompt acceptance test (what the user checks on the device).
- **D6, P1 to P3:** P1 agree ("would have prevented the port clashes and the wrong-worktree confusion"); P2 agree ("put the cost rule and the helper list there"); P3 agree ("I improvised them; a formal slot keeps one-commit-per-prompt meaningful"). With the rest from B85: P4 agree, P5 agree, P6 change (append-only with dates), P7 agree, P8 agree. So **seven agree, one change.**
- **N1:** the manager does not know what the notification token figure measures. Evidence: p1's figure only rose across resumes (cumulative); tool counts were inconsistent (cumulative for p1, last run only for p5 and p7); a 6-call resume cannot cost 134k from scratch; a running agent shows a rising total (p3: 85.6k, 87.2k, 89.0k, 92.9k at 27, 29, 32, 37 calls). It reads tokens as a cumulative total and "not the context size" `[G]`.
- **N2, biggest cost per agent:** p1 long scenario runs (`na_events` about 6 min each time, five regressions, an isolated stack build) then two rework rounds; p4 the map copy, 24 missions and a scenario fighting 22 bosses `[G]`, plus the stash mishap; Fix: Maps an unreproducible lock and the dev-account path `[G]`; Fix: Skills cheap, three item rows diffed; Fix: gacha reading `libSGF.so` with `re_disasm` plus an isolated stack.
- **N3, saving tokens and time, in order `[G]`:** (1) hand each agent the helper list, a port plan and a ready scenario runner up front (30 to 60k tokens and 10 to 20 min on p1-style prompts); (2) do not dispatch a prompt with a blocking question, and have the pre-flight search the repo first (about 150k tokens); (3) define the scenario policy at the start: own scenario plus `prod_data` per prompt, one full run at the integration step (10 to 20 min per early prompt).
- **N4, preventing rework or false alarms, in order `[G]`:** (1) a worktree-to-branch table in the brief, with an integration branch from the start (about one agent run of rework); (2) verify every pre-flight claim with one command before relaying it (about six false statements); (3) keep the brief current and give each prompt a short device-test checklist built from known client constraints (three playtest bugs).
- **Could not verify:** its own tokens and cost; the exact meaning of the notification figures; who started and stopped `maps_*`; whether any agent ran the archive scripts; whether `hololive_unlock_item` and `owner_boost_battle` ran anywhere; hunk counts of the merge; why the idx 2057 duplicate exists.

**Checked here against the review's own data:**
- The manager's total, 2.24M, equals the sum of the latest figures in its own table (2,238.9k). The review's wall times agree with the agents' within one or two minutes. The merge's 13 files agree with the briefing (11 paths, two with `.json` mirrors).
- By phase (tokens, derived): pre-flight 281k (12.6%); p1 to p7 985k (44.0%); p8 to p11 459k (20.5%); playtest fixes, coin follow-up and merge 514k (23.0%). Agent wall time adds up to about 254 minutes (4.2 hours; some agents ran in parallel), against the manager's 1 h 47 min of API time and 5 h 34 min of wall time.
- **Where the Sonnet cache reads went (derived, rough):** 816 agent tool calls with the agents' final token figures give about 61m to 81m cache-read tokens for the agents (assuming a linearly growing context, with and without a 50k floor), against 115.8m billed for Sonnet in the manager session's `/usage`. The remainder, about **35m to 55m, is the manager's own 133 requests: 30% to 48%** of the Sonnet cache reads, an average context of 260k to 415k tokens per manager request. The same method gives about 2.3m to 3.5m for the Haiku readers against 2.6m billed, which supports the method. Both assumptions are unverified; the order of magnitude is the point.

Observations:
- **O365: the manager's own long context is probably a third to a half of the Sonnet cache reads,** as large as all its agents together. This agrees with the harness's two hints ("start fresh when you switch tasks", 55% to 59%) and with the manager's own note that nothing but the first seven prompts is in the brief. A manager that could restart from a current brief would be cheaper than a manager that cannot. See P11.
- **O366: the manager's N3 and N4 match this review's priorities** (up-front environment, no blocked dispatch, a scenario policy, a worktree table with an integration branch, one-command checks, a current brief and a device checklist per prompt) and add two items this review had only half-seen: a per-prompt acceptance test (D5) and a stated scenario policy with one full run at integration (N3, C5). They become P9 and P10.
- **O367: the answer is complete and checks out against the data** that can be read: the token total, the 13 files, the stale brief lines (B84), the 15 scenarios that ran. The tags `[V]`, `[R]`, `[M]` and `[G]` are used carefully (for instance N1 says "unknown with certainty" and gives the evidence).
- **O368: the manager's explanation for dispatching p8 and p9 is an improvised rule** ("dispatch once the user's answer covers the headline question"), not an archive rule, and it cost about 6% of the agent tokens. The archive says to settle every uncertainty first, and the pre-flight had flagged both (B1, B3). P5 closes it.
- **O369: seven of eight improvements are agreed by the manager, one changed,** and it adds none that this review lacked beyond P9 and P10's wording. The one change is P6: an append-only, dated log in place of a brief that is written once.
- **O370: the leftover containers disappeared without the manager stopping them,** so someone else did (probably the user after B64). The only ones left are the gacha worktree's.

### B87: The user's answers on the open items, 2026-11-13 03:13:58 CET

The user answered the four open items from the review (section 8):
1. **Retro art:** "Matches the assets provided." The look and slots are confirmed; the stamp art mapping is closed.
2. **Gated skill at index 1 on a yokai with no skill:** "Works properly with no effect." Read as: it works, with no side effects. The unverified item from p6 and p7 is closed.
3. **Integration branch:** "Not tested yet." The user has not run `globuland-retro/integration`; nothing is verified on it beyond the merge agent's 11 scenarios. The fast-forward into `table-live` has not been decided.
4. **Cleanup:** "I did nothing more than the manager." The user removed no worktree and ran no commands beyond what the manager suggested. This also answers who stopped the `maps_*` containers (O370): the user, most likely by running the stop commands the manager proposed in B64 (the manager says it did not stop them itself). The six worktrees are still in place.

Observations:
- **O371: two of the three device items that the record still listed as unverified are now closed** (the Retro art, the gated skill at index 1). The currency capsule display was effectively closed when the user confirmed the daily coins and the icon fix (B73, B75). Nothing from the thread work remains unverified on a device except what lives only on the integration branch.
- **O372: the integration branch is untested by the user.** It is the one place where all four threads and all fixes meet (P7), and the user's earlier tests were each on a single branch (the cause of the confusion in O325). A device pass on it, with the full scenario suite run once, is the natural last step; it was not done in this pass.
- **O373: the leftover containers and worktrees are the run's remaining state.** The only containers still up were the gacha worktree's (B86); removing the worktrees (`git worktree remove`) and the integration branch is the user's decision.
