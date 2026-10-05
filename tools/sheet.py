"""Builds a project page as a torn sheet of paper pinned over the corkboard, in the
Espressivo layout (title block top left, photos, then the process rows). Photos from the old Squarespace
site keep the crop (aspect ratio + focal point) they had there (each page's `crop`). Photo arrangements are small row/col trees that are solved
so every photo keeps its aspect ratio and rows line up exactly.

Usage: python3 tools/sheet.py [slug ...]
"""
import glob, html, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
e = lambda s: html.escape(s, quote=True)
GAP = 1.6  # gap between photos, in % of the photo column width (cqw)

def row(*kids): return ('row', kids)
def col(*kids): return ('col', kids)


PAGES = {
    'headset-habitat': {
        'name': 'Headset Habitat',
        'next': ('spatulove', 'Spatulove'),
        'tagline': 'A home for your headphones',
        'meta': ['10-week design sprint', 'Sand casting', 'Woodwork'],
        'intro': ('Music has always been a piece of who I am, and nature has always grounded me — Headset Habitat '
                  'brings both loves together into a piece of functional room decor. Its three moving parts — a bronze '
                  'headrest, a wooden neck, and a bronze base — come apart and pack away just as easily as they come '
                  'together, ready to travel ', 'wherever life takes me next', '.'),
        'intro_media': row(2, 3, 4),
        # newer photos (23+) aren't on the old site: shown uncropped; cut-outs sit straight on the paper
        'fit': {23, 24, 32},
        # aspect (and focal point) each photo was cropped to on the old site
        'crop': {2: (0.75,), 3: (0.75,), 4: (0.75,), 8: (1.1504560406698563,), 12: (1.3900991586538463,),
                 17: (0.8144806338028169,), 19: (0.7519408411949685,)},
        'sections': [
            {'title': 'Hang out a while and learn about the process!',
             'brief': 'Create a product using two manufacturing processes in a 10-week design sprint.'},
            {'text': [('h3', 'Computer-Aided Design'),
                      ('p', 'Autodesk Fusion 365 was used to model the headrest and base in 3D. These models served as patterns for sand casting.')],
             'media': 23, 'media_width': 80},
            {'text': [('h3', '3D Printing'),
                      ('p', 'Both CAD models were 3D printed and sanded to remove rough edges. Shellac was applied to fill small gaps and build a smooth surface. Because any imperfection in a pattern transfers to the mold and then to the final casting, this step was essential to achieving a clean cast.')],
             'media': row(8, 24)},
            {'text': [('h3', 'Sand Casting'),
                      ('p', 'Sand molds were created for both parts. The headrest presented the greater challenge due to its complex, irregular geometry, and a successful mold was achieved after 12 attempts.')],
             'media': row(col(25, 12), 26)},
            {'text': [('h3', 'Metalwork'),
                      ('p', 'A vertical mill was used to machine the slot that locks the metal component into the wooden base. This joint keeps the stand balanced and firmly grounded.')],
             'media': row(28, col(27, 29))},
            {'text': [('h3', 'Woodwork'),
                      ('p', 'The full outline of the neck was traced onto a block of cherry wood. A vertical bandsaw removed the excess material, and the curves were shaped and smoothed with a belt sander and a spindle sander.')],
             'media': row(17, 30, 19)},
            {'text': [('h3', 'Finishing Touches'),
                      ('p', 'The wooden neck was stained cherry red, and the bronze pieces were polished with progressively finer sandpaper (100 to 1000 grit) to achieve a mirror finish. The three pieces slot together to form a self-standing headphone stand.')],
             'media': 32, 'media_width': 40},
        ],
    },
    'spatulove': {
        'name': 'Spatulove',
        'tagline': 'No pain, all gain - in every bite.',
        'prev': ('headset-habitat', 'Headset Habitat'),
        'next': ('candy-dispenser', 'Candy Dispenser'),
        'meta': ['Ergonomics', 'Fusion 360', 'Surface modeling'],
        'intro': ('As an avid cook, I know the frustration of working with awkward tools for long stretches of time. That '
                  'experience inspired me to design Spatulove, a spatula that improves the cooking experience for everyone, '
                  'especially people with limited hand and wrist mobility. Made from lightweight titanium with rubber grips '
                  'and an ergonomic shape, Spatulove makes it easy to ', 'grip, flip, and whip up', ' your next masterpiece, '
                  'even with weak hands or poor wrist mobility.'),
        'intro_media': row(2, 3, 4, 5),
        'fit': {6, 8, 9, 13, 21, 23, 24, 25},
        # aspect (and focal point) each photo was cropped to on the old site
        'crop': {2: (0.75,), 3: (0.75,), 4: (0.75,), 5: (0.75,), 6: (0.6673553719008265, (0.812, 0.48)),
                 7: (0.7589824879227054,), 8: (1.54251012145749,), 9: (1.61139896373057,),
                 10: (1.3910735645933012, (0.335, 0.288)), 11: (1.7263049450549448, (0.495, 0.312)),
                 12: (1.4218042986425339,), 13: (1.4691358024691359,), 14: (1.3910735645933012, (0.53, 0.0)),
                 15: (0.6777389277389277,), 16: (0.6778117715617716,), 17: (1.6316910885167464,),
                 18: (0.9098385167464116,), 19: (0.9098385167464116,), 20: (0.6777389277389277,),
                 21: (0.6815286624203821,), 22: (0.6778117715617716,), 23: (0.9378306878306878,),
                 24: (1.333868378812199,), 25: (1.3333333333333333,), 26: (1.1054972627737225, (0.084, 0.664))},
        'sections': [
            {'title': 'Get a grip on the process!',
             'brief': 'Re-design an existing handtool to improve its ergonomics through iterative design and qualitative testing.'},
            {'text': [('h3', 'User Testing'),
                      ('p', 'Using a subjective evaluation technique, several users were interviewed and asked to diagram their pain and pressure points when using spatulas.')],
             'media': row(6, 7)},
            {'text': [('h3', 'Design Exploration'),
                      ('p', 'With these pain points in mind, new grip designs were explored. Two goals guided this stage: easing wrist rotation, since standard spatulas often require a painful 180-degree turn, and creating a more ergonomic grip, since thin handles demand a tighter hold that can lead to strain.')],
             'media': col(row(8, 12), row(14, 9, 13), row(11, 10))},
            {'text': [('h3', 'Hi-Fidelity Concept Sketches'),
                      ('p', 'The two strongest sketches were selected based on aesthetics and functionality, then developed in greater depth.')],
             'media': row(15, 16)},
            {'text': [('h3', 'Foam Models'),
                      ('p', 'Foam core models of both designs let users handle them directly and give feedback on what felt intuitive and what did not.')],
             'media': row(17, col(18, 19))},
            {'text': [('h3', 'Anthropometrics'),
                      ('p', 'Hand anthropometric data guided the sizing of the handle. The ages and genders of potential users were considered so the handle works comfortably for both men and women.')],
             'media': row(20, 21, 22)},
            {'text': [('h3', 'CAD & Finishing Touches'),
                      ('p', 'Informed by user feedback, the handle design was refined and finalized. Surface modeling was used to create smooth, ergonomic forms. The final design features a thick handle for control and a softer grip. Rubber grips subtly guide finger placement, and the cut-out offers several comfortable gripping options.')],
             'media': row(23, col(24, 25))},
        ],
    },
    'cherry': {
        'name': 'Cherry App',
        'prev': ('candy-dispenser', 'Candy Dispenser'),
        'next': ('cupboss', 'CupBoss'),
        'tagline': 'Make your long distance relationships a little bit sweeter.',
        'meta': ['Figma', 'React Native', 'User needfinding'],
        'intro': ('Once you leave home for college, 90% of your time with family is already behind you. Even in the age of '
                  'technology, truly connecting with long-distance loved ones is harder than it seems. Whether parents, '
                  'siblings, friends, or significant others, these relationships make the world go round. Inspired by this '
                  'yearning to reconnect, we designed Cherry, a social app that generates intimate daily questions and '
                  'invites creative responses, making long-distance connection ', 'simple, meaningful, and fun',
                  '. Rooted in love and friendship, Cherry brings you back to the people who make life worth living.'),
        # 13-22: the app screens (02-11) trimmed to the phone so they line up
        'fit': set(range(13, 23)),
        'demo': {'video': 'cherry-intro', 'wide': True, 'note': 'meet Cherry', 'frames': ('cherry-still-1', 'cherry-still-2'),
                 'edges': ('CHERRY 400 ▸ 4 ▸ 4A', '▸ 5 ▸ 5A · SWEET')},
        'sections': [
            {'title': 'Take a sweet peek inside the app!',
             'brief': 'In a 10-week design sprint, teams of 4 design and build an app that tackles a unique set of needs.'},
            {'photos': col(row(13, 14, 15, 16, 17), row(18, 19, 20, 21, 22)), 'width': 74},
            {'film': {'video': 'cherry-demo', 'note': 'the demo — see it in action', 'frames': ('cherry-still-3', 'cherry-still-4'),
                      'edges': ('CHERRY 400 ▸ 6 ▸ 6A', '▸ 7 ▸ 7A · DEMO')}},
            {'final': True,
             'text': [('h2', 'Acknowledgements'),
                      ('p', 'Thanks to my team — Gautham Raghupathi, Annie Ma, and Jason Ping — for being a blast to work with and teaching me so much about teamwork, keeping a light heart when the going gets tough, and needfinding to no end!')],
             'media': 12, 'media_width': 62},
        ],
    },
    'cupboss': {
        'name': 'CupBoss',
        'prev': ('cherry', 'Cherry App'),
        'next': ('espressivo', 'Espressivo'),
        'tagline': 'From Beginner to Boss. Boss your flow.',
        'meta': ['Fusion 360', 'Silicone molding', 'Packaging design'],
        'intro_pre': ['Starting and managing your period can be empowering — but it can also be exhausting. For decades, '
                      'pads and tampons have been the default: single-use, synthetic, costly, and carrying risks like '
                      'odor and toxic shock syndrome. Menstrual cups promised something better — longer wear, '
                      'medical-grade materials, and years of sustainable use at a fraction of the cost.'],
        'intro': ('But through our own experiences as first-time users, we found cups weren’t built for beginners — the '
                  'fear, pain, and uncertainty of that first try were never addressed. So we created CupBoss: a menstrual '
                  'cup with origami folds and a longer, ribbed string, making insertion and removal easier, less painful, '
                  'and ', 'less scary for first-timers', '. The experience starts before you even touch the cup — '
                  'educational packaging walks you through insertion and removal, with a hands-on practice feature built '
                  'right in, so you’re comfortable with the motion before using the real thing.'),
        # cut-out shots (transparent), laid straight on the paper
        'fit': {6, 9, 10, 11, 19},
        'intro_media': row(18, 17, 5),
        'demo': {'video': 'cupboss-demo', 'wide': True, 'note': 'the origami fold — see it in action', 'frames': ('cupboss-still-1', 'cupboss-still-2'),
                 'edges': ('CUPBOSS 400 ▸ 1 ▸ 1A', '▸ 2 ▸ 2A · BOSS YOUR FLOW')},
        'sections': [
            {'title': 'Boss up and learn about the process!',
             'brief': 'A two-quarter, team-based capstone project drawing on the methodology and skills developed throughout the Product Design major. Students will form a team, identify an opportunity space of interest, and design and build a product — digital, physical, or experiential — to bring it to life.'},
            {'text': [('h3', 'Research & Insight'),
                      ('p', 'We interviewed over 50 menstruators and found that most first-time cup users shared the same fears — pain, the size of the cup, and the worry of it getting stuck. We wanted to help them build confidence, reduce the fear and stigma around cups, and give them a low-stakes space to practice before the real thing. That’s how we landed on our design: a physical redesign of the cup, paired with educational resources built right into the unboxing experience.')],
             'media': 6, 'media_width': 80},
            {'text': [('h3', 'CAD & Iteration'),
                      ('p', 'Using Autodesk Fusion 360, we designed the cup itself, then used it again to CAD the molds needed to bring it to life. We went through many iterations before landing on a shape that felt right.')],
             'media': 19, 'media_width': 88},
            {'text': [('h3', 'Material Testing'),
                      ('p', 'We tested different silicone blends to get the texture and durometer just right — sturdy enough to hold its shape, but softer than a standard cup to ease the pain of insertion.')],
             'media': row(10, 9), 'media_width': 88},
            {'text': [('h3', 'Educational Packaging'),
                      ('p', 'We built the learning experience directly into the packaging itself — a practice opening at its center lets users fold, insert, and remove the cup themselves before trying it for real.')],
             'media': 11, 'media_width': 38},
            {'final': True,
             'text': [('h2', 'Acknowledgements'),
                      ('p', 'Huge thanks to my incredible team — Ameera Waterford, Lanna Wang, and Yaayaa Pajibo. It was truly an honor to work with them. Here we are receiving the Robert H. McKim Award, given to the team in Stanford’s Product Design Capstone class that best embodies the spirit of the course: human-centered design, done in service of the community!')],
             'media': 12, 'media_width': 62},
        ],
    },
    'candy-dispenser': {
        'name': 'Candy Dispenser',
        'prev': ('spatulove', 'Spatulove'),
        'next': ('cherry', 'Cherry App'),
        'tagline': 'Focus on the journey. Not the destination.',
        'meta': ['Laser-cut acrylic', 'Fusion 360', 'No adhesive'],
        'intro': ('Inspired by my childhood memories of watching candy fall through colorful gum-ball machines, I chose '
                  'to make my dispenser completely out of see-through acrylic and organic shapes. To use, simply load '
                  'your candy through the top funnel, push the lever up, and watch your candy sliiiide to its '
                  'destination. Born out of joy, memory, and nostalgia, this candy dispenser is all about ',
                  'enjoying the journey', ' (almost) as much as the destination.'),
        'intro_media': row(26, 27, 28, 29, 30),  # tighter crops of 12, 2, 14, 6, 8
        'fit': {31},
        'demo': {'video': 'candy-demo', 'note': 'the demo — watch it sliiiide', 'frames': (6, 12), 'toy': 'candy-toy'},
        'sections': [
            {'title': 'Take your sweet time learning about the process.',
             'brief': 'Fabricate a free-standing candy dispenser without adhesive that can be actuated with one hand.'},
            {'text': [('h3', 'Prototyping'),
                      ('p', 'A foam core prototype was built to confirm the design idea would work and to surface any considerations that could make or break it.')],
             'media': row(16, 17), 'media_width': 80},
            {'text': [('h3', 'CAD'),
                      ('p', 'A hi-fidelity CAD model was created to check how all of the parts would fit together. Materials and colors were then tested to find the most fun effect in real-time use. Translucent, vibrant colors were chosen so users can enjoy the satisfaction of watching their candy fall to its final destination.')],
             'media': col(row(18, 19), row(20, 21))},
            {'text': [('h3', 'Assembly'),
                      ('p', 'All pieces were laser cut from the CAD files and preliminarily assembled to confirm the dispenser looked as intended.')],
             'media': row(22, 23, 24)},
            {'text': [('h3', 'Finishing Touches'),
                      ('p', 'The dispenser was assembled using heat inserts, hex nuts, and a linear loaded spring. Testing involved loading candies into the top funnel and turning the green lever to dispense them into the bottom bucket.')],
             'media': 31, 'media_width': 44},
        ],
    },
    'pesky-everyday-problems': {
        'name': 'Pesky Everyday Problems',
        'next': ('..', 'Back to the board', 'all done?'),
        'meta': ['Stop motion', 'iMovie'],
        'intro': ('A just-for-fun project: create a 30-second video clip with 21 frames showing ',
                  'a solution to an everyday problem', '.'),
        'demo': {'video': 'pesky', 'wide': True, 'note': 'press play — a pesky problem, solved', 'frames': ('pesky-still-1', 'pesky-still-2'),
                 'edges': ('PESKY 400 ▸ 1 ▸ 1A', '▸ 21 ▸ 21A · STOP MOTION')},
        'sections': [
            {'title': 'Frame by frame.', 'brief_label': 'Project Brief',
             'brief': 'Create a 30 second video clip with 21 frames showing a solution to an everyday problem.'},
            {'photos': row(1, 2, 3, 4)},
        ],
    },
}


