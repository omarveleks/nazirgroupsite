#!/usr/bin/env python3
"""Subset the self-hosted fonts to the characters the site uses and print fallback metrics.

The WOFF2 files are written to src/assets/fonts/ and inlined into the stylesheet at build
time, so text renders in its final font from the first paint (no font swap, no layout shift)."""
import pathlib, subprocess
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FS = ROOT / "node_modules" / "@fontsource"
OUT = ROOT / "src" / "assets" / "fonts"
# Exactly the characters the site uses (checked by the QA gate), so the fonts can be inlined in the CSS
UNICODES = "U+0020-007E,U+00A0,U+00A9,U+00B1,U+00B7,U+00FC,U+2013-2014,U+2018-201D,U+2026,U+203A"
FONTS = [
    ("fraunces/files/fraunces-latin-600-normal.woff2", "fraunces-600.woff2"),
    ("ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2", "plex-sans-400.woff2"),
    ("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2", "plex-sans-600.woff2"),
    ("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", "plex-mono-500.woff2"),
]
for src, dst in FONTS:
    subprocess.run(["pyftsubset", str(FS / src), f"--unicodes={UNICODES}", "--flavor=woff2",
                    "--layout-features=kern,liga,tnum", f"--output-file={OUT / dst}"], check=True)
    f = TTFont(OUT / dst)
    upm = f["head"].unitsPerEm
    os2, hhea = f["OS/2"], f["hhea"]
    cmap = f.getBestCmap(); hmtx = f["hmtx"]
    # average advance of lowercase text, weighted roughly like English
    sample = "the quick brown fox jumps over the lazy dog 1958 220 kV"
    w = sum(hmtx[cmap[ord(c)]][0] for c in sample) / len(sample) / upm
    print(f"{dst}: {(OUT/dst).stat().st_size} bytes  asc={hhea.ascent/upm:.4f} desc={-hhea.descent/upm:.4f} gap={hhea.lineGap/upm:.4f} avgw={w:.4f}")
