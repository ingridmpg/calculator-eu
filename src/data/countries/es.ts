import { progressiveTax } from '../../lib/tax.ts'
import { scaleSections, step } from '../../lib/trace.ts'
import type {
  CountryTaxModel,
  Household,
  TaxBracket,
  TaxSection,
  TraceStep,
} from '../../lib/types.ts'

// Spain, tax year 2026: IRPF (state + Comunidad de Madrid) for employees with a
// permanent contract, paid in 12 monthly instalments. A married couple with two
// similar salaries is better off filing two individual returns than a joint one
// (which doubles no amount, art. 84.1), so each spouse files on half the household
// salary and the child minimums are split equally between them (LIRPF art. 61).

/** Monthly contribution ceiling (Orden PJC/297/2026, art. 2), as an annual amount. */
const MONTHLY_CONTRIBUTION_CEILING = 5_101.2
const ANNUAL_CONTRIBUTION_CEILING = MONTHLY_CONTRIBUTION_CEILING * 12

/**
 * Employee share (Orden PJC/297/2026): contingencias comunes 4.70% + desempleo 1.55%
 * (permanent contract) + formación profesional 0.10% + MEI 0.15%, up to the ceiling.
 */
const SOCIAL_SECURITY_RATE = 0.047 + 0.0155 + 0.001 + 0.0015

/**
 * Employer share (Orden PJC/297/2026): contingencias comunes 23.60% + desempleo 5.50%
 * (permanent contract) + FOGASA 0.20% + formación profesional 0.60% + MEI 0.75%,
 * up to the ceiling.
 */
const EMPLOYER_SOCIAL_SECURITY_RATE = 0.236 + 0.055 + 0.002 + 0.006 + 0.0075

/**
 * Accidentes de trabajo y enfermedades profesionales, paid by the employer up to the ceiling.
 * Reference: office work (LGSS DA 61ª, cuadro II a: IT 0.80% + IMS 0.70%).
 */
const WORK_ACCIDENT_RATE = 0.008 + 0.007

/** Cotización adicional de solidaridad on pay above the ceiling (art. 17), by tranche. */
function solidarityBrackets(rates: readonly [number, number, number]): readonly TaxBracket[] {
  return [
    { upTo: ANNUAL_CONTRIBUTION_CEILING, rate: 0 },
    { upTo: 5_611.32 * 12, rate: rates[0] },
    { upTo: 7_651.8 * 12, rate: rates[1] },
    { upTo: Infinity, rate: rates[2] },
  ]
}

const SOLIDARITY_CONTRIBUTION_BRACKETS = solidarityBrackets([0.0019, 0.0021, 0.0024])
const EMPLOYER_SOLIDARITY_CONTRIBUTION_BRACKETS = solidarityBrackets([0.0096, 0.0104, 0.0122])

/** LIRPF art. 19.2.f: flat "otros gastos" deduction for employees. */
const OTHER_EXPENSES_DEDUCTION = 2_000

/** LIRPF art. 57: state mínimo del contribuyente. */
const STATE_PERSONAL_MINIMUM = 5_550

/** LIRPF art. 58.1: state mínimo por descendientes, first and second child. */
const STATE_CHILD_MINIMUMS = [2_400, 2_700]

/** Comunidad de Madrid mínimo del contribuyente. */
const MADRID_PERSONAL_MINIMUM = 5_956.65

/** Comunidad de Madrid mínimo por descendientes, first and second child. */
const MADRID_CHILD_MINIMUMS = [2_575.85, 2_897.83]

/** LIRPF art. 63: state scale. */
const STATE_BRACKETS: readonly TaxBracket[] = [
  { upTo: 12_450, rate: 0.095 },
  { upTo: 20_200, rate: 0.12 },
  { upTo: 35_200, rate: 0.15 },
  { upTo: 60_000, rate: 0.185 },
  { upTo: 300_000, rate: 0.225 },
  { upTo: Infinity, rate: 0.245 },
]

/** Comunidad de Madrid regional scale (unchanged in 2026; a cut is planned for 2027). */
const MADRID_BRACKETS: readonly TaxBracket[] = [
  { upTo: 13_362.22, rate: 0.085 },
  { upTo: 19_004.63, rate: 0.107 },
  { upTo: 35_425.68, rate: 0.128 },
  { upTo: 57_320.4, rate: 0.174 },
  { upTo: Infinity, rate: 0.205 },
]

/** RD-ley 5/2026: tax credit so that minimum-wage earners (€17,094) pay no IRPF. */
const MINIMUM_WAGE = 17_094
const MINIMUM_WAGE_CREDIT = 590.89
const MINIMUM_WAGE_CREDIT_TAPER = 0.2

/** LIRPF art. 20: reduction for low employment income, on income net of social security. */
function lowIncomeReduction(netEmploymentIncome: number): number {
  if (netEmploymentIncome <= 14_852) return 7_302
  if (netEmploymentIncome <= 17_673.52) return 7_302 - 1.75 * (netEmploymentIncome - 14_852)
  if (netEmploymentIncome <= 19_747.5) return 2_364.34 - 1.14 * (netEmploymentIncome - 17_673.52)
  return 0
}

/** The personal minimum is taxed at 0%: tax on the base minus tax on the minimum. */
function taxAboveMinimum(base: number, minimum: number, brackets: readonly TaxBracket[]): number {
  return progressiveTax(base, brackets) - progressiveTax(Math.min(base, minimum), brackets)
}

/** Personal minimum plus this earner's share of the minimum for each child. */
function personalAndFamilyMinimum(
  personal: number,
  childMinimums: readonly number[],
  children: number,
  childShare: number,
): number {
  const childTotal = childMinimums.slice(0, children).reduce((total, amount) => total + amount, 0)
  return personal + childTotal * childShare
}

