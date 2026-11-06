<!-- `./adapt.py --rename` points the badge at your repository. -->
[![OpenSSF Scorecard](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FJulian52575%2FBig-3-Governed-Template%2Fmain%2F.readme-badges%2Fscorecard-badge.json)](.readme-badges/scorecard-results.json)

# Prompt Builder

## Why wastes your credits on expensive models when cheap one can handle the work ?

A local web app that helps you build the cheapest yet most effective prompts for your needs !  

<img width="1265" height="657" alt="image" src="https://github.com/user-attachments/assets/2a5301f9-86b8-4758-86d1-0a3f14b23453" />
<img width="288" height="335" alt="image" src="https://github.com/user-attachments/assets/d6ccf371-87bf-4589-a721-e61105c02a7b" />


A private, local web app that turns a filled-in template into a Markdown
prompt for an AI agent, which you can edit, copy, or open in ChatGPT or
Mistral. The full specification is [`docs/spec.md`](docs/spec.md).

- **One file:** the build is a single self-contained `index.html` (at most
  250 KB, Preact + TypeScript) that opens straight from disk, no server.
- **Light on memory:** no page uses more than 5 MB of JavaScript memory; CI
  measures every page and reports it in the job summary.
- **Private:** a Content Security Policy blocks every network request from
  the page. A prompt leaves the app only when you press *Open in ChatGPT* or
  *Open in Mistral*, after a first-use confirmation.
- **Persistent:** drafts, history, custom templates and output modes live in
  the browser's localStorage. *Settings → Data → Export all* writes a JSON
  backup; *Import* restores it (merge or replace).
- **Accessible:** targets WCAG 2.2 AA (keyboard-only flows, labelled forms,
  error summaries, live announcements, light/dark/high-contrast themes).
- **English or French** interface; prompts are always English. A Retro
  platformer theme and several other game-inspired themes sit next to Light and Dark.

## Use it

Download `prompt-builder.html` from the latest
[release](../../releases) (or run `just build` and take
`frontend/dist/index.html`) and open it in a browser.

1. Pick a template (*Task list* or *Review*, or your own from *Settings*).
2. Fill the form, choose a output mode and source scope where offered.
3. Press **Generate**, edit the prompt on the right if needed.
4. Choose **Bare prompt** or **Re-Prompt Request** (wraps the prompt and asks a
   chatbot to review it), then **Copy**, **Open in ChatGPT** or **Open in
   Mistral**.

Everything stays in this browser. Clearing site data deletes it, and some
browsers key `file://` storage by path, so export before moving or renaming
the file.

## Develop

```bash
nix develop        # enter the dev shell (first run downloads the tools)
just up -d         # Vite dev server with hot reload on http://localhost:5173/
just test          # unit tests (Vitest)
just lint          # oxlint + TypeScript
just build         # frontend/dist/index.html
just e2e           # Playwright + axe-core in Chromium and Firefox (needs Node.js on the host)
just               # list every command
```

`just test`, `lint` and `build` run in a one-off container from the dev
image, so they need no Node.js on the host. Without containers,
`cd frontend && npm ci` and use the `npm run` scripts in
`frontend/package.json`.

| Path | Holds |
| ---- | ----- |
| `frontend/src/core/` | pure logic: renderer, wording, validation, JSON linter, storage, layers, review wrapper and chatbot links (unit-tested) |
| `frontend/src/ui/` | Preact views: Builder, History, Settings (visual template builder + JSON view), dialogs |
| `frontend/csp-hash.ts` | Vite plugin writing the inlined bundle's SHA-256 into the CSP |
| `frontend/e2e/` | Playwright tests against the built file from `file://` |
| `frontend/src/assets/` | Pixelify Sans Latin subset (SIL OFL 1.1, licence alongside) |

## The dev environment

This repository was created from a Nix + Just + rootless Podman template;
the governance and CI below come from it.

