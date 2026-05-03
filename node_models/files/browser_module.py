"""
JARVIS — Web Browser Module
────────────────────────────
Capabilities:
  • DuckDuckGo search (no API key)
  • Full page scraping + clean text extraction
  • Claude Haiku summarization
  • FastAPI routes + WebSocket broadcast
  • Persistent session history (SQLite)

Usage:
  from browser_module import router, BrowserModule
  app.include_router(router)
"""

from __future__ import annotations
import re
import sqlite3
import httpx
import asyncio
from datetime import datetime
from typing import Optional
from urllib.parse import quote_plus, urljoin, urlparse

from bs4 import BeautifulSoup
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import anthropic

# ── Config ────────────────────────────────────────────────────────────────────

CLAUDE_MODEL   = "claude-haiku-4-5-20251001"
DB_PATH        = "jarvis_browser.db"
MAX_PAGE_CHARS = 12_000   # chars sent to Claude for summarisation
SEARCH_RESULTS = 5        # number of DDG results to return
HTTP_TIMEOUT   = 15       # seconds

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# ── Database ──────────────────────────────────────────────────────────────────

def init_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS browse_history (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            ts        TEXT    NOT NULL,
            action    TEXT    NOT NULL,   -- 'search' | 'fetch' | 'summarise'
            query     TEXT,
            url       TEXT,
            title     TEXT,
            summary   TEXT,
            raw_len   INTEGER
        )
    """)
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS browse_fts
        USING fts5(title, summary, query, content='browse_history', content_rowid='id')
    """)
    conn.commit()
    return conn

DB: sqlite3.Connection = init_db()

def save_history(action: str, query: str = "", url: str = "",
                 title: str = "", summary: str = "", raw_len: int = 0):
    cur = DB.execute(
        "INSERT INTO browse_history(ts,action,query,url,title,summary,raw_len) "
        "VALUES(?,?,?,?,?,?,?)",
        (datetime.utcnow().isoformat(), action, query, url, title, summary, raw_len),
    )
    rowid = cur.lastrowid
    DB.execute(
        "INSERT INTO browse_fts(rowid,title,summary,query) VALUES(?,?,?,?)",
        (rowid, title, summary, query),
    )
    DB.commit()
    return rowid

def search_history(term: str, limit: int = 5) -> list[dict]:
    rows = DB.execute(
        "SELECT h.ts, h.action, h.query, h.url, h.title, h.summary "
        "FROM browse_fts f JOIN browse_history h ON f.rowid = h.id "
        "WHERE browse_fts MATCH ? ORDER BY rank LIMIT ?",
        (term, limit),
    ).fetchall()
    keys = ["ts", "action", "query", "url", "title", "summary"]
    return [dict(zip(keys, r)) for r in rows]

# ── Scraper ───────────────────────────────────────────────────────────────────

def clean_html(html: str, base_url: str = "") -> tuple[str, str]:
    """Return (title, clean_text) from raw HTML."""
    soup = BeautifulSoup(html, "html.parser")

    # Title
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else urlparse(base_url).netloc

    # Remove noise
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "aside", "form", "iframe", "noscript", "svg"]):
        tag.decompose()

    # Prefer main content areas
    main = soup.find("main") or soup.find("article") or soup.find(id="content") or soup.body
    text = main.get_text(separator="\n", strip=True) if main else soup.get_text("\n", strip=True)

    # Collapse whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return title, text.strip()

async def fetch_page(url: str) -> tuple[str, str, int]:
    """Fetch URL → (title, text, raw_len). Raises on failure."""
    async with httpx.AsyncClient(headers=HEADERS, timeout=HTTP_TIMEOUT,
                                 follow_redirects=True) as client:
        r = await client.get(url)
        r.raise_for_status()
    raw_len = len(r.text)
    title, text = clean_html(r.text, url)
    return title, text, raw_len

# ── DuckDuckGo Search ─────────────────────────────────────────────────────────

async def ddg_search(query: str, max_results: int = SEARCH_RESULTS) -> list[dict]:
    """
    Scrape DuckDuckGo HTML results — zero API key needed.
    Returns list of {title, url, snippet}.
    """
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    async with httpx.AsyncClient(headers=HEADERS, timeout=HTTP_TIMEOUT,
                                 follow_redirects=True) as client:
        r = await client.get(url)

    soup = BeautifulSoup(r.text, "html.parser")
    results = []
    for a in soup.select("a.result__a")[:max_results]:
        href = a.get("href", "")
        # DDG wraps URLs — extract the real one
        if "uddg=" in href:
            from urllib.parse import unquote, parse_qs
            qs = parse_qs(urlparse(href).query)
            href = unquote(qs.get("uddg", [href])[0])
        snippet_tag = a.find_parent().find_next_sibling()
        snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""
        results.append({"title": a.get_text(strip=True), "url": href, "snippet": snippet})
    return results

# ── Claude Summariser ─────────────────────────────────────────────────────────

