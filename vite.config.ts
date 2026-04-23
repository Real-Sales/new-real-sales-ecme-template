import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const razorpayKeyId =
        env.RAZORPAY_KEY_ID?.trim() || env.VITE_RAZORPAY_KEY_ID?.trim() || ''

    return {
        define: {
            'import.meta.env.RAZORPAY_KEY_ID': JSON.stringify(razorpayKeyId),
        },
        plugins: [react(), dynamicImport()],
        assetsInclude: ['**/*.md'],
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
            },
        },
        server: {
            proxy: {
                '/api': {
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        build: {
            outDir: 'build',
        },
    }
})
