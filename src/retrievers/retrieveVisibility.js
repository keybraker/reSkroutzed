function retrieveVisibility() {
  const sponsoredVisibility = localStorage.getItem("sponsoredVisibility");

  if (sponsoredVisibility !== null) {
    visible = sponsoredVisibility === "true";
  } else {
    visible = true;
    localStorage.setItem("sponsoredVisibility", visible.toString());
  }
}
