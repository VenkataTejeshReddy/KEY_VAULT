'use client';

import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LoginView } from '../components/views/LoginView';
import { DashboardView } from '../components/views/DashboardView';
import { VaultView } from '../components/views/VaultView';
import { ServiceDetailView } from '../components/views/ServiceDetailView';
import { ForecastView } from '../components/views/ForecastView';
import { SettingsView } from '../components/views/SettingsView';

export default function Home() {
  const { isAuthenticated, activeView } = useVault();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If user is not authenticated or explicitly on the login view, show Login screen
  if (!isAuthenticated || activeView === 'login') {
    return <LoginView />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
      {/* Navbar */}
      <Navbar onToggleSidebarMobile={() => setMobileSidebarOpen(true)} />

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'vault' && <VaultView />}
          {activeView === 'service-detail' && <ServiceDetailView />}
          {activeView === 'forecast' && <ForecastView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
