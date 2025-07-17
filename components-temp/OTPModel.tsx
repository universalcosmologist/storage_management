//this is otp model built using input-otp and alert dialog of some kind both of shad cn
"use client"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

import React, { useState } from 'react'
import Image from "next/image";
import { Button } from "./ui/button";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

const OTPModel = ({email,userId} : {email: string,userId:string}) => {

  const [isOpen,setIsOpen]=useState(true);
  const [password,setPassword]=useState("");
  const router=useRouter();
  const [isLoading,setIsLoading]=useState(false);
  const [errorMessage,setErrorMessage]=useState("");

  const handleSubmit=async(e:React.MouseEvent<HTMLButtonElement>)=>{
    e.preventDefault();
    //otp verfication will take place here now 
    setIsLoading(true);
    try {

    const result=await verifySecret({accountId:userId,password});
    
    if(result){
      setIsOpen(false);
      router.push('/');//home page 
    }else{
      setErrorMessage("otp verification failed please try again");
    }

    } catch (error) {
      console.log("error occured during verfication of otp",error);
    }
    setIsLoading(false);
  }

  const handleResendOtp=async()=>{
    try {
      await sendEmailOTP({userId,email});

    } catch (error) {
      console.log("error occured in resending otp to user",error);
    }
  }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
    <AlertDialogContent className="shad-alert-dialog">
    <AlertDialogHeader className="relative flex justify-center">
      <AlertDialogTitle className="h2 text-center">
            Enter Your OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button"
            />
      </AlertDialogTitle>
      <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            We&apos;ve sent a code to{" "}
            <span className="pl-1 text-brand">{email}</span>
      </AlertDialogDescription>
    </AlertDialogHeader>

    <InputOTP maxLength={6} value={password} onChange={setPassword}>
        <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="shad-otp-slot" />
            <InputOTPSlot index={1} className="shad-otp-slot" />
            <InputOTPSlot index={2} className="shad-otp-slot" />
            <InputOTPSlot index={3} className="shad-otp-slot" />
            <InputOTPSlot index={4} className="shad-otp-slot" />
            <InputOTPSlot index={5} className="shad-otp-slot" />
        </InputOTPGroup>
    </InputOTP>

    <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction
              onClick={handleSubmit}
              className="shad-submit-btn h-12"
              type="button"
              disabled={isLoading}
            >
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            {!isLoading && ( // Hide resend while loading
              <div className="subtitle-2 mt-2 text-center text-light-100">
                  Didn&apos;t get a code?
                  <Button
                    type="button"
                    variant="link"
                    className="pl-1 text-brand"
                    onClick={handleResendOtp}
                  >
                    Click to resend
                  </Button>
              </div>
            )}

            {errorMessage && (
              <div className="subtitle-2 mt-2 text-center text-light-100">
                {errorMessage}
              </div>
            )}
          </div>
    </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>
  )
}

export default OTPModel