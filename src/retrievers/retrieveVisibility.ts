export function retrieveVisibility(): boolean {
  const sponsoredVisibility = localStorage.getItem("sponsoredVisibility");

  if (sponsoredVisibility !== null) {
    return sponsoredVisibility === "true";
  } else {
    localStorage.setItem("sponsoredVisibility", "true");
    return true;
  }
}