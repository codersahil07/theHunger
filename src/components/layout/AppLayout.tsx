"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "./layout.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const isProfilePage = pathname === "/profile";
  const isHomePage = pathname === "/";
  const isFullWidthPage = isProfilePage || isHomePage;

  return (
    <div className="app-layout">
      <Header toggleSidebar={toggleSidebar} />
      <div className={isFullWidthPage ? "profile-wrapper" : "main-wrapper"}>
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} isFullWidthPage={isFullWidthPage} />
        <main className={isFullWidthPage ? "profile-content-area" : "content-area"}>
          {children}
        </main>
      </div>
      
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
      <Footer />
    </div>
  );
}
