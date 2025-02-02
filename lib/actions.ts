import { ID } from "node-appwrite";
import { database } from "./appwrite.config";

export async function CreateRegister(data: Register){
    try{
        const id = ID.unique();
        await database.createDocument(
            process.env.DATABASE_ID!,
            process.env.REGISTER_ID!,
            id,
            {
                name: data.name,
                email: data.email,
                roll: data.roll,
                phone: data.phone,
                reason: data.reason,
                projects: data.projects
            }
        )
        return id;
    }catch(error){
        console.error("Faailed to register: ", error);
    }
}