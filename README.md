# extension-documentation-generator
Generates documentation for OpenActive extensions

This script generates a README.md file from a JSON-LD extension context.

## Usage
`node index.js test.jsonld test.md with-issues > output.md`

Accepts three parameters:
1) `context.jsonld` - jsonld context used to generate the documentation
2) `header.md` - markdown file to prepended to the output
3) `with-issues` - include GitHub issues

