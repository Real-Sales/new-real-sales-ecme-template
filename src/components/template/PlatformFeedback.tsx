import { Button } from '@/components/ui'
import { HiOutlineChatAlt2 } from 'react-icons/hi'

type PlatformFeedbackProps = {
    /** When true, ignore theme and render with the dark palette (used by the always-dark desktop side nav). */
    forceDark?: boolean
}

const PlatformFeedback = ({ forceDark = false }: PlatformFeedbackProps) => {
    const handleFeedbackClick = () => {
        // In real app: Open feedback form/modal or redirect to feedback page
        console.log('Open feedback form')
    }

    const containerCls = forceDark
        ? 'p-2.5 mx-4 mb-2 rounded-lg border border-gray-700/80 bg-gray-900/75 shadow-md backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:shadow-lg'
        : 'p-2.5 mx-4 mb-2 rounded-lg bg-gray-100 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 dark:bg-gray-900/90 dark:border-gray-700'
    const titleCls = forceDark
        ? 'mb-1 font-bold text-sm text-white'
        : 'mb-1 font-bold text-sm text-gray-900 dark:text-white'
    const bodyCls = forceDark
        ? 'mb-2 text-xs text-gray-400'
        : 'mb-2 text-xs text-gray-600 dark:text-gray-400'

    return (
        <div className={containerCls}>
            <h5 className={titleCls}>Platform Feedback</h5>
            <p className={bodyCls}>Help us improve! Share your thoughts</p>
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
