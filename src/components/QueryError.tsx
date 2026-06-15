import { AlertOctagon, RefreshCw } from 'lucide-react';
import { useReservation } from '../context/ReservationContext';

interface QueryErrorProps {
  message?: string;
  onRetry: () => void;
}

export default function QueryError({ message, onRetry }: QueryErrorProps) {
  const { language } = useReservation();

  return (
    <div className="flex flex-col items-center justify-center py-8 text-espresso/60 space-y-3">
      <AlertOctagon className="w-8 h-8 text-ochre" />
      <p className="text-xs text-center max-w-xs leading-relaxed">
        {message ?? (language === 'es' ? 'Algo salió mal al cargar los datos.' : 'Something went wrong loading the data.')}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ochre hover:text-ochre/80 border border-ochre/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {language === 'es' ? 'Reintentar' : 'Retry'}
      </button>
    </div>
  );
}
