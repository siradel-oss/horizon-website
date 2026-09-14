{{- $dest := .Destination -}}
{{- $text := .Text -}}

{{- if eq $dest "$proto" -}}
{{- $dest = printf "/doc/reference/HrzProtocol.%s?lang=en" $text -}}
{{- $text = (printf "<code>%s</code>" $text) | safeHTML -}}
{{- end -}}

{{- $url := urls.Parse $dest -}}
{{- if not $url.IsAbs -}}
{{- $linkResult := partial "internal-link.html" (dict "Path" $dest "Page" .Page "Format" "markdown") -}}
{{- $dest = $linkResult.href -}}
{{- if $linkResult.isBroken -}}
{{- if not .Page.Params.allow_broken_links -}}
{{- errorf "Broken link '%s' from page '%s'" $dest .Page.Path -}}
{{- end -}}
{{- end -}}
{{- end -}}

<a href="{{ $dest }}">{{ $text }}</a>

{{- /**/ -}}
