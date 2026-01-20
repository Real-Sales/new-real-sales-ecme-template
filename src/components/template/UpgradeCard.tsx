import { Button } from '@/components/ui'
import { HiArrowRight } from 'react-icons/hi'
import { Link } from 'react-router-dom'

const UpgradeCard = () => {
    return (
        <div className="p-3 mx-4 mb-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <h5 className="mb-1.5 font-bold text-base">Upgrade</h5>
            <p className="mb-2.5 text-xs text-gray-600 dark:text-gray-400">
                Get Access upto 3 Personas
            </p>
            <Link to="/subscription">
                <Button
                    block
                    className="bg-black hover:bg-gray-900 text-yellow-400 border-none flex justify-between items-center px-3 py-2 h-auto rounded-lg"
                >
                    <span className="text-xs font-semibold">upgrade your plan</span>
                    <HiArrowRight className="text-base" />
                </Button>
            </Link>
        </div>
    )
}

export default UpgradeCard
