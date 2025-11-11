import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface PendingAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'collection' | 'gravimetricData' | 'image';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: PendingAction[];
  isSyncing: boolean;
  lastSyncAt: number | null;

  // Actions
  setOnlineStatus: (status: boolean) => void;
  addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  removePendingAction: (id: string) => Promise<void>;
  updatePendingAction: (id: string, updates: Partial<PendingAction>) => Promise<void>;
  setPendingActions: (actions: PendingAction[]) => void;
  setIsSyncing: (status: boolean) => void;
  setLastSyncAt: (timestamp: number) => void;
  clearPendingActions: () => Promise<void>;

  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const OFFLINE_STORAGE_KEY = '@ciclo_azul:offline_data';

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  pendingActions: [],
  isSyncing: false,
  lastSyncAt: null,

  setOnlineStatus: (status: boolean) => {
    set({ isOnline: status });
  },

  addPendingAction: async (actionData) => {
    const action: PendingAction = {
      ...actionData,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    set((state) => ({
      pendingActions: [...state.pendingActions, action],
    }));

    await get().saveToStorage();
  },

  removePendingAction: async (id: string) => {
    set((state) => ({
      pendingActions: state.pendingActions.filter((action) => action.id !== id),
    }));

    await get().saveToStorage();
  },

  updatePendingAction: async (id: string, updates: Partial<PendingAction>) => {
    set((state) => ({
      pendingActions: state.pendingActions.map((action) =>
        action.id === id ? { ...action, ...updates } : action
      ),
    }));

    await get().saveToStorage();
  },

  setPendingActions: (actions: PendingAction[]) => {
    set({ pendingActions: actions });
  },

  setIsSyncing: (status: boolean) => {
    set({ isSyncing: status });
  },

  setLastSyncAt: (timestamp: number) => {
    set({ lastSyncAt: timestamp });
  },

  clearPendingActions: async () => {
    set({ pendingActions: [] });
    await AsyncStorage.removeItem(OFFLINE_STORAGE_KEY);
  },

  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({
          pendingActions: parsed.pendingActions || [],
          lastSyncAt: parsed.lastSyncAt || null,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const { pendingActions, lastSyncAt } = get();
      await AsyncStorage.setItem(
        OFFLINE_STORAGE_KEY,
        JSON.stringify({
          pendingActions,
          lastSyncAt,
        })
      );
    } catch (error) {
      console.error('Erro ao salvar dados offline:', error);
    }
  },
}));

// Inicializar listener de conectividade
export const initializeNetworkListener = (): (() => void) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    useOfflineStore.getState().setOnlineStatus(state.isConnected ?? false);
  });

  return unsubscribe;
};

// Hook para verificar status de conectividade
export const useIsOnline = (): boolean => {
  return useOfflineStore((state) => state.isOnline);
};

// Hook para obter pending actions
export const usePendingActions = (): PendingAction[] => {
  return useOfflineStore((state) => state.pendingActions);
};

// Hook para obter status de sincronização
export const useIsSyncing = (): boolean => {
  return useOfflineStore((state) => state.isSyncing);
};
