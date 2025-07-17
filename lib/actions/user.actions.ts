"use server"
//this is for the server side actions of otp and all the authentication
import { createAdminClient, createSessionClient } from "../appwrite/index"
import { appwriteConfig } from "../appwrite/config";
import {ID, Query} from 'node-appwrite';
import { parseStringify } from "../utils";
import {cookies} from 'next/headers'
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

const getUserByEmail=async(email:string)=>{
  try {
    const {databases}=await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])],
    );

    return result.total>0 ? result.documents[0] : null;
  } catch (error) {
    console.log("error occured in getuserbyemail function",error);
  }
}

//now we need a function for otp but not making everytime unique
export const sendEmailOTP = async ({ userId,email }: { userId:string,email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(userId, email);

    return session.userId;
  } catch (error) {
    console.log("error occured failed to send the otp",error);
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const new_id=existingUser ? existingUser.userId  : ID.unique();
  const userId = await sendEmailOTP({ userId : new_id,email });
  if (!userId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        userId,
      },
    );
  }

  return parseStringify({ userId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    console.log("failed to verify th otp",error);
  }
};

export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    console.log("failed to sign-out the user",error);
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ userId:existingUser.userId, email });
      return parseStringify({ userId: existingUser.userId });
    }

    return parseStringify({ userId: null, error: "User not found" });
  } catch (error) {
    console.log("error occured in login ie sign in function",error);
  }
};

export const getCurrentUser=async()=>{
  //this is to get current user logged in ie using session
  try {
    const {account,databases}=await createSessionClient();

    const result = await account.get(); 

    if(!result) return null;

    console.log(result);

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("userId", result.$id)],
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);

  } catch (error) {
    console.log("error occured while getting user",error);
  }
};