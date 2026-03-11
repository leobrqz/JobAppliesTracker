from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


def get_appointment(db: Session, appointment_id: int) -> Appointment | None:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def get_appointments(
    db: Session,
    application_id: Optional[int] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
) -> list[Appointment]:
    query = db.query(Appointment)
    if application_id is not None:
        query = query.filter(Appointment.application_id == application_id)
    if start is not None:
        query = query.filter(Appointment.starts_at >= start)
    if end is not None:
        query = query.filter(Appointment.starts_at <= end)
    return query.order_by(Appointment.starts_at.asc()).all()


def create_appointment(db: Session, data: AppointmentCreate) -> Appointment:
    appointment = Appointment(
        application_id=data.application_id,
        title=data.title,
        type=data.type,
        platform=data.platform,
        meeting_url=data.meeting_url,
        starts_at=data.starts_at,
        ends_at=data.ends_at,
        notes=data.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def update_appointment(db: Session, appointment_id: int, data: AppointmentUpdate) -> Appointment | None:
    appointment = get_appointment(db, appointment_id)
    if appointment is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(appointment, field, value)
    db.commit()
    db.refresh(appointment)
    return appointment


def delete_appointment(db: Session, appointment_id: int) -> bool:
    appointment = get_appointment(db, appointment_id)
    if appointment is None:
        return False
    db.delete(appointment)
    db.commit()
    return True
