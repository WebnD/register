import { ID, Query } from "node-appwrite";
import { database } from "./appwrite.config";
import { isDayKey, dayLabel } from "./event";

const DATABASE_ID = process.env.DATABASE_ID!;
const REGISTER_ID = process.env.REGISTER_ID!;

export async function CreateRegister(data: Register) {
  try {
    const id = ID.unique();
    await database.createDocument(
      DATABASE_ID,
      REGISTER_ID,
      id,
      {
        name: data.name,
        email: data.email,
        roll: data.roll ?? "",
        phone: data.phone ?? "",
        motivation: data.motivation,
        experience: data.experience,
        tools: data.tools ?? "",
        learn: data.learn ?? "",
        portfolio: data.portfolio ?? "",
        question: data.question ?? "",
        day1: false,
        day2: false,
        time: new Date().toISOString(),
      }
    );
    return id;
  } catch (error) {
    console.error("Failed to register: ", error);
    // returning undefined lets the API route report a real failure to the user
  }
}

// Marks a participant present for ONE specific event day (day1 | day2).
// Idempotent PER DAY: if they're already marked for THAT day, it returns the
// existing record without overwriting who/when first scanned them — but a scan
// on a different day still marks that day. This is what lets someone be present
// on Day 01 but not Day 02, etc.
export async function MarkAttendance(data: Attendance) {
  try {
    const dayKey = data.day;
    if (!isDayKey(dayKey)) {
      throw new Error("Invalid or missing event day.");
    }

    const existing = await database.getDocument(
      DATABASE_ID,
      REGISTER_ID,
      data.scannedData
    );

    // Already present for THIS day → don't overwrite the original scan.
    if ((existing as any)[dayKey]) {
      return { alreadyMarked: true, record: existing, day: dayKey };
    }

    const updated = await database.updateDocument(
      DATABASE_ID,
      REGISTER_ID,
      data.scannedData,
      {
        [dayKey]: true,
        [`${dayKey}At`]: new Date().toISOString(),
        [`${dayKey}By`]: data.markedBy,
      }
    );

    return { alreadyMarked: false, record: updated, day: dayKey };
  } catch (error) {
    console.error(
      `Failed to mark attendance for ${dayLabel(data?.day as any)}: `,
      error
    );
    throw new Error("Failed to mark attendance");
  }
}

export async function FetchInfo(id: string) {
  try {
    return await database.getDocument(DATABASE_ID, REGISTER_ID, id);
  } catch (error) {
    console.error("Failed to fetch the info: ", error);
    throw new Error("Failed to fetch the info");
  }
}

export async function FetchRegistrations() {
  try {
    const response = await database.listDocuments(
      DATABASE_ID,
      REGISTER_ID,
      [Query.limit(1000), Query.orderDesc("time")]
    );
    return response.documents;
  } catch (error) {
    console.error("Failed to fetch the registrations: ", error);
    throw new Error("Failed to fetch the registrations");
  }
}