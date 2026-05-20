import React, { useState } from 'react';
import { Save, RotateCcw, ShieldAlert, Wallet } from 'lucide-react';

interface SettingsViewProps {
  startingBalance: number;
  onUpdateBalance: (balance: number) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  startingBalance, 
  onUpdateBalance, 
  onResetData 
}) => {
  const [balance, setBalance] = useState(startingBalance);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSave = () => {
    onUpdateBalance(balance);
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="text-blue-500" />
          Account Configuration
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starting Account Balance (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input 
                type="number"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value))}
              />
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Save size={18} />
            Update Account Balance
          </button>
        </div>
      </div>

      <div className="glass-card p-8 border-rose-500/20">
        <h3 className="text-xl font-bold mb-2 text-rose-500 flex items-center gap-2">
          <ShieldAlert />
          Danger Zone
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Resetting your data will permanently delete all trade logs and return your account balance to the starting value. This action cannot be undone.
        </p>
        
        {!showConfirmReset ? (
          <button 
            onClick={() => setShowConfirmReset(true)}
            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/50 font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset All Journal Data
          </button>
        ) : (
          <div className="flex flex-col gap-4 p-4 bg-rose-500/10 rounded-lg border border-rose-500/30">
            <p className="font-bold text-rose-500">Are you absolutely sure?</p>
            <div className="flex gap-4">
              <button 
                onClick={onResetData}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-lg"
              >
                Yes, Delete Everything
              </button>
              <button 
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
