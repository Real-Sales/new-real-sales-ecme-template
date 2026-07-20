import type { RefObject } from 'react'
import { Button, Drawer, Spinner } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import TeamForm, { type TeamFormSchema } from '../TeamForm'
import { TeamCard } from './TeamCard'
import type { useDivisionTeams } from './useDivisionTeams'

type DivisionTeamsPanelProps = {
    companyId: string
    divisionId: string
    divisionName?: string
} & Pick<
    ReturnType<typeof useDivisionTeams>,
    | 'teams'
    | 'teamsLoading'
    | 'initialized'
    | 'isDrawerOpen'
    | 'onDrawerClose'
    | 'handleSubmitClick'
    | 'onTeamSubmit'
    | 'submitting'
    | 'deleteDialogOpen'
    | 'teamToDelete'
    | 'deletingTeamId'
    | 'openDeleteDialog'
    | 'closeDeleteDialog'
    | 'handleDeleteTeam'
> & {
    formRef: RefObject<HTMLFormElement | null>
}

/** Team card grid for a division's "Teams" tab — same card UI as the (removed) standalone Teams page, scoped to this division. Stats + the "Create Team" action live in the parent header, above the tabs. */
const DivisionTeamsPanel = ({
    companyId,
    divisionId,
    divisionName,
    teams,
    teamsLoading,
    initialized,
    isDrawerOpen,
    onDrawerClose,
    formRef,
    handleSubmitClick,
    onTeamSubmit,
    submitting,
    deleteDialogOpen,
    teamToDelete,
    deletingTeamId,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteTeam,
}: DivisionTeamsPanelProps) => {
    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button
                size="sm"
                variant="default"
                className="flex-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-gray-200 dark:hover:!bg-gray-700 dark:hover:!border-gray-500"
                disabled={submitting}
                onClick={onDrawerClose}
            >
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none"
                loading={submitting}
                disabled={submitting}
                onClick={handleSubmitClick}
            >
                Create
            </Button>
        </div>
    )

    const DrawerTitle = (
        <div>
            <h4 className="mb-2 text-lg font-bold">Create New Team</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to create a new team
            </p>
        </div>
    )

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {teamsLoading && !initialized ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Spinner size={40} />
                    </div>
                ) : teams.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No teams yet in this division.
                        </p>
                    </div>
                ) : (
                    teams.map((team) => (
                        <TeamCard
                            key={team.id}
                            {...team}
                            deleting={deletingTeamId === team.id}
                            onDelete={() =>
                                openDeleteDialog({ id: team.id, name: team.name })
                            }
                        />
                    ))
                )}
            </div>

            <Drawer
                title={DrawerTitle}
                isOpen={isDrawerOpen}
                footer={DrawerFooter}
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
                footerClass="!bg-gray-100 dark:!bg-gray-900 !p-3"
                bodyClass="!p-4 !bg-gray-100 dark:!bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                <div className="px-2">
                    <TeamForm
                        companyId={companyId}
                        lockedDivisionId={divisionId}
                        lockedDivisionName={divisionName}
                        formRef={formRef}
                        onSubmit={(values: TeamFormSchema) => onTeamSubmit(values)}
                        onCancel={onDrawerClose}
                    />
                </div>
            </Drawer>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="Delete team"
                confirmText="Delete"
                cancelText="Cancel"
                onClose={closeDeleteDialog}
                onRequestClose={closeDeleteDialog}
                onCancel={closeDeleteDialog}
                onConfirm={handleDeleteTeam}
                confirmButtonProps={{ loading: !!deletingTeamId }}
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {teamToDelete?.name}
                    </span>
                    ? Members will be removed from this team but stay in the
                    company.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default DivisionTeamsPanel
