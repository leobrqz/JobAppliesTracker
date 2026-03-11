from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from app.services import appointment as appointment_service

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.get("/", response_model=list[AppointmentResponse])
def list_appointments(
    application_id: Optional[int] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    db: Session = Depends(get_db),
) -> list[AppointmentResponse]:
    return appointment_service.get_appointments(
        db, application_id=application_id, start=start, end=end
    )


@router.post("/", response_model=AppointmentResponse, status_code=201)
def create_appointment(data: AppointmentCreate, db: Session = Depends(get_db)) -> AppointmentResponse:
    return appointment_service.create_appointment(db, data)


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)) -> AppointmentResponse:
    appointment = appointment_service.get_appointment(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
) -> AppointmentResponse:
    appointment = appointment_service.update_appointment(db, appointment_id, data)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.delete("/{appointment_id}", status_code=204)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = appointment_service.delete_appointment(db, appointment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return Response(status_code=204)
