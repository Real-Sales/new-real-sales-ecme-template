import { Button } from '@/components/ui'
import { HiOutlineChatAlt2 } from 'react-icons/hi'

const PlatformFeedback = () => {
    const handleFeedbackClick = () => {
        // In real app: Open feedback form/modal or redirect to feedback page
        console.log('Open feedback form')
    }

    return (
        <div className="p-2.5 mx-4 mb-2 rounded-lg border border-gray-700/80 bg-gray-900/75 shadow-md backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:shadow-lg">
            <h5 className="mb-1 font-bold text-sm text-white">Platform Feedback</h5>
            <p className="mb-2 text-xs text-gray-400">
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
