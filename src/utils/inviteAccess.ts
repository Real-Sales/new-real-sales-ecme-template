/**
 * Team-invite UI permissions. Must stay aligned with FastAPI RBAC on invite routes
 * (GET/POST/DELETE .../invites...), or users see 403 from the API even when the UI allows actions.
 */
export function canSendTeamInvite(role: string | undefined): boolean {
	if (!role) return false
	const r = role.toLowerCase()
	return r === 'company_owner' || r === 'sales_manager' || r === 'manager'
}

/** Scenario library management (create, assign, library tab). */
export function canManageScenarioLibrary(role: string | undefined): boolean {
	return canSendTeamInvite(role)
}

/** Only company owners may choose Sales Manager vs Sales Person on the invite form. */
export function canSelectInviteTargetRole(role: string | undefined): boolean {
	return role === 'company_owner'
}

export function canRevokeTeamInvite(role: string | undefined): boolean {
	return role === 'company_owner'
}
