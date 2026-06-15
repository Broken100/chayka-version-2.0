/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { t } from '../../utils/translations';
import {
  Calendar,
  Bell,
  Sliders,
  Compass,
  Coffee,
  Globe
} from 'lucide-react';

interface AppHeaderProps {
  activeView: string;
  setActiveView: (view: 'home' | 'menu' | 'booking' | 'admin') => void;
}

export default function AppHeader({ activeView, setActiveView }: AppHeaderProps) {
  const { language, setLanguage, notifications } = useReservation();
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav.home', language), icon: Compass },
    { id: 'menu', label: t('nav.menu', language), icon: Coffee },
    { id: 'booking', label: t('nav.booking', language), icon: Calendar },
    { id: 'admin', label: t('nav.admin', language), icon: Sliders }
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-coffee-bg/95 backdrop-blur-md border-b border-espresso/10 transition" id="chayka-main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Brand */}
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 text-left cursor-pointer group"
          id="brand-logo-btn"
        >
          <div className="flex flex-col">
            <div className="w-28 h-28 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 relative">
              <img
                src="/logo.svg"
                alt="Logo Chayka"
                className="absolute inset-0 w-full h-full object-cover z-10"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
            </div>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" id="header-desktop-nav">
          {navItems.map((item) => {
            const IsActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1 py-1.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
                  IsActive
                    ? 'border-espresso text-espresso pb-1'
                    : 'border-transparent text-espresso/60 hover:text-espresso hover:border-espresso/20'
                }`}
                id={`nav-item-${item.id}`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Real-time notification Bell and Actions center */}
        <div className="flex items-center gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="w-10 h-10 rounded-none bg-transparent border border-espresso/10 hover:border-espresso hover:bg-espresso/5 text-espresso flex items-center justify-center transition cursor-pointer relative"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            id="language-toggle-btn"
          >
            <Globe className="w-4 h-4" />
            <span className="absolute bottom-0 right-0 bg-espresso text-coffee-bg text-[8px] px-1 font-bold uppercase">
              {language}
            </span>
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="w-10 h-10 rounded-none bg-transparent border border-espresso/10 hover:border-espresso hover:bg-espresso/5 text-espresso flex items-center justify-center transition cursor-pointer relative"
              id="bell-notification-btn"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-red text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification dropdown sidebar block */}
            {showNotificationCenter && (
              <div className="absolute right-0 mt-3 w-80 bg-coffee-bg border border-espresso/20 rounded-none p-4 shadow-2xl z-50 text-left space-y-3" id="notif-dropdown">
                <div className="flex justify-between items-center border-b border-espresso/10 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-espresso">
                    {language === 'es' ? 'Notificaciones Live' : 'Live Notifications'}
                  </h4>
                  <button
                    onClick={() => setShowNotificationCenter(false)}
                    className="text-espresso/60 hover:text-espresso text-[10px] font-bold uppercase tracking-wider"
                  >
                    {language === 'es' ? 'Cerrar' : 'Close'}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 bg-espresso/5 rounded-none border border-espresso/10 flex gap-2 items-start text-xs">
                      <div className="mt-1">
                        {n.type === 'success' ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 block" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 block" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-espresso uppercase tracking-wider text-[10px]">{n.title}</div>
                        <p className="text-espresso/80 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-espresso/50 block mt-1.5 font-semibold tracking-wider font-mono">{n.time} HS</span>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="col-span-full py-4 text-center text-xs text-espresso/40 font-serif italic">
                      {language === 'es' ? 'No hay notificaciones.' : 'No notifications.'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Booking direct trigger */}
          <button
            onClick={() => setActiveView('booking')}
            className="bg-espresso hover:bg-espresso/90 text-coffee-bg font-bold px-4 py-2.5 rounded-none text-xs uppercase tracking-widest flex md:hidden items-center gap-1 cursor-pointer transition-all shadow-md"
            id="mobile-quick-book-btn"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('nav.booking', language)}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden border-t border-espresso/10 bg-coffee-bg" id="header-mobile-tabs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex-1 py-3.5 text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeView === item.id ? 'text-espresso bg-espresso/10 font-black' : 'text-espresso/60'
            }`}
            id={`mobile-tab-${item.id}`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
