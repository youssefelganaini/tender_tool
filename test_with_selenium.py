import time
import json
import os
import re
import requests
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import pandas as pd

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains


class RIBSeleniumScraper:
    """Scraper für RIB Ausschreibungsplattform mit Selenium"""

    def __init__(self, output_dir: str = "rib_ausschreibungen", headless: bool = False):
        self.base_url = "https://www.meinauftrag.rib.de/public/publications"
        self.output_dir = Path(output_dir)
        self.headless = headless
        self.driver = None

        # Verzeichnisstruktur erstellen
        self.setup_directories()

    def setup_directories(self):
        """Erstellt die Verzeichnisstruktur"""
        (self.output_dir / "data").mkdir(parents=True, exist_ok=True)
        (self.output_dir / "documents").mkdir(parents=True, exist_ok=True)
        (self.output_dir / "screenshots").mkdir(parents=True, exist_ok=True)
        (self.output_dir / "raw").mkdir(parents=True, exist_ok=True)

    def init_driver(self):
        """Initialisiert den Selenium WebDriver"""
        chrome_options = Options()

        if self.headless:
            chrome_options.add_argument("--headless")

        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument(
            "user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )

        # Download-Einstellungen
        prefs = {
            "download.default_directory": str(self.output_dir / "documents"),
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True,
        }
        chrome_options.add_experimental_option("prefs", prefs)

        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 20)

    def close_driver(self):
        """Schließt den WebDriver"""
        if self.driver:
            self.driver.quit()

    def wait_for_page_load(self, timeout: int = 15):
        """Wartet, bis die Seite vollständig geladen ist"""
        try:
            self.wait.until(
                lambda driver: driver.execute_script("return document.readyState")
                == "complete"
            )
            time.sleep(2)  # Zusätzliche Zeit für React-Rendering
        except TimeoutException:
            print("  ⚠ Timeout beim Laden der Seite")

    def scroll_to_element(self, element):
        """Scrollt zu einem Element"""
        self.driver.execute_script(
            "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
            element,
        )
        time.sleep(0.5)

    def extract_tender_ids(self) -> List[str]:
        """Extrahiert alle Tender-IDs von der Seite"""
        tender_ids = []

        # Finde alle Elemente mit IDs die mit "tender-" beginnen
        elements = self.driver.find_elements(By.CSS_SELECTOR, "[id^='tender-']")

        for elem in elements:
            tender_id = elem.get_attribute("id")
            if tender_id and not tender_id.startswith("collapseItem"):
                # Extrahiere nur die Nummer
                match = re.search(r"tender-(\d+)", tender_id)
                if match:
                    tender_ids.append(match.group(1))

        return list(set(tender_ids))  # Duplikate entfernen

    def scroll_to_load_all(self):
        """Scrollt die Seite nach unten, um alle Ausschreibungen zu laden"""
        print("  Scrolle Seite, um alle Ausschreibungen zu laden...")

        last_height = self.driver.execute_script("return document.body.scrollHeight")
        scroll_pause = 2

        # while True:
        #     # Scrolle nach unten
        #     self.driver.execute_script(
        #         "window.scrollTo(0, document.body.scrollHeight);"
        #     )
        #     time.sleep(scroll_pause)

        #     # Berechne neue Höhe
        #     new_height = self.driver.execute_script("return document.body.scrollHeight")

        #     # Prüfe ob "Mehr laden" Button existiert
        #     try:
        #         load_more_btn = self.driver.find_element(
        #             By.XPATH,
        #             "//button[contains(text(), 'Mehr') or contains(text(), 'Load')]",
        #         )
        #         self.scroll_to_element(load_more_btn)
        #         load_more_btn.click()
        #         print("    'Mehr laden' Button geklickt")
        #         time.sleep(2)
        #     except NoSuchElementException:
        #         pass

        #     if new_height == last_height:
        #         break

        #     last_height = new_height

        print("  ✓ Alle Ausschreibungen geladen")

    def extract_tender_overview(self, tender_id: str) -> Dict[str, Any]:
        """Extrahiert Übersichtsinformationen einer Ausschreibung"""
        try:
            tender_elem = self.driver.find_element(By.ID, f"tender-{tender_id}")

            # Extrahiere sichtbaren Text
            text = tender_elem.text

            # Versuche spezifische Felder zu extrahieren
            data = {
                "id": tender_id,
                "raw_text": text,
            }

            # Versuche Titel zu finden
            try:
                title_elem = tender_elem.find_element(
                    By.CSS_SELECTOR, "h5, h4, .tender-title, .title"
                )
                data["title"] = title_elem.text.strip()
            except NoSuchElementException:
                # Nimm erste Zeile als Titel
                lines = text.split("\n")
                data["title"] = lines[0] if lines else f"Ausschreibung {tender_id}"

            # Extrahiere Link zur Detailseite
            try:
                link_elem = tender_elem.find_element(By.CSS_SELECTOR, "a")
                data["detail_link"] = link_elem.get_attribute("href")
            except NoSuchElementException:
                data["detail_link"] = None

            return data

        except NoSuchElementException:
            return None

    def extract_tender_details(self, tender_id: str) -> Dict[str, Any]:
        """Öffnet und extrahiert detaillierte Informationen einer Ausschreibung"""
        try:
            # Finde und klicke auf das Tender-Element
            tender_elem = self.driver.find_element(By.ID, f"tender-{tender_id}")
            self.scroll_to_element(tender_elem)

            # Versuche auf Link oder Button zu klicken
            clickable = None

            # Strategie 1: Suche nach Link
            try:
                clickable = tender_elem.find_element(
                    By.CSS_SELECTOR, "a[href*='publication']"
                )
            except NoSuchElementException:
                pass

            # Strategie 2: Suche nach expand/collapse Button
            if not clickable:
                try:
                    clickable = tender_elem.find_element(
                        By.CSS_SELECTOR, "[data-toggle='collapse'], button"
                    )
                except NoSuchElementException:
                    pass

            # Strategie 3: Klicke auf das gesamte Element
            if not clickable:
                clickable = tender_elem

            # Klicke und warte
            clickable.click()
            time.sleep(2)

            # Versuche collapsed content zu finden
            details = {"id": tender_id}

            try:
                collapse_elem = self.driver.find_element(
                    By.ID, f"collapseItem-{tender_id}"
                )

                # Warte bis expanded
                self.wait.until(EC.visibility_of(collapse_elem))
                time.sleep(1)

                # Extrahiere gesamten Text
                details["full_text"] = collapse_elem.text

                # Extrahiere strukturierte Daten
                text = collapse_elem.text

                # Parse bekannte Felder
                for line in text.split("\n"):
                    line = line.strip()
                    if ":" in line:
                        key, value = line.split(":", 1)
                        key = key.strip().lower().replace(" ", "_")
                        value = value.strip()
                        details[key] = value

                # Suche nach Dokumenten
                doc_links = collapse_elem.find_elements(
                    By.CSS_SELECTOR, "a[href*='document'], a[download]"
                )
                details["documents"] = []

                for link in doc_links:
                    doc_info = {
                        "text": link.text.strip(),
                        "url": link.get_attribute("href"),
                        "filename": link.get_attribute("download") or link.text.strip(),
                    }
                    details["documents"].append(doc_info)

                print(f"    ✓ {len(details.get('documents', []))} Dokumente gefunden")

            except (NoSuchElementException, TimeoutException):
                print(f"    ⚠ Keine erweiterten Details gefunden")
                details["full_text"] = tender_elem.text

            return details

        except Exception as e:
            print(f"    ✗ Fehler beim Extrahieren: {e}")
            return None

    def download_document(self, doc_url: str, tender_id: str, filename: str):
        """Lädt ein Dokument herunter"""
        tender_dir = self.output_dir / "documents" / tender_id
        tender_dir.mkdir(parents=True, exist_ok=True)

        filepath = tender_dir / filename

        if filepath.exists():
            print(f"      ✓ Bereits vorhanden: {filename}")
            return True

        try:
            # Nutze Selenium's Browser-Session für Download
            self.driver.get(doc_url)
            time.sleep(3)  # Warte auf Download

            print(f"      ✓ Download gestartet: {filename}")
            return True

        except Exception as e:
            print(f"      ✗ Download fehlgeschlagen: {e}")
            return False

    def scrape_all_tenders(self, max_tenders: int = None):
        """Scrapt alle Ausschreibungen"""
        print("=" * 70)
        print("RIB Ausschreibungen Scraper")
        print("=" * 70)

        all_data = []

        try:
            self.init_driver()

            # Phase 1: Seite laden und scrollen
            print("\n[Phase 1] Lade Ausschreibungsliste...")
            self.driver.get(self.base_url)
            self.wait_for_page_load()

            # Screenshot
            screenshot_path = self.output_dir / "screenshots" / "start.png"
            self.driver.save_screenshot(str(screenshot_path))

            # Scroll zum Laden aller Ausschreibungen
            self.scroll_to_load_all()

            # Phase 2: Tender IDs sammeln
            print("\n[Phase 2] Sammle Tender-IDs...")
            tender_ids = self.extract_tender_ids()
            print(f"  ✓ {len(tender_ids)} Ausschreibungen gefunden")

            if max_tenders:
                tender_ids = tender_ids[:max_tenders]
                print(f"  → Limitiere auf {max_tenders} Ausschreibungen")

            # Phase 3: Details extrahieren
            print("\n[Phase 3] Extrahiere Details...\n")

            for idx, tender_id in enumerate(tender_ids, 1):
                print(f"[{idx}/{len(tender_ids)}] Ausschreibung {tender_id}")

                # Übersicht extrahieren
                overview = self.extract_tender_overview(tender_id)
                if overview:
                    print(f"  Titel: {overview.get('title', 'N/A')[:70]}")

                # Details extrahieren
                details = self.extract_tender_details(tender_id)

                if details:
                    # Kombiniere Daten
                    combined = {**(overview or {}), **details}
                    all_data.append(combined)

                    # Speichere einzelne Detail-Datei
                    detail_file = self.output_dir / "raw" / f"tender_{tender_id}.json"
                    with open(detail_file, "w", encoding="utf-8") as f:
                        json.dump(combined, f, ensure_ascii=False, indent=2)

                    # Dokumente herunterladen
                    if details.get("documents"):
                        print(f"  Lade {len(details['documents'])} Dokument(e)...")
                        for doc in details["documents"]:
                            if doc.get("url"):
                                self.download_document(
                                    doc["url"],
                                    tender_id,
                                    doc.get("filename", f"document_{idx}.pdf"),
                                )

                # Zurück zur Übersicht navigieren wenn nötig
                current_url = self.driver.current_url
                if current_url != self.base_url:
                    self.driver.get(self.base_url)
                    self.wait_for_page_load()

                time.sleep(1)  # Rate limiting
                print()

            # Phase 4: Strukturierte Daten speichern
            print("[Phase 4] Speichere strukturierte Daten...")
            self.save_structured_data(all_data)

            print("\n" + "=" * 70)
            print(f"✓ Scraping abgeschlossen!")
            print(f"✓ {len(all_data)} Ausschreibungen verarbeitet")
            print(f"✓ Daten gespeichert in: {self.output_dir}")
            print("=" * 70)

        finally:
            self.close_driver()

    def save_structured_data(self, data: List[Dict[str, Any]]):
        """Speichert die Daten strukturiert"""
        # JSON
        json_file = self.output_dir / "data" / "all_tenders.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  ✓ JSON: {json_file}")

        # Excel & CSV
        if data:
            flat_data = []
            for item in data:
                flat_item = {
                    "ID": item.get("id"),
                    "Titel": item.get("title", "")[:200],
                    "Volltext": item.get("full_text", "")[:500],
                    "Detail_Link": item.get("detail_link"),
                    "Anzahl_Dokumente": len(item.get("documents", [])),
                }

                # Füge dynamische Felder hinzu
                for key, value in item.items():
                    if key not in [
                        "id",
                        "title",
                        "full_text",
                        "raw_text",
                        "detail_link",
                        "documents",
                    ]:
                        if isinstance(value, (str, int, float)):
                            flat_item[key] = value

                flat_data.append(flat_item)

            df = pd.DataFrame(flat_data)

            # Excel
            excel_file = self.output_dir / "data" / "tenders_overview.xlsx"
            df.to_excel(excel_file, index=False, engine="openpyxl")
            print(f"  ✓ Excel: {excel_file}")

            # CSV
            csv_file = self.output_dir / "data" / "tenders_overview.csv"
            df.to_csv(csv_file, index=False, encoding="utf-8-sig")
            print(f"  ✓ CSV: {csv_file}")


def main():
    """Hauptfunktion"""
    scraper = RIBSeleniumScraper(output_dir="rib_ausschreibungen", headless=False)

    # Scrape alle Ausschreibungen (oder setze max_tenders=10 für Test)
    scraper.scrape_all_tenders(max_tenders=None)


if __name__ == "__main__":
    main()
