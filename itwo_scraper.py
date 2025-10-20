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
from itwo_schemas import (
    PublicationInput,
)

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

        # --- Tender Documents ---
        for doc in input_obj.get("tender_documents", []):
            doc_obj, _ = PublicationDocument.objects.get_or_create(
                filename=doc["filename"], download_link=doc["download_link"]
            )
            publication.tender_documents.add(doc_obj)

        created_count += 1

    return f"✅ Created {created_count} new publication(s) successfully."


login_email = os.getenv("LOGIN_EMAIL")
login_password = os.getenv("LOGIN_PASSWORD")

task = f"""Visit https://www.myorder.rib.de/tender/index and login using the email {login_email} and password {login_password}, and extract input_obj for up to 1 publication.  
When on the "Tenders" page, for each publication:
2. Open its detail page before extracting any information.  
3. Use the tools `create_publications` to store the structured input_obj.  
4. Only use files listed under “Tender Documents. for the tender documents objects”  
5. Ensure all date fields (e.g., PublicationDates) are formatted according to the input models given.  
"""

agent = Agent(
    task=task, browser=browser, llm=ChatOpenAI(model="gpt-4.1-mini"), tools=tools
)


async def main():
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
