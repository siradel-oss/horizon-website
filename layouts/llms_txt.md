{{ .Content | transform.HTMLToMarkdown }}

## TypeScript examples

{{ $patterns := (.GetPage "/doc/llm/_index.md").Resources.Match "patterns/*.ts" -}}
{{- range $patterns -}}
- [{{ path.BaseName .Name }}]({{ .RelPermalink }})
{{ end }}

## Optional

{{ $docSection := .GetPage "/doc" -}}
{{- range $docSection.Params.doc_menu -}}
{{- with .name }}### Extensive documentation: {{ . }}{{ end }}

{{ range .entries }}
{{- $page := $.GetPage . -}}
{{- $md := $page.OutputFormats.Get "markdown" -}}
- [{{ $page.Title }}]({{ $md.RelPermalink }})
{{ end }}
{{ end }}
