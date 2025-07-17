"use client"
//for authentication flow we will store in backend the userId along with user
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import Link from 'next/link'
import {z} from 'zod'
import { Button } from '@/components/ui/button';
import {Form,FormControl,FormMessage,FormField,FormLabel,FormItem} from '@/components/ui/form';
import {Input} from '@/components/ui/input'
import { useState } from 'react' 
import { createAccount, signInUser } from '@/lib/actions/user.actions'
import OTPModel from './OTPModel'

type AuthType="sign-in" | "sign-up";
const get_schema=(type : AuthType)=>{
  return z.object({
    email: z.email(),
    fullName:
      type === "sign-up"
        ? z.string().min(2).max(50)
        : z.string().optional(),
  });
}

const AuthForm=({type} : {type: AuthType})=>{
  const [isLoading,setIsLoading]=useState(false); 
  const [userId,setUserId]=useState(null);
  const [errorMessage,setErrorMessage]=useState("");

  const formSchema=get_schema(type);

  const form=useForm<z.infer<typeof formSchema>>({
    resolver:zodResolver(formSchema),
    defaultValues:{
        email: "",
        fullName:"",
    }
  });

  const onSubmit=async(values: z.infer<typeof formSchema>)=>{
    //process the form details here
    setIsLoading(true);
    setErrorMessage("");

    try {
      const user =
        type === "sign-up"
          ? await createAccount({
              fullName: values.fullName || "",
              email: values.email,
            })
          : await signInUser({ email: values.email });

      if(user && user.userId) {setUserId(user.userId);}
      else {
        if(type==="sign-in") {setErrorMessage("failed to sign in user");}
        else setErrorMessage("failed to sign up the user");
      }
    } catch {
      setErrorMessage("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
     <Form {...form}>
     <form onSubmit={form.handleSubmit(onSubmit)} className='auth-form'>
        <h1 className="form-title">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
        </h1>

        {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Full Name</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="shad-input"
                        {...field}
                      />
                    </FormControl>
                  </div>

                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="shad-form-item">
              <FormLabel className="shad-form-label">Email</FormLabel>

                <FormControl>
                <Input
                    placeholder="Enter your email"
                    className="shad-input"
                    {...field}
                />
                </FormControl>
                </div>

                <FormMessage className="shad-form-message" />
            </FormItem>
            )}
          />
        <Button
            type="submit"
            className="form-submit-button"
            disabled={isLoading}
          >
            {type === "sign-in" ? "Sign In" : "Sign Up"}

            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
        </Button>

        {errorMessage && <p className="error-message">*{errorMessage}</p>}

         <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="ml-1 font-medium text-brand"
            >
              {" "}
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
         </div>
       
     </form>
    </Form>

    {userId && (
        <OTPModel email={form.getValues("email")} userId={userId} />
      )}
    </>
  )


}

export default AuthForm;