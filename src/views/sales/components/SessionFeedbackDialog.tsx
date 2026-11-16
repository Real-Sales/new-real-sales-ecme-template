import { useEffect, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbStar } from 'react-icons/tb'
import classNames from '@/utils/classNames'
import { apiSubmitPlatformFeedback } from '@/services/PlatformFeedbackService'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

type SessionFeedbackDialogProps = {
    isOpen: boolean
    onClose: () => void
    onSubmitted?: () => void
}

const fieldControlClass =
    '!bg-gray-50 dark:!bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md'

const SessionFeedbackDialog = ({
    isOpen,
    onClose,
    onSubmitted,
}: SessionFeedbackDialogProps) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setRating(0)
        setHoverRating(0)
        setDescription('')
        setSubmitting(false)
    }, [isOpen])

    const canSubmit =
        rating >= 1 && rating <= 5 && description.trim().length > 0 && !submitting

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return

        try {
            setSubmitting(true)
            await apiSubmitPlatformFeedback({
                rating,
                description: description.trim(),
            })
            toast.push(
                <Notification title="Success" type="success">
                    Thanks for your feedback!
                </Notification>,
            )
            onSubmitted?.()
            onClose()
        } catch (err: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getApiErrorMessage(err, 'Failed to submit feedback.')}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog
            isOpen={isOpen}
            width={440}
            contentClassName="mt-[12vh]"
            onClose={onClose}
            onRequestClose={onClose}
        >
            <div className="text-center mb-5">
                <h4 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                    How was your session?
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Share quick feedback after your performance report.
                </p>
            </div>

            <Form onSubmit={handleSubmit}>
                <FormItem label="Rating" asterisk className="mb-4">
                    <div
                        className="flex items-center justify-center gap-1.5 py-1"
                        role="radiogroup"
                        aria-label="Session rating"
                    >
                        {[1, 2, 3, 4, 5].map((value) => {
                            const active = (hoverRating || rating) >= value
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={rating === value}
                                    aria-label={`${value} star${value === 1 ? '' : 's'}`}
                                    className="p-1 rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    onMouseEnter={() => setHoverRating(value)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(value)}
                                >
                                    <TbStar
                                        className={classNames(
                                            'text-3xl transition-colors',
                                            active
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-gray-300 dark:text-gray-600',
                                        )}
                                    />
                                </button>
                            )
                        })}
                    </div>
                </FormItem>

                <FormItem label="Feedback" asterisk className="mb-6">
                    <Input
                        textArea
                        rows={4}
                        autoComplete="off"
                        placeholder="What went well? What can we improve?"
                        className={fieldControlClass}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </FormItem>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        block
                        size="sm"
                        variant="default"
                        className="dark:!bg-gray-800 dark:!border-gray-600"
                        disabled={submitting}
                        onClick={onClose}
                    >
                        Maybe later
                    </Button>
                    <Button
                        type="submit"
                        block
                        size="sm"
                        variant="solid"
                        className="bg-primary hover:bg-primary-deep text-neutral border-none"
                        loading={submitting}
                        disabled={!canSubmit}
                    >
                        Submit
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}

export default SessionFeedbackDialog
