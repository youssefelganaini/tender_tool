import * as React from "react";

import { NavAI } from "@/components/sidebar/nav-ai";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { data } from "./data";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  activePage: string;
  setActivePage: (page: string) => void;
};

export function AppSidebar({
  activePage,
  setActivePage,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          activePage={activePage}
          setActivePage={setActivePage}
        />
        <NavAI items={data.aiTools} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
