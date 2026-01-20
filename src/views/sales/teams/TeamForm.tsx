import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

type TeamFormSchema = {
    teamName: string
    company: string
    description: string
}

const validationSchema = z.object({
    teamName: z.string().min(1, { message: 'Team name is required' }).max(100, 'Too Long!'),
    company: z.string().min(1, { message: 'Company is required' }),
    description: z.string().optional(),
})

type TeamFormProps = {
    onSubmit: (values: TeamFormSchema) => void
    onCancel: () => void
}

const TeamForm = ({ onSubmit, onCancel }: TeamFormProps) => {
    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<TeamFormSchema>({
        defaultValues: {
            teamName: '',
            company: '',
            description: '',
        },
        resolver: zodResolver(validationSchema),
    })

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <FormItem
                    label="Team Name"
                    asterisk
                    invalid={Boolean(errors.teamName)}
                    errorMessage={errors.teamName?.message}
                >
                    <Controller
                        name="teamName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Enter team name"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Company"
                    asterisk
                    invalid={Boolean(errors.company)}
                    errorMessage={errors.company?.message}
                >
                    <Controller
                        name="company"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Select or enter company"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Description"
                    invalid={Boolean(errors.description)}
                    errorMessage={errors.description?.message}
                >
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Brief description (optional)"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>
        </Form>
    )
}

export default TeamForm
export type { TeamFormSchema }
