var fs = require('fs');
const core = require('@actions/core');

var includeIssues = core.getInput('with_issues') === 'true';
var headerFile = core.getInput('header', { required: true });
var contextFile = core.getInput('context', { required: true });

var header = fs.readFileSync(headerFile, 'utf8');
var context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));

var extensionContext = {
  "schema": "https://schema.org/",
  "pending": "http://pending.schema.org/",
  "skos": "http://www.w3.org/2004/02/skos/core#",
  "oa": "https://openactive.io/",
  "beta": "https://openactive.io/ns-beta#"
}

context['@context'].forEach(element => {
  if (typeof element === 'object') {
    Object.assign(extensionContext, element);
  }
});

function firstIfArray(x) {
  return Array.isArray(x) ? (x.length > 0 ? x[0] : "") : x;
}

function formatReference(x, separator = ", ", isArray = false) {
  var arrayOfX = Array.isArray(x) ? x : [x];
  return arrayOfX.map((x) => {
    var segments = x.split(":");
    var arrayPrefix = isArray ? "Array of " : "";
    if (segments.length > 1) {
      var url = x.indexOf("http") > -1 ? x : 
                  (extensionContext[segments[0]] + segments[1]);
      return arrayPrefix + "[`" + x + "`](" + url + ")";
    } else {
      return arrayPrefix + "`" + x + "`";
    }
  }).join(separator);
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

function removePrefix(str) {
  if (str.indexOf("#") > -1) { 
    return str.substring(str.lastIndexOf("#") + 1);
  } else if (str.indexOf("/") > -1) { 
    return str.substring(str.lastIndexOf("/") + 1);
  } else if (str.indexOf(":") > -1) {
    return str.substring(str.lastIndexOf(":") + 1);
  } else {
    return str;
  }
}

var propHeading = `


## Properties

| (Class) Property    |  Expected Type  ` + (includeIssues ? "| Proposal   " : "") + `| Description                                                         |
|---------------------|-----------------` + (includeIssues ? "|------------" : "") + `|---------------------------------------------------------------------|
`;



function mapPropertyToTable(node) {
  return `| <a name="` + removePrefix(node['@id']) + `"></a>` + " (" + formatReference(node.domainIncludes) + ") <br/>  `" + node['@id'] + "` | " + formatReference(node.rangeIncludes, "<br/> - or - <br/>", node['@container'] == '@list') + (includeIssues ? " | " + renderGitHubIssueLink(node.discussionUrl) : "" ) + " | " + node.comment + " |\n"
}

var sortProps = sortBy("domainIncludes", "@id");



var classHeading = `


## Classes

| Class                      | subClasses ` + (includeIssues ? "| Proposal   " : "") + `| Description                                                                                 |
|----------------------------|------------` + (includeIssues ? "|------------" : "") + `|---------------------------------------------------------------------------------------------|
`;
function mapClassToTable(node) {
  return `| <a name="` + removePrefix(node['@id']) + `"></a>` + " `" + node['@id'] + "` | " + formatReference(node.subClassOf) + " | " + (includeIssues ? renderGitHubIssueLink(node.discussionUrl) + " | " : "" )+ node.comment + " |\n"
}

var sortClass = sortBy("subClassOf", "@id");

var enumHeading = `


## Enumeration Values

| Type          | Value    ` + (includeIssues ? "| Proposal   " : "") + `| Description                                                                    |
|---------------|----------` + (includeIssues ? "|------------" : "") + `|--------------------------------------------------------------------------------|
`;
function mapEnumToTable(node) {
  return "| " + formatReference(node['@type']) + ` | <a name="` + removePrefix(node['@id']) + `"></a>` + " `" + node['@id'] + "` | " + (includeIssues ? renderGitHubIssueLink(node.discussionUrl) + " | " : "" ) + node.comment + " |\n"
}

var sortEnum = sortBy("@type", "@id");

var nodes = context["@graph"];
var properties = nodes.filter(x => x['@type'] == "Property").sort(sortProps).map(mapPropertyToTable);
var classes = nodes.filter(x => x['@type'] == "Class").sort(sortClass).map(mapClassToTable);
var enums = nodes.filter(x => x['@type'] != "Property" && x['@type'] != "Class").sort(sortEnum).map(mapEnumToTable);


var output = header + 
             (properties.length > 0 ? propHeading + properties.join("") : "") +
             (classes.length > 0 ? classHeading + classes.join("") : "") +
             (enums.length > 0 ? enumHeading + enums.join("") : "");

var dir = './out';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
fs.writeFileSync("./out/index.md", output); 
fs.copyFileSync(headerFile, `./out/${headerFile}`);

