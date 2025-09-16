# Bio to Markdown Table Action

A GitHub Action (composite, Bun-powered) that converts profile bio text to markdown table format and replaces specified placeholders. The action installs Bun at runtime and executes `src/index.ts` directly.

Built with TypeScript and enforced with Biome for code quality.

## Usage

### Workflow Example

```yaml
name: Update Profile Bio
on:
  push:
    branches: [main]

jobs:
  update-bio:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Convert bio to table
        uses: yutkat/bio2markdown-table@v1
        # with:
        #   github_token: ${{ secrets.GITHUB_TOKEN }}
        #   files: "README.md"
        #   placeholder: "{{github_profile_bio}}"
        #   user: ${{ github.actor }}
        #   delimiter: '/'

      - name: Commit changes
        run: |
          git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add .
          git diff --staged --quiet || git commit -m "Update profile bio table"
          git push
```

### Arguments

| Parameter      | Required | Default                  | Description                                                       |
| -------------- | -------- | ------------------------ | ----------------------------------------------------------------- |
| `user`         | No       | `GITHUB_ACTOR`           | GitHub username to fetch bio for                                  |
| `github_token` | No       | -                        | Token for GitHub API (improves rate limits)                       |
| `delimiter`    | No       | `/`                      | Separator between entries in `bio` (whitespace around is ignored) |
| `files`        | No       | `README.md`              | Files to update (comma-separated)                                 |
| `placeholder`  | No       | `{{github_profile_bio}}` | Placeholder to replace                                            |

### Outputs

| Output  | Description              |
| ------- | ------------------------ |
| `table` | Generated markdown table |

## Conversion Example

### Input

```
Role: Programmer / Editor: Neovim / Shell: zsh / Terminal: WezTerm / OS: NixOS, ArchLinux(Hyprland), Android / PC: Thinkpad, Lemur Pro, HHKB Hybrid, GameBall
```

### Output

```markdown
|              |                                            |
| -----------: | :----------------------------------------- |
|     **Role** | Programmer                                 |
|   **Editor** | Neovim                                     |
|    **Shell** | zsh                                        |
| **Terminal** | WezTerm                                    |
|       **OS** | NixOS, ArchLinux(Hyprland), Android        |
|       **PC** | Thinkpad, Lemur Pro, HHKB Hybrid, GameBall |
```

### Custom Delimiter Example

If entries are separated with `;`, set `delimiter: ';'` and write bios like:

```
Role: Programmer; Editor: Neovim; Shell: zsh
```

## Profile Bio

| | |
|---:|:---|
| **Role** | Programmer |
| **Editor** | Neovim |
| **Shell** | zsh |
| **Terminal** | WezTerm |
| **OS** | NixOS, ArchLinux(Hyprland), Android |
| **PC** | Thinkpad, Lemur Pro, HHKB Hybrid , GameBall |
