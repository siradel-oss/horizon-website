+++
date = '{{ replaceRE "^([\\d-]+)-(.*)" "$1" .File.ContentBaseName }}'
title = '{{ replace (replaceRE "^[\\d-]+(.*)" "$1" .File.ContentBaseName) "-" " " | title }}'
slug = '{{ replaceRE "^[\\d-]+(.*)" "$1" .File.ContentBaseName }}'
categories = []
thumbnail = 'image.png'
excerpt = ""
+++
