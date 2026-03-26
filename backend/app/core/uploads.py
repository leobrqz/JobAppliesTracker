from fastapi import HTTPException, UploadFile


async def read_upload_with_limit(file: UploadFile, max_bytes: int) -> bytes:
    data = await file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail="Uploaded file exceeds allowed size")
    return data
