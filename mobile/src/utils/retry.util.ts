/**
 * Utilitário para retry de operações com exponential backoff
 */

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  backoffMultiplier: 2,
  onRetry: () => {},
};

/**
 * Calcula o delay para o próximo retry usando exponential backoff
 */
const calculateDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number => {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
};

/**
 * Aguarda por um determinado tempo
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Verifica se o erro é retryable (não permanente)
 */
const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return true;

  const message = error.message.toLowerCase();

  // Erros que NÃO devem fazer retry
  const nonRetryablePatterns = [
    'unauthorized',
    'forbidden',
    'not found',
    'invalid',
    'bad request',
    'validation',
    'consent',
    'lgpd',
  ];

  const isNonRetryable = nonRetryablePatterns.some((pattern) =>
    message.includes(pattern)
  );

  return !isNonRetryable;
};

/**
 * Executa uma função com retry e exponential backoff
 *
 * @param fn - Função assíncrona a ser executada
 * @param options - Opções de configuração do retry
 * @returns Promise com o resultado da função
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => await uploadImage(data),
 *   {
 *     maxAttempts: 3,
 *     onRetry: (attempt, error) => {
 *       console.log(`Tentativa ${attempt} falhou:`, error.message);
 *     }
 *   }
 * );
 * ```
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const config: Required<RetryOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    // Garante que onRetry sempre seja uma função
    onRetry: options.onRetry || DEFAULT_OPTIONS.onRetry,
  };
  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Verifica se deve fazer retry
      if (!isRetryableError(error)) {
        throw error;
      }

      // Se foi a última tentativa, lança o erro
      if (attempt === config.maxAttempts) {
        break;
      }

      // Calcula delay e notifica callback
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier
      );

      config.onRetry(attempt, error instanceof Error ? error : new Error(String(error)));

      // Aguarda antes de tentar novamente
      await sleep(delay);
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  throw lastError;
};

/**
 * Hook para uso em React com retry automático
 */
export const createRetryableFunction = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
): ((...args: T) => Promise<R>) => {
  return async (...args: T): Promise<R> => {
    return retryWithBackoff(() => fn(...args), options);
  };
};

/**
 * Wrapper para upload de imagens com retry
 */
export const retryableUpload = async <T>(
  uploadFn: () => Promise<T>,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> => {
  return retryWithBackoff(uploadFn, {
    maxAttempts: 3,
    initialDelay: 2000, // 2 segundos para uploads
    maxDelay: 15000, // 15 segundos max
    backoffMultiplier: 2,
    onRetry,
  });
};

/**
 * Retry específico para operações de rede
 */
export const retryNetworkOperation = async <T>(
  operationFn: () => Promise<T>,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> => {
  return retryWithBackoff(operationFn, {
    maxAttempts: 5, // Mais tentativas para operações de rede
    initialDelay: 1000,
    maxDelay: 30000, // 30 segundos max
    backoffMultiplier: 1.5,
    onRetry,
  });
};
