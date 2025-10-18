from datetime import date
import os
from dotenv import load_dotenv
from browser_use import Agent, Browser, ChatOpenAI, Tools
import asyncio
from pydantic import BaseModel, Field
import requests
from typing import Optional, List
import json

load_dotenv()


# Models
class PublicationDates(BaseModel):
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    expiration_time: Optional[str] = None
    award_period: Optional[date] = None
    bidders_requests_deadline: Optional[str] = None


class Contractor(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None


class PublicationDocument(BaseModel):
    filename: str
    download_link: str


class Publication(BaseModel):
    title: str
    description: Optional[str] = None
    dates: PublicationDates = Field(default_factory=PublicationDates)
    contractingAuthority: Contractor = Field(default_factory=Contractor)
    executionPlace: Optional[str] = None
    tenderDocuments: List[PublicationDocument] = Field(default_factory=list)


browser = Browser()
tools = Tools()


@tools.action(description="Save relevant documents in the right folder")
def save_documents(file_name: str, download_link: str, publication_title: str) -> str:
    folder_name = publication_title.replace(" ", "_")[:50]
    folder = os.path.join("saved_documents", folder_name)
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, file_name)

    try:
        response = requests.get(download_link, timeout=30)
        response.raise_for_status()
        with open(file_path, "wb") as f:
            f.write(response.content)
        return f"Successfully saved document at: {file_path}"
    except Exception as e:
        return f"Failed to download {file_name}: {str(e)}"


@tools.action(description="Save publications to JSON file")
def save_publications(pubs: List[Publication]) -> str:
    cleaned = []
    for p in pubs:  # safe way to deal with it if dict or pydantic model
        if hasattr(p, "dict"):
            cleaned.append(p.dict())
        elif isinstance(p, dict):
            cleaned.append(p)
        else:
            raise TypeError(f"Unsupported type in publications list: {type(p)}")

    with open("ausschreibungen.json", "w") as f:
        json.dump(cleaned, f, indent=2, default=str)

    return f"Saved {len(cleaned)} publications to file"


task = """Visit https://www.meinauftrag.rib.de/public/publications and extract data for up to 1 publication.  
For each publication:
1. Open its detail page before extracting any information.  
2. Use the tools `save_publications` and `save_documents` to store the structured data.  
3. Only download files listed under “Tender Documents.”  
4. Ensure all date fields (e.g., PublicationDates) are formatted according to the date model.  
"""

agent = Agent(
    task=task, browser=browser, llm=ChatOpenAI(model="gpt-4.1-mini"), tools=tools
)


async def main():
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
