from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.exception_handlers import register_exception_handlers
from app.routes.application import router as application_router
from app.routes.application_history import router as application_history_router
from app.routes.appointment import router as appointment_router
from app.routes.company import router as company_router
from app.routes.dashboard import router as dashboard_router
from app.routes.job_platform import router as job_platform_router
from app.routes.platform_template import router as platform_template_router
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

app.include_router(resume_router)
app.include_router(profile_data_router)
app.include_router(profile_experience_router)
app.include_router(profile_education_router)
app.include_router(profile_project_router)
app.include_router(profile_skill_router)
app.include_router(platform_template_router)
app.include_router(job_platform_router)
app.include_router(company_router)
app.include_router(application_router)
app.include_router(application_history_router)
app.include_router(appointment_router)
app.include_router(dashboard_router)
