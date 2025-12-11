"use client"

import { useState, useEffect, useMemo } from "react"
import { Modal } from "@/components/system"
import { Button } from "@/components/ui/button"
import type { ComplianceItem } from "@/lib/compliance-templates-store"
import { StatusChip } from "@/components/system"
import {
  getAllComplianceListItems,
  type ComplianceListItem,
} from "@/lib/admin-local-db"

type AddItemModalProps = {
  open: boolean
  onClose: () => void
  onAdd: (item: ComplianceItem) => void
  existingItemIds?: string[]
}

// Helper function to convert ComplianceListItem to ComplianceItem
function convertListItemToItem(listItem: ComplianceListItem): ComplianceItem {
  // Map ComplianceListItem category to ComplianceItem type
  let type: ComplianceItem["type"] = "Other"
  if (listItem.category === "License") {
    type = "License"
  } else if (listItem.category === "Certification") {
    type = "Certification"
  } else if (listItem.category === "Background & Identification") {
    type = "Background"
  } else if (listItem.category === "Training") {
    type = "Training"
  } else {
    type = "Other"
  }

  // Map expiration types
  let expirationType: ComplianceItem["expirationType"] = "None"
  if (listItem.expirationType === "Expiration Date") {
    expirationType = "Fixed Date"
  } else if (listItem.expirationType === "Expiration Rule") {
    expirationType = "Recurring" // Map Expiration Rule to Recurring for template compatibility
  } else if (listItem.expirationType === "Non-Expirable") {
    expirationType = "None"
  } else {
    expirationType = "None"
  }

  return {
    id: listItem.id, // Use the list item ID
    name: listItem.name,
    type,
    expirationType,
    requiredAtSubmission: false, // Default to false, can be set later
  }
}

export function AddItemModal({ open, onClose, onAdd, existingItemIds = [] }: AddItemModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [listItems, setListItems] = useState<ComplianceListItem[]>([])

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      try {
        const items = getAllComplianceListItems()
        setListItems(items.filter((item) => item.isActive))
      } catch (error) {
        console.warn("Failed to load compliance list items", error)
        setListItems([])
      }
    }
  }, [open])

  const handleAdd = () => {
    if (!selectedItemId) return

    const listItem = listItems.find((item) => item.id === selectedItemId)
    if (listItem) {
      const complianceItem = convertListItemToItem(listItem)
      // Use the original list item ID (not a new UUID) so we can reference the compliance list item
      // This is important for requisition templates which store listItemIds
      const newItem: ComplianceItem = {
        ...complianceItem,
        id: listItem.id, // Keep the original compliance list item ID
      }
      onAdd(newItem)
      setSelectedItemId(null)
      onClose()
    }
  }

  // Group items by category and filter out existing ones
  const availableItems = useMemo(() => {
    const categoryMap: Record<string, ComplianceListItem[]> = {}
    
    // Get existing item names/IDs - could be IDs or names
    const existingIdentifiers = new Set(existingItemIds)
    
    listItems.forEach((item) => {
      // Skip if already in template (check by ID or name)
      if (existingIdentifiers.has(item.id) || existingIdentifiers.has(item.name)) {
        return
      }

      const category = item.category
      if (!categoryMap[category]) {
        categoryMap[category] = []
      }
      categoryMap[category].push(item)
    })

    return Object.entries(categoryMap).map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
  }, [listItems, existingItemIds])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Compliance Item"
      description="Select a compliance item from the list below. Items are grouped by category."
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedItemId} variant="default">
            Add Item
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {availableItems.map(({ category, items }) => {
          if (items.length === 0) return null

          return (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{category}</h3>
              <div className="space-y-2">
                {items.map((item) => {
                  const isSelected = selectedItemId === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                          <StatusChip label={item.category} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Expiration: {item.expirationType}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="ml-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {availableItems.every(({ items }) => items.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">All available items have been added.</p>
        )}
      </div>
    </Modal>
  )
}
