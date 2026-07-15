# Sentinel Sweep public site

Static GitHub Pages site for Sentinel Sweep support, privacy, privacy choices,
and open-source notices.

Public base URL:

`https://niko2756.github.io/sentinel-sweep-site/`

## Local preview

Because production links include the GitHub Pages project path, serve the
parent folder and open the project path:

```sh
cd /path/to/the/parent-folder
python3 -m http.server 4173
```

Then open:

`http://127.0.0.1:4173/sentinel-sweep-site/`

## Public pages

- `/support/`
- `/privacy/`
- `/privacy-choices/`
- `/privacy-contact/`
- `/open-source/`
- `/open-source/ffmpeg/8.1.2-sentinel-1/`

The versioned FFmpeg directory includes the matching source archive, license,
build script, configuration records, checksums, and source-offer page.

## Hosting

This repository is designed to publish from the `main` branch root with GitHub
Pages and enforced HTTPS. It has no framework, dependency install, analytics,
tracking script, form backend, or secret configuration.
