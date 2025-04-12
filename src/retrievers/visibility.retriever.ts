export function retrieveVisibility(): boolean {
  const ssfSponsoredVisibility = localStorage.getItem(
    "ssf-sponsored-visibility"
  );

  if (ssfSponsoredVisibility !== null) {
    return ssfSponsoredVisibility === "true";
  } else {
    localStorage.setItem("ssf-sponsored-visibility", "true");
    return true;
  }
}

export function retrieveVideoVisibility(): boolean {
  const ssfVideoVisibility = localStorage.getItem("ssf-video-visibility");

  if (ssfVideoVisibility !== null) {
    return ssfVideoVisibility === "true";
  } else {
    localStorage.setItem("ssf-video-visibility", "true");
    return true;
  }
}
