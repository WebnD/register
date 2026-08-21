/**
 * Backfills Day 1 (16 Aug) from the OLD single `attended` flag.
 *
 * For every existing document where attended === true and day1 isn't already set:
 *   day1   = true
 *   day1At = attendedAt (or the registration time, or now, as a fallback)
 *   day1By = markedBy   (or "backfill")
 *
 * The old attended/attendedAt/markedBy fields are NOT changed or removed — they
 * stay as a backup. Day 2 and Day 3 are left false (they get set by live scans).
 *
 * Run AFTER create-day-attributes.js has finished and the attributes show
 * "Available" in Appwrite:
 *   node scripts/backfill-day1.js
 *
 * Idempotent: re-running skips anyone whose day1 is already true. Safe to run twice.
 */
const fs = require("fs");
const path = require("path");
const { Client, Databases, Query } = require("node-appwrite");

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
const COLLECTION_ID = env.REGISTER_ID;

for (const [k, v] of Object.entries({ ENDPOINT, PROJECT_ID, API_KEY, DATABASE_ID, COLLECTION_ID })) {
  if (!v) {
    console.error(`Missing ${k} in .env — aborting.`);
    process.exit(1);
  }
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

async function fetchAll() {
  const all = [];
  let cursor = null;
  while (true) {
    const queries = [Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
    all.push(...res.documents);
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
  }
  return all;
}

async function run() {
  console.log("Loading all registrations…");
  const docs = await fetchAll();
  console.log(`Found ${docs.length} documents.`);

  let updated = 0;
  let alreadyDay1 = 0;
  let notAttended = 0;

  for (const d of docs) {
    if (d.day1 === true) {
      alreadyDay1++;
      continue;
    }
    if (d.attended !== true) {
      notAttended++;
      continue;
    }
    const day1At = d.attendedAt || d.time || new Date().toISOString();
    const day1By = d.markedBy || "backfill";
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, d.$id, {
        day1: true,
        day1At,
        day1By,
      });
      updated++;
      console.log(`  ✓ Day 1 set for ${d.name || d.$id}`);
    } catch (e) {
      console.error(`  ✗ failed for ${d.name || d.$id}:`, e.message || e);
    }
  }

  console.log("\n── Backfill summary ──");
  console.log(`  Day 1 newly set:            ${updated}`);
  console.log(`  Already had Day 1:          ${alreadyDay1}`);
  console.log(`  Never attended (untouched): ${notAttended}`);
  console.log(`  Total documents:            ${docs.length}`);
}

run().catch((e) => {
  console.error("\nBackfill stopped on an error:", e.message || e);
  process.exit(1);
});
