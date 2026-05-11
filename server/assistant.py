import os
import uuid
import fitz
from dotenv import load_dotenv
from rank_bm25 import BM25Okapi

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

Llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    max_tokens=1024,
    google_api_key=GOOGLE_API_KEY
)

Prompt = PromptTemplate(
    template="""
You are a document QA assistant.

Answer the question STRICTLY from the context.

If the answer is missing, say:
"The provided document does not contain sufficient information to answer this question."

Context:
{context}

Question:
{question}

Answer:
""",
    input_variables=["context", "question"]
)

Parser = StrOutputParser()

DocumentStore = {}

# -----------------------------
# SMART PDF PARSER
# -----------------------------

def ExtractPdfText(file_path: str):

    doc = fitz.open(file_path)

    pages = []

    for page_num, page in enumerate(doc):

        text = page.get_text("text")

        if text.strip():

            pages.append({
                "page": page_num + 1,
                "content": text
            })

    return pages

# -----------------------------
# SMART CHUNKING
# -----------------------------

def SmartChunk(pages):

    chunks = []

    for page in pages:

        paragraphs = page["content"].split("\n\n")

        for para in paragraphs:

            para = para.strip()

            if len(para) > 120:

                chunks.append({
                    "page": page["page"],
                    "content": para
                })

    return chunks

# -----------------------------
# BM25 INDEXING
# -----------------------------

def IndexPdf(file_path: str):

    pages = ExtractPdfText(file_path)

    chunks = SmartChunk(pages)

    tokenized_chunks = [
        chunk["content"].lower().split()
        for chunk in chunks
    ]

    bm25 = BM25Okapi(tokenized_chunks)

    doc_id = str(uuid.uuid4())

    DocumentStore[doc_id] = {
        "chunks": chunks,
        "bm25": bm25
    }

    return doc_id

# -----------------------------
# RETRIEVAL
# -----------------------------

def Retrieve(doc_id: str, question: str, k: int = 8):

    data = DocumentStore[doc_id]

    bm25 = data["bm25"]

    chunks = data["chunks"]

    query_tokens = question.lower().split()

    scores = bm25.get_scores(query_tokens)

    ranked = sorted(
        zip(scores, chunks),
        key=lambda x: x[0],
        reverse=True
    )

    top_chunks = [
        item[1]
        for item in ranked[:k]
    ]

    return top_chunks

# -----------------------------
# CONTEXT FORMATTER
# -----------------------------

def FormatDocs(docs):

    return "\n\n".join(
        f"(Page {d['page']}): {d['content']}"
        for d in docs
    )

# -----------------------------
# MAIN RAG
# -----------------------------

def RAG(doc_id: str, question: str):

    if doc_id not in DocumentStore:
        return "Invalid document ID."

    docs = Retrieve(doc_id, question)

    if not docs:
        return (
            "The provided document does not contain sufficient "
            "information to answer this question."
        )

    context = FormatDocs(docs)

    chain = Prompt | Llm | Parser

    response = chain.invoke({
        "context": context,
        "question": question
    })

    return response