FROM python:3.12-slim

LABEL description="Flask API: счётчик посещений и гостевая книга на Redis"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    API_PORT=5000

WORKDIR /app

# Сначала зависимости — так слой кешируется при изменении кода
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Запуск от непривилегированного пользователя
RUN useradd --create-home appuser
USER appuser

EXPOSE 5000

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${API_PORT} --workers 2 --access-logfile - app:app"]
