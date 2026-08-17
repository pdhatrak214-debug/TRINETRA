import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bell, Shield, Radio, Activity, ChevronDown } from 'lucide-react';
import { SimulatedBadge } from '@/components/ui';

export default function Layout() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const navItems = [
    { to: '/', label: 'Command Center', icon: Activity },
    { to: '/risk-intelligence', label: 'Risk Intelligence', icon: Radio },
    { to: '/tactical-response', label: 'Tactical Response', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-[1000] bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left — Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-md shrink-0">
                  <Shield className="text-white" size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800 tracking-tight truncate">TRINETRA AI</span>
                    <SimulatedBadge className="hidden lg:inline-flex" />
                  </div>
                  <p className="text-[10px] text-slate-500 hidden sm:block leading-tight">
                    Traffic Risk Intelligence &amp; Network Tactical Response Assistant
                  </p>
                </div>
              </div>
            </div>

            {/* Center — Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right — Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100">
                <span className="text-xs font-semibold text-slate-700">NAGPUR</span>
                <ChevronDown size={12} className="text-slate-400" />
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-700">SYSTEM ONLINE</span>
              </div>
              <div className="hidden xl:block text-xs text-slate-500 tabular-nums w-[180px] text-right">
                {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                {now.toLocaleTimeString('en-IN', { hour12: false })}
              </div>
              <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Notifications">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                OP
              </div>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon size={14} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-6 py-6 max-w-[1600px] w-full mx-auto">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] text-slate-500">
            SIMULATED DATA — NOT LIVE POLICE DATA · Prototype using simulated traffic and police data.
          </p>
          <p className="text-[11px] text-slate-400">TRINETRA AI · Hackathon MVP</p>
        </div>
      </footer>
    </div>
  );
}
