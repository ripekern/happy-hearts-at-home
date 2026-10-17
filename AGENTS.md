# Working notes — Happy Hearts at Home

A hand-written blog: static HTML, one stylesheet, two small scripts, no build step, no
dependencies, no analytics. Rewritten around the author's own writing in October 2026;
what follows is the part that is not obvious from the code.

## Layout

```
index.html              front page
blog.html               all posts, with tag filter
about.html              who is writing
404.html                noindex
posts/<slug>.html       one file per post
css/style.css           every colour and size in the site
js/theme.js             light/dark toggle
js/filter.js            tag filter on blog.html
feed.xml                RSS 2.0, keep in step with blog.html
favicon.svg
.inbox/                 untracked: source documents and media
```

`posts/` is the only directory with depth, so post pages use `../css/style.css`,
`../index.html` and siblings by bare filename. Everything at the root is flat.

### The posts, newest first

```
preparing-for-a-new-sibling 2023-01-16 family faith
at-9-43-in-the-evening     2019-08-19  birth faith
karis-at-dawn              2018-06-04  birth faith
why-are-you-so-worried     2017-10-09  faith loss
why-i-chose-a-midwife      2017-08-04  midwife birth
nine-weeks-and-three-days  2016-08-08  loss faith
```

The midwife essay is dated **ten months before Karis** — the author's instruction, and it
is the only date here that is not "a few weeks after the event". It is a Friday; every
other post is a Monday. Do not normalise it.

**Each post is dated to when the thing happened, not to when it was uploaded** — the loss
in August 2016, the dream in October 2017, Karis in June 2018, Hezekiah in August 2019,
the midwife essay after the second birth. The writing predates the site: her source files
carry modification dates from 2019 to 2022, so a 2026 upload date was fiction and the dates
are now consistent with the timeline. A new post gets the date of its event, snapped to a
Monday so the feed's RFC 822 weekday abbreviation is true.

The order is deliberately the order a reader needs them, not the order they were written:
the loss, then the midwife, then the dream, then the two births. The `post-nav` chain links
newest → older. A new post goes at the top of the list, takes over the newest `post-nav`
slot, and the old newest loses its "next" link — and because the midwife essay moved back
before Karis, the front page now shows the three newest (9:43, Karis, the dream) rather
than the midwife essay.

Tag vocabulary is **loss / faith / birth / midwife / family** — matching the chips in
`blog.html`. A new tag needs a chip, a `data-tags` entry, and a `.tags` list in the post.

## Scripture: KJV 1769, verified

The author originally wrote these quotations from the NIV. The published text carries the
**King James Pure Bible 1769** instead, and every quotation was checked with `purebible`
rather than typed from memory. House style follows the maspor project: `&ldquo;…&rdquo;`,
`&rsquo;`, `&mdash;`, en dash in ranges (`Psalm 139:13&ndash;16`), and the 1769 translators'
supplied words kept in brackets — `[and]`, `[that]`, `[members]` — never dropped.

Verify after any change to a quotation:

```python
import re, subprocess, pathlib, html

def norm(s):
    s = html.unescape(re.sub(r'<[^>]+>', '', s))
    for a, b in [('’',"'"), ('‘',"'"), ('—','-'), ('–','-')]:
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', re.sub(r'[\[\]]','',s).lower())).strip()

def kjv(ref):
    out = subprocess.run(['purebible','lookup','--no-color',ref],
                         capture_output=True, text=True).stdout
    lines = [re.sub(r'^\s*(?:Psalms?\s*)?\d+:\d+\s*','',l.strip()) for l in out.splitlines()]
    return ' '.join(l for l in lines if l)

for f in sorted(pathlib.Path('posts').glob('*.html')):
    for block in re.findall(r'<blockquote>(.*?)</blockquote>', f.read_text(encoding='utf-8'), re.S):
        cite = re.search(r'<cite>(.*?)</cite>', block, re.S)
        if not cite:            # a narrative pull quote, not a quotation
            continue
        ref = html.unescape(re.sub(r'<[^>]+>','',cite.group(1))).replace('–','-')
        text = re.sub(r'<cite>.*?</cite>','',block,flags=re.S)
        print('OK  ' if norm(text) in norm(kjv(ref)) else 'WRONG', f.name, ref)
```

Inline citations (`<cite>` inside a `<p>`) are not covered by that loop — check them by
eye against `purebible lookup`. Jeremiah 29:11 in the loss post is one of them.

## House rules for this site

These are the author's decisions, made in October 2026. Do not quietly undo them.

- **The midwife, her assistants and the emergency services are not named**, and neither is
  the birthing house. That is the same rule applied to a newer fact: the birthing house sits
  on the midwife's own land, so naming it names her. Say "a birthing house" and stop there.
- **Family names stay**: Karis, Hezekiah, Liberty, Khai. The cruise itinerary and the town
  are gone; "a ship", "a port abroad", "across the country" instead.
