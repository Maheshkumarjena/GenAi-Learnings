import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import streamlit as st
from langchain_ollama import ChatOllama

load_dotenv()

# Optional OpenAI key
if os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# LangSmith tracing
if os.getenv("LANGCHAIN_API_KEY"):
    os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT")

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant. Please respond clearly."),
        ("user", "Question: {question}")
    ]
)

st.title("LangChain Demo with Gemma 2B")

input_text = st.text_input("What question do you have?")

llm = ChatOllama(
    model="gemma:2b"
)

output_parser = StrOutputParser()

chain = prompt | llm | output_parser

if input_text:
    with st.spinner("Thinking..."):
        response = chain.invoke({"question": input_text})
    st.write(response)