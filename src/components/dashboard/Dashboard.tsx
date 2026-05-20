import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { StatCard } from './StatCard';
import { DollarSign, Percent, BarChart2, Activity, Wallet, TrendingDown } from 'lucide-react';
import { Trade, DailyStats } from '../../types';
import { format } from 'date-fns';

interface DashboardProps {
  trades: Trade[];
  dailyStats: DailyStats[];
  startingBalance: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ trades, dailyStats, startingBalance }) => {
  const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const totalLoss = trades.reduce((sum, t) => sum + (t.profit && t.profit < 0 ? t.profit : 0), 0);
  const winRate = (trades.filter(t => t.result === 'Win').length / (trades.length || 1) * 100).toFixed(1);
  const totalPips = trades.reduce((sum, t) => sum + (t.pips || 0), 0);
  
  // Prepare Equity Curve Data
  let runningBalance = startingBalance;
  // Sort trades by date to ensure proper curve progression
  const sortedTrades = [...trades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
  
  const equityData = [
    { name: 'Start', balance: startingBalance },
    ...sortedTrades.map(t => {
      runningBalance += (t.profit || 0);
      return {
        name: format(new Date(t.entryTime), 'MMM dd'),
        balance: runningBalance
      };
    })
  ];

  const currentBalance = runningBalance;
  const currentEquityPercent = ((currentBalance - startingBalance) / (startingBalance || 1) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard 
          label="Current Balance" 
          value={`$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={<Wallet size={18} />}
        />
        <StatCard 
          label="Total Net Profit" 
          value={`$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          subValue={`${currentEquityPercent >= "0" ? '+' : ''}${currentEquityPercent}%`} 
          type={totalProfit >= 0 ? 'profit' : 'loss'}
          icon={<DollarSign size={18} />}
        />
        <StatCard 
          label="Total Loss" 
          value={`$${Math.abs(totalLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          type="loss"
          icon={<TrendingDown size={18} />}
        />
        <StatCard 
          label="Win Rate" 
          value={`${winRate}%`} 
          subValue="All time"
          icon={<Percent size={18} />}
        />
        <StatCard 
          label="Total Trades" 
          value={trades.length} 
          icon={<BarChart2 size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <div className="lg:col-span-2 glass-card p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-6">Equity Growth</h3>
          <div className="h-[300px] lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                  domain={['auto', 'auto']}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily PnL */}
        <div className="glass-card p-4 lg:p-6">
          <h3 className="text-lg font-semibold mb-6">Daily PnL</h3>
          <div className="h-[250px] lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.split('-')[2]}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 4, 4]}>
                  {dailyStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} 
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
