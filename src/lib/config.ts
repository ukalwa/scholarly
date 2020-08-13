import { IArticle, IArticleLinks, IAuthorInfo } from "./interfaces";

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
