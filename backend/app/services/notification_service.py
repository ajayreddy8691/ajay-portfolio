import html
import logging
import re

import httpx

from app.core.config import get_settings
from app.models import ContactMessage

log = logging.getLogger("portfolio.notify")


def snapshot(m: ContactMessage) -> dict:
    """Plain data copy, so the background task never touches a closed database session."""
    return {"id": m.id, "name": m.name, "email": m.email, "subject": m.subject, "message": m.message}


def _html(d: dict) -> str:
    esc = lambda s: html.escape(s or "")  # noqa: E731
    body = esc(d["message"]).replace("\n", "<br>")
    link = f'<p style="font-size:13px"><a href="{esc(get_settings().site_url)}">Open your portfolio</a></p>' if get_settings().site_url else ""
    return (
        '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">'
        '<div style="background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#fff;padding:18px 22px"><h2 style="margin:0;font-size:18px">New portfolio message</h2></div>'
        '<div style="padding:22px;color:#111827">'
        f'<p style="margin:0 0 4px"><b>{esc(d["name"])}</b> &lt;<a href="mailto:{esc(d["email"])}">{esc(d["email"])}</a>&gt;</p>'
        f'<p style="margin:0 0 14px;color:#6b7280">Role / subject: {esc(d["subject"]) or "-"}</p>'
        f'<div style="background:#ecfeff;border-left:4px solid #22d3ee;border-radius:8px;padding:14px;line-height:1.55">{body}</div>'
        f'<p style="color:#6b7280;font-size:13px;margin-top:16px">Just hit <b>Reply</b>: your answer goes straight to {esc(d["email"])}.</p>{link}'
        "</div></div>"
    )


def notify_new_message(d: dict) -> None:
    """Emails the owner through Resend's HTTP API (free hosts such as Render block SMTP). Never raises."""
    s = get_settings()
    if not s.resend_api_key or not s.notify_email:
        log.info("Email notifications are off (set RESEND_API_KEY and NOTIFY_EMAIL to enable).")
        return
    subject = "New portfolio message from " + d["name"] + (" - " + d["subject"] if d.get("subject") else "")
    try:
        r = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {s.resend_api_key}", "User-Agent": "portfolio-api/1.0"},
            json={
                "from": s.notify_from,
                "to": [s.notify_email],
                "reply_to": d["email"],
                "subject": re.sub(r"[\r\n]+", " ", subject),
                "html": _html(d),
            },
            timeout=10,
        )
        r.raise_for_status()
        log.info("Notification email sent for message %s", d["id"])
    except Exception as exc:  # noqa: BLE001
        log.warning("Notification email failed: %s", exc)
