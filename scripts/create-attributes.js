const sdk = require("node-appwrite");

const client = new sdk.Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("6a7b34ba00360d7b9f66")
    .setKey("standard_48229ba492a5c84882618b689b1e02a7df21fef6e99efc02643b5e241786eded2cca4502021dcfc6fc10a5253ba030def10f835c471c838878138b901058a26f4e3fe6c4716b9d68d4133f54d232b70d13d2f64a276684dede59cca55e33725ff43fa079acdbb93a4e53cf63fd88362a8dba45195225608229573e801aa4a985");

const databases = new sdk.Databases(client);

const DATABASE_ID = "6a7b3578001abd8c9dd0";
const COLLECTION_ID = "collection";

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