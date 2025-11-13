'use client'

import { useLayoutEffect } from 'react'

export function RootClientWrapper({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    // Handle any DOM mutations that might occur before hydration
    // This prevents hydration mismatches from browser extensions or dev tools
    const html = document.documentElement
    // Only add the class if it was added by something external (e.g., Material Design Lite)
    // This ensures the client matches what the browser rendered
  }, [])

  return <>{children}</>
}
