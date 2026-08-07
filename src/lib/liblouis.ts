import unicodeDis from '../tables/unicode.dis?raw'
import uebG2 from '../tables/en-ueb-g2.ctb?raw'
import uebG1 from '../tables/en-ueb-g1.ctb?raw'
import uebChardefs from '../tables/en-ueb-chardefs.uti?raw'
import uebMath from '../tables/en-ueb-math.ctb?raw'
import braillePatterns from '../tables/braille-patterns.cti?raw'
import latinLetterDef8Dots from '../tables/latinLetterDef8Dots.uti?raw'
import idG2 from '../tables/id-id-g2.ctb?raw'
import digits6Dots from '../tables/digits6Dots.uti?raw'

const TABLE_FILES: Record<string, string> = {
  'unicode.dis': unicodeDis,
  'en-ueb-g2.ctb': uebG2,
  'en-ueb-g1.ctb': uebG1,
  'en-ueb-chardefs.uti': uebChardefs,
  'en-ueb-math.ctb': uebMath,
  'braille-patterns.cti': braillePatterns,
  'latinLetterDef8Dots.uti': latinLetterDef8Dots,
  'id-id-g2.ctb': idG2,
  'digits6Dots.uti': digits6Dots,
}

/** Matches the language profiles in braillify-core's `config.py`. */
export const BRAILLE_TABLES = {
  id: 'tables/unicode.dis,tables/id-id-g2.ctb',
  en: 'tables/unicode.dis,tables/en-ueb-g2.ctb',
} as const

export type BrailleLanguage = keyof typeof BRAILLE_TABLES

let language: BrailleLanguage = 'id'

export function setLanguage(next: BrailleLanguage): void {
  language = next
}

export function getLanguage(): BrailleLanguage {
  return language
}

interface EasyApi {
  translateString(table: string, text: string): string | null
  capi: {
    FS: {
      mkdir(path: string): void
      writeFile(path: string, data: Uint8Array, opts: { encoding: string }): void
    }
  }
}

let api: EasyApi | null = null
let loading: Promise<void> | null = null

async function load(): Promise<void> {
  // Both packages predate ESM: the emscripten build assigns a bare `var
  // liblouisBuild` and easy-api is a UMD bundle, so neither survives Vite's CJS
  // interop. Evaluating the sources as scoped factories works identically in the
  // browser, in jsdom, and in the production bundle.
  const [{ default: buildSource }, { default: easyApiSource }] = await Promise.all([
    import('liblouis-build/build-no-tables-utf16.js?raw'),
    import('liblouis/easy-api.js?raw'),
  ])

  const build = new Function(`${buildSource}\nreturn liblouisBuild;`)()
  if (!build?._lou_version) throw new Error('liblouis wasm build failed to initialise')

  const easyApi: { EasyApi?: new (build: unknown) => EasyApi } = {}
  new Function('exports', easyApiSource)(easyApi)
  if (!easyApi.EasyApi) throw new Error('liblouis easy-api failed to load')

  const instance = new easyApi.EasyApi(build)

  const { FS } = instance.capi
  try {
    FS.mkdir('/tables')
  } catch {
    // Directory already exists — a previous init in this page session created it.
  }
  const encoder = new TextEncoder()
  for (const [name, source] of Object.entries(TABLE_FILES)) {
    FS.writeFile(`/tables/${name}`, encoder.encode(source), { encoding: 'binary' })
  }

  for (const table of Object.values(BRAILLE_TABLES)) {
    if (instance.translateString(table, 'a') === null) {
      throw new Error(`liblouis could not compile ${table}`)
    }
  }
  api = instance
}

export function initLiblouis(): Promise<void> {
  loading ??= load().catch(err => {
    loading = null
    throw err
  })
  return loading
}

export function isReady(): boolean {
  return api !== null
}

export function textToBraille(text: string, lang: BrailleLanguage = language): string {
  if (!text) return ''
  if (!api) throw new Error('liblouis not initialised — await initLiblouis() first')
  const out = api.translateString(BRAILLE_TABLES[lang], text)
  if (out === null) throw new Error('liblouis translation failed')
  return out
}
