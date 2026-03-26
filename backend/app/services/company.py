from typing import Optional

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.request_context import require_current_user_id
from app.models.application import Application
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate


def get_company(db: Session, company_id: int) -> Company | None:
    user_id = require_current_user_id()
    return db.query(Company).filter(Company.id == company_id, Company.user_id == user_id).first()


def get_companies(db: Session, search: Optional[str] = None) -> list[Company]:
    user_id = require_current_user_id()
    query = db.query(Company)
    if search:
        query = query.filter(Company.name.ilike(f"%{search}%"))
    return query.filter(Company.user_id == user_id).order_by(Company.name).all()


def create_company(db: Session, data: CompanyCreate) -> Company:
    user_id = require_current_user_id()
    company = Company(
        name=data.name,
        website=data.website,
        notes=data.notes,
    )
    db.add(company)
    try:
        db.flush()

        # Auto-link existing applications that share the same company name (free-text, not yet linked)
        db.query(Application).filter(
            Application.user_id == user_id,
            func.lower(Application.company) == func.lower(data.name),
            Application.company_id.is_(None),
            Application.company.isnot(None),
        ).update({"company_id": company.id}, synchronize_session=False)

        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A company with this name already exists")

    db.refresh(company)
    return company


def update_company(db: Session, company_id: int, data: CompanyUpdate) -> Company | None:
    user_id = require_current_user_id()
    company = get_company(db, company_id)
    if company is None:
        return None

    if data.name is not None and data.name.strip() != company.name:
        new_name = data.name.strip()
        # Keep linked applications' company text in sync with the new name
        db.query(Application).filter(
            Application.user_id == user_id,
            Application.company_id == company_id,
        ).update({"company": new_name}, synchronize_session=False)

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "name" and value is not None:
            value = value.strip()
        setattr(company, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A company with this name already exists")
    db.refresh(company)
    return company


def delete_company(db: Session, company_id: int) -> bool:
    company = get_company(db, company_id)
    if company is None:
        return False
    db.delete(company)
    db.commit()
    return True
