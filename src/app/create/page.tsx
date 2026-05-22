'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Play, FileJson } from 'lucide-react';

const DEFAULT_JSON = `{
  "name": "crm",
  "localization": {
    "en": { "title": "Enterprise CRM", "views": { "Add Customer": "Add Customer", "Customer Directory": "Customer Directory", "Stats": "Overview" } }
  },
  "entities": [
    {
      "name": "Customer",
      "fields": [
        { "name": "name", "type": "string", "required": true },
        { "name": "email", "type": "string", "required": true },
        { "name": "revenue", "type": "number", "required": true }
      ]
    }
  ],
  "ui": {
    "views": [
      { "type": "dashboard", "entity": "Customer", "title": "Stats" },
      { "type": "form", "entity": "Customer", "title": "Add Customer" },
      { "type": "table", "entity": "Customer", "title": "Customer Directory" }
    ]
  }
}`;

export default function CreateAppPage() {
  const [jsonConfig, setJsonConfig] = useState(DEFAULT_JSON);
  const [isValid, setIsValid] = useState(true);
  const [validationMsg, setValidationMsg] = useState('Valid JSON');
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfigs(data.data);
      });
  }, []);

  // Live JSON Validation Effect
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonConfig);
      if (!parsed.name || !parsed.entities) {
        setIsValid(false);
        setValidationMsg('Missing required fields (name, entities)');
      } else {
        setIsValid(true);
        setValidationMsg('Valid Configuration');
      }
    } catch (e: any) {
      setIsValid(false);
      setValidationMsg(e.message);
    }
  }, [jsonConfig]);

  const handleFormat = () => {
    try {
      setJsonConfig(JSON.stringify(JSON.parse(jsonConfig), null, 2));
    } catch (e) {
      // ignore
    }
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        // Verify it parses, then set it
        JSON.parse(result);
        setJsonConfig(JSON.stringify(JSON.parse(result), null, 2));
      } catch (err) {
        setIsValid(false);
        setValidationMsg('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    try {
      const parsedConfig = JSON.parse(jsonConfig);
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedConfig)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || JSON.stringify(data.errors));

      router.push(`/app/${parsedConfig.name}`);
    } catch (err: any) {
      setIsValid(false);
      setValidationMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col pt-24 px-6 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-display font-bold mb-2">Architect Your App</h1>
        <p className="text-gray-400 mb-8">Define your data models, UI views, and API behavior in JSON.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-4 rounded-xl cursor-pointer transition-colors">
              <FileJson className="w-5 h-5 text-indigo-400" />
              <span className="font-medium">Upload .json file</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            <div className="flex-1 flex items-center justify-center border border-white/10 bg-white/5 text-gray-400 px-6 py-4 rounded-xl">
              <span className="font-medium">Or paste code below</span>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isValid ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                    <CheckCircle className="w-3 h-3" /> {validationMsg}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" /> {validationMsg}
                  </span>
                )}
              </div>
              <button 
                type="button" 
                onClick={handleFormat}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Format JSON
              </button>
            </div>
            <textarea
              value={jsonConfig}
              onChange={(e) => setJsonConfig(e.target.value)}
              className="w-full h-[500px] bg-transparent p-6 font-mono text-sm text-gray-300 focus:outline-none focus:ring-0 resize-none selection:bg-indigo-500/30"
              spellCheck={false}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !isValid}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            {loading ? 'Compiling...' : <><Play className="w-4 h-4 fill-current"/> Deploy Engine</>}
          </button>
        </form>

        <div className="mt-16 pt-8 border-t border-white/10">
          <h2 className="text-xl font-display font-semibold mb-4 text-white">Recent Projects History</h2>
          <p className="text-sm text-gray-400 mb-6">Your projects are automatically saved securely to the database.</p>
          <div className="flex flex-wrap gap-4">
            {configs.length === 0 ? (
              <div className="text-gray-500 text-sm">No recent projects. Build one above!</div>
            ) : (
              configs.map(c => (
                <a 
                  key={c.id} href={`/app/${c.name}`} 
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm text-white transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> {c.name}
                </a>
              ))
            )}
            <a href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm px-4 py-2 font-medium transition-colors ml-auto">
              View Full Dashboard &rarr;
            </a>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
