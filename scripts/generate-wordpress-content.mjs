/**
 * Rebuild the editable WordPress starter pages from the journal's original copy.
 * Runtime tokens are resolved by the theme's explicit starter-content importer.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AirplaneTilt } from '@phosphor-icons/react/dist/csr/AirplaneTilt'
import { Anchor } from '@phosphor-icons/react/dist/csr/Anchor'
import { Backpack } from '@phosphor-icons/react/dist/csr/Backpack'
import { Camera } from '@phosphor-icons/react/dist/csr/Camera'
import { Compass } from '@phosphor-icons/react/dist/csr/Compass'
import { Heart } from '@phosphor-icons/react/dist/csr/Heart'
import { MapPinArea } from '@phosphor-icons/react/dist/csr/MapPinArea'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const theme = path.join(root, 'wordpress/weis-tiny-adventures')
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const attrs = (value = {}) => Object.keys(value).length ? ` ${JSON.stringify(value)}` : ''
const block = (name, attributes, inner) => `<!-- wp:${name}${attrs(attributes)} -->\n${inner}\n<!-- /wp:${name} -->\n`
const dynamic = (name) => `<!-- wp:wei/${name} /-->\n`
const html = (value) => block('html', {}, value)
const paragraph = (text, className = '') => block('paragraph', className ? { className } : {}, `<p${className ? ` class="${className}"` : ''}>${text}</p>`)
const heading = (text, level = 2, className = '', anchor = '') => block('heading', { ...(level !== 2 ? { level } : {}), ...(className ? { className } : {}), ...(anchor ? { anchor } : {}) }, `<h${level} class="wp-block-heading${className ? ` ${className}` : ''}"${anchor ? ` id="${anchor}"` : ''}>${text}</h${level}>`)
const group = (className, children, tagName = 'div', anchor = '') => block('group', { ...(tagName !== 'div' ? { tagName } : {}), ...(anchor ? { anchor } : {}), ...(className ? { className } : {}) }, `<${tagName}${anchor ? ` id="${anchor}"` : ''} class="wp-block-group${className ? ` ${className}` : ''}">\n${Array.isArray(children) ? children.join('\n') : children}</${tagName}>`)
const photo = (src, alt, className = '', caption = '') => block('image', { sizeSlug: 'full', linkDestination: 'none', ...(className ? { className } : {}) }, `<figure class="wp-block-image size-full${className ? ` ${className}` : ''}"><img src="{{asset:${src}}}" alt="${escape(alt)}"/>${caption ? `<figcaption class="wp-element-caption">${caption}</figcaption>` : ''}</figure>`)
const button = (text, href, className) => block('button', { className }, `<div class="wp-block-button ${className}"><a class="wp-block-button__link wp-element-button" href="${href}">${text}</a></div>`)
const buttons = (children, className = '') => block('buttons', className ? { className } : {}, `<div class="wp-block-buttons${className ? ` ${className}` : ''}">\n${children.join('\n')}</div>`)
const details = (summary, children, className = '', showContent = false) => block('details', { ...(showContent ? { showContent: true } : {}), ...(className ? { className } : {}) }, `<details class="wp-block-details${className ? ` ${className}` : ''}"${showContent ? ' open' : ''}><summary>${summary}</summary>\n${children}</details>`)
const back = (className) => paragraph('<a href="{{url:/}}">← Back to the journal</a>', className)
const icon = (component, className = '', size = 48) => renderToStaticMarkup(React.createElement(component, { weight: 'thin', size, className: className || undefined, 'aria-hidden': 'true' }))
const waveSvg = (className = '') => `<svg class="wave-flourish${className ? ` ${className}` : ''}" viewBox="0 0 110 15" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M2 8c9 0 9 4 17 4s9-7 18-7 9 6 18 6 9-6 18-6 9 6 18 6 9-3 17-3"/><path d="M8 10c8 0 10 3 16 2M42 7c6 0 7 5 14 5M79 7c6 0 9 5 15 5"/></svg>`
const wave = (className = '') => html(waveSvg(className))
const postmark = (id) => html(`<div class="postmark" aria-hidden="true"><svg viewBox="0 0 110 110"><defs><path id="${id}-top" d="M 17,58 A 38,38 0 0,1 93,58"/><path id="${id}-bottom" d="M 15,60 A 41,41 0 0,0 95,60"/></defs><circle cx="55" cy="55" r="50"/><circle cx="55" cy="55" r="46" class="stamp-dashed"/><circle cx="55" cy="55" r="32"/><text><textPath href="#${id}-top" startOffset="50%" text-anchor="middle">YOUR NEXT ADVENTURE</textPath></text><text><textPath href="#${id}-bottom" startOffset="50%" text-anchor="middle">STARTS HERE</textPath></text></svg>${icon(Anchor)}</div>`)
const heroWave = html('<svg class="hero-wave" viewBox="0 0 1440 150" preserveAspectRatio="none" aria-hidden="true"><path class="wave-fill" d="M0 42C100-35 182 88 340 97S487 87 565 112s104-35 172-10 153 14 240-2 195-42 267-75 127-36 196-75V150H0Z"/><g class="wave-lines"><path d="M-15 70C91-11 151 73 257 84"/><path d="M-15 86C77 12 145 94 249 101"/><path d="M-15 104C78 32 130 109 225 116"/><path d="M-15 125C64 53 132 135 223 131"/></g></svg>')

const hero = group('hero', [
  photo('images/alpine-hero-v1.webp', '', 'hero-art'),
  group('hero-content', [
    group('travel-crest', [paragraph('Affordable travel · Real experiences', 'wei-crest-caption'), html(`<div class="crest-plane" aria-hidden="true">${waveSvg()}${icon(AirplaneTilt)}</div>`)]),
    heading('<span class="hero-serif">Explore more</span><span class="hero-script">Spend Less</span>', 1, '', 'hero-title'),
    html(`<div class="heart-divider" aria-hidden="true"><span></span>${icon(Heart, '', 20)}<span></span></div>`),
    paragraph('Practical tips, honest stories, and budget-friendly<br class="desktop-break"> guides to help you explore the world<br class="desktop-break"> one adventure at a time.', 'hero-description'),
    buttons([button('Start exploring', '{{url:/destinations}}', 'button explore-button')], 'hero-actions'),
  ]),
  heroWave,
], 'section')

const values = [
  [Backpack, 'Budget first', 'Smart tips to travel<br>more for less.'],
  [Camera, 'Real stories', 'Honest guides from<br>real experiences.'],
  [MapPinArea, 'Epic destinations', 'Inspiring places that<br>won’t break the bank.'],
  [Heart, 'Travel mindfully', 'Respect the places<br>you explore.'],
]
const credits = details('Photo credits', [
  paragraph('Bali rice terraces: <a href="https://unsplash.com/photos/rice-terraces-in-tegelalang-bali--2WlTWZLnRc">Niklas Weiss</a> / <a href="https://unsplash.com/license">Unsplash License</a>.'),
  paragraph('Indomie Mi Goreng: <a href="https://commons.wikimedia.org/wiki/File:Cooking_two_packs_of_Indomie_noodles.jpg">Andy Li</a> / <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a> (cropped).'),
  paragraph('Lovina Beach: photograph supplied for this journal.'),
].join('\n'), 'article-photo-credits')

const home = group('travel-page', [
  hero,
  group('travel-values', [group('values-grid', values.map(([component, title, text]) => group('value', [html(icon(component, 'value-icon')), heading(title), paragraph(text)]))), wave('values-flourish')], 'section', 'about'),
  group('recent-adventures', [
    photo('images/whale-shark-v2.webp', '', 'whale-shark'),
    group('section-heading', [paragraph('From the Blog', 'script-eyebrow'), heading('Recent adventures', 2, '', 'adventures-title'), wave()]),
    dynamic('recent-posts'), credits, dynamic('newsletter-teaser'),
  ], 'section'),
])

const aboutIntro = group('about-intro', [
  group('about-intro-copy', [
    paragraph('The person behind the little adventures', 'about-kicker'),
    heading('Hey, I’m Wei.', 1, '', 'about-title'),
    paragraph('A full-time employee and part-time traveller, exploring the world one annual leave request at a time.', 'about-lead'), wave(),
    group('about-story', [
      paragraph('I love a getaway, but most days I’m dreaming about the next one while getting on with everyday life.'),
      paragraph('When I’m not travelling, you’ll usually find me reading manga, making something crafty (almost anything counts), or planning a trip. Apparently, travelling and thinking about travelling need separate spots on my hobby list.'),
    ]),
  ]),
  group('about-postcard-wrap', [
    photo('images/alpine-hero-v1.webp', 'Watercolor-style snowy mountain peaks above a turquoise lake and evergreen trees', 'about-postcard', 'Big daydreams. Little adventures.'),
    postmark('about-stamp'),
    paragraph('Somewhere between the day job<br>and the next departure.', 'about-postcard-note'),
  ]),
], 'section')

const about = group('about-page', [
  group('about-container', [back('about-back'), aboutIntro]),
  group('about-purpose', [
    group('about-container about-purpose-inner', [
      group('about-purpose-heading', [paragraph('Why I’m here', 'about-script'), heading('A little annual leave can take you a long way.', 2, '', 'about-purpose-title'), wave(), html(icon(Compass, 'about-purpose-compass', 80))]),
      group('about-purpose-copy', [
        paragraph('I know plenty of people who haven’t ventured beyond the state they grew up in. Sometimes it’s the cost, sometimes it’s finding the time. When holidays have to fit around work, a budget, and everything else life throws at you, getting away can feel like a big ask.'),
        paragraph('That’s why I’m putting these guides together. I hope they make your next adventure feel a little more possible. You don’t need months off or a mountain of money to find somewhere magical, just a trip that works for you.'),
        paragraph('Whether you’re looking close to home or a little further afield, there’s so much out there to explore. Let’s see how far a little annual leave can take us.'),
        paragraph('<span>See you somewhere lovely,</span><span>Wei</span>', 'about-signoff'),
      ]),
    ]),
  ], 'section'),
  group('about-next about-container', [
    group('', [paragraph('A little inspiration for your next escape', 'about-script'), heading('Let’s find your next adventure.', 2, '', 'about-next-title')]),
    buttons([button('Explore destinations →', '{{url:/destinations}}', 'about-primary'), button('Pick up a few travel tips →', '{{url:/travel-tips}}', 'about-secondary')], 'about-actions'),
  ], 'section'),
])

const tipsSource = await readFile(path.join(root, 'legacy-app/src/pages/TravelTipsPage.jsx'), 'utf8')
const collectionSource = tipsSource.match(/const tipCollections = (\[[\s\S]*?\n\])\r?\n/)[1]
const tipCollections = Function(`"use strict"; return (${collectionSource})`)()
const fieldGuide = group('tips-field-guide tips-container', [
  group('tips-guide-intro', [
    paragraph('Notes for the journey', 'tips-script'),
    heading('Small things.<br>Smoother travels.', 2, '', 'field-guide-heading'),
    paragraph('A few practical habits for the planning, the pennies, and everything along the way.'),
    group('tips-topic-buttons', tipCollections.map((topic, index) => paragraph(`<a href="#${topic.id}"><span>0${index + 1}</span> ${topic.label} <span aria-hidden="true">→</span></a>`, 'wei-topic-link'))),
  ]),
  group('tips-notebooks', tipCollections.map((topic, index) => group('tips-notebook wei-tip-collection', [
    paragraph(`<span class="tips-kicker">The little field guide</span><span>0${index + 1} / 03</span>`, 'tips-notebook-caption'),
    heading(topic.label, 3, 'wei-topic-title'),
    ...topic.tips.map((tip, tipIndex) => details(tip.title, group('tips-note-copy', [paragraph(tip.text), paragraph(tip.takeaway, 'tips-takeaway')]), 'tips-note', tipIndex === 0)),
    paragraph(topic.note, 'tips-notebook-signoff'), wave(),
  ], 'section', topic.id))),
], 'section', 'travel-field-guide')

const tips = group('tips-page', [
  group('tips-hero tips-container', [
    group('tips-hero-copy', [
      back('tips-back'), paragraph('A little know-how for the way', 'tips-kicker'),
      heading('Little tips.<br>Bigger adventures.', 1, '', 'tips-title'),
      paragraph('Go a little more prepared.', 'tips-hero-script'),
      paragraph('Pack lighter, plan smarter, and leave a little room for getting wonderfully lost. The useful bits, all in one place.', 'tips-hero-description'),
      buttons([button('Check your destination ↓', '#country-safety', 'tips-primary-button')]),
    ]),
    group('tips-hero-art', [
      photo('images/blog-hammock-v2.webp', 'A hammock between palms beside a turquoise sea', 'tips-photo', 'A little planning. A lot of possibility.'),
      group('tips-compass-stamp', [paragraph('GO CURIOUS'), html(icon(Compass)), paragraph('TRAVEL MINDFULLY')]),
      paragraph('For the good part of getting away.', 'tips-photo-note'),
    ]),
  ], 'section'),
  group('tips-chapters tips-container', [
    paragraph('A few things for your carry-on', 'tips-kicker'),
    paragraph('<a href="#country-safety"><small>01 · BEFORE YOU BOOK</small><span>Know before you go</span> →</a>', 'wei-chapter'),
    paragraph('<a href="#travel-field-guide"><small>02 · ALONG THE WAY</small><span>Make the most of it</span> →</a>', 'wei-chapter'),
    paragraph('<a href="#packing-list"><small>03 · THE ESSENTIALS</small><span>Pack a little lighter</span> →</a>', 'wei-chapter'),
  ], 'nav'),
  group('tips-safety-wrap tips-container', [dynamic('travel-safety'), dynamic('travel-entry')]),
  fieldGuide,
  group('tips-packing-wrap tips-container', dynamic('packing-checklist')),
  group('tips-next-stop', group('tips-container tips-next-inner', [
    photo('images/destinations/greece-400.webp', 'Whitewashed buildings and blue domes in Greece', 'wei-next-photo'),
    group('', [paragraph('Now for the lovely part', 'tips-script'), heading('Where will you wander next?', 2, '', 'tips-next-heading'), paragraph('A few places to put all that preparation to good use.'), paragraph('<a href="{{url:/destinations}}">Open the adventure atlas →</a>', 'tips-text-link')]),
    postmark('tips-stamp'),
  ]), 'section'),
])

const budget = group('budget-page', group('budget-main', [
  back('budget-back'),
  group('budget-message', [
    html(`<div class="budget-plane" aria-hidden="true"><svg class="budget-flight-path" viewBox="0 0 220 85" fill="none"><path d="M4 66c33-34 71 24 109-4s-5-54-23-26 19 45 64 8"/></svg>${icon(PaperPlaneTilt, '', 54)}</div>`),
    paragraph('More adventures. A little less spending.', 'budget-eyebrow'), heading('Budget guides', 1, '', 'budget-title'),
    paragraph('A little work in progress', 'budget-script'), wave(),
    paragraph('This page is a work in progress at the moment. I’m putting together practical guides to help you plan memorable adventures on a smaller budget.', 'budget-description'),
    paragraph('In the meantime, there’s plenty to explore.', 'budget-invitation'),
    buttons([button('Explore travel tips →', '{{url:/travel-tips}}', 'budget-primary'), button('Browse destinations →', '{{url:/destinations}}', 'budget-secondary')], 'budget-actions'),
  ], 'section'),
]))

const destinations = group('atlas-page', [
  group('atlas-intro', [back('atlas-back'), paragraph('Small trips. Lasting memories.', 'atlas-intro-script'), heading('A world of little adventures', 1, '', 'atlas-title'), paragraph('Every pin is a place. Every place has a story.<br class="atlas-mobile-break"> Pick one and wander a little.'), wave()], 'section'),
  dynamic('destination-atlas'),
])

const subscribe = group('subscribe-page', group('subscribe-main', group('subscribe-container subscribe-layout', [
  group('subscribe-intro', [paragraph('Letters from Wei', 'subscribe-script'), heading('A little wanderlust,<br>delivered.', 1, '', 'subscribe-title'), wave(), paragraph('Travel stories, useful tips, and affordable escapes for making the most of your annual leave. From my adventures to yours.', 'subscribe-invitation')], 'section'),
  group('subscribe-form-panel', [
    heading('Come along for the adventure.', 2, '', 'subscribe-form-title'), paragraph('A little inspiration for your next escape.', 'subscribe-form-intro'), dynamic('newsletter-signup'),
    details('A note on your details', paragraph('Your email address is used to send Letters from Wei. If you share your first name, it helps personalise the newsletter. Signing up means you agree to receive these emails.'), 'subscribe-privacy'),
  ], 'section'),
  group('subscribe-letter-details', group('subscribe-postcard-wrap', [photo('images/alpine-hero-v1.webp', 'Watercolour mountains rising above a turquoise alpine lake', 'subscribe-postcard', 'See you out there, <span>Wei</span>'), postmark('subscribe-stamp')]), 'section'),
])))

const unsubscribe = group('subscribe-page', dynamic('newsletter-unsubscribe'))
const pages = { home, 'about-me': about, 'travel-tips': tips, 'budget-guides': budget, destinations, subscribe, unsubscribe }

await mkdir(path.join(theme, 'content'), { recursive: true })
for (const [slug, content] of Object.entries(pages)) await writeFile(path.join(theme, 'content', `${slug}.html`), content, 'utf8')

// Patterns provide an easy way to reuse a design section on a new page. Keep the
// content token format identical to the importer and resolve against this theme.
const patterns = [
  ['alpine-hero', 'Alpine adventure hero', hero, 'featured, banner'],
  ['about-introduction', 'Wei’s postcard introduction', group('about-page', group('about-container', aboutIntro)), 'about'],
  ['travel-field-guide', 'Editable travel field guide', group('tips-page', fieldGuide), 'text'],
]
await mkdir(path.join(theme, 'patterns'), { recursive: true })
for (const [slug, title, content, categories] of patterns) {
  const phpContent = content.replace(/\{\{asset:([^}]+)\}\}/g, (_, file) => `<?php echo esc_url( get_theme_file_uri( 'assets/${file}' ) ); ?>`).replace(/\{\{url:([^}]+)\}\}/g, (_, url) => `<?php echo esc_url( home_url( '${url}' ) ); ?>`)
  await writeFile(path.join(theme, 'patterns', `${slug}.php`), `<?php\n/**\n * Title: ${title}\n * Slug: weis-tiny-adventures/${slug}\n * Categories: ${categories}\n * Description: Editable text, images and links from the travel journal.\n */\nif ( ! defined( 'ABSPATH' ) ) { exit; }\n?>\n${phpContent}`, 'utf8')
}
console.log(`Generated ${Object.keys(pages).length} editable pages and ${patterns.length} patterns.`)
