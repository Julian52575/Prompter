# Manager's answers to the closing questions (Globuland Retro), complete version

Tags: `[V]` verified now, `[R]` reported by an agent or a harness notification, `[M]` from my memory of the session, `[G]` a guess. "unknown" where I cannot say, with the file or command that would settle it.

## A. Numbers I could not collect

### A1. Every agent I started or resumed

Tokens, tool calls and wall time are as the harness notifications gave them `[R]`. For resumed agents the notification showed the latest figures; tool counts are sometimes cumulative and sometimes look like the last run only (see N1). Models: pre-flight readers `haiku`, every other agent `sonnet` (I passed the model explicitly) `[M]`.

| Label | Job | Tool calls | Tokens | Wall time | Resumes / amends | Outcome |
|---|---|---|---|---|---|---|
| Pre-flight Maps | read p1-p4, then repo search | 5, then 21 | 66.9k, then 97.1k | 45s, then 58s | 1 resume | completed (questions, then answers) |
| Pre-flight Skills | read p5-p7, then repo search | 4, then 12 | 60.6k, then 93.4k | 25s, then 62s | 1 resume | completed |
| Pre-flight gacha+stamps | read p8-p11, then repo search | 5, then 16 | 61.6k, then 90.6k | 26s, then 57s | 1 resume | completed |
| p1 warp items | prompt 1 | 88, 111, then 116 | 203.3k, 224.5k, then 231.0k | 28, 48, then 55 min | 2 resumes (+1 queued message), 2 amends | completed |
| p2 Clean Scrambles | prompt 2 | 19 | 82.8k | 6.2 min | 0 | completed |
| p3 Wib Wob lock | prompt 3 | 37 | 92.9k | 16 min | 1 queued message (`--force` objection) | completed |
| p4 Pocket parts | prompt 4 | 79 | 175.3k | 25 min | 1 queued message (11 boss yokai follow-up) | completed |
| p5 New Custom Skills | prompt 5 | 48, then 6 | 130.3k, then 134.8k | 10.4 min, then 3.5 min | 1 resume, 1 amend | completed |
| p6 YKW1 variants | prompt 6 | 47 | 122.6k | 13.8 min | 0 | completed |
| p7 Wib Wob 2nd skills | prompt 7 | 54, then 4 | 139.4k, then 145.2k | 12 min, then 2.6 min | 1 resume, 1 amend | completed |
| p8 Oni crank | prompt 8 | 5 | 66.4k | 28s | 0 | stopped with questions; user cancelled |
| p9 Nostalgia coin | prompt 9 | 7, then 38 | 71.5k, then 115.2k | 40s, then 6.8 min | 1 resume | stopped with a question; then completed |
| p10 Daily coin | prompt 10 | 51 | 128.5k | 9.8 min | 0 | completed |
| p11 Login stamps | prompt 11 | 39, 62, then 64 | 114.7k, 147.2k, then 148.8k | 7.2, 10.5, then 12 min | 2 resumes (crash fix, `git rm`), 2 amends | completed |
| Fix: Maps | playtest: lock + watch visibility | 72 | 158.5k | 19.5 min | 0 | completed (lock not reproduced; item flag fixed) |
| Fix: Skills | playtest: unusable unlock items | 34 | 93.1k | 11.3 min | 0 | completed (last-column flag fix) |
| Fix: gacha | playtest: coin crash + icons | 61, then 72 | 130.0k, then 143.8k | 19.6 min, then 4.9 min | 1 resume (coin follow-up) | completed (selection dropped; random no-dupe pull) |
| Coin follow-up | the resume of the Fix: gacha agent for the random no-dupe pull | included above (+11 calls) | included above (+13.8k) | included above (4.9 min) | counted as the resume above | completed |
| Merge agent | integration merge conflicts | 63 | 118.9k | 20 min | 0 | completed (the last notification was interim) |

Total of the latest figures: about 2.24M agent tokens `[derived from R]`. My own tokens are unknown.

### A2. p1 figures

- First completion: 88 tool calls, 203,303 tokens, 1,676,251 ms (about 28 min) `[R]`.
- After the second round: 111 calls, 224,504 tokens, 2,857,246 ms (about 48 min) `[R]`.
- After the third round: 116 calls, 231,005 tokens, 3,280,597 ms (about 55 min) `[R]`.
- The figures I quoted at different moments ("about 28 min and 203k", then "about 55 min and 231k for all rounds") are the first and last of these: the first run alone, then all rounds.
- The user's "40 min and 216k": it matches no notification. It sits between the first and second completions, so it is most likely a reading taken while the second round was running `[G]`. The 40 min may also include my own turns and the user's waiting `[G]`.

