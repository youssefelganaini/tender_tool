import os
import django

# Must be set BEFORE any Django imports
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()
from dotenv import load_dotenv
from browser_use import Agent, Browser, ChatOpenAI, Tools
import asyncio
import requests
from typing import Optional, List
import json
from django.forms.models import model_to_dict
from core.models import (
    PublicationDates,
    Contractor,
    CPVCode,
    Publication,
    PublicationDocument,
)
from itwo_schemas import PublicationInput, DocumentInput

load_dotenv()

browser = Browser()
tools = Tools()


@tools.action(description="Create and save new Publication entries in the database")
def create_publications(publication_inputs: List[PublicationInput]) -> str:
    created_count = 0

    for input_obj in publication_inputs:
        # --- Create Dates ---
        dates_data = input_obj["dates"]
        dates = PublicationDates.objects.create(**dates_data)

        # --- Create or get Contractor ---
        contractor_data = input_obj["contracting_authority"]
        contractor, _ = Contractor.objects.get_or_create(
            name=contractor_data.get("name"),
            defaults={
                "address": contractor_data.get("address"),
                "contact_email": contractor_data.get("contact_email"),
            },
        )

        # --- Create Publication (idempotent by tender_number) ---
        publication, created = Publication.objects.get_or_create(
            tender_number=input_obj["tender_number"],
            defaults={
                "title": input_obj["title"],
                "description": input_obj.get("description"),
                "tender_procedure": input_obj.get("tender_procedure"),
                "execution_place": input_obj.get("execution_place"),
                "subdivision_into_lots": input_obj.get("subdivision_into_lots", False),
                "side_offers_allowed": input_obj.get("side_offers_allowed", False),
                "several_main_offers_allowed": input_obj.get(
                    "several_main_offers_allowed", False
                ),
                "dates": dates,
                "contracting_authority": contractor,
            },
        )

        if not created:
            # If publication exists, skip to avoid duplicates
            continue

        # --- CPV Codes ---
        for cpv in input_obj.get("cpv_codes", []):
            cpv_obj, _ = CPVCode.objects.get_or_create(
                code=cpv["code"], defaults={"description": cpv.get("description")}
            )
            publication.cpv_codes.add(cpv_obj)

        # # --- Tender Documents ---
        # for doc in input_obj.get("tender_documents", []):
        #     doc_obj, _ = PublicationDocument.objects.get_or_create(
        #         filename=doc["filename"], download_link=doc["download_link"]
        #     )
        #     publication.tender_documents.add(doc_obj)

        created_count += 1

    return f"✅ Created {created_count} new publication(s) successfully."


@tools.action(description="Create and save publication documents")
def create_documents(document_inputs: List[DocumentInput]) -> str:
    created_count = 0

    for doc in document_inputs:
        publication = Publication.objects.get(
            tender_number=doc.publication_tender_number
        )

        document, created = PublicationDocument.objects.get_or_create(
            filename=doc.filename,
            download_link=doc.download_link,
            tender=publication,
        )

        if created:
            created_count += 1

    return f"✅ Created {created_count} publication documents"


login_email_itwo = os.getenv("LOGIN_EMAIL")
login_password_itwo = os.getenv("LOGIN_PASSWORD")


itwo_task = f"""Visit https://www.myorder.rib.de/tender/index and login using the email {login_email_itwo} and password {login_password_itwo}, and extract input_obj for up to 1 publication.  
When on the "Tenders" page, for each publication:
2. Open its detail page before extracting any information.  
3. Use the tools `create_publications` to store the structured input_obj.  
4. ONLY download files that describe that describe the service that needs to be provided. For the tender documents objects use 'create_documents' to save the tender documents objects”  
5. Ensure all date fields (e.g., PublicationDates) are formatted according to the input models given.  
"""

itwo_agent = Agent(
    task=itwo_task, browser=browser, llm=ChatOpenAI(model="gpt-4.1-mini"), tools=tools
)

service_bund_task = f"""Visit https://www.service.bund.de/Content/DE/Ausschreibungen/Suche/Formular.html?view=processForm&nn=4641514, and extract input_obj for up to 1 publication.  
When on the "Tenders" page, for each publication:
2. DO NOT EXTRACT DATA, visit the detail page first. On the Detail Page, look for the link to the more detailed HTML Page under "Bekanntmachungen" and visit that link.
3. Use the tools `create_publications` to store the structured input_obj using the info on that page.  
4. ONLY download files that describe that describe the service that needs to be provided. For the tender documents objects use 'create_documents' to save the tender documents objects”  
5. Ensure all date fields (e.g., PublicationDates) are formatted according to the input models given.  
"""

service_bund_agent = Agent(
    task=itwo_task,
    browser=browser,
    llm=ChatOpenAI(model="gpt-4.1-mini"),
    tools=tools,
)


async def main():
    await service_bund_agent.run()


if __name__ == "__main__":
    asyncio.run(main())