- **The husband is "my husband"** throughout. The source documents spell his name both
  "Sven" and "Swen"; rather than pick one, the posts sidestep it.
- **The author is Olivia Burgman**, from the About page of her own WordPress site (see
  below). Every post is bylined "Olivia Burgman" with an `OB` avatar. Note the spelling:
  the ultrasound print in `.inbox/media` says BERGMAN. Her own site says Burgman, so that
  is what the site uses — correct it if she says otherwise.
- **Every post about a birth carries a `.safety` note.** Sage, sans-serif, deliberately
  unlike her voice, so a reader cannot mistake it for the author. The 9:43 post's note
  says plainly that heavy bleeding means call an ambulance first, and that refusing one is
  not a decision to copy.
- **Medical claims are attributed, never asserted.** "The list I was given", "I pass it on
  as it was given to me, from my midwife, and I have not gone through those studies". Keep
  it that way; do not turn her experience back into a general claim about hospitals.

## Where the writing came from

`.inbox/` holds her source documents. Her **previous WordPress site** —
`happyheartsathome.com`, WooCommerce, block theme "HappyHeartsAtHome" — is referenced
here too. What survives of it, and what does not:

- **Used.** Her name and one-line bio, the "Welcome to our Family" mission paragraph, the
  subject list (motherhood, farm life, trades, homeschooling, home birth, fashion), the
  contact address `olivia@happyheartsathome.com`, and two verses: Proverbs 31:10, which
  was the old site's tagline, and 2 Corinthians 3:17, which led the old blog. Both now
  carry verified KJV text.
- **A second homepage capture exists** (3 October 2024, one blog post older) and shows one
  more thing: a menu branch called "Homemaking Organization" covering decor, cooking and
  meal planning, hospitality, and self-care. None of it is written yet — it is the obvious
  next block of posts, and it is hers, so ask before drafting in that voice.
- **Not used.** The store, cart, checkout and account pages — this site sells nothing and
  has no accounts. The old homepage also carries a generic keyword paragraph about
  motherhood and farming; the themes were kept as a topic list and the prose was dropped,
  because it reads like filler next to her real writing.
- **Missing.** Only the homepage is archived. The five old blog posts, the About, Contact
  and Useful Links pages, and the `faithfulAmericanMom` logo are all unarchived or the
  live domain is down, so none of their text has been recovered. If the Wayback Machine
  comes back with more snapshots, those are the URLs worth trying.

## Photographs

`images/` holds seven CC0 photographs: one banner per post, the front page feature, and the
About page. `images/CREDITS.md` records photographer, source, licence, original URL and the
exact delivered sizes for each. **Add a row when you add a picture.**

They were found through the Openverse API, which indexes CC0 work across Flickr, StockSnap
and others. Openverse rate-limits anonymous callers and answers `401` when you push it —
sleep six seconds between calls or you get throttled.

Two things to keep straight:

- **Sizes are honest, not upscaled.** Openverse serves these at roughly 960px on the long
  edge whatever the catalogue records, so the files are 960–1200px wide. Every crop happens
  offline with PIL to the ratio the page uses: 21:9 for post banners, 4:3 for the front
  page feature, 16:9 for About. Because the file on disk already has the right ratio, no
  `object-fit` is needed anywhere and the crops are deliberate rather than incidental.
- **`height: auto` on `.post-art img` and `.feature-art img` is load-bearing.** The
  `width`/`height` attributes are there to stop layout shift; the CSS override is what
  stops them winning over the container ratio. Drop either and the banner letterboxes.

Photographs are deliberately **excluded** from the dark-mode `filter` tint. The flat vector
art needs knocking back or it glows on a dark page; a real photograph does not, and the tint
turns it muddy.

Cards carry photographs too, cropped to 16:9 on disk the same way. The abstract SVG art that
used to sit there is gone; it survives only as an idea, and the `role="img"`/`aria-label`
pair it needed is now alt text.

**The licence column is not uniform, deliberately.** Post banners, the front page feature and
the About photo are CC0. The four new card photographs are Unsplash, which is free to use but
is *not* a public domain dedication. `images/CREDITS.md` says which is which, and a fifth
card reuses its own CC0 banner picture. Do not quietly mix a new licence in without writing
the row down.

## BirthPlan2023.odt never goes near the site

The 2023 birth plan sits in `.inbox/` and is the most identifying document in the project: full
names for her, her husband and the midwife, a PO box, two phone numbers, and the medical
preferences. None of it is published, none of it is quoted, and none of it goes into the
repository — `.inbox/` is gitignored and the site is a public repository. If she asks to publish
anything from it, read that paragraph back to her first.

## Media is staged, not published

