# GitHub Actions Workflows

## Deploy Browser Extension

This workflow automatically deploys the scite browser extension to Chrome Web Store, Firefox Add-ons, Edge Add-ons, and prepares for Safari App Store deployment.

### Triggers

The deployment workflow is triggered by:
1. **Tag Push**: When a tag matching `v*.*.*` is pushed (e.g., `v1.36.5`)
2. **Manual Dispatch**: Can be manually triggered from the Actions tab with option to select specific browser(s)

### Required Secrets

Before the workflow can successfully deploy, the following secrets must be configured in the repository settings (Settings → Secrets and variables → Actions):

#### Chrome Web Store
- `CHROME_EXTENSION_ID`: Your Chrome extension ID (found in Chrome Web Store Developer Dashboard)
- `CHROME_CLIENT_ID`: OAuth 2.0 client ID from Google Cloud Console
- `CHROME_CLIENT_SECRET`: OAuth 2.0 client secret from Google Cloud Console
- `CHROME_REFRESH_TOKEN`: OAuth 2.0 refresh token

**Setup Instructions for Chrome:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Chrome Web Store API
4. Create OAuth 2.0 credentials (Desktop app type)
5. Generate refresh token using the client ID and secret
6. Get extension ID from [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)

#### Firefox Add-ons
- `FIREFOX_ADDON_ID`: Your Firefox extension ID (from addons.mozilla.org)
- `FIREFOX_API_ISSUER`: JWT issuer from Firefox Add-on Developer Hub
- `FIREFOX_API_SECRET`: JWT secret from Firefox Add-on Developer Hub

**Setup Instructions for Firefox:**
1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/addon/api/key/)
2. Generate API credentials
3. Copy the JWT issuer and secret

#### Edge Add-ons
- `EDGE_PRODUCT_ID`: Your Edge extension product ID (from Partner Center)
- `EDGE_CLIENT_ID`: Azure AD application client ID
- `EDGE_CLIENT_SECRET`: Azure AD application client secret
- `EDGE_ACCESS_TOKEN_URL`: Azure AD token URL (typically `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token`)

**Setup Instructions for Edge:**
1. Go to [Partner Center](https://partner.microsoft.com/dashboard)
2. Create Azure AD application for API access
3. Get product ID from your extension listing
4. Configure API credentials in Partner Center

#### Safari App Store
Safari deployment requires manual steps in Xcode and cannot be fully automated via GitHub Actions:
1. The workflow prepares the extension and creates a deployment artifact
2. Download the artifact from the workflow run
3. Follow the instructions in the artifact's README.md
4. Use Xcode to archive and upload to App Store Connect

**Note:** Safari requires macOS, Xcode, and Apple Developer account access for final submission.

### Deployment Priority

As specified in the issue, browsers are deployed in priority order:
1. Chrome
2. Firefox
3. Edge
4. Safari (semi-automated)

All deployments run in parallel after the build job completes successfully.

### Workflow Jobs

1. **build**: Builds the extension, runs tests and linting, creates distribution zips
2. **deploy-chrome**: Deploys to Chrome Web Store
3. **deploy-firefox**: Deploys to Firefox Add-ons (includes source code)
4. **deploy-edge**: Deploys to Edge Add-ons
5. **deploy-safari**: Prepares Safari deployment artifact with instructions
6. **release**: Creates a GitHub release with deployment status

### Manual Deployment

To manually trigger a deployment:
1. Go to Actions tab in GitHub
2. Select "Deploy Browser Extension" workflow
3. Click "Run workflow"
4. Select target browser(s) or "all"
5. Click "Run workflow" button

### Version Management

- Ensure version numbers in `package.json` and `extension/manifest.json` are synchronized
- Create a git tag matching the version number (e.g., `git tag v1.36.5`)
- Push the tag to trigger deployment: `git push origin v1.36.5`

### Testing the Workflow

Before setting up all secrets, you can test the build job by:
1. Creating a feature branch
2. Adding the workflow file
3. Pushing to trigger the build (deployment jobs will be skipped without tags/secrets)

### Troubleshooting

- **Build fails**: Check Node.js version compatibility (workflow uses 16.18)
- **Deployment fails**: Verify all required secrets are correctly configured
- **Chrome deployment fails**: Ensure refresh token is valid (they expire)
- **Firefox requires source**: The workflow includes source code zip for review
- **Edge deployment fails**: Check Azure AD token URL is correct

### References

- [Chrome Web Store API](https://developer.chrome.com/docs/webstore/using_webstore_api/)
- [Firefox Add-on Signing](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/)
- [Edge Add-ons API](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/using-addons-api)
- [Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
