# Releasing & Publishing Guide

Pushing a git tag triggers a single GitHub Actions workflow that builds, tests, creates a GitHub Release, and publishes to both the Chrome Web Store and Firefox Add-ons automatically.

## Architecture

One workflow — `.github/workflows/release.yml`:

- **Trigger**: Push a `v*` tag (e.g. `v1.2.3`), or trigger manually via `workflow_dispatch`.
- **Actions** (sequential):
  1. Version consistency check — tag must match `package.json`, `manifest_chrome.json`, and `manifest_firefox.json`.
  2. `npm test` gate — won't publish if tests fail.
  3. Build Chrome + Firefox extensions (`npm run build`).
  4. Create a GitHub Release with `chrome_build.zip` and `firefox_build.zip` attached.
  5. Publish to Chrome Web Store via `chrome-webstore-upload-cli`.
  6. Publish to Firefox Add-ons via `web-ext sign`.

---

## How to Release a New Version

### 1. Bump the version

Use one of the npm scripts to update the version across all three files at once:

```bash
npm run version:patch    # 2.2.1 → 2.2.2
npm run version:minor    # 2.2.1 → 2.3.0
npm run version:major    # 2.2.1 → 3.0.0
npm run version:set -- 4.5.6   # set an exact version
```

### 2. Commit, tag, and push

```bash
git add -A
git commit -m "chore: bump version to vX.Y.Z"
git tag vX.Y.Z
git push --follow-tags
```

### 3. Watch the workflow

Go to the **Actions** tab on GitHub. The `Release & Publish` workflow will run automatically when the tag is pushed. It will:

- ✅ Verify all versions match
- ✅ Run the test suite
- ✅ Build both extensions
- ✅ Create a GitHub Release with zip artifacts
- ✅ Upload to Chrome Web Store
- ✅ Upload to Firefox Add-ons

---

## Required Secrets (GitHub Actions)

Configure these in **Settings > Secrets and variables > Actions**:

### Chrome Web Store

| Secret                 | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `CHROME_EXTENSION_ID`  | Extension ID from the Chrome Web Store dashboard |
| `CHROME_CLIENT_ID`     | OAuth2 Client ID from Google Cloud Console       |
| `CHROME_CLIENT_SECRET` | OAuth2 Client Secret from Google Cloud Console   |
| `CHROME_REFRESH_TOKEN` | Refresh token for uploading on your behalf       |

### Firefox Add-ons (AMO)

| Secret               | Description                               |
| -------------------- | ----------------------------------------- |
| `FIREFOX_JWT_ISSUER` | API Key Issuer from the AMO Developer Hub |
| `FIREFOX_JWT_SECRET` | API Key Secret from the AMO Developer Hub |

---

## Troubleshooting

- **Version Mismatch**: The workflow fails if the git tag doesn't match the `version` field in all three files. Run `npm run version:set -- X.Y.Z` to sync them, commit, and re-tag.
- **403 Forbidden (Chrome)**: Ensure the **Chrome Web Store API** is enabled in your Google Cloud Project and the refresh token hasn't expired.
- **JWT Errors (Firefox)**: Ensure your AMO API keys are active and haven't been revoked.
- **Test failures**: The workflow runs `npm test` as a gate. Fix failing tests before attempting to release.
