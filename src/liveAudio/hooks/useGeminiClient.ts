/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Session } from '@google/genai';

/**
 * Hook to initialize and manage the Gemini AI client
 * @param apiKey - The Gemini API key
 * @returns Initialized client and session creation function
 */
export function useGeminiClient(apiKey?: string) {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const client = new GoogleGenAI({ apiKey });

  const createSession = async (model: string): Promise<Session | undefined> => {
    try {
      // For audio dialog models, we can create a session directly
      const session = await client.createSession(model);
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      return undefined;
    }
  };

  return { client, createSession };
}
