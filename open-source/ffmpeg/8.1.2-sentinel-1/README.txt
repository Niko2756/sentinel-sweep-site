Sentinel Sweep FFmpeg 8.1.2 source and build package
====================================================

This directory supplies the complete corresponding FFmpeg source and the
build materials for the ffmpeg and ffprobe helper programs distributed with
Sentinel Sweep release identifier 8.1.2-sentinel-1.

Contents
--------

ffmpeg-8.1.2.tar.xz
  Unmodified upstream FFmpeg source archive.

COPYING.LGPLv2.1
  GNU Lesser General Public License version 2.1 text from the archive.

build_embedded_ffmpeg.sh
  The build script used to configure, compile, combine, and stage the helpers.

configure-summary-arm64.txt and configure-summary-x86_64.txt
  Configure output recorded when each architecture was built.

buildconf-arm64.txt and buildconf-x86_64.txt
  The configuration embedded in each architecture slice, reported by the
  distributed ffmpeg binary with the -buildconf option.

BUILD-INFO.txt
  Release, version, license, architecture, and binary checksum facts.

MODIFICATIONS.txt
  Statement describing local source modifications. There were none.

SHA256SUMS
  SHA-256 checksums for the files in this package.

Rebuilding on macOS
-------------------

Requirements:
- macOS with Xcode command-line build tools and the macOS SDK
- curl, shasum, tar, make, and xcrun
- enough free space to compile arm64 and x86_64 FFmpeg slices

The build script verifies the source archive checksum. To rebuild from the
archive supplied here without downloading it again, first put the archive in
the build script's expected download directory:

  export FFMPEG_BUILD_ROOT=/private/tmp/SentinelSweep-Embedded-FFmpeg
  mkdir -p "$FFMPEG_BUILD_ROOT/downloads"
  cp ffmpeg-8.1.2.tar.xz "$FFMPEG_BUILD_ROOT/downloads/"

Then run the script from this directory and direct its output to a separate
folder so this source package is not replaced:

  ARCHS="arm64 x86_64" \
  FFMPEG_STAGE_DIR="$PWD/rebuilt/bin" \
  FFMPEG_SOURCE_OFFER_DIR="$PWD/rebuilt/source-offer" \
  ./build_embedded_ffmpeg.sh

Build paths and SDK patch versions are expected to differ on another Mac.
The configuration selections, FFmpeg source checksum, enabled components, and
reported LGPL license should match the records supplied here.

Questions
---------

Email SentinelSweepSupport@gmail.com with the Sentinel Sweep version and the
name of the source-package file you are asking about.
