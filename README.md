# extension-documentation-generator
Generates documentation for OpenActive vocabulary extensions

This GitHub Action generates an index.md file from a JSON-LD extension context, useful for serving OpenActive vocabulary extension documentation via GitHub Pages.

## Usage

Create a new GitHub Action using the following template, in a repository that includes a `header.md` file and a `{prefix}.jsonld` context file in the root.

```yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@v2
      - name: Render Documentation
        uses: openactive/extension-documentation-generator@master
        with:
          header: header.md
          context: {prefix}.jsonld
          with_issues: false
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
          force_orphan: true
          enable_jekyll: true
```

You may customise three parameters:
1) `context` - jsonld context file used to generate the documentation. This should be named according to the prefix of your custom namespace, e.g. `beta.jsonld`.
2) `header` - markdown file to prepended to the generated documentation, e.g. `header.md`
3) `with_issues` - whether to include GitHub issues from the context in the generated documentation