def img_path(slug, n):
    for ext in ('jpg', 'webp'):
        path = f'assets/img/{slug}-{n:02d}.{ext}'
        if os.path.exists(os.path.join(ROOT, path)):
            return path
    raise FileNotFoundError(f'{slug}-{n:02d}')


def crops(slug):
    """n -> (aspect w/h, focal point, fit). Photos keep their own proportions unless the page's `crop` overrides them."""
    meta = PAGES.get(slug, {})
    fits, crop = meta.get('fit', set()), meta.get('crop', {})
    out = {}
    for f in glob.glob(os.path.join(ROOT, 'assets', 'img', f'{slug}-[0-9][0-9].*')):
        n = int(os.path.basename(f)[len(slug) + 1:][:2])
        w, h = Image.open(f).size
        aspect, fp = (*crop.get(n, (w / h,)), (0.5, 0.5))[:2]
        out[n] = (aspect, fp, 'fit' if n in fits else 'fill')
    return out


def solve(node, C):
    """Height as an affine function of width: h = A*w + B."""
    if isinstance(node, int):
        return 1 / C[node][0], 0.0
    kind, kids = node
    parts = [solve(k, C) for k in kids]
    if kind == 'col':
        return sum(a for a, _ in parts), sum(b for _, b in parts) + GAP * (len(kids) - 1)
    inv = sum(1 / a for a, _ in parts)
    return 1 / inv, (sum(b / a for a, b in parts) - GAP * (len(kids) - 1)) / inv


