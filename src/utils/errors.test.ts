/**
 * RAVO OS — Error Utils Tests
 */

import { describe, it, expect } from 'vitest';
import { createError, handleError, getErrorMessage, assert } from './errors';

describe('Error Utils', () => {
  describe('createError', () => {
    it('should create error with default message', () => {
      const error = createError('UNKNOWN_ERROR');
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.message).toBe('Erro desconhecido. Tente novamente');
    });

    it('should create error with custom message', () => {
      const error = createError('CUSTOM_ERROR', 'Custom message');
      expect(error.message).toBe('Custom message');
    });

    it('should include original error', () => {
      const originalError = new Error('Original');
      const error = createError('TEST_ERROR', undefined, originalError);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should extract message from string', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default for null/undefined', () => {
      expect(getErrorMessage(null)).toBe('Erro desconhecido. Tente novamente');
      expect(getErrorMessage(undefined)).toBe('Erro desconhecido. Tente novamente');
    });
  });

  describe('assert', () => {
    it('should not throw when condition is true', () => {
      expect(() => assert(true, 'TEST_CODE')).not.toThrow();
    });

    it('should throw when condition is false', () => {
      expect(() => assert(false, 'TEST_CODE')).toThrow();
    });
  });
});
