import { LitElement, css, html } from 'lit';

export class GdmLiveAudioVisuals3D extends LitElement {
	static styles = css`
		:host {
			display: block;
			position: fixed;
			inset: 0;
			background: radial-gradient(100% 100% at 50% 0%, rgba(0,0,0,0.2), rgba(0,0,0,0.8));
		}
		canvas { width: 100%; height: 100%; display: block; }
	`;

	static properties = {
		inputNode: { attribute: false },
		outputNode: { attribute: false },
	};

	declare inputNode?: GainNode;
	declare outputNode?: GainNode;
	private analyser?: AnalyserNode;
	private rafId?: number;

	private setupAnalyser() {
		if (!this.outputNode) return;
		const ctx = (this.outputNode.context as AudioContext);
		this.analyser = ctx.createAnalyser();
		this.analyser.fftSize = 512;
		this.outputNode.connect(this.analyser);
		this.loop();
	}

	private loop = () => {
		const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement | null;
		if (!canvas || !this.analyser) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const width = canvas.clientWidth * dpr;
		const height = canvas.clientHeight * dpr;
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
		const ctx2d = canvas.getContext('2d');
		if (!ctx2d) return;

		const data = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(data);

		ctx2d.clearRect(0, 0, width, height);
		const barWidth = (width / data.length) * 1.8;
		for (let i = 0; i < data.length; i++) {
			const v = data[i] / 255;
			const h = v * height;
			ctx2d.fillStyle = `hsl(${Math.floor(200 + v * 80)}, 90%, ${40 + v * 20}%)`;
			ctx2d.fillRect(i * barWidth, height - h, barWidth * 0.9, h);
		}
		this.rafId = requestAnimationFrame(this.loop);
	};

	protected firstUpdated(): void {
		this.setupAnalyser();
	}

	protected updated(changed: Map<string, unknown>): void {
		if (changed.has('outputNode') && this.outputNode && !this.analyser) {
			this.setupAnalyser();
		}
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		if (this.rafId) cancelAnimationFrame(this.rafId);
	}

	protected render() {
		return html`<canvas></canvas>`;
	}
}

if (!customElements.get('gdm-live-audio-visuals-3d')) {
	customElements.define('gdm-live-audio-visuals-3d', GdmLiveAudioVisuals3D);
}