def render(node, w, C, slug, name):
    if isinstance(node, int):
        aspect, fp, fit = C[node]
        return (f'<figure class="m-img" style="width: {w:.3f}cqw; aspect-ratio: {aspect:.5f}">'
                f'{photo(slug, node, f"{name}, photo {node}", fp, fit)}</figure>')
    kind, kids = node
    parts = [solve(k, C) for k in kids]
    if kind == 'col':
        inner = ''.join(render(k, w, C, slug, name) for k in kids)
        return f'<div class="m-col" style="width: {w:.3f}cqw">{inner}</div>'
    A, B = solve(node, C)
    h = A * w + B
    inner = ''.join(render(k, (h - b) / a, C, slug, name) for k, (a, b) in zip(kids, parts))
    return f'<div class="m-row" style="width: {w:.3f}cqw">{inner}</div>'


def photo(slug, n, alt, fp=(0.5, 0.5), fit='fill', lazy=True):
    path = img_path(slug, n)
    w, h = Image.open(os.path.join(ROOT, path)).size
    pos = f'{fp[0] * 100:.1f}% {fp[1] * 100:.1f}%'
    cls = ' is-fit' if fit == 'fit' else ''
    lz = ' loading="lazy"' if lazy else ''
    return (f'<button class="photo{cls}" type="button" aria-label="Enlarge photo">'
            f'<img src="../../{path}" width="{w}" height="{h}" alt="{e(alt)}" style="object-position: {pos}"{lz}></button>')


