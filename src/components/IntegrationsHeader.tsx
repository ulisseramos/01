import { useState } from 'react';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { Link2 } from 'lucide-react';

export default function IntegrationsHeader() {
  const [view, setView] = useState('grid');
  return (
    <div className="w-full bg-gradient-to-br from-[#0a0a12] via-[#181826] to-[#23233a] py-10 px-4 rounded-b-3xl shadow-2xl mb-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 max-w-5xl mx-auto">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center', marginTop: 48, marginBottom: 18 }}>
          <div style={{ background: '#23233a', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #23233a22', border: '2.5px solid #1A0938' }}>
            <Link2 size={36} color="#a1a1aa" />
          </div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 32, letterSpacing: -1, margin: 0 }}>Integrações</h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={22} />
            <input
              type="text"
              placeholder="Buscar integrações..."
              className="w-full pl-11 pr-4 py-2 rounded-xl bg-[#181826] text-white placeholder-purple-300 border-2 border-[#23233a] focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-200 shadow-inner"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none text-white font-semibold">
            <input type="checkbox" className="form-checkbox accent-purple-600 scale-110" defaultChecked />
            <span className="text-purple-300">Disponíveis</span>
          </label>
          <div className="flex gap-2 bg-[#181826] rounded-xl p-1 border-2 border-purple-700">
            <button
              className={`p-2 rounded-lg transition-all duration-200 ${view === 'grid' ? 'bg-purple-600 text-white shadow-lg scale-110' : 'text-purple-300 hover:bg-purple-900/30'}`}
              onClick={() => setView('grid')}
            >
              <FiGrid size={22} />
            </button>
            <button
              className={`p-2 rounded-lg transition-all duration-200 ${view === 'list' ? 'bg-purple-600 text-white shadow-lg scale-110' : 'text-purple-300 hover:bg-purple-900/30'}`}
              onClick={() => setView('list')}
            >
              <FiList size={22} />
            </button>
          </div>
        </div>
      </div>
      {/* Card Visão Geral */}
      <div className="mt-10 bg-gradient-to-r from-[#181826] to-[#23233a] rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-2 border-purple-800 shadow-lg">
        <div className="flex gap-8 text-white text-lg font-semibold">
          <div><span className="text-2xl font-extrabold text-purple-400">1</span> <span className="text-gray-400">Ativas</span></div>
          <div><span className="text-2xl font-extrabold text-purple-400">8</span> <span className="text-gray-400">Disponíveis</span></div>
          <div><span className="text-2xl font-extrabold text-purple-400">7</span> <span className="text-gray-400">Em breve</span></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Recentes:</span>
          <span className="bg-[#181826] text-purple-200 px-3 py-1 rounded-lg text-xs font-bold border border-purple-700 shadow">Utmify</span>
        </div>
      </div>
    </div>
  );
} 