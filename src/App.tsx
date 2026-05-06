import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  MessageSquare, 
  TrendingUp, 
  History, 
  ExternalLink, 
  RefreshCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { cn, chromeShim } from './lib/utils';

// Types
interface MessageStats {
  date: string;
  linkedin: number;
  salesNav: number;
}

export default function App() {
  const [data, setData] = useState<MessageStats[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'linkedin' | 'salesNav'>('linkedin');

  useEffect(() => {
    const loadData = async () => {
      const result = await chromeShim.storage.local.get(['stats']) as { stats?: MessageStats[] };
      if (result.stats && result.stats.length > 0) {
        setData(result.stats);
      } else {
        // Mock some data for preview if empty
        const mockStats: MessageStats[] = Array.from({ length: 14 }).map((_, i) => ({
          date: format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'),
          linkedin: Math.floor(Math.random() * 20) + 5,
          salesNav: Math.floor(Math.random() * 10) + 2,
        }));
        setData(mockStats);
        await chromeShim.storage.local.set({ stats: mockStats });
      }
    };
    loadData();
  }, []);

  const todayData = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return data.find(d => d.date === todayStr) || { date: todayStr, linkedin: 0, salesNav: 0 };
  }, [data]);

  const chartData = useMemo(() => {
    return data.slice(-7).map(d => ({
      ...d,
      displayDate: format(parseISO(d.date), 'EEE')
    }));
  }, [data]);

  const statsTotal = useMemo(() => {
    return data.reduce((acc, curr) => ({
      linkedin: acc.linkedin + curr.linkedin,
      salesNav: acc.salesNav + curr.salesNav
    }), { linkedin: 0, salesNav: 0 });
  }, [data]);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate scanning LinkedIn message history
    setTimeout(async () => {
      const newStats: MessageStats[] = Array.from({ length: 30 }).map((_, i) => ({
        date: format(subDays(new Date(), 30 - i), 'yyyy-MM-dd'),
        linkedin: Math.floor(Math.random() * 20) + 5,
        salesNav: Math.floor(Math.random() * 10) + 2,
      }));
      setData(newStats);
      await chromeShim.storage.local.set({ stats: newStats });
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="w-[400px] min-h-[550px] bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none text-slate-800">LinkedIn Pulse</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Message Analytics</p>
          </div>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className={cn(
            "p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 text-slate-500",
            isSyncing && "animate-spin text-blue-600 bg-blue-50"
          )}
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4 pb-20 flex-1 overflow-y-auto">
        <div className="flex p-1 bg-slate-200/50 rounded-xl">
          <button
            onClick={() => setViewMode('linkedin')}
            className={cn(
              "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
              viewMode === 'linkedin' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            LinkedIn
          </button>
          <button
            onClick={() => setViewMode('salesNav')}
            className={cn(
              "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
              viewMode === 'salesNav' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Sales Nav
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <MessageSquare className="w-20 h-20" />
              </div>
              <p className="text-sm font-medium text-slate-500">Messages Sent Today</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-4xl font-black text-slate-900 leading-none">
                  {viewMode === 'linkedin' ? todayData.linkedin : todayData.salesNav}
                </h2>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  +12% vs avg
                </span>
              </div>
              <div className="mt-6 h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="displayDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 shadow-lg border border-slate-100 rounded-lg text-[10px]">
                              <p className="font-bold text-slate-900">{payload[0].payload.date}</p>
                              <p className="text-blue-600">{payload[0].value} messages</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey={viewMode} 
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isSameDay(parseISO(entry.date), new Date()) ? '#2563eb' : '#cbd5e1'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">7-Day Total</p>
                <p className="text-xl font-bold mt-1 text-slate-800">
                  {chartData.reduce((acc, curr) => acc + (viewMode === 'linkedin' ? curr.linkedin : curr.salesNav), 0)}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lifetime</p>
                <p className="text-xl font-bold mt-1 text-slate-800">
                  {viewMode === 'linkedin' ? statsTotal.linkedin : statsTotal.salesNav}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900">Pro Tip</p>
                <p className="text-[11px] text-blue-700 leading-relaxed mt-0.5">
                  Sending 20+ personalized messages daily increases encounter rates by 45%. Keep it up!
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3 pb-8">
            <h3 className="text-sm font-bold text-slate-800 px-1">Detailed History</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
              {data.slice().reverse().map((day, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{format(parseISO(day.date), 'MMMM d, yyyy')}</p>
                    <p className="text-[10px] text-slate-400">{format(parseISO(day.date), 'EEEE')}</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div className="min-w-8">
                      <p className="text-xs font-bold text-slate-800">{day.linkedin}</p>
                      <p className="text-[8px] text-slate-400 uppercase font-black">LI</p>
                    </div>
                    <div className="min-w-8">
                      <p className="text-xs font-bold text-slate-800">{day.salesNav}</p>
                      <p className="text-[8px] text-slate-400 uppercase font-black">SN</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="shrink-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'overview' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tight">Overview</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'history' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <History className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tight">History</span>
        </button>
        <div className="w-[1px] h-6 bg-slate-200 mx-2" />
        <a 
          href="https://linkedin.com" 
          target="_blank" 
          rel="no-referrer"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tight">Open LI</span>
        </a>
      </nav>

      <div className="px-6 py-2 bg-slate-100 flex items-center justify-center gap-2 border-t border-slate-200 shrink-0">
        <ShieldCheck className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] text-slate-400 font-medium tracking-tight">Privacy-First Tracking</span>
      </div>
    </div>
  );
}
