import { query } from "./graphql";
import { IssuesResponse, Issue } from "./models";
import { openIssues } from "./queries";
import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import * as core from "@actions/core";

function generateBody(issues: Array<Issue>): string {
  return (
    "## Feature requests\n\n" +
    " 👍votes | issue |\n" +
    ":-------:|---------|\n" +
    issues
      .sort((a, b) => b.reactions.totalCount - a.reactions.totalCount)
      .map(
        (issue) =>
          `${issue.reactions.totalCount} | [${issue.title}](${issue.url})`
      )
      .join("\n") +
    "\n\n<sub>last updated on " +
    new Date().toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    }) +
    "</sub>"
  );
}

function run(): Promise<unknown> {
  return pipe(
    query(openIssues, {}, IssuesResponse),
    taskEither.bimap(
      (e) => {
        core.debug(e);
        core.setFailed(e);
      },
      ({ repository }) => {
        const commentBody = generateBody(repository.issues.nodes);
        core.setOutput("comment-body", commentBody);
      }
    )
  )();
}

run();

// const updateFeaturesIssue = pipe(
//   query(openIssues, {}, IssuesResponse),
//   taskEither.chain(({ repository }) =>
//     query(
//       updateIssueComment,
//       {
//         // id of first comment on scalameta/metals#707
//         commentId: "MDEyOklzc3VlQ29tbWVudDQ4ODMxMTQ2Ng==",
//         body: generateBody(repository.issues.nodes),
//       },
//       t.type({})
//     )
//   ),
//   taskEither.mapLeft((e) => console.error(e))
// );
