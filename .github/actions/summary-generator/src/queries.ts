export const openIssues = `query OpenIssues {
  repository(owner: "scalameta", name: "metals-feature-requests") {
    issues(filterBy: { states: OPEN }, first: 100) {
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
`;
