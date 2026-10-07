FROM nginx:1.27-alpine

LABEL description="Nginx со статическим HTML/CSS-сайтом и reverse proxy на API"

# Шаблон конфигурации: при старте контейнера nginx подставит
# переменные окружения (API_HOST, API_PORT) через envsubst
COPY templates/ /etc/nginx/templates/

# В базовом образе логи — симлинки на stdout/stderr. Заменяем их обычными
# файлами, чтобы логи сохранялись в Docker Volume (/var/log/nginx)
RUN rm -f /var/log/nginx/access.log /var/log/nginx/error.log \
 && touch /var/log/nginx/access.log /var/log/nginx/error.log

# Собственный сайт
COPY html/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
