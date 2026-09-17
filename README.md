# Horizon OSS Site

Static site for the Horizon open-source project, built with [Hugo](https://gohugo.io/).

## Prerequisites

- [Node.js](https://nodejs.org/) 24+
- [Hugo Extended](https://gohugo.io/installation/) 0.162.1+

### Install Hugo (Extended)

Download and install Hugo Extended from https://github.com/gohugoio/hugo/releases.

## Setup

> [!NOTE]
> On Windows, use `npm` instead of `pnpm` on Windows. This is because of a Hugo issue.

```
pnpm install
```

## Fetching content

The documentation and gallery content are not stored in this repository. They are fetched from another source before building.

```
node scripts/fetch_content.js
```

You can also point it at local archive files or custom URLs:

```
node scripts/fetch_content.js --doc path/to/doc.tar.gz --gallery path/to/gallery.tar.gz
```

> [!NOTE]
> The fetched directories (`content/doc/`, `data/gallery/`, `static/gallery/`) are not committed to the repository and will be empty on a fresh clone.

## Development

```
pnpm dev
```

## Build

Build the static site into the `public/` directory:

```
hugo build
```

To build with a specific base URL (as done in CI):

```powershell
$env:HUGO_BASEURL="https://hrz.siradel.com/deployments/site/"; hugo build
```

## Deployment

The public site is deployed to GitHub Pages at https://siradel-oss.github.io/horizon by the "Deploy website" workflow of the [Horizon repository](https://github.com/siradel-oss/horizon). That workflow checks out this repository, fetches the documentation and the gallery from the assets of a Horizon release, builds the site and publishes it.

It is triggered manually, by giving the release tag to publish. See the ["Deploy the website to GitHub Pages" section of the open-source tooling documentation](https://github.com/siradel-oss/horizon/blob/main/doc/open_source.md#deploy-the-website-to-github-pages) for the procedure.

## Formatting

```
pnpm format
```

## Creating an article

```
hugo new content content/news/yyyy-mm-dd-title-slug/index.md

# Example:
hugo new content content/news/2026-09-17-version-26-0-0/index.md
```

Don't forget to edit the front matter and include a thumbnail.
Use one of the following categories:
- release
- technical
- community
- *add more here as the need arises*

Old articles (such as release notes) might have their links become broken.
This prevents the site from building.
You can accept links being broken for an article by adding `allow_broken_links = true` to the front matter. The link will appear red but the site will build.
