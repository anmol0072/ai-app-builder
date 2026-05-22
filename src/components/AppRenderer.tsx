'use client';

import React, { useState, useEffect, Component } from 'react';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
import { Upload, LogOut, Activity, Users, Database, DownloadCloud, Smartphone, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

class ErrorBoundary extends Component<any, { hasError: boolean, error: any }> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() { if (this.state.hasError) return <div className="p-6 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">Component Error: {this.state.error?.message}</div>; return this.props.children; }
}
import toast, { Toaster } from 'react-hot-toast';

function AuthGuard({ children, token, setToken, appName }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  if (token) return <>{children}</>;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setToken(data.token);
      localStorage.setItem('ai-app-token', data.token);
      toast.success('Authenticated successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative p-4">
      <Toaster position="top-center" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 w-full max-w-sm z-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-500/20 p-3 rounded-2xl mb-4">
            <Database className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white capitalize">{appName} Login</h2>
          <p className="text-gray-400 text-sm mt-1">Authenticate to access this dynamic environment</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email Address" required 
            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" 
            value={email} onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" required 
            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" 
            value={password} onChange={e => setPassword(e.target.value)} 
          />
          <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-sm text-gray-400 hover:text-white mt-6 transition-colors">
          {isLogin ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </motion.div>
    </div>
  );
}

function DynamicDashboard({ configName, entity, token }: any) {
  const [stats, setStats] = useState({ total: 0 });
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      fetch(`/api/dynamic/${configName}/${entity.name}?limit=50`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setStats({ total: res.meta?.total || res.data.length });
            setData(res.data.map((r: any) => r.data));
          }
        });
    }
  }, [configName, entity.name, token]);

  const numericFields = entity.fields.filter((f: any) => f.type === 'number');
  const chartField = numericFields.length > 0 ? numericFields[0].name : null;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total {entity.name}s</p>
            <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">System Health</p>
            <h3 className="text-3xl font-bold text-emerald-400">100%</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>
      {chartField && data.length > 0 && (
        <div className="glass-card p-6 h-80 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4 capitalize">{chartField} Analytics</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey={entity.fields[0].name} stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#1e1e24', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff'}} />
              <Bar dataKey={chartField} fill="#818cf8" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function DynamicForm({ configName, entity, schema, onSuccess, token }: any) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData };
    for (const field of schema.fields) {
      if (field.type === 'number' && payload[field.name]) payload[field.name] = Number(payload[field.name]);
    }

    try {
      const res = await fetch(`/api/dynamic/${configName}/${entity.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save record');
      toast.success(`${entity.name} saved successfully!`);
      setFormData({});
      if (onSuccess) onSuccess();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold mb-6 text-white border-b border-white/10 pb-4">New {entity.name}</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        {entity.fields.map((field: any) => (
          <div key={field.name} className="flex flex-col">
            <label className="text-sm font-medium text-gray-400 mb-2 capitalize">{field.name}</label>
            <input
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              name={field.name} required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        ))}
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors mt-2">
          {loading ? 'Saving...' : 'Save Record'}
        </button>
      </form>
    </div>
  );
}

function DynamicTable({ configName, entity, token, refreshTrigger }: any) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dynamic/${configName}/${entity.name}?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        if (data.meta) setMeta(data.meta);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const timer = setTimeout(() => { if (token) fetchRecords(); }, 300);
    return () => clearTimeout(timer);
  }, [configName, entity.name, token, refreshTrigger, page, searchQuery]);

  const handleCsvExport = () => {
    if (records.length === 0) return toast('No records to export');
    const csv = Papa.unparse(records.map(r => r.data));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entity.name}-export.csv`;
    a.click();
  };

  const handleCsvUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.loading('Importing CSV...', { id: 'csv' });

    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        const parsedData = results.data.map((row: any) => {
          const newRow = { ...row };
          for (const field of entity.fields) {
             if (field.type === 'number' && newRow[field.name]) newRow[field.name] = Number(newRow[field.name]);
          }
          return newRow;
        });

        try {
          const res = await fetch(`/api/dynamic/${configName}/${entity.name}/csv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(parsedData)
          });
          const data = await res.json();
          if (data.success) {
            toast.success(`Imported ${data.imported} records!`, { id: 'csv' });
            fetchRecords();
          } else {
            throw new Error('Import failed');
          }
        } catch (err: any) {
          toast.error(err.message, { id: 'csv' });
        }
      }
    });
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5">
        <h3 className="text-lg font-semibold text-white">{entity.name} Directory</h3>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <input 
            type="text" 
            placeholder="Search server..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button onClick={handleCsvExport} className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition" title="Export Page CSV">
            <Download className="w-4 h-4" />
          </button>
          <label className="flex whitespace-nowrap items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-2 px-4 rounded-lg cursor-pointer transition">
            <Upload className="w-4 h-4" /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          </label>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-10 w-full bg-white/5 animate-pulse rounded-lg"></div>)}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                {entity.fields.map((f: any) => (
                  <th key={f.name} className="p-4 font-medium text-gray-300 text-sm capitalize">{f.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={entity.fields.length} className="p-8 text-center text-gray-500">No records found.</td></tr>
              ) : records.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {entity.fields.map((f: any) => (
                    <td key={f.name} className="p-4 text-gray-300 text-sm">{r.data[f.name]?.toString() || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="p-4 border-t border-white/5 bg-white/5 flex items-center justify-between text-sm text-gray-400">
        <span>Showing {records.length} records. Total: {meta.total}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded hover:bg-white/10 disabled:opacity-50"><ChevronLeft className="w-5 h-5"/></button>
          <span className="py-1 px-2">{page} / {meta.totalPages || 1}</span>
          <button disabled={page >= (meta.totalPages || 1)} onClick={() => setPage(p => p + 1)} className="p-1 rounded hover:bg-white/10 disabled:opacity-50"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>
    </div>
  );
}

export default function AppRenderer({ config }: { config: any }) {
  const [token, setToken] = useState<string | null>(null);
  const [lang, setLang] = useState('en');
  const [refreshHash, setRefreshHash] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('ai-app-token');
    if (t) setToken(t);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!config || !config.schema) return <div className="p-20 text-center text-white">Invalid configuration</div>;
  const { schema, name } = config;

  const loc = schema.localization || {};
  const currentLoc = loc[lang] || loc['en'] || { title: `App: ${name}` };
  const availableLangs = Object.keys(loc).length > 0 ? Object.keys(loc) : ['en'];

  return (
    <AuthGuard token={token} setToken={setToken} appName={name}>
      {/* PWA Manifest Injection */}
      <link rel="manifest" href={`/api/manifest/${name}`} />
      
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <div className="min-h-screen pt-8 px-6 max-w-6xl mx-auto w-full pb-20">
        <header className="mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-lg text-white capitalize">
                {name[0]}
              </div>
              <h1 className="text-2xl font-display font-bold text-white capitalize">{currentLoc.title || name}</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:ml-4 sm:pl-6 sm:border-l border-white/10">
              {isInstallable && (
                <button 
                  onClick={handleInstallClick}
                  className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Smartphone className="w-4 h-4" /> Install App (APK)
                </button>
              )}
              <a 
                href={`/api/export/${name}`}
                className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <DownloadCloud className="w-4 h-4" /> Export Source
              </a>
              <a 
                href="/"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-4 self-end md:self-auto">
            {availableLangs.length > 1 && (
              <select 
                value={lang} onChange={e => setLang(e.target.value)} 
                className="bg-white/10 border border-white/10 text-white text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {availableLangs.map(l => <option key={l} value={l} className="bg-[#0B0C10]">{l.toUpperCase()}</option>)}
              </select>
            )}
            <button 
              onClick={() => { setToken(null); localStorage.removeItem('ai-app-token'); toast('Logged out'); }}
              className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        <div className="space-y-12">
          {schema.ui?.views?.map((view: any, idx: number) => {
            const entityDef = schema.entities.find((e: any) => e.name === view.entity);
            const viewTitle = currentLoc.views?.[view.title] || view.title;

            if (!entityDef) return null;

            return (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx}>
                <h2 className="text-xl font-display font-semibold text-white mb-6">{viewTitle}</h2>
                <ErrorBoundary>
                  {view.type === 'dashboard' && <DynamicDashboard configName={name} entity={entityDef} token={token} />}
                  {view.type === 'form' && <DynamicForm configName={name} entity={entityDef} schema={entityDef} token={token} onSuccess={() => setRefreshHash(h => h + 1)} />}
                  {view.type === 'table' && <DynamicTable configName={name} entity={entityDef} token={token} refreshTrigger={refreshHash} />}
                </ErrorBoundary>
              </motion.section>
            );
          })}
        </div>
      </div>
    </AuthGuard>
  );
}
