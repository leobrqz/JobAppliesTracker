from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.resume import ResumeResponse, ResumeUpdate
from app.services import resume as resume_service

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


@router.get("/", response_model=list[ResumeResponse])
def list_resumes(archived: bool = False, db: Session = Depends(get_db)) -> list[ResumeResponse]:
    return resume_service.get_resumes(db, archived=archived)


@router.post("/", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    name: str = Form(...),
    description: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> ResumeResponse:
    data = await file.read()
    return resume_service.upload_resume(db, name=name, description=description, data=data)


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(get_db)) -> ResumeResponse:
    resume = resume_service.get_resume(db, resume_id)
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.patch("/{resume_id}", response_model=ResumeResponse)
def update_resume(resume_id: int, data: ResumeUpdate, db: Session = Depends(get_db)) -> ResumeResponse:
    resume = resume_service.update_resume(db, resume_id, data)
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = resume_service.delete_resume(db, resume_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resume not found")
    return Response(status_code=204)


@router.post("/{resume_id}/archive", response_model=ResumeResponse)
def archive_resume(resume_id: int, db: Session = Depends(get_db)) -> ResumeResponse:
    resume = resume_service.archive_resume(db, resume_id)
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.post("/{resume_id}/restore", response_model=ResumeResponse)
def restore_resume(resume_id: int, db: Session = Depends(get_db)) -> ResumeResponse:
    resume = resume_service.restore_resume(db, resume_id)
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/{resume_id}/download")
def download_resume(resume_id: int, db: Session = Depends(get_db)) -> FileResponse:
    resume, resolved_path = resume_service.get_resume_for_download(db, resume_id)
    return FileResponse(
        path=resolved_path,
        filename=resume.name,
        media_type="application/octet-stream",
    )
