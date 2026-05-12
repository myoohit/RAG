# Research Paper Assistant

A full-stack document question-answering system built to help users upload research papers in PDF format and interactively query them using natural language.

This project focuses on understanding retrieval fundamentals by implementing **lexical retrieval (BM25)** before dense vector search, combined with LLM-based answer generation for grounded responses.

The goal was to build a maintainable, end-to-end system covering document ingestion, retrieval, API design, and frontend interaction.

---

## Problem

Large documents like research papers are difficult to navigate efficiently. Traditional keyword search lacks contextual understanding, while directly prompting an LLM with an entire document is inefficient and unreliable.

This project solves that by:

- extracting PDF text
- indexing document chunks
- retrieving relevant sections
- augmenting LLM prompts with retrieved context
- generating grounded answers

---

## Why I Built This

I wanted to understand how retrieval-augmented systems work beyond tutorial-level vector databases.

Instead of immediately using embeddings, I first implemented a vectorless retrieval pipeline to learn:

- how retrieval works internally
- how chunking impacts context quality
- how grounding reduces hallucination
- how backend systems serve LLM applications

---

## Tech Stack

### Backend

- Python
- FastAPI
- BM25 (`rank-bm25`)
- PyMuPDF
- LangChain
- Gemini 2.5 Flash

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

---

## System Architecture

```text
PDF Upload
    ↓
PDF Parsing
    ↓
Paragraph Chunking
    ↓
BM25 Index Creation
    ↓
User Query
    ↓
Top-K Retrieval
    ↓
Prompt Augmentation
    ↓
Gemini Response
```

---

## Engineering Decisions

### 1. BM25 over vector retrieval

I intentionally chose BM25 first instead of embeddings.

Reasons:

- lightweight
- interpretable ranking
- faster experimentation
- no embedding API dependency
- stronger understanding of retrieval fundamentals

This helped me build the retrieval pipeline from first principles.

---

### 2. Paragraph-aware chunking

Rather than fixed-size token chunks, documents are split into paragraphs.

Why:

- preserves semantic boundaries
- improves context quality
- better for academic papers
- reduces fragmented answers

---

### 3. Strict source grounding

The LLM receives only retrieved context and is explicitly instructed to refuse unsupported answers.

This reduces hallucinations and keeps responses document-grounded.

---

### 4. Full-stack separation

Frontend and backend are separated into independent services:

- `client/`
- `server/`

This allows easier deployment and future scaling.

---

## Features

### Backend

- PDF upload API
- document indexing
- lexical retrieval
- grounded generation
- page metadata preservation
- error handling
- CORS support

### Frontend

- drag-and-drop PDF upload
- responsive chat interface
- example prompts
- loading states
- conversation history
- auto-scroll
- clean UX

---

## Project Structure

```bash
RAG/
├── client/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── package.json
│   └── public/
│
├── server/
│   ├── assistant.py
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

---

## API Design

### Upload Document

`POST /upload`

Accepts PDF and returns a generated document ID.

### Query Document

`POST /ask`

Accepts:

```json
{
  "documentId": "...",
  "question": "What is the main contribution?"
}
```

Returns generated answer from retrieved content.

---

## Example Workflow

### Step 1

Upload a research paper.

### Step 2

Backend extracts text page-by-page.

### Step 3

Content is split into meaningful chunks.

### Step 4

Chunks are indexed with BM25.

### Step 5

User asks a question.

### Step 6

Relevant sections retrieved.

### Step 7

Gemini generates grounded answer.

---

## Local Setup

### Backend

```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Key Learnings

This project helped me explore:

- retrieval systems
- information indexing
- backend APIs
- full-stack integration
- prompt orchestration
- document processing
- production-style service design

---

## Future Improvements

Planned next steps:

- vector search
- hybrid retrieval
- reranking
- persistent index storage
- OCR support
- document citations
- multi-document querying
- Docker deployment
- cloud hosting
- evaluation metrics

---

## Notes

This project was built as a practical exploration of how document retrieval systems power modern AI applications, focusing on architecture, maintainability, and retrieval design rather than relying solely on prebuilt vector pipelines.
