import { useState, useEffect, useMemo } from 'react'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    useAppSelector,
    useAppDispatch,
    fetchSalesDivisions,
} from '@/store/slices/salesDivisions'

type TeamFormSchema = {
    teamName: string
    sales_division_id: string
    description: string
}

const validationSchema = z.object({
    teamName: z.string().min(1, { message: 'Team name is required' }).max(100, 'Too Long!'),
    sales_division_id: z.string().min(1, { message: 'Division is required' }),
    description: z.string().optional(),
})

type DivisionOption = {
    label: string
    value: string
}

type TeamFormProps = {
    companyId: string
    formRef?: React.RefObject<HTMLFormElement | null>
    onSubmit: (values: TeamFormSchema) => void
    onCancel: () => void
}

const TeamForm = ({ companyId, formRef, onSubmit, onCancel }: TeamFormProps) => {
    const dispatch = useAppDispatch()

    const {
        divisionsData,
        divisionsLoading,
        initialized,
    } = useAppSelector(
        (state) =>
            state.salesDivisions?.data ?? {
                divisionsData: [],
                divisionsLoading: false,
                initialized: false,
                divisionInfo: {},
                infoLoading: false,
                error: null,
                notification: null,
            }
    )

    useEffect(() => {
        if (companyId && !initialized && !divisionsLoading) {
            dispatch(fetchSalesDivisions(companyId))
        }
    }, [dispatch, companyId, initialized, divisionsLoading])

    const divisions = useMemo(() => {
        return divisionsData.map((div) => ({
            label: div.name,
            value: div.sales_division_id,
        }))
    }, [divisionsData])

    const isLoading = divisionsLoading

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<TeamFormSchema>({
        defaultValues: {
            teamName: '',
            sales_division_id: '',
            description: '',
        },
        resolver: zodResolver(validationSchema),
    })

    return (
        <Form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
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
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Division"
                    asterisk
                    invalid={Boolean(errors.sales_division_id)}
                    errorMessage={errors.sales_division_id?.message}
                >
                    <Controller
                        name="sales_division_id"
                        control={control}
                        render={({ field }) => (
                            <Select
                                loading={isLoading}
                                placeholder="Select division"
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                options={divisions}
                                value={divisions.find(
                                    (opt) => opt.value === field.value
                                )}
                                onChange={(option) =>
                                    field.onChange(option?.value)
                                }
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
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
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
