import type { CountryCode } from '../data/countries/index.ts'
import type { ProfileId } from '../lib/profiles.ts'
import type { NoteKind, TraceStepKey } from '../lib/types.ts'

export const pt = {
  header: {
    title: 'Salário líquido na Europa',
    intro:
      'Escreva o seu salário bruto anual e escolha um país para ver quanto recebe ao fim do ano e para onde vai o resto.',
  },
  profiles: {
    legend: 'Perfil',
    names: {
      single: 'Solteiro sem filhos',
      coupleOneChild: 'Casal com 1 filho',
      coupleTwoChildren: 'Casal com 2 filhos',
    } satisfies Record<ProfileId, string>,
  },
  salary: {
    label: 'Salário bruto anual',
    householdLabel: 'Salário bruto anual do agregado',
    householdHint: 'A soma dos salários do casal. O cálculo divide-a em partes iguais pelos dois.',
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
    householdNetAnnual: 'Líquido do agregado por ano',
    netMonthly: 'Por mês (12 meses)',
    effectiveRate: 'Taxa efetiva',
    employerCost: 'Custo total para o empregador',
    employerCostDetail: (contributions: string) =>
      `Salário bruto mais ${contributions} de contribuições do empregador.`,
    taxYear: (year: number) => `Regras fiscais de ${year}.`,
  },
  trace: {
    title: 'Como foi calculado',
    total: 'Total',
    employerTitle: 'Custo para o empregador',
    employerTotal: 'Custo total',
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
      jointTaxFromScale: 'Coleta (quociente conjugal)',
      familyQuotientTax: 'Imposto pelo quociente familiar',
      splittingTax: 'Imposto com splitting conjugal',
      childAllowance: 'Dedução por filhos (Kinderfreibetrag)',
      childBenefitOffset: 'Kindergeld já recebido, somado ao imposto',
      quotientCap: 'Limite da vantagem por filho',
      taxFromScale: 'Imposto pela tabela progressiva',
      stateTax: 'Imposto estatal (depois dos mínimos pessoal e familiar)',
      regionalTax: 'Imposto autonómico (depois dos mínimos pessoal e familiar)',
      dependentsDeduction: 'Dedução por dependentes',
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
      employerContribution: 'Contribuição do empregador',
      workAccidentInsurance: 'Acidentes de trabalho',
      trainingLevies: 'Formação profissional e aprendizagem',
      employerLevies: 'Fundos de maternidade e insolvência (U2, U3)',
      severancePay: 'TFR (indemnização de fim de contrato)',
      generalReduction: 'Redução geral (RGDU)',
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
          'O mínimo de existência e a dedução de 250 € de despesas gerais familiares por pessoa.',
        jointTaxation:
          'Casais: tributação conjunta. O salário do agregado é dividido em partes iguais, a tabela aplica-se a metade do rendimento coletável e o resultado é multiplicado por 2. Dedução de 600 € por filho.',
        familyAllowance:
          'Abono de família: depende do rendimento do agregado e é pago à parte, por isso não entra no líquido.',
        otherDeductions:
          'Outras deduções à coleta (saúde, educação, habitação), que dependem das despesas de cada pessoa.',
        employerCost:
          'Custo para o empregador: salário bruto mais a contribuição do empregador para a Segurança Social (23,75%). Os fundos de compensação do trabalho não entram: o FCT foi extinto e o FGCT está suspenso até ao fim de 2026.',
        workAccidentInsurance:
          'Seguro de acidentes de trabalho: é obrigatório, mas o preço depende da seguradora e da atividade.',
        rateCut:
          'A descida das taxas do IRS aprovada em outubro de 2026 ainda não está refletida: aguarda o decreto-lei do Governo.',
      },
      ES: {
        referenceCity:
          'Cidade de referência: Madrid (escala autonómica e mínimo pessoal da Comunidade de Madrid).',
        contributions:
          'Contrato sem termo. Contribuições até ao teto de 5101,20 € por mês e contribuição de solidariedade acima dele.',
        individualReturns:
          'Casais: cada um faz a sua declaração sobre metade do salário do agregado, e os mínimos por filho (do Estado e de Madrid) são divididos a meio. A declaração conjunta existe, mas não duplica nenhum valor e, com dois salários parecidos, sai mais cara.',
        employerCost:
          'Custo para o empregador: contribuições da empresa (30,65%) até ao teto, mais a parte da empresa na contribuição de solidariedade. Acidentes de trabalho com a taxa de um trabalhador de escritório (1,5%); noutras atividades é mais alta.',
        familyBenefits:
          'Apoios por filho que dependem do rendimento, como o complemento de ayuda para la infancia, pagos à parte.',
      },
      FR: {
        nonExecutive: 'Trabalhador não-quadro (non-cadre).',
        taxScaleYear:
          'O imposto usa a tabela mais recente publicada (lei de finanças de 2026, sobre os rendimentos de 2025). As contribuições são as de 2026.',
        employerCost:
          'Custo para o empregador numa empresa com menos de 11 trabalhadores, já com a redução geral (RGDU), que é maior nos salários baixos e desaparece a partir de 3 salários mínimos (65 629 € por ano). Acidentes de trabalho com a taxa de funções administrativas (0,64%). Confere com o simulador da Urssaf.',
        familyQuotient:
          'Casais: declaração conjunta, obrigatória para casados. O agregado tem 2 partes, mais meia parte por filho; a tabela aplica-se ao rendimento de uma parte e multiplica-se pelo número de partes. A poupança de cada meia parte por filho está limitada a 1807 €. Abatimento de 10% e contribuições calculados para cada um sobre metade do salário.',
        companyInsurance: 'Mutuelle e prévoyance, que dependem da empresa.',
        familyAllowances:
          'Allocations familiales: só existem a partir do 2.º filho e o valor depende do rendimento do agregado. São pagas à parte.',
        mobilityLevy:
          'Versement mobilité: só se aplica a empresas com 11 ou mais trabalhadores, com uma taxa que depende da cidade (até 3,2% em Paris).',
      },
      DE: {
        careInsurance:
          'Seguro de saúde público com a contribuição adicional média de 2,9%. Seguro de dependência: quem não tem filhos (23 anos ou mais) paga mais 0,6%; com 2 filhos, a taxa desce 0,25 pontos.',
        annualTax:
          'Calcula o imposto anual final. A retenção mensal no recibo (Lohnsteuer) pode diferir alguns euros.',
        employerCost:
          'Custo para o empregador numa empresa com mais de 30 trabalhadores: a mesma parte das contribuições que o trabalhador (sem o suplemento de dependência por não ter filhos), mais os fundos de maternidade (U2, 0,44% na Techniker Krankenkasse; varia por caixa) e de insolvência (U3, 0,15%).',
        splitting:
          'Casais: tributação conjunta com splitting. Cada um paga a segurança social e tem as deduções sobre metade do salário; a tabela aplica-se a metade do rendimento tributável do casal e multiplica-se por 2. Por filho, a dedução de 9756 € só é usada quando poupa mais imposto do que o Kindergeld; nesse caso o Kindergeld recebido é somado ao imposto.',
        childBenefit:
          'Kindergeld: 259 € por mês por filho, pago à parte. Não entra no líquido.',
        accidentInsurance:
          'Seguro de acidentes (Berufsgenossenschaft): é obrigatório, mas a taxa depende da Berufsgenossenschaft e do risco da atividade, e só é fixada depois do fim do ano.',
      },
      NL: {
        nationalInsurance:
          'A contribuição do trabalhador para a segurança social nacional está incluída na taxa do 1.º escalão, por isso aparece dentro do imposto. O seguro de desemprego e a contribuição de saúde são pagos pelo empregador.',
        employerCost:
          'Custo para o empregador numa pequena empresa, com contrato sem termo, até ao salário máximo de 79 409 €: desemprego (2,74%), invalidez (6,27%, ou 7,63% nas empresas maiores) com 0,50% para creches, o prémio médio de doença e incapacidade (1,52%; o real é fixado para cada empresa) e a contribuição de saúde (6,10%).',
        individualTaxation:
          'Casais: não há tributação conjunta. Cada um é tributado sobre metade do salário do agregado, com os seus próprios créditos fiscais.',
        companyPension: 'Pensão da empresa, que varia de empregador para empregador, e deduções.',
        combinationCredit:
          'Crédito para pais que trabalham (IACK, até 3032 €): só existe enquanto o filho mais novo tem menos de 12 anos e vai para quem ganha menos no casal.',
        childBenefit:
          'Kinderbijslag e kindgebonden budget: pagos à parte pela segurança social; o segundo depende do rendimento.',
      },
      IE: {
        taxCredits:
          'Solteiro: créditos fiscais pessoal e de trabalhador (4000 € no total). O USC aparece em «Outros impostos».',
        prsiRateChange:
          'O PRSI sobe de 4,2% para 4,35% a 1 de outubro de 2026; o cálculo pondera os dois períodos.',
        jointAssessment:
          'Casais: tributação conjunta do imposto. O escalão de 20% é de 53 000 €, mais o salário de quem ganha menos até 35 000 €; créditos de 4000 € (casal) e 2000 € por trabalhador. O PRSI e o USC são sempre calculados para cada um, sobre metade do salário. Não há crédito fiscal por filhos.',
        employerCost:
          'Custo para o empregador: PRSI do empregador sobre todo o salário, sem teto. É de 11,25% (11,40% a partir de outubro) quando o salário passa de 552 € por semana, e de 9% (9,15%) abaixo disso.',
        autoEnrolment:
          'Poupança-reforma automática (My Future Fund): desde 2026, quem não tem pensão da empresa contribui 1,5% e o empregador outros 1,5%. O trabalhador pode sair, por isso não entra em nenhum dos lados.',
        childBenefit: 'Child Benefit: 140 € por mês por filho, pago à parte. Não entra no líquido.',
      },
      IT: {
        referenceCity:
          'Cidade de referência: Milão. As sobretaxas regional (Lombardia) e municipal aparecem em «Outros impostos».',
        individualTaxation:
          'Casais: não há tributação conjunta. Cada um é tributado sobre metade do salário do agregado. Filhos com menos de 21 anos já não dão dedução no IRPEF desde 2022.',
        childAllowance:
          'Assegno unico: apoio mensal por filho, pago pelo INPS, cujo valor depende do ISEE do agregado. Não entra no líquido.',
        cashSupplements:
          'Os apoios em dinheiro que Itália paga junto com o salário até cerca de 20 000 €. Nessa faixa, o líquido real é um pouco mais alto.',
        employerCost:
          'Custo para o empregador numa empresa de comércio ou serviços com até 50 trabalhadores: INPS do empregador (28,98%) e o TFR, uma indemnização que o empregador acumula todos os anos (6,91% do salário) e paga ao trabalhador quando o contrato termina. Os fundos dos contratos coletivos e as pensões complementares não entram.',
        workAccidentInsurance:
          'Seguro de acidentes de trabalho (INAIL): é obrigatório, mas a taxa depende da atividade da empresa.',
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
      'Três perfis: solteiro sem filhos, ou casal com 1 ou 2 filhos entre os 6 e os 17 anos.',
      'Nos casais, o salário é o do agregado, dividido em partes iguais pelos dois. Usa-se a tributação conjunta onde existe.',
      'Prestações familiares pagas por filho (abono de família, Kindergeld e outras) não entram no líquido.',
      'Trabalhador por conta de outrem, residente fiscal no país escolhido.',
      'Sem regimes especiais (por exemplo IRS Jovem, Lei Beckham ou a regra dos 30% nos Países Baixos).',
      'Sem imposto religioso. Impostos regionais e municipais usam uma média ou uma cidade de referência, indicada em cada país.',
      'Imposto anual final, depois do acerto de contas, e não a retenção mensal no recibo de vencimento.',
      'Valores em euros, por ano. São estimativas simplificadas e não substituem um simulador oficial.',
    ],
  },
}

export type Strings = typeof pt
