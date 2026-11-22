#!/usr/bin/env python3
"""Static and Antigravity loader validator for the antigravity-notebooklm plugin."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

ALLOWED_PLUGIN_JSON_FIELDS = {
    "name",
    "description",
    "logo",
    "suggestedPrompts",
    "displayName",
    "version",
    "author",
    "homepage",
    "repository",
    "disabled",
}
ALLOWED_LOGO_EXTS = {".png", ".svg", ".jpg", ".jpeg", ".webp"}
SOURCE_TYPES = [
    "Upload files",
    "Websites",
    "Play Books",
    "Drive",
    "Textbooks",
    "Copied text",
]
STUDIO_TILES = [
    "Audio Overview",
    "Slide Deck",
    "Video Overview",
    "Mind Map",
    "Reports",
    "Flashcards",
    "Quiz",
    "Infographic",
]
EXPECTED_SKILLS = [
    "notebooklm",
]
EXPECTED_ROUTE_RUNBOOKS = [
    "extract.md",
    "create.md",
    "ask.md",
    "library.md",
    "ui-widgets.md",
]


def parse_frontmatter(text: str) -> tuple[dict[str, Any] | None, str]:
    """Parse minimal YAML frontmatter from markdown without third-party packages."""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None, text
    end_idx = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            end_idx = idx
            break
    if end_idx is None:
        return None, text

    data: dict[str, Any] = {}
    fm_lines = lines[1:end_idx]
    idx = 0
    while idx < len(fm_lines):
        raw = fm_lines[idx]
        if not raw.strip() or raw.lstrip().startswith("#"):
            idx += 1
            continue
        match = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", raw)
        if not match:
            idx += 1
            continue
        key, val = match.group(1), match.group(2).strip()
        if val in (">-", ">", "|", "|-"):
            block: list[str] = []
            idx += 1
            while idx < len(fm_lines) and (fm_lines[idx].startswith("  ") or not fm_lines[idx].strip()):
                if fm_lines[idx].strip():
                    block.append(fm_lines[idx].strip())
                idx += 1
            data[key] = " ".join(block)
            continue
        if val.lower() == "true":
            data[key] = True
        elif val.lower() == "false":
            data[key] = False
        else:
            data[key] = val.strip("\"'")
        idx += 1

    body = "\n".join(lines[end_idx + 1 :])
    return data, body


def strip_jsonc_comments(raw: str) -> str:
    """Strip // and /* */ comments outside JSON strings."""
    out: list[str] = []
    i = 0
    in_str = False
    escape = False
    n = len(raw)
    while i < n:
        ch = raw[i]
        if in_str:
            out.append(ch)
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
            i += 1
            continue
        if ch == '"':
            in_str = True
            out.append(ch)
            i += 1
            continue
        if ch == "/" and i + 1 < n:
            nxt = raw[i + 1]
            if nxt == "/":
                while i < n and raw[i] != "\n":
                    i += 1
                continue
            if nxt == "*":
                i += 2
                while i + 1 < n and not (raw[i] == "*" and raw[i + 1] == "/"):
                    i += 1
                i += 2
                continue
        out.append(ch)
        i += 1
    return "".join(out)


def check_plugin_json(root: Path, errors: list[str]) -> dict[str, Any]:
    manifest_path = root / "plugin.json"
    if not manifest_path.is_file():
        errors.append("Missing plugin.json")
        return {}
    try:
        manifest = json.loads(strip_jsonc_comments(manifest_path.read_text(encoding="utf-8")))
    except Exception as exc:
        errors.append(f"Invalid plugin.json: {exc}")
        return {}

    unknown = set(manifest.keys()) - ALLOWED_PLUGIN_JSON_FIELDS
    if unknown:
        errors.append(f"plugin.json contains unsupported top-level fields: {sorted(unknown)}")

    if manifest.get("name") != "antigravity-notebooklm":
        errors.append(f"plugin.json name must be 'antigravity-notebooklm', got {manifest.get('name')!r}")
    if not isinstance(manifest.get("description"), str) or not manifest["description"].strip():
        errors.append("plugin.json missing non-empty description")

    prompts = manifest.get("suggestedPrompts")
    if not isinstance(prompts, list) or not (1 <= len(prompts) <= 3):
        errors.append("plugin.json suggestedPrompts must be a list of 1..3 strings")
    elif any(not isinstance(p, str) or not p.strip() for p in prompts):
        errors.append("plugin.json suggestedPrompts must contain non-empty strings")

    logo = manifest.get("logo")
    if logo:
        logo_path = root / logo
        if not logo_path.is_file():
            errors.append(f"plugin.json logo does not exist: {logo}")
        elif logo_path.suffix.lower() not in ALLOWED_LOGO_EXTS:
            errors.append(f"plugin.json logo extension not supported: {logo_path.suffix}")
    else:
        errors.append("plugin.json missing logo")

    return manifest


