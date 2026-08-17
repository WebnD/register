"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DownloadIcon, CheckCircle2, Circle } from "lucide-react";
import * as XLSX from "xlsx";
import { EVENT, DayKey } from "@/lib/event";

type Filter = "all" | "all3" | "missing" | "absent" | DayKey;

function daysAttended(r: Register): number {
  return (["day1", "day2", "day3"] as DayKey[]).filter((k) => r[k]).length;
}

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
    if (filter === "all3") rows = rows.filter((r) => daysAttended(r) === 3);
    else if (filter === "missing") rows = rows.filter((r) => {
      const n = daysAttended(r);
      return n >= 1 && n < 3;
    });
    else if (filter === "absent") rows = rows.filter((r) => daysAttended(r) === 0);
    else if (filter === "day1" || filter === "day2" || filter === "day3") {
      rows = rows.filter((r) => r[filter]);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.email, r.roll].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return rows;
  }, [registrations, filter, search]);

  const dayCounts = useMemo(
    () => ({
      day1: registrations.filter((r) => r.day1).length,
      day2: registrations.filter((r) => r.day2).length,
      day3: registrations.filter((r) => r.day3).length,
      all3: registrations.filter((r) => daysAttended(r) === 3).length,
    }),
    [registrations]
  );

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
      "Day 1 (16 Aug)": r.day1 ? "Yes" : "No",
      "Day 1 At": r.day1At ? new Date(r.day1At).toLocaleString() : "",
      "Day 1 By": r.day1By ?? "",
      "Day 2 (17 Aug)": r.day2 ? "Yes" : "No",
      "Day 2 At": r.day2At ? new Date(r.day2At).toLocaleString() : "",
      "Day 2 By": r.day2By ?? "",
      "Day 3 (19 Aug)": r.day3 ? "Yes" : "No",
      "Day 3 At": r.day3At ? new Date(r.day3At).toLocaleString() : "",
      "Day 3 By": r.day3By ?? "",
      "Days Attended": daysAttended(r),
      "All 3 Days": daysAttended(r) === 3 ? "Yes" : "No",
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
      <p className="text-muted-foreground mb-4">
        {registrations.length} registered · Day 1: {dayCounts.day1} · Day 2: {dayCounts.day2} · Day 3:{" "}
        {dayCounts.day3} · <span className="font-semibold text-[#76232F]">All 3 days: {dayCounts.all3}</span>
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
              <option value="all3">Present all 3 days</option>
              <option value="missing">Missed some (1–2 days)</option>
              <option value="absent">Absent (0 days)</option>
              <option value="day1">Present Day 1 (16 Aug)</option>
              <option value="day2">Present Day 2 (17 Aug)</option>
              <option value="day3">Present Day 3 (19 Aug)</option>
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
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{reg.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {reg.email}
                  {reg.roll ? ` · ${reg.roll}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {EVENT.days.map((d) => {
                  const present = !!reg[d.key];
                  return (
                    <div key={d.key} className="flex flex-col items-center">
                      {present ? (
                        <CheckCircle2 className="h-5 w-5 text-green-700" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                      <span className="text-[10px] text-muted-foreground mt-0.5">{d.label}</span>
                    </div>
                  );
                })}
              </div>
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
              <div className="pt-2 border-t border-[#76232F]/20 space-y-2">
                <p className="text-[#76232F] font-medium">Attendance</p>
                {EVENT.days.map((d) => {
                  const present = !!selected[d.key];
                  const at = selected[`${d.key}At` as keyof Register] as string | undefined;
                  const by = selected[`${d.key}By` as keyof Register] as string | undefined;
                  return (
                    <div key={d.key} className="flex items-center gap-2">
                      {present ? (
                        <CheckCircle2 className="h-4 w-4 text-green-700 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                      )}
                      <span>
                        <span className="font-medium">{d.label}</span> ({d.date.replace(" 2026", "")}):{" "}
                        {present ? (
                          <>
                            Present
                            {by ? ` · ${by}` : ""}
                            {at ? ` · ${new Date(at).toLocaleString()}` : ""}
                          </>
                        ) : (
                          <span className="text-gray-400">Absent</span>
                        )}
                      </span>
                    </div>
                  );
                })}
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