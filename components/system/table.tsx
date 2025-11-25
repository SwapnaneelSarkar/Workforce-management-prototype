"use client"

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export type TableColumn<T> = {
  id: string
  label: string
  sortable?: boolean
  align?: "left" | "right" | "center"
  width?: string
  minWidth?: string
  render?: (row: T) => ReactNode
}

type SortState = {
  columnId: string
  direction: "asc" | "desc"
}

type TableProps<T> = {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey?: (row: T, index: number) => string
  selectable?: boolean
  onSelectionChange?: (rows: T[]) => void
  emptyState?: ReactNode
  expandableRow?: (row: T) => ReactNode
  loading?: boolean
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  selectable,
  onSelectionChange,
  emptyState,
  expandableRow,
  loading,
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((c) => c.id === sort.columnId)
    if (!column) return rows

    return [...rows].sort((a, b) => {
      const valueA = (a as Record<string, unknown>)[column.id]
      const valueB = (b as Record<string, unknown>)[column.id]
      if (valueA === valueB) return 0
      if (valueA == null) return 1
      if (valueB == null) return -1
      if (valueA > valueB) return sort.direction === "asc" ? 1 : -1
      return sort.direction === "asc" ? -1 : 1
    })
  }, [sort, rows, columns])

  const toggleSort = (columnId: string) => {
    setSort((prev) => {
      if (prev?.columnId === columnId) {
        if (prev.direction === "asc") return { columnId, direction: "desc" }
        return null
      }
      return { columnId, direction: "asc" }
    })
  }

  const resolveRowKey = (row: T, index: number) => {
    if (rowKey) return rowKey(row, index)
    const maybeId = (row as Record<string, unknown>).id
    return String(maybeId ?? index)
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      onSelectionChange?.(sortedRows.filter((row, index) => next.has(resolveRowKey(row, index))))
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedRows.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const next = new Set(sortedRows.map((row, index) => resolveRowKey(row, index)))
      setSelectedIds(next)
      onSelectionChange?.(sortedRows)
    }
  }

  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < sortedRows.length

  return (
    <div className={cn("overflow-hidden rounded-[8px] border border-border bg-card shadow-[0_1px_4px_rgba(16,24,40,0.06)]", className)}>
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-[#F7F7F9]">
          <tr>
            {selectable ? (
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Checkbox
                  aria-label="Select all rows"
                  checked={selectedIds.size === sortedRows.length && sortedRows.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-border data-[state=checked]:bg-primary"
                  indeterminate={isIndeterminate}
                />
              </th>
            ) : null}
            {columns.map((column) => {
              const isActive = sort?.columnId === column.id
              return (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.width && `w-[${column.width}]`,
                  )}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => toggleSort(column.id)}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.08em]"
                      aria-label={`Sort by ${column.label}`}
                    >
                      {column.label}
                      <span aria-hidden className="text-muted-foreground">
                        {isActive ? (sort?.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-6">
                <div className="h-6 animate-pulse rounded bg-muted/60" />
              </td>
            </tr>
          ) : sortedRows.length ? (
            sortedRows.map((row, index) => {
              const key = resolveRowKey(row, index)
              const expanded = expandedRow === key
              return (
                <>
                  <tr key={key} className="bg-card hover:bg-[#FDFDFD]">
                    {selectable ? (
                      <td className="px-4 py-3">
                        <Checkbox
                          aria-label={`Select row ${key}`}
                          checked={selectedIds.has(key)}
                          onCheckedChange={() => toggleSelection(key)}
                          className="border-border data-[state=checked]:bg-primary"
                        />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td
                        key={`${key}-${column.id}`}
                        className={cn(
                          "px-4 py-3 text-sm text-foreground",
                          column.align === "right" && "text-right",
                          column.align === "center" && "text-center",
                        )}
                      >
                        {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.id] ?? "—")}
                      </td>
                    ))}
                    {expandableRow ? (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setExpandedRow(expanded ? null : key)}
                          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                          aria-expanded={expanded}
                          aria-controls={`row-details-${key}`}
                        >
                          {expanded ? "Hide details" : "View details"}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                  {expanded && expandableRow ? (
                    <tr>
                      <td
                        id={`row-details-${key}`}
                        colSpan={columns.length + (selectable ? 1 : 0) + 1}
                        className="bg-muted/30 px-6 py-4 text-sm"
                      >
                        {expandableRow(row)}
                      </td>
                    </tr>
                  ) : null}
                </>
              )
            })
          ) : (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-sm text-muted-foreground">
                {emptyState ?? "No records found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

