"use client"

import { useState } from "react"
import { Modal } from "@/components/system"
import { Button } from "@/components/ui/button"
import type { ComplianceItem } from "@/lib/compliance-templates-store"
import { complianceItemsByCategory } from "@/lib/compliance-items"
import { StatusChip } from "@/components/system"

type AddItemModalProps = {
  open: boolean
  onClose: () => void
  onAdd: (item: ComplianceItem) => void
  existingItemIds?: string[]
}

export function AddItemModal({ open, onClose, onAdd, existingItemIds = [] }: AddItemModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const handleAdd = () => {
    if (!selectedItemId) return

    // Find the selected item from all categories
    for (const items of Object.values(complianceItemsByCategory)) {
      const item = items.find((i) => i.id === selectedItemId)
      if (item) {
        // Create a new item with a unique ID
        const newItem: ComplianceItem = {
          ...item,
          id: crypto.randomUUID(),
        }
        onAdd(newItem)
        setSelectedItemId(null)
        onClose()
        return
      }
    }
  }

  const availableItems = Object.entries(complianceItemsByCategory).map(([category, items]) => ({
    category,
    items: items.filter((item) => !existingItemIds.includes(item.id)),
  }))

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
                          <StatusChip label={item.type} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Expiration: {item.expirationType}</span>
                          {item.requiredAtSubmission && (
                            <span className="text-primary font-medium">Required at submission</span>
                          )}
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
