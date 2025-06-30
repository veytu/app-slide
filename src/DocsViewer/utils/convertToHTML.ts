export type Run = {
  wordSpace: number;
  baseline: number;
  bold: boolean;
  italic: boolean;
  text: string;
  runType: string;
};

export type Paragraph = {
  align: string;
  indent: number;
  marginLeft: number;
  marginRight: number;
  runs: Run[];
};

export function convertToHTML(paragraphs: Paragraph[]): {
  html: string;
  hasLink: boolean;
  link?: string;
} {
  let hasLink = false;
  let link = undefined;
  const res = paragraphs
    .map(paragraph => {
      // Set up styles based on paragraph properties
      const style = `
      text-align: ${
        paragraph.align === "l" ? "left" : paragraph.align == "r" ? "right" : paragraph.align
      };
      text-indent: ${paragraph.indent}px;
      margin-left: ${paragraph.marginLeft}px;
      margin-right: ${paragraph.marginRight}px;
    `;

    //主观题
    //@~@http://localhost:3000/subjective/b46a6266-b8e2-4895-b766-a812b39772f8@~@E1-A-1###互动1
    const subjectiveMatch = /@~@(https?:\/\/[^\s@]+)@~@/;//主观题正则
    


      // Check if the paragraph has a link
      const paragraphHasLink = paragraph.runs.some(run =>
        /@@@(https?:\/\/[^\s@]+)@@@/.test(run.text) ||
        subjectiveMatch.test(run.text)
      );
      hasLink = hasLink || paragraphHasLink;
      // Get link from the runs
      const linkRun = paragraph.runs.find(run => /@@@(https?:\/\/[^\s@]+)@@@/.test(run.text) || subjectiveMatch.test(run.text));
      if (linkRun) {
        link = linkRun?.text?.match?.(/@@@(https?:\/\/[^\s@]+)@@@/)?.[1] || linkRun?.text?.match?.(subjectiveMatch)?.[1] || undefined;
      }

      const runsHTML = paragraph.runs
        .map(run => {
          const runStyle = `word-spacing: ${run.wordSpace}px; baseline-shift: ${run.baseline}px;`;

          // Use regular expression to find links wrapped with @@@ and replace
          const processedText = run.text.replace(/@@@(https?:\/\/[^\s@]+)@@@/g, "").replace(subjectiveMatch, "");

          // Apply bold and italic styles if needed
          let finalText = processedText;
          if (run.bold) {
            finalText = `<strong>${finalText}</strong>`;
          }
          if (run.italic) {
            finalText = `<em>${finalText}</em>`;
          }

          return `<span style="${runStyle}">${finalText}</span>`;
        })
        .join("");

      // Wrap everything in a div with the paragraph styles
      return `<div style="${style}">${runsHTML}</div>`;
    })
    .join("");

  return {
    html: res,
    hasLink,
    link,
  };
}
