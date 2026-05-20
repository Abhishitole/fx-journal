import React, { useState } from 'react';
import { CURRENCY_PAIRS, STRATEGIES, EMOTIONS } from '../../constants';
import { Trade } from '../../types';
import { X, Save, TrendingUp, TrendingDown, Target, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TradeFormProps {
  onAdd: (trade: Trade) => void;
  onCancel: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Trade>>({
    pair: 'EUR/USD',
    type: 'Buy',
    entryPrice: 0,
    exitPrice: 0,
    lotSize: 0.1,
    pips: 0,
    profit: 0,
    stopLoss: 0,
    takeProfit: 0,
    strategy: 'TJL 1',
    emotionBefore: 'Confident',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      userId: 'temp',
      createdAt: new Date().toISOString(),
      entryTime: new Date().toISOString(),
      result: (formData.profit || 0) > 0 ? 'Win' : (formData.profit || 0) < 0 ? 'Loss' : 'Break Even'
    } as Trade);
  };

  const calculatePips = (pair: string, entry: number, exit: number, type: 'Buy' | 'Sell') => {
    if (!entry || !exit) return 0;
    const isYenPair = pair.includes('JPY') || pair.includes('Gold');
    const multiplier = isYenPair ? 100 : 10000;
    const diff = type === 'Buy' ? exit - entry : entry - exit;
    return Math.round(diff * multiplier);
  };

  const handlePriceChange = (field: 'entryPrice' | 'exitPrice' | 'lotSize' | 'stopLoss' | 'takeProfit', value: number) => {
    const newFormData = { ...formData, [field]: value };
    const pips = calculatePips(newFormData.pair!, newFormData.entryPrice!, newFormData.exitPrice!, newFormData.type!);
    
    // Simple profit estimation: pips * lotSize * 10 (standard lot pip value roughly $10 for majors)
    const multiplier = newFormData.pair?.includes('JPY') ? 0.1 : 1;
    const estimatedProfit = pips * (newFormData.lotSize || 0) * multiplier;
    
    setFormData({ ...newFormData, pips, profit: Number(estimatedProfit.toFixed(2)) });
  };

  return (
    <div className="glass-card w-full max-w-2xl mx-auto p-4 lg:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="text-blue-500" />
          Log New Trade
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Currency Pair</label>
          <select 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.pair}
            onChange={(e) => {
              const pair = e.target.value;
              setFormData({ ...formData, pair });
            }}
          >
            {CURRENCY_PAIRS.map(pair => <option key={pair} value={pair}>{pair}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Type</label>
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            <button
              type="button"
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                formData.type === 'Buy' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400"
              )}
              onClick={() => {
                const type = 'Buy';
                const pips = calculatePips(formData.pair!, formData.entryPrice!, formData.exitPrice!, type);
                setFormData({ ...formData, type, pips });
              }}
            >
              BUY
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                formData.type === 'Sell' ? "bg-rose-500 text-white shadow-lg" : "text-slate-400"
              )}
              onClick={() => {
                const type = 'Sell';
                const pips = calculatePips(formData.pair!, formData.entryPrice!, formData.exitPrice!, type);
                setFormData({ ...formData, type, pips });
              }}
            >
              SELL
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entry Price</label>
          <input 
            type="number" step="0.00001"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.entryPrice}
            onChange={(e) => handlePriceChange('entryPrice', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exit Price</label>
          <input 
            type="number" step="0.00001"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.exitPrice}
            onChange={(e) => handlePriceChange('exitPrice', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lot Size</label>
          <input 
            type="number" step="0.01"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.lotSize}
            onChange={(e) => handlePriceChange('lotSize', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-rose-500">Stop Loss</label>
          <input 
            type="number" step="0.00001"
            className="w-full bg-slate-800/50 border border-rose-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={formData.stopLoss}
            onChange={(e) => handlePriceChange('stopLoss', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-emerald-500">Take Profit</label>
          <input 
            type="number" step="0.00001"
            className="w-full bg-slate-800/50 border border-emerald-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={formData.takeProfit}
            onChange={(e) => handlePriceChange('takeProfit', parseFloat(e.target.value))}
          />
        </div>

        <div className="glass-card p-4 flex flex-col justify-center bg-slate-900">
          <div className="flex justify-between items-center mb-1">
             <span className="text-xs text-slate-500 uppercase">Calculated Result</span>
             <span className={cn(
               "text-xl font-mono font-bold",
               (formData.pips || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
             )}>
               {formData.pips || 0} Pips
             </span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-xs text-slate-500 uppercase">
               {(formData.profit || 0) >= 0 ? 'Est. Profit' : 'Est. Loss'}
             </span>
             <span className={cn(
               "text-xl font-mono font-bold",
               (formData.profit || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
             )}>
               ${Math.abs(formData.profit || 0).toFixed(2)}
             </span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
           <hr className="border-slate-800" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Strategy Used</label>
                <select 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                >
                  {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mindset (Emotion)</label>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map(emote => (
                    <button
                      key={emote.label}
                      type="button"
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all",
                        formData.emotionBefore === emote.label 
                          ? "bg-blue-600 border-blue-500 text-white" 
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500"
                      )}
                      onClick={() => setFormData({ ...formData, emotionBefore: emote.label })}
                    >
                      <span>{emote.icon}</span>
                      {emote.label}
                    </button>
                  ))}
                </div>
              </div>
           </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trade Journal Notes</label>
          <textarea 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            placeholder="Why did you take this trade? What did you learn?"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="md:col-span-2 pt-4">
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <Save size={20} />
            SAVE TRADE RECORD
          </button>
        </div>
      </form>
    </div>
  );
};
