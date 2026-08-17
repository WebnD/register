"use client"

import Image from "next/image"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, CalendarDays } from "lucide-react"
import { EVENT } from "@/lib/event"

const KNOWLEDGE_OPTIONS = ["Beginner", "Intermediate", "Advanced"]

export default function EventPage() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(formRef.current!)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      roll: formData.get("roll"),
      phone: formData.get("phone"),
      intrigue: formData.get("intrigue"),
      topic: formData.get("topic"),
      knowledge: formData.get("knowledge"),
      question: formData.get("question"),
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit")
      }
      setOpen(false)
      formRef.current?.reset()
      alert("Registration successful!\nCheck your email for your entry ticket.")
    } catch (error) {
      console.error(error)
      alert("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF7F4] p-6">
      <div className="mx-auto max-w-4xl">
        <div className="relative w-full aspect-[1049/348] overflow-hidden rounded-lg mb-8">
          <Image src="/banner.png" alt="Web & Design Society" fill className="object-cover" priority />
        </div>
        <div className="grid gap-8 md:grid-cols-2 md:mt-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg">
            <Image src="/bootcamp.png" alt="Web Dev Bootcamp poster" fill className="object-cover" priority />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-[#76232F]">{EVENT.name}</h1>

            <div className="space-y-3">
              {EVENT.days.map((d) => (
                <div key={d.label} className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#76232F]" />
                  <div>
                    <p className="font-medium">
                      {d.label} · {d.date}
                    </p>
                    <p className="text-sm text-muted-foreground">{d.time}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <MapPin className="h-5 w-5 text-[#76232F]" />
                <div>
                  <p className="font-medium">{EVENT.venue}</p>
                  <p className="text-sm text-muted-foreground">{EVENT.campus}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Registration</h2>
              <p className="text-muted-foreground">Register below to join the bootcamp.</p>
              <Button className="w-full bg-[#76232F] hover:bg-[#76232F]/90" onClick={() => setOpen(true)}>
                Register
              </Button>
            </div>
            <div className="rounded-2xl border border-muted-foreground/40 bg-white/80 p-4 shadow-sm">
              <p className="text-sm text-[#76232F]">
                Join the WhatsApp group for further discussions and participate in ongoing quizzes and sessions.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                <a
                  href={EVENT.WhatsappGroupLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#76232F] underline hover:text-[#4f1720]"
                >
                  Click here to join the group
                </a>{' '}
              
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px] custom-scrollbar">
                <DialogHeader>
                  <DialogTitle>Register for the Bootcamp</DialogTitle>
                </DialogHeader>
                <form ref={formRef} className="space-y-6 py-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input id="name" name="name" placeholder="Your Name" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input id="email" name="email" type="email" placeholder="you@email.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roll">
                      Roll Number <span className="text-red-500">*</span>
                    </Label>
                    <Input id="roll" name="roll" placeholder="e.g. 21CS1234" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <Input id="phone" name="phone" type="tel" placeholder="e.g. 9876543210" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intrigue">
                      What intrigues you the most about web development? <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="intrigue"
                      name="intrigue"
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us what draws you in..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">
                      Any particular topic you want to learn in the workshop? <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="topic"
                      name="topic"
                      className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="e.g. React, backend, deployment..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="knowledge">
                      Your current knowledge in this domain <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="knowledge"
                      name="knowledge"
                      required
                      defaultValue=""
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="" disabled>
                        Select one
                      </option>
                      {KNOWLEDGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question">Any (funny) questions you want to ask us?</Label>
                    <textarea
                      id="question"
                      name="question"
                      className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="We'll answer at the bootcamp!"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800" disabled={loading}>
                    {loading ? "Submitting..." : "Register"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}