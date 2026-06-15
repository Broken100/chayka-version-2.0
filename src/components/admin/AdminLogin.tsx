/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onAuthenticated: () => void;
}

const DEFAULT_PASSWORDS = ['admin123', 'chayka', '1234'];

export default function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const { language } = useReservation();
  const isEs = language === 'es';

  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const allowedPasswords = (() => {
    const envPasswords = import.meta.env.VITE_ADMIN_PASSWORDS;
    if (typeof envPasswords === 'string' && envPasswords.trim().length > 0) {
      return envPasswords.split(',').map((p) => p.trim());
    }
    return DEFAULT_PASSWORDS;
  })();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (allowedPasswords.includes(password)) {
      onAuthenticated();
      setErrorMsg('');
    } else {
      setErrorMsg(isEs ? 'Contraseña incorrecta. Prueba con "chayka" o "admin123"' : 'Incorrect password. Try "chayka" or "admin123"');
    }
  };

  const handleBypassDemo = () => {
    onAuthenticated();
  };

  return (
    <div className="max-w-md mx-auto py-12 px-6" id="admin-login-wrapper">
      <div className="bg-editorial-bg border border-espresso/15 p-6 md:p-8 rounded-2xl shadow-md text-center space-y-6 text-espresso text-left">
        <div className="w-12 h-12 bg-ochre/10 border border-ochre/20 text-ochre rounded-xl flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center">
          <h3 className="text-xl font-black font-serif">
            {isEs ? 'Administración Chayka' : 'Chayka Admin Panel'}
          </h3>
          <p className="text-espresso/70 text-xs leading-relaxed">
            {isEs
              ? 'Ingresa tus credenciales profesionales para modificar horarios, productos y mesas.'
              : 'Enter your professional credentials to modify schedules, products, and tables.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label htmlFor="admin-passwd-input" className="block text-[10px] font-bold text-espresso/70 uppercase tracking-wider mb-1.5">
              {isEs ? 'Contraseña' : 'Password'}
            </label>
            <input
              type="password"
              required
              placeholder={isEs ? 'Contraseña de administrador' : 'Admin password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-espresso/20 text-espresso placeholder-espresso/45 py-2.5 px-3 rounded-lg text-xs focus:outline-none focus:border-ochre"
              id="admin-passwd-input"
            />
            {errorMsg && <p className="text-rose-600 text-[10px] mt-1 font-semibold">{errorMsg}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-ochre hover:bg-ochre/95 text-coffee-bg font-bold py-2.5 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors shadow-sm"
            id="admin-login-submit"
          >
            {isEs ? 'Iniciar Sesión' : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-espresso/10 pt-5 space-y-3 text-center">
          <p className="text-espresso/50 text-[10px] leading-relaxed">
            {isEs
              ? '¿Probando la aplicación en el editor? Presiona debajo para ingresar de forma libre sin contraseña (Acceso Demo de Prueba).'
              : 'Testing the app in the editor? Press below to enter freely without a password (Demo Trial Access).'}
          </p>
          <button
            onClick={handleBypassDemo}
            className="px-4 py-2 bg-transparent border border-espresso/25 hover:border-espresso hover:bg-espresso/5 text-espresso rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer w-full"
            id="admin-bypass-btn"
          >
            {isEs ? 'Acceso Directo (Demo)' : 'Direct Access (Demo)'}
          </button>
        </div>
      </div>
    </div>
  );
}
