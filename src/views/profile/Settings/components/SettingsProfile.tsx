import { useEffect, useMemo, useRef, useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Upload from '@/components/ui/Upload'
import Avatar from '@/components/ui/Avatar'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Form, FormItem } from '@/components/ui/Form'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setUser } from '@/store/slices/auth/userSlice'
import { fetchIndustries } from '@/store/slices/industriesCatalogSlice'
import type { IndustryCatalogItem } from '@/services/IndustryService'
import {
    fetchUserProfile,
    saveProfileSettings,
    clearProfileSaveError,
    setProfile,
    resetProfileSaving,
    type SaveProfileSettingsPayload,
} from '../store/settingsSlice'
import { formatDisplayLabel } from '@/utils/formatDisplayLabel'
import {
    mergeProductOptions,
    profileProductsToOptions,
} from '@/utils/companyProducts'
import type { GetSettingsProfileResponse } from '../types'
import { HiOutlineUser } from 'react-icons/hi'
import { TbPlus } from 'react-icons/tb'

const readOnlyMutedInputClass =
    'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 shadow-md opacity-50 cursor-default'

const editableInputClass =
    'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md'

const selectClassName =
    '[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md'

const readOnlySelectClassName =
    '[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md opacity-60'

type SelectOption = { value: string; label: string }

const displayValue = (value?: string | null) => {
    if (value == null || String(value).trim() === '') return 'Not provided'
    return String(value).trim()
}

const normalizeKey = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, '')

const findIndustryMatch = (
    industryName: string,
    catalog: IndustryCatalogItem[],
) => {
    if (!industryName) return undefined
    const key = normalizeKey(industryName)
    return catalog.find(
        (item) =>
            item.name === industryName || normalizeKey(item.name) === key,
    )
}

