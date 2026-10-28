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
  notes: {
    title: 'Notas e fontes',
    sourcesTitle: 'Fontes',
    byCountry: {
      PT: [
        'Inclui o mínimo de existência e a dedução de 250 € de despesas gerais familiares. Não inclui outras deduções (saúde, educação, habitação).',
        'A descida das taxas do IRS aprovada em outubro de 2026 ainda não está refletida: aguarda o decreto-lei do Governo.',
      ],
      ES: [
        'Cidade de referência: Madrid (escala autonómica e mínimo pessoal da Comunidade de Madrid).',
        'Contrato sem termo. Contribuições até ao teto de 5101,20 € por mês e contribuição de solidariedade acima dele.',
      ],
      FR: [
        'Trabalhador não-quadro (non-cadre). Não inclui mutuelle nem prévoyance, que dependem da empresa.',
        'O imposto usa a tabela mais recente publicada (lei de finanças de 2026, sobre os rendimentos de 2025). As contribuições são as de 2026.',
      ],
      DE: [
        'Sem filhos e com 23 anos ou mais, por isso inclui o suplemento do seguro de dependência. Seguro de saúde público com a contribuição adicional média de 2,9%.',
        'Calcula o imposto anual final. A retenção mensal no recibo (Lohnsteuer) pode diferir alguns euros.',
      ],
      NL: [
        'A contribuição do trabalhador para a segurança social nacional está incluída na taxa do 1.º escalão, por isso aparece dentro do imposto. O seguro de desemprego e a contribuição de saúde são pagos pelo empregador.',
        'Sem pensão da empresa, que varia de empregador para empregador, e sem deduções.',
      ],
      IE: [
        'Inclui os créditos fiscais pessoal e de trabalhador (4000 € no total). O USC aparece em «Outros impostos».',
        'O PRSI sobe de 4,2% para 4,35% a 1 de outubro de 2026; o cálculo pondera os dois períodos.',
      ],
      IT: [
        'Cidade de referência: Milão. As sobretaxas regional (Lombardia) e municipal aparecem em «Outros impostos».',
        'Até cerca de 20 000 €, Itália paga ainda apoios em dinheiro junto com o salário que não estão incluídos, por isso o líquido real nessa faixa é um pouco mais alto.',
      ],
    } satisfies Record<CountryCode, string[]>,
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
