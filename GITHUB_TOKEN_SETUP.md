# GitHub Token Setup for Changesets

## Problem
GitHub Actions with `GITHUB_TOKEN` cannot create Pull Requests in certain contexts.

## Solution: Create a Personal Access Token (PAT)

### Step 1: Create a PAT
1. Go to: https://github.com/settings/tokens/new
2. Select **Fine-grained tokens** (recommended) or **Classic tokens**

#### For Fine-grained tokens:
- **Token name**: `CHANGESET_RELEASE_TOKEN`
- **Expiration**: 90 days (or custom)
- **Repository access**: Only select repositories → `devzolo/ts-run`
- **Permissions**:
  - **Repository permissions**:
    - Contents: Read and write
    - Pull requests: Read and write
    - Metadata: Read-only (automatically selected)

#### For Classic tokens:
- **Note**: `CHANGESET_RELEASE_TOKEN`
- **Expiration**: 90 days (or custom)
- **Scopes**:
  - ✅ `repo` (Full control of private repositories)
  - ✅ `workflow` (Update GitHub Action workflows)

3. Click **Generate token**
4. **Copy the token immediately** (you won't be able to see it again)

### Step 2: Add token to repository secrets
1. Go to: https://github.com/devzolo/ts-run/settings/secrets/actions
2. Click **New repository secret**
3. **Name**: `CHANGESET_RELEASE_TOKEN`
4. **Value**: Paste the token you copied
5. Click **Add secret**

### Step 3: Update workflow file
The `.github/workflows/release.yml` file needs to use the new token:

```yaml
      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          version: pnpm release:version
          publish: pnpm release:publish
        env:
          GITHUB_TOKEN: ${{ secrets.CHANGESET_RELEASE_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Alternative Solution: Use GitHub App

For production/organization use, consider creating a GitHub App with the necessary permissions. This is more secure and doesn't expire like PATs.

See: https://github.com/changesets/action#with-publishing

