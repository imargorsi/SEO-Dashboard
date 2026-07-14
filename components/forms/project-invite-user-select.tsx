"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose, IoSearchOutline } from "react-icons/io5";

import { UserAvatar } from "@/components/ui/user-avatar";
import { Spinner } from "@/components/ui/spinner";
import { useUserLookupQuery } from "@/features/users/users.api";
import type { TUserLookupItem } from "@/types/project-invite.types";
import { cn } from "@/lib/utils";

export type TInviteUserOption = TUserLookupItem;

type ProjectInviteUserSelectProps = {
  selectedUsers: TInviteUserOption[];
  excludedUserIds?: string[];
  onSelect: (user: TInviteUserOption) => void;
  onRemove: (userId: string) => void;
  isMutating?: boolean;
  disabled?: boolean;
  helpText?: string;
};

export function ProjectInviteUserSelect({
  selectedUsers,
  excludedUserIds = [],
  onSelect,
  onRemove,
  isMutating = false,
  disabled = false,
  helpText,
}: ProjectInviteUserSelectProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.createForm" });
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const lookupQuery = useUserLookupQuery(debouncedSearch, {
    enabled: debouncedSearch.length >= 2 && !disabled,
  });

  const selectedIds = useMemo(
    () => new Set([...selectedUsers.map((user) => user.id), ...excludedUserIds]),
    [excludedUserIds, selectedUsers],
  );

  const options = (lookupQuery.data ?? []).filter((user) => !selectedIds.has(user.id));

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div className="space-y-3" ref={containerRef}>
      {selectedUsers.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label={t("inviteSelectedLabel")}>
          {selectedUsers.map((user) => (
            <li
              key={user.id}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-bg-input py-1 ps-1 pe-2"
            >
              <UserAvatar name={user.name} imageUrl={user.profileImage} size="xs" roundedClassName="rounded-full" />
              <span className="min-w-0 truncate type-caption text-text-primary">
                {user.name}
                <span className="text-text-muted"> · {user.email}</span>
              </span>
              <button
                type="button"
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
                onClick={() => onRemove(user.id)}
                disabled={disabled || isMutating}
                aria-label={t("inviteRemoveAria", { name: user.name })}
              >
                <IoClose className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative">
        <label className="mb-1.5 block type-label text-text-secondary" htmlFor={`${listId}-search`}>
          {t("inviteSearchLabel")}
        </label>
        <div className="relative">
          <IoSearchOutline
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            id={`${listId}-search`}
            type="search"
            value={search}
            disabled={disabled}
            autoComplete="off"
            placeholder={t("inviteSearchPlaceholder")}
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            role="combobox"
            onChange={(event) => {
              setSearch(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className={cn(
              "h-11 w-full rounded-xl border border-border bg-bg-input pe-3 ps-10 type-body text-text-primary outline-none transition-colors placeholder:text-text-placeholder",
              "focus-visible:border-(--accent-border) focus-visible:ring-2 focus-visible:ring-(--accent-border)/40",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
          {lookupQuery.isFetching ? (
            <Spinner className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          ) : null}
        </div>

        {isOpen && debouncedSearch.length >= 2 ? (
          <div
            id={listId}
            role="listbox"
            className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-bg-card p-1.5 shadow-(--shadow)"
          >
            {lookupQuery.isError ? (
              <p className="px-3 py-2 type-caption text-status-rejected">{t("inviteSearchError")}</p>
            ) : options.length === 0 && !lookupQuery.isFetching ? (
              <p className="px-3 py-2 type-caption text-text-muted">{t("inviteSearchEmpty")}</p>
            ) : (
              options.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start transition-colors hover:bg-bg-hover"
                  onClick={() => {
                    onSelect(user);
                    setSearch("");
                    setDebouncedSearch("");
                    setIsOpen(false);
                  }}
                  disabled={isMutating}
                >
                  <UserAvatar
                    name={user.name}
                    imageUrl={user.profileImage}
                    size="sm"
                    roundedClassName="rounded-lg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate type-body-strong text-text-primary">{user.name}</span>
                    <span className="block truncate type-caption text-text-muted">{user.email}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      <p className="type-caption text-text-muted">{helpText ?? t("inviteHelp")}</p>
    </div>
  );
}