def summarise_with_claude(content: str, instruction: str = "") -> str:
    """Summarise page content using Claude Haiku (sync wrapper)."""
    client = anthropic.Anthropic()
    prompt = (
        f"{instruction}\n\n" if instruction else ""
        f"Summarise the following web page content concisely. "
        f"Extract key facts, main points, and any important data. "
        f"Format with bullet points where helpful.\n\n"
        f"---\n{content[:MAX_PAGE_CHARS]}\n---"
    )
    msg = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text

# ── Core BrowserModule class ───────────────────────────────────────────────────

class BrowserModule:
    """High-level browser actions called by JARVIS voice handler."""

    async def search(self, query: str) -> dict:
        """Search the web and return results."""
        results = await ddg_search(query)
        save_history("search", query=query,
                     summary="; ".join(r["title"] for r in results))
        return {
            "action": "search",
            "query": query,
            "results": results,
            "voice_reply": (
                f"I found {len(results)} results for '{query}'. "
                f"The top result is: {results[0]['title']}. "
                f"Shall I open it and give you a summary?"
                if results else f"No results found for '{query}'."
            ),
        }

    async def fetch_and_summarise(self, url: str, instruction: str = "") -> dict:
        """Fetch a URL and summarise its content."""
        title, text, raw_len = await fetch_page(url)
        summary = await asyncio.to_thread(summarise_with_claude, text, instruction)
        save_history("summarise", url=url, title=title, summary=summary, raw_len=raw_len)
        return {
            "action": "summarise",
            "url": url,
            "title": title,
            "summary": summary,
            "raw_len": raw_len,
            "voice_reply": f"Here's a summary of '{title}': {summary[:400]}",
        }

    async def search_and_summarise(self, query: str, instruction: str = "") -> dict:
        """Search, pick top result, fetch + summarise in one shot."""
        results = await ddg_search(query, max_results=3)
        if not results:
            return {"action": "error", "voice_reply": f"Nothing found for '{query}'."}
        top = results[0]
        summary_result = await self.fetch_and_summarise(top["url"], instruction)
        summary_result["search_results"] = results
        summary_result["voice_reply"] = (
            f"I searched for '{query}' and summarised the top result, "
            f"'{top['title']}': {summary_result['summary'][:400]}"
        )
        return summary_result

    def recall(self, term: str) -> dict:
        """Full-text search through past browsing history."""
        hits = search_history(term)
        return {
            "action": "recall",
            "term": term,
            "hits": hits,
            "voice_reply": (
                f"I found {len(hits)} past browsing entries related to '{term}'."
                if hits else f"Nothing in my browsing history about '{term}'."
            ),
        }

# ── FastAPI Router ─────────────────────────────────────────────────────────────

router = APIRouter(prefix="/browser", tags=["browser"])
browser = BrowserModule()

class SearchRequest(BaseModel):
    query: str
    summarise: bool = False
    instruction: str = ""

class FetchRequest(BaseModel):
    url: str
    instruction: str = ""

class RecallRequest(BaseModel):
    term: str

@router.post("/search")
async def api_search(req: SearchRequest):
    if req.summarise:
        return await browser.search_and_summarise(req.query, req.instruction)
    return await browser.search(req.query)

@router.post("/fetch")
async def api_fetch(req: FetchRequest):
    return await browser.fetch_and_summarise(req.url, req.instruction)

@router.post("/recall")
async def api_recall(req: RecallRequest):
    return browser.recall(req.term)

@router.get("/history")
async def api_history(limit: int = 20):
    rows = DB.execute(
        "SELECT ts,action,query,url,title,summary FROM browse_history "
        "ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    keys = ["ts", "action", "query", "url", "title", "summary"]
    return [dict(zip(keys, r)) for r in rows]

# ── WebSocket handler (drop-in for JARVIS WS server) ─────────────────────────

BROWSER_COMMANDS = {
    "search": lambda q: browser.search(q),
    "fetch":  lambda u: browser.fetch_and_summarise(u),
    "browse": lambda q: browser.search_and_summarise(q),
    "recall": lambda t: asyncio.coroutine(lambda: browser.recall(t))(),
}

async def handle_browser_ws_message(ws: WebSocket, msg: dict) -> Optional[dict]:
    """
    Call this from your main WS handler when msg["module"] == "browser".

    Example incoming message:
        {"module": "browser", "action": "browse", "query": "latest AI news"}
        {"module": "browser", "action": "fetch",  "url": "https://example.com"}
        {"module": "browser", "action": "recall", "term": "openai"}
    """
    action = msg.get("action", "browse")
    query  = msg.get("query") or msg.get("term") or ""
    url    = msg.get("url", "")
    instruction = msg.get("instruction", "")

    try:
        if action == "search":
            result = await browser.search(query)
        elif action == "fetch":
            result = await browser.fetch_and_summarise(url, instruction)
        elif action == "recall":
            result = browser.recall(query)
        else:  # "browse" — search + summarise
            result = await browser.search_and_summarise(query, instruction)

        await ws.send_json({"type": "browser_result", **result})
        return result

    except Exception as e:
        err = {"type": "browser_error", "error": str(e),
               "voice_reply": f"Sorry, I ran into a problem browsing: {e}"}
        await ws.send_json(err)
        return err
