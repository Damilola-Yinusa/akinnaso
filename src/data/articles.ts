export type Article = {
  title: string;
  excerpt: string;
  url: string;
  image?: string;
};

// Curated from thenationonlineng.net/author/niyi-akinnaso (15+ pages of columns)
export const articles: Article[] = [
  {
    title: "The consolidation of democracy in Nigeria",
    excerpt:
      "Toward the end of my article last week on the democratisation of democracy in Nigeria, I suggested the need for certain modifications to make democracy truly our own political system.",
    url: "https://thenationonlineng.net/the-consolidation-of-democracy-in-nigeria/",
  },
  {
    title: "The domestication of democracy in Nigeria",
    excerpt:
      "There are critics of Nigerian democracy who claim that our democracy is dead. Yet, some of them are fighting tooth and nail to participate in it.",
    url: "https://thenationonlineng.net/the-domestication-of-democracy-in-nigeria/",
  },
  {
    title: "Ondo South Senatorial Seat: The case for Oladunni Odu",
    excerpt:
      "Since Dr. Jimoh Ibrahim vacated the Ondo South Senatorial seat for an ambassadorial position, at least seven contestants have shown interest in completing his term.",
    url: "https://thenationonlineng.net/ondo-south-senatorial-seat-the-case-for-oladunni-odu/",
  },
  {
    title: "Jimoh Ibrahim: Before we blow our tops",
    excerpt:
      "President Bola Ahmed Tinubu's appointment of Senator Jimoh Ibrahim as Nigeria's Permanent Representative to the United Nations has raised eyebrows.",
    url: "https://thenationonlineng.net/jimoh-ibrahim-before-we-blow-our-tops/",
  },
  {
    title: "Excessive oversight and bureaucratic delays",
    excerpt:
      "Universities, colleges of education, and polytechnics have been facing a severe problem that the management of these institutions is finding increasingly difficult to accommodate.",
    url: "https://thenationonlineng.net/excessive-oversight-and-bureaucratic-delays/",
  },
  {
    title: "Reflections on developments in polytechnic education",
    excerpt:
      "The Executive Secretary of the National Board of Technical Education announced two major developments affecting the degree and organisational structures of polytechnic education in Nigeria.",
    url: "https://thenationonlineng.net/reflections-on-developments-in-polytechnic-education/",
  },
  {
    title: "Obi: Trump of Africa",
    excerpt:
      "It has become necessary to revisit Peter Obi's political grandstanding, ethnic chauvinism, and verbal maneuvering during his ongoing positioning for power.",
    url: "https://thenationonlineng.net/obi-trump-of-africa-2/",
  },
  {
    title: "Retreat on improving polytechnic education",
    excerpt:
      "Polytechnic education had been in recession for decades due partly to low investment in the sector and partly to emphasis on university education.",
    url: "https://thenationonlineng.net/retreat-on-improving-polytechnic-education/",
  },
  {
    title: "Renewing hope in higher education",
    excerpt:
      "The President Bola Ahmed Tinubu administration has done it again — first the student loan scheme, and now further investments in higher education.",
    url: "https://thenationonlineng.net/renewing-hope-in-higher-education/",
  },
  {
    title: "The truth about Tinubu's economic reforms",
    excerpt:
      "In an article on President Tinubu's boldness in embarking on major economic reforms, Bamidele Ademola-Olateju invoked Robert Frost's famous poem, The Road Not Taken.",
    url: "https://thenationonlineng.net/the-truth-about-tinubus-economic-reforms/",
  },
  {
    title: "Tunde Ponnle: From classroom to boardroom (1939–2025)",
    excerpt:
      "Although I had read about him online in Nigerian newspapers, Prince Michael Ayantunde Ponnle was already far along in his journey into stardom before I ever met him.",
    url: "https://thenationonlineng.net/tunde-ponnle-from-classroom-to-boardroom-1939-2025/",
  },
  {
    title: "Sudden deaths",
    excerpt:
      "Approximately 173,000 deaths occur daily in 2025. As the year runs out soon, it is estimated that about 64 million people would have died this year alone.",
    url: "https://thenationonlineng.net/sudden-deaths/",
  },
  {
    title: "Lessons from Delta's century of flight (2)",
    excerpt:
      "Delta began operations on the Lagos-Atlanta route in 2007 just as it was coming out of Chapter 11 bankruptcy, after completing the reorganization of the company.",
    url: "https://thenationonlineng.net/lessons-from-deltas-century-of-flight-2/",
  },
  {
    title: "Lessons from Delta's century of flight (1)",
    excerpt:
      "I recently took an early morning flight from Calgary, Canada, to Philadelphia, USA, with a stopover in Salt Lake City — a reflection on a century of aviation.",
    url: "https://thenationonlineng.net/lessons-from-deltas-century-of-flight-1/",
  },
];

