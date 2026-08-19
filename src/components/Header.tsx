import React, { useState, useRef, useEffect } from 'react';
import {
  Pill,
  QrCode,
  ScanLine,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Cloud,
  CloudOff,
  Wifi,
  LogIn,
  LogOut,
  User as UserIcon,
  Download,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
} from 'lucide-react';
import { ExpiryStatus, CategoryFilter } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: ExpiryStatus;
  onStatusFilterChange: (status: ExpiryStatus) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (cat: CategoryFilter) => void;
  onOpenScanner: () => void;
  onOpenIdentify: () => void;
  onOpenAdd: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isFirebaseConnected: boolean;
  networkStatus: 'online' | 'slow' | 'offline';
  counts: {
    total: number;
    expired: number;
    critical: number;
    warning: number;
    safe: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onOpenScanner,
  onOpenIdentify,
  onOpenAdd,
  onExportJSON,
  onExportCSV,
  user,
  onLogin,
  onLogout,
  isFirebaseConnected,
  networkStatus,
  counts,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-br from-[#00897B] via-[#00796B] to-[#00695C] text-white shadow-md pb-6 rounded-b-3xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-teal-500/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white">Expiry Tracker</h1>
                
                {/* Network & Offline Persistence Badge */}
                {networkStatus === 'offline' ? (
                  <span className="text-[10px] font-semibold tracking-wider uppercase bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-600 text-slate-200 flex items-center gap-1.5 shadow-xs">
                    <CloudOff size={11} className="text-amber-400" />
                    <span>Offline (Local Cache)</span>
                  </span>
                ) : networkStatus === 'slow' ? (
                  <span className="text-[10px] font-semibold tracking-wider uppercase bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-500/50 text-amber-200 flex items-center gap-1.5 shadow-xs">
                    <Wifi size={11} className="text-amber-300" />
                    <span>Low Network (Optimized)</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold tracking-wider uppercase bg-teal-800/80 px-2 py-0.5 rounded-full border border-teal-400/30 text-teal-100 flex items-center gap-1">
                    <Cloud size={11} className={isFirebaseConnected ? 'text-emerald-300' : 'text-slate-300'} />
                    <span>{isFirebaseConnected ? 'Firebase Live' : 'Offline Ready'}</span>
                  </span>
                )}

                <span className="text-[10px] font-semibold tracking-wider uppercase bg-teal-800/80 px-2 py-0.5 rounded-full border border-teal-400/30 text-teal-100">
                  GS1 Verified
                </span>
              </div>
              <p className="text-teal-100 text-xs sm:text-sm font-normal">
                Real-time Firestore sync & medicine expiration catalog
              </p>
            </div>
          </div>

          {/* Action buttons & Auth */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              id="btn-scan-camera"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-teal-800 font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:bg-teal-50 transition active:scale-95 cursor-pointer"
              title="Scan barcode with camera (works 100% offline)"
            >
              <ScanLine size={16} className="text-teal-700" />
              <span>Scan</span>
            </button>

            <button
              id="btn-identify-image"
              onClick={onOpenIdentify}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-800/80 hover:bg-teal-900/90 text-white font-medium text-xs sm:text-sm rounded-xl border border-teal-400/30 shadow-sm transition active:scale-95 cursor-pointer"
              title="Decode barcode image / GTIN lookup"
            >
              <QrCode size={16} />
              <span>Identify</span>
            </button>

            <button
              id="btn-add-medicine"
              onClick={onOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
              title="Add medicine to catalog"
            >
              <Plus size={16} />
              <span>Add</span>
            </button>

            {/* Export File Format Dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                id="btn-export-file"
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
                className="flex items-center gap-1 px-3 py-2 bg-teal-900/80 hover:bg-teal-900 text-teal-100 font-medium text-xs sm:text-sm rounded-xl border border-teal-400/30 shadow-sm transition cursor-pointer"
                title="Export catalog as file (.CSV / .JSON)"
              >
                <Download size={15} />
                <span>Export</span>
                <ChevronDown size={13} className={`transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Export File Format
                  </div>
                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportCSV();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 cursor-pointer transition"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-600" />
                    <div>
                      <div>Spreadsheet (.CSV)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Excel / Google Sheets</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportJSON();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 cursor-pointer transition"
                  >
                    <FileCode size={15} className="text-teal-600" />
                    <div>
                      <div>Data File (.JSON)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Standard JSON format</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Google Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-teal-900/70 border border-teal-400/30 rounded-xl px-2.5 py-1.5 text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <UserIcon size={14} className="text-teal-200" />
                )}
                <span className="max-w-[80px] sm:max-w-[120px] truncate text-[11px] font-medium text-teal-100">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="text-teal-300 hover:text-white transition p-0.5 cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-900/60 hover:bg-teal-900 border border-teal-400/40 text-teal-100 font-medium text-xs rounded-xl transition cursor-pointer"
                title="Sign in with Google to sync across devices"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Quick Stats bar */}
        <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              id="input-medicine-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by medicine name, barcode (GTIN), manufacturer..."
              className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded bg-slate-100 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs font-medium">
            <span className="text-teal-100 flex items-center gap-1 shrink-0 pl-1">
              <Filter size={13} />
              <span>Type:</span>
            </span>
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'tablets', label: 'Tablets' },
                { id: 'syrups', label: 'Syrups' },
                { id: 'inhalers', label: 'Inhalers' },
                { id: 'injections', label: 'Injections' },
                { id: 'creams', label: 'Creams' },
                { id: 'drops', label: 'Drops' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryFilterChange(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-white text-teal-900 font-bold shadow-sm'
                    : 'bg-teal-900/50 text-teal-100 hover:bg-teal-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expiry Status Filters */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-teal-950 text-white shadow'
                : 'bg-white/15 text-white hover:bg-white/20'
            }`}
          >
            <span>All Catalog</span>
            <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => onStatusFilterChange('expired')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-slate-800 text-white shadow'
                : 'bg-white/15 text-white hover:bg-white/20'
            }`}
          >
            <XCircle size={13} className="text-slate-300" />
            <span>Expired</span>
            <span className="bg-slate-700 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {counts.expired}
            </span>
          </button>

          <button
            onClick={() => onStatusFilterChange('critical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'critical'
                ? 'bg-red-700 text-white shadow'
                : 'bg-white/15 text-white hover:bg-white/20'
            }`}
          >
            <AlertTriangle size={13} className="text-red-300" />
            <span>&lt; 3 Days</span>
            <span className="bg-red-800 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {counts.critical}
            </span>
          </button>

          <button
            onClick={() => onStatusFilterChange('warning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'warning'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-white/15 text-white hover:bg-white/20'
            }`}
          >
            <Clock size={13} className="text-amber-200" />
            <span>&lt; 7 Days</span>
            <span className="bg-amber-700 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {counts.warning}
            </span>
          </button>

          <button
            onClick={() => onStatusFilterChange('safe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'safe'
                ? 'bg-emerald-700 text-white shadow'
                : 'bg-white/15 text-white hover:bg-white/20'
            }`}
          >
            <CheckCircle2 size={13} className="text-emerald-200" />
            <span>Safe & Valid</span>
            <span className="bg-emerald-800 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {counts.safe}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
