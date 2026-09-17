# short-dialog

80秒の会話JSONを、20秒 × 4本のYouTube Shortsへ変換するCLI/API。

## Pipeline

```text
LLM
 ↓
dialog.json
 ↓
validate
 ↓
split 80s → 20s × 4
 ↓
render MP4
 ↓
YouTube Shorts upload
```

## Responsibilities

- **LLM**: 会話内容を `dialog.json` に構造化
- **API**: JSON入力・検証・分割・レンダリング・アップロードを呼び出す
- **CLI**: ローカル/CIから同じ処理を実行
- **Renderer**: 黒背景 + LINE風バブルのMP4を生成
- **YouTube**: YouTube Data API経由でShortsとしてアップロード
- **AW**: Epic → Issue → Workflow に分解して実行

## Canonical data

`dialog.json` が会話データの正本。表示・動画生成・Shorts分割はここから派生する。

## Target

- total: 80 seconds
- shorts: 4
- each: 20 seconds
- output: MP4
- aspect ratio: 9:16

## CLI

```bash
short-dialog validate dialog.json
short-dialog split dialog.json --out shorts/
short-dialog render shorts/01.json --out dist/01.mp4
short-dialog render-all dialog.json --out dist/
short-dialog upload dist/ --youtube
```

## API

```text
POST /validate
POST /split
POST /render
POST /pipeline
POST /youtube/upload
```

## Security

YouTube OAuth credentials are never stored in `dialog.json`. CI uses GitHub Actions secrets/environment secrets.
