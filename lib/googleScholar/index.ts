import { IArticle, IHTMLTags } from "../interfaces";

import axios from "axios";
import { parseScholarArticle } from "./search";
import { parseUserArticle } from "./user";

/**
 *
 *
 * @class _googleScholar
 * @extends {ArticleParser}
 */
class GoogleScholar {
  baseUrl = "https://scholar.google.com";
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
   * @param {string} query
   */
  search = async (query: string): Promise<IArticle[]> => {
    let articles: IArticle[] = [];
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
      articles = parseScholarArticle(data, this.searchTags);
    } catch (e) {
      console.error(e.message);
      throw new Error(e);
    }
    return articles;
  };

  /**
   *
   *
   * @param {string} profile
   */
  user = async (profile: string): Promise<IArticle[]> => {
    let articles: IArticle[] = [];
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
      articles = parseUserArticle(data, this.userTags);
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
    return articles;
  };
}

const googleScholar = new GoogleScholar();
export default googleScholar;
