"use client"

import Link from "next/link"
import { useEffect, useState, type FormEvent } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

type Quote = {
  id: string
  customerEmail: string
  amount: number
  status: "sent" | "signed"
  signedBy?: string
  signedAt?: string
}
type Snapshot = { role: "sales" | "customer" | null; quote: Quote | null }
type Screen = "list" | "new" | "quote" | "sign" | "account"

export function QuoteDemo() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [screen, setScreen] = useState<Screen>("list")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [signatureName, setSignatureName] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/quote-demo", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: Snapshot) => setSnapshot(data))
      .catch(() => setError("Could not load the quote demo."))
  }, [])

  async function act(
    action: string,
    values: Record<string, string | boolean> = {}
  ) {
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/quote-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...values }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? "That did not work. Try again.")
        return false
      }
      setSnapshot(data as Snapshot)
      return true
    } catch {
      setError("Could not reach the server. Try again.")
      return false
    } finally {
      setBusy(false)
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await act("sign_in", { email, password })) setScreen("list")
  }

  async function sendQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await act("send_quote", { customerEmail, amount })) setScreen("list")
  }

  async function signQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await act("sign_quote", { signatureName, confirmed }))
      setScreen("quote")
  }

  const role = snapshot?.role
  const quote = snapshot?.quote ?? null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-5 sm:px-8">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="font-semibold">
            Comp
          </Link>
          <span className="text-muted-foreground">/</span>
          <span>Quote demo</span>
        </div>
        {role && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {role === "sales" ? "Allie, sales" : "Jordan, customer"}
            </span>
            <Button
              variant="outline"
              onClick={async () => {
                if (await act("sign_out")) setScreen("list")
              }}
              disabled={busy}
            >
              Sign out
            </Button>
          </div>
        )}
      </header>
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        {!snapshot && !error && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}

        {snapshot && !role && (
          <section className="max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use a seeded demo account.
            </p>
            <form onSubmit={signIn} className="mt-7 space-y-4">
              <div>
                <label htmlFor="sign-in-email" className="mb-2 block text-sm">
                  Email
                </label>
                <Input
                  id="sign-in-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="sign-in-password"
                  className="mb-2 block text-sm"
                >
                  Password
                </label>
                <Input
                  id="sign-in-password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={busy}>
                Sign in
              </Button>
            </form>
            <p className="mt-6 text-xs text-muted-foreground">
              Sales: allie@comp-demo.example · Customer:
              jordan@northstar.example
              <br />
              Password for both: demo-only
            </p>
          </section>
        )}

        {role && screen === "account" && (
          <section>
            <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {role === "sales" ? "Allie" : "Jordan"}.
            </p>
            <Button
              className="mt-6"
              variant="outline"
              onClick={() => setScreen("list")}
            >
              Back to quotes
            </Button>
          </section>
        )}

        {role === "sales" && screen === "list" && (
          <section>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Quotes
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send a quote for Jordan to sign.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  data-journey-action="account"
                  onClick={() => setScreen("account")}
                >
                  Account
                </Button>
                <Button
                  data-journey-action="new-quote"
                  onClick={() => setScreen("new")}
                >
                  New quote
                </Button>
              </div>
            </div>
            <QuoteList quote={quote} onOpen={() => setScreen("quote")} />
          </section>
        )}

        {role === "sales" && screen === "new" && (
          <section className="max-w-md">
            <h1 className="text-2xl font-semibold tracking-tight">New quote</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Jordan will see it in their account.
            </p>
            <form onSubmit={sendQuote} className="mt-7 space-y-4">
              <div>
                <label htmlFor="customer-email" className="mb-2 block text-sm">
                  Customer email
                </label>
                <Input
                  id="customer-email"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="quote-amount" className="mb-2 block text-sm">
                  Amount (USD)
                </label>
                <Input
                  id="quote-amount"
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  data-journey-action="cancel"
                  onClick={() => setScreen("list")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-journey-action="send-quote"
                  disabled={busy}
                >
                  Send quote
                </Button>
              </div>
            </form>
          </section>
        )}

        {role === "customer" && screen === "list" && (
          <section>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Your quotes
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review quotes sent to you.
                </p>
              </div>
              <Button
                variant="outline"
                data-journey-action="account"
                onClick={() => setScreen("account")}
              >
                Account
              </Button>
            </div>
            <QuoteList quote={quote} onOpen={() => setScreen("quote")} />
          </section>
        )}

        {role && screen === "quote" && quote && (
          <section>
            <h1 className="text-2xl font-semibold tracking-tight">
              Quote {quote.id}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sent to {quote.customerEmail}
            </p>
            <div className="mt-7 rounded-xl border border-border p-5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span>Amount</span>
                <strong>${quote.amount.toLocaleString()}</strong>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span>Status</span>
                <Badge variant="secondary">
                  {quote.status === "signed" ? "Signed" : "Sent"}
                </Badge>
              </div>
              {quote.signedBy && (
                <p className="mt-4 text-muted-foreground">
                  Signed by {quote.signedBy}
                </p>
              )}
            </div>
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                data-journey-action="back"
                onClick={() => setScreen("list")}
              >
                Back to quotes
              </Button>
              {role === "customer" && quote.status === "sent" && (
                <Button
                  data-journey-action="review-and-sign"
                  onClick={() => setScreen("sign")}
                >
                  Review and sign
                </Button>
              )}
            </div>
          </section>
        )}

        {role === "customer" && screen === "sign" && quote && (
          <section className="max-w-md">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign quote {quote.id}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm the ${quote.amount.toLocaleString()} quote sent to{" "}
              {quote.customerEmail}.
            </p>
            <form onSubmit={signQuote} className="mt-7 space-y-4">
              <div>
                <label htmlFor="signature-name" className="mb-2 block text-sm">
                  Your full name
                </label>
                <Input
                  id="signature-name"
                  required
                  value={signatureName}
                  onChange={(event) => setSignatureName(event.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                I confirm this demo quote is correct.
              </label>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  data-journey-action="back"
                  onClick={() => setScreen("quote")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  data-journey-action="sign-quote"
                  disabled={busy}
                >
                  Sign quote
                </Button>
              </div>
            </form>
          </section>
        )}

        {error && (
          <p role="alert" className="mt-5 text-sm text-destructive">
            {error}
          </p>
        )}
      </main>
    </div>
  )
}

function QuoteList({
  quote,
  onOpen,
}: {
  quote: Quote | null
  onOpen: () => void
}) {
  return (
    <div className="mt-7 overflow-hidden rounded-xl border border-border">
      {!quote ? (
        <p className="p-5 text-sm text-muted-foreground">No quotes yet.</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 text-sm">
          <div>
            <strong className="font-medium">Quote {quote.id}</strong>
            <p className="mt-1 text-muted-foreground">
              {quote.customerEmail} · ${quote.amount.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {quote.status === "signed" ? "Signed" : "Sent"}
            </Badge>
            <Button
              variant="outline"
              data-journey-action="open-quote"
              onClick={onOpen}
            >
              Open quote
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
