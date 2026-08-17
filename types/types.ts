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

  // Attendance (populated later by the /mentor scan flow)
  attended?: boolean;
  attendedAt?: string;     // ISO datetime when scanned
  markedBy?: string;       // mentor name who scanned them

  // Metadata
  time?: string;           // registration timestamp
  $id?: string;
}

// Payload the mentor scan sends to mark attendance
interface Attendance {
  scannedData: string;     // the registration $id encoded in the QR
  markedBy: string;        // mentor name
}