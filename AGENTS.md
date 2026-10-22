# Working notes — Happy Hearts at Home

A hand-written blog: static HTML, one stylesheet, two small scripts, no build step, no
dependencies, no analytics. Rewritten around the author's own writing in October 2026;
what follows is the part that is not obvious from the code.

## Layout

```
index.html              front page
blog.html               all posts, with tag filter
about.html              who is writing
homeschooling.html       Abeka, digital lessons, and the material they make
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

`homeschooling.html` is a page, not a post: it is in the nav and the footer of every page,
it has no `post-nav` chain and no feed entry, and its date is the day it was written. The
give-money section on it has **no payment link yet** — the button is a mailto, on purpose.
See below.

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

## The footer's media query lives at the end of the stylesheet

`.footer-inner` is a two-column grid that collapses to one at 52rem. That media query
**must stay last in the file**. The `.footer-verse` rules declare `text-align: right`, and
source order beats equal specificity, so a query sitting above them declared
`text-align: left` and did nothing at all. It looked fine at 1280px and quietly did nothing
on every phone, which is what "the footer loses formatting when I shrink the page" turned out
to mean.

Also: the footer is a grid, not flex. With flex and large `flex-basis` values the two blocks
wrapped at unpredictable widths and the right column dropped below the left one.

Check it by screenshotting the footer alone at 1280 / 1000 / 860 / 700 / 500px — inject
`.site-header,main{display:none!important}` into a throwaway copy, and use a fresh
`--user-data-dir` or the browser will serve you a cached stylesheet and lie to you. It lied
twice during this fix.

## Unsplash downloads: use `fit=crop`, not `fit=max`

The download URLs in this project's history used `fit=max&w=1600`, which **pads the
image to the requested width with black bars** and the bars get saved into the file. The
homeschooling banner shipped with two black stripes down each side until it was noticed in
a screenshot. Use explicit dimensions with `fit=crop` instead:

```
...?w=1600&h=686&fit=crop&crop=entropy&q=82&fm=jpg
```

Look at the saved file, not the source page, after every download.

## One verse per page, in the footer

Every page carries a verse in its footer, and **no two pages share one**. Ten are spoken
for. A new page needs a new verse, so check this table before picking one:

| page | verse |
|---|---|
| `index.html` | Psalm 127:3 — children as an heritage |
| `blog.html` | Ecclesiastes 3:11 — everything beautiful in its time |
| `about.html` | Proverbs 31:28 — her children call her blessed |
| `404.html` | Psalm 119:105 — a lamp unto my feet |
| `posts/nine-weeks-and-three-days.html` | Psalm 34:18 — nigh to the broken heart |
| `posts/why-are-you-so-worried.html` | Isaiah 26:3 — perfect peace |
| `posts/karis-at-dawn.html` | Psalm 30:5 — joy cometh in the morning |
| `posts/at-9-43-in-the-evening.html` | Isaiah 43:2 — through the fire |
| `posts/why-i-chose-a-midwife.html` | Proverbs 15:1 — a soft answer turneth away wrath |
| `posts/preparing-for-a-new-sibling.html` | Proverbs 22:6 — train up a child |
| `homeschooling.html` | Proverbs 1:8 — hear the instruction of thy father |

All ten are KJV 1769, checked against `purebible`, with the translators' supplied words in
brackets kept. Two are quoted in part and marked with `&hellip;`: Ecclesiastes 3:11 stops
after "in his time", and Isaiah 43:2 gives only the fire clause. Do not silently drop an
ellipsis to make a quote look complete.

The verses are chosen to suit the page — the broken heart on the loss post, the morning on
the one titled *at dawn*. Keep that habit: a new post gets a verse that belongs to it, and
the safety note on a birth post is deliberately **not** the verse, because green has to stay
unique to that one block.

## House rules for this site

These are the author's decisions, made in October 2026. Do not quietly undo them.

- **The posts use her source text, verbatim.** In October 2026 she asked for the blog's
  language to match the articles in `.inbox/`. Keep her sentences, spelling, grammar and
  names; only paragraphing and the HTML around them change. Do not rewrite her into a
  smoother editorial voice, and do not add anything she did not write.
- **Names are published as she wrote them**, in October 2026: the midwife Beth, her
  assistant Linda, and her husband Sven (the source also spells it "Swen" in one place;
  leave each occurrence as written). This replaces the earlier rule that hid them. The
  2023 birth plan still never goes near the site — see below.
- **Family names stay**: Karis, Hezekiah, Liberty, Khai.
- **The author is Olivia Burgman**, from the About page of her own WordPress site (see
  below). Every post is bylined "Olivia Burgman" with an `OB` avatar. Note the spelling:
  the ultrasound print in `.inbox/media` says BERGMAN. Her own site says Burgman, so that
  is what the site uses — correct it if she says otherwise.
- **Every post about a birth carries a `.safety` note.** Sage, sans-serif, deliberately
  unlike her voice, so a reader cannot mistake it for the author. The 9:43 post's note
  says plainly that heavy bleeding means call an ambulance first, and that refusing one is
  not a decision to copy. These notes are the site's own editorial addition; they are not
  part of her source text.
- **Her medical claims stand as she wrote them.** The midwife post reproduces her list of
  outcomes without the site softening it into attribution, because verbatim is what she
  asked for. Do not add caveats inside her paragraphs; the `.safety` note is where the
  site speaks.

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

`images/` holds the CC0 photographs — one banner per post, the front page feature and the
About page — plus the family photographs taken from her own source documents. CC0 and
"hers" are recorded separately in `images/CREDITS.md`; **add a row when you add a
picture.**

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
is *not* a public domain dedication. The six pictures inside the three posts that came from
`home_birth_article.docx` are her own photographs, not CC0 at all. `images/CREDITS.md` says
which is which, and a fifth card reuses its own CC0 banner picture. Do not quietly mix a new
licence in without writing the row down.

## The donation button is a mailto until a real payment link exists

The old WordPress site took cryptocurrency through a WooCommerce gateway. On this site the
"help pay for the next of it" section points at `mailto:` and says so in as many words —
no dead button, no invented Stripe link. When she sends a real one, swap the single
`.btn` in `homeschooling.html` for a Stripe Payment Link, PayPal or Coinbase Commerce URL,
and delete the paragraph that explains the button is not live yet.

Nothing else on the site takes money, and nothing ever will without her saying so. If a
donation form is ever added it needs a backend — a static site has nowhere to post to.

## BirthPlan2023.odt never goes near the site

The 2023 birth plan sits in `.inbox/` and is the most identifying document in the project: full
names for her, her husband and the midwife, a PO box, two phone numbers, and the medical
preferences. None of it is published, none of it is quoted, and none of it goes into the
repository — `.inbox/` is gitignored and the site is a public repository. If she asks to publish
anything from it, read that paragraph back to her first.

## Media from the source documents

In October 2026 she asked for the source article's pictures to be placed in the posts at
the same points they occupy in the text, and chose to publish them exactly as they are —
including the ultrasound print with her name, date of birth and clinic visible. Six of the
eight files in `.inbox/media/` are now in `images/`:

```
hello-baby.png         ultrasound-or-photo-2.png
baby-khai.png          ultrasound-or-photo-3.png
divider.gif            small-gif-unknown.gif
letter-photo.jpg       couple-or-family-3.jpg
ultrasound-holding.jpg ultrasound-holding-photo.jpg
birth-photo.jpg        couple-or-family-2.jpg
```

`couple-holding-bags.png` and the duplicate `ultrasound-or-photo-4.png` are still staged
and unpublished. New pictures go to `images/` with alt text that describes the picture
rather than the feeling; the alt text on these six is deliberately plain and should be
replaced with a closer description if she supplies one.

They sit in the text with `.post-figure` (full width) or `.post-figure--left` (set beside
the paragraph, unfloated below 34rem). The old `<div class="prose">` body still has no
`object-fit`, so the intrinsic ratio of each picture is kept rather than cropped.

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

Then put the result into the `.prose` pattern of an existing post **without rewriting it**.
Her sentences, spelling, grammar and names stay as written; change only paragraph breaks
and the HTML markup, and drop obvious draft furniture such as `(insert picture here)`,
`(link here)` and bare outline labels (`Topic1`, `Subtopic1`). Do not add anything she did
not write. The midwife article arrived as an outline, so its real headings are kept and
its planning labels are not.

Two of the six files she supplied are byte-identical duplicates (`*-2.odt`). Check
`md5sum` before working through a batch.

## The palette is pink, and the dial is four lines

**Pastel pink**, over blush paper and a plum-tinted ink. The author asked for "more pink",
then for "more of a pastel pink", in October 2026; this is the second answer, and it replaced
both an earlier terracotta-and-cream palette and a first, too-saturated rose.

Light: `--rose #f3b7cd` (fills, borders, washes), `--rose-deep #a83a63` (every piece of
text that is pink), `--rose-wash #fbe7ef`, `--paper #fdf3f6`.
Dark: `--rose #f0a9c4`, `--rose-deep #f7bfd3`, `--rose-wash #2f2129`, `--paper #1d161a`.

