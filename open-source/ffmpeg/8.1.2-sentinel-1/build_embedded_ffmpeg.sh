#!/bin/bash

set -euo pipefail

# Sentinel Sweep's embedded decoder is intentionally built from unmodified
# upstream FFmpeg source with LGPL-only configuration. It does not enable GPL,
# nonfree, network, capture-device, or third-party codec-library components.
FFMPEG_VERSION="8.1.2"
FFMPEG_ARCHIVE="ffmpeg-${FFMPEG_VERSION}.tar.xz"
FFMPEG_SOURCE_URL="https://ffmpeg.org/releases/${FFMPEG_ARCHIVE}"
FFMPEG_ARCHIVE_SHA256="464beb5e7bf0c311e68b45ae2f04e9cc2af88851abb4082231742a74d97b524c"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# FFmpeg's configure script rejects out-of-tree source paths containing
# whitespace. Keep compilation in a temporary path even when the repository
# itself (such as "Mac File Copying App") contains spaces.
WORK_ROOT="${FFMPEG_BUILD_ROOT:-${TMPDIR:-/private/tmp}/SentinelSweep-Embedded-FFmpeg}"
DOWNLOAD_DIR="${WORK_ROOT}/downloads"
SOURCE_DIR="${WORK_ROOT}/source/ffmpeg-${FFMPEG_VERSION}"
BUILD_DIR="${WORK_ROOT}/build"
INSTALL_DIR="${WORK_ROOT}/install"
SOURCE_OFFER_DIR="${FFMPEG_SOURCE_OFFER_DIR:-${ROOT_DIR}/.build/embedded-ffmpeg/source-offer}"
STAGE_DIR="${FFMPEG_STAGE_DIR:-${ROOT_DIR}/Vendor/FFmpeg/bin}"
MACOS_DEPLOYMENT_TARGET="${MACOSX_DEPLOYMENT_TARGET:-14.0}"
ARCH_LIST="${ARCHS:-$(uname -m)}"
if [[ -z "${JOBS:-}" ]]; then
  JOBS="$(sysctl -n hw.ncpu 2>/dev/null || getconf _NPROCESSORS_ONLN 2>/dev/null || printf '4')"
fi

if [[ "$WORK_ROOT" == *" "* ]]; then
  echo "FFMPEG_BUILD_ROOT cannot contain spaces: $WORK_ROOT" >&2
  exit 1
fi

for command in curl shasum tar make xcrun; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Missing required build tool: $command" >&2
    exit 1
  fi
done

mkdir -p "$DOWNLOAD_DIR" "$SOURCE_OFFER_DIR" "$STAGE_DIR"
ARCHIVE_PATH="${DOWNLOAD_DIR}/${FFMPEG_ARCHIVE}"

if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "Downloading FFmpeg ${FFMPEG_VERSION} source from ffmpeg.org..."
  curl --fail --location --proto '=https' --tlsv1.2 \
    "$FFMPEG_SOURCE_URL" \
    --output "$ARCHIVE_PATH"
fi

ACTUAL_SHA256="$(shasum -a 256 "$ARCHIVE_PATH" | awk '{print $1}')"
if [[ "$ACTUAL_SHA256" != "$FFMPEG_ARCHIVE_SHA256" ]]; then
  echo "FFmpeg source checksum mismatch." >&2
  echo "Expected: $FFMPEG_ARCHIVE_SHA256" >&2
  echo "Actual:   $ACTUAL_SHA256" >&2
  exit 1
fi

rm -rf "${WORK_ROOT}/source" "$BUILD_DIR" "$INSTALL_DIR"
mkdir -p "${WORK_ROOT}/source" "$BUILD_DIR" "$INSTALL_DIR"
tar -xf "$ARCHIVE_PATH" -C "${WORK_ROOT}/source"

SDKROOT="$(xcrun --sdk macosx --show-sdk-path)"
CLANG="$(xcrun --sdk macosx --find clang)"
HOST_ARCH="$(uname -m)"
BUILT_FFMPEG=()
BUILT_FFPROBE=()

