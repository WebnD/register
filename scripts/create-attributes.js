const sdk = require("node-appwrite");

const client = new sdk.Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("YOUR_PROJECT_ID")
    .setKey("YOUR_API_KEY");

const databases = new sdk.Databases(client);

const DATABASE_ID = "YOUR_DATABASE_ID";
const COLLECTION_ID = "YOUR_COLLECTION_ID";

async function createAttributes() {
    try {
        // Strings
        await databases.createStringAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "name",
            size: 255,
            required: true
        });

        await databases.createStringAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "email",
            size: 255,
            required: true
        });

        await databases.createStringAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "roll",
            size: 64,
            required: true
        });

        await databases.createStringAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "phone",
            size: 20,
            required: true
        });

        await databases.createStringAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "intrigue",
            size: 2000,
            required: true
        });

        await databases.createStringAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "topic",
            size: 2000,
            required: true
        });

        await databases.createStringAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "knowledge",
            size: 32,
            required: true
        });

        await databases.createStringAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "question",
            size: 2000,
            required: false
        });

        await databases.createStringAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "markedBy",
            size: 128,
            required: false
        });

        // Boolean
        await databases.createBooleanAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "attended",
            required: false,
            xdefault: false
        });

        // Datetime
        await databases.createDatetimeAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "attendedAt",
            required: false
        });

        await databases.createDatetimeAttribute({
            databaseId: DATABASE_ID,
            collectionId: COLLECTION_ID,
            key: "time",
            required: false
        });

        console.log("All attributes created successfully!");
    } catch (error) {
        console.error("Error:", error);
    }
}

createAttributes();