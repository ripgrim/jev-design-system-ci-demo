"use client"

import Link from "next/link"
import { useState } from "react"
import {
  IconArchive,
  IconFileText,
  IconLayoutGrid,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

type Section = "people" | "policies" | "components"
const people = [
  {
    initials: "MC",
    name: "Maya Chen",
    email: "maya@northstar.example",
    role: "Admin",
    status: "Active",
  },
  {
    initials: "JR",
    name: "Jordan Reyes",
    email: "jordan@northstar.example",
    role: "Member",
    status: "Active",
  },
  {
    initials: "AP",
    name: "Avery Patel",
    email: "avery@northstar.example",
    role: "Member",
    status: "Invited",
  },
]
const navigation = [
  { id: "people" as const, label: "People", icon: IconUsers },
  { id: "policies" as const, label: "Policies", icon: IconFileText },
  { id: "components" as const, label: "Components", icon: IconLayoutGrid },
]

export function Dashboard() {
  const [section, setSection] = useState<Section>("people")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [accessOpen, setAccessOpen] = useState(false)
  const [accessDisabled, setAccessDisabled] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archived, setArchived] = useState(false)
  const [email, setEmail] = useState("")
  const [notice, setNotice] = useState("")
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-5 max-sm:w-16 max-sm:px-2">
        <div className="flex items-center gap-2 px-3 text-sm font-semibold max-sm:justify-center max-sm:px-0">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
            C
          </span>
          <span className="max-sm:hidden">Comp</span>
        </div>
        <nav aria-label="Main navigation" className="mt-9 grid gap-1">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              aria-current={section === id ? "page" : undefined}
              aria-label={label}
              className={`flex h-9 items-center gap-3 rounded-lg px-3 text-left text-sm max-sm:justify-center max-sm:px-0 ${section === id ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"}`}
            >
              <Icon className="size-4 shrink-0" stroke={1.7} />
              <span className="max-sm:hidden">{label}</span>
            </button>
          ))}
          <Link
            href="/quote-demo"
            className="flex h-9 items-center gap-3 rounded-lg px-3 text-left text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground max-sm:justify-center max-sm:px-0"
            aria-label="Quote journey"
          >
            <IconFileText className="size-4 shrink-0" stroke={1.7} />
            <span className="max-sm:hidden">Quote journey</span>
          </Link>
        </nav>
        <div className="mt-auto flex items-center gap-2 px-3 text-xs text-muted-foreground max-sm:justify-center max-sm:px-0">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-foreground">
            MC
          </span>
          <span className="max-sm:hidden">Northstar Labs</span>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center justify-between border-b border-border px-8 text-xs text-muted-foreground max-sm:px-4">
          <span>Workspace</span>
          <span>Maya Chen</span>
        </header>
        <main className="mx-auto w-full max-w-5xl px-10 py-12 max-sm:px-5 max-sm:py-8">
          {section === "people" && (
            <>
              <Heading
                title="People"
                description="Manage your team and invitations."
              >
                <div className="flex flex-wrap justify-end gap-2 max-sm:justify-start">
                  {!accessDisabled && (
                    <Button variant="outline" onClick={() => setAccessOpen(true)}>
                      Change Jordan&apos;s access
                    </Button>
                  )}
                  <Button onClick={() => setInviteOpen(true)}>
                    <IconPlus data-icon="inline-start" />
                    Add user
                  </Button>
                </div>
              </Heading>
              <Tabs defaultValue="all">
                <TabsList variant="line" className="mb-5">
                  <TabsTrigger value="all">All people</TabsTrigger>
                  <TabsTrigger value="invited">Invited</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <PeopleTable
                    rows={people.map((person) =>
                      person.name === "Jordan Reyes" && accessDisabled
                        ? { ...person, status: "Disabled" }
                        : person
                    )}
                  />
                </TabsContent>
                <TabsContent value="invited">
                  <PeopleTable
                    rows={people.filter(
                      (person) => person.status === "Invited"
                    )}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
          {section === "policies" && (
            <>
              <Heading
                title="Policies"
                description="Review and manage your company policies."
              >
                <Button>Create policy</Button>
              </Heading>
              <div className="space-y-3">
                <PolicyRow
                  title="Access policy"
                  description="How employees get and keep access to company systems."
                  updated="September 18, 2026"
                >
                  {archived ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setArchiveOpen(true)}
                    >
                      <IconArchive data-icon="inline-start" />
                      Archive
                    </Button>
                  )}
                </PolicyRow>
                <PolicyRow
                  title="Device policy"
                  description="Requirements for laptops and mobile devices."
                  updated="September 12, 2026"
                >
                  <Badge variant="secondary">Published</Badge>
                </PolicyRow>
              </div>
            </>
          )}
          {section === "components" && (
            <>
              <Heading
                title="Components"
                description="Controls used in this demo."
              />
              <section className="mb-3 rounded-xl border border-border p-5">
                <h2 className="text-sm font-medium">Buttons</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use destructive for actions that remove something.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </section>
              <section className="rounded-xl border border-border p-5">
                <h2 className="text-sm font-medium">Input</h2>
                <div className="mt-5 max-w-xs">
                  <label htmlFor="sample-email" className="mb-2 block text-sm">
                    Email
                  </label>
                  <Input
                    id="sample-email"
                    type="email"
                    placeholder="name@company.com"
                  />
                </div>
              </section>
            </>
          )}
        </main>
      </div>
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Invite someone to your workspace.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setNotice(`Invitation ready for ${email}`)
              setInviteOpen(false)
            }}
          >
            <div className="mt-2">
              <label htmlFor="invite-email" className="mb-2 block text-sm">
                Email address
              </label>
              <Input
                id="invite-email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <DialogFooter className="-mx-0 mt-6 -mb-0 border-0 bg-transparent p-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send invite</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={accessOpen} onOpenChange={setAccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Jordan&apos;s access</DialogTitle>
            <DialogDescription>
              Jordan will no longer be able to sign in or open company documents. Their work stays saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-0 mt-4 -mb-0 border-0 bg-transparent p-0">
            <Button variant="outline" onClick={() => setAccessOpen(false)}>
              Cancel
            </Button>
            <Button
              data-testid="access-confirm"
              variant="destructive"
              onClick={() => {
                setAccessDisabled(true)
                setAccessOpen(false)
              }}
            >
              Confirm change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive access policy</DialogTitle>
            <DialogDescription>
              This removes it from active policies. You can restore it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-0 mt-4 -mb-0 border-0 bg-transparent p-0">
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>
              Keep policy
            </Button>
            <Button
              data-testid="archive-confirm"
              variant="destructive"
              onClick={() => {
                setArchived(true)
                setArchiveOpen(false)
              }}
            >
              Archive policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {notice && (
        <div
          role="status"
          className="fixed right-5 bottom-5 rounded-lg bg-foreground px-3 py-2 text-xs text-background"
        >
          {notice}
        </div>
      )}
    </div>
  )
}

