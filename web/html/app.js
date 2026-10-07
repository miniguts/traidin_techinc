const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const res = await fetch(`/api/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

async function loadInfo() {
  try {
    const info = await api("info");
    $("site-title").textContent = info.site_title;
    document.title = info.site_title;
    $("env").textContent = info.app_env;
    $("api-host").textContent = info.api_container;
  } catch (e) {
    console.error(e);
  }
}

async function countVisit() {
  try {
    const { visits } = await api("visits", { method: "POST" });
    $("visits").textContent = visits;
  } catch (e) {
    $("visits").textContent = "×";
  }
}

async function checkHealth() {
  const el = $("api-status");
  try {
    const h = await api("health");
    el.textContent = h.redis ? "работает, Redis подключён" : "работает, Redis недоступен";
    el.className = h.redis ? "ok" : "fail";
  } catch (e) {
    el.textContent = "недоступен";
    el.className = "fail";
  }
}

async function loadMessages() {
  try {
    const { messages } = await api("messages");
    const list = $("messages");
    list.innerHTML = "";
    if (!messages.length) {
      list.innerHTML = '<li class="muted">Пока сообщений нет — будьте первым!</li>';
      return;
    }
    for (const m of messages) {
      const li = document.createElement("li");
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${m.name} · ${m.created}`;
      const text = document.createElement("div");
      text.textContent = m.text;
      li.append(meta, text);
      list.append(li);
    }
  } catch (e) {
    console.error(e);
  }
}

$("guestbook-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = $("form-status");
  try {
    await api("messages", {
      method: "POST",
      body: JSON.stringify({ name: $("name").value, text: $("text").value }),
    });
    $("text").value = "";
    status.textContent = "Сохранено ✔";
    loadMessages();
  } catch (e) {
    status.textContent = `Ошибка: ${e.message}`;
  }
});

loadInfo();
countVisit();
checkHealth();
loadMessages();
