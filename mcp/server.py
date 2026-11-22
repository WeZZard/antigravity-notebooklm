#!/usr/bin/env python3
"""Minimal zero-dependency MCP stdio server hosting the NotebookLM 2-step Pre-Flight Workbench."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

APP_URI = "ui://notebooklm/studio-launcher.html"
APP_MIME = "text/html;profile=mcp-app"
MCP_DIR = Path(__file__).resolve().parent
DEFAULT_HTML_PATH = MCP_DIR / "dist" / "studio-launcher.html"
DEFAULT_CAPABILITIES_PATH = MCP_DIR / "capabilities.json"

TOOL_DEF = {
    "name": "notebooklm_studio_launcher",
    "title": "NotebookLM 2-Step Pre-Flight Workbench",
    "description": (
        "Render the adaptive 2-step NotebookLM inline wizard with zero browser wait: "
        "Step 1 asks what to create (8 Studio tiles, Extract Transcript, Ask Question); "
        "Step 2 collects data sources (YouTube/URLs, Copied text, Local files, Research, "
        "Drive/Books/Existing) and automatically skips Step 2 if sources are already provided. "
        "Clicking Launch sends everything directly into the conversation loop via app.sendMessage(). "
        "All parameters are optional."
    ),
    "inputSchema": {
        "type": "object",
        "properties": {
            "notebookTitle": {
                "type": "string",
                "description": "Active notebook title or [AGY-Session] topic if already open.",
            },
            "notebookUrl": {
                "type": "string",
                "description": "Active https://notebook.google.com/notebook/<uuid> URL if already open.",
            },
            "sourcesCount": {
                "type": "integer",
                "description": "Count of already-provided or active sources.",
            },
            "sources": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Optional list of source titles or URLs already provided by the user.",
            },
            "hasSources": {
                "type": "boolean",
                "description": "Explicit flag indicating the user already provided data sources (skips Step 2).",
            },
            "preselectedDeliverables": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Optional deliverables already chosen (e.g. ['Slide Deck', 'Quiz']); opens Step 2 directly if no sources yet.",
            },
            "outputLanguage": {
                "type": "string",
                "description": "Optional preferred Output language (defaults to 'Auto (Chat language)').",
            },
            "note": {
                "type": "string",
                "description": "Optional short hint shown in the footer.",
            },
        },
        "additionalProperties": False,
    },
    "_meta": {
        "ui": {"resourceUri": APP_URI},
        "ui/resourceUri": APP_URI,
    },
}


def load_capabilities() -> dict[str, Any]:
    env_override = os.environ.get("NOTEBOOKLM_CAPABILITIES_JSON", "").strip()
    target = Path(env_override) if env_override else DEFAULT_CAPABILITIES_PATH
    if not target.is_file():
        raise FileNotFoundError(f"Capabilities manifest not found at {target}")
    return json.loads(target.read_text(encoding="utf-8"))


def read_app_html() -> str:
    env_override = os.environ.get("NOTEBOOKLM_STUDIO_APP_HTML", "").strip()
    target = Path(env_override) if env_override else DEFAULT_HTML_PATH
    if not target.is_file():
        raise FileNotFoundError(f"Bundled MCP App HTML not found at {target}")
    return target.read_text(encoding="utf-8")


def normalize_launcher_args(raw: dict[str, Any] | None) -> dict[str, Any]:
    args = raw or {}
    sources_raw = args.get("sources")
    sources = [str(s) for s in sources_raw] if isinstance(sources_raw, list) else []
    count_raw = args.get("sourcesCount")
    sources_count = int(count_raw) if isinstance(count_raw, (int, float)) else len(sources)
    sources_count = max(0, sources_count)
    has_sources = bool(args.get("hasSources")) or sources_count > 0 or len(sources) > 0

    preselected_raw = args.get("preselectedDeliverables")
    preselected = (
        [str(p).strip() for p in preselected_raw if str(p).strip()]
        if isinstance(preselected_raw, list)
        else []
    )

    return {
        "notebookTitle": str(args.get("notebookTitle") or "New [AGY-Session] notebook"),
        "notebookUrl": str(args.get("notebookUrl") or ""),
        "sourcesCount": sources_count,
        "sources": sources[:8],
        "hasSources": has_sources,
        "preselectedDeliverables": preselected,
        "outputLanguage": str(args.get("outputLanguage") or "Auto (Chat language)"),
        "note": str(args.get("note") or ""),
        "capabilities": load_capabilities(),
    }


def handle_request(msg: dict[str, Any]) -> dict[str, Any] | None:
    msg_id = msg.get("id")
    method = msg.get("method", "")
    params = msg.get("params") or {}

    if msg_id is None:
        return None

    if method == "initialize":
        proto = params.get("protocolVersion") or "2025-03-26"
        result = {
            "protocolVersion": proto,
            "capabilities": {
                "tools": {"listChanged": False},
                "resources": {"subscribe": False, "listChanged": False},
            },
            "serverInfo": {
                "name": "antigravity-notebooklm-studio-ui",
                "version": "0.8.0",
            },
        }
        return {"jsonrpc": "2.0", "id": msg_id, "result": result}

    if method == "ping":
        return {"jsonrpc": "2.0", "id": msg_id, "result": {}}

    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": msg_id, "result": {"tools": [TOOL_DEF]}}

    if method == "tools/call":
        tool_name = params.get("name")
        if tool_name != TOOL_DEF["name"]:
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "error": {"code": -32602, "message": f"Unknown tool: {tool_name}"},
            }
        try:
            payload = normalize_launcher_args(params.get("arguments"))
        except Exception as exc:
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "error": {"code": -32603, "message": str(exc)},
            }
        mode_note = (
            "sources already present (single-step deliverable selection)"
            if payload["hasSources"]
            else (
                "preselected deliverables (Step 2 source collection)"
                if payload["preselectedDeliverables"]
                else "2-step wizard (Step 1 deliverables -> Step 2 sources)"
            )
        )
        summary = (
            f"Rendered NotebookLM 2-Step Workbench inline ({payload['notebookTitle']}, {mode_note}). "
            "End your turn cleanly after concise intro prose; do not repeat a Studio markdown table "
            "and do not call ask_question."
        )
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "content": [{"type": "text", "text": summary}],
                "structuredContent": payload,
                "isError": False,
            },
        }

    if method == "resources/list":
        resource = {
            "uri": APP_URI,
            "name": "NotebookLM 2-Step Pre-Flight Workbench",
            "description": "Adaptive 2-step deliverable & data-source wizard with direct agent-loop message injection.",
            "mimeType": APP_MIME,
            "_meta": {"ui": {"prefersBorder": False}},
        }
        return {"jsonrpc": "2.0", "id": msg_id, "result": {"resources": [resource]}}

    if method == "resources/read":
        uri = params.get("uri")
        if uri != APP_URI:
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "error": {"code": -32602, "message": f"Unknown resource URI: {uri}"},
            }
        try:
            html_text = read_app_html()
        except Exception as exc:
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "error": {"code": -32603, "message": str(exc)},
            }
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "contents": [
                    {
                        "uri": APP_URI,
                        "mimeType": APP_MIME,
                        "text": html_text,
                        "_meta": {"ui": {"prefersBorder": False}},
                    }
                ]
            },
        }

    return {
        "jsonrpc": "2.0",
        "id": msg_id,
        "error": {"code": -32601, "message": f"Method not found: {method}"},
    }


def main() -> int:
    for line in sys.stdin:
        raw = line.strip()
        if not raw:
            continue
        try:
            msg = json.loads(raw)
        except json.JSONDecodeError as exc:
            sys.stderr.write(f"JSON parse error: {exc}\n")
            sys.stderr.flush()
            continue

        resp = handle_request(msg)
        if resp is not None:
            sys.stdout.write(json.dumps(resp, ensure_ascii=True) + "\n")
            sys.stdout.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main())
