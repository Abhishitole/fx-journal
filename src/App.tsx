import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { TradeTable } from './components/trades/TradeTable';
import { TradeForm } from './components/trades/TradeForm';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { PsychologyView } from './components/psychology/PsychologyView';
import { SettingsView } from './components/settings/SettingsView';
import { MOCK_TRADES } from './mockData';
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

  // Keep localStorage perfectly synced
  useEffect(() => {
    localStorage.setItem('fx_journal_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('fx_journal_balance', startingBalance.toString());
  }, [startingBalance]);

  const handleAddTrade = (newTrade: Trade) => {
    // Sanitize numeric fields to guarantee proper types
    const entryPrice = typeof newTrade.entryPrice === 'number' && !isNaN(newTrade.entryPrice) ? newTrade.entryPrice : 0;
    const exitPrice = typeof newTrade.exitPrice === 'number' && !isNaN(newTrade.exitPrice) ? newTrade.exitPrice : 0;
    const lotSize = typeof newTrade.lotSize === 'number' && !isNaN(newTrade.lotSize) ? newTrade.lotSize : 0.1;
    const pips = typeof newTrade.pips === 'number' && !isNaN(newTrade.pips) ? newTrade.pips : 0;
    const profit = typeof newTrade.profit === 'number' && !isNaN(newTrade.profit) ? newTrade.profit : 0;
    const stopLoss = typeof newTrade.stopLoss === 'number' && !isNaN(newTrade.stopLoss) ? newTrade.stopLoss : 0;
    const takeProfit = typeof newTrade.takeProfit === 'number' && !isNaN(newTrade.takeProfit) ? newTrade.takeProfit : 0;

    const id = Math.random().toString(36).substr(2, 9);
    const completedTrade: Trade = {
      ...newTrade,
      id,
      entryPrice,
      exitPrice,
      lotSize,
      pips,
      profit,
      stopLoss,
      takeProfit,
      userId: 'local_user',
      createdAt: new Date().toISOString()
    };

    setTrades(prevTrades => [completedTrade, ...prevTrades]);
    setActiveTab('trades');
  };

  const handleUpdateBalance = (newBalance: number) => {
    setStartingBalance(newBalance);
  };

  const handleResetData = () => {
    const confirmReset = window.confirm("Are you sure you want to delete all local trade logs and settings? This cannot be undone.");
    if (!confirmReset) return;
    
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
            onUpdateBalance={handleUpdateBalance} 
            onResetData={handleResetData} 
          />
        );
      case 'new-trade':
        return <TradeForm onAdd={handleAddTrade} onCancel={() => setActiveTab('dashboard')} />;
      default:
        return <Dashboard trades={trades} dailyStats={calculateDailyStats()} startingBalance={startingBalance} />;
    }
  };

  return (
    <AppLayout activeTab={activeTab === 'new-trade' ? 'trades' : activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AppLayout>
  );
}
