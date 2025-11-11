import { useOfflineStore, PendingAction } from '@/store/offlineStore';
import { collectionsService } from './collections.service';
import { gravimetricDataService } from './gravimetricData.service';
import { imagesService } from './images.service';

class OfflineService {
  private syncInProgress = false;

  /**
   * Sincroniza todas as ações pendentes com o servidor
   */
  async syncPendingActions(): Promise<{
    success: number;
    failed: number;
    errors: Array<{ action: PendingAction; error: string }>;
  }> {
    const store = useOfflineStore.getState();

    if (this.syncInProgress) {
      console.log('Sync já em andamento');
      return { success: 0, failed: 0, errors: [] };
    }

    if (!store.isOnline) {
      console.log('Dispositivo offline - sync cancelado');
      return { success: 0, failed: 0, errors: [] };
    }

    if (store.pendingActions.length === 0) {
      console.log('Nenhuma ação pendente para sincronizar');
      return { success: 0, failed: 0, errors: [] };
    }

    this.syncInProgress = true;
    store.setIsSyncing(true);

    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{ action: PendingAction; error: string }> = [];

    console.log(`Iniciando sync de ${store.pendingActions.length} ações`);

    // Processar cada ação pendente
    for (const action of store.pendingActions) {
      try {
        await this.processAction(action);
        await store.removePendingAction(action.id);
        successCount++;
        console.log(`Ação ${action.id} sincronizada com sucesso`);
      } catch (error) {
        failedCount++;
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        errors.push({ action, error: errorMessage });

        // Incrementar retry count
        const newRetryCount = action.retryCount + 1;

        if (newRetryCount >= action.maxRetries) {
          // Excedeu máximo de tentativas - remover ação
          await store.removePendingAction(action.id);
          console.error(
            `Ação ${action.id} excedeu máximo de tentativas (${action.maxRetries}) - removida`
          );
        } else {
          // Atualizar retry count
          await store.updatePendingAction(action.id, {
            retryCount: newRetryCount,
          });
          console.warn(
            `Falha ao sincronizar ação ${action.id} - tentativa ${newRetryCount}/${action.maxRetries}`
          );
        }
      }
    }

    store.setLastSyncAt(Date.now());
    await store.saveToStorage();

    this.syncInProgress = false;
    store.setIsSyncing(false);

    console.log(
      `Sync concluído: ${successCount} sucesso, ${failedCount} falhas`
    );

    return { success: successCount, failed: failedCount, errors };
  }

  /**
   * Processa uma ação individual
   */
  private async processAction(action: PendingAction): Promise<void> {
    switch (action.entity) {
      case 'collection':
        await this.processCollectionAction(action);
        break;
      case 'gravimetricData':
        await this.processGravimetricDataAction(action);
        break;
      case 'image':
        await this.processImageAction(action);
        break;
      default:
        throw new Error(`Entidade desconhecida: ${action.entity}`);
    }
  }

  /**
   * Processa ação de coleta
   */
  private async processCollectionAction(action: PendingAction): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        await collectionsService.createCollection(action.data);
        break;
      case 'UPDATE':
        await collectionsService.updateCollection(
          action.data.id,
          action.data
        );
        break;
      case 'DELETE':
        await collectionsService.deleteCollection(action.data.id);
        break;
    }
  }

  /**
   * Processa ação de dados gravimétricos
   */
  private async processGravimetricDataAction(
    action: PendingAction
  ): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        await gravimetricDataService.create(action.data);
        break;
      case 'UPDATE':
        await gravimetricDataService.update(action.data.id, action.data);
        break;
      case 'DELETE':
        await gravimetricDataService.delete(action.data.id);
        break;
    }
  }

  /**
   * Processa ação de imagem
   */
  private async processImageAction(action: PendingAction): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        await imagesService.uploadImage(action.data);
        break;
      case 'DELETE':
        await imagesService.deleteImage(action.data.id);
        break;
      // UPDATE não é suportado para imagens
    }
  }

  /**
   * Adiciona uma ação à fila offline
   */
  async addOfflineAction(
    entity: PendingAction['entity'],
    type: PendingAction['type'],
    data: any,
    maxRetries: number = 3
  ): Promise<void> {
    const store = useOfflineStore.getState();
    await store.addPendingAction({
      entity,
      type,
      data,
      maxRetries,
    });

    console.log(
      `Ação offline adicionada: ${entity} - ${type}`,
      store.isOnline ? '(online - tentará sync)' : '(offline)'
    );

    // Se estiver online, tentar sincronizar imediatamente
    if (store.isOnline) {
      setTimeout(() => {
        this.syncPendingActions();
      }, 1000);
    }
  }

  /**
   * Verifica se há ações pendentes
   */
  hasPendingActions(): boolean {
    return useOfflineStore.getState().pendingActions.length > 0;
  }

  /**
   * Retorna número de ações pendentes
   */
  getPendingActionsCount(): number {
    return useOfflineStore.getState().pendingActions.length;
  }
}

export const offlineService = new OfflineService();
