/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, X, Inbox } from 'lucide-react';
import { useReservation } from '../../context/ReservationContext';
import { useNotificationsQuery } from '../../lib/queries';
import { useDismissNotification } from '../../lib/mutations';
import type { Notification } from '../../types';

const RELATIVE_DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' }
];

/**
 * Format a timestamp as a short relative string in the current language.
 * Mirrors the format the rest of the app uses (e.g., "hace 5 min", "2h ago").
 */
function formatRelative(iso: string, language: 'es' | 'en'): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);
  let value = diffSec;
  let unit: Intl.RelativeTimeFormatUnit = 'second';
  for (const div of RELATIVE_DIVISIONS) {
    if (absSec < div.amount) {
      unit = div.unit;
      break;
    }
    value = Math.round(diffSec / div.amount);
    unit = div.unit;
  }
  const rtf = new Intl.RelativeTimeFormat(language === 'es' ? 'es' : 'en', { numeric: 'auto' });
  return rtf.format(value, unit);
}

function pickTitleAndBody(n: Notification, language: 'es' | 'en') {
  return {
    title: language === 'es' ? n.titleEs : n.titleEn,
    body: language === 'es' ? n.bodyEs : n.bodyEn
  };
}

export default function NotificationHistory() {
  const { language, addNotification: _addNotification } = useReservation();
  const notificationsQuery = useNotificationsQuery({ limit: 50 });
  const dismiss = useDismissNotification();
  // Tracks which rows are fading out so the user gets the visual confirmation
  // that the action landed. We don't actually unmount; the server response
  // invalidates the query and the row disappears naturally.
  const [fadingIds, setFadingIds] = useState<Set<number>>(new Set());

  const handleDismiss = (id: number) => {
    setFadingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    dismiss.mutate(id);
  };

  if (notificationsQuery.isLoading) {
    return (
      <div className="bg-white border border-espresso/10 rounded-xl p-6 text-center text-espresso/60 text-sm animate-pulse">
        <span>{language === 'es' ? 'Cargando notificaciones…' : 'Loading notifications…'}</span>
      </div>
    );
  }

  if (notificationsQuery.isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800 text-sm">
        {language === 'es'
          ? 'No se pudieron cargar las notificaciones.'
          : 'Failed to load notifications.'}
      </div>
    );
  }

  const rows = notificationsQuery.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-dashed border-espresso/15 rounded-xl p-12 flex flex-col items-center justify-center gap-2 text-espresso/50">
        <Inbox className="w-8 h-8" />
        <p className="text-sm font-medium">
          {language === 'es' ? 'Sin notificaciones todavía' : 'No notifications yet'}
        </p>
        <p className="text-xs text-espresso/40">
          {language === 'es'
            ? 'Las nuevas reservas y cambios de estado aparecerán aquí.'
            : 'New reservations and status changes will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" id="notifications-list">
      {rows.map((n) => {
        const { title, body } = pickTitleAndBody(n, language);
        const isFading = fadingIds.has(n.id);
        const isUnread = n.dismissedAt === null;
        return (
          <div
            key={n.id}
            data-testid={`notification-${n.id}`}
            className={`bg-white border border-espresso/10 rounded-xl p-4 flex gap-3 items-start transition-opacity duration-500 ${
              isFading ? 'opacity-0' : 'opacity-100'
            } ${isUnread ? 'border-l-4 border-l-ochre' : ''}`}
          >
            {/* Unread dot */}
            <div className="pt-1.5 flex-shrink-0">
              {isUnread ? (
                <span
                  className="block w-2.5 h-2.5 rounded-full bg-ochre"
                  title={language === 'es' ? 'No leída' : 'Unread'}
                  aria-label="unread"
                />
              ) : (
                <span className="block w-2.5 h-2.5 rounded-full bg-espresso/10" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="w-4 h-4 text-ochre flex-shrink-0" />
                  <h4 className="font-serif font-bold text-sm text-espresso truncate">{title}</h4>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-espresso/40 flex-shrink-0">
                  {formatRelative(n.createdAt, language)}
                </span>
              </div>
              <p className="text-xs text-espresso/70 mt-1 leading-relaxed">{body}</p>
            </div>

            {isUnread && (
              <button
                onClick={() => handleDismiss(n.id)}
                disabled={dismiss.isPending}
                className="flex-shrink-0 text-[10px] uppercase tracking-wider font-bold text-espresso/50 hover:text-espresso hover:bg-espresso/5 px-2 py-1 rounded transition-colors disabled:opacity-50"
                id={`notification-dismiss-${n.id}`}
              >
                <X className="w-3 h-3 inline mr-1" />
                {language === 'es' ? 'Descartar' : 'Dismiss'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
