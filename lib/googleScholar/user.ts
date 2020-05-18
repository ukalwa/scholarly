import { IArticle, IHTMLTags } from "../interfaces";
import { splitJournalVolumeString, splitVolumeIssueString } from "../utils";

import { Article } from "../config";
import cheerio from "cheerio";
import jsdom from "jsdom";

/**
 *
 *
 * @param {Document} document DOM document
 * @param {IHTMLTags} tags HTML selectors to scrape articles
 * @returns {IArticle} Article object with extracted information
 */
const _parseArticleModal = (document: Document, tags: IHTMLTags): IArticle => {
  const article = new Article();
  const _parseField = (field: string, value: string): void => {
    const citationCountPrefix = "Cited by ";
    switch (field.trim()) {
      case "Authors":
        article.authors = value.trim().split(",");
        break;
      case "Publication date":
        article.year = parseInt(value);
        break;
      case "Journal":
        article.journal = value;
        break;
      case "Volume":
        article.volume = parseInt(value);
        break;
      case "Issue":
        article.issue = parseInt(value);
        break;
      case "Publisher":
        article.publication = value;
        break;
      case "Description":
        article.description = value;
        break;
      case "Total Citations":
        article.numCitations = parseInt(
          value.substr(citationCountPrefix.length)
        );
        break;
      default:
        console.log(`${field} doesn't match listed cases`);
        break;
    }
  };

  // Extract data from modal title wrapper
  article.title = document.getElementById("gsc_vcd_title")?.textContent ?? "";
  document
    .getElementById("gsc_vcd_title_gg")
    ?.querySelectorAll(".gsc_vcd_title_ggi a")
    .forEach((el) => {
      const URL = (el as HTMLAnchorElement).href.toLowerCase();
      const content = el.textContent?.toLowerCase();
      if (
        URL.indexOf("pdf") !== -1 ||
        URL.indexOf("print") !== -1 ||
        content?.indexOf("pdf") !== -1
      ) {
        article.pdf = URL;
      } else {
        article.url = URL;
      }
    });
  // Extract data from modal body
  document
    .getElementById("gsc_vcd_table")
    ?.querySelectorAll(".gs_scl")
    .forEach((el) => {
      if (tags.modalField && tags.modalValue) {
        const field = el.querySelector(tags.modalField)?.textContent ?? "";
        const value = el.querySelector(tags.modalValue)?.textContent ?? "";
        _parseField(field, value);
      }
    });
  return article;
};

export /**
 *
 *
 * @param {string} url Scholar URL to fetch html content
 * @param {IHTMLTags} tags HTML selectors to scrape articles
 * @returns {IArticle[]} List of Article objects with extracted information
 */
const scrapeProfile = async (
  url: string,
  tags: IHTMLTags
): Promise<IArticle[]> => {
  const articles: IArticle[] = [];
  console.log(url);
  try {
    const dom = await jsdom.JSDOM.fromURL(url, {
      runScripts: "dangerously",
      resources: "usable",
      beforeParse(window) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        window.scrollTo = (): void => {};
      },
    });
    const { document } = dom.window;
    document.querySelectorAll(tags.results).forEach((el) => {
      const modalOpenAnchorEl: HTMLAnchorElement | null = el.querySelector(
        tags.title
      );
      const modalCloseAnchorEl: HTMLAnchorElement | null = document.getElementById(
        "gs_md_cita-d-x"
      ) as HTMLAnchorElement;
      // Open the article modal by clicking the link of each article
      modalOpenAnchorEl?.click();
      console.log(document.getElementById("gsc_ocd_view")?.textContent);
      // Parse article data from modal view
      const article = _parseArticleModal(document, tags);
      if (article && article.title !== "") articles.push(article);
      // Close modal
      modalCloseAnchorEl?.click();
    });
    return articles;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

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
): IArticle | undefined => {
  if ($) {
    const article = new Article();
    if (tags.title) article.title = $(div).find(tags.title).text().trim();
    if (tags.year) article.year = parseInt($(div).find(tags.year).text());
    if (tags.citations)
      article.numCitations = parseInt($(div).find(tags.citations).text()) || 0;
    const articleData = $(div).find(tags.authors);
    article.authors = $(articleData[0]).text().split(",");
    // Remove hidden year attribute
    $(articleData[1]).find(".gs_oph").remove();
    let htmlString = $(articleData[1]).text().trim();
    const idx = splitJournalVolumeString(htmlString);
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
const parseUserArticle = (html: string, tags: IHTMLTags): IArticle[] => {
  const articles: IArticle[] = [];
  const $ = cheerio.load(html);
  const allResults = $(tags.results);
  allResults.each((_, div) => {
    const article = _parseUserArticle($, div, tags);
    if (article && article.title !== "") articles.push(article);
  });
  return articles;
};
