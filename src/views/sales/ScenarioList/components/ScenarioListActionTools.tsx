import Button from '@/components/ui/Button'
import { TbPlus } from 'react-icons/tb'

type ScenarioListActionToolsProps = {
    onAddNew: () => void
}

const ScenarioListActionTools = ({ onAddNew }: ScenarioListActionToolsProps) => {
    return (
        <div className="flex flex-col md:flex-row gap-3">
            <Button
                size="sm"
                variant="solid"
                icon={<TbPlus className="text-xl" />}
                className="bg-primary hover:bg-primary-deep text-neutral border-none rounded-md"
                onClick={onAddNew}
            >
                Add Scenario
            </Button>
        </div>
    )
}

export default ScenarioListActionTools
