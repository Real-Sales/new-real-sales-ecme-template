import ReactMarkdown from 'react-markdown'
import classNames from '@/utils/classNames'

type MarkdownContentProps = {
    content: string
    className?: string
}

const MarkdownContent = ({ content, className }: MarkdownContentProps) => {
    return (
        <div
            className={classNames(
                'prose prose-sm max-w-none',
                'prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
                'prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0',
                'prose-p:text-sm prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:my-2',
                'prose-ul:my-2 prose-ol:my-2 prose-li:text-sm prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-li:my-0.5',
                'prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-gray-100',
                'prose-hr:border-gray-200 dark:prose-hr:border-gray-600 prose-hr:my-4',
                className,
            )}
        >
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    )
}

export default MarkdownContent
