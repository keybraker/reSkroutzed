function retrieveVisibility() {
  const sponsoredVisibility = localStorage.getItem("sponsoredVisibility");
  if (sponsoredVisibility === "true" || sponsoredVisibility === "false") {
    visible = sponsoredVisibility;
  } else {
    visible = true;
    localStorage.setItem("sponsoredVisibility", visible);
  }
}