**`--rose` is a pastel and must never be used for text on light mode** — at that lightness it
is 1.9:1 against the paper. That is why `a:hover` thickens its underline instead of
lightening. Pink text is always `--rose-deep`.

`--ink-faint` is `#78636b`, not something prettier. The dates and citations use it, and at
`#957f88` it measured 3.4:1 on the paper — under the 4.5:1 that small text needs. Every
pink-on-pink pair in both modes was measured, not eyeballed.

If she asks for more or less again, only these four values need to move, in both token
blocks: `--rose`, `--rose-deep`, `--rose-wash`, and `--paper-2`. Nothing in any page is
hard-coded, so the whole site follows them.

**Sage is not decorative.** `--sage` and `--sage-wash` now serve exactly one thing: the
`.safety` note, which has to look like the site's own voice rather than the author's, and
green is how a reader tells the difference. Do not spend it on tags or the hero — those
went pink, and the hero's second radial uses `--lilac` instead.

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

The posts are **her voice, not the site's**: warm, plain, first person, specific, and
Christian without being loud about it. Since October 2026 they carry her source sentences
verbatim, including her American spelling ("labor", "hemorrhaging"), her grammar and her
names, so the old `en-GB` rule no longer applies to post prose. Use `&rsquo;`, `&ldquo;`,
`&rdquo;`, `&mdash;` and `&hellip;` entities in the markup, and keep the KJV quotations as
the site's scripture text even where her draft quoted a modern version.

