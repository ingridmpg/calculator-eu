import type { CountryCode } from '../data/countries/index.ts'
import type { NoteKind, TraceStepKey } from '../lib/types.ts'

export const pt = {
  header: {
    title: 'Salário líquido na Europa',
    intro:
      'Escreva o seu salário bruto anual e escolha um país para ver quanto recebe ao fim do ano e para onde vai o resto.',
  },
  salary: {
    label: 'Salário bruto anual',
    sliderLabel: 'Ajustar salário bruto anual',
    currencySymbol: '€',
  },
  countries: {
    legend: 'País',
    names: {
      PT: 'Portugal',
      ES: 'Espanha',
      FR: 'França',
      DE: 'Alemanha',
      NL: 'Países Baixos',
      IE: 'Irlanda',
      IT: 'Itália',
    } satisfies Record<CountryCode, string>,
  },
  result: {
    netAnnual: 'Líquido por ano',
    netMonthly: 'Por mês (12 meses)',
    effectiveRate: 'Taxa efetiva',
    taxYear: (year: number) => `Regras fiscais de ${year}.`,
  },
  trace: {
    title: 'Como foi calculado',
    total: 'Total',
    steps: {
      gross: 'Salário bruto',
      netTaxableSalary: 'Salário líquido tributável',
      taxableIncome: 'Rendimento coletável',
      deductibleContributions: 'Contribuições dedutíveis',
      specificDeduction: 'Dedução específica',
      minimumExistence: 'Mínimo de existência',
      otherExpenses: 'Outras despesas do trabalho',
      lowIncomeReduction: 'Redução por rendimentos baixos',
      expensesAllowance: 'Dedução de 10% por despesas profissionais',
      employeeAllowance: 'Dedução fixa do trabalhador',
      specialExpensesAllowance: 'Dedução fixa de despesas especiais',
      taxFromScale: 'Imposto pela tabela progressiva',
      stateTax: 'Imposto estatal (depois do mínimo pessoal)',
      regionalTax: 'Imposto autonómico (depois do mínimo pessoal)',
      generalExpenses: 'Despesas gerais familiares',
      minimumWageCredit: 'Dedução para salários próximos do mínimo',
      decote: 'Décote',
      uncollectedTax: 'Imposto abaixo de 61 €, que não é cobrado',
      generalCredit: 'Crédito fiscal geral',
      labourCredit: 'Crédito fiscal do trabalho',
      personalCredits: 'Créditos fiscais pessoal e de trabalhador',
      employmentCredit: 'Dedução por trabalho dependente',
      wedgeCredit: 'Dedução adicional para rendimentos médios',
      employeeContribution: 'Contribuição do trabalhador',
      solidarityContribution: 'Contribuição de solidariedade',
      pensionContributions: 'Contribuições para a reforma',
      deductibleCsg: 'CSG dedutível',
      nonDeductibleCsgCrds: 'CSG não dedutível e CRDS',
      pensionInsurance: 'Seguro de pensões',
      unemploymentInsurance: 'Seguro de desemprego',
      healthInsurance: 'Seguro de saúde',
      longTermCareInsurance: 'Seguro de dependência',
      prsi: 'PRSI',
      inps: 'INPS',
      additionalSolidarityRate: 'Taxa adicional de solidariedade',
      solidaritySurcharge: 'Sobretaxa de solidariedade (Soli)',
      highIncomeContribution: 'Contribuição sobre rendimentos elevados',
      usc: 'USC',
      regionalSurcharge: 'Sobretaxa regional',
      municipalSurcharge: 'Sobretaxa municipal',
    } satisfies Record<TraceStepKey, string>,
  },
  notes: {
    title: 'Notas e fontes',
    sourcesTitle: 'Fontes',
    sourceReference: (number: number, label: string) => `Fonte ${number}: ${label}`,
    kinds: {
      included: 'Incluído no cálculo',
      excluded: 'Não incluído',
      pending: 'Por confirmar',
    } satisfies Record<NoteKind, string>,
    byCountry: {
      PT: {
        deductionsIncluded:
          'O mínimo de existência e a dedução de 250 € de despesas gerais familiares.',
        otherDeductions:
          'Outras deduções à coleta (saúde, educação, habitação), que dependem das despesas de cada pessoa.',
        rateCut:
          'A descida das taxas do IRS aprovada em outubro de 2026 ainda não está refletida: aguarda o decreto-lei do Governo.',
      },
      ES: {
        referenceCity:
          'Cidade de referência: Madrid (escala autonómica e mínimo pessoal da Comunidade de Madrid).',
        contributions:
          'Contrato sem termo. Contribuições até ao teto de 5101,20 € por mês e contribuição de solidariedade acima dele.',
      },
      FR: {
        nonExecutive: 'Trabalhador não-quadro (non-cadre).',
        taxScaleYear:
          'O imposto usa a tabela mais recente publicada (lei de finanças de 2026, sobre os rendimentos de 2025). As contribuições são as de 2026.',
        companyInsurance: 'Mutuelle e prévoyance, que dependem da empresa.',
      },
      DE: {
        careInsurance:
          'Sem filhos e com 23 anos ou mais, por isso inclui o suplemento do seguro de dependência. Seguro de saúde público com a contribuição adicional média de 2,9%.',
        annualTax:
          'Calcula o imposto anual final. A retenção mensal no recibo (Lohnsteuer) pode diferir alguns euros.',
      },
      NL: {
        nationalInsurance:
          'A contribuição do trabalhador para a segurança social nacional está incluída na taxa do 1.º escalão, por isso aparece dentro do imposto. O seguro de desemprego e a contribuição de saúde são pagos pelo empregador.',
        companyPension: 'Pensão da empresa, que varia de empregador para empregador, e deduções.',
      },
      IE: {
        taxCredits:
          'Os créditos fiscais pessoal e de trabalhador (4000 € no total). O USC aparece em «Outros impostos».',
        prsiRateChange:
          'O PRSI sobe de 4,2% para 4,35% a 1 de outubro de 2026; o cálculo pondera os dois períodos.',
      },
      IT: {
        referenceCity:
          'Cidade de referência: Milão. As sobretaxas regional (Lombardia) e municipal aparecem em «Outros impostos».',
        cashSupplements:
          'Os apoios em dinheiro que Itália paga junto com o salário até cerca de 20 000 €. Nessa faixa, o líquido real é um pouco mais alto.',
      },
    } satisfies Record<CountryCode, Record<string, string>>,
  },
  breakdown: {
    title: 'Para onde vai o salário bruto',
    gross: 'Salário bruto',
    incomeTax: 'Imposto sobre o rendimento',
    socialSecurity: 'Segurança Social',
    otherTaxes: 'Outros impostos',
    net: 'Salário líquido',
  },
  assumptions: {
    title: 'Pressupostos do cálculo',
    items: [
      'Pessoa solteira, sem dependentes.',
      'Trabalhador por conta de outrem, residente fiscal no país escolhido.',
      'Sem regimes especiais (por exemplo IRS Jovem, Lei Beckham ou a regra dos 30% nos Países Baixos).',
      'Sem imposto religioso. Impostos regionais e municipais usam uma média ou uma cidade de referência, indicada em cada país.',
      'Imposto anual final, depois do acerto de contas, e não a retenção mensal no recibo de vencimento.',
      'Valores em euros, por ano. São estimativas simplificadas e não substituem um simulador oficial.',
    ],
  },
}

export type Strings = typeof pt
