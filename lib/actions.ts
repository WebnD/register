import { ID, Query } from "node-appwrite";
import { database } from "./appwrite.config";

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
        intrigue: data.intrigue,
        topic: data.topic ?? "",
        knowledge: data.knowledge,
        question: data.question ?? "",
        attended: false,
        time: new Date().toISOString(),
      }
    );
    return id;
  } catch (error) {
    console.error("Failed to register: ", error);
    // returning undefined lets the API route report a real failure to the user
  }
}

// Marks a participant present. Idempotent: if already attended, returns the
// existing record instead of overwriting the original mentor/time.
export async function MarkAttendance(data: Attendance) {
  try {
    const existing = await database.getDocument(
      DATABASE_ID,
      REGISTER_ID,
      data.scannedData
    );

    if ((existing as any).attended) {
      return { alreadyMarked: true, record: existing };
    }

    const updated = await database.updateDocument(
      DATABASE_ID,
      REGISTER_ID,
      data.scannedData,
      {
        attended: true,
        attendedAt: new Date().toISOString(),
        markedBy: data.markedBy,
      }
    );

    return { alreadyMarked: false, record: updated };
  } catch (error) {
    console.error("Failed to mark attendance: ", error);
    throw new Error("Failed to mark attendance");
  }
}

export async function FetchInfo(id: string) {
  try {
    const response = await database.getDocument(
      DATABASE_ID,
      REGISTER_ID,
      id
    );
    return response;
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