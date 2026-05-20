import React, { useState, useEffect } from 'react';
import { FirebaseProvider } from './providers/FirebaseProvider';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { TradeTable } from './components/trades/TradeTable';
import { TradeForm } from './components/trades/TradeForm';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { PsychologyView } from './components/psychology/PsychologyView';
import { SettingsView } from './components/settings/SettingsView';
import { MOCK_TRADES, MOCK_DAILY_STATS } from './mockData';
import { Trade } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('fx_journal_trades');
    return saved ? JSON.parse(saved) : MOCK_TRADES;
  });
  const [startingBalance, setStartingBalance] = useState<number>(() => {
    const saved = localStorage.getItem('fx_journal_balance');
    return saved ? parseFloat(saved) : 10000;
  });

  useEffect(() => {
    localStorage.setItem('fx_journal_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('fx_journal_balance', startingBalance.toString());
  }, [startingBalance]);

  const handleAddTrade = (newTrade: Trade) => {
    const tradeWithId = { ...newTrade, id: Math.random().toString(36).substr(2, 9) };
    setTrades([tradeWithId, ...trades]);
    setActiveTab('trades');
  };

  const handleResetData = () => {
    setTrades([]);
    setStartingBalance(10000);
    setActiveTab('dashboard');
    localStorage.removeItem('fx_journal_trades');
    localStorage.removeItem('fx_journal_balance');
  };

  const calculateDailyStats = () => {
    const statsMap: Record<string, number> = {};
    trades.forEach(t => {
      const date = new Date(t.entryTime).toISOString().split('T')[0];
      statsMap[date] = (statsMap[date] || 0) + (t.profit || 0);
    });
    return Object.entries(statsMap).map(([date, pnl]) => ({ date, pnl }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard trades={trades} dailyStats={calculateDailyStats()} startingBalance={startingBalance} />;
      case 'trades':
        return <TradeTable trades={trades} />;
      case 'analytics':
        return <AnalyticsView trades={trades} />;
      case 'psychology':
        return <PsychologyView trades={trades} />;
      case 'settings':
        return (
          <SettingsView 
            startingBalance={startingBalance} 
            onUpdateBalance={setStartingBalance} 
            onResetData={handleResetData} 
          />
        );
      case 'new-trade':
        return <TradeForm onAdd={handleAddTrade} onCancel={() => setActiveTab('dashboard')} />;
      default:
        return <Dashboard trades={trades} dailyStats={MOCK_DAILY_STATS} startingBalance={startingBalance} />;
    }
  };

  return (
    <FirebaseProvider>
      <AppLayout activeTab={activeTab === 'new-trade' ? 'trades' : activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </AppLayout>
    </FirebaseProvider>
  );
}
