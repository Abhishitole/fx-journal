import React, { useState, useEffect } from 'react';
import { FirebaseProvider, useFirebase } from './providers/FirebaseProvider';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { TradeTable } from './components/trades/TradeTable';
import { TradeForm } from './components/trades/TradeForm';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { PsychologyView } from './components/psychology/PsychologyView';
import { SettingsView } from './components/settings/SettingsView';
import { MOCK_TRADES, MOCK_DAILY_STATS } from './mockData';
import { Trade, AccountSettings } from './types';
import { 
  getTradesFromFirestore, 
  saveTradeToFirestore, 
  deleteTradeFromFirestore,
  getAccountSettingsFromFirestore,
  saveAccountSettingsToFirestore,
  subscribeToTrades
} from './lib/firestore';

function TradingJournal() {
  const { user, db, auth } = useFirebase();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('fx_journal_trades');
    return saved ? JSON.parse(saved) : MOCK_TRADES;
  });
  
  const [startingBalance, setStartingBalance] = useState<number>(() => {
    const saved = localStorage.getItem('fx_journal_balance');
    return saved ? parseFloat(saved) : 10000;
  });

  // Keep localStorage sync when signed out or offline
  useEffect(() => {
    if (!user) {
      localStorage.setItem('fx_journal_trades', JSON.stringify(trades));
    }
  }, [trades, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('fx_journal_balance', startingBalance.toString());
    }
  }, [startingBalance, user]);

  // Sync to/from Firestore when user authenticated
  useEffect(() => {
    if (!user || !db) return;

    let unsubscribe: (() => void) | undefined;

    const syncWithFirestore = async () => {
      try {
        // Sync account settings
        const settings = await getAccountSettingsFromFirestore(db, auth, user.uid);
        if (settings) {
          setStartingBalance(settings.startingBalance);
        } else {
          const defaultSettings: AccountSettings = {
            userId: user.uid,
            startingBalance: startingBalance,
            currentBalance: startingBalance,
            currency: 'USD',
            updatedAt: new Date().toISOString()
          };
          await saveAccountSettingsToFirestore(db, auth, defaultSettings);
        }

        // Merge any local trading data created offline/previously
        const localTradesStr = localStorage.getItem('fx_journal_trades');
        const localTrades = localTradesStr ? JSON.parse(localTradesStr) : [];
        if (localTrades.length > 0 && JSON.stringify(localTrades) !== JSON.stringify(MOCK_TRADES)) {
          const cloudTrades = await getTradesFromFirestore(db, auth, user.uid);
          const cloudTradeIds = new Set(cloudTrades.map(t => t.id));

          for (const t of localTrades) {
            const id = t.id || Math.random().toString(36).substr(2, 9);
            if (!cloudTradeIds.has(id)) {
              await saveTradeToFirestore(db, auth, {
                ...t,
                id,
                userId: user.uid,
                createdAt: t.createdAt || new Date().toISOString()
              });
            }
          }
          localStorage.removeItem('fx_journal_trades');
        }

        // Set up real-time listener for seamless cloud database state sync
        unsubscribe = subscribeToTrades(db, auth, user.uid, (cloudTrades) => {
          const sorted = [...cloudTrades].sort((a, b) => 
            new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
          );
          setTrades(sorted);
        }, (err) => {
          console.error("Trades listener subscription failed:", err);
        });

      } catch (err) {
        console.error("Firestore sync error:", err);
      }
    };

    syncWithFirestore();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, db]);

  // Fallback to local data when logged out or offline
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('fx_journal_trades');
      setTrades(saved ? JSON.parse(saved) : MOCK_TRADES);
      const savedBalance = localStorage.getItem('fx_journal_balance');
      setStartingBalance(savedBalance ? parseFloat(savedBalance) : 10000);
    }
  }, [user]);

  const handleAddTrade = async (newTrade: Trade) => {
    const id = Math.random().toString(36).substr(2, 9);
    const completedTrade: Trade = {
      ...newTrade,
      id,
      userId: user ? user.uid : 'local_user',
      createdAt: new Date().toISOString()
    };

    if (user && db) {
      try {
        await saveTradeToFirestore(db, auth, completedTrade);
      } catch (err) {
        console.error("Failed to save trade to Firestore:", err);
        // Optimistic fallback update for safe local session state
        setTrades([completedTrade, ...trades]);
      }
    } else {
      setTrades([completedTrade, ...trades]);
    }
    setActiveTab('trades');
  };

  const handleUpdateBalance = async (newBalance: number) => {
    setStartingBalance(newBalance);
    if (user && db) {
      try {
        const updatedSettings: AccountSettings = {
          userId: user.uid,
          startingBalance: newBalance,
          currentBalance: newBalance,
          currency: 'USD',
          updatedAt: new Date().toISOString()
        };
        await saveAccountSettingsToFirestore(db, auth, updatedSettings);
      } catch (err) {
        console.error("Failed to save settings modifications to Firestore:", err);
      }
    }
  };

  const handleResetData = async () => {
    if (user && db) {
      const confirmReset = window.confirm("Are you sure you want to delete all cloud trade logs and settings? This cannot be undone.");
      if (!confirmReset) return;
      
      try {
        for (const t of trades) {
          if (t.id) {
            await deleteTradeFromFirestore(db, auth, t.id);
          }
        }
        
        const resetSettings: AccountSettings = {
          userId: user.uid,
          startingBalance: 10000,
          currentBalance: 10000,
          currency: 'USD',
          updatedAt: new Date().toISOString()
        };
        await saveAccountSettingsToFirestore(db, auth, resetSettings);
      } catch (err) {
        console.error("Data deletion from Firestore failed:", err);
      }
    }

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
        return <Dashboard trades={trades} dailyStats={MOCK_DAILY_STATS} startingBalance={startingBalance} />;
    }
  };

  return (
    <AppLayout activeTab={activeTab === 'new-trade' ? 'trades' : activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <TradingJournal />
    </FirebaseProvider>
  );
}
