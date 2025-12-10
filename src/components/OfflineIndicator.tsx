import { useEffect, useState } from 'react';
import { useOnline } from '@/hooks/use-online';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { getOfflineQueue, syncOfflineOperations } from '@/lib/offlineSync';

export function OfflineIndicator() {
  const isOnline = useOnline();
  const [queueCount, setQueueCount] = useState(0);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    const updateQueueCount = () => {
      const queue = getOfflineQueue();
      setQueueCount(queue.length);
    };

    updateQueueCount();
    const interval = setInterval(updateQueueCount, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline && queueCount > 0) {
      syncOfflineOperations().then((result) => {
        if (result.success > 0) {
          setShowOnlineMessage(true);
          setTimeout(() => setShowOnlineMessage(false), 5000);
        }
      });
    }
  }, [isOnline]);

  if (isOnline && queueCount === 0 && !showOnlineMessage) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {!isOnline ? (
        <Alert className="bg-destructive/90 text-destructive-foreground border-destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>Sin conexión</strong>
            {queueCount > 0 && (
              <span className="block text-sm mt-1">
                {queueCount} operación(es) pendiente(s) de sincronizar
              </span>
            )}
          </AlertDescription>
        </Alert>
      ) : showOnlineMessage && (
        <Alert className="bg-green-500/90 text-white border-green-600">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            <strong>Conexión restaurada</strong>
            <span className="block text-sm mt-1">
              Datos sincronizados correctamente
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
