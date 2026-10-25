import { progressiveTax } from '../../lib/tax.ts'
import type { CountryTaxModel, TaxBracket, TaxComponents } from '../../lib/types.ts'

// Italy, tax year 2026: private-sector employee first insured after 1995, living in
// Milan (Lombardia regional + Milan municipal surcharges).
//
// Not modelled: the tax-free cash supplement for income up to €20,000 (L. 207/2024,
// art. 1 c. 4) and the trattamento integrativo up to €15,000, both paid with the salary.
// They raise net pay for low incomes, so results below ~€20,000 are conservative.

/** INPS employee share (IVS 9.19%), plus 1% on pay above the first pension band. */
const INPS_RATE = 0.0919
const INPS_EXTRA_RATE = 0.01
/** INPS circolare n. 6/2026. */
const INPS_EXTRA_THRESHOLD = 56_224
const INPS_CEILING = 122_295

const INPS_BRACKETS: readonly TaxBracket[] = [
  { upTo: INPS_EXTRA_THRESHOLD, rate: INPS_RATE },
  { upTo: INPS_CEILING, rate: INPS_RATE + INPS_EXTRA_RATE },
  { upTo: Infinity, rate: 0 },
]

/** TUIR art. 11 as amended by the Legge di Bilancio 2026 (second rate 35% → 33%). */
const IRPEF_BRACKETS: readonly TaxBracket[] = [
  { upTo: 28_000, rate: 0.23 },
  { upTo: 50_000, rate: 0.33 },
  { upTo: Infinity, rate: 0.43 },
]

/** Lombardia regional surcharge (l.r. 10/2003 art. 72, brackets from l.r. 5/2022). */
const LOMBARDIA_BRACKETS: readonly TaxBracket[] = [
  { upTo: 15_000, rate: 0.0123 },
  { upTo: 28_000, rate: 0.0158 },
  { upTo: 50_000, rate: 0.0172 },
  { upTo: Infinity, rate: 0.0173 },
]

/** Milan municipal surcharge: 0.8% on the whole income, none up to €23,000. */
const MILAN_RATE = 0.008
const MILAN_EXEMPTION_LIMIT = 23_000

/** TUIR art. 13 c. 1: employment tax credit (detrazione per lavoro dipendente). */
function employmentCredit(income: number): number {
  let credit: number
  if (income <= 15_000) credit = 1_955
  else if (income <= 28_000) credit = 1_910 + (1_190 * (28_000 - income)) / 13_000
  else if (income <= 50_000) credit = (1_910 * (50_000 - income)) / 22_000
  else credit = 0

  // TUIR art. 13 c. 1.1: extra €65 for income between €25,000 and €35,000.
  const bonus = income > 25_000 && income <= 35_000 ? 65 : 0
  return credit + bonus
}

/** L. 207/2024 art. 1 c. 6: extra credit of €1,000 from €20,000, phased out by €40,000. */
function wedgeCredit(income: number): number {
  if (income <= 20_000 || income > 40_000) return 0
  if (income <= 32_000) return 1_000
  return (1_000 * (40_000 - income)) / 8_000
}

function computeTaxes(gross: number): TaxComponents {
  const socialSecurity = progressiveTax(gross, INPS_BRACKETS)
  const taxableIncome = Math.max(gross - socialSecurity, 0)

  const grossIrpef = progressiveTax(taxableIncome, IRPEF_BRACKETS)
  const incomeTax = Math.max(
    grossIrpef - employmentCredit(taxableIncome) - wedgeCredit(taxableIncome),
    0,
  )

  const regionalSurcharge = progressiveTax(taxableIncome, LOMBARDIA_BRACKETS)
  const municipalSurcharge = taxableIncome > MILAN_EXEMPTION_LIMIT ? taxableIncome * MILAN_RATE : 0

  return { incomeTax, socialSecurity, otherTaxes: regionalSurcharge + municipalSurcharge }
}

export const italy: CountryTaxModel = {
  year: 2026,
  sources: [
    {
      label: 'IRPEF 2026: scaglioni e aliquote (Informazione Fiscale)',
      url: 'https://www.informazionefiscale.it/IRPEF-scaglioni-aliquote-calcolo',
    },
    {
      label: 'Minimali e massimali contributivi 2026, circolare INPS n. 6/2026 (Il Sole 24 Ore)',
      url: 'https://ntpluslavoro.ilsole24ore.com/art/aggiornati-minimali-e-massimali-retributivi-fini-contributivi-AIvjZDAB',
    },
    {
      label: 'Ulteriore detrazione L. 207/2024 (Studio Lizier Basso Bottari)',
      url: 'https://www.lizierbassobottari.it/2025/02/25/legge-n-207-2024-art-1-somma-integrativa-e-ulteriore-detrazione/',
    },
    {
      label: 'Addizionale regionale IRPEF (Regione Lombardia)',
      url: 'https://www.regione.lombardia.it/bollo-auto-e-tributi-regionali/red-addizionale-regionale-irpef',
    },
    {
      label: 'Addizionale comunale IRPEF Milano (MEF)',
      url: 'https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_addcomirpef/risultato.htm?anno=9999&lista=1&pagina=lombardia.htm&cm=&pr=MI&cc=F205&r=1',
    },
  ],
  computeTaxes,
}
