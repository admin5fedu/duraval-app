"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type BreadcrumbContextType = {
  detailTitle: string | null
  setDetailTitle: (title: string | null) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  detailTitle: null,
  setDetailTitle: () => {},
})

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [detailTitle, setDetailTitle] = useState<string | null>(null)

  return (
    <BreadcrumbContext.Provider value={{ detailTitle, setDetailTitle }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export const useBreadcrumb = () => useContext(BreadcrumbContext)