### A3. Pre-flight

- Three `haiku` readers `[M]`: Maps (p1-p4), Skills (p5-p7), gacha and login stamps together (p8-p11).
- Why three for four threads: I put gacha and login stamps in one reader because the stamp prompt depends on gacha prompt 3 and they share the item and coin tables `[M]`.
- Cost: about 189k tokens for the first reading pass and about 281k with the repo-search follow-up `[R]`.

### A4. Integration merge conflicts

13 conflicted paths in the `git status` listing (`UU`) `[V]`. The merge agent's report grouped the `.json` mirrors with their `.txt` tables, which is why a shorter list appeared. Hunk counts: unknown (`git merge` output was not saved).

### A5. Stacks

Per agent `[R]`:

| Agent | Compose project / ports |
|---|---|
| p1 | project `maps`, postgres 15433, no traefik |
| p2, p4 | "the existing `maps_*` stack" |
| p5 | traefik 8085/8445, postgres 5434 |
| p6 | postgres 5434 with an override file |
| p7 | 8081/8444/5443 |
| p9 | 5450, 8180/8543 |
| p10 | 5444, 8180/8543 |
| p11 | 8461/8462, 5461 |
| Fix: Skills | 5445 |
| Fix: gacha | 5447/8380/8743 |
| Merge agent | project `integration`, 5461 |

- Who held ports 80, 443 and 5432: the `maps_*` containers did, at the time I ran `podman ps` `[V]`. That was an agent stack, not the user's stack. Which agent started it is unknown; probably p2, p3 or p4 `[G]`.
- Left running now `[V]`: only `maps-skills-gacha_postgres_1` (127.0.0.1:5447) and `maps-skills-gacha_puniemu_1`, up about an hour. The `maps_*` and `maps-skills_postgres_1` containers are gone; I did not stop them.
- Agents that left containers running at some point `[R]`: p6 (left `maps-skills` postgres and puniemu), and the `maps_*` stack of the Maps worktree.

### A6. Archive scripts

- I did not run any of the three scripts and did not tell any agent to run them. I told p1 they were "user-approved but you need none" `[M]`.
- Why not: I read sections with `sed`/`grep`, wrote the record directly, and nothing in the task needed an audit of `AGENTS.md` or a Markdown conversion `[M]`.
- Whether any agent ran one: unknown. No `__pycache__` exists, but running a script directly would not create one, so that is no evidence `[V]`.

### A7. Cost snapshots

None kept, and I have no `/usage` access `[M]`.

## B. My own claims, audited

### B1. Statements that were wrong or unverified

| Claim | Source | Check that would have caught it |
|---|---|---|
| "26 missions x 2 = 52 blueprints" | Pre-flight Maps report, relayed by me `[R]`. The p4 agent made 24 missions (48 blueprints). | Read the p4 prompt, which I had not. |
| "120 scramble maps" | The pre-flight agent's inference. The data has 105 `[R]`. | `show find scramble`; the follow-up did it. |
| "dev-post-2.1.0 is the dev branch" | The repo `AGENTS.md`. The Skills agent then found it does not exist locally `[R]`. | `git branch --list 'dev-post-*'` at the start. |
| "Prompt 7 is blocked on a progression" | The pre-flight reader. My error: the `{...}` braces in the prompt are the progression. | Reading one file. I did it only after the user asked. |
| Port numbers 8085/8445, 5434, 5443 | Agent reports `[R]`; I quoted them without `podman ps`. | `podman ps` before quoting. |
| "The standard ports are held by your own stack" | The p1 agent's note about "the main stack", plus my own assumption. It was the agents' `maps_*` stack `[V]`. | `podman ps` before saying it. I ran it only after the user pasted a bind error. |
| "The skill book is still unobtainable" | The p6 note and my brief. It was a 2% prize (`i6`) of `eggcoin_a` since p10 `[V]`. | `grep 28003 Resources/gacha_pool.txt`. I ran it only after the user's remark. |
| "Next free clone id 8000073" | Pre-flight reader, put in the brief `[R]`. The id was taken; p5 used 8000089/8000090. | `show` on the id. |
| "Map bosses... Wib Wob lock concerns them" | My own wording from the user's answer. It misled the p3 agent into `--force` and boss rows. | Asking the user what they meant. |
| My p2-p11 estimates | Mine. Rows for p8 and p9 are present in my table `[V]`, so "missing rows" does not match what I sent. I gave no p1 estimate. | Compare with actuals below. |

