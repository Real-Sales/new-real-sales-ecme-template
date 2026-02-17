import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Drawer } from '@/components/ui'
import Container from '@/components/shared/Container'
import SalesRepForm, { type SalesRepFormSchema } from './SalesRepForm'
import { HiArrowLeft, HiPlus, HiUser } from 'react-icons/hi'

type SalesRepresentative = {
    id: string
    name: string
    email: string
}

const CompanyDetail = () => {
    const navigate = useNavigate()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const handleBack = () => {
        navigate('/company')
    }

    const openDrawer = () => {
        setIsDrawerOpen(true)
    }

    const onDrawerClose = () => {
        setIsDrawerOpen(false)
    }

    const handleSubmitClick = () => {
        if (formRef.current) {
            formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
            )
        }
    }

    const onSalesRepSubmit = (values: SalesRepFormSchema) => {
        console.log('Sales Rep form submitted:', values)
        // Add your API call here
        window.alert(JSON.stringify(values, null, 2))
        onDrawerClose()
    }

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button 
                size="sm" 
                className="flex-1 bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 border border-gray-600 dark:border-gray-600" 
                onClick={onDrawerClose}
            >
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none"
                onClick={handleSubmitClick}
            >
                Create
            </Button>
        </div>
    )

    const DrawerTitle = (
        <div>
            <h4 className="mb-2 text-lg font-bold">Create New Sales Representative</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to create a new sales representative
            </p>
        </div>
    )

    // Mock data - replace with actual data fetching
    const salesReps: SalesRepresentative[] = [
        { id: '1', name: 'Linda Ld', email: 'linda@gmail.com' },
        { id: '2', name: 'Mike Qc', email: 'mike@gmail.com' },
        { id: '3', name: 'John Jh', email: 'john@gmail.com' },
        { id: '4', name: 'Sarah sh', email: 'sarah@gmail.com' },
    ]

    return (
        <div className="min-h-full">
            <Container className="pb-6">
                {/* Header Section */}
                <div className="mb-6">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiArrowLeft />}
                        onClick={handleBack}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        Back to Company
                    </Button>
                </div>

                {/* Sales Representatives Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <HiUser className="text-2xl text-gray-600 dark:text-gray-400" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Sales Representative ({salesReps.length})
                            </h2>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap rounded-md"
                            onClick={openDrawer}
                        >
                            Create Sales Representative
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {salesReps.map((rep) => (
                            <Card
                                key={rep.id}
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 p-2">
                                    <div className="bg-primary/10 rounded-full p-3 text-primary">
                                        <HiUser className="text-2xl" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                            {rep.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {rep.email}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Container>

            {/* Create Sales Representative Drawer */}
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
                    <form ref={formRef}>
                    <SalesRepForm
                        onSubmit={onSalesRepSubmit}
                            onCancel={onDrawerClose}
                        />
                    </form>
                </div>
            </Drawer>
        </div>
    )
}

export default CompanyDetail
