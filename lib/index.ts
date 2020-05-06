import googleScholar from "./googleScholar";

// googleScholar.search("machine learning").then((data) => console.log(data));
// googleScholar.user("H18-9fkAAAAJ").then((data) => console.log(data));

export const user = googleScholar.user;
export const search = googleScholar.search;
