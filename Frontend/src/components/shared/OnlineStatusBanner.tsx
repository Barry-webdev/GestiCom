import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useEffect, useState } from 'react';
import { syncPendingActions } from '@/lib/sync-manager';
import { getPendingActions } from '@/lib/offline-storage';

export function OnlineStatusBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function checkPending() {
      const actions = await getPendingActions();
      setPendingCount(actions.length);
    }
    checkPending();

    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function handleSync() {
      if (isOnline && wasOffline && pendingCount > 0) {
        setIsSyncing(true);
        await syncPendingActions();
        setIsSyncing(false);
        const actions = await getPendingActions();
        setPendingCount(actions.length);
      }
    }

    handleSync();

    window.addEventListener('sync-required', handleSync);
    return () => window.removeEventListener('sync-required', handleSync);
  }, [isOnline, wasOffline, pendingCount]);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium text-center ${
        isOnline
          ? 'bg-blue-600 text-white'
          : 'bg-orange-600 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synchronisation en cours...</span>
              </>
            ) : pendingCount > 0 ? (
              <span>{pendingCount} action(s) en attente de synchronisation</span>
            ) : (
              <span>Connecté - Toutes les données sont synchronisées</span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Mode hors ligne - Les modifications seront synchronisées à la reconnexion</span>
            {pendingCount > 0 && <span className="ml-2">({pendingCount} en attente)</span>}
          </>
        )}
      </div>
    </div>
  );
}
