import { IntegrationBase } from "@budibase/types"
import fetch from "node-fetch"
import { ApproveQuery, CreateQuery, DeclineQuery, ListQuery, ReadQuery, UnapproveQuery, UpdateQuery } from "./types"
import { toBase64 } from "./util"

interface RequestOpts {
  method: string
  body?: string
  headers?: { [key: string]: string }
}

interface BitbucketApiConfig {
  username: string;
  appPassword: string;
}

const BITBUCKET_V2_API_BASE_URL = "https://api.bitbucket.org/2.0"
const BITBUCKET_REPOSITORIES_URL = `${BITBUCKET_V2_API_BASE_URL}/repositories`
const BITBUCKET_PULL_REQUESTS_PATH = `/pullrequests`

class CustomIntegration implements IntegrationBase {
  private readonly authHeaderValue: string;

  constructor(config: BitbucketApiConfig) {
      const encodedCreds = toBase64(`${config.username}:${config.appPassword}`);
      this.authHeaderValue = `Basic ${encodedCreds}`;
  }

  async create(query: CreateQuery) {
    const opts = {
      method: "POST",
      body: query.body,
      headers: {
        "Content-Type": "application/json",
      },
    }

    return this.request(`${BITBUCKET_REPOSITORIES_URL}/${query.workspaceId}/${query.repoSlug}${BITBUCKET_PULL_REQUESTS_PATH}`, opts);
  }

  async read(query: ReadQuery) {
    const opts = {
      method: "GET",
    };

    return this.request(`${BITBUCKET_REPOSITORIES_URL}/${query.workspaceId}/${query.repoSlug}${BITBUCKET_PULL_REQUESTS_PATH}/${query.pullRequestId}`, opts);
  }

  async list(query: ListQuery) {
    const url = new URL(`${BITBUCKET_REPOSITORIES_URL}/${query.workspaceId}/${query.repoSlug}${BITBUCKET_PULL_REQUESTS_PATH}`);
    if (query.state) {
      url.searchParams.append("state", query.state);
    }
    if (query.query) {
      url.searchParams.append("q", query.query);
    }
    if (query.sort) {
      url.searchParams.append("sort", query.sort);
    }
    if (query.page) {
      url.searchParams.append("page", String(query.page));
    }
    if (query.pageLength) {
      url.searchParams.append("pagelen", String(query.pageLength));
    }

    const opts = {
      method: "GET",
    };

    return this.request(url, opts);
  }

  async update(query: UpdateQuery) {
    const opts = {
      method: "PUT",
      body: query.body,
      headers: {
        "Content-Type": "application/json",
      },
    }

    return this.request(`${BITBUCKET_REPOSITORIES_URL}/${query.workspaceId}/${query.repoSlug}${BITBUCKET_PULL_REQUESTS_PATH}/${query.pullRequestId}`, opts);
  }

  async approve(query: ApproveQuery) {
    const opts = {
      method: "POST",
    }

    return this.request(`${BITBUCKET_REPOSITORIES_URL}/${query.workspaceId}/${query.repoSlug}${BITBUCKET_PULL_REQUESTS_PATH}/${query.pullRequestId}/approve`, opts);
  }

  async unapprove(query: UnapproveQuery) {
    const opts = {
      method: "DELETE",
    }

    return this.request(`${BITBUCKET_REPOSITORIES_URL}/${query.workspaceId}/${query.repoSlug}${BITBUCKET_PULL_REQUESTS_PATH}/${query.pullRequestId}/approve`, opts);
  }

  async decline(query: DeclineQuery) {
    const opts = {
      method: "POST",
    }

    return this.request(`${BITBUCKET_REPOSITORIES_URL}/${query.workspaceId}/${query.repoSlug}${BITBUCKET_PULL_REQUESTS_PATH}/${query.pullRequestId}/decline`, opts);
  }

  private async request(url: string | URL, opts: RequestOpts) {
    await this.addAuthHeader(opts);

    const response = await fetch(url, opts)
    if (response.status <= 300) {
      try {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("json")) {
          return await response.json()
        } else {
          return await response.text()
        }
      } catch (err) {
        return await response.text()
      }
    } else {
      const err = await response.text()
      throw new Error(err)
    }
  }

  private async addAuthHeader(opts: RequestOpts) {
    const authHeader = { Authorization: this.authHeaderValue };
    opts.headers = opts.headers ? { ...opts.headers, ...authHeader } : authHeader; 
  }
}

export default CustomIntegration
