import React from 'react';
import { Trade } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Clock, Activity, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface TradeTableProps {
  trades: Trade[];
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  const exportToExcel = () => {
    const dataToExport = trades.map(t => ({
      Date: format(new Date(t.entryTime), 'yyyy-MM-dd HH:mm'),
      Pair: t.pair,
      Type: t.type,
      Entry: t.entryPrice,
      Exit: t.exitPrice || '-',
      Lots: t.lotSize,
      Pips: t.pips || 0,
      Profit: t.profit || 0,
      Result: t.result,
      Strategy: t.strategy,
      Notes: t.notes
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trades");
    XLSX.writeFile(workbook, `Trading_Journal_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={exportToExcel}
          className="glass-button flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>
      <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/30">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Lots</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pips</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Profit</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium">{format(new Date(trade.entryTime), 'MMM dd')}</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">{format(new Date(trade.entryTime), 'HH:mm')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap">
                  {trade.pair}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap hidden sm:table-cell">
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-bold uppercase",
                    trade.type === 'Buy' ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"
                  )}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-mono whitespace-nowrap hidden md:table-cell">
                   {trade.entryPrice.toFixed(4)}
                   <span className="mx-2 text-slate-600">→</span>
                   {trade.exitPrice?.toFixed(4) || '-'}
                </td>
                <td className="px-6 py-4 text-sm font-mono whitespace-nowrap hidden lg:table-cell">
                   {trade.lotSize.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm font-mono whitespace-nowrap">
                   <span className={cn(
                     trade.pips && trade.pips >= 0 ? "text-emerald-400" : "text-rose-400"
                   )}>
                     {trade.pips ? (trade.pips > 0 ? `+${trade.pips}` : trade.pips) : 0}
                   </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                   <span className={cn(
                     trade.profit && trade.profit >= 0 ? "text-emerald-500" : "text-rose-500"
                   )}>
                     {trade.profit ? `$${trade.profit.toFixed(2)}` : '$0.00'}
                   </span>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap hidden sm:table-cell">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    trade.result === 'Win' ? "bg-emerald-500/10 text-emerald-500" :
                    trade.result === 'Loss' ? "bg-rose-500/10 text-rose-500" : "bg-slate-500/10 text-slate-500"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      trade.result === 'Win' ? "bg-emerald-500" :
                      trade.result === 'Loss' ? "bg-rose-500" : "bg-slate-500"
                    )} />
                    {trade.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};
