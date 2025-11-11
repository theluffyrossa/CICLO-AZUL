import { useState, useEffect, useRef, useCallback } from 'react';
import { AccessibilityInfo } from 'react-native';
import { scalesService, ScaleWeightData } from '@/services/scales.service';

interface UseScaleConnectionOptions {
  deviceId?: string;
  pollingInterval?: number; // milliseconds
  autoConnect?: boolean;
}

interface UseScaleConnectionReturn {
  isConnected: boolean;
  isConnecting: boolean;
  latestWeight: number | null;
  lastReading: ScaleWeightData | null;
  error: string | null;
  connect: (deviceId: string) => Promise<void>;
  disconnect: () => void;
  sendWeight: (weightKg: number) => Promise<void>;
}

const DEFAULT_POLLING_INTERVAL = 2000; // 2 seconds

export const useScaleConnection = (
  options: UseScaleConnectionOptions = {}
): UseScaleConnectionReturn => {
  const {
    deviceId: initialDeviceId,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
    autoConnect = false,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [lastReading, setLastReading] = useState<ScaleWeightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(initialDeviceId || null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimestampRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    async (scaleDeviceId: string) => {
      stopPolling();

      const poll = async (): Promise<void> => {
        try {
          const readings = await scalesService.pollScaleData(
            scaleDeviceId,
            lastTimestampRef.current || undefined
          );

          if (readings.length > 0) {
            const latestReading = readings[readings.length - 1];
            setLastReading(latestReading);
            setLatestWeight(latestReading.weightKg);
            lastTimestampRef.current = latestReading.timestamp;

            AccessibilityInfo.announceForAccessibility(
              `Nova leitura: ${latestReading.weightKg} quilogramas`
            );
          }
        } catch (err) {
          console.error('Polling error:', err);
          setError('Erro ao obter dados da balança');
        }
      };

      // Initial poll
      await poll();

      // Set up interval
      pollingIntervalRef.current = setInterval(poll, pollingInterval);
    },
    [pollingInterval, stopPolling]
  );

  const connect = useCallback(
    async (scaleDeviceId: string): Promise<void> => {
      setIsConnecting(true);
      setError(null);

      try {
        // Try to get latest reading to verify connection
        const reading = await scalesService.getLatestReading(scaleDeviceId);

        if (reading) {
          setLastReading(reading);
          setLatestWeight(reading.weightKg);
          lastTimestampRef.current = reading.timestamp;
        }

        setDeviceId(scaleDeviceId);
        setIsConnected(true);

        // Start polling for new data
        await startPolling(scaleDeviceId);

        AccessibilityInfo.announceForAccessibility(
          'Balança conectada com sucesso'
        );
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Erro ao conectar à balança';
        setError(errorMsg);
        setIsConnected(false);
        AccessibilityInfo.announceForAccessibility(`Erro: ${errorMsg}`);
      } finally {
        setIsConnecting(false);
      }
    },
    [startPolling]
  );

  const disconnect = useCallback(() => {
    stopPolling();
    setIsConnected(false);
    setDeviceId(null);
    setLatestWeight(null);
    setLastReading(null);
    lastTimestampRef.current = null;
    setError(null);

    AccessibilityInfo.announceForAccessibility('Balança desconectada');
  }, [stopPolling]);

  const sendWeight = useCallback(
    async (weightKg: number): Promise<void> => {
      if (!deviceId) {
        throw new Error('Nenhuma balança conectada');
      }

      try {
        const data = await scalesService.sendWeightData({
          weightKg,
          deviceId,
        });

        setLastReading(data);
        setLatestWeight(data.weightKg);

        AccessibilityInfo.announceForAccessibility(
          `Peso enviado: ${weightKg} quilogramas`
        );
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Erro ao enviar peso';
        setError(errorMsg);
        throw err;
      }
    },
    [deviceId]
  );

  // Auto-connect on mount if deviceId provided
  useEffect(() => {
    if (autoConnect && initialDeviceId) {
      connect(initialDeviceId);
    }

    return () => {
      stopPolling();
    };
  }, [autoConnect, initialDeviceId]); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isConnected,
    isConnecting,
    latestWeight,
    lastReading,
    error,
    connect,
    disconnect,
    sendWeight,
  };
};
