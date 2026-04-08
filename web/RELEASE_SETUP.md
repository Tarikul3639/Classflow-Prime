# Semantic Release Setup (Web Only)

This guide explains how to set up automatic versioning and releases for the **web** folder using semantic-release.

---

## 📦 Step 1: Install Packages (Inside web folder)

```bash
# Navigate to web directory
cd web

# Install semantic-release and required plugins
npm install --save-dev semantic-release semantic-release-monorepo \
@semantic-release/changelog @semantic-release/git \
@semantic-release/github @semantic-release/npm
````

---

## ⚙️ Step 2: Create Configuration File

Create a file:

```
web/.releaserc.json
```

Add the following content:

```json
{
  "extends": "semantic-release-monorepo",
  "tagFormat": "web-v${version}",
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "CHANGELOG.md"],
        "message": "chore(web): release ${nextRelease.version} [skip ci]\\n\\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
}
```

---

## 🤖 Step 3: Create GitHub Actions Workflow

Create the following file in your project root:

```
.github/workflows/web-release.yml
```

Add this configuration:

```yaml
name: Web Release

on:
  push:
    branches:
      - main
    paths:
      - 'web/**' # Only trigger when web folder changes

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'

      - name: Install & Release Web
        working-directory: ./web
        run: |
          npm install
          npx semantic-release -e .releaserc.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 🔐 Step 4: Enable Permissions in GitHub

To allow semantic-release to create releases and push changes:

1. Go to your **GitHub Repository**
2. Open **Settings → Actions → General**
3. Under **Workflow permissions**, select:

   * ✅ **Read and write permissions**
4. Click **Save**

---

## 🚀 Step 5: How to Trigger a Release

Use **Conventional Commits**:

### 🔹 Minor Version (e.g., 1.0.0 → 1.1.0)

```bash
git add .
git commit -m "feat(web): add new login page"
git push origin main
```

### 🔹 Patch Version (e.g., 1.0.0 → 1.0.1)

```bash
git add .
git commit -m "fix(web): fix navigation bug"
git push origin main
```

---

## 🎯 Result

* ✅ Automatic version bump
* ✅ GitHub release creation
* ✅ Auto-generated changelog
* ✅ Runs only when `web/` changes

---

## ⚠️ Notes

* Only commits starting with `feat:` or `fix:` trigger releases
* Always use scope `(web)` for clarity
