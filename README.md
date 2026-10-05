# Symphony Koss — Portfolio

A hand-made corkboard portfolio. Plain HTML/CSS/JS, no build step.

## Run locally

```sh
python3 tools/serve.py
# open http://localhost:8765
```

## Publishing

The site is hosted on GitHub Pages from the `main` branch of
[symphonyk/symphony-portfolio](https://github.com/symphonyk/symphony-portfolio) and served at
https://symphonykoss.com (set by the `CNAME` file). To update the live site, commit and push:

```sh
git add -A && git commit -m "Describe the change" && git push
```

GitHub rebuilds it in a minute or two.

## Structure

| Path | What it is |
|---|---|
| `index.html` | The corkboard landing page |
| `css/base.css` | Shared pieces: cork, pins, washi tape, polaroids, sticky notes |
| `css/board.css` | Corkboard layout, hover/click motion, mobile collage |
| `css/sheet.css` | Project and About pages: a paper sheet pinned over the cork |
| `css/espressivo.css` | Espressivo's decorate-the-table room |
| `js/board.js` | Click wiggle, "more projects in here!" envelope |
| `js/guestbook.js`, `css/guestbook.css` | "Thank You!" guest check: visitors' notes |
| `js/sheet.js` | Page fold-away when heading back to the board |
| `js/scrapbook.js` | Photo lightbox |
| `js/candy.js`, `js/espressivo.js` | Candy dispenser toy, Espressivo table items |
| `about/`, `projects/espressivo/` | Hand-written pages |
| `projects/*/` | Other project pages (generated, see below) |
| `assets/` | Images, videos, textures |
| `tools/sheet.py` | Builds the generated project pages |
| `tools/guestbook-apps-script.gs` | Google Sheet backend for the thank-you notes |

## Moving things on the board

### Edit mode (drag & drop)

1. `python3 tools/serve.py`
2. Open http://localhost:8765/?edit
3. Click an item to select it, then:
   - **drag** to move · **pink corner** to resize · **blue top dot** to rotate (Shift snaps to 5°)
   - arrows nudge (Shift = bigger) · `[` `]` rotate · `-` `=` resize · `f` / `b` bring to front / send back
4. **Save layout** writes the positions into `index.html`. Commit and push to publish.

Edit mode only saves through the local preview server; the live site can't be changed this way.

### By hand

Every item in `index.html` has inline CSS variables:

```html
<a class="item polaroid" href="about/" style="--x:3.5%; --y:17%; --w:14%; --r:-5deg;">
```

- `--x` / `--y` — position (percent of the board)
- `--w` — width (percent of the board)
- `--r` — tilt

## Adding a homey touch

Copy any item in `index.html`, give it new `--x/--y/--w/--r` values, and use
the building blocks from `css/base.css`:

- Pins: `<span class="pin pin--blue"></span>` (default red, or add blue, yellow, green, pink, purple)
- Tape: `<span class="tape tape--mint tape--tl"></span>` (mint, yellow, blue, plaid; top, tl, tr, bl, br)
- Frames: `.polaroid`, `.print`, `.sticky` (pink, blue)

Decorative items that aren't links can be a `<div class="item ...">` with `aria-hidden="true"`.

## Regenerating project pages

Headset Habitat, Spatulove, Candy Dispenser, Cherry and CupBoss are built by `tools/sheet.py`
from the `PAGES` entries at its top (text, photo rows, videos, process steps). Requires Python 3 with Pillow:

```sh
python3 -m pip install pillow
python3 tools/sheet.py cupboss      # or no argument to rebuild them all
```

Photos are `assets/img/<slug>-NN.jpg|webp`, referenced by number. Arrangements are small
`row(...)` / `col(...)` trees solved so every photo keeps its shape and rows line up. A page can
also list `fit` (cut-outs that sit straight on the paper), `crop` (aspect/focal point overrides),
a `demo` video on a film strip (optionally with the candy `toy`, driven by `js/candy.js`), and
`film` sections.

## Credits

- Cork, wood and paper textures: [ambientCG](https://ambientcg.com) (CC0)
- Golden Gate Bridge photo: Carol M. Highsmith, Library of Congress (public domain)

## Thank-you notes

Visitors' notes on the "Thank You!" guest check are saved in a Google Sheet.
Setup steps are at the top of `tools/guestbook-apps-script.gs`; paste the web
app URL into `NOTES_URL` in `js/guestbook.js`. Until then the check only works
on the local preview (notes are kept in that browser) and is hidden on the live site.

To take a note down, delete its row in the sheet's **Notes** tab (or type `x`
in its Hide column). It disappears from the site on the next page load.
