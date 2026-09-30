#!/usr/bin/env python3
"""Subset the self-hosted fonts to the characters the site uses and print fallback metrics.

The WOFF2 files are written to src/assets/fonts/ and inlined into the stylesheet at build
time, so text renders in its final font from the first paint (no font swap, no layout shift).
The printed size-adjust values are for the Arial fallbacks declared in global.css."""
import pathlib, subprocess
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FS = ROOT / "node_modules" / "@fontsource"
OUT = ROOT / "src" / "assets" / "fonts"
# Exactly the characters the site uses (checked by the QA gate), so the fonts can be inlined in the CSS
UNICODES = "U+0020-007E,U+00A0,U+00A9,U+00B1,U+00B7,U+00FC,U+2013-2014,U+2018-201D,U+2026,U+203A"
# The serif is used for one italic accent word per page: letters only
SERIF_UNICODES = "U+0020,U+0041-005A,U+0061-007A"
FONTS = [
    ("inter-tight/files/inter-tight-latin-300-normal.woff2", "inter-tight-300.woff2", UNICODES),
    ("inter-tight/files/inter-tight-latin-400-normal.woff2", "inter-tight-400.woff2", UNICODES),
    ("inter-tight/files/inter-tight-latin-600-normal.woff2", "inter-tight-600.woff2", UNICODES),
    ("inter/files/inter-latin-300-normal.woff2", "inter-300.woff2", UNICODES),
    ("inter/files/inter-latin-500-normal.woff2", "inter-500.woff2", UNICODES),
    ("instrument-serif/files/instrument-serif-latin-400-italic.woff2", "instrument-serif-italic.woff2", SERIF_UNICODES),
]
# Average advance of the same sample in Arial (regular / bold), per em
ARIAL = {"regular": 0.4611, "bold": 0.4921}
OUT.mkdir(parents=True, exist_ok=True)
for old in OUT.glob("*.woff2"):
    old.unlink()
for src, dst, uni in FONTS:
    subprocess.run(["pyftsubset", str(FS / src), f"--unicodes={uni}", "--flavor=woff2",
                    "--layout-features=kern,liga,tnum", f"--output-file={OUT / dst}"], check=True)
    f = TTFont(OUT / dst)
    upm = f["head"].unitsPerEm
    hhea = f["hhea"]
    cmap = f.getBestCmap(); hmtx = f["hmtx"]
    sample = "the quick brown fox jumps over the lazy dog" if "serif" in dst else "the quick brown fox jumps over the lazy dog 1958 220 kV"
    w = sum(hmtx[cmap[ord(c)]][0] for c in sample) / len(sample) / upm
    ref = ARIAL["bold" if "600" in dst else "regular"]
    adj = w / ref
    print(f"{dst}: {(OUT/dst).stat().st_size} bytes  size-adjust={adj*100:.1f}%  "
          f"ascent={hhea.ascent/upm/adj*100:.1f}%  descent={-hhea.descent/upm/adj*100:.1f}%  gap={hhea.lineGap/upm/adj*100:.1f}%")
