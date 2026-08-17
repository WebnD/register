import * as sdk from 'node-appwrite';

// Keep the local variable names aligned with the environment names.
const NEXT_PUBLIC_APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || process.env.API_KEY;

// The original code read `NEXt_PUBLIC_ENDPOINT` (note the lowercase "t"). That
// typo also means it is NOT exposed to the browser bundle — which is fine here
// because node-appwrite is server-only. This accepts the env var from .env first,
// then falls back to older names so nothing breaks if they're already set.
const NEXT_PUBLIC_APPWRITE_ENDPOINT =
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
    process.env.APPWRITE_ENDPOINT ||
    process.env.NEXT_PUBLIC_ENDPOINT ||
    process.env.NEXt_PUBLIC_ENDPOINT;

const client = new sdk.Client();

client
    .setEndpoint(NEXT_PUBLIC_APPWRITE_ENDPOINT!) // Your API Endpoint
    .setProject(NEXT_PUBLIC_APPWRITE_PROJECT_ID!) // Your project ID
    .setKey(APPWRITE_API_KEY!); // Your secret API key

export const database = new sdk.Databases(client);
export const storage = new sdk.Storage(client);
export const users = new sdk.Users(client);