import React from 'react'
import { getCurrentUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNavigation from '@/components/MobileNavigation';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';

export const dynamic = "force-dynamic";

const get_user=async()=>{
try {
    const result=await getCurrentUser();
    return result;
} catch (error) {
    console.log("error in layout for getting user",error);
}
}
const layout = async({children}:{children:React.ReactNode}) => {

const res=await get_user();
if(!res){
    console.log("no-user");
    redirect("/sign-in");
}
console.log(res);

return  (
    <main className="flex h-screen">
      <Sidebar {...res} />

      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...res} />
        <Header Id={res.$id} userId={res.userId} />
        <div className="main-content">{children}</div>
      </section>

      <Toaster />
    </main>
  )
};

export default layout