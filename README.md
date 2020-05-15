# Scholarly

[![Build Status](https://travis-ci.org/ukalwa/scholarly.svg?branch=master)](https://travis-ci.org/ukalwa/scholarly)
[![codecov](https://codecov.io/gh/ukalwa/scholarly/branch/master/graph/badge.svg)](https://codecov.io/gh/ukalwa/scholarly)
[![npm](https://img.shields.io/npm/v/scholarly)](https://www.npmjs.com/package/scholarly)
[![npm](https://img.shields.io/npm/dw/scholarly)](https://www.npmjs.com/package/scholarly)

A Node.js module to fetch and parse academic articles from Google Scholar.

## Installation

```bash
npm install scholarly --save
# or
yarn add scholarly
```

## Usage

### Javascript

```javascript
use "strict";

var scholarly = require("scholarly");

// To search for a specific topic
scholarly.search("machine learning").then((data) => {
  console.log(data);
});

// To list articles a user co-authored
scholarly.user("H18-9fkAAAAJ").then((data) => {
  console.log(data);
});
```

### Typescript

```typescript
import { search, user } from "scholarly";

console.log(search("machine learning"));

console.log(user("H18-9fkAAAAJ"));
```

### Output

The search would result in a list of articles.

#### Search query output format

```code
[
  ...
  {
    title: 'Machine-learning research',
    url:
     'https://www.aaai.org/ojs/index.php/aimagazine/article/view/1324',
    authors: [ 'TG Dietterich' ],
    year: 1997,
    numCitations: 1826,
    description:
     'Abstract Machine-learning research has been making great progress in many directions. This article summarizes four of these directions and discusses some current open problems. The four directions are (1) the improvement of classification accuracy by learning ensembles�…',
    pdf:
     'https://www.aaai.org/ojs/index.php/aimagazine/article/view/1324/1225',
    citationUrl:
     'http://scholar.google.com/scholar?cites=10011148559927428233&as_sdt=5,26&sciodt=0,26&hl=en&oe=ASCII',
    relatedUrl:
     'http://scholar.google.com/scholar?q=related:iUQj7JK-7ooJ:scholar.google.com/&scioq=machine+learning&hl=en&oe=ASCII&as_sdt=0,26',
    urlVersionsList:
     'http://scholar.google.com/scholar?cluster=10011148559927428233&hl=en&oe=ASCII&as_sdt=0,26',
    publication: 'aaai.org'
  },
  ...
]

```

#### User query output format

```code
[
  ...
  {
    title:
     'Skin Cancer Diagnostics with an All-Inclusive Smartphone Application',
    url: '',
    authors: [ 'U Kalwa', ' C Legner', ' T Kong', ' S Pandey' ],
    year: 2019,
    numCitations: 4,
    journal: 'Symmetry',
    volume: 11,
    issue: 6,
    pages: '790'
  },
    ...
]
```

## Testing

The module can be tested by running `npm run test`

## To-Do

- [ ] Replace Cheerio + axios with jsdom to run scripts on the page
- [ ] Explore a way to test JSDOM without hitting API in tests (`NODE_ENV === "production" ? jsdom.fromURL : jsdom.fromFile` maybe?)
- [ ] Add Microsoft Academic for fetching academic articles

## Acknowledgements

This project was inspired from other awesome projects ([scholar.py], [google-scholar], and [google-scholar-extended])

[scholar.py]: https://github.com/ckreibich/scholar.py
[google-scholar]: https://github.com/VT-CHCI/google-scholar
[google-scholar-extended]: https://github.com/martinchapman/google-scholar-extended
