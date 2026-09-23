import { expect, test, type Locator } from '@playwright/test';

type JevAnswer = {
  type: string;
  choice?: string;
  probabilities?: Record<string, number>;
};

async function expectedVariant(token: string, state: string) {
  // The model sees the words, never the current style. Code compares its answer to the rendered component.
  const response = await fetch('https://openrouter.ai/api/alpha/decisions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'typesafe/jev-1.13',
      state,
      questions: {
        button_variant: {
          type: 'choice',
          instructions: 'Which design-system button variant fits this action? Judge what happens when the button is clicked, not its current color or styling.',
          criteria: {
            primary: 'Confirms a safe, constructive action such as creating, saving, or inviting.',
            secondary: 'Cancels, goes back, or leaves the current state unchanged.',
            danger: 'Removes, archives, deletes, or revokes something.',
          },
        },
      },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`Jev request failed: HTTP ${response.status}`);
  const result = await response.json() as { answers?: { button_variant?: JevAnswer } };
  const answer = result.answers?.button_variant;
  if (answer?.type !== 'choice' || !answer.choice || !answer.probabilities) {
    throw new Error(`Unexpected Jev answer: ${JSON.stringify(result)}`);
  }
  const probability = answer.probabilities[answer.choice];
  if (typeof probability !== 'number' || probability < 0.7) {
    throw new Error(`Jev answer is too uncertain: ${answer.choice} (${probability})`);
  }
  return { variant: answer.choice, probability };
}

async function checkAction(token: string, dialog: Locator, action: Locator) {
  const title = await dialog.locator('h2').innerText();
  const description = await dialog.locator('p').innerText();
  const label = await action.innerText();
  const actualVariant = await action.getAttribute('data-variant');
  const state = `Dialog: ${title}\nDescription: ${description}\nAction button: ${label}`;
  const answer = await expectedVariant(token, state);
  console.log(`${label}: Jev ${answer.variant} (${Math.round(answer.probability * 100)}%); rendered ${actualVariant}`);
  expect(actualVariant, `${label} should use the ${answer.variant} variant`).toBe(answer.variant);
}

test('dialog actions use the design-system variants Jev expects', async ({ page }) => {
  const token = process.env.OPENROUTER_API_KEY;
  if (!token) throw new Error('OPENROUTER_API_KEY is required for the Jev check.');

  await page.goto('/');
  await page.getByRole('button', { name: 'Add user' }).click();
  await checkAction(token, page.getByRole('dialog'), page.getByRole('button', { name: 'Send invite' }));
  await page.getByRole('button', { name: 'Close dialog' }).click();

  await page.getByRole('button', { name: 'Policies', exact: true }).click();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(page.getByRole('button', { name: 'Keep policy' })).toHaveAttribute('data-variant', 'secondary');
  await checkAction(token, dialog, page.getByTestId('archive-confirm'));
});
