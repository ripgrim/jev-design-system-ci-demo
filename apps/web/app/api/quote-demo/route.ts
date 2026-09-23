import { NextRequest, NextResponse } from "next/server"

type Role = "sales" | "customer"
type Quote = {
  id: string
  customerEmail: string
  amount: number
  status: "sent" | "signed"
  signedBy?: string
  signedAt?: string
}

const accounts = {
  "allie@comp-demo.example": { password: "demo-only", role: "sales" as Role },
  "jordan@northstar.example": {
    password: "demo-only",
    role: "customer" as Role,
  },
}

const shared = globalThis as typeof globalThis & {
  quoteDemo?: { quote: Quote | null }
}
const state = (shared.quoteDemo ??= { quote: null })

function visibleQuote(role: Role | null) {
  if (role === "sales") return state.quote
  if (
    role === "customer" &&
    state.quote?.customerEmail === "jordan@northstar.example"
  ) {
    return state.quote
  }
  return null
}

function roleFrom(request: NextRequest): Role | null {
  const value = request.cookies.get("quote-demo-session")?.value
  return value === "sales" || value === "customer" ? value : null
}

function snapshot(role: Role | null) {
  return { role, quote: visibleQuote(role) }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(snapshot(roleFrom(request)))
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as Record<string, unknown>
  const role = roleFrom(request)

  if (input.action === "sign_in") {
    const email = String(input.email ?? "")
      .trim()
      .toLowerCase()
    const account = accounts[email as keyof typeof accounts]
    if (!account || account.password !== input.password) {
      return NextResponse.json(
        { error: "That email or password did not match." },
        { status: 401 }
      )
    }
    const response = NextResponse.json(snapshot(account.role))
    response.cookies.set("quote-demo-session", account.role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })
    return response
  }

  if (input.action === "sign_out") {
    const response = NextResponse.json(snapshot(null))
    response.cookies.delete("quote-demo-session")
    return response
  }

  if (input.action === "send_quote" && role === "sales") {
    const customerEmail = String(input.customerEmail ?? "")
      .trim()
      .toLowerCase()
    const amount = Number(input.amount)
    if (
      customerEmail !== "jordan@northstar.example" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Enter Jordan's email and a valid amount." },
        { status: 400 }
      )
    }
    state.quote = { id: "Q-1042", customerEmail, amount, status: "sent" }
    return NextResponse.json(snapshot(role))
  }

  if (
    input.action === "sign_quote" &&
    role === "customer" &&
    visibleQuote(role)?.status === "sent"
  ) {
    const signatureName = String(input.signatureName ?? "").trim()
    if (!signatureName || input.confirmed !== true) {
      return NextResponse.json(
        { error: "Enter your name and confirm the quote." },
        { status: 400 }
      )
    }
    if (process.env.QUOTE_DEMO_BREAK_SIGNING === "1") {
      return NextResponse.json(
        { error: "Signing is unavailable right now." },
        { status: 503 }
      )
    }
    state.quote = {
      ...state.quote!,
      status: "signed",
      signedBy: signatureName,
      signedAt: new Date().toISOString(),
    }
    return NextResponse.json(snapshot(role))
  }

  return NextResponse.json(
    { error: "This action is not available." },
    { status: 403 }
  )
}
