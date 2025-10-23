from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional
from datetime import date, datetime


class DatesInput(BaseModel):
    period_start: Optional[date]
    period_end: Optional[date]
    application_deadline: Optional[datetime]
    bidders_requests_deadline: Optional[datetime]
    expiration_time: Optional[datetime]
    award_period: Optional[date]


class ContractorInput(BaseModel):
    name: Optional[str]
    address: Optional[str]
    contact_email: Optional[EmailStr]


class CPVCodeInput(BaseModel):
    code: str
    description: Optional[str]


class PublicationInput(BaseModel):
    tender_number: str
    title: str
    description: Optional[str]
    tender_procedure: Optional[str]
    execution_place: Optional[str]
    subdivision_into_lots: bool = False
    side_offers_allowed: bool = False
    several_main_offers_allowed: bool = False

    dates: DatesInput
    contracting_authority: ContractorInput
    cpv_codes: List[CPVCodeInput] = []

    publication_url: str
    portal_name: str


class DocumentInput(BaseModel):
    filename: str
    download_link: str
    publication_tender_number: str
