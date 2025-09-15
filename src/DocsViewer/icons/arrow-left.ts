export function arrowLeftSVG(namespace: string): SVGElement {
  const NS = "http://www.w3.org/2000/svg";

  const $svg = document.createElementNS(NS, "svg");
  $svg.setAttribute("class", `${namespace}-footer-icon-arrow-left`);
  $svg.setAttribute("viewBox", "0 0 20 20");

  $svg.innerHTML = `<g clip-path="url(#clip0_11800_99864)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.5283 4.86182L12.4711 5.80463L8.22849 10.0473L12.4711 14.2899L11.5283 15.2327L6.34287 10.0473L11.5283 4.86182Z" class="arrow" />
</g>
<defs>
<clipPath id="clip0_11800_99864">
<rect width="16" height="16" fill="white" transform="translate(2 2)"/>
</clipPath>
</defs>`;

  return $svg;
}
