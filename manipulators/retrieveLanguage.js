function retrieveLanguage() {
  const languageElementEN = document.querySelector("a[title='language']");
  const languageElementEL = document.querySelector("a[title='Γλώσσα']");

  if (languageElementEN || languageElementEL) {
    languageElement = languageElementEN ? languageElementEN : languageElementEL;
    language = languageElement.textContent.trim();
  }
}
