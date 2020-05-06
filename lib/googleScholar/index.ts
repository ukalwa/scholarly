import { ArticleParser, Article } from "../config";
import axios from "axios";
import { IHTMLTags } from "../interfaces";
import { splitJournalVolumeString, splitVolumeIssueString } from "../utils";

/**
 *
 *
 * @class _googleScholar
 * @extends {ArticleParser}
 */
class _googleScholar extends ArticleParser {
  baseUrl = "http://scholar.google.com";
  apiInstance = axios.create({
    baseURL: this.baseUrl,
  });
  searchTags: IHTMLTags = {
    results: ".gs_r",
    title: ".gs_ri h3 a",
    url: ".gs_ri h3 a",
    authors: ".gs_ri .gs_a",
    footers: ".gs_ri .gs_fl a",
    description: ".gs_ri .gs_rs",
    pdf: ".gs_ggsd a",
  };

  userTags: IHTMLTags = {
    results: ".gsc_a_tr",
    title: ".gsc_a_t a",
    url: ".gs_ri h3 a",
    authors: ".gs_gray",
    year: ".gsc_a_y",
    citations: ".gsc_a_c",
  };

  /**
   *
   *
   * @memberof _googleScholar
   * @param {CheerioElement} div
   */
  _parseScholarArticle = (div: CheerioElement, tags: IHTMLTags) => {
    if (this.$) {
      const article = new Article();
      article.title = this.$(div).find(tags.title).text().trim();
      article.url = this.$(div).find(tags.url).attr("href");
      article.description = this.$(div).find(tags.description!).text();
      article.pdf = this.$(this.$(div).find(tags.pdf!)[0]).attr("href");
      this.parseFooterLinks(this.$(div).find(tags.footers!), article);
      this.parsePublicationTag(this.$(div).find(tags.authors), article);
      return article;
    }
  };

  /**
   *
   *
   * @memberof _googleScholar
   * @param {CheerioElement} div
   */
  _parseUserArticle = (div: CheerioElement, tags: IHTMLTags) => {
    if (this.$) {
      const article = new Article();
      article.title = this.$(div).find(tags.title).text().trim();
      article.year = parseInt(this.$(div).find(tags.year!).text());
      article.numCitations =
        parseInt(this.$(div).find(tags.citations!).text()) || 0;
      const articleData = this.$(div).find(tags.authors);
      article.authors = this.$(articleData[0]).text().split(",");
      // Remove hidden year attribute
      this.$(articleData[1]).find(".gs_oph").remove();
      let htmlString = this.$(articleData[1]).text().trim();
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

  /**
   *
   *
   * @memberof _googleScholar
   * @param {Cheerio} div
   */
  parsePublicationTag = (div: Cheerio, article: Article) => {
    if (this.$) {
      let authorHTMLString = this.$(div).text();
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
    }
    return;
  };

  /**
   *
   *
   * @memberof _googleScholar
   * @param {Cheerio} div
   */
  parseFooterLinks = (div: Cheerio, article: Article) => {
    if (this.$) {
      this.$(div).each((idx, el) => {
        if (this.$) {
          const href = this.$(el).attr("href");
          if (href!.indexOf("/scholar?cites") >= 0) {
            const citationCountPrefix = "Cited by ";
            article.citationUrl = this.baseUrl + href!;
            article.numCitations = parseInt(
              this.$(el).text().substr(citationCountPrefix.length)
            );
          } else if (href!.indexOf("/scholar?q=related") >= 0) {
            article.relatedUrl = this.baseUrl + href!;
          } else if (href!.indexOf("/scholar?cluster") >= 0) {
            article.urlVersionsList = this.baseUrl + href!;
          }
        }
      });
    }
  };

  /**
   *
   *
   * @param {string} query
   * @param {boolean} [all=false]
   */
  search = async (query: string, all: boolean = false) => {
    try {
      if (query === "") {
        throw new Error("Query cannot be empty!");
      }
      const searchUrl = encodeURI(`/scholar?hl=en&q=${query}`);
      const result = await axios.get(this.baseUrl + searchUrl);
      if (result.status !== 200) {
        throw new Error(result.statusText);
      }
      const data: string = result.data;
      this.parseScholarArticle(data, this.searchTags);
      return this.articles;
    } catch (e) {
      console.error(e.message);
    }
  };

  /**
   *
   *
   * @param {string} profile
   */
  user = async (profile: string) => {
    try {
      if (profile === "") {
        throw new Error("User cannot be empty!");
      }
      const profileUrl = encodeURI(`/citations?hl=en&user=${profile}`);
      const result = await axios.get(this.baseUrl + profileUrl);
      if (result.status !== 200) {
        throw new Error(result.statusText);
      }
      // Get HTML string
      const data: string = result.data;
      this.parseUserArticle(data, this.userTags);
      return this.articles;
    } catch (e) {
      console.error(e);
    }
  };

  /**
   *
   *
   * @param {string} query
   */
  all = (query: string) => {
    console.log(query);
  };
}

const googleScholar = new _googleScholar();
export default googleScholar;
