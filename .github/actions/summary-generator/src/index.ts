import { query } from "./graphql";
import { IssuesResponse, Issue } from "./models";
import { openIssues } from "./queries";
import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import * as core from "@actions/core";
import { TaskEither } from "fp-ts/lib/TaskEither";

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

  const getIssues = (endCursor?: string): TaskEither<string, Array<Issue>> => pipe(
    query(openIssues(endCursor), {}, IssuesResponse),
      taskEither.chain(({ repository }) => {
        if (repository.issues.pageInfo.hasNextPage) {
          return pipe(
            getIssues(repository.issues.pageInfo.endCursor),
            taskEither.map(issues => [...repository.issues.nodes, ...issues]),
          );
        } else {
          return taskEither.right(repository.issues.nodes)
        }
      })
    )

  return pipe(
    getIssues(),
    taskEither.bimap(
      (e) => {
        core.debug(e);
        core.setFailed(e);
      },
      (issues) => {
        const commentBody = generateBody(issues);
        core.setOutput("comment-body", commentBody);
      }
    )
  )();
}

run();