function minimumWageCredit(gross: number): number {
  const credit = MINIMUM_WAGE_CREDIT - MINIMUM_WAGE_CREDIT_TAPER * Math.max(gross - MINIMUM_WAGE, 0)
  return Math.max(credit, 0)
}

/** One individual return; `childShare` is this earner's share of the child minimums. */
function individualReturn(gross: number, children: number, childShare: number): TaxSection[] {
  const contribution = Math.min(gross, ANNUAL_CONTRIBUTION_CEILING) * SOCIAL_SECURITY_RATE
  const solidarityContribution = progressiveTax(gross, SOLIDARITY_CONTRIBUTION_BRACKETS)
  const socialSecurity = contribution + solidarityContribution

  const netEmploymentIncome = Math.max(gross - socialSecurity, 0)
  const reduction = lowIncomeReduction(netEmploymentIncome)
  const taxBase = Math.max(netEmploymentIncome - OTHER_EXPENSES_DEDUCTION - reduction, 0)
  const stateMinimum = personalAndFamilyMinimum(
    STATE_PERSONAL_MINIMUM,
    STATE_CHILD_MINIMUMS,
    children,
    childShare,
  )
  const madridMinimum = personalAndFamilyMinimum(
    MADRID_PERSONAL_MINIMUM,
    MADRID_CHILD_MINIMUMS,
    children,
    childShare,
  )

  return [
    {
      part: 'socialSecurity',
      steps: [
        step.base('employeeContribution', contribution, SOCIAL_SECURITY_RATE),
        step.add('solidarityContribution', solidarityContribution),
      ],
    },
    {
      part: 'incomeTax',
      steps: [
        step.base('gross', gross),
        step.subtract('deductibleContributions', socialSecurity),
        step.subtract('otherExpenses', OTHER_EXPENSES_DEDUCTION),
        step.subtract('lowIncomeReduction', reduction),
        step.subtotal('taxableIncome', taxBase),
        step.base('stateTax', taxAboveMinimum(taxBase, stateMinimum, STATE_BRACKETS)),
        step.add('regionalTax', taxAboveMinimum(taxBase, madridMinimum, MADRID_BRACKETS)),
        step.subtract('minimumWageCredit', minimumWageCredit(gross)),
      ],
    },
  ]
}

/** Each adult files on an equal share of the household salary; the steps show the sum. */
function computeTaxes(gross: number, { adults, children }: Household): TaxSection[] {
  return scaleSections(individualReturn(gross / adults, children, 1 / adults), adults)
}

function computeEmployerContributions(gross: number): TraceStep[] {
  const contributionBase = Math.min(gross, ANNUAL_CONTRIBUTION_CEILING)
  return [
    step.add(
      'employerContribution',
      contributionBase * EMPLOYER_SOCIAL_SECURITY_RATE,
      EMPLOYER_SOCIAL_SECURITY_RATE,
    ),
    step.add('workAccidentInsurance', contributionBase * WORK_ACCIDENT_RATE, WORK_ACCIDENT_RATE),
    step.add(
      'solidarityContribution',
      progressiveTax(gross, EMPLOYER_SOLIDARITY_CONTRIBUTION_BRACKETS),
    ),
  ]
}

export const spain: CountryTaxModel = {
  year: 2026,
  sources: [
    {
      id: 'contributions',
      label: 'Orden PJC/297/2026 — bases y tipos de cotización 2026 (BOE)',
      url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296',
    },
    {
      id: 'irpfLaw',
      label: 'Ley 35/2006 del IRPF — texto consolidado (BOE)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
    },
    {
      id: 'madrid',
      label: 'IRPF — escala autonómica y mínimo del contribuyente (Comunidad de Madrid)',
      url: 'https://www.comunidad.madrid/atencion-contribuyente/irpf',
    },
    {
      id: 'workAccidentRates',
      label: 'RD-ley 3/2026 — tarifa de primas por accidentes de trabajo (BOE)',
      url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-2548',
    },
    {
      id: 'jointReturn',
      label: 'Características de la tributación conjunta (Agencia Tributaria)',
      url: 'https://sede.agenciatributaria.gob.es/Sede/irpf/tengo-que-presentar-declaracion/declaracion-individual-conjunta/caracteristicas-tributacion-conjunta.html',
    },
    {
      id: 'madridMinimums',
      label: 'Beneficios fiscales: mínimos personales y familiares (Comunidad de Madrid)',
      url: 'https://www.comunidad.madrid/atencion-contribuyente/beneficios-fiscales',
    },
    {
      id: 'minimumWage',
      label: 'RD-ley 5/2026 — deducción para perceptores del SMI (Iberley)',
      url: 'https://www.iberley.es/noticias/medidas-fiscales-rd-ley-5-2026-elimina-irpf-perceptores-smi-2026-adopta-medidas-los-afectados-las-borrascas-36098',
    },
  ],
  notes: [
    { id: 'referenceCity', kind: 'included', sourceIds: ['madrid'] },
    { id: 'contributions', kind: 'included', sourceIds: ['contributions'] },
    {
      id: 'individualReturns',
      kind: 'included',
      sourceIds: ['irpfLaw', 'jointReturn', 'madridMinimums'],
    },
    { id: 'employerCost', kind: 'included', sourceIds: ['contributions', 'workAccidentRates'] },
    { id: 'familyBenefits', kind: 'excluded', sourceIds: [] },
  ],
  computeTaxes,
  computeEmployerContributions,
}
