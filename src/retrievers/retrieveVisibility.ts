import { State } from "../enums/State";

export function retrieveVisibility(state: State): void {
  const sponsoredVisibility = localStorage.getItem("sponsoredVisibility");

  if (sponsoredVisibility !== null) {
    state.visible = sponsoredVisibility === "true";
  } else {
    state.visible = true;
    localStorage.setItem("sponsoredVisibility", state.visible.toString());
  }
}