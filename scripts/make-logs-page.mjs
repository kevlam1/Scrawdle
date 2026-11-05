// Builds the build-log page, frontend/logs/index.html (served at /logs), from log.md, the one-sentence summaries in scripts/log-summaries.mjs,
// and the page layout in scripts/logs-template.html. Run it from the project folder: node scripts/make-logs-page.mjs
// Run it again whenever log.md or a summary changes, and commit the page it writes. With --check it writes nothing and fails if the
// committed page is out of date (tests/logs-page.test.js runs that, so a log entry without its summary is caught).
// It stops with a message if a numbered log section has no summary, and it checks that every word of log.md made it onto
// the page, so nothing can be dropped without being noticed.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { SUMMARIES } from './log-summaries.mjs'

const here = new URL('.', import.meta.url)
const logText = readFileSync(new URL('../log.md', here), 'utf8').replace(/\r\n/g, '\n')
const template = readFileSync(new URL('logs-template.html', here), 'utf8')

// ---------- The tiny bit of markdown the log uses: bold, code, bullets (two levels), paragraphs ----------
const esc = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Code spans are set aside first, so a star or an angle bracket inside backticks (like `*.local` or `<dialog>`) is left alone.
function inline(text) {
  const codes = []
  const held = text.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code)
    return `\u0000${codes.length - 1}\u0000`
  })
  return esc(held)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`)
}

function renderBlock(lines) {
  const html = []
  let paragraph = []
  let items = null // the bullet list being read: [{ text, children: [text], extra: [text] }]

  const flushParagraph = () => {
    if (paragraph.length > 0) html.push(`<p>${inline(paragraph.join(' '))}</p>`)
    paragraph = []
  }
  const flushList = () => {
    if (items === null) return
    const li = (item) => {
      const nested = item.children.length > 0 ? `<ul>${item.children.map((c) => `<li>${inline(c)}</li>`).join('')}</ul>` : ''
      const extra = item.extra.map((e) => `<p>${inline(e)}</p>`).join('')
      return `<li>${inline(item.text)}${nested}${extra}</li>`
    }
    html.push(`<ul>${items.map(li).join('')}</ul>`)
    items = null
  }

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '')
    if (line.trim() === '' || line.trim() === '---') {
      flushParagraph() // a blank line ends a paragraph, but not a list: a list goes on past blank lines
      continue
    }
    const bullet = /^( *)- (.*)$/.exec(line)
    if (bullet) {
      flushParagraph()
      if (items === null) items = []
      if (bullet[1].length === 0 || items.length === 0) items.push({ text: bullet[2], children: [], extra: [] })
      else items[items.length - 1].children.push(bullet[2])
      continue
    }
    if (items !== null && /^ +\S/.test(line)) {
      items[items.length - 1].extra.push(line.trim()) // an indented line after a bullet belongs to that bullet
      continue
    }
    flushList()
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      flushParagraph()
      html.push(`<p class="sub">${inline(line.trim())}</p>`) // a bold line on its own is a small heading
    } else {
      paragraph.push(line.trim())
    }
  }
  flushParagraph()
  flushList()
  return html.join('\n')
}

// ---------- Split log.md into its "##" sections ----------
const sections = []
for (const line of logText.split('\n')) {
  if (line.startsWith('## ')) sections.push({ title: line.slice(3).trim(), lines: [] })
  else if (sections.length > 0) sections[sections.length - 1].lines.push(line)
}

const numbered = []
let setOut = null
let misread = null
let decisions = null
for (const section of sections) {
  // "12. Title (2026-11-01) — Kevin": the name after the dash is the author, and it is optional.
  const match = /^(\d+)\. (.+?) \((\d{4}-\d{2}-\d{2})\)(?: [—–-] (.+))?$/.exec(section.title)
  if (match) numbered.push({ ...section, number: Number(match[1]), name: match[2], date: match[3], author: match[4] || '' })
  else if (/^what (i|we) set out to build$/i.test(section.title)) setOut = section // older logs said "What I", this one says "What we"
  else if (/^where ai misread me/i.test(section.title)) misread = section
  else if (/^decisions and abandoned ideas$/i.test(section.title)) decisions = section
  else throw new Error(`Unexpected section in log.md: "${section.title}". Add it to scripts/make-logs-page.mjs.`)
}
if (!setOut || !misread || !decisions) throw new Error('log.md is missing "What we set out to build", "Where AI misread me" or "Decisions and abandoned ideas".')

numbered.forEach((section, i) => {
  if (section.number !== i + 1) throw new Error(`Log sections should count 1, 2, 3 ... but found ${section.number} after ${i}.`)
  if (!SUMMARIES[section.number]) throw new Error(`Log section ${section.number} ("${section.name}") has no summary. Add one to scripts/log-summaries.mjs.`)
})
for (const key of ['misread', 'decisions']) if (!SUMMARIES[key]) throw new Error(`Missing the "${key}" summary in scripts/log-summaries.mjs.`)

// ---------- Build the pieces of the page ----------
const checks = [] // [name, markdown lines, html] for the word check at the end

function dayLabel(date) {
  const d = new Date(`${date}T12:00:00`)
  const part = (options) => new Intl.DateTimeFormat('en-US', options).format(d)
  return `${part({ weekday: 'long' })} ${part({ day: 'numeric' })} ${part({ month: 'long' })}`
}

// "12 to 24 October 2026": the first and last day in the log. If they are in different months, both months are named.
function dateRange(dates) {
  const sorted = [...dates].sort()
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const part = (date, options) => new Intl.DateTimeFormat('en-US', options).format(new Date(`${date}T12:00:00`))
  const day = (date) => part(date, { day: 'numeric' })
  const month = (date) => part(date, { month: 'long' })
  const year = (date) => part(date, { year: 'numeric' })
  return month(first) === month(last)
    ? `${day(first)} to ${day(last)} ${month(last)} ${year(last)}`
    : `${day(first)} ${month(first)} to ${day(last)} ${month(last)} ${year(last)}`
}

function entryHtml({ id, badge, title, summary, lines, author = '' }) {
  const body = renderBlock(lines)
  checks.push([title, lines, body])
  return `<article class="entry" id="${id}">
  <h3 class="entry-head"><button type="button" aria-expanded="false" aria-controls="${id}-body">
    <span class="num">${badge}</span>
    <span><span class="title">${inline(title)}${author ? `<span class="by">by ${esc(author)}</span>` : ''}</span><span class="sum">${esc(summary)}</span></span>
    <span class="caret" aria-hidden="true"></span>
  </button></h3>
  <div class="body" id="${id}-body"><div class="body-in"><div class="body-pad">
