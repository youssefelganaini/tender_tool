from datetime import date
import os
from dotenv import load_dotenv
from browser_use import Agent, Browser, ChatOpenAI
import asyncio
from pydantic import BaseModel, Field
from typing import Optional, List

load_dotenv()


# Define publication dates
class PublicationDates(BaseModel):
    start: Optional[date] = None  # e.g., "2025-10-01"
    end: Optional[date] = None  # e.g., "2025-11-01"
    award_date: Optional[date] = None
    bidders_requests: Optional[date] = None  # list of request types or URLs


# Define contractor information
class Contractor(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None  # email or phone number


# relevant documents
class PublicationDocument(BaseModel):
    file_name: str
    file_path: str


# Define publication
class Publication(BaseModel):
    title: str = Field(..., description="Title of the publication")
    dates_and_deadlines: PublicationDates = Field(default_factory=PublicationDates)
    contracting_authority: Contractor = Field(default_factory=Contractor)
    execution_place: Optional[str] = None  # city, country, or region
    publication_url: Optional[str] = None  # link to the publication
    documents: List[PublicationDocument] = Field(default_factory=list)


# Connect to Chrome browser
browser = Browser()

agent = Agent(
    task="Visit https://www.meinauftrag.rib.de/public/publications and extract a list of publications",
    browser=browser,
    llm=ChatOpenAI(model="gpt-4.1-mini"),
)


async def main():
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
