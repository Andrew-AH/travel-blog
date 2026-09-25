// Keep changing eligibility rules, fees and launch dates on the official websites.
const etiasLink = {
  kind: 'Travel authorisation',
  title: 'Check ETIAS status',
  description: 'Check the latest launch information and which travellers will be covered.',
  source: 'European Union',
  href: 'https://travel-europe.europa.eu/etias',
}

export const entryDestinations = [
  {
    id: 'indonesia',
    label: 'Indonesia (Bali)',
    note: 'For Bali, check Indonesia’s entry rules and Bali’s separate visitor levy. Requirements and exemptions depend on your trip.',
    links: [
      {
        kind: 'Visa',
        title: 'Check Indonesia visa options',
        description: 'Use the official visa selection tool for your passport and purpose of travel.',
        source: 'Indonesia Directorate General of Immigration',
        href: 'https://evisa.imigrasi.go.id/web/visa-selection',
      },
      {
        kind: 'Visitor levy',
        title: 'Check the Bali tourist levy',
        description: 'Review the levy and any exemptions. This is separate from your visa.',
        source: 'Bali Provincial Government',
        href: 'https://lovebali.baliprov.go.id/',
      },
      {
        kind: 'Arrival declaration',
        title: 'Check All Indonesia arrival requirements',
        description: 'Review the official arrival declaration and when to complete it for your trip.',
        source: 'Indonesia Directorate General of Immigration',
        href: 'https://allindonesia.imigrasi.go.id/',
      },
    ],
  },
  {
    id: 'france',
    label: 'France',
    note: 'Use France’s visa checker for your passport and destination, then recheck ETIAS status for your travel dates.',
    links: [
      {
        kind: 'Visa',
        title: 'Check France visa requirements',
        description: 'Use the official visa wizard to check your circumstances and documents.',
        source: 'French Government · France-Visas',
        href: 'https://www.france-visas.gouv.fr/en/web/france-visas/assistant-visa',
      },
      etiasLink,
    ],
  },
  {
    id: 'greece',
    label: 'Greece',
    note: 'Check Greece’s requirements for your passport and recheck ETIAS status before you travel.',
    links: [
      {
        kind: 'Visa',
        title: 'Check Greece visa requirements',
        description: 'Review the official visa requirements by nationality and passport type.',
        source: 'Greece Ministry of Foreign Affairs',
        href: 'https://www.mfa.gr/en/services/visas-for-foreigners-traveling-to-greece/countries-requiring-or-not-requiring-a-visa/',
      },
      etiasLink,
    ],
  },
  {
    id: 'italy',
    label: 'Italy',
    note: 'Check Italy’s visa guidance for your visit and recheck ETIAS status for your travel dates.',
    links: [
      {
        kind: 'Visa',
        title: 'Check Italy visa requirements',
        description: 'Check by nationality, residence, purpose of travel and length of stay.',
        source: 'Italy Ministry of Foreign Affairs and International Cooperation',
        href: 'https://vistoperitalia.esteri.it/?lang=en_US',
      },
      etiasLink,
    ],
  },
  {
    id: 'japan',
    label: 'Japan',
    note: 'Check visa requirements for your passport. Visit Japan Web helps prepare arrival information and is separate from a visa.',
    links: [
      {
        kind: 'Visa',
        title: 'Check Japan visa requirements',
        description: 'Review visa guidance and short-stay exemptions for your nationality.',
        source: 'Japan Ministry of Foreign Affairs',
        href: 'https://www.mofa.go.jp/j_info/visit/visa/',
      },
      {
        kind: 'Arrival declaration',
        title: 'Prepare with Visit Japan Web',
        description: 'Find the official service for immigration and customs arrival information.',
        source: 'Japan Digital Agency',
        href: 'https://services.digital.go.jp/en/visit-japan-web/',
      },
    ],
  },
  {
    id: 'new-zealand',
    label: 'New Zealand',
    note: 'Check whether your trip needs a visa or NZeTA. If the visitor levy applies, it is paid with that application.',
    links: [
      {
        kind: 'Visa / travel authorisation',
        title: 'Check visa or NZeTA requirements',
        description: 'Use Immigration New Zealand’s checker for your passport and travel plans.',
        source: 'Immigration New Zealand',
        href: 'https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/check-if-you-need-a-visa-or-an-nzeta/',
      },
      {
        kind: 'Visitor levy',
        title: 'Check the International Visitor Levy',
        description: 'Review who pays the IVL, exemptions and how it is collected.',
        source: 'Immigration New Zealand',
        href: 'https://www.immigration.govt.nz/process-to-apply/applying-for-a-visa/fees-processing-times-and-refunds/paying-the-international-visitor-levy/',
      },
    ],
  },
  {
    id: 'south-korea',
    label: 'South Korea',
    note: 'Check visa rules and current K-ETA exemptions for your passport and travel dates before applying.',
    links: [
      {
        kind: 'Visa',
        title: 'Use the Korea Visa Navigator',
        description: 'Check options by nationality, purpose of entry and length of stay.',
        source: 'South Korea Ministry of Justice',
        href: 'https://www.visa.go.kr/openPage.do?LANG_TYPE=EN&MENU_ID=10101',
      },
      {
        kind: 'Travel authorisation',
        title: 'Check K-ETA requirements',
        description: 'Review eligible passports and current application exemptions.',
        source: 'South Korea Ministry of Justice',
        href: 'https://www.k-eta.go.kr/portal/guide/viewetaalification.do',
      },
    ],
  },
  {
    id: 'switzerland',
    label: 'Switzerland',
    note: 'Check Swiss entry rules for your nationality and recheck ETIAS status for your travel dates.',
    links: [
      {
        kind: 'Visa / entry rules',
        title: 'Check Swiss entry requirements',
        description: 'Review the official entry and visa requirements by nationality.',
        source: 'Swiss State Secretariat for Migration',
        href: 'https://www.sem.admin.ch/sem/en/home/themen/einreise/info-einreise.html',
      },
      etiasLink,
    ],
  },
  {
    id: 'united-kingdom',
    label: 'United Kingdom (London)',
    note: 'London follows UK entry rules. Use the visa checker, then check whether an ETA applies to your trip.',
    links: [
      {
        kind: 'Visa',
        title: 'Check if you need a UK visa',
        description: 'Answer the official checker’s questions for your nationality and visit.',
        source: 'UK Government',
        href: 'https://www.gov.uk/check-uk-visa',
      },
      {
        kind: 'Travel authorisation',
        title: 'Check UK ETA requirements',
        description: 'Review who needs an electronic travel authorisation and who is exempt.',
        source: 'UK Government · Home Office',
        href: 'https://www.gov.uk/eta',
      },
    ],
  },
]