function Heading({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 max-sm:flex-col">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

function PeopleTable({ rows }: { rows: typeof people }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-[minmax(0,1fr)_110px_90px] gap-3 bg-muted/40 px-5 py-3 text-xs text-muted-foreground max-sm:grid-cols-[minmax(0,1fr)_75px] max-sm:px-3">
        <span>Person</span>
        <span>Role</span>
        <span className="max-sm:hidden">Status</span>
      </div>
      {rows.map((person) => (
        <div
          key={person.email}
          className="grid min-h-18 grid-cols-[minmax(0,1fr)_110px_90px] items-center gap-3 border-t border-border px-5 text-sm max-sm:grid-cols-[minmax(0,1fr)_75px] max-sm:px-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {person.initials}
            </span>
            <span className="min-w-0">
              <strong className="block truncate font-medium">
                {person.name}
              </strong>
              <small className="block truncate text-xs text-muted-foreground">
                {person.email}
              </small>
            </span>
          </div>
          <span className="text-muted-foreground">{person.role}</span>
          <Badge variant="secondary" className="max-sm:hidden">
            {person.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}

function PolicyRow({
  title,
  description,
  updated,
  children,
}: {
  title: string
  description: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border p-5 max-sm:gap-3 max-sm:p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <IconFileText className="size-5 text-muted-foreground" stroke={1.5} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <span className="mt-2 block text-xs text-muted-foreground">
          Updated {updated}
        </span>
      </div>
      {children}
    </div>
  )
}
