'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, Database, Zap, DownloadCloud, Trash2, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = () => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfigs(data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleExport = (configName: string) => {
    toast.success('Compiling Source Code...');
    window.location.href = `/api/export/${configName}`;
  };

  const handleDelete = async (configName: string) => {
    if (!confirm(`Are you sure you want to permanently delete the ${configName} project and all its data?`)) return;
    try {
      const res = await fetch(`/api/config?name=${configName}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Project deleted');
        fetchConfigs();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center pt-24 pb-20 px-6 sm:px-12 w-full max-w-6xl mx-auto">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e1e24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-indigo-300 mb-4">
          <Zap className="w-4 h-4 text-yellow-400" /> V2.0 Builder Dashboard Live
        </div>
        <h1 className="text-5xl sm:text-7xl font-display font-extrabold tracking-tight">
          JSON to <span className="text-gradient">Production</span> in seconds.
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 font-sans leading-relaxed">
          The ultimate SaaS Builder Platform. Supply a structured configuration and instantly provision UIs, export source code, and install to mobile devices.
        </p>
        <div className="pt-8 flex justify-center gap-4">
          <Link href="/create">
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]">
              Build Application <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Feature grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
      >
        {[
          { icon: <DownloadCloud className="w-6 h-6 text-pink-400"/>, title: "Source Code Export", desc: "Instantly download a full, zipped React + Prisma codebase tailored to your project." },
          { icon: <Smartphone className="w-6 h-6 text-indigo-400"/>, title: "PWA Mobile APK", desc: "Generated apps act as PWAs—install directly to your phone's home screen." },
          { icon: <Layers className="w-6 h-6 text-yellow-400"/>, title: "Dashboard & APIs", desc: "Manage projects globally. Zod-validated endpoints instantly handle mutations." }
        ].map((feature, i) => (
          <div key={i} className="glass-card p-6 border-t border-white/10 hover:bg-white/5 transition-colors cursor-default">
            <div className="bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-white/5">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Builder Dashboard Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mt-24 w-full"
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-3xl font-display font-bold">Project Hub</h2>
            <p className="text-gray-400 mt-2 text-sm">Manage your generated applications, export source code, and monitor deployments.</p>
          </div>
          <Link href="/create" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + New Project
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 glass rounded-2xl animate-pulse"></div>
            ))
          ) : configs.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl text-gray-500">
              No projects deployed yet. Build your first app to see it here!
            </div>
          ) : (
            configs.map((config) => (
              <div key={config.id} className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl uppercase border border-indigo-500/20">
                    {config.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white capitalize flex items-center gap-2">
                      {config.name}
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20 uppercase">Deployed PWA</span>
                    </h3>
                    <p className="text-sm text-gray-500">Created on {new Date(config.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => handleExport(config.name)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <DownloadCloud className="w-4 h-4" /> Export Zip
                  </button>
                  <Link href={`/app/${config.name}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <ArrowRight className="w-4 h-4" /> Launch App
                  </Link>
                  <button 
                    onClick={() => handleDelete(config.name)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

    </main>
  );
}
