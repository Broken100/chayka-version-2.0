/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle, Coffee, ShieldAlert, X } from 'lucide-react';

export interface NotificationMsg {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'alert';
  time: string;
}

interface NotificationToastProps {
  notifications: NotificationMsg[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none" id="notification-container">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-stone-900/95 backdrop-blur-md border border-amber-900/40 text-stone-100 p-4 rounded-xl shadow-xl flex gap-3 items-start justify-between"
            id={`notif-toast-${notif.id}`}
          >
            <div className="flex gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {notif.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
                {notif.type === 'info' && (
                  <Coffee className="w-5 h-5 text-amber-400" />
                )}
                {notif.type === 'alert' && (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-xs text-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                  <span>{notif.title}</span>
                  <span className="text-[10px] text-stone-500 font-normal normal-case">
                    {notif.time}
                  </span>
                </h4>
                <p className="text-stone-300 text-sm mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDismiss(notif.id)}
              className="text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
              id={`notif-close-${notif.id}`}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
