/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { LitElement, css, html } from 'lit';
import { createBlob, decode, decodeAudioData } from './utils';
import './Visuals3D';

// Import our hooks and utilities
import { useAudioContext } from './hooks/useAudioContext';
import { useRecording } from './hooks/useRecording';
import { useSessionManager } from './hooks/useSessionManager';
import { useEventListeners } from './hooks/useEventListeners';
import { MediaHandler } from './hooks/mediaHandler';
import { apiGetGeminiEphemeralToken } from '@/services/GeminiService';



export class GdmLiveAudio extends LitElement {
	static styles = css`
		#status {
			position: absolute;
			bottom: 5vh;
			left: 0;
			right: 0;
			z-index: 10;
			text-align: center;
		}

		.controls {
			z-index: 10;
			position: absolute;
			bottom: 10vh;
			left: 0;
			right: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			gap: 10px;
		}

		.controls button {
			outline: none;
			border: 1px solid rgba(255, 255, 255, 0.2);
			color: white;
			border-radius: 12px;
			background: rgba(255, 255, 255, 0.1);
			width: 64px;
			height: 64px;
			cursor: pointer;
			font-size: 24px;
			padding: 0;
			margin: 0;
		}

		.controls button:hover {
			background: rgba(255, 255, 255, 0.2);
		}

		.controls button[disabled] {
			display: none;
		}
	`;

	static properties = {
		isRecording: { state: true },
		status: { state: true },
		error: { state: true },
		inputNode: { state: true },
		outputNode: { state: true },
		hideBuiltInVisuals: { type: Boolean, attribute: 'hide-built-in-visuals' },
	};

	declare isRecording: boolean;
	declare status: string;
	declare error: string;
	declare inputNode: GainNode;
	declare outputNode: GainNode;
	declare hideBuiltInVisuals: boolean;

	private client!: GoogleGenAI;
	private session?: Session;
	private inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
	private outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
	private nextStartTime = 0;
	private mediaStream?: MediaStream;
	private sourceNode?: MediaStreamAudioSourceNode;
	private scriptProcessorNode?: ScriptProcessorNode;
	private scriptProcessorMuteGain?: GainNode;
	private sources = new Set<AudioBufferSourceNode>();
	private isSessionOpen = false;
	private sessionOpenPromise?: Promise<boolean>;
	private resolveSessionOpen?: (value: boolean) => void;
	private currentTokenCount?: number;
	private geminiOutputAnalyser?: AnalyserNode;
	private listenerAbort?: AbortController;

	constructor() {
		super();
		this.isRecording = false;
		this.status = '';
		this.error = '';
		this.inputNode = this.inputAudioContext.createGain();
		this.outputNode = this.outputAudioContext.createGain();
		this.hideBuiltInVisuals = false;
		this.listenerAbort = new AbortController();
		this.initClient();
		this.setupImageListener();
		this.setupMicControlListener();
	}

	/**
	 * React Strict Mode (and route changes) can unmount the element while the first
	 * Live session is still open — two instances = two WebSockets + two contexts = overlapping voices.
	 */
	disconnectedCallback(): void {
		super.disconnectedCallback();
		this.listenerAbort?.abort();
		this.emitGeminiAnalyserEnded();
		this.tearDownLiveAudio();
	}

	private tearDownLiveAudio(): void {
		console.log('[LiveAudio] tearDownLiveAudio, session exists:', !!this.session, 'isOpen:', this.isSessionOpen);
		this.isRecording = false;

		if (this.scriptProcessorNode) {
			this.scriptProcessorNode.onaudioprocess = null;
		}
		try {
			this.scriptProcessorNode?.disconnect();
			this.scriptProcessorMuteGain?.disconnect();
			this.sourceNode?.disconnect();
		} catch {
			/* ignore */
		}
		this.scriptProcessorNode = undefined;
		this.scriptProcessorMuteGain = undefined;
		this.sourceNode = undefined;

		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach((t) => t.stop());
			this.mediaStream = undefined;
		}

		for (const s of [...this.sources.values()]) {
			try {
				s.stop();
			} catch {
				/* ignore */
			}
			this.sources.delete(s);
		}
		this.nextStartTime = 0;

		if (this.session) {
			try {
				this.session.close();
			} catch {
				/* ignore */
			}
			this.session = undefined;
		}
		this.isSessionOpen = false;
		this.resolveSessionOpen?.(false);