def text_html(items):
    out = []
    for kind, v in items:
        if kind == 'ul':
            out.append('<ul>' + ''.join(f'<li>{e(x)}</li>' for x in v) + '</ul>')
        elif kind == 'label':
            out.append(f'<p class="label">{e(v)}</p>')
        else:
            out.append(f'<{kind}>{e(v)}</{kind}>')
    return '\n          '.join(out)


SQUIGGLE = ('<svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">'
            '<path d="M2 7c12-6 22 4 34-1s20-4 32 0 22 3 34-1 22-4 34 0 22 3 34-1 20-2 28 1"/></svg>')
ARROW = '<svg viewBox="0 0 48 24" aria-hidden="true"><path d="M46 12H3M13 2L3 12l10 10"/></svg>'


def toy_html(img):
    """Candy dispenser photo cut into layers (body, lever, spring) driven by js/candy.js."""
    return f'''
      <figure class="toy" data-toy>
        <div class="toy__stage">
          <img src="../../assets/img/{img}.jpg" alt="Cut-out photo of the candy dispenser" width="460" height="485">
          <img class="toy__part toy__spring" src="../../assets/img/{img}-spring.png" alt="">
          <img class="toy__part toy__rotor" src="../../assets/img/{img}-lever.png" alt="">
          <svg viewBox="0 0 460 485">
            <defs>
              <radialGradient id="pearl" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#f1efe6"/><stop offset="1" stop-color="#b9c7bd"/></radialGradient>
              <radialGradient id="pearl-in" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffc0a0"/><stop offset=".6" stop-color="#e2413a"/><stop offset="1" stop-color="#a0142c"/></radialGradient>
            </defs>
            <g class="toy__candy"></g>
            <g class="toy__lever" tabindex="0" role="slider" aria-label="Candy lever — push up to dispense, down to reload" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" transform="translate(166 275) rotate(32.9)">
              <rect class="toy__hit" x="-24" y="22" width="48" height="182" rx="24"/>
            </g>
          </svg>
          <span class="toy__hint" aria-hidden="true">lift me!<svg viewBox="0 0 40 40"><path d="M6 34 C 10 18, 22 10, 36 8 M 28 3 L 36 8 L 30 15"/></svg></span>
        </div>
        <figcaption class="toy__note">try it yourself!</figcaption>
        <button class="toy__empty" type="button" hidden>cup’s full — empty it ↺</button>
      </figure>'''


