import { IArticle, IHTMLTags } from "../interfaces";
import { splitJournalVolumeString, splitVolumeIssueString } from "../utils";

import { Article } from "../config";
import cheerio from "cheerio";

/**
 *
 *
 * @param {CheerioStatic} $
 * @param {CheerioElement} div
 * @param {IHTMLTags} tags
 * @returns
 */
const _parseUserArticle = (
  $: CheerioStatic,
  div: CheerioElement,
  tags: IHTMLTags
) => {
  if ($) {
    const article = new Article();
    article.title = $(div).find(tags.title).text().trim();
    article.year = parseInt($(div).find(tags.year!).text());
    article.numCitations = parseInt($(div).find(tags.citations!).text()) || 0;
    const articleData = $(div).find(tags.authors);
    article.authors = $(articleData[0]).text().split(",");
    // Remove hidden year attribute
    $(articleData[1]).find(".gs_oph").remove();
    let htmlString = $(articleData[1]).text().trim();
    let idx = splitJournalVolumeString(htmlString);
    article.journal = htmlString.slice(0, idx).trim();
    htmlString = htmlString.substr(idx);
    if (htmlString === "") return article;
    const articleTokens = htmlString.split(",");
    const { volume, issue } = splitVolumeIssueString(articleTokens[0]);
    article.volume = volume;
    article.issue = issue;
    if (articleTokens.length > 1) article.pages = articleTokens[1].trim();
    return article;
  }
};

export /**
 *
 *
 * @param {string} html
 * @param {IHTMLTags} tags
 * @returns {IArticle[]}
 */
const parseUserArticle = (html: string, tags: IHTMLTags) => {
  const articles: IArticle[] = [];
  const $ = cheerio.load(html);
  const allResults = $(tags.results);
  allResults.each((idx, div) => {
    const article = _parseUserArticle($, div, tags);
    if (article && article.title !== "") articles.push(article);
  });
  return articles;
};
