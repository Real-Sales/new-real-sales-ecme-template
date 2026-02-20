import { Provider } from 'react-redux'
import store, { persistor } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Views from '@/views'
import appConfig from './configs/app.config'
import './locales'

if (appConfig.enableMock) {
    import('./mock')
}

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Theme>
                    <BrowserRouter>
                        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                            <AuthProvider>
                                <Layout>
                                    <Views />
                                </Layout>
                            </AuthProvider>
                        </GoogleOAuthProvider>
                    </BrowserRouter>
                </Theme>
            </PersistGate>
        </Provider>
    )
}

export default App
