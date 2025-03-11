
import React, { useState } from "react";
import { 
  Sidebar, 
  SidebarBody, 
  SidebarLink, 
  Logo, 
  LogoIcon 
} from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-sidebar-foreground dark:text-sidebar-foreground h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <UserCog className="text-sidebar-foreground dark:text-sidebar-foreground h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-sidebar-foreground dark:text-sidebar-foreground h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "/logout",
      icon: (
        <LogOut className="text-sidebar-foreground dark:text-sidebar-foreground h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  
  const [open, setOpen] = useState(false);
  
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-sidebar dark:bg-sidebar-primary w-full flex-1 mx-auto border border-sidebar-border dark:border-sidebar-border overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "User Account",
                href: "/profile",
                icon: (
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1">
        <div className="p-2 md:p-10 bg-background dark:bg-background flex flex-col gap-2 flex-1 w-full h-full">
          <h1 className="text-2xl font-bold">Dashboard Content</h1>
          <p>Your content goes here...</p>
        </div>
      </div>
    </div>
  );
}
