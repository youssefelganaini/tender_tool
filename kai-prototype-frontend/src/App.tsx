import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Users } from "./pages/database/users";

function App() {
  const [activePage, setActivePage] = useState("");

  return (
    <>
      <BrowserRouter>
        <SidebarProvider>
          <AppSidebar activePage={activePage} setActivePage={setActivePage} />
          <SidebarInset>
            <Routes>
              <Route path="/datenbank/nutzer" element={<Users />} />
            </Routes>
          </SidebarInset>
        </SidebarProvider>
      </BrowserRouter>
      {/* <Chatbot /> */}
    </>
  );
}

export default App;
