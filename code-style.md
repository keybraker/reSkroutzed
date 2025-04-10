# Code Style Guide

This document outlines the coding standards and best practices to be followed in this project. Adhering to these guidelines ensures consistency, readability, and maintainability of the codebase.

## General Guidelines

1. **Use TypeScript**: All new files should be written in TypeScript unless there is a specific reason to use JavaScript.
2. **Follow ESLint Rules**: Ensure your code passes the ESLint checks. Use the provided configuration in `.eslintrc.json`.
3. **Use Prettier for Formatting**: Code should be formatted using Prettier. The editor is configured to format on save.
4. **Use Strict Typing**: Always use strict typing for variables, function parameters, and return types.
5. **Avoid Magic Numbers**: Use constants or enums for values that have specific meanings.
6. **Commenting**: Use comments to explain why a piece of code exists, not what it does. The code should be self-explanatory.
7. **Naming Conventions**:
   - Use `camelCase` for variables and functions.
   - Use `PascalCase` for classes and types.
   - Use `UPPER_SNAKE_CASE` for constants.
8. **Avoid Global Variables**: Use modules and imports to share code.

## Project-Specific Guidelines

### File Structure
- Organize files by feature or functionality.
- Use folders like `actions`, `decorators`, `handlers`, `utilities`, etc., to group related files.

### CSS
- Use CSS variables for theming and consistent styling.
- Follow the BEM (Block Element Modifier) naming convention for class names.
- Keep CSS modular and scoped to specific components.

### TypeScript
- Use `interface` or `type` for defining data structures.
- Use `enum` for predefined sets of values (e.g., `Language` enum).
- Avoid using `any`. Use `unknown` if the type is not known.

### Webpack
- Use the common configuration file (`webpack.common.config.js`) for shared settings.
- Keep browser-specific configurations (`webpack.chrome.config.js`, `webpack.firefox.config.js`) minimal and focused on differences.

### Testing
- Follow the Triple-A (Arrange, Act, Assert) approach for writing tests.
- Place test files alongside the files they test, using the `.test.ts` suffix.

### Git Commit Messages
- Use the conventional commit format:
  ```
  <type>(<scope>): <description>
  ```
  Example: `feat(popup): add dark mode toggle`
- Include the ticket code if applicable (e.g., `FCSE-1234 - feat(popup): add dark mode toggle`).

### Browser Extensions
- Use `manifest.json` files specific to each browser (`manifest_chrome.json`, `manifest_firefox.json`).
- Ensure compatibility with the latest browser versions.

## Tools and Plugins

### Required Plugins
- **ESLint**: For linting JavaScript and TypeScript code.
- **Prettier**: For consistent code formatting.
- **TypeScript**: For type checking.

### Recommended VS Code Extensions
- ESLint
- Prettier - Code formatter
- GitLens
- Path Intellisense

## Additional Notes
- Always test your changes in both Chrome and Firefox builds.
- Keep dependencies up-to-date and remove unused ones.
- Document any significant changes in the `README.md` file.
