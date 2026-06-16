import { useRef, useState } from 'react';
import { BusinessConfig } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import { useBusinessConfigQuery } from '../../lib/queries';
import { useUpdateBusinessConfig, useUploadQr, useDeleteQr } from '../../lib/mutations';
import { Smartphone, Clock, MapPin, Users, Save, QrCode, Upload, Trash2 } from 'lucide-react';

export default function SettingsPanel() {
  const { language, addNotification } = useReservation();
  const isEs = language === 'es';
  const configQuery = useBusinessConfigQuery();
  const updateConfigMutation = useUpdateBusinessConfig();
  const uploadQr = useUploadQr();
  const deleteQr = useDeleteQr();
  const qrFileInputRef = useRef<HTMLInputElement>(null);
  const bc: BusinessConfig = configQuery.data ?? {
    name: '', location: '', locationLink: '', whatsappNumber: '',
    minPeopleReservation: 1, maxPeopleReservation: 10,
    schedules: [], timeSlots: [],
    transferQrUrl: null
  };

  const [draft, setDraft] = useState<Partial<BusinessConfig>>({});

  const save = (section: string) => {
    const payload = section === 'hours'
      ? { schedules: (draft.schedules ?? bc.schedules), timeSlots: (draft.timeSlots ?? bc.timeSlots) }
      : draft;
    updateConfigMutation.mutate(payload as Partial<BusinessConfig>, {
      onSuccess: () => {
        addNotification(isEs ? 'Configuración' : 'Settings', isEs ? 'Sección guardada' : 'Section saved', 'success');
        setDraft({});
      }
    });
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadQr.mutate(file, {
      onSuccess: () => {
        addNotification(
          isEs ? 'Pagos' : 'Payments',
          isEs ? 'QR actualizado' : 'QR updated',
          'success'
        );
      },
      onError: (err) => {
        addNotification(
          isEs ? 'Error' : 'Error',
          err instanceof Error ? err.message : 'Upload failed',
          'alert'
        );
      }
    });
    // Reset the input so re-selecting the same file still fires `change`.
    e.target.value = '';
  };

  const handleQrDelete = () => {
    deleteQr.mutate(undefined, {
      onSuccess: () => {
        addNotification(
          isEs ? 'Pagos' : 'Payments',
          isEs ? 'QR eliminado' : 'QR removed',
          'success'
        );
      },
      onError: (err) => {
        addNotification(
          isEs ? 'Error' : 'Error',
          err instanceof Error ? err.message : 'Delete failed',
          'alert'
        );
      }
    });
  };

  const m = { ...bc, ...draft };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="admin-settings-view">
      {/* CONTACT */}
      <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
        <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4" /><span>{isEs ? 'Contacto' : 'Contact'}</span>
        </h3>
        <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">WhatsApp</label>
        <input type="tel" pattern="^\+\d{8,15}$" value={m.whatsappNumber}
          onChange={(e) => setDraft((d) => ({ ...d, whatsappNumber: e.target.value }))}
          placeholder="+593987163354"
          className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 font-mono" id="admin-conf-wa" />
        <p className="text-[10px] text-espresso/50 mt-1">
          {isEs
            ? 'Formato E.164: + prefijo país y 8–15 dígitos (ej. +593987163354).'
            : 'E.164 format: + country code and 8–15 digits (e.g. +593987163354).'}
        </p>
        <button onClick={() => save('contact')}
          disabled={!draft.whatsappNumber || updateConfigMutation.isPending}
          className="bg-ochre hover:bg-ochre/90 disabled:bg-ochre/60 text-coffee-bg text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
          data-testid="admin-conf-save-contact">
          <Save className="w-3.5 h-3.5" />{isEs ? 'Guardar Contacto' : 'Save Contact'}
        </button>
      </div>

      {/* BRANDING */}
      <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
        <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /><span>{isEs ? 'Marca y ubicación' : 'Branding & Location'}</span>
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Nombre</label>
            <input type="text" value={m.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">{isEs ? 'Ubicación' : 'Location'}</label>
            <input type="text" value={m.location}
              onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
              className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Google Maps Link</label>
            <input type="text" value={m.locationLink}
              onChange={(e) => setDraft((d) => ({ ...d, locationLink: e.target.value }))}
              className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3" />
          </div>
        </div>
        <button onClick={() => save('branding')}
          disabled={(!draft.name && !draft.location && !draft.locationLink) || updateConfigMutation.isPending}
          className="bg-ochre hover:bg-ochre/90 disabled:bg-ochre/60 text-coffee-bg text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
          data-testid="admin-conf-save-branding">
          <Save className="w-3.5 h-3.5" />{isEs ? 'Guardar Marca' : 'Save Branding'}
        </button>
      </div>

      {/* HOURS */}
      <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
        <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
          <Clock className="w-4 h-4" /><span>{isEs ? 'Horarios' : 'Hours'}</span>
        </h3>
        <div className="space-y-3">
          {(m.schedules ?? []).map((sched, idx) => (
            <div key={idx} className="flex gap-2.5">
              <input type="text" value={sched.day}
                onChange={(e) => {
                  const s = [...(draft.schedules ?? bc.schedules)];
                  s[idx] = { ...s[idx], day: e.target.value };
                  setDraft((d) => ({ ...d, schedules: s }));
                }}
                className="bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 w-1/3" />
              <input type="text" value={sched.hours}
                onChange={(e) => {
                  const s = [...(draft.schedules ?? bc.schedules)];
                  s[idx] = { ...s[idx], hours: e.target.value };
                  setDraft((d) => ({ ...d, schedules: s }));
                }}
                className="bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 flex-grow" />
            </div>
          ))}
        </div>
        <button onClick={() => save('hours')}
          disabled={updateConfigMutation.isPending}
          className="bg-ochre hover:bg-ochre/90 disabled:bg-ochre/60 text-coffee-bg text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
          data-testid="admin-conf-save-hours">
          <Save className="w-3.5 h-3.5" />{isEs ? 'Guardar Horarios' : 'Save Hours'}
        </button>
      </div>

      {/* RESERVATIONS */}
      <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
        <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
          <Users className="w-4 h-4" /><span>{isEs ? 'Capacidad de reservas' : 'Booking Capacity'}</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Min Pax</label>
            <input type="number" min={1} value={m.minPeopleReservation}
              onChange={(e) => setDraft((d) => ({ ...d, minPeopleReservation: parseInt(e.target.value) }))}
              className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Max Pax</label>
            <input type="number" min={1} value={m.maxPeopleReservation}
              onChange={(e) => setDraft((d) => ({ ...d, maxPeopleReservation: parseInt(e.target.value) }))}
              className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3" />
          </div>
        </div>
        <button onClick={() => save('reservations')}
          disabled={(!draft.minPeopleReservation && !draft.maxPeopleReservation) || updateConfigMutation.isPending}
          className="bg-ochre hover:bg-ochre/90 disabled:bg-ochre/60 text-coffee-bg text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
          data-testid="admin-conf-save-reservations">
          <Save className="w-3.5 h-3.5" />{isEs ? 'Guardar Capacidad' : 'Save Capacity'}
        </button>
      </div>

      {/* PAYMENTS / PAGOS — Transfer QR */}
      <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
        <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
          <QrCode className="w-4 h-4" /><span>{isEs ? 'Pagos' : 'Payments'}</span>
        </h3>
        <p className="text-[10px] text-espresso/60 -mt-2">
          {isEs
            ? 'Sube el QR que verán los clientes al elegir transferencia bancaria.'
            : 'Upload the QR customers will see when choosing bank transfer.'}
        </p>

        <div className="flex flex-col items-center gap-3">
          {bc.transferQrUrl ? (
            <img
              src={bc.transferQrUrl}
              alt={isEs ? 'QR de transferencia' : 'Transfer QR'}
              width={200}
              height={200}
              className="w-[200px] h-[200px] object-contain border border-espresso/15 rounded-lg bg-white"
              data-testid="admin-payments-qr-preview"
            />
          ) : (
            <div
              className="w-[200px] h-[200px] border-2 border-dashed border-espresso/25 rounded-lg flex flex-col items-center justify-center text-espresso/40 bg-espresso/[0.02]"
              data-testid="admin-payments-qr-placeholder"
            >
              <QrCode className="w-10 h-10 mb-1.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isEs ? 'Sin QR' : 'No QR'}
              </span>
            </div>
          )}

          <input
            ref={qrFileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleQrFileChange}
            className="hidden"
            data-testid="admin-payments-qr-input"
          />

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => qrFileInputRef.current?.click()}
              disabled={uploadQr.isPending}
              className="bg-ochre hover:bg-ochre/90 disabled:bg-ochre/60 text-coffee-bg text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              data-testid="admin-payments-qr-upload-btn"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploadQr.isPending
                ? (isEs ? 'Subiendo…' : 'Uploading…')
                : bc.transferQrUrl
                  ? (isEs ? 'Reemplazar QR' : 'Replace QR')
                  : (isEs ? 'Subir QR' : 'Upload QR')}
            </button>
            {bc.transferQrUrl && (
              <button
                type="button"
                onClick={handleQrDelete}
                disabled={deleteQr.isPending}
                className="bg-white border border-espresso/25 hover:border-rose-700 hover:text-rose-700 text-espresso/70 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                data-testid="admin-payments-qr-remove-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleteQr.isPending
                  ? (isEs ? 'Eliminando…' : 'Removing…')
                  : (isEs ? 'Eliminar QR' : 'Remove QR')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
