# Summary generator action

GitHub action to generate a summary table for all open feature requests, sorted
by popularity (number of 👍reactions).

## Deploy a new version

```
# install dependencies
yarn

# build the action
yarn build && yarn package

git add dist
git commit -a
git push
```
