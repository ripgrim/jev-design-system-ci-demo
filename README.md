# Comp design system CI demo

A small React workspace used to test whether UI changes break a design system. It is separate from Comp v3.

The app has People, Policies, and Components screens. The design system defines three button variants: primary for safe forward actions, secondary for cancel or unchanged actions, and danger for actions that remove or archive something.

## What CI checks

- Playwright compares the People screen and archive dialog to approved screenshots. It also checks dialog closing, action spacing, and minimum button height.
- Jev reads the invite and archive dialogs' titles, descriptions, and action labels. It chooses the expected button variant. The test compares those answers with the variants rendered by the app. Jev does not see each button's current style. The ambiguous cancel action uses a fixed assertion instead.

The screenshot is the exact visual check. Jev adds a semantic check when the text of an action changes. Jev accepts text, not images, so it cannot judge pixel-level design fidelity.

## Run locally

Requires Node 22, Docker, and an OpenRouter API key with access to `typesafe/jev-1.13`.

```sh
npm ci
npm run build
npm run dev
```

To run the checks in the same Linux browser image as CI:

```sh
docker run --rm -v "$(pwd):/work" -v comp-jev-demo-node-modules:/work/node_modules -w /work mcr.microsoft.com/playwright:v1.63.0-noble bash -lc "npm ci && npm run build && npm run test:ui"
```

Set `OPENROUTER_API_KEY` in your local shell, then run `npm run test:jev` in that container. To use CI, add it as a repository Actions secret with the same name. Never put it in the repository.

The Jev job runs on pushes to `main` and pull requests from this repository. Fork pull requests do not receive the secret. A contributor who can push a branch to this repository can change code that the secret-bearing job runs, so only trusted contributors should have write access. For an open contribution workflow, keep Jev in a separate trusted workflow.

## Show the regression

The companion pull request changes the archive confirmation button from danger to primary. On that PR, the screenshot and the Jev check should fail. The main branch is the passing baseline. The PR is intentionally left open as a test case.