${body}
  </div></div></div>
</article>`
}

// The build: the numbered sections, grouped by the day they are dated.
const days = []
for (const section of numbered) {
  const label = dayLabel(section.date)
  if (days.length === 0 || days[days.length - 1].label !== label) days.push({ label, sections: [] })
  days[days.length - 1].sections.push(section)
}

const buildHtml = days
  .map((day) => {
    const entries = day.sections
      .map((s) => entryHtml({ id: `entry-${s.number}`, badge: String(s.number), title: s.name, summary: SUMMARIES[s.number], lines: s.lines, author: s.author }))
      .join('\n')
    return `<h3 class="day">${esc(day.label)}</h3>\n${entries}`
  })
  .join('\n')

const reflectionHtml = [
  entryHtml({ id: 'reflection-misread', badge: '•', title: misread.title, summary: SUMMARIES.misread, lines: misread.lines }),
  entryHtml({ id: 'reflection-decisions', badge: '•', title: decisions.title, summary: SUMMARIES.decisions, lines: decisions.lines }),
].join('\n')

const setOutBody = renderBlock(setOut.lines)
checks.push(['What we set out to build', setOut.lines, setOutBody])
const setOutHtml = `<section class="setout"><h2>${esc(setOut.title)}</h2>${setOutBody}</section>`

// The Contents dropdown: one group per day, then the reflection.
const tocGroup = (label, links) => `<div class="toc-group is-open">
  <button class="toc-head" type="button" aria-expanded="true">${esc(label)} <span class="count">${links.length}</span></button>
  <div class="toc-list-wrap"><ul class="toc-list">
${links.map(([id, n, name]) => `    <li><a href="#${id}"><span class="n">${n}</span><span>${inline(name)}</span></a></li>`).join('\n')}
  </ul></div>
</div>`
const tocHtml = [
  ...days.map((day) => tocGroup(day.label, day.sections.map((s) => [`entry-${s.number}`, String(s.number), s.name]))),
  tocGroup('Reflection', [
    ['reflection-misread', '•', misread.title],
    ['reflection-decisions', '•', decisions.title],
  ]),
].join('\n')

// ---------- The word check: everything in log.md has to be on the page ----------
const words = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const fromMarkdown = (lines) => words(lines.join(' ').replace(/`/g, ''))
const fromHtml = (html) => words(html.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&'))
for (const [name, lines, html] of checks) {
  if (fromMarkdown(lines) !== fromHtml(html)) throw new Error(`The page text for "${name}" does not match log.md. The converter dropped or changed something.`)
}

// ---------- Write the page ----------
// The pieces go in through functions, never as plain strings: String.replace treats "$'" and "$`" in a plain replacement
// string as patterns, and the log has text like ${...} in it, which once pasted half the template into the page.
const parts = {
  COUNT: String(numbered.length),
  DATES: dateRange(numbered.map((section) => section.date)),
  TOC: tocHtml,
  SETOUT: setOutHtml,
  BUILD: buildHtml,
  REFLECTION: reflectionHtml,
}
let page = template
for (const [name, value] of Object.entries(parts)) page = page.replace(`{{${name}}}`, () => value)
if (/\{\{[A-Z]+\}\}/.test(page)) throw new Error('The template has a placeholder that was not filled in.')
// The page must be exactly the template with the pieces put in: nothing added, nothing repeated.
const expectedLength = template.length - Object.keys(parts).reduce((sum, name) => sum + `{{${name}}}`.length, 0) + Object.values(parts).reduce((sum, value) => sum + value.length, 0)
if (page.length !== expectedLength) throw new Error(`The page is ${page.length} characters but should be ${expectedLength}. Something was added or repeated.`)
if (page.split('<script>').length !== template.split('<script>').length) throw new Error('The page has a different number of scripts than the template.')
const outUrl = new URL('../frontend/logs/index.html', here)
if (process.argv.includes('--check')) {
  const current = existsSync(outUrl) ? readFileSync(outUrl, 'utf8').replace(/\r\n/g, '\n') : null
  if (current !== page.replace(/\r\n/g, '\n')) {
    console.error('frontend/logs/index.html is out of date with log.md or the summaries. Add a summary for any new entry to scripts/log-summaries.mjs, then run: node scripts/make-logs-page.mjs')
    process.exit(1)
  }
  console.log('frontend/logs/index.html matches log.md.')
} else {
  mkdirSync(new URL('.', outUrl), { recursive: true })
  writeFileSync(outUrl, page)
  console.log(`Wrote frontend/logs/index.html: ${numbered.length} entries in ${days.length} days, plus the reflection. Every word of log.md is on the page.`)
}
