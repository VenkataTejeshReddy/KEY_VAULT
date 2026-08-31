'use client';

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { KeyEnvironment } from '../../types';
import { X, Key, ShieldCheck, Check, Info } from 'lucide-react';

interface AddKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddKeyModal: React.FC<AddKeyModalProps> = ({ isOpen, onClose }) => {
  const { services, addApiKey } = useVault();

  const [serviceId, setServiceId] = useState<string>(services[0]?.id || 'github');
  const [environment, setEnvironment] = useState<KeyEnvironment>('Production');
  const [rawKeyInput, setRawKeyInput] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawKeyInput.trim()) return;

    const selectedService = services.find((s) => s.id === serviceId);
    const serviceName = selectedService ? selectedService.name : 'Custom API Service';

    addApiKey(serviceId, serviceName, environment, rawKeyInput.trim());

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setRawKeyInput('');
      onClose();
    }, 900);
  };

  const getMaskedPreview = () => {
    if (!rawKeyInput) return '****-****-****';
    const prefix = rawKeyInput.slice(0, 4);
    const suffix = rawKeyInput.length > 4 ? rawKeyInput.slice(-4) : 'XXXX';
    return `${prefix}_****-****-${suffix}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 p-4 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-all">
        {/* Top header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Connection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Connect a new service API key to KeyVault</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="my-10 flex flex-col items-center justify-center py-6 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 mb-4 shadow-lg shadow-emerald-500/20">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Connection Secured!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">API key has been encrypted and stored in local state.</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
            {/* Service Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Service Name
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-medium cursor-pointer"
              >
                {services.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name} — ({svc.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Environment Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Environment Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Production', 'Staging', 'Development'] as KeyEnvironment[]).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                      environment === env
                        ? 'border-cyan-500/60 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            {/* Raw API Key Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                API Key Secret
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={rawKeyInput}
                  onChange={(e) => setRawKeyInput(e.target.value)}
                  placeholder="e.g. sk-live-9876543210abcdef0123456789"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Info className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                Raw keys are immediately masked and kept strictly in frontend memory.
              </p>
            </div>

            {/* Masking Preview */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Vault Storage Masking Preview:
              </span>
              <div className="flex items-center gap-2 font-mono text-sm text-cyan-700 dark:text-cyan-300 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span>{getMaskedPreview()}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!rawKeyInput.trim()}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Save Connection
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
