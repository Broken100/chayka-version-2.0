import React, { useState } from 'react';
import { Reservation, KanbanStage } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import { t } from '../../utils/translations';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CreditCard,
  ChevronRight,
  ArrowRightLeft,
  FileText
} from 'lucide-react';

export default function KanbanBoard() {
  const { 
    reservations, 
    updateReservationStatus, 
    tables, 
    language,
    addNotification
  } = useReservation();

  // Keep track of which column is being hovered during a drag operation
  const [activeDragOverCol, setActiveDragOverCol] = useState<KanbanStage | null>(null);

  const columns: { stage: KanbanStage; titleKey: string; colorClass: string; bgColClass: string }[] = [
    { 
      stage: 'pending', 
      titleKey: 'admin.columns.pending', 
      colorClass: 'text-amber-800 border-amber-600/30 bg-amber-55/60',
      bgColClass: 'bg-editorial-bg/60'
    },
    { 
      stage: 'confirmed', 
      titleKey: 'admin.columns.confirmed', 
      colorClass: 'text-emerald-800 border-emerald-600/30 bg-emerald-50/60',
      bgColClass: 'bg-editorial-bg/60'
    },
    { 
      stage: 'cancelled', 
      titleKey: 'admin.columns.cancelled', 
      colorClass: 'text-rose-800 border-rose-600/30 bg-rose-50/60',
      bgColClass: 'bg-editorial-bg/60'
    }
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: KanbanStage) => {
    e.preventDefault();
    if (activeDragOverCol !== stage) {
      setActiveDragOverCol(stage);
    }
  };

  const handleDragLeave = () => {
    setActiveDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: KanbanStage) => {
    e.preventDefault();
    setActiveDragOverCol(null);
    const reservationId = e.dataTransfer.getData('text/plain');
    if (!reservationId) return;

    const res = reservations.find(r => r.id === reservationId);
    if (res && res.status !== targetStage) {
      updateReservationStatus(reservationId, targetStage);
      
      const statusLabel = t(`admin.columns.${targetStage}`, language);
      addNotification(
        language === 'es' ? 'Estado Actualizado' : 'Status Updated',
        t('toasts.statusUpdated', language).replace('{status}', statusLabel),
        targetStage === 'cancelled' ? 'alert' : 'success'
      );
    }
  };

  // Helper to format payment status
  const getPaymentStatusBadge = (status: Reservation['paymentStatus']) => {
    switch (status) {
      case 'success':
      case 'simulated_paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
            <CreditCard className="w-3 h-3" />
            {language === 'es' ? 'Pagado' : 'Paid'}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            {language === 'es' ? 'Pago Pendiente' : 'Payment Pending'}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-800 border border-rose-500/20">
            <CreditCard className="w-3 h-3" />
            {language === 'es' ? 'Fallido' : 'Failed'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-espresso/5 text-espresso/60 border border-espresso/10">
            <CreditCard className="w-3 h-3" />
            {language === 'es' ? 'En Local' : 'At Venue'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4" id="kanban-board-container">
      <div className="flex items-center gap-2 text-xs text-espresso/60 bg-editorial-bg border border-espresso/10 p-3 rounded-xl">
        <ArrowRightLeft className="w-4 h-4 text-ochre" />
        <span>{t('admin.kanban.dragNotice', language)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {columns.map(({ stage, titleKey, colorClass, bgColClass }) => {
          const colReservations = reservations.filter(r => r.status === stage);
          const isHovered = activeDragOverCol === stage;

          return (
            <div
              key={stage}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
              className={`flex flex-col rounded-2xl border transition-all p-4 min-h-[500px] ${bgColClass} ${
                isHovered 
                  ? 'border-ochre ring-2 ring-ochre/10 shadow-md scale-[1.01]' 
                  : 'border-espresso/15 shadow-sm'
              }`}
              id={`kanban-col-${stage}`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-espresso/10">
                <h3 className="font-serif font-black text-sm uppercase tracking-wider text-espresso flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${stage === 'confirmed' ? 'bg-emerald-600' : stage === 'cancelled' ? 'bg-rose-600' : 'bg-amber-600'}`} />
                  {t(titleKey, language)}
                </h3>
                <span className="text-[10px] font-bold bg-espresso/10 text-espresso px-2 py-0.5 rounded-full">
                  {colReservations.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
                {colReservations.map((res) => {
                  const tableInfo = tables.find(t => t.id === res.tableId);
                  const tableName = tableInfo ? tableInfo.name[language] : res.tableId;
                  const areaLabel = t(`booking.tableSelector.areas.${res.area}`, language);

                  return (
                    <div
                      key={res.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, res.id)}
                      className="bg-white border border-espresso/15 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-espresso/30 transition-all cursor-grab active:cursor-grabbing text-left space-y-3 relative group"
                      id={`kanban-card-${res.id}`}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] font-black text-ochre uppercase tracking-wider">
                          {res.id}
                        </span>
                        <div className="flex flex-col gap-1 items-end">
                          {getPaymentStatusBadge(res.paymentStatus)}
                        </div>
                      </div>

                      {/* Client Details */}
                      <div className="space-y-1">
                        <h4 className="font-serif font-black text-sm text-espresso">
                          {res.customerName}
                        </h4>
                        <div className="space-y-0.5 text-[11px] text-espresso/70">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-espresso/40 flex-shrink-0" />
                            <span className="font-mono">{res.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-espresso/40 flex-shrink-0" />
                            <span className="truncate">{res.customerEmail}</span>
                          </div>
                        </div>
                      </div>

                      {/* Booking Info */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-espresso/5 text-[11px] text-espresso/80">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-ochre/70" />
                          <span className="font-semibold">{res.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-ochre/70" />
                          <span className="font-semibold">{res.timeSlot} hs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-ochre/70" />
                          <span>{res.guestsCount} {t('booking.tableSelector.seats', language)}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate" title={`${tableName} (${areaLabel})`}>
                          <MapPin className="w-3.5 h-3.5 text-ochre/70" />
                          <span className="truncate">{tableName}</span>
                        </div>
                      </div>

                      {/* Notes if present */}
                      {res.notes && (
                        <div className="p-2 bg-espresso/5 border-l-2 border-ochre/40 text-[10px] text-espresso/80 leading-relaxed rounded-r italic flex gap-1 items-start">
                          <FileText className="w-3 h-3 text-espresso/40 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2" title={res.notes}>
                            {res.notes}
                          </p>
                        </div>
                      )}

                      {/* Status Transition Select Dropdown */}
                      <div className="pt-3 border-t border-espresso/5 flex items-center justify-between gap-2">
                        <label className="text-[10px] uppercase font-bold text-espresso/50 tracking-wider">
                          {t('admin.kanban.updateStatus', language)}
                        </label>
                        <select
                          value={res.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as KanbanStage;
                            updateReservationStatus(res.id, newStatus);
                            const statusLabel = t(`admin.columns.${newStatus}`, language);
                            addNotification(
                              language === 'es' ? 'Estado Actualizado' : 'Status Updated',
                              t('toasts.statusUpdated', language).replace('{status}', statusLabel),
                              newStatus === 'cancelled' ? 'alert' : 'success'
                            );
                          }}
                          className="bg-editorial-bg border border-espresso/20 text-espresso text-[11px] font-semibold py-1 px-2 rounded-lg focus:outline-none focus:border-ochre cursor-pointer"
                          id={`kanban-select-${res.id}`}
                        >
                          <option value="pending">{t('admin.columns.pending', language)}</option>
                          <option value="confirmed">{t('admin.columns.confirmed', language)}</option>
                          <option value="cancelled">{t('admin.columns.cancelled', language)}</option>
                        </select>
                      </div>
                    </div>
                  );
                })}

                {colReservations.length === 0 && (
                  <div className="py-12 border-2 border-dashed border-espresso/10 rounded-xl flex flex-col items-center justify-center text-espresso/40">
                    <span className="text-xs italic font-serif">
                      {language === 'es' ? 'Sin reservaciones' : 'No reservations'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