const SettingsProfile = () => {
    const dispatch = useAppDispatch()
    const data = useAppSelector((state) => state.settings.profile)
    const profileLoading = useAppSelector((state) => state.settings.profileLoading)
    const profileInitialized = useAppSelector((state) => state.settings.profileInitialized)
    const profileError = useAppSelector((state) => state.settings.profileError)
    const profileSaving = useAppSelector((state) => state.settings.profileSaving)
    const profileSaveError = useAppSelector((state) => state.settings.profileSaveError)
    const authUser = useAppSelector((state) => state.auth.user)

    const industries = useAppSelector((state) => state.industriesCatalog.industries)
    const industriesLoading = useAppSelector((state) => state.industriesCatalog.loading)
    const industriesInitialized = useAppSelector(
        (state) => state.industriesCatalog.initialized,
    )
    const industriesError = useAppSelector((state) => state.industriesCatalog.error)

    const isCompanyOwner = authUser.role === 'company_owner'
    const hasCompany = data.hasCompany ?? Boolean(data.companyName)

    const [companyName, setCompanyName] = useState('')
    const [companyIndustry, setCompanyIndustry] = useState('')
    const [selectedIndustryId, setSelectedIndustryId] = useState('')
    const [productIds, setProductIds] = useState<string[]>([])
    const [companyPhone, setCompanyPhone] = useState('')
    const [companyAddress, setCompanyAddress] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [avatarImg, setAvatarImg] = useState('')
    const [avatarChanged, setAvatarChanged] = useState(false)
    const companyFormSyncedRef = useRef('')
    const personalFormSyncedRef = useRef('')
    const savedIndustryRef = useRef('')
    const skipNextFormSyncRef = useRef(false)

    const salesCompanyId = data.salesCompanyId || authUser.companyId || ''

    const avatarInitials =
        `${(data.firstName?.[0] ?? '').toUpperCase()}${(data.lastName?.[0] ?? '').toUpperCase()}` ||
        '?'

    const beforeAvatarUpload = (files: FileList | null) => {
        const allowedFileType = ['image/jpeg', 'image/png', 'image/webp']
        if (!files) return true
        for (const file of files) {
            if (!allowedFileType.includes(file.type)) {
                return 'Please upload a .jpeg, .png, or .webp file!'
            }
        }
        return true
    }

    const handleAvatarUpload = (files: File[]) => {
        if (!files.length) return
        const previewUrl = URL.createObjectURL(files[0])
        setAvatarImg(previewUrl)
        setAvatarChanged(true)
        dispatch(setProfile({ img: previewUrl }))
        dispatch(setUser({ ...authUser, avatar: previewUrl }))
    }

    const handleAvatarRemove = () => {
        setAvatarImg('')
        setAvatarChanged(true)
        dispatch(setProfile({ img: '' }))
        dispatch(setUser({ ...authUser, avatar: '' }))
    }

    useEffect(() => {
        if (!profileInitialized) return
        if (skipNextFormSyncRef.current) return
        const syncKey = `${data.firstName}|${data.lastName}|${data.phoneNumber}`
        if (personalFormSyncedRef.current === syncKey) return
        setFirstName(data.firstName ?? '')
        setLastName(data.lastName ?? '')
        setPhoneNumber(data.phoneNumber ?? '')
        personalFormSyncedRef.current = syncKey
    }, [
        profileInitialized,
        data.firstName,
        data.lastName,
        data.phoneNumber,
    ])

    useEffect(() => {
        dispatch(resetProfileSaving())
    }, [dispatch])

    useEffect(() => {
        if (!profileInitialized && !profileLoading) {
            dispatch(fetchUserProfile())
        }
    }, [dispatch, profileInitialized, profileLoading])

    useEffect(() => {
        if (!profileInitialized) return
        setAvatarImg(data.img || authUser.avatar || '')
    }, [profileInitialized, data.img, authUser.avatar])

    useEffect(() => {
        if (isCompanyOwner && hasCompany && !industriesInitialized && !industriesLoading) {
            dispatch(fetchIndustries())
        }
    }, [
        dispatch,
        isCompanyOwner,
        hasCompany,
        industriesInitialized,
        industriesLoading,
    ])

    useEffect(() => {
        if (!profileInitialized) return
        if (skipNextFormSyncRef.current) {
            skipNextFormSyncRef.current = false
            return
        }
        if (!industriesInitialized && industries.length === 0) return

        const rawIndustry =
            data.companyIndustry ?? data.industryLabel ?? data.industry ?? ''
        const matched = findIndustryMatch(rawIndustry, industries)
        const savedProductIds = (data.selectedProductIds ?? []).filter(Boolean)

        const syncKey = [
            data.salesCompanyId,
            data.companyName,
            rawIndustry,
            data.address,
            data.location,
            savedProductIds.join(','),
        ].join('|')

        if (companyFormSyncedRef.current === syncKey) return

        setCompanyName(data.companyName ?? '')
        setCompanyPhone(data.companyPhone ?? '')
        setCompanyAddress((data.address || data.location || '').trim())
        setProductIds(savedProductIds)

        const industryName = matched?.name ?? rawIndustry
        setCompanyIndustry(industryName)
        setSelectedIndustryId(matched?.industry_id ?? '')

        savedIndustryRef.current = industryName
        companyFormSyncedRef.current = syncKey
    }, [
        profileInitialized,
        data.salesCompanyId,
        data.companyName,
        data.companyIndustry,
        data.industryLabel,
        data.industry,
        data.companyPhone,
        data.address,
        data.location,
        data.selectedProductIds,
        data.companyProducts,
        industries,
        industriesInitialized,
    ])

    const industryOptions: SelectOption[] = useMemo(
        () =>
            industries.map((industry) => ({
                value: industry.name,
                label: formatDisplayLabel(industry.name),
            })),
        [industries],
    )

    const productOptions: SelectOption[] = useMemo(() => {
        if (!selectedIndustryId) return []
        const industry = industries.find((item) => item.industry_id === selectedIndustryId)
        return (industry?.products ?? []).map((product) => ({
            value: product.product_id,
            label: formatDisplayLabel(product.name),
        }))
    }, [industries, selectedIndustryId])

    const savedProductOptions = useMemo(
        () => profileProductsToOptions(data.companyProducts),
        [data.companyProducts],
    )

    const selectedProductOptions = useMemo(
        () =>
            mergeProductOptions(
                productOptions.filter((opt) => productIds.includes(opt.value)),
                savedProductOptions.filter((opt) => productIds.includes(opt.value)),
            ),
        [productIds, productOptions, savedProductOptions],
    )

    const readOnlyProductChips: SelectOption[] = useMemo(
        () => savedProductOptions,
        [savedProductOptions],
    )

    const handleSave = async () => {
        dispatch(clearProfileSaveError())

        const payload: SaveProfileSettingsPayload = {
            personal: {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                phone_number: phoneNumber.trim(),
            },
        }

        if (isCompanyOwner && hasCompany && salesCompanyId) {
            const location = companyAddress.trim()
            payload.company = {
                sales_company_id: salesCompanyId,
                name: companyName.trim(),
                industry: companyIndustry,
                phone_number: companyPhone.trim(),
                ...(location ? { location } : {}),
                email: (data.companyEmail || data.email || '').trim(),
                product_ids: productIds.filter(Boolean),
            }
        }

        const result = await dispatch(saveProfileSettings(payload))

        if (saveProfileSettings.fulfilled.match(result)) {
            skipNextFormSyncRef.current = true
            personalFormSyncedRef.current = `${firstName.trim()}|${lastName.trim()}|${phoneNumber.trim()}`
            companyFormSyncedRef.current = [
                salesCompanyId,
                companyName.trim(),
                companyIndustry,
                companyAddress.trim(),
                industries.length,
                productIds.join(','),
            ].join('|')
            savedIndustryRef.current = companyIndustry
            setAvatarChanged(false)

            if (avatarImg) {
                dispatch(setProfile({ img: avatarImg }))
                dispatch(setUser({ ...authUser, avatar: avatarImg }))
            }

            toast.push(
                <Notification title="Success" type="success">
                    Profile updated successfully
                </Notification>,
            )
        }
    }

    const baselineCompanyIndustry = useMemo(() => {
        const rawIndustry =
            data.companyIndustry ?? data.industryLabel ?? data.industry ?? ''
        const matched = findIndustryMatch(rawIndustry, industries)
        return matched?.name ?? rawIndustry
    }, [
        data.companyIndustry,
        data.industryLabel,
        data.industry,
        industries,
    ])

    const baselineCompanyAddress = useMemo(
        () => (data.address || data.location || '').trim(),
        [data.address, data.location],
    )

    const isFormDirty = useMemo(() => {
        const personalDirty =
            firstName.trim() !== (data.firstName ?? '').trim() ||
            lastName.trim() !== (data.lastName ?? '').trim() ||
            phoneNumber.trim() !== (data.phoneNumber ?? '').trim()

        const companyDirty =
            isCompanyOwner &&
            hasCompany &&
            Boolean(salesCompanyId) &&
            (companyName.trim() !== (data.companyName ?? '').trim() ||
                companyIndustry !== baselineCompanyIndustry ||
                companyPhone.trim() !== (data.companyPhone ?? '').trim() ||
                companyAddress.trim() !== baselineCompanyAddress ||
                productIds.join(',') !== (data.selectedProductIds ?? []).join(','))

        return personalDirty || companyDirty || avatarChanged
    }, [
        firstName,
        lastName,
        phoneNumber,
        data.firstName,
        data.lastName,
        data.phoneNumber,
        isCompanyOwner,
        hasCompany,
        salesCompanyId,
        companyName,
        companyIndustry,
        baselineCompanyIndustry,
        companyPhone,
        companyAddress,
        baselineCompanyAddress,
        data.companyName,
        data.companyPhone,
        productIds,
        data.selectedProductIds,
        avatarChanged,
    ])

    const saveDisabled = Boolean(
        profileSaving ||
            !isFormDirty ||
            !firstName.trim() ||
            !lastName.trim() ||
            (isCompanyOwner &&
                hasCompany &&
                Boolean(salesCompanyId) &&
                (companyName.trim() !== (data.companyName ?? '').trim() ||
                    companyIndustry !== baselineCompanyIndustry ||
                    companyPhone.trim() !== (data.companyPhone ?? '').trim() ||
                    companyAddress.trim() !== baselineCompanyAddress ||
                    productIds.join(',') !==
                        (data.selectedProductIds ?? []).join(',')) &&
                (!companyName.trim() ||
                    !companyIndustry ||
                    productIds.length === 0)),
    )

    if (profileLoading && !profileInitialized) {
        return (
            <div className="flex justify-center py-16">
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <>
            <h4 className="mb-2">Personal information</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Update your personal account details below.
            </p>

            {profileError && (
                <p className="text-sm text-red-500 dark:text-red-400 mb-6">{profileError}</p>
            )}

            <Form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        {avatarImg ? (
                            <Avatar
                                size={90}
                                className="border-4 border-white dark:border-gray-800 bg-gray-100 text-gray-300 shadow-lg"
                                icon={<HiOutlineUser />}
                                src={avatarImg}
                            />
                        ) : (
                            <div
                                className="w-[72px] h-[72px] rounded-full bg-gray-100 dark:bg-gray-800 ring-2 ring-gray-200 dark:ring-gray-600 shadow-lg flex items-center justify-center text-gray-600 dark:text-white text-2xl font-bold select-none shrink-0"
                            >
                                {avatarInitials}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Upload
                                showList={false}
                                uploadLimit={1}
                                beforeUpload={beforeAvatarUpload}
                                onChange={handleAvatarUpload}
                            >
                                <Button
                                    variant="solid"
                                    size="sm"
                                    type="button"
                                    icon={<TbPlus />}
                                >
                                    Upload Image
                                </Button>
                            </Upload>
                            <Button
                                size="sm"
                                type="button"
                                disabled={!avatarImg}
                                onClick={handleAvatarRemove}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <FormItem label="First name">
                        <Input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={editableInputClass}
                        />
                    </FormItem>
                    <FormItem label="Last name">
                        <Input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={editableInputClass}
                        />
                    </FormItem>
                </div>

                <FormItem label="Email">
                    <Input
                        type="email"
                        readOnly
                        value={data.email}
                        className={readOnlyMutedInputClass}
                    />
                </FormItem>

                <FormItem label="Your phone number">
                    <Input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Your phone number"
                        className={editableInputClass}
                    />
                </FormItem>

                {hasCompany && (
                    <>
                        <h4 className="mb-2 mt-4">Company information</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {isCompanyOwner
                                ? 'Update your company name, industry, and company phone.'
                                : 'Company details from your sales company profile.'}
                        </p>

                        {isCompanyOwner && industriesError && (
                            <Alert showIcon type="danger" className="mb-4">
                                <span className="break-all">{industriesError}</span>
                            </Alert>
                        )}

                        <FormItem label="Company name">
                            <Input
                                type="text"
                                readOnly={!isCompanyOwner}
                                value={
                                    isCompanyOwner
                                        ? companyName
                                        : displayValue(data.companyName)
                                }
                                onChange={(e) => setCompanyName(e.target.value)}
                                className={
                                    isCompanyOwner
                                        ? editableInputClass
                                        : readOnlyMutedInputClass
                                }
                            />
                        </FormItem>

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem label="Industry">
                                {isCompanyOwner ? (
                                    <Select<SelectOption, false>
                                        placeholder={
                                            industriesLoading
                                                ? 'Loading industries...'
                                                : 'Select your industry'
                                        }
                                        options={industryOptions}
                                        isDisabled={industriesLoading || !!industriesError}
                                        value={
                                            industryOptions.find(
                                                (opt) => opt.value === companyIndustry,
                                            ) || null
                                        }
                                        onChange={(option) => {
                                            const name = option?.value || ''
                                            const industry = industries.find(
                                                (item) => item.name === name,
                                            )
                                            setCompanyIndustry(name)
                                            setSelectedIndustryId(
                                                industry?.industry_id || '',
                                            )
                                            setProductIds([])
                                        }}
                                        className={selectClassName}
                                    />
                                ) : (
                                    <Input
                                        type="text"
                                        readOnly
                                        value={displayValue(
                                            data.industryLabel || data.industry,
                                        )}
                                        className={readOnlyMutedInputClass}
                                    />
                                )}
                            </FormItem>
                            <FormItem label="Company email">
                                <Input
                                    type="email"
                                    readOnly
                                    value={displayValue(data.companyEmail)}
                                    className={readOnlyMutedInputClass}
                                />
                            </FormItem>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem label="Company phone">
                                <Input
                                    type="text"
                                    readOnly={!isCompanyOwner}
                                    value={
                                        isCompanyOwner
                                            ? companyPhone
                                            : displayValue(data.companyPhone)
                                    }
                                    onChange={(e) => setCompanyPhone(e.target.value)}
                                    className={
                                        isCompanyOwner
                                            ? editableInputClass
                                            : readOnlyMutedInputClass
                                    }
                                />
                            </FormItem>
                            <FormItem label="Address">
                                <Input
                                    type="text"
                                    readOnly={!isCompanyOwner}
                                    value={
                                        isCompanyOwner
                                            ? companyAddress
                                            : displayValue(data.address || data.location)
                                    }
                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                    placeholder="Company address"
                                    className={
                                        isCompanyOwner
                                            ? editableInputClass
                                            : readOnlyMutedInputClass
                                    }
                                />
                            </FormItem>
                        </div>

                        <FormItem
                            label="Products"
                            extra={
                                isCompanyOwner ? (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Products your company sells (saved on your company
                                        profile).
                                    </span>
                                ) : undefined
                            }
                        >
                            {isCompanyOwner ? (
                                <Select<SelectOption, true>
                                    isMulti
                                    placeholder={
                                        !selectedIndustryId
                                            ? 'Select an industry to browse products'
                                            : productOptions.length === 0
                                              ? 'No products for this industry'
                                              : 'Select products'
                                    }
                                    options={productOptions}
                                    isDisabled={
                                        industriesLoading ||
                                        !!industriesError ||
                                        !selectedIndustryId ||
                                        productOptions.length === 0
                                    }
                                    value={selectedProductOptions}
                                    onChange={(options) => {
                                        setProductIds(
                                            (options as SelectOption[]).map(
                                                (opt) => opt.value,
                                            ),
                                        )
                                    }}
                                    className={selectClassName}
                                />
                            ) : readOnlyProductChips.length > 0 ? (
                                <Select<SelectOption, true>
                                    isMulti
                                    isDisabled
                                    isSearchable={false}
                                    options={readOnlyProductChips}
                                    value={readOnlyProductChips}
                                    className={readOnlySelectClassName}
                                />
                            ) : (
                                <div
                                    className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4 text-sm text-gray-500 dark:text-gray-400 opacity-60"
                                >
                                    No products saved for your company yet.
                                </div>
                            )}
                        </FormItem>
                    </>
                )}

                {profileSaveError && (
                    <Alert showIcon type="danger" className="mb-4 mt-4">
                        <span className="break-all">{profileSaveError}</span>
                    </Alert>
                )}

                <div className="flex justify-end mt-6">
                    <Button
                        type="button"
                        variant="solid"
                        loading={profileSaving}
                        disabled={saveDisabled}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </div>
            </Form>
        </>
    )
}

export default SettingsProfile
