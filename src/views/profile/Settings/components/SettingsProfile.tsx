import { useMemo, useEffect } from 'react'
import type { ComponentType } from 'react'
import Button from '@/components/ui/Button'
import Upload from '@/components/ui/Upload'
import Input from '@/components/ui/Input'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import { Form, FormItem } from '@/components/ui/Form'
import NumericInput from '@/components/shared/NumericInput'
import { countryList } from '@/constants/countries.constant'
import { components } from 'react-select'
import type { ControlProps, OptionProps } from 'react-select'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setProfile } from '../store/settingsSlice'
import sleep from '@/utils/sleep'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { TbPlus } from 'react-icons/tb'
import type { ZodType } from 'zod'

type ProductOption = { value: string; label: string }

const industryOptions: ProductOption[] = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'finance', label: 'Finance' },
]

const productsByIndustry: Record<string, ProductOption[]> = {
    technology: [
        { value: 'crm', label: 'CRM Software' },
        { value: 'erp', label: 'ERP System' },
        { value: 'analytics', label: 'Analytics Platform' },
        { value: 'cloud', label: 'Cloud Services' },
    ],
    healthcare: [
        { value: 'emr', label: 'Electronic Medical Records' },
        { value: 'telehealth', label: 'Telehealth' },
        { value: 'pharma', label: 'Pharmaceutical' },
        { value: 'medical-devices', label: 'Medical Devices' },
    ],
    retail: [
        { value: 'pos', label: 'POS System' },
        { value: 'inventory', label: 'Inventory Management' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'loyalty', label: 'Loyalty Program' },
    ],
    manufacturing: [
        { value: 'scm', label: 'Supply Chain' },
        { value: 'production', label: 'Production Planning' },
        { value: 'quality', label: 'Quality Control' },
        { value: 'iot', label: 'IoT / Industrial' },
    ],
    finance: [
        { value: 'banking', label: 'Banking' },
        { value: 'insurance', label: 'Insurance' },
        { value: 'investment', label: 'Investment' },
        { value: 'payments', label: 'Payments' },
    ],
}

type ProfileSchema = {
    firstName: string
    lastName: string
    email: string
    industry?: string
    products?: ProductOption[]
    dialCode: string
    phoneNumber: string
    img: string
    country: string
    address: string
    postcode: string
    city: string
}

type CountryOption = {
    label: string
    dialCode: string
    value: string
}

const SelectControl = components.Control as ComponentType<ControlProps<CountryOption>>

const validationSchema: ZodType<ProfileSchema> = z.object({
    firstName: z.string().min(1, { message: 'First name required' }),
    lastName: z.string().min(1, { message: 'Last name required' }),
    email: z
        .string()
        .min(1, { message: 'Email required' })
        .email({ message: 'Invalid email' }),
    industry: z.string().optional(),
    products: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    dialCode: z.string().min(1, { message: 'Please select your country code' }),
    phoneNumber: z
        .string()
        .min(1, { message: 'Please input your mobile number' }),
    country: z.string().min(1, { message: 'Please select a country' }),
    address: z.string().min(1, { message: 'Addrress required' }),
    postcode: z.string().min(1, { message: 'Postcode required' }),
    city: z.string().min(1, { message: 'City required' }),
    img: z.string(),
})

const CustomSelectOption = (
    props: OptionProps<CountryOption> & { variant: 'country' | 'phone' },
) => {
    return (
        <DefaultOption<CountryOption>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Avatar
                        shape="circle"
                        size={20}
                        src={`/img/countries/${data.value}.png`}
                    />
                    {props.variant === 'country' && <span>{label}</span>}
                    {props.variant === 'phone' && <span>{data.dialCode}</span>}
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<CountryOption>) => {
    const selected = props.getValue()[0]
    return (
        <SelectControl {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={20}
                    src={`/img/countries/${selected.value}.png`}
                />
            )}
            {children}
        </SelectControl>
    )
}

