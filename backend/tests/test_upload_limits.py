from __future__ import annotations

from io import BytesIO

import pytest
from fastapi import HTTPException, UploadFile

from app.core.uploads import read_upload_with_limit


@pytest.mark.anyio
async def test_read_upload_with_limit_accepts_small_payload():
    file = UploadFile(filename="ok.txt", file=BytesIO(b"abc"))
    data = await read_upload_with_limit(file, 10)
    assert data == b"abc"


@pytest.mark.anyio
async def test_read_upload_with_limit_rejects_oversized_payload():
    file = UploadFile(filename="big.txt", file=BytesIO(b"0123456789"))
    with pytest.raises(HTTPException) as exc:
        await read_upload_with_limit(file, 5)
    assert exc.value.status_code == 413
