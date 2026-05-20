import React, { useState } from 'react';
import { LayoutDashboard, ListFilter, BarChart3, Settings, Brain, PlusCircle, Menu, X as CloseIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
      active 
        ? "bg-blue-600/10 text-blue-500 border border-blue-500/20" 
        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
    )}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export const AppLayout: React.FC<{ children: React.ReactNode, activeTab: string, setActiveTab: (tab: string) => void }> = ({ 
  children, 
  activeTab, 
  setActiveTab 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'trades', label: 'Trade Log', icon: <ListFilter size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'psychology', label: 'Psychology', icon: <Brain size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-800 bg-[#0c0c0e] flex-col p-4">
        <div className="flex items-center gap-2 px-2 py-6 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white uppercase">FX</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Journal Pro</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <SidebarItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => setActiveTab(item.id)} 
            />
          ))}
        </nav>
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm">
          <div className="w-72 h-full bg-[#0c0c0e] border-r border-slate-800 p-4 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white uppercase">FX</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">Journal Pro</h1>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                <CloseIcon size={24} />
              </button>
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <SidebarItem 
                  key={item.id}
                  icon={item.icon} 
                  label={item.label} 
                  active={activeTab === item.id} 
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }} 
                />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          
          <button 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20"
            onClick={() => setActiveTab('new-trade')}
          >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">New Trade</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          {children}
        </div>

        {/* Mobile Bottom Bar (Alternative Naviagtion) */}
        <nav className="lg:hidden h-16 border-t border-slate-800 bg-[#0c0c0e] flex items-center justify-around px-2 relative z-20">
          {navigation.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                activeTab === item.id ? "text-blue-500" : "text-slate-500"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
              activeTab === 'settings' ? "text-blue-500" : "text-slate-500"
            )}
          >
            <Settings size={20} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </nav>
      </main>
    </div>
  );
};
