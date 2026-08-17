"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DownloadIcon, CheckCircle2, Circle } from "lucide-react";
import * as XLSX from "xlsx";

type Filter = "all" | "attended" | "not";

export default function AttendancePage() {
  const [registrations, setRegistrations] = useState<Register[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Register | null>(null);

  async function fetchRegistrations() {
    try {
      const response = await fetch("/api/fetch-register");
      const data = await response.json();
      if (data.success) setRegistrations(data.registrations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filtered = useMemo(() => {
    let rows = registrations;
    if (filter === "attended") rows = rows.filter((r) => r.attended);
    if (filter === "not") rows = rows.filter((r) => !r.attended);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.email, r.roll].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return rows;
  }, [registrations, filter, search]);

  const attendedCount = registrations.filter((r) => r.attended).length;

  const handleDownloadExcel = () => {
    const rows = filtered.map((r) => ({
      Name: r.name,
      Email: r.email,
      Roll: r.roll,
      Phone: r.phone,
      Knowledge: r.knowledge,
      Intrigue: r.intrigue,
      Topic: r.topic,
      Question: r.question,
      Attended: r.attended ? "Yes" : "No",
      AttendedAt: r.attendedAt ? new Date(r.attendedAt).toLocaleString() : "",
      MarkedBy: r.markedBy,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "bootcamp_attendance.xlsx");
  };

  if (loading) return <p className="text-center text-xl mt-10">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#76232F] mb-2">Attendance</h1>
      <p className="text-muted-foreground mb-6">
        {attendedCount} present / {registrations.length} registered
      </p>

      <div className="flex flex-wrap gap-3 justify-between items-end mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <Label className="text-[#76232F]">Show</Label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="ml-2 p-2 border border-[#76232F] rounded-lg bg-[#FDF7F4]"
            >
              <option value="all">All</option>
              <option value="attended">Attended</option>
              <option value="not">Not attended</option>
            </select>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / email / roll"
            className="w-56"
          />
        </div>
        <Button onClick={handleDownloadExcel} className="bg-[#76232F] text-white flex items-center">
          <DownloadIcon className="mr-2 h-4 w-4" /> Excel
        </Button>
      </div>

      <div className="grid gap-3">
        {filtered.map((reg) => (
          <Card
            key={reg.$id}
            className="bg-[#FDF7F4] border border-[#76232F] cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelected(reg)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{reg.name}</p>
                <p className="text-sm text-muted-foreground">
                  {reg.email}
                  {reg.roll ? ` · ${reg.roll}` : ""}
                </p>
              </div>
              {reg.attended ? (
                <span className="flex items-center gap-1 text-green-700 text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5" /> Present
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <Circle className="h-5 w-5" /> —
                </span>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No matches.</p>}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#FDF7F4]">
          <DialogHeader>
            <DialogTitle className="text-[#76232F]">{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Field label="Email" value={selected.email} />
              <Field label="Roll Number" value={selected.roll} />
              <Field label="Mobile" value={selected.phone} />
              <Field label="Current knowledge" value={selected.knowledge} />
              <Field label="What intrigues them about web dev" value={selected.intrigue} />
              <Field label="Topic they want to learn" value={selected.topic} />
              <Field label="Their (funny) question" value={selected.question} />
              <div className="pt-2 border-t border-[#76232F]/20">
                <Field
                  label="Attendance"
                  value={
                    selected.attended
                      ? `Present${selected.markedBy ? ` · marked by ${selected.markedBy}` : ""}${
                          selected.attendedAt ? ` · ${new Date(selected.attendedAt).toLocaleString()}` : ""
                        }`
                      : "Not attended"
                  }
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[#76232F] font-medium">{label}</p>
      <p className="whitespace-pre-line">{value ? value : <span className="text-gray-400">—</span>}</p>
    </div>
  );
}