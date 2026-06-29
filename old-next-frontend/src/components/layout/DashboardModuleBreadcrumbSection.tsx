import { Fragment, type ReactNode } from "react"
import { Link } from "react-router-dom"

import { DashboardBreadcrumbBar } from "@/components/layout/DashboardBreadcrumbBar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export type DashboardBreadcrumbSegment = {
  /** List key; defaults to index */
  id?: string
  label: ReactNode
  /** When set, segment is a link; when omitted, current page */
  to?: string
}

type DashboardModuleBreadcrumbSectionProps = {
  items: DashboardBreadcrumbSegment[]
}

/**
 * Gradient breadcrumb rail for dashboard routes. Pass `items` in order:
 * `{ label, to? }[]` — last segment typically has no `to` (current page).
 */
export function DashboardModuleBreadcrumbSection({
  items,
}: DashboardModuleBreadcrumbSectionProps) {
  if (!items.length) {
    return null
  }

  return (
    <DashboardBreadcrumbBar>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <Fragment key={item.id ?? String(index)}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {item.to ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </DashboardBreadcrumbBar>
  )
}
