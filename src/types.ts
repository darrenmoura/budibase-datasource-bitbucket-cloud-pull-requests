export interface CreateQuery {
    workspaceId: string;
    repoSlug: string;
    body?: string;
}

export interface ReadQuery {
    workspaceId: string;
    repoSlug: string;
    pullRequestId: string;
}

export type ListQuery = {
    workspaceId: string;
    repoSlug: string;
    state?: string;
} & Queriable & Sortable & Paginated;

export interface UpdateQuery {
    workspaceId: string;
    repoSlug: string;
    pullRequestId: string;
    body: string;
}

export interface ApproveQuery {
    workspaceId: string;
    repoSlug: string;
    pullRequestId: string;
}

export interface UnapproveQuery {
    workspaceId: string;
    repoSlug: string;
    pullRequestId: string;
}

export interface DeclineQuery {
    workspaceId: string;
    repoSlug: string;
    pullRequestId: string;
}

type Queriable = { query?: string };
type Sortable = { sort?: string };
type Paginated = { page?: number, pageLength?: number };