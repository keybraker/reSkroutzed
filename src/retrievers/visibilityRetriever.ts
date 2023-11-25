export function retrieveVisibility(): boolean {
    const ssfSponsoredVisibility = localStorage.getItem("ssf-sponsored-visibility");

    if (ssfSponsoredVisibility !== null) {
        return ssfSponsoredVisibility === "true";
    } else {
        localStorage.setItem("ssf-sponsored-visibility", "true");
        return true;
    }
}