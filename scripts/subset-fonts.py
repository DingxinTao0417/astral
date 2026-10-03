"""把思源宋体（Noto Serif SC）裁成只含站内标题用字的子集，输出 woff2。

标题用字来自 src/content/site.ts 里的 displayText。
源字体用的是 Windows 11 自带的 NotoSerifSC-VF.ttf（SIL OFL 授权，可嵌入网页）。
依赖：pip install fonttools brotli
用法：npm run fonts
"""

import subprocess
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(r"C:\Windows\Fonts\NotoSerifSC-VF.ttf")
OUT = ROOT / "src" / "assets" / "fonts" / "noto-serif-sc-sub.woff2"

# 和 src/index.css 里 @font-face 的 unicode-range 保持一致
RANGES = [(0x0020, 0x007E), (0x2014, 0x2014), (0x2018, 0x201D), (0x2026, 0x2026),
          (0x3000, 0x303F), (0x4E00, 0x9FFF), (0xFF00, 0xFFEF)]
# 标点、英文字母和数字始终带上，避免标题里临时加字时掉字
ALWAYS = "，。、；：？！「」『』《》（）·—…" + "".join(chr(c) for c in range(0x20, 0x7F))


def display_text() -> str:
    script = "import('./src/content/site.ts').then(m => process.stdout.write(m.displayText))"
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT, capture_output=True, encoding="utf-8", check=True,
    )
    return result.stdout


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    if not SOURCE.exists():
        sys.exit(f"找不到源字体：{SOURCE}")

    chars = sorted({
        c for c in display_text() + ALWAYS
        if any(lo <= ord(c) <= hi for lo, hi in RANGES)
    })
    cjk = [c for c in chars if ord(c) > 0x7E]

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["locl", "ccmp", "kern", "palt", "halt"]
    options.name_IDs = [1, 2, 4, 6]
    options.hinting = False
    options.notdef_outline = True

    font = TTFont(SOURCE)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=[ord(c) for c in chars])
    subsetter.subset(font)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(OUT)
    print(f"{len(cjk)} 个汉字和标点 + 英文数字 → {OUT.relative_to(ROOT)}（{OUT.stat().st_size / 1024:.1f} KB）")
    print("".join(cjk))


if __name__ == "__main__":
    main()
