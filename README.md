# Comp design system CI demo

A small Next.js monorepo for testing design-system regressions in CI. It is separate from Comp v3.

The UI comes from the shadcn preset `b2BVC6xQR`: Nova style, neutral surfaces, emerald accent, Geist, Tabler icons, and medium radius. The app uses the generated button, dialog, tabs, input, and badge components from `packages/ui`.

## Run it

Requires Bun 1.3.2.

```sh
bun install --frozen-lockfile
bun run dev
```

The Next app is in `apps/web`. To run the checks locally, build it first:

```sh
bun run build
bun run test:ui
OPENROUTER_API_KEY=your-key bun run test:jev
```

CI runs the same checks in the pinned Playwright Linux image. It stores `OPENROUTER_API_KEY` as a GitHub Actions secret. The key is never committed.

## What the checks cover

- Playwright compares the People screen, access dialog, and archive dialog to approved screenshots. It also checks dialog closing, action spacing, button height, and the access change.
- Jev reads the Add user and Change Jordan's access dialogs, then chooses a button variant. The access button says "Confirm change," so Jev needs the dialog text to know it removes access. It does not see the current style. CI shows the text, answer, and rendered variant together.

Jev gets text, so it cannot inspect the screenshot. The screenshot test handles visual changes.

The companion draft PR changes the access confirmation from `destructive` to `default`. Both jobs should fail on that PR while `main` stays green. Keep the PR open as a test case.

The secret-bearing Jev job runs only for pushes to `main` and pull requests from this repository. A contributor who can push a branch here can change code that the job runs, so only trusted contributors should have write access. An open contribution workflow needs a separate trusted workflow for Jev.
