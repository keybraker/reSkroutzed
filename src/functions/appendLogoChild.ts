export function appendLogoChild(element: HTMLDivElement | HTMLButtonElement) {
  const icon = document.createElement("div");

  icon.classList.add("align-center", "icon-border");

  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  svgElement.setAttribute("viewBox", "0 96 960 960");
  svgElement.setAttribute("width", "18");
  svgElement.setAttribute("height", "18");

  const img = document.createElement("img");
  img.src =
    "https://raw.githubusercontent.com/keybraker/reskroutzed/main/icons/128.png";
  img.alt = "reSkroutzed";
  img.width = 18;
  img.height = 18;

  icon.appendChild(img);

  element.appendChild(icon);
}
