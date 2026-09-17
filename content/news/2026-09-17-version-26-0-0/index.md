+++
date = '2026-09-17'
title = 'Version 26.0.0'
slug = 'version-26-0-0'
categories = ["release"]
thumbnail = 'thumbnail.webp'
excerpt = "Our first open-source release is here! Version 26.0.0 is now available, bringing 3D models animations, and an improved API."
+++

Version 26.0.0 of Horizon is our first open-source release.

Internally, this version has been the occasion for us to majorly improve and cleanup our APIs and protocols. We have also added a number of new features, including support for [glTF animations](gallery/modelAnimations.html), improved readability of symbols in vector tiles, and utilities for retrieving terrain elevation.

We hope you can build amazing things with it, and we look forward to your feedback and contributions.

## Highlights

* **3D models**
    * Added support for glTF animations to the [single model layer](/doc/single_model.html).
* **Terrain**
    * Added an option to disable DTM elevation being applied to the terrain for a given scene view.
    * Added a new API to [retrieve the terrain elevation](/doc/reference/HrzProtocol.ViewerService.md#method-GetTerrainElevation) at a given position.
    * The terrain resolution has been greatly improved by enabling by default the formerly experimental adaptive resolution feature.
* **Vector tiles**
    * Symbols are now culled when far off at the horizon to avoid cluttering.
    * The [flat overlay representation](/doc/flat_overlays.md) has been split into three: points, polylines, and polygons.
* **Rendering**
    * Multiview drawing order is now deterministic. When the viewports overlap, scene view 1 is drawn on top of scene view 0.
* **API**
    * The scene model now uses Protobuf's `oneof` feature to represent mutually exclusive fields, instead of using a `type` enum field paired with numbered optional fields.

> [Read the full changelog](doc/changelog.md#version-2600---2026-09-16)
>
> [See the release on GitHub](https://github.com/siradel-oss/horizon/releases/tag/v26.0.0)