Pages that are not posts (About, Homeschooling, the front page) still use the site's own
editorial voice, and the `.safety` notes are the one place inside a post where it speaks.

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

## The nav is added by hand, and then checked by script

Every page carries the same four nav items (Home, The blog, Homeschooling, About) and the
same footer links, in the same order. Adding one means touching eleven files, and the obvious
string replacement silently misses the two pages where the item being replaced carries
`aria-current="page"` — which is why Homeschooling went missing from blog.html and about.html
and only turned up in their footers.

**Match on the item, never on a pair of adjacent lines, and never check `aria-current`.** Then
run this, which is the only reason it cannot happen again:

```python
import pathlib, re
NAV = ['Home', 'The blog', 'Homeschooling', 'About']
for p in [f for f in sorted(pathlib.Path('.').rglob('*.html')) if '.inbox' not in f.parts]:
    h = f.read_text(encoding='utf-8')
    nav = re.search(r'<nav class="site-nav".*?</nav>', h, re.S).group(0)
    got = re.findall(r'<a\b[^>]*>([^<]+)</a>', nav)
    assert got == NAV, f'{p}: nav is {got}'
```

Note the `<a\b[^>]*>` — a check written as `<a href="[^"]*">` drops every item that carries
`aria-current`, which is exactly the item you were looking for. The check has to be able to
fail on the current page.

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