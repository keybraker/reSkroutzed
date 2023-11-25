import { Language } from "../enums/Language";

export type State = {
    visible: boolean,
    language: Language,
    sponsoredCount: number,
    sponsoredShelfCount: number,
    videoCount: number,
}