for arch in $ARCH_LIST; do
  case "$arch" in
    arm64|x86_64) ;;
    *)
      echo "Unsupported architecture: $arch (expected arm64 or x86_64)" >&2
      exit 1
      ;;
  esac

  ARCH_BUILD_DIR="${BUILD_DIR}/${arch}"
  ARCH_INSTALL_DIR="${INSTALL_DIR}/${arch}"
  mkdir -p "$ARCH_BUILD_DIR" "$ARCH_INSTALL_DIR"

  CONFIGURE_ARGUMENTS=(
    "--prefix=${ARCH_INSTALL_DIR}"
    "--target-os=darwin"
    "--arch=${arch}"
    "--cc=${CLANG}"
    "--host-cc=${CLANG}"
    "--host-ld=${CLANG}"
    "--host-cflags=--sysroot=${SDKROOT}"
    "--host-ldflags=--sysroot=${SDKROOT}"
    "--sysroot=${SDKROOT}"
    "--extra-cflags=-arch ${arch} -mmacosx-version-min=${MACOS_DEPLOYMENT_TARGET}"
    "--extra-ldflags=-arch ${arch} -mmacosx-version-min=${MACOS_DEPLOYMENT_TARGET}"
    "--disable-everything"
    "--disable-autodetect"
    "--disable-doc"
    "--disable-debug"
    "--disable-network"
    "--disable-avdevice"
    "--disable-swresample"
    "--disable-shared"
    "--enable-static"
    "--enable-small"
    "--enable-ffmpeg"
    "--enable-ffprobe"
    "--enable-avcodec"
    "--enable-avformat"
    "--enable-avfilter"
    "--enable-swscale"
    "--enable-protocol=file,pipe"
    "--enable-demuxer=avi,asf,matroska,mov,mpegts,mpegps,mpegvideo,flv,ogg,rm,image2,gif,apng,mxf,nut,dv"
    "--enable-decoder=h264,hevc,av1,vp8,vp9,mpeg4,mpeg2video,mpeg1video,msmpeg4v1,msmpeg4v2,msmpeg4v3,wmv1,wmv2,wmv3,vc1,theora,mjpeg,mjpegb,gif,prores,dnxhd,h263,h263i,flv,cinepak,svq1,svq3,indeo3,indeo5,rv10,rv20,rv30,rv40,rawvideo,ffv1,huffyuv"
    "--enable-parser=h264,hevc,av1,vp8,vp9,mpeg4video,mpegvideo,vc1,vp3,mjpeg"
    "--enable-filter=scale"
    "--enable-muxer=image2"
    "--enable-encoder=mjpeg"
  )

  if [[ "$arch" != "$HOST_ARCH" ]]; then
    CONFIGURE_ARGUMENTS+=("--enable-cross-compile")
  fi
  if [[ "$arch" == "x86_64" ]]; then
    # Xcode does not ship nasm. Disabling the optional external x86 assembler
    # keeps the release build reproducible on a clean Xcode installation.
    CONFIGURE_ARGUMENTS+=("--disable-x86asm")
  fi

  echo "Configuring LGPL-only FFmpeg ${FFMPEG_VERSION} for ${arch}..."
  (
    cd "$ARCH_BUILD_DIR"
    "${SOURCE_DIR}/configure" "${CONFIGURE_ARGUMENTS[@]}" \
      | tee "configure-output.txt"
  )

  if ! grep -q "License: LGPL version 2.1 or later" "${ARCH_BUILD_DIR}/configure-output.txt"; then
    echo "FFmpeg configure did not report the required LGPL license." >&2
    exit 1
  fi

  MAKE_LOG="${ARCH_BUILD_DIR}/make-output.txt"
  if ! make --silent -C "$ARCH_BUILD_DIR" -j "$JOBS" > "$MAKE_LOG" 2>&1; then
    echo "FFmpeg compilation failed for ${arch}. Last build messages:" >&2
    tail -80 "$MAKE_LOG" >&2
    exit 1
  fi
  if ! make --silent -C "$ARCH_BUILD_DIR" install >> "$MAKE_LOG" 2>&1; then
    echo "FFmpeg installation failed for ${arch}. Last build messages:" >&2
    tail -80 "$MAKE_LOG" >&2
    exit 1
  fi

  BUILT_FFMPEG+=("${ARCH_INSTALL_DIR}/bin/ffmpeg")
  BUILT_FFPROBE+=("${ARCH_INSTALL_DIR}/bin/ffprobe")
done

stage_executable() {
  local output_name="$1"
  shift
  local inputs=("$@")

  if [[ "${#inputs[@]}" -eq 1 ]]; then
    install -m 0755 "${inputs[0]}" "${STAGE_DIR}/${output_name}"
  else
    xcrun lipo -create "${inputs[@]}" -output "${STAGE_DIR}/${output_name}"
    chmod 0755 "${STAGE_DIR}/${output_name}"
  fi
}

stage_executable "ffmpeg" "${BUILT_FFMPEG[@]}"
stage_executable "ffprobe" "${BUILT_FFPROBE[@]}"

for executable in ffmpeg ffprobe; do
  if "${STAGE_DIR}/${executable}" -buildconf 2>&1 | grep -q -- '--enable-gpl'; then
    echo "Refusing to stage ${executable}: GPL components are enabled." >&2
    exit 1
  fi
  if "${STAGE_DIR}/${executable}" -buildconf 2>&1 | grep -q -- '--enable-nonfree'; then
    echo "Refusing to stage ${executable}: nonfree components are enabled." >&2
    exit 1
  fi
done

# Produce the exact material required for Sentinel Sweep's FFmpeg source offer.
# Publish this directory at the stable source URL named in the release notice.
rm -rf "$SOURCE_OFFER_DIR"
mkdir -p "$SOURCE_OFFER_DIR/configurations"
install -m 0644 "$ARCHIVE_PATH" "${SOURCE_OFFER_DIR}/${FFMPEG_ARCHIVE}"
install -m 0644 "${SOURCE_DIR}/COPYING.LGPLv2.1" "${SOURCE_OFFER_DIR}/COPYING.LGPLv2.1"
for arch in $ARCH_LIST; do
  install -m 0644 \
    "${BUILD_DIR}/${arch}/configure-output.txt" \
    "${SOURCE_OFFER_DIR}/configurations/${arch}.txt"
done
printf '%s\n' \
  "Sentinel Sweep FFmpeg source offer" \
  "Upstream version: ${FFMPEG_VERSION}" \
  "Upstream archive: ${FFMPEG_SOURCE_URL}" \
  "Archive SHA-256: ${FFMPEG_ARCHIVE_SHA256}" \
  "Local modifications: none" \
  "Build script: script/build_embedded_ffmpeg.sh" \
  > "${SOURCE_OFFER_DIR}/BUILD-INFO.txt"
(
  cd "$SOURCE_OFFER_DIR"
  shasum -a 256 "$FFMPEG_ARCHIVE" > SHA256SUMS
)

echo "Embedded FFmpeg helpers staged at: ${STAGE_DIR}"
echo "Matching source-offer material staged at: ${SOURCE_OFFER_DIR}"
echo "The app release pipeline must sign both helpers before signing the app bundle."
