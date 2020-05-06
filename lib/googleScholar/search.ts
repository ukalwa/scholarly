import { IArticle, IHTMLTags } from "../interfaces";

import { Article } from "../config";
import cheerio from "cheerio";

const baseUrl = "http://scholar.google.com";

/**
 *
 *
 * @param {string} html
 * @param {IHTMLTags} tags
 * @returns {IArticle[]}
 */
export const parseScholarArticle = (
  html: string,
  tags: IHTMLTags
): IArticle[] => {
  let articles: IArticle[] = [];
  const $ = cheerio.load(html);
  const allResults = $(tags.results);
  allResults.each((idx, div) => {
    const article = _parseScholarArticle($, div, tags);
    if (article && article.title !== "") articles.push(article);
  });
  return articles;
};

/**
 *
 *
 * @param {CheerioStatic} $
 * @param {CheerioElement} div
 * @param {IHTMLTags} tags
 * @returns {Article|undefined}
 */
const _parseScholarArticle = (
  $: CheerioStatic,
  div: CheerioElement,
  tags: IHTMLTags
): Article | undefined => {
  if ($) {
    const article = new Article();
    article.title = $(div).find(tags.title).text().trim();
    article.url = $(div).find(tags.url).attr("href");
    article.description = $(div).find(tags.description!).text();
    article.pdf = $($(div).find(tags.pdf!)[0]).attr("href");
    _parseFooterLinks($, $(div).find(tags.footers!), article);
    _parsePublicationTag($, $(div).find(tags.authors), article);
    return article;
  }
};

/**
 *
 *
 * @param {CheerioStatic} $
 * @param {Cheerio} div
 * @param {Article} article
 */
const _parsePublicationTag = (
  $: CheerioStatic,
  div: Cheerio,
  article: Article
) => {
  let authorHTMLString = $(div).text();
  if (authorHTMLString === "") {
    return;
  }
  // Author Tag format (author1, author2 - publication, year - journal)
  let author = "";
  let ellipsisIdx = authorHTMLString.indexOf("...");
  for (let idx = 0; idx < authorHTMLString.length; idx++) {
    const char = authorHTMLString[idx];
    if (char === "," || char === "-" || idx === ellipsisIdx) {
      article.authors.push(author.trim());
      if (char !== ",") {
        authorHTMLString = authorHTMLString.substr(
          idx === ellipsisIdx ? idx + 3 : idx + 1
        );
        break;
      }
    } else {
      author += char;
    }
  }
  const splitData = authorHTMLString.split(" - ");
  article.publication = splitData.pop()?.trim();
  let year = splitData.pop()!.substr(-5).trim();
  article.year = parseInt(year);
  return;
};

/**
 *
 *
 * @param {CheerioStatic} $
 * @param {Cheerio} div
 * @param {Article} article
 */
const _parseFooterLinks = (
  $: CheerioStatic,
  div: Cheerio,
  article: Article
) => {
  $(div).each((idx, el) => {
    if ($) {
      const href = $(el).attr("href");
      if (href!.indexOf("/scholar?cites") >= 0) {
        const citationCountPrefix = "Cited by ";
        article.citationUrl = baseUrl + href!;
        article.numCitations = parseInt(
          $(el).text().substr(citationCountPrefix.length)
        );
      } else if (href!.indexOf("/scholar?q=related") >= 0) {
        article.relatedUrl = baseUrl + href!;
      } else if (href!.indexOf("/scholar?cluster") >= 0) {
        article.urlVersionsList = baseUrl + href!;
      }
    }
  });
};
