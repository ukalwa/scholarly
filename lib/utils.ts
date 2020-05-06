export const splitJournalVolumeString = (html: string) => {
  for (let idx = 0; idx < html.length; idx++) {
    const char = html[idx];
    if (!isNaN(parseInt(char))) {
      return idx;
    }
  }
  return html.length;
};

export const splitVolumeIssueString = (html: string) => {
  const output: { volume?: number; issue?: number } = {
    volume: undefined,
    issue: undefined,
  };
  let value = "";

  for (let idx = 0; idx < html.length; idx++) {
    const char = html[idx];
    // format 10 (10)
    if (char !== " " && isNaN(parseInt(char))) {
      if (!output.volume) {
        output.volume = parseInt(value);
      } else {
        output.issue = parseInt(value);
        return output;
      }
      value = "";
    } else {
      value += char;
    }
  }
  return output;
};
