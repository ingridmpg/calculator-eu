import { strings } from '../i18n/index.ts'
import { formatCurrency, formatRate } from '../lib/format.ts'
import { getVisibleTrace, step, withoutZeroChanges } from '../lib/trace.ts'
import type { SalaryResult, TaxPartKey, TraceOperation, TraceStep } from '../lib/types.ts'
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
  const t = strings.trace

  return (
    <Disclosure title={t.title}>
      {getVisibleTrace(result).map(({ part, steps }) => (
        <TraceList
          key={part}
          title={strings.breakdown[part]}
          part={part}
          steps={steps}
          total={result[part]}
          totalLabel={t.total}
        />
      ))}

      <TraceList
        title={t.employerTitle}
        steps={[step.base('gross', result.gross), ...withoutZeroChanges(result.employerTrace)]}
        total={result.employerCost}
        totalLabel={t.employerTotal}
      />
    </Disclosure>
  )
}

interface TraceListProps {
  title: string
  /** The salary part the list explains, for its colour; none for the employer cost. */
  part?: TaxPartKey
  steps: readonly TraceStep[]
  total: number
  totalLabel: string
}

function TraceList({ title, part, steps, total, totalLabel }: TraceListProps) {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>
        {part && <PartSwatch part={part} />}
        {title}
      </h3>

      <dl className={styles.list}>
        {steps.map((traceStep, index) => (
          <StepRow key={`${traceStep.key}-${index}`} traceStep={traceStep} />
        ))}
        {/* A list that ends on a new amount (e.g. tax from the scale) needs no total row. */}
        {steps.at(-1)?.operation !== 'base' && (
          <div className={styles.row} data-total="true">
            <dt>{totalLabel}</dt>
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
