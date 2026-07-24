import { Suspense } from 'react'
import ScreenLoader from '../constants/ScreenLoader'

export default function SuspenseWrapper({ children }) {
    return (
        <Suspense fallback={<ScreenLoader />}>{children}</Suspense>
    )
}
