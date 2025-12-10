# GitHub Actions Workflows

## Deploy Browser Extension

This workflow automatically deploys the scite browser extension to Chrome Web Store, Firefox Add-ons, Edge Add-ons, and prepares for Safari App Store deployment.

Based on the guide: [Simplify Browser Extension Deployment with GitHub Actions](https://dev.to/jellyfith/simplify-browser-extension-deployment-with-github-actions-37ob)

### Triggers

The deployment workflow is triggered by:
1. **Published Release**: When a GitHub release is published (recommended approach)
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

**Note**: If you have trouble getting the Refresh Token, give it some time and try again. It can take an hour or so after setting up access to the Chrome Web Store API before it works in some cases.

#### Firefox Add-ons
- `FIREFOX_ISSUER`: JWT issuer from Firefox Add-on Developer Hub
- `FIREFOX_SECRET`: JWT secret from Firefox Add-on Developer Hub

**Setup Instructions for Firefox:**
1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/addon/api/key/)
2. Agree to the terms
3. Generate API credentials
4. Copy the Issuer ID and Secret

**Note**: Firefox uses `web-ext` to sign and publish extensions in XPI format with source code.

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

### Deployment Priority

As specified in the issue, browsers are deployed in priority order:
1. Chrome
2. Firefox
3. Edge
4. Safari (semi-automated)

All browser deployments are handled in a single job that runs sequentially.

### Workflow Jobs

1. **build-and-deploy**: Single job that builds, tests, and deploys to all browsers
   - Validates version synchronization
   - Runs linting and tests
   - Builds extension
   - Publishes to Chrome, Firefox, and Edge
   - Creates and uploads build artifacts to the release
2. **deploy-safari**: Prepares Safari deployment artifact (manual Xcode submission required)

### Deployment Process

**Recommended: Publish a GitHub Release**
1. Ensure version numbers in `package.json` and `extension/manifest.json` are synchronized
2. Create a git tag matching the version number: `git tag v1.36.5 -m "Release v1.36.5"`
3. Push the tag: `git push origin v1.36.5`
4. Go to GitHub Releases and create a new release from the tag
5. Publish the release - this triggers the workflow
6. The workflow will automatically:
   - Build and test the extension
   - Deploy to Chrome, Firefox, and Edge
   - Upload build artifacts (ChromeExtension.zip, FirefoxExtension.xpi, EdgeExtension.zip) to the release

**Benefits of this approach:**
- Automatically generated changelogs
- Build artifacts attached to releases for transparency
- Ability to keep historical versions available
- Clear deployment tracking

### Manual Deployment

To manually trigger a deployment without creating a release:
1. Go to Actions tab in GitHub
2. Select "Deploy Browser Extension" workflow
3. Click "Run workflow"
4. Select target browser(s) or "all"
5. Click "Run workflow" button

**Note**: Manual triggers won't upload artifacts to a release.

### Testing the Workflow

Before setting up all secrets, you can test the workflow:
1. Create a draft release or use workflow_dispatch
2. The workflow will run build and test steps
3. Deployment steps will fail gracefully with `continue-on-error: true` if secrets are missing
4. This allows you to verify the build process works before configuring all secrets

### Troubleshooting

- **Build fails**: Check Node.js version compatibility (workflow uses 16.18)
- **Deployment fails**: Verify all required secrets are correctly configured
- **Chrome deployment fails**: Ensure refresh token is valid (they can expire)
- **Firefox signing fails**: Verify you're using correct Issuer ID and Secret
- **Firefox requires source**: The workflow automatically includes source code zip
- **Edge deployment fails**: Check Azure AD token URL and client credentials are correct
- **Version mismatch**: The workflow will fail if package.json and manifest.json versions don't match

### References

- [DEV Article: Simplify Browser Extension Deployment](https://dev.to/jellyfith/simplify-browser-extension-deployment-with-github-actions-37ob)
- [Chrome Web Store API](https://developer.chrome.com/docs/webstore/using_webstore_api/)
- [Firefox Add-on Signing](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/)
- [Edge Add-ons API](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/using-addons-api)
- [Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
