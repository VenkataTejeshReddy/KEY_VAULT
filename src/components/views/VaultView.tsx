'use client';

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { AddKeyModal } from '../modals/AddKeyModal';
import {
  Key,
  Plus,
  Search,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';

export const VaultView: React.FC = () => {
  const { keys, deleteApiKey } = useVault();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  
  // Track revealed keys by key id
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  // Track copied feedback
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const toggleRevealKey = (keyId: string) => {
    setRevealedKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleCopyKey = (keyId: string, rawKey: string) => {
    navigator.clipboard.writeText(rawKey);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 1500);
  };

  const filteredKeys = keys.filter((k) => {
    const matchesSearch =
      k.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.maskedKey.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnv = environmentFilter === 'all' || k.environment === environmentFilter;
    return matchesSearch && matchesEnv;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Key className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            API Key Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Encrypted storage and lifecycle management for your active API credentials
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Connection</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-4 backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter keys by service name or key pattern..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            {['all', 'Production', 'Staging', 'Development'].map((env) => (
              <button
                key={env}
                onClick={() => setEnvironmentFilter(env)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  environmentFilter === env
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keys Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Service Name</th>
                <th className="py-3.5 px-4 font-semibold">Environment</th>
                <th className="py-3.5 px-4 font-semibold">Masked Credentials</th>
                <th className="py-3.5 px-4 font-semibold">Date Added</th>
                <th className="py-3.5 px-4 font-semibold">Last Used</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No connected API keys found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((keyItem) => {
                  const isRevealed = revealedKeys[keyItem.id];
                  const isCopied = copiedKeyId === keyItem.id;

                  return (
                    <tr key={keyItem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                      {/* Service Name */}
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
                            <Key className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{keyItem.serviceName}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">ID: {keyItem.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Environment Tag */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-mono font-bold uppercase border ${
                            keyItem.environment === 'Production'
                              ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30'
                              : keyItem.environment === 'Staging'
                              ? 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {keyItem.environment}
                        </span>
                      </td>

                      {/* Masked Credentials Display */}
                      <td className="py-4 px-4 font-mono text-xs">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
                          <span className={isRevealed ? 'text-cyan-700 dark:text-cyan-300 font-bold' : 'text-slate-800 dark:text-slate-300'}>
                            {isRevealed ? keyItem.rawKey : keyItem.maskedKey}
                          </span>

                          <button
                            onClick={() => toggleRevealKey(keyItem.id)}
                            className="text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors ml-2 cursor-pointer"
                            title={isRevealed ? 'Hide Raw Key' : 'Reveal Raw Key'}
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Date Added */}
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{keyItem.dateAdded}</td>

                      {/* Last Used */}
                      <td className="py-4 px-4 font-mono text-[11px]">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Clock className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                          {keyItem.lastUsed}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopyKey(keyItem.id, keyItem.rawKey)}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40'
                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteApiKey(keyItem.id)}
                            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-500/30 transition-all cursor-pointer"
                            title="Delete API Key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AddKeyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
