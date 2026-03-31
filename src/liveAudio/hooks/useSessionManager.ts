/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Session } from '@google/genai';

/**
 * Hook to manage Gemini session state
 * @returns Session state and control functions
 */
export function useSessionManager() {
  let isSessionOpen = false;
  let sessionOpenPromise: Promise<boolean> | undefined;
  let resolveSessionOpen: ((value: boolean) => void) | undefined;
  
  /**
   * Sets up a promise that resolves when the session opens
   */
  const createSessionOpenPromise = (): void => {
    if (!sessionOpenPromise) {
      sessionOpenPromise = new Promise<boolean>((resolve) => {
        resolveSessionOpen = resolve;
      });
    }
  };
  
  /**
   * Waits for the session to open with timeout
   * @param timeoutMs - Timeout in milliseconds
   * @returns Whether the session opened successfully
   */
  const waitForSessionOpen = async (timeoutMs = 5000): Promise<boolean> => {
    if (isSessionOpen) {
      return true;
    }
    
    if (!sessionOpenPromise) {
      createSessionOpenPromise();
    }
    
    const promise = sessionOpenPromise!;
    
    return await Promise.race([
      promise,
      new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), timeoutMs);
      }),
    ]);
  };
  
  /**
   * Marks the session as open and resolves the waiting promise
   */
  const markSessionOpen = (): void => {
    isSessionOpen = true;
    if (resolveSessionOpen) {
      resolveSessionOpen(true);
    }
  };
  
  /**
   * Marks the session as closed and resets the promises
   */
  const markSessionClosed = (): void => {
    isSessionOpen = false;
    sessionOpenPromise = undefined;
    resolveSessionOpen = undefined;
  };
  
  /**
   * Resets the session state
   */
  const resetSession = (): void => {
    markSessionClosed();
    createSessionOpenPromise();
  };
  
  return {
    isSessionOpen,
    waitForSessionOpen,
    markSessionOpen,
    markSessionClosed,
    resetSession,
    createSessionOpenPromise
  };
}
