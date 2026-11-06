# Generated Prompt

````markdown
Write all of your replies to me in English. Keep code, identifiers and file contents in their original language.

Research the goal, context, and sources. Find and combine the evidence needed to answer the question.

## Goal
**Answer mode:** Write an hello world route in the current backend, and make it a serverless function running on the user's google cloud

## Sources
No sources are listed. You may search for sources; cite each one you use.

## Effort
This takes priority over conflicting reporting instructions above.

Research long and solid. Act like a lawyer closing a case. For a bug, treat the bug as the crime: identify its root cause, or how it could occur, from evidence. For a question, a topic to teach or a specification, treat the rules as the law: find and combine the applicable rules into one argument.

Output, in this order: Verdict (one sentence); Evidence (numbered exhibits, each cited by file and line or by source and section); Argument (step by step from exhibits to verdict, marking each step as fact or inference); Remedy (the change for a bug, the practical answer for a question, the specification or lesson for the others); Grounds for appeal (what would overturn the verdict). State doubts only under Grounds for appeal. Do not offer alternatives or add a preamble. If the evidence cannot support a verdict, answer "Case dismissed for insufficient evidence" and list the missing exhibits. Never invent citations.

Answer the question directly. Cite supporting files and sources, and identify any evidence needed to qualify the answer.

## Output mode
This takes priority over conflicting reporting instructions above.

Answer with maximum brevity. Guide me to the task with steps and trust me to understand and research the details; do not explain what I can look up myself.

Reply with exactly this structure and nothing else (no intro, conclusion, alternatives or pleasantries):
- First line: `TLDR:` and a one-sentence restatement of the task, ending with `Doable in n steps.` where n is the number of steps.
- Then a blank line and `@=@=@ TLDR Start @=@=@`.
- Each step is a numbered title, `# 1. Title`, `# 2. Title` and so on, one blank line above it, then very short extra information. Skip the extra information when the title is enough.
- Under a step, bullets may use `- **NOTE:**` for a useful hint, `- **WARN:**` for a risk I can accept, or `- **ERROR:**` for something I must not do. Keep each to one short message.
- Close with `@=@=@ TLDR End @=@=@`.
- After the End marker, add only the lines that apply, each one short and starting with its bold label: `**Assumed:**` for anything you guessed, `**Check:**` for a quick way to verify the result, and `**Confidence:**` only when you are not confident, naming what is unverified.
- Beyond that, only add what is critical to the integrity of the project (e.g. O(n^2) or worse complexity, security risks, irreversible file deletion), as a WARN or ERROR bullet.

Example, for "How do I clean my build and reinstall dependencies?":
```
TLDR: You want to clean a project's build artifacts and reinstall its dependencies. Doable in 3 steps.

@=@=@ TLDR Start @=@=@

# 1. Remove the build output

Run `rm -rf dist node_modules`.

- **WARN:** `rm -rf` is irreversible, and any uncommitted file inside those folders is lost.
- **ERROR:** Never run it from `/` or with an unset variable, e.g. `rm -rf $DIR/`.

# 2. Reinstall the dependencies

Run `npm install`.

- **WARN:** Without a lockfile, versions can change. Use `npm ci` to keep them fixed.

# 3. Rebuild

Run `npm run build`.

@=@=@ TLDR End @=@=@

**Assumed:** npm project with a lockfile.
**Check:** `npm test` passes.
**Confidence:** medium, the build script name is unverified.
```


Make no mistakes
````

# AI Output
##### Claude Sonnet 5.5

````markdown
TLDR: You want a hello-world route in the backend, deployed as a serverless function on your Google Cloud. Doable in 4 steps.

@=@=@ TLDR Start @=@=@

1. Review the code already in your working tree

The route and the function already exist, uncommitted.
- backend/src/app.js has GET /hello returning { message: "Hello, world!" }.
- backend/spec/app.spec.js has a matching test.
- backend/functions/hello/index.js and package.json define the HTTP function hello.
- NOTE: Run cd backend/functions/hello && npm install first. The folder has a package-lock.json, so use npm ci if you want fixed versions.
- NOTE: Run cd backend && npm test to check the Express route.

2. Test the function locally

Run npx functions-framework --target=hello --port=8081 in backend/functions/hello, then curl localhost:8081.

3. Install and authenticate gcloud

gcloud is not installed here. Run nix-shell -p google-cloud-sdk --run "gcloud auth login".
- Then set the project: gcloud config set project <PROJECT_ID>.
- Enable the APIs: gcloud services enable cloudfunctions.googleapis.com run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com.
- NOTE: auth login is interactive. Type it as ! nix-shell -p google-cloud-sdk --run "gcloud auth login" so it runs in this session.

4. Deploy and call it

From backend/functions/hello, run gcloud functions deploy hello --gen2 --runtime=nodejs22 --region=<REGION> --trigger-http --entry-point=hello --source=..
- Then run curl $(gcloud functions describe hello --gen2 --region=<REGION> --format='value(serviceConfig.uri)').
- WARN: Add --allow-unauthenticated only if you want the function public. Without it you get 403 unless you send an identity token.
- WARN: Deploying incurs Cloud Build and Cloud Run costs.

@=@=@ TLDR End @=@=@

Assumed: <PROJECT_ID> and <REGION> are yours to choose. The nodejs22 runtime is a guess, so check the runtimes your project supports. I did not check infra/ for an existing serverless setup or convention. I did not run or deploy anything.
Check: curl <function-uri> returns {"message":"Hello, world!"}.
Confidence: medium. The gcloud flags come from memory and I did not check them against the current docs.
````
