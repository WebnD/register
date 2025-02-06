import { ID, Query } from "node-appwrite";
import { database } from "./appwrite.config";
import { stat } from "fs";

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
                projects: data.projects,
                status: "not-checked-in",
                time: new Date()
            }
        )
        return id;
    }catch(error){
        console.error("Faailed to register: ", error);
    }
}


export async function UpdateInductee(data: Update){
    try{
        await database.updateDocument(
            process.env.DATABASE_ID!,
            process.env.REGISTER_ID!,
            data.scannedData,
            {
                status: data.status,
                rating: data.rating,
                remarks: data.remarks,
                panelName: data.panelName
            }
        );

        return data.scannedData
    }catch(error){
        console.error("Failed to update the inducte: ", error);
        throw new Error ("Failed to update the inductee");

    }
}


export async function FetchInfo(data: string){
    try{
        const response = await database.getDocument(
            process.env.DATABASE_ID!,
            process.env.REGISTER_ID!,
            data
            
        );

        return response;
    }catch(error){
        console.error("Failed to fetch the info: ", error);
        throw new Error ("Failed to fetch the info");

    }
}

export async function FetchRegistrations(){
    try{
        const response = await database.listDocuments(
            process.env.DATABASE_ID!,
            process.env.REGISTER_ID!,
            [Query.equal("status", ["Selected", "Pending", "Rejected"])]
        );

        const registrations = response.documents;
        return registrations;
    }catch(error){
        console.error("Failed to fetch the registrations: ", error);
        throw new Error ("Failed to fetch the registrations");
    }
}


export async function UpdateStatus(id: string, status: string){
    await database.updateDocument(
        process.env.DATABASE_ID!,
            process.env.REGISTER_ID!,
            id,
            {
                status: status
            }
    )
}