import * as t from "io-ts";
import { GraphQLClient } from "graphql-request";
import { failure } from "io-ts/lib/PathReporter";
import { taskEither } from "fp-ts";
import { TaskEither } from "fp-ts/TaskEither";
import { pipe, flow } from "fp-ts/function";
import * as core from "@actions/core";

const githubToken = core.getInput("repo-token");

const graphqlClient = new GraphQLClient("https://api.github.com/graphql", {
  headers: {
    Authorization: `bearer ${githubToken}`,
  },
});

export const query = <A>(
  query: string,
  values: Record<string, unknown>,
  responseType: t.Type<A>
): TaskEither<string, A> => {
  return pipe(
    taskEither.tryCatch(
      () => graphqlClient.request<unknown>(query, values),
      (e: any) => {
        const error = JSON.stringify(e.message);
        return error;
      }
    ),
    taskEither.chain(
      flow(
        responseType.decode,
        taskEither.fromEither,
        taskEither.mapLeft((errors) => {
          const error = failure(errors).join("\n");
          return error;
        })
      )
    )
  );
};
