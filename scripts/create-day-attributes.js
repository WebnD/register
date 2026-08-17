/**
 * Adds the per-day attendance attributes to your EXISTING collection.
 * Nothing is deleted. Existing documents and the old attended/attendedAt/markedBy
 * attributes are left completely untouched.
 *
 * New attributes:
 *   day1, day2, day3        boolean, default false
 *   day1At, day2At, day3At  datetime, optional
 *   day1By, day2By, day3By  string(128), optional
 *
 * Run from the project root:
 *   node scripts/create-day-attributes.js
 *
 * Idempotent: attributes that already exist are skipped. Reads credentials from
 * .env (no hardcoded keys, unlike the old create-attributes.js — rotate that key).
 */
const fs = require("fs");
const path = require("path");
const { Client, Databases } = require("node-appwrite");

// ── tiny .env reader (handles "KEY =value" spacing, quotes, comments) ──
function loadEnv() {
  const p = path.join(process.cwd(), ".env");
  const txt = fs.readFileSync(p, "utf8");
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

const env = loadEnv();
const ENDPOINT =
  env.NEXT_PUBLIC_APPWRITE_ENDPOINT || env.APPWRITE_ENDPOINT || env.NEXT_PUBLIC_ENDPOINT;
const PROJECT_ID = env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || env.PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY || env.API_KEY;
const DATABASE_ID = env.DATABASE_ID;
const COLLECTION_ID = env.REGISTER_ID; // the collection the app actually reads/writes

for (const [k, v] of Object.entries({ ENDPOINT, PROJECT_ID, API_KEY, DATABASE_ID, COLLECTION_ID })) {
  if (!v) {
    console.error(`Missing ${k} in .env — aborting.`);
    process.exit(1);
  }
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

// Appwrite rejects a duplicate attribute with a 409 — treat that as "already there".
async function safe(label, fn) {
  try {
    await fn();
    console.log(`  ✓ created ${label}`);
  } catch (e) {
    if (e && (e.code === 409 || /already exists/i.test(e.message || ""))) {
      console.log(`  • ${label} already exists — skipped`);
    } else {
      console.error(`  ✗ ${label} failed:`, e.message || e);
      throw e;
    }
  }
}

async function run() {
  console.log(`Creating per-day attributes on collection "${COLLECTION_ID}"…`);

  // node-appwrite v15 uses POSITIONAL args:
  //   createBooleanAttribute(databaseId, collectionId, key, required, xdefault, array)
  //   createDatetimeAttribute(databaseId, collectionId, key, required, xdefault, array)
  //   createStringAttribute(databaseId, collectionId, key, size, required, xdefault, array, encrypt)
  for (const key of ["day1", "day2", "day3"]) {
    await safe(`${key} (boolean)`, () =>
      databases.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, key, false, false)
    );
  }

  for (const key of ["day1At", "day2At", "day3At"]) {
    await safe(`${key} (datetime)`, () =>
      databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, key, false)
    );
  }

  for (const key of ["day1By", "day2By", "day3By"]) {
    await safe(`${key} (string)`, () =>
      databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, key, 128, false)
    );
  }

  console.log("\nDone. Wait until all 9 show status 'Available' in the Appwrite console");
  console.log("(usually a few seconds), THEN run:  node scripts/backfill-day1.js");
}

run().catch((e) => {
  console.error("\nAttribute creation stopped on an error above.");
  process.exit(1);
});