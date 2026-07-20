# Sentinel Sweep public site

Static GitHub Pages site for Sentinel Sweep pricing, purchase and beta support,
privacy, privacy choices, and open-source notices.

## Customer-facing access model

The site follows the implemented StoreKit cutoff in the app: scanning, review,
learning, and manual transfer-queue planning are free. The one-time Transfer
Access purchase unlocks Quick Copy, Quick Move, the final Review Transfer screen,
and all new Copy and Move transfers. A purchase or restore never starts or
repeats a file operation automatically. Pause, resume, cancel, recovery, History,
and eligible Undo remain available for work already begun.

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

- `/pricing/`
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
