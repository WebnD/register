"use client"

import Image from "next/image"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, CalendarDays, MessageCircle } from "lucide-react"
import { EVENT } from "@/lib/event"

const EXPERIENCE_OPTIONS = ["Complete beginner", "Some basics", "Intermediate", "Advanced"]

// shared field styles for the dark retro form
const fieldClass =
  "w-full rounded-md border border-[#3a2f24] bg-[#0f0b08] text-[#e8dcc0] placeholder:text-[#7d6f5a] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#991d1d]"
const areaClass = "min-h-[90px] " + fieldClass

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
      motivation: formData.get("motivation"),
      experience: formData.get("experience"),
      tools: formData.get("tools"),
      learn: formData.get("learn"),
      portfolio: formData.get("portfolio"),
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
    <div className="min-h-screen bg-[#0c0c0c] text-[#d8c6a7] p-6">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2 md:mt-6">
          {/* Poster */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg ring-1 ring-[#2a221a]">
            <Image src="/bootcamp.png" alt={`${EVENT.name} poster`} fill className="object-cover" priority />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#991d1d] font-semibold uppercase">
                {EVENT.campus}
              </p>
              <h1 className="mt-1 text-5xl font-black uppercase leading-[0.95] tracking-tight text-[#ece0c8]">
                {EVENT.name}
              </h1>
              <p className="mt-2 text-sm tracking-[0.2em] uppercase text-[#a89878]">{EVENT.tagline}</p>
            </div>

            {/* Schedule with topics */}
            <div className="space-y-3">
              {EVENT.days.map((d) => (
                <div key={d.key} className="rounded-lg border border-[#2a221a] bg-[#141009] p-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-[#991d1d]" />
                    <p className="font-semibold text-[#ece0c8]">
                      {d.label} · {d.date}
                    </p>
                  </div>
                  <p className="mt-0.5 pl-6 text-xs text-[#a89878]">{d.time}</p>
                  <p className="mt-1 pl-6 text-sm text-[#c9a876]">{d.topics.join(" · ")}</p>
                </div>
              ))}

              <a
                href={EVENT.whatsappGroup.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 rounded-lg border border-[#2a221a] bg-[#141009] p-3 transition-colors hover:border-[#991d1d]"
              >
                <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#25d366]" />
                <span>
                  <span className="block font-semibold text-[#ece0c8]">Join the WhatsApp Group</span>
                  <span className="mt-1 block text-sm text-[#a89878]">{EVENT.whatsappGroup.label}</span>
                </span>
              </a>

              <div className="flex items-center gap-2 pt-1">
                <MapPin className="h-5 w-5 text-[#991d1d]" />
                <div>
                  <p className="font-medium text-[#ece0c8]">{EVENT.venue}</p>
                  <p className="text-sm text-[#a89878]">{EVENT.campus}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[#a89878]">Grab your spot — register below and we&apos;ll email your entry ticket.</p>
              <Button
                className="w-full bg-[#991d1d] hover:bg-[#b02424] text-[#f4ead6] font-semibold tracking-wide uppercase"
                onClick={() => setOpen(true)}
              >
                Register
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[440px] custom-scrollbar bg-[#141009] border border-[#2a221a] text-[#d8c6a7]">
            <DialogHeader>
              <DialogTitle className="text-[#ece0c8] uppercase tracking-wide">
                Register for {EVENT.name}
              </DialogTitle>
            </DialogHeader>
            <form ref={formRef} className="space-y-5 py-4" onSubmit={handleSubmit}>
              <Field label="Name" required>
                <Input id="name" name="name" placeholder="Your name" required className={fieldClass} />
              </Field>

              <Field label="Email" required>
                <Input id="email" name="email" type="email" placeholder="you@email.com" required className={fieldClass} />
              </Field>

              <Field label="Roll Number">
                <Input id="roll" name="roll" placeholder="e.g. 21CS1234" className={fieldClass} />
              </Field>

              <Field label="Mobile Number">
                <Input id="phone" name="phone" type="tel" placeholder="e.g. 9876543210" className={fieldClass} />
              </Field>

              <Field label="What draws you to design?" required>
                <textarea
                  id="motivation"
                  name="motivation"
                  className={areaClass}
                  placeholder="Tell us what pulls you in..."
                  required
                />
              </Field>

              <Field label="Your current design experience" required>
                <select id="experience" name="experience" required defaultValue="" className={fieldClass}>
                  <option value="" disabled>
                    Select one
                  </option>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Which design tools have you used before?">
                <Input
                  id="tools"
                  name="tools"
                  placeholder="e.g. Figma, Photoshop, Canva, Blender, none yet"
                  className={fieldClass}
                />
              </Field>

              <Field label="What are you most excited to learn?">
                <textarea
                  id="learn"
                  name="learn"
                  className={areaClass}
                  placeholder="Colour theory, Figma, motion graphics, Blender..."
                />
              </Field>

              <Field label="Portfolio / Behance / Instagram link">
                <Input id="portfolio" name="portfolio" placeholder="https://..." className={fieldClass} />
              </Field>

              <Field label="Any (funny) questions for us?">
                <textarea
                  id="question"
                  name="question"
                  className={areaClass}
                  placeholder="We'll answer at the bootcamp!"
                />
              </Field>

              <Button
                type="submit"
                className="w-full bg-[#991d1d] hover:bg-[#b02424] text-[#f4ead6] font-semibold uppercase tracking-wide"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Register"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[#d8c6a7]">
        {label} {required && <span className="text-[#991d1d]">*</span>}
      </Label>
      {children}
    </div>
  )
}