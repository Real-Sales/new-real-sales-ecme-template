/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Session } from '@google/genai';

/**
 * Manages session state for Gemini audio sessions
 */
export class SessionManager {
  private isSessionOpen = false;
  private sessionOpenPromise?: Promise<boolean>;
  private resolveSessionOpen?: (value: boolean) => void;
  
  /**
   * Creates a new session manager
   */
  constructor() {
    this.createSessionOpenPromise();
  }
  
  /**
   * Sets up a promise that resolves when the session opens
   */
  createSessionOpenPromise(): void {
    if (!this.sessionOpenPromise) {
      this.sessionOpenPromise = new Promise<boolean>((resolve) => {
        this.resolveSessionOpen = resolve;
      });
    }
  }
  
  /**
   * Waits for the session to open with timeout
   * @param timeoutMs - Timeout in milliseconds
   * @returns Whether the session opened successfully
   */
  async waitForSessionOpen(timeoutMs = 5000): Promise<boolean> {
    if (this.isSessionOpen) {
      return true;
    }
    
    if (!this.sessionOpenPromise) {
      this.createSessionOpenPromise();
    }
    
    const promise = this.sessionOpenPromise!;
    
    return await Promise.race([
      promise,
      new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), timeoutMs);
      }),
    ]);
  }
  
  /**
   * Marks the session as open and resolves the waiting promise
   */
  markSessionOpen(): void {
    this.isSessionOpen = true;
    if (this.resolveSessionOpen) {
      this.resolveSessionOpen(true);
    }
  }
  
  /**
   * Marks the session as closed and resets the promises
   */
  markSessionClosed(): void {
    this.isSessionOpen = false;
    this.sessionOpenPromise = undefined;
    this.resolveSessionOpen = undefined;
    this.createSessionOpenPromise();
  }
  
  /**
   * Returns whether the session is currently open
   */
  getIsSessionOpen(): boolean {
    return this.isSessionOpen;
  }
}