| Prompt | Estimate (time / tokens) | Actual |
|---|---|---|
| p2 | 10-20 min / 40-80k | 6 min / 83k |
| p3 | 10-25 / 50-90k | 16 min / 93k |
| p4 | 40-90 / 150-300k | 25 / 175k |
| p5 | 40-90 / 150-300k | 10 + 3.5 min / 135k |
| p6 | 30-60 / 100-200k | 14 / 123k |
| p7 | 30-60 / 100-180k | 12 + 2.6 / 145k |
| p8 | 15-30 / 50-100k | 0.5 / 66k (cancelled) |
| p9 | 40-80 / 120-250k | 40s + 6.8 min / 115k |
| p10 | 30-50 / 100-180k | 10 / 129k |
| p11 | 15-30 / 50-100k | 7 + 10 + 2 / 149k |

Time was overestimated because agents ran only their own scenario plus `prod_data`. Tokens were roughly right.

### B2. The brief

Stale lines `[V]`: "Wib Wob group 999998 (457 yokai)" (now 468); "skill book 28003 NOT obtainable yet: prompt 11 must add it"; "gacha 11011 item-choice of 91001-91019" (now a random no-dupe pull); "ports 80/443/5432 are taken by the main stack" (wrong); the "Map bosses... lock concerns them" line (misleading). Nothing after the first 7 prompts is recorded: no playtest fixes, `--extra10`, integration branch, merge commit, or worktree-to-branch map.

I wrote it as a start-of-work brief and asked each agent for one line; I did not plan to keep it as a living document `[M]`. A fresh manager would lose: which branch holds which fix, the `--extra10` rule, the decision to drop item selection, the integration branch, the list of unverified device checks, and which scenarios ran.

## C. Why I decided as I did

### C1. A new agent per prompt

I never measured resume against start. My judgement: a resumed agent drags its whole context (100-230k tokens) into a different job, and I wanted each agent to start clean `[M]`. The archive says "typically one per thread". I did resume for narrow amends of the same prompt, and those were cheap (4-6 tool calls, 2-4 min) `[R]`. What I would do now: resume for small amends of the same prompt, start fresh for new jobs, and say so up front.

### C2. Dispatching p8 and p9 with flagged questions

- **What the user answered when I dispatched p8:** to my question about the Oni crank the user said "yes" (this is the existing Oni crank, 9130/9131). I took that as settling the headline question `[M]`. The unnamed "1% items" were never resolved. The agent stopped after 28s and 66k tokens, then the user cancelled.
- **What the user answered when I dispatched p9:** the user said the warp items are handled by another agent in the map thread. I took that as settling the item list `[M]`. The selection mechanism and the reply channel were still open; the agent stopped.
- **Rule I applied:** dispatch once the user's answer covers the headline question and rely on the agent's "stop and ask" instruction for the rest. It cost about 137k tokens in two stops `[M]`.

### C3. Approvals without the word "approved"

- After the p1 device checks (user: all maps proper, event ball spawn, next-entry unlock, titles, all 4 orbs correct): I took it as approval and started p2 and the Skills thread `[V]`.
- p11 ("All good! Login stamps confirmed working on new account!"): I took it as approval and wrote the completion record `[V]`.
- "1. Merge": I took it as permission to merge into a new integration branch, not into `table-live` `[M]`.
- Explicit: p3, p4 ("Approved for prompt 4 once it's done", although p4 was already done), p6, p7, p9, p10.

### C4. User text changed

- Told to the user `[R]`: accents added in p1 items (Clé, Boîte, sucré, fête, Délicieuse), "Orquanos" to "Orqanos" (the user chose game spelling), "Pièce Nostalgique", "Sélection impossible !", `<newline>` read as a real line break, French mission titles.
- Possibly not told: the p10 coin names and descriptions. The agent said they were accented; I passed that on only in summary.

### C5. The cost rule

