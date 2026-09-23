# Demo design system

Source: shadcn preset `b2BVC6xQR`. The generated tokens live in `packages/ui/src/styles/globals.css`; the button variants live in `packages/ui/src/components/button.tsx`.

| Button variant | Use |
| --- | --- |
| `default` | Safe forward action, such as sending an invite |
| `outline` | Cancel or leave the current state unchanged |
| `destructive` | Remove, archive, delete, or revoke something |

The archive confirmation is the regression example. Its action must use `destructive` even if the button label changes. The generated button exposes its variant through `data-variant` so the CI test can compare it with Jev's answer.
