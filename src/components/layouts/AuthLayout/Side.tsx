import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex h-full p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center flex-1 min-h-0 w-full">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px] h-full flex flex-col min-h-0">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
            <div className="py-6 px-10 lg:flex flex-col flex-1 justify-between hidden rounded-3xl items-end relative xl:max-w-[520px] 2xl:max-w-[720px]">
                <img
                    src="/img/others/auth-side-bg.png"
                    className="absolute h-full w-full top-0 left-0 rounded-3xl"
                />
            </div>
        </div>
    )
}

export default Side