		try {
			this.outputNode.disconnect();
		} catch {
			/* ignore */
		}
		try {
			this.geminiOutputAnalyser?.disconnect();
		} catch {
			/* ignore */
		}
		this.geminiOutputAnalyser = undefined;

		void this.inputAudioContext.suspend();
		void this.outputAudioContext.suspend();
	}

	private setupImageListener() {
		const opts = { signal: this.listenerAbort!.signal };

		document.addEventListener('sendImage', (event: any) => {
			const { imageData, mimeType, text, tokenCount } = event.detail;
			this.sendImageWithText(imageData, mimeType, text || 'explain what is in this image', tokenCount);
		}, opts);

		document.addEventListener('sendImageWithAudio', (event: any) => {
			const { 
				imageData, 
				imageMimeType, 
				audioData, 
				audioMimeType, 
				audioSampleRate,
				usePreRecorded,
				textFallback,
				tokenCount
			} = event.detail;
			
			this.sendImageFirst(imageData, imageMimeType, textFallback, tokenCount).then(() => {
				if (usePreRecorded && audioData) {
					setTimeout(() => {
						this.sendPreRecordedAudioAsInput(audioData, audioMimeType, audioSampleRate, tokenCount);
					}, 1000);
				}
			});
		}, opts);

		document.addEventListener('sendTestText', (event: any) => {
			const { text, tokenCount } = event.detail;
			this.sendTextMessage(text || 'Hello, can you hear me?', tokenCount);
		}, opts);

		document.addEventListener('sendLiveText', (event: any) => {
			const { text, tokenCount } = event.detail || {};
			if (text && typeof text === 'string') {
				this.sendTextMessage(text, tokenCount);
			}
		}, opts);
	}

	private setupMicControlListener() {
		const opts = { signal: this.listenerAbort!.signal };
		document.addEventListener('liveAudioStartMic', async () => {
			if (!this.isRecording) {
				await this.startRecording();
			}
		}, opts);
		document.addEventListener('liveAudioStopMic', () => {
			if (this.isRecording) {
				this.stopRecording();
			}
		}, opts);
		document.addEventListener('liveAudioResumeContexts', () => {
			void this.resumeOutputAudio();
		}, opts);
	}

	/** Exposes Gemini playback tap for React visualizers (e.g. AudioVisualizer). */
	getGeminiOutputAnalyser(): { analyser: AnalyserNode; sampleRate: number } | null {
		if (!this.geminiOutputAnalyser) {
			return null;
		}
		return {
			analyser: this.geminiOutputAnalyser,
			sampleRate: this.outputAudioContext.sampleRate,
		};
	}

	async resumeOutputAudio(): Promise<void> {
		await this.outputAudioContext.resume();
		await this.inputAudioContext.resume();
	}

	private emitGeminiAnalyserEnded(): void {
		try {
			window.dispatchEvent(new CustomEvent('liveAudioGeminiAnalyserEnded'));
		} catch {
			/* ignore */
		}
	}

	private async sendImageFirst(imageData: string, imageMimeType: string, textPrompt: string, tokenCount?: number) {
		if (!this.session || !this.isSessionOpen) {
			this.updateError('Session is not ready. Please wait for connection.');
			return;
		}

		try {
			this.updateStatus('📷 Sending image first...');
			
			// Send image with text prompt first
			await this.sendImageWithText(imageData, imageMimeType, textPrompt, tokenCount);
			
		} catch (error: any) {
			console.error('Error sending image:', error);
			this.updateError(`Failed to send image: ${error?.message || 'Unknown error'}`);
		}
	}

	private async sendPreRecordedAudioAsInput(audioData: string, audioMimeType: string, sampleRate: number, tokenCount?: number) {
		if (!this.session || !this.isSessionOpen) {
			this.updateError('Session is not ready for audio input.');
			return;
		}



		try {
			this.updateStatus('🎵 Preparing pre-recorded audio as voice input...');
			
			// Convert base64 audio to binary
			const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
			
			// Send audio in chunks like live microphone input
			await this.sendAudioInChunks(binaryAudio);
			
		} catch (error: any) {
			console.error('Error sending pre-recorded audio:', error);
			this.updateError(`Failed to send pre-recorded audio: ${error?.message || 'Unknown error'}`);
		}
	}

	private async sendAudioInChunks(audioData: Uint8Array) {
		// Send audio in chunks similar to how live microphone input works
		const chunkSize = 2048; // Chunk size for 16-bit audio (1024 samples * 2 bytes)
		// Minimal log about outbound audio
		console.log('[LiveAudio][sendAudio] sending pre-recorded audio chunks bytes=', audioData.length);
		this.updateStatus('🎵 Sending audio in chunks...');
		
		for (let i = 0; i < audioData.length; i += chunkSize) {
			const chunk = audioData.slice(i, i + chunkSize);
			
			try {
				// Convert chunk to Float32Array (similar to live audio processing)
				const float32Array = new Float32Array(chunk.length / 2);
				const dataView = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
				
				for (let j = 0; j < float32Array.length; j++) {
					// Convert 16-bit PCM to float32 (-1 to 1 range)
					const sample = dataView.getInt16(j * 2, true); // little-endian
					float32Array[j] = sample / 32768.0;
				}
				
				// Use the existing createBlob function from utils
				const blob = createBlob(float32Array);
				this.session?.sendRealtimeInput({ audio: blob });
				
				// Small delay between chunks to simulate real-time input
				await new Promise(resolve => setTimeout(resolve, 64)); // ~16kHz timing
				
			} catch (chunkError) {
				console.error('Error sending audio chunk:', chunkError);
				break;
			}
		}
		
		this.updateStatus('🎵 Finished sending pre-recorded audio. Waiting for response...');
	}

	// Remove the custom createBlobFromPCM function since we're using utils.createBlob

	private async sendTextMessage(text: string, _tokenCount?: number) {
		if (!this.session || !this.isSessionOpen) {
			this.updateError('Session is not ready. Please wait for connection.');
			return;
		}

		const wasRecording = this.isRecording;

		try {
			if (wasRecording) {
				try { this.session.sendRealtimeInput({ audioStreamEnd: true }); } catch { /* ignore */ }
			}

			this.updateStatus('💬 Sending text...');
			this.session.sendRealtimeInput({ text });
			this.updateStatus('💬 Text sent. Waiting for response...');
		} catch (error: any) {
			console.error('Error sending text:', error);
			this.updateError(`Failed to send text: ${error?.message || 'Unknown error'}`);
		}
	}

	private async sendImageWithText(imageData: string, mimeType: string = 'image/jpeg', text: string = 'explain', tokenCount?: number) {
		if (!this.session || !this.isSessionOpen) {
			this.updateError('Session is not ready. Please wait for connection.');
			return;
		}



		try {
			// Minimal outbound log about image + text
			console.log('[LiveAudio][sendImage] mime=', mimeType, 'imageSize(bytes)=', imageData?.length || 0, 'text=', text);
			this.updateStatus('📷 Sending image for analysis...');
			
			// Method 1: Try using sendClientContent (similar to Python implementation)
			try {
				await (this.session as any)?.sendClientContent?.({
					turns: [
						{
							role: 'user',
							parts: [
								{
									inlineData: {
										data: imageData,
										mimeType: mimeType
									}
								},
								{
									text: text
								}
							],
						}
					],
					turnComplete: true
				});
				this.updateStatus('📷 Image sent via sendClientContent. Waiting for response...');
				return;
			} catch (error1) {
				/* verbose log removed */
			}

			// Method 2: Try using send with clientContent
			try {
				await (this.session as any)?.send?.({
					clientContent: [
						{
							role: 'user',
							parts: [
								{
									inlineData: {
										data: imageData,
										mimeType: mimeType
									}
								},
								{
									text: text
								}
							],
						},
					],
					turnComplete: true
				});
				this.updateStatus('📷 Image sent via send method. Waiting for response...');
				return;
			} catch (error2) {
				/* verbose log removed */
			}

			// Method 3: Try direct message sending
			try {
				const message = {
					clientContent: {
						role: 'user',
						parts: [
							{
								inlineData: {
									data: imageData,
									mimeType: mimeType
								}
							},
							{
								text: text
							}
						],
					},
					turnComplete: true
				};
				
				await (this.session as any)?.send?.(message);
				this.updateStatus('📷 Image sent via direct method. Waiting for response...');
			} catch (error3) {
				throw new Error(`All methods failed. Last error: ${error3}`);
			}

		} catch (error: any) {
			console.error('Error sending image:', error);
			this.updateError(`Failed to send image: ${error?.message || 'Unknown error'}`);
		}
	}

	private initAudio() {
		this.nextStartTime = this.outputAudioContext.currentTime;
	}

	private async fetchEphemeralToken(): Promise<{ token: string } | null> {
		try {
			return await apiGetGeminiEphemeralToken();
		} catch (err) {
			this.updateError('Failed to get Gemini session token. Please sign in and retry.');
			console.error('Ephemeral token fetch failed:', err);
			return null;
		}
	}

	private async initClient() {
		this.initAudio();

		this.outputNode.connect(this.outputAudioContext.destination);

		this.geminiOutputAnalyser = this.outputAudioContext.createAnalyser();
		this.geminiOutputAnalyser.fftSize = 2048;
		this.geminiOutputAnalyser.smoothingTimeConstant = 0.95;
		this.outputNode.connect(this.geminiOutputAnalyser);

		// Session is created lazily by waitForSessionOpen() when the user clicks Start.
		// Connecting here would waste the `uses:1` ephemeral token during React Strict
		// Mode's mount-unmount-remount cycle.
	}

	private async initSession() {
		const model = 'gemini-3.1-flash-live-preview';

		this.isSessionOpen = false;
		this.sessionOpenPromise = new Promise<boolean>((resolve) => {
			this.resolveSessionOpen = resolve;
		});

		const tokenData = await this.fetchEphemeralToken();
		if (!tokenData) {
			this.resolveSessionOpen?.(false);
			return;
		}
		const apiToken = tokenData.token;
		console.log('[LiveAudio] Fresh token fetched');

		this.client = new GoogleGenAI({ apiKey: apiToken, httpOptions: { apiVersion: 'v1alpha' } });

		try {
			this.session = await this.client.live.connect({
				model,
				callbacks: {
					onopen: () => {
						console.log('[LiveAudio] WebSocket OPENED');
						this.updateStatus('Opened');
						this.isSessionOpen = true;
						this.resolveSessionOpen?.(true);
						try {
							window.dispatchEvent(new CustomEvent('liveAudioSessionOpened'));
						} catch {
							/* ignore */
						}
					},
					onmessage: async (message: LiveServerMessage) => {
						const parts = message.serverContent?.modelTurn?.parts ?? [];
						// Use the first raw inline audio part only. The SDK `message.data` getter
						// merges all inline parts via string atob/btoa and can mis-handle PCM; playing
						// merged + per-part paths would duplicate audio.
						let audioB64: string | undefined;
						for (const p of parts) {
							const id = (p as { inlineData?: { data?: string } }).inlineData;
							if (id?.data) {
								audioB64 = id.data;
								break;
							}
						}

						// Only update status for visible UI, no console spam for inbound text
						const textParts = parts.filter((part) => part.text);
						if (textParts && textParts.length > 0) {
							for (const textPart of textParts) {
								this.updateStatus(`💬 AI: ${textPart.text}`);
							}
						}

						if (audioB64) {
							this.updateStatus('↘️ Audio chunk received');
							try { window.dispatchEvent(new CustomEvent('liveAudioPlayback', { detail: { state: 'playing' } })); } catch {}
							this.nextStartTime = Math.max(
								this.nextStartTime,
								this.outputAudioContext.currentTime
							);

							const audioBuffer = await decodeAudioData(
								decode(audioB64),
								this.outputAudioContext,
								24000,
								1
							);
							const source = this.outputAudioContext.createBufferSource();
							source.buffer = audioBuffer;
							source.connect(this.outputNode);
							this.updateStatus('🔊 Playing response...');
							source.addEventListener('ended', () => {
								this.sources.delete(source);
								// If no more sources, emit idle state
								if (this.sources.size === 0) {
									try { window.dispatchEvent(new CustomEvent('liveAudioPlayback', { detail: { state: 'idle' } })); } catch {}
								}
							});

							source.start(this.nextStartTime);
							this.nextStartTime = this.nextStartTime + audioBuffer.duration;
							this.sources.add(source);
						}

						const interrupted = (message.serverContent as any)?.interrupted as boolean | undefined;
						if (interrupted) {
							
							try { window.dispatchEvent(new CustomEvent('liveAudioPlayback', { detail: { state: 'clearing' } })); } catch {}
							for (const source of this.sources.values()) {
								source.stop();
								this.sources.delete(source);
							}
							this.nextStartTime = 0;
							try { window.dispatchEvent(new CustomEvent('liveAudioPlayback', { detail: { state: 'idle' } })); } catch {}
						}
						
					    if (message.usageMetadata) {
						console.log('Usage metadata:', message.usageMetadata.totalTokenCount);
						this.currentTokenCount = message.usageMetadata.totalTokenCount;
						if (this.currentTokenCount) {
							this.checkUsageStatus(this.currentTokenCount);
						}
					}

						if ((message as any).goAway) {
							this.updateStatus('Connection expiring, reconnecting...');
							try { this.session?.close(); } catch { /* ignore */ }
							this.initSession();
						}
				},
					onerror: (e: ErrorEvent) => {
						console.error('[LiveAudio] WebSocket ERROR:', e.message);
						this.updateError(e.message);
						this.isSessionOpen = false;
						if (this.isRecording) {
							this.stopRecording();
						}
					},
					onclose: (e: CloseEvent) => {
						console.log('[LiveAudio] WebSocket CLOSED, code:', e.code, 'reason:', e.reason);
						this.isSessionOpen = false;
						this.resolveSessionOpen?.(false);
						this.emitGeminiAnalyserEnded();

						if (this.isRecording) {
							this.stopRecording();
						}

						this.updateStatus('Close: ' + e.reason);
					},
				},
			config: {
				responseModalities: [Modality.AUDIO],
				speechConfig: {
					voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } },
				},
				systemInstruction: {
					role: 'user',
					parts: [{ text: 'You are a helpful assistant that can analyze images and answer questions about them. When an image is provided, describe what you see in detail.' }]
				},
				contextWindowCompression: { slidingWindow: {} },
			},
			});
			// No automatic kickoff prompt — that forces an unsolicited model reply on every connect.
		} catch (e) {
			console.error('[LiveAudio] Connection failed:', e);
			this.isSessionOpen = false;
			this.resolveSessionOpen?.(false);
		}
	}

	private async waitForSessionOpen(timeoutMs = 5000): Promise<boolean> {
		if (this.isSessionOpen) return true;
		if (!this.sessionOpenPromise) {
			this.initSession();
		}
		const promise = this.sessionOpenPromise!;
		return await new Promise<boolean>((resolve) => {
			const t = setTimeout(() => resolve(false), timeoutMs);
			promise.then((ok) => {
				clearTimeout(t);
				resolve(!!ok);
			});
		});
	}



	/**
	 * Close the current session and clean up resources
	 */
	private closeSession() {
		try {
			if (this.session) {
				this.session.close();
			}
		} catch (error) {
			console.error('Error closing session:', error);
		}
		
		this.isSessionOpen = false;
		this.resolveSessionOpen?.(false);
		
		if (this.isRecording) {
			this.stopRecording();
		}
		
		this.session = undefined;
		
		try { 
			window.dispatchEvent(new CustomEvent('liveAudioSessionClosed', { 
				detail: { reason: 'token_inactive' } 
			})); 
		} catch {}
	}





	private updateStatus(msg: string) {
		this.status = msg;
		this.requestUpdate();
		// Also emit a global event for external React components to subscribe to
		try { window.dispatchEvent(new CustomEvent('liveAudioStatus', { detail: { status: msg } })); } catch {}
	}

	private updateError(msg: string) {
		this.error = msg;
		this.requestUpdate();
	}

	/**
	 * Hook for usage / billing when `usageMetadata` arrives from the live session.
	 * `fetchUsageStatus` is not part of this app's userSlice; wire a createAsyncThunk + API here if needed.
	 */
	private checkUsageStatus(_tokenCount: number): void {
		/* no-op until backend + Redux thunk exist */
	}

	private async startRecording() {
		if (this.isRecording) {
			return;
		}

		const ready = await this.waitForSessionOpen(15000);
		if (!ready) {
			this.updateError('Live session is not ready. Try Reset and Start again.');
			return;
		}

		await this.inputAudioContext.resume();
		await this.outputAudioContext.resume();

		this.updateStatus('Requesting microphone access...');

		try {
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1,
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
				},
				video: false,
			});

			this.updateStatus('Microphone access granted. Starting capture...');

			this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.mediaStream);

			const bufferSize = 1024;
			this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(bufferSize, 1, 1);

			this.scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
				const ob = audioProcessingEvent.outputBuffer;
				for (let ch = 0; ch < ob.numberOfChannels; ch++) {
					ob.getChannelData(ch).fill(0);
				}

				if (!this.isRecording || !this.isSessionOpen) return;

				const inputBuffer = audioProcessingEvent.inputBuffer;
				const pcmData = inputBuffer.getChannelData(0);

				try {
					const blob = createBlob(pcmData);
					this.session?.sendRealtimeInput({ audio: blob });
				} catch (err: any) {
					const msg = String(err?.message ?? err ?? '');
					if (msg.includes('CLOSING') || msg.includes('CLOSED')) {
						this.isSessionOpen = false;
						this.updateError('Live session closed while sending audio. Reinitializing...');
						this.stopRecording();
						this.initSession();
					}
				}
			};

			this.sourceNode.connect(this.scriptProcessorNode);
			// Mic must not reach speakers (Gemini uses outputAudioContext). Gain 0 + silent output.
			this.scriptProcessorMuteGain = this.inputAudioContext.createGain();
			this.scriptProcessorMuteGain.gain.value = 0;
			this.scriptProcessorNode.connect(this.scriptProcessorMuteGain);
			this.scriptProcessorMuteGain.connect(this.inputAudioContext.destination);

			this.isRecording = true;
			this.updateStatus('🔴 Recording... Capturing PCM chunks.');
		} catch (err: any) {
			console.error('Error starting recording:', err);
			this.updateStatus(`Error: ${err?.message ?? String(err)}`);
			this.stopRecording();
		}
	}

	private stopRecording() {
		if (!this.isRecording && !this.mediaStream && !this.inputAudioContext) return;

		this.updateStatus('Stopping recording...');

		this.isRecording = false;

		if (this.scriptProcessorNode && this.inputAudioContext) {
			this.scriptProcessorNode.onaudioprocess = null;
			try {
				this.scriptProcessorNode.disconnect();
			} catch {
				/* ignore */
			}
		}
		try {
			this.scriptProcessorMuteGain?.disconnect();
		} catch {
			/* ignore */
		}
		this.scriptProcessorMuteGain = undefined;
		try {
			this.sourceNode?.disconnect();
		} catch {
			/* ignore */
		}

		this.scriptProcessorNode = undefined;
		this.sourceNode = undefined;

		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach((track) => track.stop());
			this.mediaStream = undefined;
		}

		// Signal end of mic stream (default VAD expects this when the mic stops)
		if (this.isSessionOpen && this.session) {
			try {
				this.session.sendRealtimeInput({ audioStreamEnd: true });
			} catch {
				/* ignore */
			}
		}

		// Stop sending audio frames if session is not open
		if (!this.isSessionOpen) {
			try {
				this.session?.close();
			} catch {}
		}
		// With default VAD, only `audioStreamEnd` is needed; `turnComplete` here duplicated the
		// end-of-speech signal and tended to trigger extra / “automatic” model turns.

		this.updateStatus('Recording stopped. Click Start to begin again.');
	}

	private reset = () => {
		try {
			this.session?.close();
		} catch {}

		this.initSession();
		this.updateStatus('Session cleared.');
	};

	protected render() {
		return html`
			<div>
				<div class="controls">
					<button id="resetButton" @click=${this.reset} ?disabled=${this.isRecording}>
						<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#ffffff">
							<path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
						</svg>
					</button>
					<button id="startButton" @click=${this.startRecording} ?disabled=${this.isRecording}>
						<svg viewBox="0 0 100 100" width="32px" height="32px" fill="#c80000" xmlns="http://www.w3.org/2000/svg">
							<circle cx="50" cy="50" r="50" />
						</svg>
					</button>
					<button id="stopButton" @click=${this.stopRecording} ?disabled=${!this.isRecording}>
						<svg viewBox="0 0 100 100" width="32px" height="32px" fill="#000000" xmlns="http://www.w3.org/2000/svg">
							<rect x="0" y="0" width="100" height="100" rx="15" />
						</svg>
					</button>
				</div>

				<div id="status">${this.error || this.status}</div>
				${this.hideBuiltInVisuals
					? html``
					: html`<gdm-live-audio-visuals-3d .inputNode=${this.inputNode} .outputNode=${this.outputNode}></gdm-live-audio-visuals-3d>`}
			</div>
		`;
	}
}

if (!customElements.get('gdm-live-audio')) {
	customElements.define('gdm-live-audio', GdmLiveAudio);
}