- **Who decided and why:** I set it after the user's message that items, images and scenarios were cheap in earlier runs. "Own scenario plus `prod_data`" was my wording, not the user's `[V in the brief]`.
- **Scenarios that exist but never ran on any branch `[derived]`:**
  - 71 scenario files exist on the integration branch (72 entries; one is `__pycache__`).
  - First half of the list, those agents reported running (15): `nostalgia_warp_items`, `na_events`, `na_rooms`, `hololive_watch_blueprint`, `trade_offer_checks`, `stage_group_restriction`, `prod_data`, `soultimate_boost_battle`.
  - Second half of the ran list: `ykw1_skill_book`, `wibwob_orb`, `nostalgia_coin`, `breakfast_coins`, `login_stamp_retro`, `pocket_watch_blueprint`, `maps_playtest_fixes`.
  - So about 56 never ran, including `hololive_unlock_item` and `owner_boost_battle`. Two agents said these "cover" code they touched, but I have no evidence they ran. The merge agent ran 11 of the 15.

### C6. Orchestrating or doing

`[M]`: I did small deterministic steps (worktree creation, `ls`/`grep`/`podman ps`, reading logs, writing the brief and record, committing the record) and resolved the Skills merge by hand with `set_item`. I delegated multi-step investigation, anything touching data tables, and scenario runs. Arguable: reading the crash log and the prompts myself; it saved a round trip but sits close to the line.

### C7. What the first briefings lacked, in the order I learned it `[M]`

1. Isolated ports: from the p1 report when it built its own stack; in the brief after p1.
2. Stop your own containers and revert `docker-compose.yml`: from p5/p6 leftovers.
3. Cost rule and helper README: from the user's complaint about p1's cost.
4. No `--force` / no boss rows in scenarios: from the user's objection during p3.
5. "Established vs guessed": added in the login-crash and playtest-fix briefings.
6. Which worktree holds what: only after the user's lock-bug confusion (the failing check was on a worktree that never had the lock).
7. A port plan per agent: only after the bind error the user pasted.
8. Pre-flight claims need a one-command check before relaying: learned from the prompt-7 and 26-missions errors.

## D. Feedback on the archive and the app

### D1. Sections of the archive's `AGENTS.md`

| Section | Clear? Followed? | Deviation / one-line change |
|---|---|---|
| First | Clear. Followed. | I merged gacha and stamps into one reader. Say how to size readers. |
| Structure | Clear. Followed. | None. |
| Rules | Clear. Followed. | "Standalone prompts" conflicts with stacked branches. State that later fixes do not propagate down the stack. |
| Procedure | Clear. Followed. | None. |
| Re-prompt first | Clear. Followed. | Ask agents to return only scope changes. |
| Sub-agent delegation | Clear. Deviated. | One agent per prompt, not per thread. State the trade-off. |
| Shared context | Clear. Partly followed. | The brief went stale. Add "update it at each phase". |
| Git branches | Clear. Followed. | I added follow-up commits and a few amends. Say which is allowed. |
| Worktrees | Clear. Followed. | The 5th worktree (integration) was my addition. |
| Pauses | Clear. Followed with gaps. | Approvals were sometimes loose. Define what counts. |
| Completion record | Clear. Followed. | It needed an update after the playtest. Add a field for follow-ups. |
| Scripts | Clear. Followed. | I never used them. Say when they are worth using. |
| Plan | Clear. Followed. | A cancelled prompt is not modelled. Add a "cancelled" convention. |

### D2. Pre-flight

- Most useful: contradictions found (101% total, "1st" vs "2nd" slot, unnamed 1% items, missing destinations).
- Cost most: readers asked questions the repo could answer, and one wrong claim reached the user (prompt 7).
- Change: have readers search the repo in their first pass and ask only what it cannot answer.

### D3. Re-prompt first

Five agents changed scope (p4, p7, p8, p10, p11), six did not (p1, p2, p3, p5, p6, p9) `[R]`. The step surfaced the p8 gap; I cannot show it saved tokens `[G]`.

### D4. Seeded flaws

- Caught by pre-flight: 101%, "1st" vs "2nd", unnamed 1% items, Potofeu and Beach pass destinations, "Halloween blue team", "Orquanos" spelling.
- Met only later: the choice crank listing Yo-kai only, the last-column usable flag, the stamp manifest rows, the lock checking decks only.
- Never noticed: two rows sharing `idx` 2057 in the group table.
- Ask or assume: I asked when the repo could not settle it and a wrong guess meant rework; I assumed when `decisions.md` or a doc gave a default. I over-asked early.

### D5. Five things I wanted before starting

1. Which branch or worktree the user tests on, and how to start it.
2. The item-to-image-to-map mapping.
3. The helper-script list and the user's cost expectations.
4. Client constraints already known from device tests: the usable flag, the choice crank is Yo-kai only, stamp assets need manifest rows.
5. A per-prompt acceptance test (what the user checks on the device).

