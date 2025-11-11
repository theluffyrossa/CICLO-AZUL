import bcrypt from 'bcrypt';
import { appConfig } from '@config/app.config';
import { PASSWORD_RULES } from '../constants';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

export const validatePasswordStrength = (password: string): boolean => {
  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    return false;
  }

  if (password.length > PASSWORD_RULES.MAX_LENGTH) {
    return false;
  }

  if (PASSWORD_RULES.REQUIRE_LETTERS && PASSWORD_RULES.REQUIRE_NUMBERS) {
    return PASSWORD_PATTERN.test(password);
  }

  return true;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, appConfig.bcryptSaltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
