"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function InductionPage() {
  const [panelName, setPanelName] = useState("")
  const router = useRouter()

  const handleContinue = () => {
    if (panelName) {
      router.push(`/induction/${encodeURIComponent(panelName)}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF7F4] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#76232F] mb-6">Induction Panel</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="panelName" className="block text-sm font-medium text-gray-700 mb-1">
              Panel Member Name
            </label>
            <Input
              id="panelName"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <Button onClick={handleContinue} className="w-full bg-[#76232F] hover:bg-[#76232F]/90 text-white">
            Continue Induction
          </Button>
        </div>
      </div>
    </div>
  )
}