`.inbox/media/` holds eight images extracted from the source documents. **None are wired
into the site.** One is a photograph of the author holding an ultrasound print with her
name, age and clinic visible; the others are family photographs and ultrasound images.
Publishing them is her decision, not a formatting one. When it is made, they go to
`images/` with real alt text, and the `alt` must describe the picture rather than the
feeling.

## Drafts come in as `.docx`

Drop Word or ODF documents in `.inbox/` and ask for them to be written up. Dot-prefixed,
invisible in listings, ignored by GitHub Pages, Netlify and Cloudflare Pages, and in
`.gitignore` so binaries never enter the repository.

It is **not** private: `python3 -m http.server` will hand over `.inbox/anything.docx` to
anyone who asks for that exact path. Nothing identifying belongs in it once published.

Extraction uses LibreOffice, which is installed (`pandoc` is not):

```
soffice --headless --convert-to html --outdir /tmp/hha-draft .inbox/post.docx
```

Then rewrite the result into the `.prose` pattern of an existing post. Keep her sentences;
fix spelling, tense and paragraphing. Do not tidy away repetition that is doing work, and
do not add anything she did not say — every post so far is her account, reorganised.

Two of the six files she supplied are byte-identical duplicates (`*-2.odt`). Check
`md5sum` before working through a batch.

## The stylesheet is the whole design system

All colour comes from the token block at the top of `css/style.css`; dark mode is a second
token block, nothing else. If you hard-code a colour in a page, dark mode breaks in one
place and nobody notices for weeks. Sizes use the `--step-*` scale and `--measure` (34rem)
for prose.

Prefers lots of pink.

### Three traps

- **`aspect-ratio` plus `height: auto`.** `.card-art`, `.feature-art` and `.post-art` set
  `aspect-ratio` and the SVGs inside are `width: 100%; height: 100%`. Do not add a `height`
  attribute to an `<svg>`: a presentational height wins over the aspect ratio and the crop
  is silently lost.
- **Dark-mode artwork tint.** The artwork is painted in light, paper-toned gradients; dark
  mode knocks it back with a `filter` on the SVG. A new artwork container must be added to
  that `[data-theme="dark"]` selector list or it will glow on the dark page.
- **`.meta` is deliberately not flex.** The date and the category are inline text with a
  `.cat` span. As flex items each became unbreakable and wrapped into a two-line stack on
  the narrow card columns.
- **SVG gradient ids must be unique per page.** Two cards sharing `id="art1"` share the
  first definition and the second artwork renders in the wrong colours.

## House voice

Warm, plain, first person, specific, and Christian without being loud about it — God is
named plainly and never quoted second-hand. Every post says what actually happened,
including the part that did not work, and names its own limits ("I have no idea whether she
learned it from me"). No advice-giving, no course, no before-and-after. `en-GB` spelling;
`&rsquo;`, `&mdash;`, `&hellip;` entities in prose.

## Checking your work

```
python3 -m http.server 8731 &
chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --blink-settings=preferredColorScheme=1 --window-size=1280,1600 \
  --screenshot=shot.png --virtual-time-budget=6000 'http://localhost:8731/blog.html'
```

Always look at **both** schemes: `preferredColorScheme=1` is light, omitting the flag
gives dark. Measure, do not eyeball — for layout questions inject a script that replaces
`document.body` with computed rects and read the numbers out of `--dump-dom`.

## Before committing

```
python3 - <<'PY'
import pathlib, re, xml.etree.ElementTree as ET
bad = []
for f in sorted(pathlib.Path('.').rglob('*.html')):
    if '.inbox' in f.parts: continue
    h = f.read_text(encoding='utf-8')
    for ref in re.findall(r'(?:href|src)="([^"#][^"]*)"', h):
        if ref.startswith(('http', 'mailto:', 'data:')): continue
        if not (f.parent / ref).resolve().exists(): bad.append(f'{f}: missing {ref}')
    if len(re.findall(r'<h1[\s>]', h)) != 1: bad.append(f'{f}: not exactly one h1')
    if re.search(r'<img(?![^>]*alt=)', h): bad.append(f'{f}: <img> without alt')
ET.parse('feed.xml')
print('\n'.join(bad) or 'ok')
PY
```

It has caught every broken link, including `blog.html` written from the wrong directory
(`href="../index.html"` in a file that sits at the root).

## Things that are still placeholders

- **The live URL is `https://happyheartsathome.com/`**, set as a
  hard-coded `BASE` in `feed.xml`, `sitemap.xml`, `robots.txt` and every `canonical` /
  `og:url`. Change all four places together if it moves — a custom domain on a CNAME will
  mean rewriting them, and forgetting one leaves a canonical pointing at github.io, which
  is worse than having none.
- The contact address is now the real one, `olivia@happyheartsathome.com`, taken from the
  old site. It appears in every page footer.
- The blog index says "Five posts". Update it when that changes.
- The signup form posts nowhere (`<form action="#">`).