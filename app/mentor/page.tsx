"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Html5Qrcode } from "html5-qrcode"
import { CheckCircle2, AlertCircle, Camera, X } from "lucide-react"

type ScanResult =
  | { kind: "success"; name: string }
  | { kind: "already"; name: string; at?: string; by?: string }
  | { kind: "error"; message: string }

export default function MentorPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [checking, setChecking] = useState(false)

  const [mentorName, setMentorName] = useState("")
  const [nameConfirmed, setNameConfirmed] = useState(false)

  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [busy, setBusy] = useState(false)

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const handledRef = useRef(false)

  // Restore auth within the same browser session
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("mentorAuthed") === "true") {
      setAuthed(true)
    }
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

  // Scanner lifecycle
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
      () => {
        /* per-frame decode misses — ignore */
      }
    ).catch((err) => {
      console.error("Camera start failed:", err)
      setResult({ kind: "error", message: "Unable to access the camera. Check permissions." })
      setScanning(false)
    })

    return () => {
      const active = html5QrCodeRef.current
      if (active) {
        active
          .stop()
          .then(() => active.clear())
          .catch(() => {})
        html5QrCodeRef.current = null
      }
    }
  }, [scanning])

  const handleScan = async (scannedData: string) => {
    setBusy(true)
    // stop the camera immediately after a read
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
        body: JSON.stringify({ data: { scannedData, markedBy: mentorName } }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed")
      }
      const rec = json.record || {}
      if (json.alreadyMarked) {
        setResult({ kind: "already", name: rec.name, at: rec.attendedAt, by: rec.markedBy })
      } else {
        setResult({ kind: "success", name: rec.name })
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

  // ── Password gate ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#FDF7F4] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-[#76232F]">Mentor Access</h1>
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter password"
            />
            {authError && <p className="text-sm text-red-600">{authError}</p>}
          </div>
          <Button
            onClick={handleLogin}
            disabled={checking || !password}
            className="w-full bg-[#76232F] hover:bg-[#76232F]/90 text-white"
          >
            {checking ? "Checking..." : "Enter"}
          </Button>
        </div>
      </div>
    )
  }

  // ── Mentor name ──
  if (!nameConfirmed) {
    return (
      <div className="min-h-screen bg-[#FDF7F4] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-[#76232F]">Who's scanning?</h1>
          <div className="space-y-2">
            <Label htmlFor="mname">Your name</Label>
            <Input
              id="mname"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && mentorName.trim() && setNameConfirmed(true)}
              placeholder="Mentor name"
            />
          </div>
          <Button
            onClick={() => mentorName.trim() && setNameConfirmed(true)}
            disabled={!mentorName.trim()}
            className="w-full bg-[#76232F] hover:bg-[#76232F]/90 text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    )
  }

  // ── Scan console ──
  return (
    <div className="min-h-screen bg-[#FDF7F4] p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#76232F]">Attendance</h1>
          <span className="text-sm text-muted-foreground">Mentor: {mentorName}</span>
        </div>

        {!scanning && !result && (
          <Button
            onClick={() => setScanning(true)}
            className="w-full bg-[#76232F] hover:bg-[#76232F]/90 text-white"
          >
            <Camera className="mr-2 h-5 w-5" /> Scan a ticket
          </Button>
        )}

        {scanning && (
          <div className="bg-white rounded-lg shadow p-4 relative">
            <Button
              onClick={() => setScanning(false)}
              variant="outline"
              className="absolute top-2 right-2 p-2 z-10"
              title="Cancel"
            >
              <X />
            </Button>
            <h2 className="text-lg font-semibold text-black mb-3">Point at the QR code</h2>
            <div id="qr-reader" className="w-full" />
            {busy && <p className="text-center text-sm text-muted-foreground mt-3">Marking…</p>}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow p-6 text-center space-y-3">
            {result.kind === "success" && (
              <>
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
                <h2 className="text-xl font-semibold">{result.name}</h2>
                <p className="text-green-700">Marked present ✓</p>
              </>
            )}
            {result.kind === "already" && (
              <>
                <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
                <h2 className="text-xl font-semibold">{result.name}</h2>
                <p className="text-amber-600">
                  Already marked
                  {result.by ? ` by ${result.by}` : ""}
                  {result.at ? ` at ${new Date(result.at).toLocaleTimeString()}` : ""}.
                </p>
              </>
            )}
            {result.kind === "error" && (
              <>
                <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
                <p className="text-red-700">{result.message}</p>
              </>
            )}
            <Button onClick={scanNext} className="w-full bg-[#76232F] hover:bg-[#76232F]/90 text-white">
              Scan next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}