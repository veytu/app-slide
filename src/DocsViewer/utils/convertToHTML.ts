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

export function convertToHTML(paragraphs: Paragraph[]): string {
  return paragraphs
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

      const runsHTML = paragraph.runs
        .map(run => {
          const runStyle = `word-spacing: ${run.wordSpace}px; baseline-shift: ${run.baseline}px;`;

          // Use regular expression to find links wrapped with @@@ and replace
          const processedText = run.text.replace(
            /@@@(https?:\/\/[^\s@]+)@@@([^#]*)###/g,
            '<a href="$1" onclick="return false">$2</a>'
          );

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
}
