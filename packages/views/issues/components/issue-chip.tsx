"use client";

import { issueStatusCategory } from "@multica/core/issues";
import { useIssueStatuses } from "@multica/core/issue-statuses/hooks";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { issueListOptions, issueDetailOptions } from "@multica/core/issues/queries";
import { useWorkspaceId } from "@multica/core/hooks";
import { StatusIcon } from "./status-icon";

/**
 * Compact, presentation-only representation of an issue —
 * `<StatusIcon> <identifier>`, bordered. The title is deliberately not shown:
 * a chip sits inside a line of prose, and a title next to the identifier made
 * reference-dense text hard to scan. `IssueHoverCard` shows the title and the
 * rest of the detail on hover.
 *
 * The cap is `min(18rem, 100%)` — it keeps the chip inside narrow parents such
 * as a chat bubble, and truncates an unresolved fallback label that is longer
 * than the container. `ProjectChip` carries the identical cap; the two must
 * not drift.
 *
 * The cap lives here (single source of truth) — wrappers must NOT add their own
 * flex container around it, or a percentage cap gets dropped during the
 * wrapper's intrinsic sizing and the clickable box diverges from the truncated
 * chip.
 *
 * This is the single source of truth for the "issue-mention card" look.
 * It is intentionally **not** a link or button: callers wrap it in whatever
 * interactive shell they need (AppLink for markdown mentions, an <a> with
 * cmd-click support inside the editor's NodeView, a plain span next to a
 * dismiss button in chat's context anchor card, …).
 *
 * Size budget: must fit within a 14px line-box when used inline — hence
 * `py-0.5` + text-caption (see MentionView docstring for the math).
 */
export interface IssueChipProps {
  issueId: string;
  /** Shown when the issue can't be resolved (deleted, other workspace, …). */
  fallbackLabel?: string;
  /** Optional content override for callers that need the shared chip shell. */
  children?: ReactNode;
  /** Extra classes — callers layer interaction hints here
   *  (e.g. `hover:bg-accent cursor-pointer` for navigable variants). */
  className?: string;
}

const BASE_CLASS =
  "issue-mention inline-flex min-w-0 max-w-[min(18rem,100%)] items-center gap-1.5 rounded-md border mx-0.5 px-2 py-0.5 text-caption";

export function IssueChip({
  issueId,
  fallbackLabel,
  children,
  className,
}: IssueChipProps) {
  const wsId = useWorkspaceId();
  const { colorOf: statusColorOf, iconOf: statusIconOf } = useIssueStatuses(wsId);
  const { data: issues = [] } = useQuery(issueListOptions(wsId));
  const listIssue = issues.find((i) => i.id === issueId);

  // Fallback fetch for issues outside the list's first page (the first
  // ISSUE_PAGE_SIZE issues across all categories).
  const { data: detailIssue } = useQuery({
    ...issueDetailOptions(wsId, issueId),
    enabled: !listIssue,
  });

  const issue = listIssue ?? detailIssue;
  const cls = className ? `${BASE_CLASS} ${className}` : BASE_CLASS;

  if (children !== undefined) {
    return <span className={cls}>{children}</span>;
  }

  if (!issue) {
    return (
      <span className={cls}>
        <span className="min-w-0 truncate font-medium text-muted-foreground">
          {fallbackLabel ?? issueId.slice(0, 8)}
        </span>
      </span>
    );
  }

  return (
    <span className={cls}>
      <StatusIcon
        status={issue.status}
        category={issueStatusCategory(issue) ?? undefined}
        color={statusColorOf(issue.status)}
        icon={statusIconOf(issue.status)}
        className="h-3.5 w-3.5 shrink-0"
      />
      <span className="min-w-0 truncate font-medium text-muted-foreground">
        {issue.identifier}
      </span>
    </span>
  );
}
