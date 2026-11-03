import { strings } from '../i18n/index.ts'
import { formatCurrency, formatRate } from '../lib/format.ts'
import { getVisibleTrace } from '../lib/trace.ts'
import type { SalaryResult, TaxSection, TraceOperation, TraceStep } from '../lib/types.ts'
import { Disclosure } from './Disclosure.tsx'
import { PartSwatch } from './PartSwatch.tsx'
import styles from './CalculationTrace.module.css'

const OPERATION_SIGN: Record<TraceOperation, string> = {
  base: '',
  add: '+ ',
  subtract: '− ',
  subtotal: '= ',
}

interface CalculationTraceProps {
  result: SalaryResult
}

export function CalculationTrace({ result }: CalculationTraceProps) {
  return (
    <Disclosure title={strings.trace.title}>
      {getVisibleTrace(result).map((section) => (
        <TraceSectionList key={section.part} section={section} total={result[section.part]} />
      ))}
    </Disclosure>
  )
}

interface TraceSectionListProps {
  section: TaxSection
  total: number
}

function TraceSectionList({ section, total }: TraceSectionListProps) {
  const { part, steps } = section

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>
        <PartSwatch part={part} />
        {strings.breakdown[part]}
      </h3>

      <dl className={styles.list}>
        {steps.map((traceStep, index) => (
          <StepRow key={`${traceStep.key}-${index}`} traceStep={traceStep} />
        ))}
        {/* A section that ends on a new amount (e.g. tax from the scale) needs no total row. */}
        {steps.at(-1)?.operation !== 'base' && (
          <div className={styles.row} data-total="true">
            <dt>{strings.trace.total}</dt>
            <dd className={styles.amount}>{formatCurrency(total)}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}

function StepRow({ traceStep }: { traceStep: TraceStep }) {
  const { key, operation, amount, rate } = traceStep
  const label = strings.trace.steps[key]

  return (
    <div className={styles.row} data-operation={operation}>
      <dt>{rate === undefined ? label : `${label} (${formatRate(rate)})`}</dt>
      <dd className={styles.amount}>
        {OPERATION_SIGN[operation]}
        {formatCurrency(amount)}
      </dd>
    </div>
  )
}