def check_rules(root: Path, errors: list[str]) -> None:
    rules_path = root / "rules" / "AGENTS.md"
    if not rules_path.is_file():
        errors.append("Missing rules/AGENTS.md")
        return
    content = rules_path.read_text(encoding="utf-8")
    fm, _ = parse_frontmatter(content)
    if fm is not None:
        errors.append("rules/AGENTS.md must NOT contain YAML frontmatter")

    required_tokens = [
        "https://notebook.google.com/",
        "batchexecute",
        "LOGIN_REQUIRED",
        "browser_sandbox/uploads/",
        "[AGY-Session]",
        "Incremental",
    ]
    for token in required_tokens:
        if token not in content:
            errors.append(f"rules/AGENTS.md missing required token: {token!r}")


def check_relative_links(md_path: Path, text: str, errors: list[str]) -> None:
    link_re = re.compile(r"\[[^\]]+\]\((\./[^)#\s]+(?:#[^)\s]*)?)\)")
    for match in link_re.finditer(text):
        rel_target = match.group(1).split("#", 1)[0]
        resolved = (md_path.parent / rel_target).resolve()
        if not resolved.exists():
            errors.append(f"{md_path}: broken relative link {rel_target!r}")


def check_skills(root: Path, errors: list[str]) -> list[str]:
    skills_dir = root / "skills"
    if not skills_dir.is_dir():
        errors.append("Missing skills/ directory")
        return []

    found_skills = sorted(p.name for p in skills_dir.iterdir() if p.is_dir())
    for expected in EXPECTED_SKILLS:
        if expected not in found_skills:
            errors.append(f"Missing expected skill directory: skills/{expected}")
    unexpected = set(found_skills) - set(EXPECTED_SKILLS)
    if unexpected:
        errors.append(f"Unexpected legacy/extra skill directories found: {sorted(unexpected)}")

    for skill_name in found_skills:
        skill_md = skills_dir / skill_name / "SKILL.md"
        if not skill_md.is_file():
            errors.append(f"Missing SKILL.md in skills/{skill_name}")
            continue
        text = skill_md.read_text(encoding="utf-8")
        fm, _ = parse_frontmatter(text)
        if fm is None:
            errors.append(f"{skill_md}: missing YAML frontmatter")
            continue
        if fm.get("name") != skill_name:
            errors.append(f"{skill_md}: frontmatter name {fm.get('name')!r} != folder {skill_name!r}")
        desc = fm.get("description")
        if not isinstance(desc, str) or not desc.strip():
            errors.append(f"{skill_md}: missing non-empty description")

        disabled_model = fm.get("disable-model-invocation")
        if disabled_model is True:
            errors.append(f"{skill_md}: user-facing plugin skill must NOT set disable-model-invocation: true")

        check_relative_links(skill_md, text, errors)

    return found_skills


def check_maintainer_sync_skill(root: Path, errors: list[str]) -> None:
    sync_dir = root / ".agents" / "skills" / "notebooklm-sync"
    sync_md = sync_dir / "SKILL.md"
    audit_md = sync_dir / "references" / "audit-checklist.md"
    if not sync_md.is_file():
        errors.append("Missing maintainer skill at .agents/skills/notebooklm-sync/SKILL.md")
        return
    if not audit_md.is_file():
        errors.append("Missing audit checklist at .agents/skills/notebooklm-sync/references/audit-checklist.md")

    text = sync_md.read_text(encoding="utf-8")
    fm, _ = parse_frontmatter(text)
    if fm is None:
        errors.append(f"{sync_md}: missing YAML frontmatter")
        return
    if fm.get("name") != "notebooklm-sync":
        errors.append(f"{sync_md}: frontmatter name {fm.get('name')!r} != 'notebooklm-sync'")
    desc = fm.get("description")
    if not isinstance(desc, str) or not desc.strip():
        errors.append(f"{sync_md}: missing non-empty description")
    if fm.get("disable-model-invocation") is not True:
        errors.append(f"{sync_md}: MUST set disable-model-invocation: true")

    check_relative_links(sync_md, text, errors)


def check_cross_consistency(root: Path, found_skills: list[str], errors: list[str]) -> None:
    readme_path = root / "README.md"
    e2e_path = root / "tests" / "e2e-test-plan.md"
    audit_path = root / ".agents" / "skills" / "notebooklm-sync" / "references" / "audit-checklist.md"
    router_path = root / "skills" / "notebooklm" / "SKILL.md"
    refs_dir = root / "skills" / "notebooklm" / "references"
    extract_path = refs_dir / "extract.md"
    create_path = refs_dir / "create.md"
    ask_path = refs_dir / "ask.md"
    library_path = refs_dir / "library.md"
    ui_widgets_path = refs_dir / "ui-widgets.md"

    for required_file in (
        readme_path,
        e2e_path,
        audit_path,
        router_path,
        extract_path,
        create_path,
        ask_path,
        library_path,
        ui_widgets_path,
    ):
        if not required_file.is_file():
            errors.append(f"Missing required documentation/test file: {required_file.relative_to(root)}")
            return

    readme = readme_path.read_text(encoding="utf-8")
    e2e = e2e_path.read_text(encoding="utf-8")
    audit = audit_path.read_text(encoding="utf-8")
    router_doc = router_path.read_text(encoding="utf-8")
    extract_doc = extract_path.read_text(encoding="utf-8")
    create_doc = create_path.read_text(encoding="utf-8")
    ui_widgets_doc = ui_widgets_path.read_text(encoding="utf-8")

    for runbook in EXPECTED_ROUTE_RUNBOOKS:
        if f"./references/{runbook}" not in router_doc:
            errors.append(f"skills/notebooklm/SKILL.md missing route link './references/{runbook}'")

    for skill in [*found_skills, "notebooklm-sync"]:
        if skill not in readme:
            errors.append(f"README.md does not mention skill {skill!r}")
        if skill not in e2e:
            errors.append(f"tests/e2e-test-plan.md does not reference skill {skill!r}")

    for src_type in SOURCE_TYPES:
        for label, content in (("references/extract.md", extract_doc), ("audit-checklist.md", audit), ("e2e-test-plan.md", e2e)):
            if src_type not in content:
                errors.append(f"{label} missing source type {src_type!r}")

    for tile in STUDIO_TILES:
        for label, content in (
            ("references/create.md", create_doc),
            ("references/ui-widgets.md", ui_widgets_doc),
            ("audit-checklist.md", audit),
            ("e2e-test-plan.md", e2e),
        ):
            if tile not in content:
                errors.append(f"{label} missing Studio tile {tile!r}")

    for token in ("Output language", "Download", "built-in right-pane browser"):
        if token not in create_doc:
            errors.append(f"references/create.md missing required delivery/language rule {token!r}")

    check_relative_links(readme_path, readme, errors)


def check_antigravity_loader(root: Path, found_skills: list[str], errors: list[str]) -> None:
    ls_addr = os.environ.get("ANTIGRAVITY_LS_ADDRESS", "localhost:5387")
    csrf = os.environ.get("ANTIGRAVITY_CSRF_TOKEN", "")
    url = f"http://{ls_addr}/exa.language_server_pb.LanguageServerService/GetAllPlugins"
    payload = json.dumps({"workspaceUris": [root.resolve().as_uri()]}).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if csrf:
        headers["x-codeium-csrf-token"] = csrf

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        errors.append(f"Failed to query Antigravity GetAllPlugins at {url}: {exc}")
        return
    except Exception as exc:
        errors.append(f"Error parsing GetAllPlugins response: {exc}")
        return

    plugins = body.get("plugins", [])
    matches = [p for p in plugins if p.get("name") == "antigravity-notebooklm"]
    if not matches:
        errors.append("GetAllPlugins did not return plugin 'antigravity-notebooklm'")
        return
    if len(matches) > 1:
        errors.append(f"Multiple 'antigravity-notebooklm' plugins returned: {len(matches)}")
        return

    plugin = matches[0]
    if plugin.get("disabled"):
        errors.append("Plugin 'antigravity-notebooklm' is reported as disabled in GetAllPlugins")

    loaded_skills = sorted(s.get("name") for s in plugin.get("skills", []) if s.get("name"))
    if loaded_skills != sorted(found_skills):
        errors.append(f"Loaded skills {loaded_skills} != filesystem skills {sorted(found_skills)}")

    loaded_rules = [r.get("absolutePath", "") for r in plugin.get("rules", [])]
    if not any(p.endswith("rules/AGENTS.md") for p in loaded_rules):
        errors.append(f"Plugin rules/AGENTS.md not loaded; got rules={loaded_rules}")

    loaded_mcps = [
        m.get("serverName") or m.get("originalServerName") or m.get("name", "")
        for m in plugin.get("mcpServers", [])
        if isinstance(m, dict)
    ]
    if not any(name == "studio-ui" or name == "antigravity-notebooklm_studio-ui" for name in loaded_mcps):
        errors.append(f"Plugin studio-ui MCP server not loaded; got mcpServers={loaded_mcps}")


