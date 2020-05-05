import cheerio from "cheerio";

export class Article {
  title = "";
  url: string | undefined = "";
  authors = [""];
  year = 0;
  numCitations = 0;
  pdf: string | undefined = "";
  urlVersionsList = "";
  citationUrl = "";
  relatedUrl = "";
  description = "";
  publication: string | undefined = "";
}

export interface IFooterLinks {
  citationUrl: string;
  relatedUrl: string;
  numCitations: number;
  urlVersionsList: string;
}

export interface IPublicationInfo {
  authors: string[];
  year: number;
  publication: string | undefined;
  authorLinks: string[];
}

export abstract class ArticleParser {
  articles: Article[] = [];
  baseUrl: string | null = null;
  $: CheerioStatic | null = null;

  parse = (html: string, tags: HTMLTags) => {
    this.$ = cheerio.load(html);
    const allResults = this.$(tags.results);
    allResults.each((idx, div) => {
      const article = this.parseSingleArticle(div, tags);
      if (article && article.title !== "") this.articles.push(article);
    });
  };

  abstract parseFooterLinks(div: Cheerio): IFooterLinks;

  abstract parsePublicationTag(div: Cheerio): IPublicationInfo;

  abstract parseSingleArticle(
    div: CheerioElement,
    tags: HTMLTags
  ): Article | undefined;

  abstract search(query: string): void;
  abstract user(query: string): void;
  abstract all(query: string): void;
}

export class HTMLTags {
  results: string;
  title: string;
  url: string;
  authors: string;
  footers: string;
  description: string;
  pdf: string;

  constructor(
    results = "",
    title = "",
    url = "",
    authors = "",
    footers = "",
    description = "",
    pdf = ""
  ) {
    this.results = results;
    this.title = title;
    this.url = url;
    this.authors = authors;
    this.footers = footers;
    this.description = description;
    this.pdf = pdf;
  }
}
