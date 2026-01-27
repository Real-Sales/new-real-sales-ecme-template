import { Button } from '@/components/ui'
import { HiArrowRight } from 'react-icons/hi'
import { Link } from 'react-router-dom'

const UpgradeCard = () => {
    return (
        <div className="p-2.5 mx-4 mb-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <h5 className="mb-1 font-bold text-sm">Upgrade</h5>
            <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                Get Access upto 3 Personas
            </p>
            <Link to="/subscription">
                <Button
                    block
                    size="sm"
                    className="bg-black hover:bg-gray-900 text-yellow-400 border-none flex justify-between items-center px-2.5 py-1.5 h-auto rounded-md"
                >
                    <span className="text-xs font-semibold">upgrade your plan</span>
                    <HiArrowRight className="text-sm" />
                </Button>
            </Link>
        </div>
    )
}

export default UpgradeCard
