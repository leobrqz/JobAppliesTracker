import io

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.uploads import read_upload_with_limit
from app.schemas.profile_certification import (
    CertificationEntryCreate,
    CertificationEntryResponse,
    CertificationEntryUpdate,
    CertificationReorderItem,
)
from app.services import profile_certification as profile_certification_service

router = APIRouter(prefix="/api/profile-certifications", tags=["profile-certifications"])


@router.get("/", response_model=list[CertificationEntryResponse])
def list_certifications(db: Session = Depends(get_db)) -> list[CertificationEntryResponse]:
    return profile_certification_service.list_certifications(db)


@router.post("/", response_model=CertificationEntryResponse, status_code=201)
def create_certification(data: CertificationEntryCreate, db: Session = Depends(get_db)) -> CertificationEntryResponse:
    return profile_certification_service.create_certification(db, data)


@router.patch("/{entry_id}", response_model=CertificationEntryResponse)
def update_certification(
    entry_id: int,
    data: CertificationEntryUpdate,
    db: Session = Depends(get_db),
) -> CertificationEntryResponse:
    entry = profile_certification_service.update_certification(db, entry_id, data)
    if entry is None:
        raise HTTPException(status_code=404, detail="Certification not found")
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_certification(entry_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_certification_service.delete_certification(db, entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Certification not found")
    return Response(status_code=204)


@router.patch("/reorder", response_model=list[CertificationEntryResponse])
def reorder_certifications(
    items: list[CertificationReorderItem],
    db: Session = Depends(get_db),
) -> list[CertificationEntryResponse]:
    return profile_certification_service.reorder_certifications(db, items)


@router.post("/{entry_id}/attachment", response_model=CertificationEntryResponse)
async def upload_attachment(
    entry_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> CertificationEntryResponse:
    if file.filename is None:
        raise HTTPException(status_code=400, detail="Invalid file name")
    data = await read_upload_with_limit(file, settings.CERTIFICATION_UPLOAD_MAX_BYTES)
    entry = profile_certification_service.upload_attachment(
        db=db,
        entry_id=entry_id,
        file_name=file.filename,
        mime_type=file.content_type or "",
        data=data,
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Certification not found")
    return entry


@router.delete("/{entry_id}/attachment", response_model=CertificationEntryResponse)
def delete_attachment(entry_id: int, db: Session = Depends(get_db)) -> CertificationEntryResponse:
    entry = profile_certification_service.remove_attachment(db, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Certification not found")
    return entry


@router.get("/{entry_id}/attachment/download")
def download_attachment(entry_id: int, db: Session = Depends(get_db)) -> StreamingResponse:
    entry, data = profile_certification_service.get_attachment_download(db, entry_id)
    media = entry.attachment_mime_type or "application/octet-stream"
    name = entry.attachment_file_name or "attachment"
    return StreamingResponse(
        io.BytesIO(data),
        media_type=media,
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )
