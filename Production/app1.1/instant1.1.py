from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import requests

app = FastAPI()

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "llama3"  # Change to any installed Ollama model

@app.get("/", response_class=HTMLResponse)
def instant():
    message = """
You are on a website that has just been deployed to production for the first time!
Please reply with an enthusiastic announcement to welcome visitors to the site, explaining that it is live on production for the first time!
"""

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": message}
        ],
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)
    result = response.json()

    reply = result["message"]["content"].replace("\n", "<br/>")

    html = f"""
    <html>
        <head>
            <title>Live in an Instant!</title>
        </head>
        <body>
            <p>{reply}</p>
        </body>
    </html>
    """
    return html