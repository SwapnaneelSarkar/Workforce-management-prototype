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
  type LocalDbPlacementOnboarding,
  type LocalDbState,
  type PlacementOnboardingTask,
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
  withdrawApplication: (jobId: string) => void
  getPlacementOnboarding: (placementId: string) => LocalDbPlacementOnboarding | null
  updatePlacementOnboarding: (placementId: string, onboarding: LocalDbPlacementOnboarding) => void
  completePlacementTask: (placementId: string, taskId: string) => void
  togglePostLike: (postId: string) => void
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
            status: "Submitted",
            lastUpdated: new Date().toISOString(),
          },
        },
      }))
    },
    [updateDb],
  )

  const withdrawApplication = useCallback(
    (jobId: string) => {
      if (!jobId) {
        return
      }
      updateDb((prev) => {
        const entry = prev.jobApplications[jobId]
        if (!entry) {
          return prev
        }
        return {
          ...prev,
          jobApplications: {
            ...prev.jobApplications,
            [jobId]: {
              ...entry,
              withdrawn: true,
              withdrawnAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
            },
          },
        }
      })
    },
    [updateDb],
  )

  const getPlacementOnboarding = useCallback(
    (placementId: string): LocalDbPlacementOnboarding | null => {
      return data.placementOnboarding[placementId] || null
    },
    [data.placementOnboarding],
  )

  const updatePlacementOnboarding = useCallback(
    (placementId: string, onboarding: LocalDbPlacementOnboarding) => {
      updateDb((prev) => ({
        ...prev,
        placementOnboarding: {
          ...prev.placementOnboarding,
          [placementId]: onboarding,
        },
      }))
    },
    [updateDb],
  )

  const completePlacementTask = useCallback(
    (placementId: string, taskId: string) => {
      updateDb((prev) => {
        const current = prev.placementOnboarding[placementId]
        if (!current) {
          // Initialize with default tasks if not exists
          const defaultTasks: PlacementOnboardingTask[] = [
            { id: "orientation", label: "Complete Orientation", completed: false },
            { id: "employment-agreement", label: "Sign Employment Agreement", completed: false },
            { id: "facility-tour", label: "Complete Facility Tour", completed: false },
            { id: "meet-manager", label: "Meet with Manager", completed: false },
          ]
          const newOnboarding: LocalDbPlacementOnboarding = {
            placementId,
            tasks: defaultTasks.map((task) =>
              task.id === taskId ? { ...task, completed: true, completedAt: new Date().toISOString() } : task
            ),
            progress: Math.round((1 / defaultTasks.length) * 100),
            lastUpdated: new Date().toISOString(),
          }
          return {
            ...prev,
            placementOnboarding: {
              ...prev.placementOnboarding,
              [placementId]: newOnboarding,
            },
          }
        }

        const updatedTasks = current.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: true, completedAt: new Date().toISOString() } : task
        )
        const completedCount = updatedTasks.filter((t) => t.completed).length
        const progress = Math.round((completedCount / updatedTasks.length) * 100)

        return {
          ...prev,
          placementOnboarding: {
            ...prev.placementOnboarding,
            [placementId]: {
              ...current,
              tasks: updatedTasks,
              progress,
              lastUpdated: new Date().toISOString(),
            },
          },
        }
      })
    },
    [updateDb],
  )

  const togglePostLike = useCallback(
    (postId: string) => {
      updateDb((prev) => {
        const isLiked = prev.likedPosts.includes(postId)
        const newLikedPosts = isLiked
          ? prev.likedPosts.filter((id) => id !== postId)
          : [...prev.likedPosts, postId]
        
        // Update post likes count
        const post = prev.newsFeedPosts[postId]
        if (post) {
          return {
            ...prev,
            likedPosts: newLikedPosts,
            newsFeedPosts: {
              ...prev.newsFeedPosts,
              [postId]: {
                ...post,
                likes: isLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
              },
            },
          }
        }
        return {
          ...prev,
          likedPosts: newLikedPosts,
        }
      })
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
      withdrawApplication,
      getPlacementOnboarding,
      updatePlacementOnboarding,
      completePlacementTask,
      togglePostLike,
      resetLocalDb,
    }),
    [
      data,
      hydrated,
      markDocumentUploaded,
      removeDocumentUploaded,
      markJobApplied,
      withdrawApplication,
      getPlacementOnboarding,
      updatePlacementOnboarding,
      completePlacementTask,
      togglePostLike,
      resetLocalDb,
      saveOnboardingDetails,
    ],
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


