"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CandidateInfo {
  name: string
  rollNumber: string
  email: string
  phoneNumber: string
  reason: string
  projects: string
}


export default function CandidateInfoDialog({ scannedData, panelName,  onClose }: { scannedData: string; panelName:string; onClose: () => void }) {
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [status, setStatus] = useState<"Selected" | "Pending" | "Rejected" | null>(null)
  const [remarks, setRemarks] = useState("");
  const [mockCandidateInfo, setmockCandidateInfo] = useState<Register>();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);


  const handleRatingClick = (num: number) => {
    if (rating === num) {
      setSelectedNumber(num)
    } else {
      setRating(num)
      setSelectedNumber(num)
    }
  }
  const handleSubmit = async () => {
    const data = {
      scannedData,
      panelName,
      rating,
      status,
      remarks,
    }
    const response = await fetch('/api/induction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({data}),
      })

      if (!response.ok) throw new Error('Failed to submit')
    onClose()
  }

  useEffect(()=>{
    async function fetchInfo(data: string){
        const response = await fetch('/api/fetch-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({data}),
          })
    
          if (!response.ok) throw new Error('Failed to submit')
            const result = await response.json();
        setmockCandidateInfo(result.data);
    }
fetchInfo(scannedData)
  }, [scannedData]);

  if (!mockCandidateInfo)
    return(
<p>Loading....</p>
)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FDF7F4]">
        <DialogHeader>
          <DialogTitle className="text-[#76232F]">Candidate Information</DialogTitle>
        </DialogHeader>
        {!showRating ? (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#76232F]">Name</Label>
                <p>{mockCandidateInfo?.name}</p>
              </div>
              <div>
                <Label className="text-[#76232F]">Roll Number</Label>
                <p>{mockCandidateInfo?.roll}</p>
              </div>
              <div>
                <Label className="text-[#76232F]">Email</Label>
                <p>{mockCandidateInfo?.email}</p>
              </div>
              <div>
                <Label className="text-[#76232F]">Phone Number</Label>
                <p>{mockCandidateInfo?.phone}</p>
              </div>
            </div>
            <div>
              <Label className="text-[#76232F]">Reason for Joining</Label>
              <p className="mt-1">{mockCandidateInfo?.reason}</p>
            </div>
            <div>
              <Label className="text-[#76232F]">Projects</Label>
              <p className="mt-1 whitespace-pre-line">{mockCandidateInfo?.projects}</p>
            </div>
            <div>
              <Label className="text-[#76232F]">Scanned Code</Label>
              <p className="mt-1">{scannedData}</p>
            </div>
            <Button onClick={() => setShowRating(true)} className="bg-[#76232F] hover:bg-[#76232F]/90 text-white">
              Score
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-[#76232F]">Rating</Label>
              <div className="flex flex-wrap gap-2 mt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <div key={num} className="relative">
                <button
                  onClick={() => handleRatingClick(num)}
                  className={`w-12 h-12 rounded-lg border-2 border-[#76232F] flex items-center justify-center transition-colors ${
                    rating === num || rating === num + 0.5 ? "bg-[#76232F] text-white" : "bg-white text-[#76232F]"
                  }`}
                >
                  {rating === num + 0.5 ? num + 0.5 : num}
                </button>
                {rating === num && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-[#76232F] rounded-md shadow-lg z-50">
                    <button
                      onClick={() => setRating(num)}
                      className="w-full px-2 py-1 text-left hover:bg-[#76232F] hover:text-white"
                    >
                      {num}
                    </button>
                    <button
                      onClick={() => setRating(num + 0.5)}
                      className="w-full px-2 py-1 text-left hover:bg-[#76232F] hover:text-white"
                    >
                      {num + 0.5}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
            </div>
            <div>
              <Label className="text-[#76232F]">Status</Label>
              <RadioGroup onValueChange={(value: "Selected" | "Pending" | "Rejected") => setStatus(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Selected" id="selected" />
                  <Label htmlFor="selected">Selected</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pending" id="pending" />
                  <Label htmlFor="pending">Pending</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Rejected" id="rejected" />
                  <Label htmlFor="rejected">Rejected</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-[#76232F]">Remarks</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your remarks here"
                className="bg-white"
              />
            </div>
            <Button onClick={handleSubmit} className="bg-[#76232F] hover:bg-[#76232F]/90 text-white">
              Submit
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

