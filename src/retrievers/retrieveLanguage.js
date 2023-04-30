function retrieveLanguage() {
  const languageElement = document.querySelector("a[title='language'], a[title='Γλώσσα']");

  if (languageElement) {
    language = languageElement.textContent.trim();
  }
}
