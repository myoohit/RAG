import os
import shutil
from fastapi import FastAPI,UploadFile,File,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel,Field
from assistant import IndexPdf,RAG

app=FastAPI(title="Research Paper Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

UploadDir="uploads"
os.makedirs(UploadDir,exist_ok=True)

class UploadResponse(BaseModel):
    documentId:str

class QueryRequest(BaseModel):
    documentId:str
    question:str=Field(...,examples=["What methodology is used in this paper?"])

class QueryResponse(BaseModel):
    result:str

@app.get("/")
def default():
    return{"message":"Server running successfully"}

# @app.post("/upload", response_model=UploadResponse)
# async def upload_pdf(file: UploadFile = File(...)):
#     if not file.filename.lower().endswith(".pdf"):
#         raise HTTPException(status_code=400, detail="Only PDF files are allowed")

#     file_path = os.path.join(UploadDir, file.filename)
#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     document_id = IndexPdf(file_path)
#     return {"documentId": document_id}

@app.post("/upload", response_model=UploadResponse)
def upload_pdf(file: UploadFile = File(...)):  # ← NO async here!
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = os.path.join(UploadDir, file.filename)

    # This works reliably with React Native
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document_id = IndexPdf(file_path)
    return {"documentId": document_id}

@app.post("/ask",response_model=QueryResponse)
def Ask(Request:QueryRequest):
    Result=RAG(Request.documentId,Request.question)
    return {"result":Result}