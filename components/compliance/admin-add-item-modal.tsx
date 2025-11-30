"use client"

import { useState } from "react"
import { Modal } from "@/components/system"
import { Button } from "@/components/ui/button"
import type { ComplianceItem } from "@/lib/compliance-templates-store"
import { complianceItemsByCategory } from "@/lib/compliance-items"
import { ChevronRight, ChevronLeft } from "lucide-react"

type AdminAddItemModalProps = {
  open: boolean
  onClose: () => void
  onAdd: (item: ComplianceItem) => void
  existingItemIds?: string[]
}

// Map internal categories to display names
const categoryDisplayNames: Record<string, string> = {
  Background: "Background & Identification",
  Licenses: "Professional Licenses",
  Certifications: "Certifications",
  Training: "Skills & Additional Training",
  Other: "Other",
}

// Reverse mapping for display to internal
const displayToInternalCategory: Record<string, string> = {
  "Background & Identification": "Background",
  "Professional Licenses": "Licenses",
  Certifications: "Certifications",
  "Skills & Additional Training": "Training",
  Other: "Other",
}

// Categories in the order specified
const categoryOrder = [
  "Background & Identification",
  "Professional Licenses",
  "Certifications",
  "Skills & Additional Training",
  "Other",
]

export function AdminAddItemModal({ open, onClose, onAdd, existingItemIds = [] }: AdminAddItemModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null)

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setStep(2)
  }

  const handleItemSelect = (item: ComplianceItem) => {
    setSelectedItemId(item.id)
    setSelectedItem(item)
    setStep(3)
  }

  const handleAdd = () => {
    if (!selectedItem) return

    // Create a new item with a unique ID
    const newItem: ComplianceItem = {
      ...selectedItem,
      id: crypto.randomUUID(),
    }
    onAdd(newItem)
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setSelectedCategory(null)
    setSelectedItemId(null)
    setSelectedItem(null)
    onClose()
  }

  const internalCategory = selectedCategory ? displayToInternalCategory[selectedCategory] : null
  const availableItems = internalCategory
    ? complianceItemsByCategory[internalCategory]?.filter((item) => !existingItemIds.includes(item.id)) || []
    : []

  const getExpirationTypeDisplay = (type: string) => {
    switch (type) {
      case "None":
        return "Non-expiring"
      case "Fixed Date":
        return "Expiration Date"
      case "Recurring":
        return "Completion Date"
      default:
        return type
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Compliance Item"
      description={
        step === 1
          ? "Select a category to begin."
          : step === 2
            ? "Select an item from the category."
            : "Review expiration type and add to template."
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((step - 1) as 1 | 2 | 3)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step === 3 && (
              <Button onClick={handleAdd} disabled={!selectedItem} variant="default">
                Add to Template
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Step 1: Select Category */}
        {step === 1 && (
          <div className="space-y-3">
            {categoryOrder.map((displayCategory) => {
              const internalCat = displayToInternalCategory[displayCategory]
              const items = complianceItemsByCategory[internalCat] || []
              const availableCount = items.filter((item) => !existingItemIds.includes(item.id)).length

              if (availableCount === 0) return null

              return (
                <button
                  key={displayCategory}
                  type="button"
                  onClick={() => handleCategorySelect(displayCategory)}
                  className="w-full text-left rounded-md border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{displayCategory}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              )
            })}
            {categoryOrder.every((displayCategory) => {
              const internalCat = displayToInternalCategory[displayCategory]
              const items = complianceItemsByCategory[internalCat] || []
              return items.filter((item) => !existingItemIds.includes(item.id)).length === 0
            }) && (
              <p className="text-sm text-muted-foreground text-center py-8">
                All available items have been added.
              </p>
            )}
          </div>
        )}

        {/* Step 2: Select Item */}
        {step === 2 && selectedCategory && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {availableItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No items available in this category.</p>
            ) : (
              availableItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemSelect(item)}
                  className={`w-full text-left rounded-md border p-4 transition-colors ${
                    selectedItemId === item.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 3: Show Expiration Type */}
        {step === 3 && selectedItem && (
          <div className="space-y-4">
            <div className="rounded-md border border-border p-4 bg-muted/30">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Item Name</p>
                  <p className="text-sm font-medium text-foreground">{selectedItem.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Category</p>
                  <p className="text-sm text-foreground">{selectedCategory || ""}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Expiration Type</p>
                  <p className="text-sm text-foreground">{getExpirationTypeDisplay(selectedItem.expirationType)}</p>
                </div>
                {selectedItem.requiredAtSubmission && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-primary font-medium">Required at submission</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
