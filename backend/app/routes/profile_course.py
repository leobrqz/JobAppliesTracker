import io

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.profile_course import CourseEntryCreate, CourseEntryResponse, CourseEntryUpdate, CourseReorderItem
from app.services import profile_course as profile_course_service

router = APIRouter(prefix="/api/profile-courses", tags=["profile-courses"])


@router.get("/", response_model=list[CourseEntryResponse])
def list_courses(db: Session = Depends(get_db)) -> list[CourseEntryResponse]:
    return profile_course_service.list_courses(db)


@router.post("/", response_model=CourseEntryResponse, status_code=201)
def create_course(data: CourseEntryCreate, db: Session = Depends(get_db)) -> CourseEntryResponse:
    return profile_course_service.create_course(db, data)


@router.patch("/{entry_id}", response_model=CourseEntryResponse)
def update_course(entry_id: int, data: CourseEntryUpdate, db: Session = Depends(get_db)) -> CourseEntryResponse:
    entry = profile_course_service.update_course(db, entry_id, data)
    if entry is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_course(entry_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_course_service.delete_course(db, entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Course not found")
    return Response(status_code=204)


@router.patch("/reorder", response_model=list[CourseEntryResponse])
def reorder_courses(items: list[CourseReorderItem], db: Session = Depends(get_db)) -> list[CourseEntryResponse]:
    return profile_course_service.reorder_courses(db, items)


@router.post("/{entry_id}/attachment", response_model=CourseEntryResponse)
async def upload_attachment(entry_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)) -> CourseEntryResponse:
    if file.filename is None:
        raise HTTPException(status_code=400, detail="Invalid file name")
    data = await file.read()
    entry = profile_course_service.upload_attachment(
        db=db,
        entry_id=entry_id,
        file_name=file.filename,
        mime_type=file.content_type or "",
        data=data,
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return entry


@router.delete("/{entry_id}/attachment", response_model=CourseEntryResponse)
def delete_attachment(entry_id: int, db: Session = Depends(get_db)) -> CourseEntryResponse:
    entry = profile_course_service.remove_attachment(db, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return entry


@router.get("/{entry_id}/attachment/download")
def download_attachment(entry_id: int, db: Session = Depends(get_db)) -> StreamingResponse:
    entry, data = profile_course_service.get_attachment_download(db, entry_id)
    media = entry.attachment_mime_type or "application/octet-stream"
    name = entry.attachment_file_name or "attachment"
    return StreamingResponse(
        io.BytesIO(data),
        media_type=media,
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )
