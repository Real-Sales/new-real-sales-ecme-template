import { Button } from '@/components/ui'
import { HiOutlineChatAlt2 } from 'react-icons/hi'

const PlatformFeedback = () => {
    const handleFeedbackClick = () => {
        // In real app: Open feedback form/modal or redirect to feedback page
        console.log('Open feedback form')
    }

    return (
        <div className="p-2.5 mx-4 mb-2 rounded-lg bg-gray-100 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 dark:bg-gray-900/90 dark:border-gray-700">
            <h5 className="mb-1 font-bold text-sm text-gray-900 dark:text-white">Platform Feedback</h5>
            <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                Help us improve! Share your thoughts
            </p>
            <Button
                block
                size="sm"
                variant="solid"
                className="bg-primary hover:bg-primary-deep text-white border-none flex justify-center items-center gap-1.5 px-2.5 py-1.5 h-auto rounded-md transition-all"
                onClick={handleFeedbackClick}
            >
                <HiOutlineChatAlt2 className="text-sm" />
                <span className="text-xs font-semibold">Give Feedback</span>
            </Button>
        </div>
    )
}

export default PlatformFeedback
