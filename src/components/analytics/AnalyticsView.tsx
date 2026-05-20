import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Trade } from '../../types';
import { COLORS } from '../../constants';

interface AnalyticsViewProps {
  trades: Trade[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ trades }) => {
  // Pair performance
  const pairDataMap: Record<string, number> = {};
  trades.forEach(t => {
    pairDataMap[t.pair] = (pairDataMap[t.pair] || 0) + (t.profit || 0);
  });
  const pairData = Object.entries(pairDataMap).map(([name, value]) => ({ name, value }));

  // Strategy performance
  const strategyDataMap: Record<string, number> = {};
  trades.forEach(t => {
    strategyDataMap[t.strategy || 'Unknown'] = (strategyDataMap[t.strategy || 'Unknown'] || 0) + (t.profit || 0);
  });
  const strategyData = Object.entries(strategyDataMap).map(([name, value]) => ({ name, value }));

  // Win/Loss distribution
  const winCount = trades.filter(t => t.result === 'Win').length;
  const lossCount = trades.filter(t => t.result === 'Loss').length;
  const breakEvenCount = trades.filter(t => t.result === 'Break Even').length;
  const pieData = [
    { name: 'Wins', value: winCount, color: '#10b981' },
    { name: 'Losses', value: lossCount, color: '#ef4444' },
    { name: 'Break Even', value: breakEvenCount, color: '#64748b' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pair Performance */}
        <div className="glass-card p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-6">Profit by Currency Pair</h3>
          <div className="h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pairData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={60} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {pairData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="glass-card p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-6">Strategy Profitability</h3>
          <div className="h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} width={40} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win/Loss Pie */}
        <div className="glass-card p-4 lg:p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-6 w-full text-left">Win/Loss Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="glass-card p-4 lg:p-6 grid grid-cols-2 gap-3 lg:gap-4 h-max">
           <div className="p-3 lg:p-4 rounded-lg bg-slate-800/30 border border-slate-800">
              <p className="text-[10px] lg:text-xs text-slate-500 uppercase">Avg Winner</p>
              <p className="text-lg lg:text-xl font-bold text-emerald-500">
                {winCount > 0 
                  ? `$${(trades.filter(t => t.result === 'Win').reduce((s, t) => s + (t.profit || 0), 0) / winCount).toFixed(2)}` 
                  : '$0.00'}
              </p>
           </div>
           <div className="p-3 lg:p-4 rounded-lg bg-slate-800/30 border border-slate-800">
              <p className="text-[10px] lg:text-xs text-slate-500 uppercase">Avg Loser</p>
              <p className="text-lg lg:text-xl font-bold text-rose-500">
                {lossCount > 0 
                  ? `-$${Math.abs(trades.filter(t => t.result === 'Loss').reduce((s, t) => s + (t.profit || 0), 0) / lossCount).toFixed(2)}` 
                  : '$0.00'}
              </p>
           </div>
           <div className="p-3 lg:p-4 rounded-lg bg-slate-800/30 border border-slate-800">
              <p className="text-[10px] lg:text-xs text-slate-500 uppercase">Risk/Reward</p>
              <p className="text-lg lg:text-xl font-bold">
                {(() => {
                  const avgW = winCount > 0 ? (trades.filter(t => t.result === 'Win').reduce((s, t) => s + (t.profit || 0), 0) / winCount) : 0;
                  const avgL = lossCount > 0 ? Math.abs(trades.filter(t => t.result === 'Loss').reduce((s, t) => s + (t.profit || 0), 0) / lossCount) : 0;
                  return avgL > 0 ? `1:${(avgW / avgL).toFixed(1)}` : 'N/A';
                })()}
              </p>
           </div>
           <div className="p-3 lg:p-4 rounded-lg bg-slate-800/30 border border-slate-800">
              <p className="text-[10px] lg:text-xs text-slate-500 uppercase">Profit Factor</p>
              <p className="text-lg lg:text-xl font-bold">
                {(() => {
                   const totalW = trades.filter(t => t.result === 'Win').reduce((s, t) => s + (t.profit || 0), 0);
                   const totalL = Math.abs(trades.filter(t => t.result === 'Loss').reduce((s, t) => s + (t.profit || 0), 0));
                   return totalL > 0 ? (totalW / totalL).toFixed(2) : totalW > 0 ? '∞' : '0.00';
                })()}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
