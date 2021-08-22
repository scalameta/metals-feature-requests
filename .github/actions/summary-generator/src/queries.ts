export const openIssues = (after?: string) => {
  const afterParam = after ? `, after: ${after}` : '';
  return `query OpenIssues {
  repository(owner: "scalameta", name: "metals-feature-requests") {
    issues(filterBy: { states: OPEN }, first: 100 ${afterParam}) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        title,
        url,
        reactions(content: THUMBS_UP) {
          totalCount
        }
      }
    }
  }
}
`};