def film_html(slug, d):
    """A video on a strip of film: upright for phone videos, sideways (`wide`) for landscape ones."""
    def still(f):
        src = f'assets/img/{f}.jpg' if isinstance(f, str) else img_path(slug, f)
        return f'<span class="film__still"><img src="../../{src}" alt="" loading="lazy"></span>'
    left, right = d.get('edges', ('SWEET 400 ▸ 12 ▸ 12A', '▸ 13 ▸ 13A · ACRYLIC'))
    wide = d.get('wide')
    side = ' clean__demo--wide' if wide else ('' if d.get('toy') else ' clean__demo--solo')
    return f'''<section class="clean__demo{side}" aria-label="{"Video" if wide else "Demo video"}">
      <p class="clean__note">{e(d['note'])} <span aria-hidden="true">→</span></p>
      <div class="film{' film--wide' if wide else ''}">
        <span class="film__edge film__edge--l" aria-hidden="true">{e(left)}</span>
        <span class="film__edge film__edge--r" aria-hidden="true">{e(right)}</span>
        {still(d['frames'][0])}
        <video controls playsinline preload="metadata" poster="../../assets/img/{d['video']}-poster.jpg"><source src="../../assets/video/{d['video']}.mp4" type="video/mp4"></video>
        {still(d['frames'][1])}
      </div>{toy_html(d['toy']) if d.get('toy') else ''}
    </section>'''


