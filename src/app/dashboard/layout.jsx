// Component.js
"use client";

import { useEffect, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SideBarLinks from "@/components/component/sidebar/sidebar-links";
import Cookies from "js-cookie"; 
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast"; 


export default function Component({ children }) {

  return (
    <SidebarProvider>
      <SideBarLinks />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 " />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <Toaster />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-x-hidden">
  {children}
</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
