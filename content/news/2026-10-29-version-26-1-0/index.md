+++
date = '2026-10-29'
title = 'Version 26.1.0'
slug = 'version-26.1.0'
categories = ["release"]
thumbnail = 'thumbnail.webp'
excerpt = ""
+++

Version 26.1.0 of Horizon is now available, improving handling of vector
multi-geometries, and adding new configuration options for the sun's position.

## Highlights

- **Vector data**
  - The API around vector geometry has been simplified. No more separation
    between client vector data & the in-memory vector data layer!
  - Multi-geometries are no longer split into multiple features, improving the
    handling of such data with per-tile vector data sources.
  - GeoJSON's geometry collection are now supported, and more generally
    features with mixed geometry types.
- **Sun settings**
  - The sun's position in the sky can now be fixed instead of automatically
    following the camera.
  - Its position can also be set using precise calendar dates and times.
  - [See the gallery demo](/gallery/sunPosition.html).

> [Read the full changelog](/doc/changelog.html#version-2610---2026-10-29)
>
> [See the release on GitHub](https://github.com/siradel-oss/horizon/releases/tag/v26.1.0)
