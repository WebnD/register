"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, DownloadIcon, X } from "lucide-react";
import * as XLSX from "xlsx";

export default function FinalInduction() {
  const [registrations, setRegistrations] = useState<Register[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  async function fetchRegistrations() {
    try {
      const response = await fetch("/api/fetch-register");
      if (!response.ok) throw new Error("Failed to fetch registrations");
      const data = await response.json();
      setRegistrations(data.registrations);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      fetchRegistrations();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadExcel = () => {
    const filteredData = filter
      ? registrations.filter((reg) => reg.status === filter)
      : registrations;
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Registrations");
    XLSX.writeFile(workbook, "filtered_induction.xlsx");
  };

  const filteredRegistrations = filter
    ? registrations.filter((reg) => reg.status === filter)
    : registrations;

  if (!registrations) return <p className="text-center text-xl">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#76232F] mb-6">Final Induction</h1>
      <div className="flex justify-between items-center mb-4">
        <div>
          <Label className="text-[#76232F]">Filter by Status:</Label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="ml-2 p-2 border border-[#76232F] rounded-lg bg-[#FDF7F4]"
          >
            <option value="">All</option>
            <option value="Selected">Selected</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <Button onClick={handleDownloadExcel} className="bg-[#76232F] text-white px-4 py-2 rounded-lg flex items-center">
          <DownloadIcon className="mr-2" /> Download Excel
        </Button>
      </div>
      <div className="grid gap-4">
        {filteredRegistrations.map((reg: Register) => (
          <Card key={reg.$id} className="bg-[#FDF7F4] p-4 border border-[#76232F]">
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#76232F]">Name</Label>
                  <p>{reg.name}</p>
                </div>
                <div>
                  <Label className="text-[#76232F]">Panel Name</Label>
                  <p>{reg.panelName}</p>
                </div>
                <div>
                  <Label className="text-[#76232F]">Score</Label>
                  <p>{reg.rating}</p>
                </div>
                <div>
                  <Label className="text-[#76232F]">Remarks</Label>
                  <p>{reg.remarks}</p>
                </div>
                <div>
                  <Label className="text-[#76232F]">Projects</Label>
                  <p>{reg.projects}</p>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-[#76232F]">Selection Status</Label>
                <p className="text-lg font-semibold">{reg.status}</p>
                <div className="flex space-x-4 mt-2">
                  <Button 
                    onClick={() => handleStatusChange(reg.$id!, "Selected")}
                    className="bg-[#76232F] hover:bg-[#5E1E26] text-white px-4 py-2 rounded-lg"
                  >
                    <Check/>
                    Select
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange(reg.$id!, "Rejected")}
                    className="bg-[#A64250] hover:bg-[#76232F] text-white px-4 py-2 rounded-lg"
                  >
                    <X/>
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