export type Publication = {
  title: string;
  authors: string;
  venue: string;
  year: number;
  citations: number;
};

// From Google Scholar profile (LBwAuEUAAAAJ) — h-index 19, 2,134+ citations
export const publications: Publication[] = [
  {
    title: "On the differences between spoken and written language",
    authors: "F. N. Akinnaso",
    venue: "Language and Speech 25(2), 97–125",
    year: 1982,
    citations: 432,
  },
  {
    title: "Policy and experiment in mother tongue literacy in Nigeria",
    authors: "F. N. Akinnaso",
    venue: "International Review of Education 39(4), 255–285",
    year: 1993,
    citations: 217,
  },
  {
    title: "The sociolinguistic basis of Yoruba personal names",
    authors: "F. N. Akinnaso",
    venue: "Anthropological Linguistics 22(7), 275–304",
    year: 1980,
    citations: 216,
  },
  {
    title: "Performance and ethnic style in job interviews",
    authors: "F. N. Akinnaso & C. S. Ajirotutu",
    venue: "Language and Social Identity, 119–144",
    year: 1982,
    citations: 198,
  },
  {
    title: "Schooling, language, and knowledge in literate and nonliterate societies",
    authors: "F. N. Akinnaso",
    venue: "Comparative Studies in Society and History 34(1), 68–109",
    year: 1992,
    citations: 139,
  },
  {
    title: "Toward the development of a multilingual language policy in Nigeria",
    authors: "F. N. Akinnaso",
    venue: "Applied Linguistics 12(1), 29–61",
    year: 1991,
    citations: 124,
  },
  {
    title: "On the similarities between spoken and written language",
    authors: "F. N. Akinnaso",
    venue: "Language and Speech 28(4), 323–359",
    year: 1985,
    citations: 117,
  },
  {
    title: "The consequences of literacy in pragmatic and theoretical perspectives",
    authors: "F. N. Akinnaso",
    venue: "Anthropology & Education Quarterly 12(3), 163–200",
    year: 1981,
    citations: 114,
  },
  {
    title: "Linguistic unification and language rights",
    authors: "F. Niyi Akinnaso",
    venue: "Applied Linguistics 15(2), 139–168",
    year: 1994,
    citations: 79,
  },
  {
    title: "One nation, four hundred languages: Unity and diversity in Nigeria's language policy",
    authors: "F. N. Akinnaso",
    venue: "Language Problems and Language Planning 13(2), 133–146",
    year: 1989,
    citations: 75,
  },
  {
    title: "Names and naming principles in cross-cultural perspective",
    authors: "F. N. Akinnaso",
    venue: "Names 29(1), 37–63",
    year: 1981,
    citations: 53,
  },
  {
    title: "Bourdieu and the diviner: Knowledge and symbolic power in Yoruba divination",
    authors: "F. N. Akinnaso & W. James",
    venue: "The Pursuit of Certainty, 234–257",
    year: 1995,
    citations: 36,
  },
  {
    title: "On the mother tongue education policy in Nigeria",
    authors: "F. N. Akinnaso",
    venue: "Educational Review 43(1), 89–106",
    year: 1991,
    citations: 33,
  },
  {
    title: "Yoruba traditional names and the transmission of cultural knowledge",
    authors: "F. N. Akinnaso",
    venue: "Names 31(3), 139–158",
    year: 1983,
    citations: 30,
  },
];
