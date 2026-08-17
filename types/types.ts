interface Register {
  // Registration answers
  name: string;
  email: string;
  roll: string;
  phone: string;
  intrigue: string;        // What intrigues you most about web development?
  topic: string;           // Any particular topic you want to learn in the workshop?
  knowledge: string;       // Current knowledge in this domain (dropdown)
  question?: string;       // Any (funny) questions you want to ask us? — ONLY optional field

  // Per-day attendance (populated by the /mentor scan flow, one field per event day)
  day1?: boolean;
  day2?: boolean;
  day3?: boolean;
  day1At?: string;         // ISO datetime scanned on Day 1
  day2At?: string;
  day3At?: string;
  day1By?: string;         // mentor who scanned them on Day 1
  day2By?: string;
  day3By?: string;

  // Legacy single-scan fields — KEPT as an untouched backup of the pre-per-day
  // system. Day 1 was backfilled from `attended`. Not written to any more.
  attended?: boolean;
  attendedAt?: string;
  markedBy?: string;

  // Metadata
  time?: string;           // registration timestamp
  $id?: string;
}

// Payload the mentor scan sends to mark attendance for ONE specific day.
interface Attendance {
  scannedData: string;     // the registration $id encoded in the QR
  markedBy: string;        // mentor name
  day: "day1" | "day2" | "day3";   // which event day this scan is for
}