const SettingsProfile = () => {
    const dispatch = useAppDispatch()
    const data = useAppSelector((state) => state.settings.profile)

    const dialCodeList = useMemo(() => {
        const newCountryList: Array<CountryOption> = JSON.parse(
            JSON.stringify(countryList),
        )

        return newCountryList.map((country) => {
            country.label = country.dialCode
            return country
        })
    }, [])

    const beforeUpload = (files: FileList | null) => {
        let valid: string | boolean = true

        const allowedFileType = ['image/jpeg', 'image/png']
        if (files) {
            for (const file of files) {
                if (!allowedFileType.includes(file.type)) {
                    valid = 'Please upload a .jpeg or .png file!'
                }
            }
        }

        return valid
    }

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
        watch,
        setValue,
    } = useForm<ProfileSchema>({
        defaultValues: {
            industry: '',
            products: [],
        },
        resolver: zodResolver(validationSchema),
    })

    const selectedIndustry = watch('industry')
    const watchedFirstName = watch('firstName')
    const watchedLastName = watch('lastName')
    const avatarInitials = `${(watchedFirstName?.[0] ?? '').toUpperCase()}${(watchedLastName?.[0] ?? '').toUpperCase()}` || '?'
    const productOptions = useMemo(
        () => (selectedIndustry ? productsByIndustry[selectedIndustry] ?? [] : []),
        [selectedIndustry],
    )

    useEffect(() => {
        if (data) {
            reset({
                ...data,
                industry: data.industry ?? '',
                products: data.products ?? [],
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    const onSubmit = async (values: ProfileSchema) => {
        await sleep(500)
        dispatch(setProfile(values))
    }

    return (
        <>
            <h4 className="mb-8">Personal information</h4>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8">
                    <Controller
                        name="img"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center gap-4">
                                {field.value ? (
                                    <Avatar
                                        size={72}
                                        src={field.value}
                                        className="ring-2 ring-gray-200 dark:ring-gray-600 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-[72px] h-[72px] rounded-full bg-gray-100 dark:bg-gray-800 ring-2 ring-gray-200 dark:ring-gray-600 shadow-lg flex items-center justify-center text-gray-600 dark:text-white text-2xl font-bold select-none shrink-0">
                                        {avatarInitials}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Upload
                                        showList={false}
                                        uploadLimit={1}
                                        beforeUpload={beforeUpload}
                                        onChange={(files) => {
                                            if (files.length > 0) {
                                                field.onChange(
                                                    URL.createObjectURL(
                                                        files[0],
                                                    ),
                                                )
                                            }
                                        }}
                                    >
                                        <Button
                                            variant="solid"
                                            size="sm"
                                            type="button"
                                            icon={<TbPlus />}
                                            className="bg-primary hover:bg-primary-deep text-white border-none rounded-md"
                                        >
                                            Upload Image
                                        </Button>
                                    </Upload>
                                    <Button
                                        size="sm"
                                        type="button"
                                        className="bg-transparent dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-md"
                                        onClick={() => {
                                            field.onChange('')
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormItem
                        label="First name"
                        invalid={Boolean(errors.firstName)}
                        errorMessage={errors.firstName?.message}
                    >
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="First Name"
                                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="User name"
                        invalid={Boolean(errors.lastName)}
                        errorMessage={errors.lastName?.message}
                    >
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Last Name"
                                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>
                <FormItem
                    label="Email"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                autoComplete="off"
                                placeholder="Email"
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormItem
                        label="Industry"
                        invalid={Boolean(errors.industry)}
                        errorMessage={errors.industry?.message}
                    >
                        <Controller
                            name="industry"
                            control={control}
                            render={({ field }) => (
                                <Select<ProductOption>
                                    placeholder="Select industry"
                                    options={industryOptions}
                                    className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
                                    value={industryOptions.find((opt) => opt.value === field.value) ?? null}
                                    onChange={(opt) => {
                                        field.onChange(opt?.value ?? '')
                                        setValue('products', [])
                                    }}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Products"
                        invalid={Boolean(errors.products)}
                        errorMessage={errors.products?.message}
                    >
                        <Controller
                            name="products"
                            control={control}
                            render={({ field }) => (
                                <Select<ProductOption, true>
                                    isMulti
                                    placeholder={
                                        selectedIndustry
                                            ? 'Select products'
                                            : 'Select industry first'
                                    }
                                    isDisabled={!selectedIndustry}
                                    options={productOptions}
                                    className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
                                    value={field.value ?? []}
                                    onChange={(opts) => field.onChange(opts ?? [])}
                                />
                            )}
                        />
                    </FormItem>
                </div>
                <div className="flex items-end gap-4 w-full mb-6">
                    <FormItem
                        invalid={
                            Boolean(errors.phoneNumber) ||
                            Boolean(errors.dialCode)
                        }
                    >
                        <label className="form-label mb-2">Phone number</label>
                        <Controller
                            name="dialCode"
                            control={control}
                            render={({ field }) => (
                                <Select<CountryOption>
                                    options={dialCodeList}
                                    {...field}
                                    className="w-[150px] [&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:!border-gray-200 [&>div]:dark:!border-gray-700 [&>div]:!shadow-md"
                                    components={{
                                        Option: (props) => (
                                            <CustomSelectOption
                                                variant="phone"
                                                {...(props as OptionProps<CountryOption>)}
                                            />
                                        ),
                                        Control: CustomControl,
                                    }}
                                    placeholder=""
                                    value={dialCodeList.filter(
                                        (option) =>
                                            option.dialCode === field.value,
                                    )}
                                    onChange={(option) =>
                                        field.onChange(option?.dialCode)
                                    }
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        className="w-full"
                        invalid={
                            Boolean(errors.phoneNumber) ||
                            Boolean(errors.dialCode)
                        }
                        errorMessage={errors.phoneNumber?.message}
                    >
                        <Controller
                            name="phoneNumber"
                            control={control}
                            render={({ field }) => (
                                <NumericInput
                                    autoComplete="off"
                                    placeholder="Phone Number"
                                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                    </FormItem>
                </div>
                <h4 className="mb-6">Address information</h4>
                <FormItem
                    label="Country"
                    invalid={Boolean(errors.country)}
                    errorMessage={errors.country?.message}
                >
                    <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                            <Select<CountryOption>
                                options={countryList}
                                {...field}
                                className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:!border-gray-200 [&>div]:dark:!border-gray-700 [&>div]:!shadow-md"
                                components={{
                                    Option: (props) => (
                                        <CustomSelectOption
                                            variant="country"
                                            {...(props as OptionProps<CountryOption>)}
                                        />
                                    ),
                                    Control: CustomControl,
                                }}
                                placeholder=""
                                value={countryList.filter(
                                    (option) => option.value === field.value,
                                )}
                                onChange={(option) =>
                                    field.onChange(option?.value)
                                }
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Address"
                    invalid={Boolean(errors.address)}
                    errorMessage={errors.address?.message}
                >
                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Address"
                                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    {...field}
                                />
                            )}
                        />
                </FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem
                        label="City"
                        invalid={Boolean(errors.city)}
                        errorMessage={errors.city?.message}
                    >
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="City"
                                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Postal Code"
                        invalid={Boolean(errors.postcode)}
                        errorMessage={errors.postcode?.message}
                    >
                        <Controller
                            name="postcode"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Postal Code"
                                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>
                <div className="flex justify-end">
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                        className="bg-primary hover:bg-primary-deep text-white border-none rounded-md"
                    >
                        Save
                    </Button>
                </div>
            </Form>
        </>
    )
}

export default SettingsProfile
