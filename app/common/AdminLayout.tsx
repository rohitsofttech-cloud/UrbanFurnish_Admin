'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-bgColor flex transition-colors duration-200 overflow-x-hidden print:min-h-0 print:bg-white print:overflow-visible print:block">
      {/* Sidebar Navigation */}
      <div className="print:hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 lg:ml-64 min-w-0 print:ml-0 print:block print:w-full">
        <div className="print:hidden">
          <Header toggleSidebar={toggleSidebar} />
        </div>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible print:block">
          {children}
        </main>
      </div>
    </div>
  );
}
