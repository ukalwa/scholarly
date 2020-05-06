export interface IArticle {
  title: string;
  url?: string;
  authors: string[];
  numCitations?: number;
  year: number;
  volume?: number;
  issue?: number;
  pages?: string;
  journal?: string;
  publication?: string;
}

export interface IArticleLinks {
  pdf?: string;
  urlVersionsList?: string;
  citationUrl?: string;
  relatedUrl?: string;
  authorLinks?: string[];
}

export interface IFooterLinks extends IArticleLinks {
  numCitations?: number;
}

export interface IPublicationInfo {
  authors: string[];
  year: number;
  publication?: string;
  authorLinks: string[];
}

export interface IAuthorInfo {
  allCitations: number;
  hIndex: number;
  i10Index: number;
  interests?: string[];
}

export interface IHTMLTags {
  results: string;
  title: string;
  url: string;
  authors: string;
  footers?: string;
  description?: string;
  pdf?: string;
  year?: string;
  citations?: string;
}
