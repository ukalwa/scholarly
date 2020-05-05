import {
  ArticleParser,
  HTMLTags,
  Article,
  IPublicationInfo,
  IFooterLinks,
} from "../config";
import axios from "axios";

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
  searchTags = new HTMLTags(
    ".gs_r",
    ".gs_ri h3 a",
    ".gs_ri h3 a",
    ".gs_ri .gs_a",
    ".gs_ri .gs_fl a",
    ".gs_ri .gs_rs",
    ".gs_ggsd a"
  );
  userTags = new HTMLTags(
    ".gsc_a_tr",
    ".gsc_a_t a",
    ".gs_ri h3 a",
    ".gs_gray",
    ".gsc_a_c a"
  );

  /**
   *
   *
   * @memberof _googleScholar
   * @param {CheerioElement} div
   */
  parseSingleArticle = (div: CheerioElement, tags: HTMLTags) => {
    if (this.$) {
      const article = new Article();
      article.title = this.$(div).find(tags.title).text().trim();
      article.url = this.$(div).find(tags.url).attr("href");
      article.description = this.$(div).find(tags.description).text();
      // article.footerLinks = this.$(div).find(tags.footers);
      const footerLinks = this.parseFooterLinks(this.$(div).find(tags.footers));
      article.citationUrl = footerLinks.citationUrl;
      article.relatedUrl = footerLinks.relatedUrl;
      article.numCitations = footerLinks.numCitations;
      article.urlVersionsList = footerLinks.urlVersionsList;

      const publicationInfo = this.parsePublicationTag(
        this.$(div).find(tags.authors)
      );
      article.authors = publicationInfo.authors;
      article.year = publicationInfo.year;
      article.publication = publicationInfo.publication;
      article.pdf = this.$(this.$(div).find(tags.pdf)[0]).attr("href");
      return article;
    }
  };

  /**
   *
   *
   * @memberof _googleScholar
   * @param {Cheerio} div
   */
  parsePublicationTag = (div: Cheerio) => {
    const publicationInfo: IPublicationInfo = {
      authorLinks: [],
      authors: [],
      year: 1900,
      publication: "",
    };
    if (this.$) {
      let authorHTMLString = this.$(div).text();
      if (authorHTMLString === "") {
        return publicationInfo;
      }
      // Author Tag format (author1, author2 - publication, year - journal)
      let author = "";
      let ellipsisIdx = authorHTMLString.indexOf("...");
      for (let idx = 0; idx < authorHTMLString.length; idx++) {
        const char = authorHTMLString[idx];
        if (char === "," || char === "-" || idx === ellipsisIdx) {
          publicationInfo.authors.push(author.trim());
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
      publicationInfo.publication = splitData.pop()?.trim();
      let year = splitData.pop()!.substr(-5).trim();
      publicationInfo.year = parseInt(year);
    }
    return publicationInfo;
  };

  /**
   *
   *
   * @memberof _googleScholar
   * @param {Cheerio} div
   */
  parseFooterLinks = (div: Cheerio) => {
    const links: IFooterLinks = {
      citationUrl: "",
      relatedUrl: "",
      numCitations: 0,
      urlVersionsList: "",
    };
    if (this.$) {
      this.$(div).each((idx, el) => {
        if (this.$) {
          const href = this.$(el).attr("href");
          if (href!.indexOf("/scholar?cites") >= 0) {
            const citationCountPrefix = "Cited by ";
            links.citationUrl = this.baseUrl + href!;
            links.numCitations = parseInt(
              this.$(el).text().substr(citationCountPrefix.length)
            );
          } else if (href!.indexOf("/scholar?q=related") >= 0) {
            links.relatedUrl = this.baseUrl + href!;
          } else if (href!.indexOf("/scholar?cluster") >= 0) {
            links.urlVersionsList = this.baseUrl + href!;
          }
        }
      });
    }
    return links;
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
      this.parse(data, this.searchTags);
      console.log(this.articles);
    } catch (e) {
      console.error(e.message);
    }
  };

  /**
   *
   *
   * @param {string} query
   */
  user = (query: string) => {
    console.log(query);
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
