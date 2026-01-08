# Releasing & Publishing Guide

This extension uses GitHub Actions to automate the creation of GitHub Releases and the publishing process to the Chrome Web Store and Firefox Add-ons (AMO).

## Architecture Overview

The automation is split into two distinct workflows for safety and control:

1.  **Release Workflow (`release.yml`)**:
    - **Trigger**: Pushing a git tag (e.g., `v1.2.3`).
    - **Action**: Verifies that the tag matches the versions in `manifests/manifest_chrome.json` and `manifests/manifest_firefox.json`. It builds the extension for both browsers and creates a **Draft Release** on GitHub with the ZIP artifacts attached.
2.  **Publish Workflow (`publish.yml`)**:
    - **Trigger**: Manually publishing the Draft Release on GitHub or using "Run workflow" manually.
    - **Action**: Rebuilds the extension from the specific tag and uploads the artifacts to the Chrome Web Store and Firefox Add-ons gallery.

---

## How to Release a New Version

### 1. Preparation

Before releasing, ensure the version numbers match in both manifest files:

- `manifests/manifest_chrome.json`
- `manifests/manifest_firefox.json`

### 2. Create and Push a Tag

Create a new tag matching the version (must start with `v`).

```bash
git add .
git commit -m "chore: bump version to 1.9.12"
git push
git tag v1.9.12
git push origin v1.9.12
```

### 3. Verify the Draft

Wait for the **Release** action to finish. Go to the **Releases** page on GitHub.

- A new draft named `v1.9.12` will appear.
- Check that `chrome_build.zip` and `firefox_build.zip` are present in the assets.

### 4. Publish to Stores

When you are ready to go live:

1.  Edit the Draft release on GitHub if you wish to add extra information (Installation instructions and changelog are added automatically).
2.  Click **Publish release**.
3.  The **Publish to Stores** action will trigger automatically. You can monitor its progress in the "Actions" tab.

---

## Required Secrets (GitHub Actions)

The following secrets must be configured in **Settings > Secrets and variables > Actions** for the publishing to work:

### Chrome Web Store

- `CHROME_EXTENSION_ID`: The unique ID of your extension in the dashboard.
- `CHROME_CLIENT_ID`: OAuth2 Client ID from Google Cloud Console.
- `CHROME_CLIENT_SECRET`: OAuth2 Client Secret from Google Cloud Console.
- `CHROME_REFRESH_TOKEN`: The refresh token generated once to allow the action to upload on your behalf.

### Firefox Add-ons (AMO)

- `FIREFOX_JWT_ISSUER`: API Key Issuer from the AMO Developer Hub.
- `FIREFOX_JWT_SECRET`: API Key Secret from the AMO Developer Hub.

---

## Troubleshooting

- **Version Mismatch**: The `release.yml` will fail if your git tag (e.g., `v1.9.12`) doesn't match the `version` field in the manifest files.
- **403 Forbidden (Chrome)**: Ensure the **Chrome Web Store API** is enabled in your Google Cloud Project.
- **JWT Errors (Firefox)**: Ensure your API keys are active and that the `FIREFOX_EXTENSION_ID` is correct if specified (though the current script uses the manifest ID).