def build(slug):
    """The Espressivo-style sheet: title block top left, then photos and process rows."""
    meta = PAGES[slug]
    name = meta['name']
    C = crops(slug)
    secs = []
    for s in meta['sections']:
        if 'title' in s:
            secs.append(f'<h2 class="clean__part">{e(s["title"])}</h2>')
            if s.get('brief'):
                secs.append(f'<p class="clean__brief"><span>{e(s.get("brief_label", "Project details"))}</span>{e(s["brief"])}</p>')
            continue
        if 'photos' in s:
            w = f' style="--w: {s["width"]}%"' if s.get('width') else ''
            secs.append(f'<div class="clean__photos"{w}>\n        {render(s["photos"], 100, C, slug, name)}\n      </div>')
            continue
        if 'film' in s:
            secs.append(film_html(slug, s['film']))
            continue
        cls = 'row' + (' row--final' if s.get('final') else '') + ('' if 'media' in s else ' row--solo')
        media = '' if 'media' not in s else f'''
        <div class="row__media">
          {render(s['media'], s.get('media_width', 100), C, slug, name)}
        </div>'''
        secs.append(f'''<section class="{cls}">
        <div class="row__text">
          {text_html(s["text"])}
        </div>{media}
      </section>''')
    before, mark, after = meta['intro']
    pre = ''.join(f'\n      <p class="clean__body">{e(p)}</p>' for p in meta.get('intro_pre', []))
    tagline = f'\n      <p class="clean__tagline">{e(meta["tagline"])}</p>' if meta.get('tagline') else ''
    dot = ' <span>·</span> '
    toy_js = '\n  <script src="../../js/candy.js" defer></script>' if meta.get('demo', {}).get('toy') else ''
    demo = f'\n\n    {film_html(slug, meta["demo"])}' if meta.get('demo') else ''
    photos = f'''

    <div class="clean__photos">
      {render(meta['intro_media'], 100, C, slug, name)}
    </div>''' if meta.get('intro_media') else ''
    pager = []
    if meta.get('prev'):
        pager.append(f'<a class="prev" href="../{meta["prev"][0]}/"><small>← previous</small>{e(meta["prev"][1])}</a>')
    if meta.get('next'):
        slug_, label, *small = meta['next']
        pager.append(f'<a class="next" href="../{slug_}/"><small>{e(small[0] if small else "next project")} →</small>{e(label)}</a>')

    page = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(name)} · Symphony Koss</title>
  <meta name="description" content="{e(name)} by Symphony Koss.">
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Permanent+Marker&family=Reenie+Beanie&display=swap">
  <link rel="stylesheet" href="../../css/base.css">
  <link rel="stylesheet" href="../../css/sheet.css">
