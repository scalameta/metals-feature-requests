import * as t from "io-ts";

export const Issue = t.type(
  {
    title: t.string,
    url: t.string,
    reactions: t.type({
      totalCount: t.number
    })
  },
  "Issue"
);

export type Issue = t.TypeOf<typeof Issue>;

export const IssuesResponse = t.type(
  {
    repository: t.type({
      issues: t.type({
        nodes: t.array(Issue)
      })
    })
  },
  "IssuesResponse"
);
