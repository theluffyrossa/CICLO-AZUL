export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const PASSWORD_RULES = {
  MIN_LENGTH: 4, // Permite PINs de 4 dígitos para desenvolvimento
  MAX_LENGTH: 128,
  REQUIRE_LETTERS: false, // Desabilitado para permitir PINs numéricos
  REQUIRE_NUMBERS: true,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10485760,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  IMAGE_QUALITY: 80,
  IMAGE_MAX_WIDTH: 1920,
  IMAGE_MAX_HEIGHT: 1080,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'Usuário não encontrado. Verifique se digitou corretamente.',
  USERNAME_CASE_MISMATCH: 'Usuário encontrado, mas com diferença entre maiúsculas/minúsculas. Tente: ',
  INCORRECT_PASSWORD: 'Senha incorreta. Por favor, verifique seu código de acesso.',
  USER_INACTIVE: 'Esta conta está inativa. Entre em contato com o administrador.',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  WEAK_PASSWORD: 'Password must be at least 4 characters',
  INVALID_TOKEN: 'Invalid or expired token',
  SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  FILE_TOO_LARGE: 'File size exceeds maximum allowed',
  INVALID_FILE_TYPE: 'Invalid file type',
  CANNOT_EDIT_APPROVED_COLLECTION: 'Coletas validadas não podem ser editadas',
  CANNOT_DELETE_APPROVED_COLLECTION: 'Coletas validadas não podem ser excluídas',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
} as const;

export const AUDIT_RETENTION_DAYS = 2555;
export const BACKUP_RETENTION_DAYS = 30;
export const SESSION_TIMEOUT_MINUTES = 30;

export const BACKUP = {
  DIR: process.env.BACKUP_DIR || './backups',
  RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  MIN_BACKUPS_TO_KEEP: 5,
  COMPRESSION: true,
  PREFIX: 'cicloazul-backup',
} as const;
