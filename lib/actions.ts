import { database } from "./appwrite.config";

export async function CreateRegister(data: Register){
    try{
        await database.createDocument(
            process.env.DATABASE_ID!,
            process.env.REGISTER_ID!,
            "unique()",
            {
                name: data.name,
                email: data.email,
                roll: data.roll,
                phone: data.phone,
                reason: data.reason,
                projects: data.projects
            }
        )
    }catch(error){
        console.error("Faailed to register: ", error);
    }
}