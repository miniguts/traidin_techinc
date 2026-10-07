import os
import socket
from datetime import datetime, timezone

import redis
from flask import Flask, jsonify, request

app = Flask(__name__)
app.json.ensure_ascii = False

db = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    password=os.getenv("REDIS_PASSWORD") or None,
    decode_responses=True,
)

MESSAGES_KEY = "guestbook:messages"
MAX_MESSAGES = 50


@app.get("/api/health")
def health():
    try:
        db.ping()
        redis_ok = True
    except redis.RedisError:
        redis_ok = False
    return jsonify(status="ok", redis=redis_ok), 200


@app.get("/api/info")
def info():
    return jsonify(
        site_title=os.getenv("SITE_TITLE", "Docker site"),
        app_env=os.getenv("APP_ENV", "production"),
        api_container=socket.gethostname(),
        redis_host=os.getenv("REDIS_HOST", "redis"),
    )


@app.post("/api/visits")
def visit():
    return jsonify(visits=db.incr("visits"))


@app.get("/api/messages")
def list_messages():
    raw = db.lrange(MESSAGES_KEY, 0, MAX_MESSAGES - 1)
    messages = []
    for item in raw:
        created, _, rest = item.partition("|")
        name, _, text = rest.partition("|")
        messages.append({"created": created, "name": name, "text": text})
    return jsonify(messages=messages)


@app.post("/api/messages")
def add_message():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip().replace("|", "/")[:40] or "Аноним"
    text = str(data.get("text", "")).strip()[:300]
    if not text:
        return jsonify(error="Сообщение не может быть пустым"), 400
    created = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    db.lpush(MESSAGES_KEY, f"{created}|{name}|{text}")
    db.ltrim(MESSAGES_KEY, 0, MAX_MESSAGES - 1)
    return jsonify(created=created, name=name, text=text), 201
