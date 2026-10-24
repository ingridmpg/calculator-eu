import type { CountryCode } from '../data/countries/index.ts'

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
    comingSoon: 'Em breve',
    names: {
      PT: 'Portugal',
      ES: 'Espanha',
      FR: 'França',
      DE: 'Alemanha',
      NL: 'Países Baixos',
      IE: 'Irlanda',
      IT: 'Itália',
      BE: 'Bélgica',
    } satisfies Record<CountryCode, string>,
  },
  result: {
    netAnnual: 'Líquido por ano',
    netMonthly: 'Por mês (12 meses)',
    effectiveRate: 'Taxa efetiva',
    taxYear: (year: number) => `Regras fiscais de ${year}.`,
    unavailable: 'O cálculo para este país ainda está a ser preparado. Escolha Portugal para ver um resultado.',
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