- **[Nix](https://nixos.org/)** — `flake.nix` lists the tools, `flake.lock`
  pins them by hash. Everyone (and CI) gets the same binaries; nothing is
  installed globally. See [Nix flakes](https://nixos.wiki/wiki/Flakes).
- **[Just](https://just.systems/man/en/)** — the project's commands, named and
  documented in the `justfile`.
- **Rootless [Podman](https://docs.podman.io/)** + compose — the dev
  container from `docker-compose.yml`, no daemon, no `sudo`.

### Requirements

- [Nix](https://install.determinate.systems/) with flakes enabled.
- **Linux:** `newuidmap`/`newgidmap` (the `uidmap` package) and a
  `/etc/subuid` + `/etc/subgid` entry for your user.
- **macOS:** Podman from the host ([Podman Desktop](https://podman-desktop.io/)
  or `brew install podman`), with `podman machine init && podman machine start`.
- **Windows:** the flake does not run natively. Either
  - **use [WSL 2](https://learn.microsoft.com/windows/wsl/install)**
    (recommended) and follow the Linux steps inside it, with the repo in the
    Linux filesystem (`~/…`, not `/mnt/c/…`); or
  - **skip the flake** and install the tools system-wide:
    [Git for Windows](https://gitforwindows.org/) (its bash runs the
    `justfile` and git hooks), [just](https://just.systems/man/en/packages.html),
    and [Podman Desktop](https://podman-desktop.io/) or
    [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/).
    [Node.js 24](https://nodejs.org/) is optional: the dev container runs its
    own Node; install it only to run `npm` (or `just e2e`) outside it.
    Then run the commands in [What the shell does](#what-the-shell-does)
    yourself. `just` uses Podman, or Docker when Podman is missing.

> **Disk usage:** the Nix store and Podman's image storage grow quietly and
> can reach tens of GB. The shell warns when either exceeds 10 GiB; check with
> `du -sh /nix/store` and `podman system df`, reclaim with
> `nix-collect-garbage -d` and `podman system prune -a`. See the NixOS wiki's
> [Storage optimization](https://wiki.nixos.org/wiki/Storage_optimization)
> for more ways to shrink the Nix store.

Ubuntu in two commands:

```bash
sudo apt install uidmap
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

Optional: [direnv](https://direnv.net/) + [nix-direnv](https://github.com/nix-community/nix-direnv)
and `direnv allow` load the shell automatically on `cd`.

### What the shell does

`nix develop` does the steps below on every entry. Without Nix (Windows
without WSL, or tools installed system-wide), run the command under each
step once from the repo root instead; they are plain bash (Git Bash on
Windows).

1. **Puts the pinned tools on `PATH`**: `just`, `podman`, `podman-compose`,
   `jq`, `openssl`, `curl`, `actionlint`, `shellcheck`,
   `check-jsonschema`, `zizmor`, `pin-github-action` (see `flake.nix` and
   `nix/tools.nix`). Without Nix, install what you use with your package
   manager; to run the stack you only need `just` and Podman (with
   `podman-compose`) or Docker.

2. **Creates `.env`** from `.env.example`, adds variables that are new in
   `.env.example` to an existing `.env`, and replaces every `change-me-*`
   value with a random secret, once. `just` loads `.env` itself
   (`set dotenv-load`).

   ```bash
   [ -e .env ] || cp .env.example .env
   for key in $(sed -nE 's/^([A-Za-z_][A-Za-z0-9_]*)=.*/\1/p' .env.example); do
     grep -qE "^$key=" .env || grep -E "^$key=" .env.example >> .env
   done
   for key in $(sed -nE 's/^([A-Za-z_][A-Za-z0-9_]*)="?change-me-.*/\1/p' .env); do
     sed -i.bak "s|^$key=.*|$key=$(openssl rand -hex 32)|" .env && rm -f .env.bak
   done
   ```

3. **Makes `podman compose` use `podman-compose`**, never a host
   `docker-compose`. Only matters with Podman:

   ```bash
   export PODMAN_COMPOSE_PROVIDER="$(command -v podman-compose)" PODMAN_COMPOSE_WARNING_LOGS=false
   ```

4. **Points Podman at the in-repo config** in `.config/podman/` (crun
   runtime, `docker.io` short names, image policy), changing nothing under
   `/etc` or `~` except a `policy.json` symlink when none exists. Optional
   without Nix: your system's Podman config works too.

   ```bash
   export CONTAINERS_CONF="$PWD/.config/podman/containers.conf"
   export CONTAINERS_REGISTRIES_CONF="$PWD/.config/podman/registries.conf"
   [ -e ~/.config/containers/policy.json ] || {
     mkdir -p ~/.config/containers
     ln -s "$PWD/.config/podman/policy.json" ~/.config/containers/policy.json
   }
   ```

5. **Keeps container storage in `./.containers/`**, or under
   `~/.cache/podman-storage/<project>/` when the repo sits on a network
   filesystem (WSL2 drvfs, NFS, …); override with `PODMAN_STORAGE_DIR`.
   Optional without Nix: Podman's default storage works too. To keep it in
   the repo:

   ```bash
   mkdir -p .containers
   printf '[storage]\ndriver = "overlay"\nrunroot = "%s/run"\ngraphroot = "%s/storage"\n' \
     "$PWD/.containers" "$PWD/.containers" > .config/podman/storage.conf
   export CONTAINERS_STORAGE_CONF="$PWD/.config/podman/storage.conf"
   ```

6. **Exposes a Docker-compatible API socket** as `DOCKER_HOST` /
   `DOCKER_SOCK`, for tools that expect one. Skip it with
   `PODMAN_NO_SOCKET=1`. Without Nix, Docker already provides one; with
   Podman, enable its socket the way your system documents
   ([Podman socket](https://docs.podman.io/en/latest/markdown/podman-system-service.1.html)).

7. **Enables the git hooks** in `.githooks/` (Conventional Commit, signed
   and signed-off commits — see [CONTRIBUTING.md](CONTRIBUTING.md)):

   ```bash
   git config --local core.hooksPath .githooks
   ```

### Just commands

| command | purpose |
| ------- | ------- |
| `just up [-d]` | start the dev server (`-d` recommended: Ctrl-C on an attached `podman-compose up` can leave processes behind) |
| `just build` / `just test` / `just lint` | build the single file / unit tests / oxlint + TypeScript, in a one-off container |
| `just e2e` | build, then Playwright + axe-core in Chromium and Firefox (host Node.js; `npm run e2e:install` once) |
| `just down` | stop the stack, keep volumes |
| `just ps` / `just logs [svc]` | status / follow logs |
| `just exec <svc> <cmd…>` / `just sh <svc>` / `just attach <svc>` | run a command / shell / attach to a running service |
| `just rebuild <svc>` | rebuild one service from scratch, the rest keep running |
| `just rm` | stop the stack and delete its images (next `up` rebuilds) |
| `just nuke` | also delete volumes (asks first; refuses on `main` or a release tag unless `NUKE_ANYWAY=1`) |
| `just lint-workflows` | actionlint + zizmor + schema check, as CI does |

## Governance

The rules (issue → branch → PR, Conventional Commits, required checks) are in
**[CONTRIBUTING.md](CONTRIBUTING.md)**. They are enforced by repository
settings that one script applies, using an authenticated [`gh`](https://cli.github.com/):

```bash
scripts/apply-governance.sh [owner/name]
```

It is safe to re-run, and sets:

- **Branch ruleset** from `.github/rulesets/main.json`: PR with 1 approval
  (code owners when a `CODEOWNERS` exists), resolved threads, the single
  required check `ci-required` on an up-to-date branch, linear history, no force-push or deletion, no bypass. It can also be
  imported by hand: *Settings → Rules → Rulesets → Import*.
  See [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).
- **Merges:** squash only, PR title as the commit, branches auto-deleted,
  auto-merge allowed.
- **Actions:** read-only default `GITHUB_TOKEN`.
- **Security** (best-effort, depends on your plan): Dependabot alerts and
  fixes, secret scanning + push protection, private vulnerability reporting.
- The issue labels used by the issue forms.

To also *enforce* signed commits on GitHub, add `{ "type": "required_signatures" }`
to the ruleset's `rules` and re-run. For an organisation, also require 2FA and
approval for fork PR workflows.

## CI and automation

All workflows follow the same hardening: actions pinned to a commit SHA
(`# vX.Y.Z` comment, maintained with `pin-github-action`), least-privilege
`permissions:`, `timeout-minutes`, `step-security/harden-runner`,
`persist-credentials: false`, and no `${{ … }}` inside `run:`. Background:
[GitHub's security hardening guide](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions).

| Workflow | Does |
| -------- | ---- |
| `ci.yml` | flake evaluation; app lint, typecheck, unit tests and build (one file of at most 250 KB, uploaded as an artifact); Playwright + axe-core in Chromium and Firefox; a 5 MB per-page memory budget reported in the job summary; hadolint, compose check, actionlint, zizmor, [osv-scanner](https://google.github.io/osv-scanner/) dependency audit; boots the dev container; all gated by the single `ci-required` job |
| `ci-sast.yml` | [CodeQL](https://codeql.github.com/docs/) always, [SonarQube Cloud](https://docs.sonarsource.com/sonarqube-cloud/) when its token is set; see [`.sast/README.md`](.sast/README.md) |
| `check-conventional-commit-pr-title.yml` | PR title is a Conventional Commit (advisory, not required) |
| `openssf-scorecard.yml` | weekly [OpenSSF Scorecard](https://scorecard.dev/); results go to the `openssf-update` branch and an issue with a one-click PR link. The README badge reads the merged result from `main`. |
| `release-please.yml` | keeps a [release-please](https://github.com/googleapis/release-please) Release PR open; merging it tags and publishes the release |
| `release-build.yml` | on a published release (or by hand for an existing tag): tests and builds the app, uploads `prompt-builder.html` to the release |
| `make-pr-draft.yml` | opt-in (`MAKE_PR_DRAFT=true` variable): new PRs start as drafts |
| `notify-discord-review-requested.yml` | opt-in (`DISCORD_WEBHOOK_URL` secret): posts review requests to a Discord channel |

`.github/actions/setup-devshell` installs Nix and caches the store in the
GitHub Actions cache (no account needed). For a cache shared with your
machine, swap it for [Cachix](https://docs.cachix.org/continuous-integration-setup/github-actions).

## Layout

```
flake.nix, flake.lock, nix/            dev shell; one file per pinned tool
justfile                               project commands
docker-compose.yml                     Vite dev server for frontend/
frontend/                              the app: Preact + TypeScript + Vite (Vitest, Playwright, oxlint)
docs/spec.md                           the Prompt Builder specification
.config/podman/                        rootless Podman config (storage.conf is generated)
.env.example                           template for .env
.githooks/                             commit-msg checks
.github/workflows/, .github/actions/   CI, release and audit workflows
.github/rulesets/main.json             branch ruleset
.github/ISSUE_TEMPLATE/, PULL_REQUEST_TEMPLATE.md
.sast/                                 SAST config, report scripts, committed reports, OpenSSF summary
scripts/apply-governance.sh            applies the repository settings
release-please-config.json, .release-please-manifest.json
docs/troubleshooting/                  incident log, one subfolder per area
adapt.py, README-ADAPT.md              guided adaptation of a new repository
CONTRIBUTING.md, AGENTS.md
```

## Customising

- **Tools:** every dev-shell tool except the Podman stack is pinned in its
  own `nix/<tool>.nix` (listed in `nix/tools.nix`) to its latest **prebuilt**
  release, so `nix develop` only downloads: official binaries where upstream
  publishes them, PyPI wheels for Python tools, else the newest
  `cache.nixos.org` build from nixpkgs-unstable (openssl, curl). Each file
  says how to bump it. The Podman stack follows nixpkgs: bump it by editing
  `nixpkgs.url`, then `nix flake update`.
- **Dev container:** `frontend/Dev.Dockerfile` installs dependencies;
  the source is bind-mounted, with `node_modules` in a named volume. After
  changing `package.json` or the Dockerfile, run `just rebuild frontend`.

## AI usage disclosure

Parts of this repository were drafted with Claude Code. Every AI-assisted
change is reviewed and tested by a human, and carries a `Co-Authored-By:`
trailer naming the assistant.

---

© 2026 Julian Bottiglione &lt;julian.bottiglione@epitech.eu&gt;
