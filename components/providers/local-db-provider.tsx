"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  LOCAL_DB_KEY,
  defaultLocalDbState,
  persistLocalDb,
  readLocalDb,
  type LocalDbDocumentEntry,
  type LocalDbOnboardingDetails,
  type LocalDbState,
} from "@/lib/local-db"

type DocumentMeta = {
  name?: string
  source?: LocalDbDocumentEntry["source"]
}

type LocalDbContextValue = {
  data: LocalDbState
  hydrated: boolean
  saveOnboardingDetails: (details: LocalDbOnboardingDetails) => void
  markDocumentUploaded: (docType: string, meta?: DocumentMeta) => void
  removeDocumentUploaded: (docType: string) => void
  markJobApplied: (jobId: string) => void
  resetLocalDb: () => void
}

const LocalDbContext = createContext<LocalDbContextValue | undefined>(undefined)

const stampState = (state: LocalDbState): LocalDbState => ({
  ...state,
  lastUpdated: new Date().toISOString(),
})

export function LocalDbProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LocalDbState>(defaultLocalDbState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    if (!window.localStorage.getItem(LOCAL_DB_KEY)) {
      persistLocalDb(defaultLocalDbState)
    }
    setData(readLocalDb())
    setHydrated(true)
  }, [])

  const updateDb = useCallback((updater: (current: LocalDbState) => LocalDbState) => {
    setData((prev) => {
      const next = stampState(updater(prev))
      persistLocalDb(next)
      return next
    })
  }, [])

  const saveOnboardingDetails = useCallback(
    (details: LocalDbOnboardingDetails) => {
      updateDb((prev) => ({
        ...prev,
        onboardingDetails: { ...prev.onboardingDetails, ...details },
      }))
    },
    [updateDb],
  )

  const markDocumentUploaded = useCallback(
    (docType: string, meta?: DocumentMeta) => {
      if (!docType) {
        return
      }
      updateDb((prev) => ({
        ...prev,
        uploadedDocuments: {
          ...prev.uploadedDocuments,
          [docType]: {
            name: meta?.name,
            source: meta?.source ?? "wallet",
            uploadedAt: new Date().toISOString(),
          },
        },
      }))
    },
    [updateDb],
  )

  const removeDocumentUploaded = useCallback(
    (docType: string) => {
      if (!docType) {
        return
      }
      updateDb((prev) => {
        const { [docType]: removed, ...remaining } = prev.uploadedDocuments
        return {
          ...prev,
          uploadedDocuments: remaining,
        }
      })
    },
    [updateDb],
  )

  const markJobApplied = useCallback(
    (jobId: string) => {
      if (!jobId) {
        return
      }
      updateDb((prev) => ({
        ...prev,
        jobApplications: {
          ...prev.jobApplications,
          [jobId]: {
            appliedAt: new Date().toISOString(),
          },
        },
      }))
    },
    [updateDb],
  )

  const resetLocalDb = useCallback(() => {
    updateDb(() => defaultLocalDbState)
  }, [updateDb])

  const value = useMemo<LocalDbContextValue>(
    () => ({
      data,
      hydrated,
      saveOnboardingDetails,
      markDocumentUploaded,
      removeDocumentUploaded,
      markJobApplied,
      resetLocalDb,
    }),
    [data, hydrated, markDocumentUploaded, removeDocumentUploaded, markJobApplied, resetLocalDb, saveOnboardingDetails],
  )

  return <LocalDbContext.Provider value={value}>{children}</LocalDbContext.Provider>
}

export function useLocalDb() {
  const context = useContext(LocalDbContext)
  if (!context) {
    throw new Error("useLocalDb must be used within LocalDbProvider")
  }
  return context
}


