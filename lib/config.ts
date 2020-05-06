import cheerio from "cheerio";
import { IAuthorInfo, IArticle, IArticleLinks, IHTMLTags } from "./interfaces";

export class Article implements IArticle, IArticleLinks {
  title = "";
  url? = "";
  authors: string[] = [];
  year = 0;
  numCitations? = 0;
  pdf?: string;
  urlVersionsList?: string;
  citationUrl?: string;
  relatedUrl?: string;
  description?: string;
  publication?: string;
  journal?: string;
  volume?: number;
  issue?: number;
  pages?: string;
}

export const AuthorTags: IAuthorInfo = {
  allCitations: 0,
  hIndex: 0,
  i10Index: 0,
  interests: [],
};

export abstract class ArticleParser {
  articles: IArticle[] = [];
  baseUrl: string | null = null;
  $: CheerioStatic | null = null;

  parseScholarArticle = (html: string, tags: IHTMLTags) => {
    this.$ = cheerio.load(html);
    const allResults = this.$(tags.results);
    allResults.each((idx, div) => {
      const article = this._parseScholarArticle(div, tags);
      if (article && article.title !== "") this.articles.push(article);
    });
  };

  parseUserArticle = (html: string, tags: IHTMLTags) => {
    this.$ = cheerio.load(html);
    const allResults = this.$(tags.results);
    allResults.each((idx, div) => {
      const article = this._parseUserArticle(div, tags);
      if (article && article.title !== "") this.articles.push(article);
    });
  };

  abstract parseFooterLinks(div: Cheerio, article: Article): void;

  abstract parsePublicationTag(div: Cheerio, article: Article): void;

  abstract _parseUserArticle(
    div: CheerioElement,
    tags: IHTMLTags
  ): IArticle | undefined;

  abstract _parseScholarArticle(
    div: CheerioElement,
    tags: IHTMLTags
  ): IArticle | undefined;

  abstract search(query: string): void;
  abstract user(query: string): void;
  abstract all(query: string): void;
}
