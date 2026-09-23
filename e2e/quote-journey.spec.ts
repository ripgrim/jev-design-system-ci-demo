import { writeFileSync } from "node:fs"
import { expect, test, type Page, type TestInfo } from "@playwright/test"

test.use({ video: "retain-on-failure" })

type ChoiceAnswer = {
  type: string
  choice?: string
  probabilities?: Record<string, number>
}

async function chooseNextAction(
  page: Page,
  testInfo: TestInfo,
  token: string,
  persona: string,
  goal: string
) {
  const options = await page
    .locator("main [data-journey-action]")
    .evaluateAll((elements) =>
      elements
        .filter((element) => !(element as HTMLButtonElement).disabled)
        .map((element) => ({
          id: element.getAttribute("data-journey-action")!,
          label: element.textContent?.trim() ?? "",
        }))
    )
  if (options.length < 2)
    throw new Error(
      "The page did not offer enough actions for Jev to choose from."
    )

  const screen = await page.locator("main").innerText()
  const criteria = Object.fromEntries(
    options.map((option, index) => [`option_${index + 1}`, option.label])
  )
  const response = await fetch("https://openrouter.ai/api/alpha/decisions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "typesafe/jev-1.13",
      state: `Persona: ${persona}\nGoal: ${goal}\nVisible page:\n${screen}`,
      questions: {
        next_action: {
          type: "choice",
          instructions:
            "Choose the available button that moves this person toward their goal. Use the visible page and the goal, not the option number.",
          criteria,
        },
      },
    }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok)
    throw new Error(`Jev request failed: HTTP ${response.status}`)

  const result = (await response.json()) as {
    answers?: { next_action?: ChoiceAnswer }
  }
  const answer = result.answers?.next_action
  const index = answer?.choice
    ? Number(answer.choice.replace("option_", "")) - 1
    : -1
  const selected = options[index]
  const score = answer?.choice
    ? answer.probabilities?.[answer.choice]
    : undefined
  if (
    answer?.type !== "choice" ||
    !selected ||
    typeof score !== "number" ||
    score < 0.6
  ) {
    throw new Error(
      `Jev could not choose a next action confidently. Answer: ${answer?.choice ?? "none"}`
    )
  }

  await testInfo.attach("journey-step", {
    body: Buffer.from(
      JSON.stringify({
        persona,
        goal,
        options: options.map((option) => option.label),
        selected: selected.label,
        score,
      })
    ),
    contentType: "application/json",
  })
  await page.locator(`main [data-journey-action="${selected.id}"]`).click()
}

test("sales sends a quote and the customer signs it", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000)
  const token = process.env.OPENROUTER_API_KEY
  if (!token)
    throw new Error("OPENROUTER_API_KEY is required for the quote journey.")

  let persona = "sales"
  let stage = "sign in"
  try {
    await page.goto("/quote-demo")
    await page.getByLabel("Email").fill("allie@comp-demo.example")
    await page.getByLabel("Password").fill("demo-only")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(
      page.getByRole("heading", { name: "Quotes", exact: true })
    ).toBeVisible()

    stage = "create quote"
    await chooseNextAction(
      page,
      testInfo,
      token,
      persona,
      "Create and send a $1,200 quote to Jordan."
    )
    await page.getByLabel("Customer email").fill("jordan@northstar.example")
    await page.getByLabel("Amount (USD)").fill("1200")

    stage = "send quote"
    await chooseNextAction(
      page,
      testInfo,
      token,
      persona,
      "Send the completed quote to Jordan."
    )
    await expect(page.getByText("Quote Q-1042")).toBeVisible()
    await expect(page.getByText("Sent", { exact: true })).toBeVisible()

    await page.getByRole("button", { name: "Sign out" }).click()
    persona = "customer"
    stage = "sign in"
    await page.getByLabel("Email").fill("jordan@northstar.example")
    await page.getByLabel("Password").fill("demo-only")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(
      page.getByRole("heading", { name: "Your quotes" })
    ).toBeVisible()

    stage = "open quote"
    await chooseNextAction(
      page,
      testInfo,
      token,
      persona,
      "Open the quote sent to Jordan so it can be signed."
    )
    await expect(
      page.getByRole("heading", { name: "Quote Q-1042" })
    ).toBeVisible()

    stage = "review quote"
    await chooseNextAction(
      page,
      testInfo,
      token,
      persona,
      "Proceed to sign the quote."
    )
    await page.getByLabel("Your full name").fill("Jordan Reyes")
    await page.getByLabel("I confirm this demo quote is correct.").check()

    stage = "sign quote"
    await chooseNextAction(
      page,
      testInfo,
      token,
      persona,
      "Submit the signature for this quote."
    )
    await expect(page.getByText("Signed", { exact: true })).toBeVisible()
    const response = await page.request.get("/api/quote-demo")
    const finalState = (await response.json()) as {
      quote?: { status?: string; signedBy?: string }
    }
    expect(finalState.quote?.status).toBe("signed")
    expect(finalState.quote?.signedBy).toBe("Jordan Reyes")
    await testInfo.attach("journey-result", {
      body: Buffer.from(
        JSON.stringify({
          status: "passed",
          quote: "Q-1042",
          signedBy: "Jordan Reyes",
        })
      ),
      contentType: "application/json",
    })
  } catch (error) {
    const alerts = await page
      .getByRole("alert")
      .allTextContents()
      .catch(() => [])
    const observed = (
      alerts.join(" ") ||
      (
        await page
          .locator("main")
          .innerText()
          .catch(() => "The page did not load.")
      ).slice(0, 300)
    ).trim()
    const runUrl =
      process.env.GITHUB_RUN_ID && process.env.GITHUB_REPOSITORY
        ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : "local Playwright run"
    const report = `# Customer cannot sign quote\n\nPersona: ${persona}\nStep: ${stage}\nExpected: Jordan can sign quote Q-1042.\nObserved: ${observed}\n\nSteps to reproduce:\n1. Sign in as Allie and send Jordan a $1,200 quote.\n2. Sign in as Jordan, open Q-1042, and try to sign it.\n\nRecording, screenshot, and trace: ${runUrl} (journey-failure artifact).\n`
    writeFileSync(testInfo.outputPath("issue-preview.md"), report)
    await testInfo.attach("journey-report", {
      body: Buffer.from(report),
      contentType: "text/markdown",
    })
    await testInfo.attach("journey-result", {
      body: Buffer.from(
        JSON.stringify({ status: "failed", persona, stage, observed })
      ),
      contentType: "application/json",
    })
    throw error
  }
})