def check_mcp_app(root: Path, errors: list[str]) -> None:
    mcp_cfg = root / "mcp_config.json"
    server_py = root / "mcp" / "server.py"
    caps_json = root / "mcp" / "capabilities.json"
    dist_html = root / "mcp" / "dist" / "studio-launcher.html"

    for req_file in (mcp_cfg, server_py, caps_json, dist_html):
        if not req_file.is_file():
            errors.append(f"Missing MCP App file: {req_file.relative_to(root)}")
            return

    try:
        caps = json.loads(caps_json.read_text(encoding="utf-8"))
        cap_sources = {s.get("id") for s in caps.get("sourceTypes", []) if isinstance(s, dict)}
        cap_tiles = {t.get("id") for t in caps.get("studioTiles", []) if isinstance(t, dict)}
        for src in SOURCE_TYPES:
            if src not in cap_sources:
                errors.append(f"mcp/capabilities.json missing source type {src!r}")
        for tile in STUDIO_TILES:
            if tile not in cap_tiles:
                errors.append(f"mcp/capabilities.json missing Studio tile {tile!r}")
        if not isinstance(caps.get("outputLanguages"), list) or not caps["outputLanguages"]:
            errors.append("mcp/capabilities.json missing non-empty outputLanguages list")
    except Exception as exc:
        errors.append(f"Invalid mcp/capabilities.json: {exc}")
        return

    try:
        cfg = json.loads(mcp_cfg.read_text(encoding="utf-8"))
        if "studio-ui" not in cfg.get("mcpServers", {}):
            errors.append("mcp_config.json missing 'studio-ui' server entry")
    except Exception as exc:
        errors.append(f"Invalid mcp_config.json: {exc}")
        return

    html_bytes = dist_html.read_bytes()
    if not html_bytes or len(html_bytes) > 10 * 1024 * 1024:
        errors.append(f"mcp/dist/studio-launcher.html invalid byte length: {len(html_bytes)}")
        return
    html_text = html_bytes.decode("utf-8", errors="replace")
    for tile in STUDIO_TILES:
        if tile not in html_text:
            errors.append(f"Bundled MCP App HTML missing Studio tile {tile!r}")

    requests = [
        {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-03-26", "capabilities": {}, "clientInfo": {"name": "validator", "version": "1.0"}}},
        {"jsonrpc": "2.0", "method": "notifications/initialized"},
        {"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
        {"jsonrpc": "2.0", "id": 3, "method": "resources/list"},
        {"jsonrpc": "2.0", "id": 4, "method": "resources/read", "params": {"uri": "ui://notebooklm/studio-launcher.html"}},
        {"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "notebooklm_studio_launcher", "arguments": {}}},
        {"jsonrpc": "2.0", "id": 6, "method": "tools/call", "params": {"name": "notebooklm_studio_launcher", "arguments": {"sources": ["https://www.youtube.com/watch?v=jNQXAC9IVRw"], "sourcesCount": 1}}},
    ]
    stdin_payload = "\n".join(json.dumps(r) for r in requests) + "\n"
    try:
        proc = subprocess.run(
            [sys.executable, str(server_py)],
            input=stdin_payload,
            capture_output=True,
            text=True,
            timeout=15,
        )
    except Exception as exc:
        errors.append(f"Failed executing mcp/server.py stdio test: {exc}")
        return

    if proc.returncode != 0:
        errors.append(f"mcp/server.py exited with {proc.returncode}: {proc.stderr.strip()}")
        return

    by_id: dict[int, dict[str, Any]] = {}
    for line in proc.stdout.splitlines():
        if not line.strip():
            continue
        resp = json.loads(line)
        if "id" in resp:
            by_id[resp["id"]] = resp

    if set(by_id.keys()) != {1, 2, 3, 4, 5, 6}:
        errors.append(f"Unexpected MCP stdio response IDs: {sorted(by_id.keys())}")
        return

    tools = by_id[2].get("result", {}).get("tools", [])
    if not any(t.get("name") == "notebooklm_studio_launcher" and t.get("_meta", {}).get("ui", {}).get("resourceUri") == "ui://notebooklm/studio-launcher.html" for t in tools):
        errors.append("tools/list missing notebooklm_studio_launcher with ui.resourceUri metadata")

    resources = by_id[3].get("result", {}).get("resources", [])
    if not any(r.get("uri") == "ui://notebooklm/studio-launcher.html" and r.get("mimeType") == "text/html;profile=mcp-app" for r in resources):
        errors.append("resources/list missing ui://notebooklm/studio-launcher.html with mimeType text/html;profile=mcp-app")

    contents = by_id[4].get("result", {}).get("contents", [])
    if not contents or contents[0].get("mimeType") != "text/html;profile=mcp-app" or "Slide Deck" not in contents[0].get("text", ""):
        errors.append("resources/read did not return valid Studio Launcher HTML")

    call_res = by_id[5].get("result", {})
    sc = call_res.get("structuredContent", {})
    sc_caps = sc.get("capabilities", {})
    if call_res.get("isError") or not sc or not sc_caps or sc.get("hasSources") is not False:
        errors.append(f"tools/call ({{}}) returned error or unexpected structuredContent: {call_res}")
    else:
        sc_sources = {s.get("id") for s in sc_caps.get("sourceTypes", []) if isinstance(s, dict)}
        sc_tiles = {t.get("id") for t in sc_caps.get("studioTiles", []) if isinstance(t, dict)}
        if not set(SOURCE_TYPES).issubset(sc_sources) or not set(STUDIO_TILES).issubset(sc_tiles):
            errors.append(f"tools/call capabilities mismatch: sources={sc_sources}, tiles={sc_tiles}")
        if not isinstance(sc_caps.get("outputLanguages"), list) or not sc_caps["outputLanguages"]:
            errors.append("tools/call capabilities missing outputLanguages")

    call_res_with_src = by_id[6].get("result", {})
    sc2 = call_res_with_src.get("structuredContent", {})
    if call_res_with_src.get("isError") or sc2.get("hasSources") is not True:
        errors.append(f"tools/call with sources failed hasSources=True assertion: {call_res_with_src}")


def check_agy_cli_strict(root: Path, errors: list[str]) -> None:
    try:
        proc = subprocess.run(
            ["agy", "plugin", "validate", str(root), "--strict"],
            capture_output=True,
            text=True,
            timeout=30,
        )
    except FileNotFoundError:
        errors.append("agy CLI binary not found on PATH; cannot run 'agy plugin validate --strict'")
        return
    except Exception as exc:
        errors.append(f"Failed running 'agy plugin validate --strict': {exc}")
        return

    if proc.returncode != 0:
        details = (proc.stderr or proc.stdout or "").strip()
        errors.append(f"'agy plugin validate {root} --strict' failed (exit {proc.returncode}): {details}")


def check_english_only(root: Path, errors: list[str]) -> None:
    cjk_re = re.compile(r"[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]")
    for path in sorted(root.rglob("*")):
        if not path.is_file() or ".git" in path.parts or "node_modules" in path.parts:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for lineno, line in enumerate(text.splitlines(), 1):
            if cjk_re.search(line):
                rel = path.relative_to(root)
                errors.append(f"Non-English (CJK) character found at {rel}:{lineno}")
                break


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate antigravity-notebooklm plugin structure and loader state.")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent, help="Plugin root path")
    parser.add_argument("--check-loader", action="store_true", help="Verify discovery via Antigravity GetAllPlugins RPC")
    args = parser.parse_args()

    root = args.root.resolve()
    errors: list[str] = []

    check_plugin_json(root, errors)
    check_rules(root, errors)
    found_skills = check_skills(root, errors)
    check_maintainer_sync_skill(root, errors)
    check_cross_consistency(root, found_skills, errors)
    check_mcp_app(root, errors)
    check_english_only(root, errors)
    check_agy_cli_strict(root, errors)

    if args.check_loader:
        check_antigravity_loader(root, found_skills, errors)

    if errors:
        print(f"FAIL: {len(errors)} validation error(s):", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    loader_note = " + Antigravity loader RPC" if args.check_loader else ""
    print(f"PASS: antigravity-notebooklm static + agy --strict checks ({len(found_skills)} skills{loader_note}) succeeded.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
