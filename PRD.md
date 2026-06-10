# PRD — Aplikace pro sběr kontaktů na veletrhu

## 1. Přehled

Mobilní aplikace pro obchodníky/marketéry, která na veletrhu rychle sbírá
kontakty návštěvníků dvěma způsoby:

1. **Sken QR kódu** z návštěvnické kartičky (badge).
2. **Sken vizitky (OCR)** pro návštěvníky bez QR kódu.

Všechny kontakty se ukládají a lze je exportovat do **Excelu (.xlsx)**.

## 2. Cíl a motivace

Na veletrhu je málo času na každý kontakt. Ruční přepisování vizitek je pomalé
a chybové. Aplikace má umožnit zachytit kontakt za **pár sekund** a večer mít
čistý seznam v Excelu připravený pro CRM / follow-up.

## 3. Cílový uživatel

- Jeden nebo více členů obchodního/marketingového týmu u stánku.
- Používají vlastní telefon (Android/iPhone).
- Nepotřebují technické znalosti — appka musí být „klikni a funguje".

## 4. Klíčové funkce (MVP)

### 4.1 Sken QR kódu
- Otevři fotoaparát, namiř na QR kód, automaticky se přečte.
- Podpora běžných formátů: **vCard**, **meCard**, URL, prostý text.
- Parsování do polí: jméno, firma, email, telefon, pozice, web.
- Pokud QR obsahuje jen URL/text → ulož jako poznámku, pole nech k doplnění.

### 4.2 Sken vizitky (OCR)
- Vyfoť vizitku → OCR rozpozná text.
- Pokus o automatické rozřazení do polí (jméno, firma, email, telefon, web).
- Uživatel může pole před uložením upravit.
- Uložení i fotky vizitky jako přílohy (volitelné).

### 4.3 Editace a ruční zadání
- Po každém skenu zobrazit formulář s předvyplněnými poli k potvrzení.
- Možnost přidat: zájem o produkt, poznámku, hodnocení leadu (žhavý/vlažný/studený).
- Možnost zadat kontakt ručně, když sken selže.

### 4.4 Seznam kontaktů
- Přehled všech nasbíraných kontaktů v rámci akce/veletrhu.
- Vyhledávání a mazání.
- Označení akce / dne (např. „MSV 2026").

### 4.5 Export do Excelu
- Tlačítko **Export do .xlsx**.
- Sloupce: Jméno, Firma, Pozice, Email, Telefon, Web, Zájem, Poznámka,
  Hodnocení, Datum/čas, Zdroj (QR / vizitka / ruční), Akce.
- Možnost sdílet soubor (email, cloud) přímo z telefonu.

## 5. Datový model (kontakt)

| Pole         | Typ      | Poznámka                          |
|--------------|----------|-----------------------------------|
| id           | string   | unikátní                          |
| jmeno        | string   |                                   |
| firma        | string   |                                   |
| pozice       | string   |                                   |
| email        | string   |                                   |
| telefon      | string   |                                   |
| web          | string   |                                   |
| zajem        | string   | o jaký produkt/téma               |
| poznamka     | string   | volný text                        |
| hodnoceni    | enum     | hot / warm / cold                 |
| zdroj        | enum     | qr / vizitka / rucni              |
| akce         | string   | název veletrhu                    |
| vytvoreno    | datetime | timestamp                         |
| foto         | blob/url | volitelná fotka vizitky           |

## 6. Nefunkční požadavky

- **Offline-first** — na veletrhu bývá špatný signál. Data se ukládají lokálně
  a export funguje bez internetu.
- **Rychlost** — od otevření po uložený kontakt do ~10 sekund.
- **Jednoduchost** — minimum kroků, velká tlačítka, použitelné jednou rukou.
- **Soukromí** — data zůstávají na zařízení uživatele (GDPR — kontakty jsou
  osobní údaje; doplnit souhlas / účel zpracování dle potřeby).

## 7. Technické řešení (ROZHODNUTO)

**Progresivní webová aplikace (PWA)** — běží v prohlížeči telefonu, bez instalace
z obchodu, přístup k fotoaparátu i offline funguje.

- **Frontend:** React + Vite, PWA (instalovatelná na plochu).
- **Sken QR:** `@zxing/browser` (kamera v prohlížeči).
- **OCR vizitek:** `tesseract.js` — vícejazyčné (mezinárodní veletrh:
  angličtina + čeština + němčina jako základ, lze rozšířit).
- **Úložiště:** IndexedDB lokálně v telefonu (knihovna Dexie).
- **Export Excel:** `SheetJS (xlsx)`.
- **Hosting:** lokálně; nasazení (GitHub Pages / Netlify) až u první verze.

### Rozhodnutí o ukládání (bez firemního IT)
- Data se ukládají **pouze lokálně** v telefonu, **bez cloudu**.
- Export do **.xlsx**, který uživatel ručně nahraje na firemní **SharePoint**.
- **Důsledky, se kterými uživatel souhlasil:**
  - Žádné živé sdílení seznamu mezi telefony (každý vidí svoje).
  - Riziko ztráty dat při ztrátě/rozbití telefonu před exportem.
- **Opatření proti ztrátě dat:**
  - `navigator.storage.persist()` — žádost o trvalé úložiště (proti smazání
    prohlížečem).
  - Výrazná připomínka na pravidelný export.
  - Sloučení .xlsx souborů od více lidí na SharePointu = "sdílený" výsledek.

## 8. Rozsah MVP vs. budoucnost

**MVP (verze 1):**
- Sken QR (vCard/meCard/text) ✅
- Sken vizitky s OCR ✅
- Editace + ruční zadání ✅
- Seznam kontaktů ✅
- Export do .xlsx ✅
- Offline ✅

**Později (nice-to-have):**
- Více akcí/veletrhů a filtrování.
- Synchronizace do cloudu / sdílení mezi členy týmu.
- Přímé napojení na CRM (HubSpot, Salesforce…).
- Předvyplněné dotazníky (zájem o konkrétní produkt).
- Statistiky (počet leadů za den, podle hodnocení).

## 9. Otevřené otázky

- Jaký formát QR kódů veletrh používá? (ovlivní parsování)
- Potřebuješ víc lidí sdílet jeden seznam, nebo každý svůj?
- Stačí export do Excelu, nebo bude potřeba i automatický upload do CRM?
- Jazyk vizitek? (čeština/angličtina ovlivní nastavení OCR)
