"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DownloadIcon, CheckCircle2, Circle } from "lucide-react";
import * as XLSX from "xlsx";
import { EVENT, DAY_KEYS, DayKey } from "@/lib/event";

type Filter = "all" | "allDays" | "missing" | "absent" | DayKey;

function daysAttended(r: Register): number {
  return DAY_KEYS.filter((k) => r[k]).length;
}
const TOTAL_DAYS = EVENT.days.length;

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
    if (filter === "allDays") rows = rows.filter((r) => daysAttended(r) === TOTAL_DAYS);
    else if (filter === "missing")
      rows = rows.filter((r) => {
        const n = daysAttended(r);
        return n >= 1 && n < TOTAL_DAYS;
      });
    else if (filter === "absent") rows = rows.filter((r) => daysAttended(r) === 0);
    else if ((DAY_KEYS as string[]).includes(filter)) rows = rows.filter((r) => r[filter as DayKey]);

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.email, r.roll].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return rows;
  }, [registrations, filter, search]);

  const counts = useMemo(() => {
    const perDay: Record<string, number> = {};
    for (const d of EVENT.days) perDay[d.key] = registrations.filter((r) => r[d.key]).length;
    const allDays = registrations.filter((r) => daysAttended(r) === TOTAL_DAYS).length;
    return { perDay, allDays };
  }, [registrations]);

  const handleDownloadExcel = () => {
    const rows = filtered.map((r) => {
      const base: Record<string, any> = {
        Name: r.name,
        Email: r.email,
        Roll: r.roll,
        Phone: r.phone,
        Experience: r.experience,
        "What draws them to design": r.motivation,
        "Tools used": r.tools,
        "Wants to learn": r.learn,
        Portfolio: r.portfolio,
        Question: r.question,
      };
      for (const d of EVENT.days) {
        base[`${d.label} (${d.date})`] = r[d.key] ? "Yes" : "No";
        base[`${d.label} At`] = r[`${d.key}At` as keyof Register]
          ? new Date(r[`${d.key}At` as keyof Register] as string).toLocaleString()
          : "";
        base[`${d.label} By`] = (r[`${d.key}By` as keyof Register] as string) ?? "";
      }
      base["Days Attended"] = daysAttended(r);
      base["All Days"] = daysAttended(r) === TOTAL_DAYS ? "Yes" : "No";
      return base;
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "design_bootcamp_attendance.xlsx");
  };

  if (loading) return <p className="text-center text-xl mt-10 text-[#d8c6a7]">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#d8c6a7] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black uppercase tracking-wide text-[#ece0c8] mb-2">Attendance</h1>
        <p className="text-[#a89878] mb-4">
          {registrations.length} registered ·{" "}
          {EVENT.days.map((d) => `${d.label}: ${counts.perDay[d.key] ?? 0}`).join(" · ")} ·{" "}
          <span className="font-semibold text-[#c9a876]">All days: {counts.allDays}</span>
        </p>

        <div className="flex flex-wrap gap-3 justify-between items-end mb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <Label className="text-[#d8c6a7]">Show</Label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Filter)}
                className="ml-2 p-2 border border-[#3a2f24] rounded-lg bg-[#141009] text-[#e8dcc0]"
              >
                <option value="all">All</option>
                <option value="allDays">Present all days</option>
                <option value="missing">Missed some</option>
                <option value="absent">Absent (0 days)</option>
                {EVENT.days.map((d) => (
                  <option key={d.key} value={d.key}>
                    Present {d.label} ({d.date.replace(" 2026", "")})
                  </option>
                ))}
              </select>
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / email / roll"
              className="w-56 bg-[#141009] border-[#3a2f24] text-[#e8dcc0] placeholder:text-[#7d6f5a]"
            />
          </div>
          <Button
            onClick={handleDownloadExcel}
            className="bg-[#991d1d] hover:bg-[#b02424] text-[#f4ead6] flex items-center"
          >
            <DownloadIcon className="mr-2 h-4 w-4" /> Excel
          </Button>
        </div>

        <div className="grid gap-3">
          {filtered.map((reg) => (
            <Card
              key={reg.$id}
              className="bg-[#141009] border border-[#2a221a] cursor-pointer hover:border-[#991d1d] transition-colors"
              onClick={() => setSelected(reg)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate text-[#ece0c8]">{reg.name}</p>
                  <p className="text-sm text-[#a89878] truncate">
                    {reg.email}
                    {reg.roll ? ` · ${reg.roll}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {EVENT.days.map((d) => (
                    <div key={d.key} className="flex flex-col items-center">
                      {reg[d.key] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-[#3a2f24]" />
                      )}
                      <span className="text-[10px] text-[#a89878] mt-0.5">{d.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center text-[#a89878] py-8">No matches.</p>}
        </div>

        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#141009] border border-[#2a221a] text-[#d8c6a7]">
            <DialogHeader>
              <DialogTitle className="text-[#ece0c8]">{selected?.name}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-3 text-sm">
                <Field label="Email" value={selected.email} />
                <Field label="Roll Number" value={selected.roll} />
                <Field label="Mobile" value={selected.phone} />
                <Field label="Design experience" value={selected.experience} />
                <Field label="What draws them to design" value={selected.motivation} />
                <Field label="Tools used before" value={selected.tools} />
                <Field label="Wants to learn" value={selected.learn} />
                <Field label="Portfolio / link" value={selected.portfolio} />
                <Field label="Their (funny) question" value={selected.question} />
                <div className="pt-2 border-t border-[#2a221a] space-y-2">
                  <p className="text-[#c9a876] font-medium">Attendance</p>
                  {EVENT.days.map((d) => {
                    const present = !!selected[d.key];
                    const at = selected[`${d.key}At` as keyof Register] as string | undefined;
                    const by = selected[`${d.key}By` as keyof Register] as string | undefined;
                    return (
                      <div key={d.key} className="flex items-center gap-2">
                        {present ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-[#3a2f24] shrink-0" />
                        )}
                        <span>
                          <span className="font-medium text-[#e8dcc0]">{d.label}</span> (
                          {d.date.replace(" 2026", "")}):{" "}
                          {present ? (
                            <>
                              Present{by ? ` · ${by}` : ""}
                              {at ? ` · ${new Date(at).toLocaleString()}` : ""}
                            </>
                          ) : (
                            <span className="text-[#7d6f5a]">Absent</span>
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
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[#c9a876] font-medium">{label}</p>
      <p className="whitespace-pre-line text-[#d8c6a7]">
        {value ? value : <span className="text-[#7d6f5a]">—</span>}
      </p>
    </div>
  );
}