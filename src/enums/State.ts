import { Language } from "./Language";

export type State = {
    visible: boolean,
    language: Language,
    sponsoredCount: number,
    sponsoredShelfCount: number,
    videoCount: number,
}