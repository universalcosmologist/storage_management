"use server"

import { createAdminClient, createSessionClient } from "../appwrite"
import {InputFile} from 'node-appwrite/file'
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

export const uploadFile=async({
    file,
    ownerId,
    userId,
    path,
}:UploadFileProps)=>{
    //2 things to do first upload the file to the bucket then upload the metadata to the files collection in the db
    //adding in the bucket 
    try {
        const {storage,databases}=await createAdminClient();

        const inputFile=InputFile.fromBuffer(file,file.name);

        const bucketFile = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        inputFile,
        );

        const fileDocument = {
        type: getFileType(bucketFile.name).type,
        name: bucketFile.name,
        url: constructFileUrl(bucketFile.$id),
        extension: getFileType(bucketFile.name).extension,
        size: bucketFile.sizeOriginal,
        owner: ownerId,
        userId,
        users: [],
        bucketFileId: bucketFile.$id,
        };

        const newFile = await databases
        .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
        )
       .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        console.log("failed to create the file document",error);
        });

    revalidatePath(path);
    return newFile ?  parseStringify(newFile) : null;

    } catch (error) {
      console.log("error occured in uploading file",error);
    }
}

const list_queries=(
  currentUser : Models.Document,
  types:string[],
  searchText:string,
  sort:string,
  limit?:number,
)=>{
    const queries=[
        Query.or([
        Query.equal("owner",[currentUser.$id]),
        Query.contains("users",[currentUser.email])
    ])
    ];

    if (types.length > 0) queries.push(Query.equal("type", types));
    if (searchText) queries.push(Query.contains("name", searchText));
    if (limit) queries.push(Query.limit(limit));

    if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
    }
    return queries;
}

export const getFiles=async({types=[],searchText = "",
  sort = "$createdAt-desc",
  limit}:GetFilesProps)=>{
    //get all the files according to queries
    try {
        const {databases}=await createAdminClient();

        const currentUser=await getCurrentUser();

        if(!currentUser) throw new Error("user not found");

        const result_queries=list_queries(currentUser,types,searchText,sort,limit);

        const files=await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            result_queries,
        )
        //use the queries above
        return files ? parseStringify(files) : null;
    } catch (error) {
        console.log("error occured in getting user files",error);
    }
}

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {

try {
    const { databases } = await createAdminClient();

    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    fileId,
    {
        name: newName,
    },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
} catch (error) {
    console.log("failed to rename the file",error);
}
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {

  try {

    const { databases } = await createAdminClient();

    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    console.log("error occured in updating users",error);
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  

  try {

    const { databases, storage } = await createAdminClient();

    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    console.log("failed to delete the file",error);
  }
};

export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files?.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    console.log("error occured in getting usage summary",error);
  }
}