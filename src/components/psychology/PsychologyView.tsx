import React from 'react';
import { Trade } from '../../types';
import { EMOTIONS } from '../../constants';
import { Brain, Quote, Target, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PsychologyViewProps {
  trades: Trade[];
}

export const PsychologyView: React.FC<PsychologyViewProps> = ({ trades }) => {
  const emotionsFreq: Record<string, number> = {};
  trades.forEach(t => {
    if (t.emotionBefore) emotionsFreq[t.emotionBefore] = (emotionsFreq[t.emotionBefore] || 0) + 1;
  });

  const topEmotion = Object.entries(emotionsFreq).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-500">
              <Brain size={32} />
            </div>
            <h3 className="text-sm text-slate-500 uppercase font-bold tracking-widest">Primary State</h3>
            <p className="text-2xl font-bold mt-1">{topEmotion}</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-emerald-500">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-sm text-slate-500 uppercase font-bold tracking-widest">Discipline Score</h3>
            <p className="text-2xl font-bold mt-1">{trades.length > 0 ? "85%" : "0%"}</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-500">
              <Target size={32} />
            </div>
            <h3 className="text-sm text-slate-500 uppercase font-bold tracking-widest">Plan Adherence</h3>
            <p className="text-2xl font-bold mt-1">{trades.length > 0 ? "100%" : "0%"}</p>
        </div>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
           <Quote className="text-blue-500" />
           Emotional Insights
        </h3>
        <div className="space-y-4">
           {trades.filter(t => t.notes).map(t => (
             <div key={t.id} className="p-4 rounded-lg bg-slate-800/20 border border-slate-700/50">
               <div className="flex items-center gap-2 mb-2">
                 <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase">{t.pair}</span>
                 <span className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                 <span className="ml-auto text-sm">{EMOTIONS.find(e => e.label === t.emotionBefore)?.icon}</span>
               </div>
               <p className="text-slate-300 italic">"{t.notes}"</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
