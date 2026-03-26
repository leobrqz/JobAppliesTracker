from fastapi import FastAPI
from fastapi import Request
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.auth import verify_bearer_token
from app.core.config import settings
from app.core.request_context import current_user_id_ctx
from app.exception_handlers import register_exception_handlers
from app.routes.application import router as application_router
from app.routes.application_history import router as application_history_router
from app.routes.appointment import router as appointment_router
from app.routes.company import router as company_router
from app.routes.dashboard import router as dashboard_router
from app.routes.job_platform import router as job_platform_router
from app.routes.platform_template import router as platform_template_router
from app.routes.profile_about_me import router as profile_about_me_router
from app.routes.profile_certification import router as profile_certification_router
from app.routes.profile_course import router as profile_course_router
from app.routes.profile_data import router as profile_data_router
from app.routes.profile_education import router as profile_education_router
from app.routes.profile_experience import router as profile_experience_router
from app.routes.profile_project import router as profile_project_router
from app.routes.profile_skill import router as profile_skill_router
from app.routes.resume import router as resume_router

app = FastAPI(title="JobAppliesTracker API")

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    if path in settings.auth_public_paths_list:
        return await call_next(request)
    if path.startswith("/docs") or path.startswith("/redoc") or path.startswith("/openapi.json"):
        return await call_next(request)

    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return JSONResponse(status_code=401, content={"detail": "Missing bearer token"})

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return JSONResponse(status_code=401, content={"detail": "Missing bearer token"})

    try:
        user = verify_bearer_token(token)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    request.state.user_id = str(user.user_id)
    token_ctx = current_user_id_ctx.set(user.user_id)
    try:
        return await call_next(request)
    finally:
        current_user_id_ctx.reset(token_ctx)

app.include_router(resume_router)
app.include_router(profile_data_router)
app.include_router(profile_experience_router)
app.include_router(profile_education_router)
app.include_router(profile_project_router)
app.include_router(profile_skill_router)
app.include_router(profile_certification_router)
app.include_router(profile_course_router)
app.include_router(profile_about_me_router)
app.include_router(platform_template_router)
app.include_router(job_platform_router)
app.include_router(company_router)
app.include_router(application_router)
app.include_router(application_history_router)
app.include_router(appointment_router)
app.include_router(dashboard_router)
