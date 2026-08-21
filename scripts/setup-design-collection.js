/**
 * Sets up the NEW Design Bootcamp collection from scratch — all question fields,
 * the 2-day attendance fields, and the `time` index. Run this ONCE against the
 * brand-new collection (it must be empty; nothing here touches the 178 web-dev
 * registrations, which live in a different collection).
 *
 * BEFORE running:
 *   1. In the Appwrite console, create a NEW collection in your database.
 *   2. Put its ID in `.env` as REGISTER_ID  (this replaces the old web-dev one —
 *      keep a copy of the old ID somewhere if you still need that event).
 *   3. Make sure APPWRITE_API_KEY has scopes: collections.write, documents.read,
 *      documents.write  (collections.write is needed to create attributes/index;
 *      you can remove it again afterward — the running app never needs it).
 *
 * Then, from the project root:
 *   node scripts/setup-design-collection.js
 *
 * Idempotent: anything that already exists is skipped, so it's safe to re-run.
 * node-appwrite v15 uses POSITIONAL arguments (verified against the SDK).
 */
const fs = require("fs");
const path = require("path");
const { Client, Databases } = require("node-appwrite");

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
const COLLECTION_ID = env.REGISTER_ID; // the NEW design-bootcamp collection

for (const [k, v] of Object.entries({ ENDPOINT, PROJECT_ID, API_KEY, DATABASE_ID, COLLECTION_ID })) {
  if (!v) {
    console.error(`Missing ${k} in .env — aborting.`);
    process.exit(1);
  }
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function safe(label, fn) {
  try {
    await fn();
    console.log(`  ✓ ${label}`);
  } catch (e) {
    if (e && (e.code === 409 || /already exists/i.test(e.message || ""))) {
      console.log(`  • ${label} already exists — skipped`);
    } else {
      console.error(`  ✗ ${label} failed:`, e.message || e);
      throw e;
    }
  }
}

// createStringAttribute(databaseId, collectionId, key, size, required, xdefault, array, encrypt)
const str = (key, size, required) =>
  safe(`${key} (string${required ? ", required" : ""})`, () =>
    databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, key, size, required)
  );
// createBooleanAttribute(databaseId, collectionId, key, required, xdefault, array)
const bool = (key) =>
  safe(`${key} (boolean, default false)`, () =>
    databases.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, key, false, false)
  );
// createDatetimeAttribute(databaseId, collectionId, key, required, xdefault, array)
const dt = (key) =>
  safe(`${key} (datetime)`, () =>
    databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, key, false)
  );
// createEmailAttribute(databaseId, collectionId, key, required, xdefault, array)
const emailAttr = (key, required) =>
  safe(`${key} (email${required ? ", required" : ""})`, () =>
    databases.createEmailAttribute(DATABASE_ID, COLLECTION_ID, key, required)
  );

async function waitAvailable(key, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const a = await databases.getAttribute(DATABASE_ID, COLLECTION_ID, key);
      if (a && a.status === "available") return true;
    } catch {}
    await sleep(1500);
  }
  return false;
}

async function run() {
  console.log(`Setting up collection "${COLLECTION_ID}"…\n`);

  console.log("Registration fields:");
  await str("name", 255, true);
  await emailAttr("email", true);
  await str("roll", 100, false);
  await str("phone", 30, false);
  await str("motivation", 2000, true);   // "What draws you to design?"
  await str("experience", 50, true);     // dropdown value
  await str("tools", 500, false);
  await str("learn", 1000, false);
  await str("portfolio", 500, false);
  await str("question", 2000, false);

  console.log("\nAttendance fields:");
  await bool("day1");
  await bool("day2");
  await dt("day1At");
  await dt("day2At");
  await str("day1By", 128, false);
  await str("day2By", 128, false);

  console.log("\nMetadata:");
  await dt("time");

  console.log("\nWaiting for the `time` attribute to become available (needed for the index)…");
  const ready = await waitAvailable("time");
  if (!ready) {
    console.log(
      "  … still processing. Create the index manually, or re-run this script in a minute (it skips what exists)."
    );
    return;
  }

  console.log("Creating the `time` index (board sorts newest-first):");
  // createIndex(databaseId, collectionId, key, type, attributes, orders)
  await safe("index: time (DESC)", () =>
    databases.createIndex(DATABASE_ID, COLLECTION_ID, "time", "key", ["time"], ["DESC"])
  );

  console.log("\nDone. The new collection is ready for the Design Bootcamp.");
}

run().catch(() => {
  console.error("\nSetup stopped on an error above.");
  process.exit(1);
});
