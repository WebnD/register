"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Html5Qrcode } from "html5-qrcode"
import { CheckCircle2, AlertCircle, Camera, X } from "lucide-react"
import { EVENT, DayKey, dayLabel, defaultScanDayKey, todayEventDayKey } from "@/lib/event"

type ScanResult =
  | { kind: "success"; name: string; day: DayKey }
  | { kind: "already"; name: string; day: DayKey; at?: string; by?: string }
  | { kind: "error"; message: string }

export default function MentorPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [checking, setChecking] = useState(false)

  const [mentorName, setMentorName] = useState("")
  const [nameConfirmed, setNameConfirmed] = useState(false)

  const [selectedDay, setSelectedDay] = useState<DayKey>("day1")
  const [isEventDay, setIsEventDay] = useState(true)

  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [busy, setBusy] = useState(false)

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const handledRef = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("mentorAuthed") === "true") {
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    setSelectedDay(defaultScanDayKey())
    setIsEventDay(todayEventDayKey() !== null)
  }, [])

  const handleLogin = async () => {
    setChecking(true)
    setAuthError("")
    try {
      const res = await fetch("/api/mentor-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (json.ok) {
        sessionStorage.setItem("mentorAuthed", "true")
        setAuthed(true)
      } else {
        setAuthError("Incorrect password.")
      }
    } catch {
      setAuthError("Something went wrong. Try again.")
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (!scanning) return
    handledRef.current = false
    const qr = new Html5Qrcode("qr-reader")
    html5QrCodeRef.current = qr

    qr.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        if (handledRef.current) return
        handledRef.current = true
        handleScan(decodedText)
      },
      () => {}
    ).catch((err) => {
      console.error("Camera start failed:", err)
      setResult({ kind: "error", message: "Unable to access the camera. Check permissions." })
      setScanning(false)
    })

    return () => {
      const active = html5QrCodeRef.current
      if (active) {
        active.stop().then(() => active.clear()).catch(() => {})
        html5QrCodeRef.current = null
      }
    }
  }, [scanning])

  const handleScan = async (scannedData: string) => {
    setBusy(true)
    const active = html5QrCodeRef.current
    if (active) {
      try {
        await active.stop()
        active.clear()
      } catch {}
      html5QrCodeRef.current = null
    }
    setScanning(false)

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { scannedData, markedBy: mentorName, day: selectedDay } }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed")
      }
      const rec = json.record || {}
      const day: DayKey = json.day || selectedDay
      if (json.alreadyMarked) {
        setResult({ kind: "already", name: rec.name, day, at: rec[`${day}At`], by: rec[`${day}By`] })
      } else {
        setResult({ kind: "success", name: rec.name, day })
      }
    } catch (e: any) {
      setResult({ kind: "error", message: "Could not find or mark this ticket." })
    } finally {
      setBusy(false)
    }
  }

  const scanNext = () => {
    setResult(null)
    setScanning(true)
  }

  const card = "bg-[#141009] border border-[#2a221a] rounded-lg"
  const primaryBtn = "bg-[#991d1d] hover:bg-[#b02424] text-[#f4ead6]"

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#d8c6a7] flex items-center justify-center p-6">
        <div className={`${card} p-8 shadow-md w-full max-w-sm space-y-4`}>
          <h1 className="text-2xl font-black uppercase tracking-wide text-[#ece0c8]">Mentor Access</h1>
          <div className="space-y-2">
            <Label htmlFor="pw" className="text-[#d8c6a7]">Password</Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter password"
              className="bg-[#0f0b08] border-[#3a2f24] text-[#e8dcc0] placeholder:text-[#7d6f5a]"
            />
            {authError && <p className="text-sm text-red-400">{authError}</p>}
          </div>
          <Button onClick={handleLogin} disabled={checking || !password} className={`w-full ${primaryBtn}`}>
            {checking ? "Checking..." : "Enter"}
          </Button>
        </div>
      </div>
    )
  }

  if (!nameConfirmed) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#d8c6a7] flex items-center justify-center p-6">
        <div className={`${card} p-8 shadow-md w-full max-w-sm space-y-4`}>
          <h1 className="text-2xl font-black uppercase tracking-wide text-[#ece0c8]">Who&apos;s scanning?</h1>
          <div className="space-y-2">
            <Label htmlFor="mname" className="text-[#d8c6a7]">Your name</Label>
            <Input
              id="mname"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && mentorName.trim() && setNameConfirmed(true)}
              placeholder="Mentor name"
              className="bg-[#0f0b08] border-[#3a2f24] text-[#e8dcc0] placeholder:text-[#7d6f5a]"
            />
          </div>
          <Button onClick={() => mentorName.trim() && setNameConfirmed(true)} disabled={!mentorName.trim()} className={`w-full ${primaryBtn}`}>
            Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#d8c6a7] p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black uppercase tracking-wide text-[#ece0c8]">Attendance</h1>
          <span className="text-sm text-[#a89878]">Mentor: {mentorName}</span>
        </div>

        <div className={`${card} p-4 space-y-3`}>
          <div className="flex items-center justify-between">
            <Label className="text-[#c9a876]">Marking attendance for</Label>
            {!isEventDay && <span className="text-xs text-amber-500">Today isn&apos;t an event day</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EVENT.days.map((d) => {
              const active = d.key === selectedDay
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  disabled={scanning}
                  className={
                    "rounded-lg border p-2 text-center transition-colors " +
                    (active
                      ? "bg-[#991d1d] text-[#f4ead6] border-[#991d1d]"
                      : "bg-[#0f0b08] text-[#d8c6a7] border-[#3a2f24] hover:border-[#991d1d]") +
                    (scanning ? " opacity-60 cursor-not-allowed" : "")
                  }
                >
                  <span className="block text-sm font-semibold">{d.label}</span>
                  <span className="block text-[11px] opacity-80">{d.date.replace(" 2026", "")}</span>
                </button>
              )
            })}
          </div>
        </div>

        {!scanning && !result && (
          <Button onClick={() => setScanning(true)} className={`w-full ${primaryBtn}`}>
            <Camera className="mr-2 h-5 w-5" /> Scan for {dayLabel(selectedDay)}
          </Button>
        )}

        {scanning && (
          <div className={`${card} p-4 relative`}>
            <Button onClick={() => setScanning(false)} variant="outline" className="absolute top-2 right-2 p-2 z-10 bg-[#0f0b08] border-[#3a2f24] text-[#d8c6a7]" title="Cancel">
              <X />
            </Button>
            <h2 className="text-lg font-semibold text-[#ece0c8] mb-1">Point at the QR code</h2>
            <p className="text-sm text-[#a89878] mb-3">Marking {dayLabel(selectedDay)}</p>
            <div id="qr-reader" className="w-full" />
            {busy && <p className="text-center text-sm text-[#a89878] mt-3">Marking…</p>}
          </div>
        )}

        {result && (
          <div className={`${card} p-6 text-center space-y-3`}>
            {result.kind === "success" && (
              <>
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold text-[#ece0c8]">{result.name}</h2>
                <p className="text-green-400">Marked present for {dayLabel(result.day)} ✓</p>
              </>
            )}
            {result.kind === "already" && (
              <>
                <AlertCircle className="mx-auto h-12 w-12 text-amber-400" />
                <h2 className="text-xl font-semibold text-[#ece0c8]">{result.name}</h2>
                <p className="text-amber-400">
                  Already marked for {dayLabel(result.day)}
                  {result.by ? ` by ${result.by}` : ""}
                  {result.at ? ` at ${new Date(result.at).toLocaleTimeString()}` : ""}.
                </p>
              </>
            )}
            {result.kind === "error" && (
              <>
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <p className="text-red-400">{result.message}</p>
              </>
            )}
            <Button onClick={scanNext} className={`w-full ${primaryBtn}`}>
              Scan next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}