"use client"

import Link from "next/link"
import { Fragment } from "react"

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items.length) return null

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li aria-current={isLast ? "page" : undefined}>
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-foreground underline-offset-4 hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-medium text-foreground" : undefined}>{item.label}</span>
                )}
              </li>
              {!isLast ? <span className="text-muted-foreground">/</span> : null}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

