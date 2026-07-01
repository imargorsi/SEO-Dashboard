"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";

import { DashboardBreadcrumbBar } from "@/components/layout/dashboard-breadcrumb-bar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  breadcrumbLinkClassName,
} from "@/components/ui/breadcrumb";

export type DashboardBreadcrumbSegment = {
  id?: string;
  label: ReactNode;
  href?: string;
};

type DashboardModuleBreadcrumbSectionProps = {
  items: DashboardBreadcrumbSegment[];
};

export function DashboardModuleBreadcrumbSection({ items }: DashboardModuleBreadcrumbSectionProps) {
  if (!items.length) return null;

  return (
    <DashboardBreadcrumbBar>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <Fragment key={item.id ?? String(index)}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {item.href ? (
                  <Link href={item.href} className={breadcrumbLinkClassName}>
                    {item.label}
                  </Link>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </DashboardBreadcrumbBar>
  );
}
