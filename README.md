# Sentinel Sweep public site

Static GitHub Pages launch site for Sentinel Sweep product information, pricing,
support, privacy, privacy choices, and open-source notices.

## Customer-facing access model

The site follows the implemented StoreKit cutoff in the app: scanning, review,
learning, and manual transfer-queue planning are free. The one-time Transfer
Access purchase unlocks Quick Copy, Quick Move, the final Review Transfer screen,
and all new Copy and Move transfers. A purchase or restore never starts or
repeats a file operation automatically. Pause, resume, cancel, recovery, History,
and eligible Undo remain available for work already begun.

Sentinel Sweep is a free Mac App Store download. Lifetime Transfer Access is a
US$9.99 non-consumable in-app purchase in the U.S. App Store, with local pricing
set by Apple by country or region. There is no subscription.

Public base URL:

`https://niko2756.github.io/sentinel-sweep-site/`

Mac App Store URL:

`https://apps.apple.com/app/id6790672917`

## Local preview

Because production links include the GitHub Pages project path, serve the
parent folder and open the project path:

```sh
cd /path/to/the/parent-folder
python3 -m http.server 4173
```

Then open:

`http://127.0.0.1:4173/sentinel-sweep-site/`

## Homepage screenshot gallery

The homepage uses deterministic 1440 × 900 RGB PNG exports from the verified app
bundle. The launch sequence shows choosing a source, reviewing results, planning
a transfer, understanding a result, local privacy controls, and transfer history.
The Review screen comes from a completed 2,107-file privacy-safe scan: 24 High,
16 Likely, 96 Review, and 1,971 Safe. Public crops remove the local source path
while preserving the actual app UI and counts.

- `assets/launch-choose.png`
- `assets/launch-review.png`
- `assets/launch-transfer.png`
- `assets/launch-explain.png`
- `assets/launch-privacy.png`
- `assets/launch-history.png`

The source captures, composition script, manifest, and provenance notes remain
in the private application workspace under `Docs/AppStoreAssets/ProductScreenshots/`.

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
