import { supabase } from '@/integrations/supabase/client';

const OFFLINE_QUEUE_KEY = 'offline_queue';

export interface OfflineOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

// Guardar operación en cola offline
export function queueOfflineOperation(
  type: OfflineOperation['type'],
  table: string,
  data: any
): void {
  const operation: OfflineOperation = {
    id: crypto.randomUUID(),
    type,
    table,
    data,
    timestamp: Date.now()
  };

  const queue = getOfflineQueue();
  queue.push(operation);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  
  console.log('Operación guardada en cola offline:', operation);
}

// Obtener cola de operaciones offline
export function getOfflineQueue(): OfflineOperation[] {
  try {
    const queueStr = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  } catch (error) {
    console.error('Error al leer cola offline:', error);
    return [];
  }
}

// Limpiar cola de operaciones offline
export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// Sincronizar operaciones pendientes
export async function syncOfflineOperations(): Promise<{
  success: number;
  failed: number;
  errors: Array<{ operation: OfflineOperation; error: any }>;
}> {
  const queue = getOfflineQueue();
  
  if (queue.length === 0) {
    console.log('No hay operaciones offline pendientes');
    return { success: 0, failed: 0, errors: [] };
  }

  console.log(`Sincronizando ${queue.length} operaciones offline...`);
  
  let successCount = 0;
  let failedCount = 0;
  const errors: Array<{ operation: OfflineOperation; error: any }> = [];
  const remainingQueue: OfflineOperation[] = [];

  for (const operation of queue) {
    try {
      await executeOperation(operation);
      successCount++;
      console.log('Operación sincronizada:', operation);
    } catch (error) {
      console.error('Error al sincronizar operación:', operation, error);
      failedCount++;
      errors.push({ operation, error });
      remainingQueue.push(operation);
    }
  }

  // Actualizar cola con operaciones fallidas
  if (remainingQueue.length > 0) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  } else {
    clearOfflineQueue();
  }

  return { success: successCount, failed: failedCount, errors };
}

// Ejecutar una operación contra Supabase
async function executeOperation(operation: OfflineOperation): Promise<void> {
  const { type, table, data } = operation;

  switch (type) {
    case 'insert':
      const { error: insertError } = await supabase
        .from(table as any)
        .insert(data);
      if (insertError) throw insertError;
      break;

    case 'update':
      const { id, ...updateData } = data;
      const { error: updateError } = await supabase
        .from(table as any)
        .update(updateData)
        .eq('id', id);
      if (updateError) throw updateError;
      break;

    case 'delete':
      const { error: deleteError } = await supabase
        .from(table as any)
        .delete()
        .eq('id', data.id);
      if (deleteError) throw deleteError;
      break;

    default:
      throw new Error(`Tipo de operación no soportada: ${type}`);
  }
}

// Registrar Service Worker y manejar sincronización
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);

        // Escuchar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', async (event) => {
          if (event.data && event.data.type === 'SYNC_OFFLINE_DATA') {
            console.log('Recibida señal de sincronización del SW');
            const result = await syncOfflineOperations();
            console.log('Resultado de sincronización:', result);
          }
        });

        // Registrar sincronización en segundo plano si está disponible
        if ('sync' in registration) {
          console.log('Background Sync disponible');
        }
      } catch (error) {
        console.error('Error al registrar Service Worker:', error);
      }
    });

    // Sincronizar cuando se recupera la conexión
    window.addEventListener('online', async () => {
      console.log('Conexión restaurada - sincronizando datos...');
      const result = await syncOfflineOperations();
      
      if (result.success > 0) {
        console.log(`✓ ${result.success} operaciones sincronizadas exitosamente`);
      }
      
      if (result.failed > 0) {
        console.warn(`✗ ${result.failed} operaciones fallaron al sincronizar`);
      }
    });
  }
}
