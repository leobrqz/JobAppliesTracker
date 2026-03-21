import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.config import settings

logger = logging.getLogger("app.errors")


def _cors_headers_for_request(request: Request) -> dict[str, str]:
    origin = request.headers.get("origin")
    if origin and origin in settings.cors_origins_list:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return {}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = str(uuid.uuid4())
        logger.exception(
            "Unhandled error request_id=%s method=%s path=%s",
            request_id,
            request.method,
            request.url.path,
        )
        headers = _cors_headers_for_request(request)
        return JSONResponse(
            status_code=500,
            content={
                "detail": (
                    "Something went wrong on the server. You can try again. "
                    "If it keeps happening, share this reference when asking for help."
                ),
                "ref": request_id,
            },
            headers=headers,
        )
