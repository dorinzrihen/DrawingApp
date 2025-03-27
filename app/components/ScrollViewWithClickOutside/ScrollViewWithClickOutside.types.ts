import { ReactNode } from "react"

export type ScrollViewWithClickOutsideProps = {
    isVisible: boolean,
    handleClickOutside: () => void, 
    children: ReactNode
}
