const endpointConfig = {
    signIn: 'auth/sign-in',
    signOut: 'sign-out',
    signUp: 'auth/sign-up',
    googleSignIn: 'auth/google',
    forgotPasswordRequest: 'auth/password-reset/request',
    forgotPasswordConfirm: 'auth/password-reset/confirm',
    resetPassword: 'reset-password',
    scenariosLibrary: 'scenarios/library',
    scenariosCreate: 'scenarios/',
    scenariosUpdate: (scenarioId: string) => `scenarios/${scenarioId}`,
    scenariosDelete: (scenarioId: string) => `scenarios/${scenarioId}`,
    documentsUpload: 'documents/upload',
    aiPersonas: 'ai-personas/',
    interactionModes: 'interaction-modes/',
}

export default endpointConfig
