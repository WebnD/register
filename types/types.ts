interface Register {
  // Registration answers
  name: string;          // required
  email: string;         // required — needed to send the ticket
  roll?: string;
  phone?: string;
  motivation: string;    // required — "What draws you to design?"
  experience: string;    // required — dropdown (Complete beginner … Advanced)
  tools?: string;        // which design tools they've used before
  learn?: string;        // what they're most excited to learn
  portfolio?: string;    // portfolio / Behance / Instagram link

  question?: string;     // "Any (funny) questions for us?" — optional

  // Per-day attendance (populated by the /mentor scan flow, one field per event day)
  day1?: boolean;
  day2?: boolean;
  day1At?: string;       // ISO datetime scanned on Day 01
  day2At?: string;
  day1By?: string;       // mentor who scanned them on Day 01
  day2By?: string;

  // Metadata
  time?: string;         // registration timestamp
  $id?: string;
}

// Payload the mentor scan sends to mark attendance for ONE specific day.
interface Attendance {
  scannedData: string;   // the registration $id encoded in the QR
  markedBy: string;      // mentor name
  day: "day1" | "day2";  // which event day this scan is for
}