</head>
<body class="cork sheet-page">
  <a class="back-tab" href="../../"><span class="pin pin--blue"></span>← back to the board</a>

  <main class="sheet sheet--clean">
    <span class="pin sheet__pin sheet__pin--l"></span>
    <span class="pin pin--yellow sheet__pin sheet__pin--r"></span>
    <a class="sheet__close clean__back" href="../../" aria-label="Close and go back to the board">
      {ARROW}
    </a>

    <header class="clean__head">
      <h1 class="clean__title">{e(name)}</h1>{tagline}
      <p class="clean__meta">{dot.join(e(m).replace(' ', '&nbsp;') for m in meta['meta'])}</p>{pre}
      <p class="clean__body">{e(before)}<span class="squiggled">{e(mark)}{SQUIGGLE}</span>{e(after)}</p>
    </header>{photos}{demo}

    <div class="sheet__body">
      {(chr(10) + chr(10) + '      ').join(secs)}
    </div>
  </main>

  <script src="../../js/scrapbook.js" defer></script>
  <script src="../../js/sheet.js" defer></script>{toy_js}
</body>
</html>
'''
    dst = os.path.join(ROOT, 'projects', slug, 'index.html')
    open(dst, 'w').write(page)
    print('wrote', dst)


if __name__ == '__main__':
    import sys
    for s in sys.argv[1:] or PAGES:
        build(s)
