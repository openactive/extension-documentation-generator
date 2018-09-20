# extension-documentation-generator
Generates documentation for OpenActive extensions

This script generates a README.md file from a JSON-LD extension context.

## Usage
`node index.js test.jsonld test.md > output.md`

Accepts two parameters:
1) `context.jsonld` - jsonld context used to generate the documentation
2) `header.md` - markdown file to prepended to the output


