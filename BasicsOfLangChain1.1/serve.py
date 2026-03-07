from fastapi import FastAPI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from langserve import add_routes
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

# LLM model
model = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=groq_api_key
)

# Prompt template
system_template = "Translate the following English text to {language}:"

prompt_template = ChatPromptTemplate.from_messages([
    ("system", system_template),
    ("human", "{text}")
])

# Output parser
parser = StrOutputParser()

# LangChain Runnable Chain
chain = prompt_template | model | parser

# FastAPI App
app = FastAPI(
    title="LangServe Example",
    version="0.3.3",
    description="API server using LangServe with Groq LLM"
)

# Add API route
add_routes(
    app,
    chain,
    path="/translate"
)

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)