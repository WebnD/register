"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Clock } from "lucide-react"
import { useRef } from "react"

export default function EventPage() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(formRef.current!)
    const data = {
      name: formData.get('name'),
      roll: formData.get('rollNumber'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      reason: formData.get('reason'),
      projects: formData.get('projects')
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({data}),
      })

      if (!response.ok) throw new Error('Failed to submit')
      
      setOpen(false)
      alert('Registration successful!')
    } catch (error) {
      console.error(error)
      alert('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF7F4] p-6">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2 md:mt-[25vh]">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white p-6">
            <Image
              src="/cover.jpg"
              alt="You are invited"
              fill
              className="object-contain"
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-[#76232F]">WebD Induction</h1>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#76232F]" />
                <p>Saturday, February 8</p>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#76232F]" />
                <p>6:00 PM - 9:00 PM</p>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#76232F]" />
                <div>
                  <p className="font-medium">Lalitgiri Hall of Learning</p>
                  <p className="text-sm text-muted-foreground">Kansapada, Odisha</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Registration</h2>
              <p className="text-muted-foreground">Welcome! To join the event, please register below.</p>
              <Button className="w-full bg-[#76232F] hover:bg-[#76232F]/90" onClick={() => setOpen(true)}>
                Register
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px] custom-scrollbar">
            <DialogHeader>
              <DialogTitle>Your Info</DialogTitle>
            </DialogHeader>
            <form 
    ref={formRef}
    className="space-y-6 py-4" 
    onSubmit={handleSubmit}
  >
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" name="name" placeholder="Your Name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumber">
                  Roll Number <span className="text-red-500">*</span>
                </Label>
                <Input id="rollNumber" name="rollNumber" placeholder="e.g. 21CS1234" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input id="email" name="email" type="email" placeholder="you@email.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number (WhatsApp) <span className="text-red-500">*</span>
                </Label>
                <Input id="phone" name="phone" type="tel" placeholder="e.g. 9876543210" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  Why do you want to join WebD? <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="reason"
                  name="reason"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell us why you're interested in web development..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projects">Any projects you have worked on?</Label>
                <textarea
                  id="projects"
                  name="projects"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Share links or descriptions of your projects (if any)"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-zinc-900 hover:bg-zinc-800"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Register'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

