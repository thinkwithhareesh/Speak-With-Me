# JARVIS — Web Browser Module

## Setup

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Set your Anthropic key:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## REST API

### Search the web
```http
POST /browser/search
{"query": "latest AI news", "summarise": false}
```

### Search + auto-summarise top result
```http
POST /browser/search
{"query": "latest AI news", "summarise": true, "instruction": "Focus on safety research"}
```

### Fetch & summarise a URL
```http
POST /browser/fetch
{"url": "https://example.com/article", "instruction": "Extract key statistics"}
```

### Recall past browsing (FTS5)
```http
POST /browser/recall
{"term": "openai"}
```

### Browse history
```http
GET /browser/history?limit=20
```

---

## WebSocket API

Connect to `ws://localhost:8000/ws` and send JSON:

```json
// Search only
{"module": "browser", "action": "search", "query": "AI news today"}

// Search + summarise best result
{"module": "browser", "action": "browse", "query": "how to train an LLM"}

// Fetch a specific URL
{"module": "browser", "action": "fetch", "url": "https://example.com"}

// Recall from history
{"module": "browser", "action": "recall", "term": "openai"}
```

Response always includes a `voice_reply` field — feed this to ElevenLabs TTS.

---

## Plug into your JARVIS voice handler

```python
# In your voice command parser:
if "search" in transcript or "browse" in transcript or "look up" in transcript:
    query = extract_query(transcript)
    await ws.send_json({
        "module": "browser",
        "action": "browse",
        "query": query
    })
```

---

## Data Storage

SQLite file: `jarvis_browser.db`  
Tables: `browse_history` + `browse_fts` (FTS5 full-text search)  
Zero external infrastructure — runs entirely local.
