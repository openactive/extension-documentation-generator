var fs = require('fs');

if (process.argv.length < 4) {
  console.error("Arguments required: context.jsonld markdown.md ");
  return;
}

var header = fs.readFileSync("test.md", 'utf8');
var context = JSON.parse(fs.readFileSync("test.jsonld", 'utf8'));

var extensionContext = {
  "schema": "https://schema.org/",
  "pending": "http://pending.schema.org/",
  "skos": "http://www.w3.org/2004/02/skos/core#",
  "oa": "https://openactive.io/",
  "beta": "https://openactive.io/ns-beta#"
}

function firstIfArray(x) {
  return Array.isArray(x) ? (x.length > 0 ? x[0] : "") : x;
}

function addLink(x) {
  var segments = x.split(":");
  if (segments.length > 1) {
    var url = x.indexOf("http") > -1 ? x : 
                (extensionContext[segments[0]] + segments[1]);
    return "[`" + x + "`](" + url + ")";
  } else {
    return "`" + x + "`";
  }
}

function formatReference(x) {
  var arrayOfX = Array.isArray(x) ? x : [x];
  return arrayOfX.map(addLink).join(", ");
}

function sortBy(field1, field2) {
    return function(a, b) {
        var aString = firstIfArray(a[field1]);
        var bString = firstIfArray(b[field1]);

        if (aString > bString) {
            return 1;
        } else if (aString < bString) {
            return -1;
        }
        if (field2) {
          var aString = firstIfArray(a[field2]);
          var bString = firstIfArray(b[field2]);
          if (aString > bString) {
              return 1;
          } else if (aString < bString) {
              return -1;
          }
        }
        return 0;
    };
}

function renderGitHubIssueLink(url) {
  var splitUrl = url.split("/");
  var issueNumber = splitUrl[splitUrl.length - 1];
  return "[#" + issueNumber + "](" + url + ")";
}

var propHeading = `


## Properties

| (Class) Property    |  Expected Type  | Proposal   | Description                                                         |
|---------------------|-----------------|------------|---------------------------------------------------------------------|
`;



function mapPropertyToTable(node) {
  return "| (" + formatReference(node.domainIncludes) + ") <br/> `" + node.id + "` | " + formatReference(node.rangeIncludes) + " | " + renderGitHubIssueLink(node.githubIssue) + " | " + node.comment + " |\n"
}

var sortProps = sortBy("domainIncludes", "id");



var classHeading = `


## Classes

| Class                      | subClass | Proposal    | Description                                                                                 |
|----------------------------|----------|-------------|---------------------------------------------------------------------------------------------|
`;
function mapClassToTable(node) {
  return "| `" + node.id + "` | " + formatReference(node.subClassOf) + " | " + renderGitHubIssueLink(node.githubIssue) + " | " + node.comment + " |\n"
}

var sortClass = sortBy("subClassOf", "id");

var enumHeading = `


## Enumeration Values

| Type          | Value    | Proposal    | Description                                                                    |
|---------------|----------|-------------|--------------------------------------------------------------------------------|
`;
function mapEnumToTable(node) {
  return "| " + formatReference(node.type) + " | `" + node.id + "` | " + renderGitHubIssueLink(node.githubIssue) + " | " + node.comment + " |\n"
}

var sortEnum = sortBy("type", "id");

var nodes = context["@graph"];
var properties = nodes.filter(x => x.type == "Property").sort(sortProps).map(mapPropertyToTable);
var classes = nodes.filter(x => x.type == "Class").sort(sortClass).map(mapClassToTable);
var enums = nodes.filter(x => x.type != "Property" && x.type != "Class").sort(sortEnum).map(mapEnumToTable);


var output = header + 
             (properties.length > 0 ? propHeading + properties.join("") : "") +
             (classes.length > 0 ? classHeading + classes.join("") : "") +
             (enums.length > 0 ? enumHeading + enums.join("") : "");

console.log(output);