### D6. The eight draft improvements

- **P1 runnable worktrees, user test slot, teardown: agree.** It would have prevented the port clashes and the wrong-worktree confusion.
- **P2 "Before you start" tips with a copy-paste prompt: agree.** Put the cost rule and the helper list there.
- **P3 follow-up prompts: agree.** I improvised them (p3 follow-up, playtest fixes). A formal slot keeps one-commit-per-prompt meaningful.
- **P4 model or effort hint per prompt: agree.** I always chose `sonnet`; p8 and p9 stopped almost immediately.
- **P5 cancelled prompts, no dispatch with a blocking question: agree.** It would have saved two stops.
- **P6 thread notes handed between agents: change.** My brief did this and went stale. Make it append-only with dates.
- **P7 integration-branch check: agree.** The merge found a duplicate manifest id that no single branch showed.
- **P8 richer completion record: agree.** My update needed follow-ups, revisions and device checks.

### D7. Other notes for the authors

- Tell agents which scenarios exist, which are slow, and which are mandatory.
- Linear branch stacks hide cross-branch conflicts until the end; an early integration check would catch them sooner.
- A device-test checklist per prompt would have caught the last-column flag, the choice-crank limit and the manifest problem earlier.

## N. New questions

### N1. What the token figure in a notification measures

Unknown with certainty. Evidence `[R]`:
- p1 grew 203k to 224.5k to 231.0k across resumes, which looks cumulative per agent.
- Tool counts were mixed: p1 went 88 to 111 to 116 (cumulative), but p5 showed 48 then 6 and p7 showed 54 then 4 (look like the last run only). p9 showed 7 then 38.
- The token figure never fell, and a 6-call run cannot cost 134k from scratch, so I read tokens as a cumulative total for the agent and tool counts as inconsistent `[G]`. It is not the context size `[G]`.
- While an agent was still running (p3, p11 interim notifications "waiting on its own background work"): tokens and tool calls rose slowly between notifications (p3: 85.6k, 87.2k, 89.0k, 92.9k with 27, 29, 32, 37 calls). So a running agent shows its running cumulative total `[R]`.

### N2. Biggest single cost per agent

- **p1:** long scenario runs; `na_events` alone took about 6 min each time, and five regressions plus an isolated stack build in the first run `[R]`; then two rework rounds `[R]`.
- **p4:** building the map copy, 24 missions and a scenario that fights 22 bosses `[G]`; plus a git stash mishap it had to recover from `[R]`.
- **Fix: Maps:** investigating a lock failure it could not reproduce, then the dev-account path and scenario `[G]`.
- **Fix: Skills:** diffing three item rows column by column; cheap, with two scenario runs `[R]`.
- **Fix: gacha:** pulling and reading `libSGF.so` with `re_disasm` to find the client's choice-crank rule, plus an isolated stack run `[R]`; the coin rework added a further 4.9 min `[R]`.

### N3. Three changes that would have saved the most tokens and time (in order)

1. Hand each agent the helper list, a port plan and a ready scenario runner up front. About 30-60k tokens and 10-20 min on p1-style prompts `[G]`.
2. Do not dispatch a prompt with a blocking question, and have pre-flight search the repo first. About 150k tokens (p8 and p9 stops plus the first pre-flight pass) `[G]`.
3. Define the scenario policy at the start (own scenario plus `prod_data` per prompt, one full run at the integration step). About 10-20 min per early prompt `[G]`.

### N4. Three changes that would have prevented the most rework or false alarms (in order)

1. A worktree-to-branch table in the brief, with an integration branch from the start. It would have prevented the wrong-worktree lock alarm `[G]`; about 1 agent run of rework.
2. Verify every pre-flight claim with one command before relaying it (missions, scramble count, branch names, port holders, progression). It would have prevented about six false statements `[G]`.
3. Keep the brief current and give each prompt a short device-test checklist built from known client constraints (usable flag, choice crank Yo-kai only, stamp manifest). It would have prevented three playtest bugs `[G]`.

## Could not verify

- My own tokens and cost.
- The exact meaning of the notification figures beyond what N1 says.
- Who started and who stopped the `maps_*` stack.
- Whether any agent ran the archive scripts.
- Whether `hololive_unlock_item` and `owner_boost_battle` ran anywhere.
- Hunk counts of the integration merge.
- Why the `idx` 2057 duplicate exists.
