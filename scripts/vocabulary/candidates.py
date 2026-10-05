"""Lists vocabulary candidates from open, attributed sources (`pnpm vocab:candidates`).

Levels:   Words-CEFR dataset (A1-B2, MIT) and Octanove Vocabulary Profile C1/C2 (CC BY-SA 4.0).
Ranking:  wordfreq Zipf frequency, so each level starts with its most useful words.
Meaning:  Vietnamese translation groups from English Wiktionary (CC BY-SA 4.0), read through the
          kaikki.org extraction, for the entry whose part of speech matches the level list.
IPA:      Wiktionary pronunciation (Received Pronunciation first, General American kept too).

Writes .cache/vocabulary/candidates.json, a transport file: `pnpm vocab:ingest` adds the words
the catalogue (PostgreSQL, the only home of the vocabulary) does not have yet. A candidate
without Wiktionary IPA is left out; one without a Vietnamese translation is kept with empty
sense groups, so an editor can write its meaning. Wiktionary does not order senses by
frequency, so every translation group is kept and a reviewer picks the learner's sense.
Per-word Wiktionary data is cached in .cache/kaikki so reruns work offline.
"""
import csv
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor
import urllib.parse
import urllib.request
from pathlib import Path

from wordfreq import zipf_frequency

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / ".cache"
OUT = CACHE / "vocabulary/candidates.json"
LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")
POS_MAP = {"noun": "noun", "verb": "verb", "adjective": "adj", "adverb": "adv"}
LEVEL_SOURCES = {
    "words-cefr": {"name": "Words-CEFR Dataset", "url": "https://github.com/Maximax67/Words-CEFR-Dataset", "license": "MIT"},
    "octanove": {"name": "Octanove Vocabulary Profile C1/C2 1.0", "url": "https://github.com/openlanguageprofiles/olp-en-cefrj", "license": "CC BY-SA 4.0"},
}
IPA_SOURCES = {
    "wiktionary": None,  # the catalogue links the word's Wiktionary page
    "ipa-dict": {"name": "ipa-dict (open-dict-data), en_UK", "url": "https://github.com/open-dict-data/ipa-dict", "license": "MIT"},
}


def load_ipa_dict() -> dict[str, str]:
    """British IPA from ipa-dict (MIT), used only when Wiktionary has no pronunciation for the word."""
    path = CACHE / "ipa-dict-en_UK.txt"
    if not path.exists():
        return {}
    table: dict[str, str] = {}
    for line in path.read_text(encoding="utf8").splitlines():
        word, _, ipa = line.partition("\t")
        first = ipa.split(",")[0].strip()
        if word and first.startswith("/") and first.endswith("/"):
            table[word] = learner_ipa(first)
    return table


IPA_DICT: dict[str, str] = {}
LATIN = re.compile(r"^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF'’ ,.\-()]+$")
# Grammatical adverbs belong to grammar lessons, not the vocabulary deck.
FUNCTION_ADVERBS = set("not just when there then so very how where why here too as more most much less least about up down out off away back over even still yet ever else only also well".split())


def candidates():
    words = json.loads((ROOT / "content/cefr/imports/words-cefr.v1.json").read_text(encoding="utf8"))["entries"]
    for entry in words:
        yield entry["headword"], entry["partOfSpeech"], entry["cefrLevel"], "words-cefr"
    with open(CACHE / "octanove-c1c2.csv", encoding="utf8") as handle:
        for row in csv.DictReader(handle):
            yield row["headword"], row["pos"], row["CEFR"], "octanove"


def kaikki(word: str) -> list[dict]:
    target = CACHE / "kaikki" / f"{urllib.parse.quote(word, safe='')}.jsonl"
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        url = f"https://kaikki.org/dictionary/English/meaning/{urllib.parse.quote(word[0])}/{urllib.parse.quote(word[:2])}/{urllib.parse.quote(word)}.jsonl"
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                target.write_bytes(response.read())
        except Exception:  # noqa: BLE001 - a missing page just means no entry
            target.write_text("", encoding="utf8")
        time.sleep(0.15)
    return [json.loads(line) for line in target.read_text(encoding="utf8").splitlines() if line.strip()]


def vietnamese_groups(entry: dict) -> list[dict]:
    items = list(entry.get("translations") or [])
    for sense in entry.get("senses") or []:
        items += sense.get("translations") or []
    groups: dict[str, list[str]] = {}
    for item in items:
        if item.get("lang_code") != "vi" and item.get("code") != "vi":
            continue
        word = (item.get("word") or "").strip()
        tags = set(item.get("tags") or [])
        if not word or len(word) > 40 or not LATIN.match(word) or tags & {"obsolete", "archaic", "rare", "dated"}:
            continue
        group = groups.setdefault(item.get("sense") or "", [])
        # Wiktionary writes alternatives as "anh or anh trai"; keep them as separate words, and
        # drop a bracket left unbalanced by the extraction ("tập)").
        for part in word.split(" or "):
            part = part.strip()
            if part.count("(") != part.count(")"):
                part = part.replace("(", "").replace(")", "").strip()
            if part and part not in group:
                group.append(part)
    return [{"sense": sense, "words": words[:4]} for sense, words in groups.items() if words]


def learner_ipa(ipa: str) -> str:
    """Dictionary-style IPA: slashes, no tie bars, aspiration or non-syllabic marks."""
    ipa = ipa.strip()
    phonemic = re.match(r"/[^/]+/", ipa)
    if phonemic:
        ipa = phonemic.group(0)
    elif ipa.startswith("["):
        ipa = "/" + ipa[1:ipa.index("]")] + "/"
    elif ipa.startswith("/"):
        # A few Wiktionary entries drop the closing slash.
        ipa = "/" + ipa[1:].split(",")[0].strip() + "/"
    for mark in ("\u0361", "\u035c", "\u032f", "\u02b0", "\u031e", "\u031d", "\u0320", "\u031a", "()"):
        ipa = ipa.replace(mark, "")
    # Learner dictionaries write /r/ and a plain /l/ rather than Wiktionary's narrower [ɹ] and dark [ɫ].
    return ipa.replace("ɹ", "r").replace("ɫ", "l").replace("ᵿ", "ʊ").replace("ä", "a")


def pick_ipa(entry: dict) -> tuple[str | None, str | None]:
    sounds = [sound for sound in entry.get("sounds") or [] if (sound.get("ipa") or " ")[0] in "/["]
    def first(tags, phonemic=True):
        for sound in sounds:
            if sound["ipa"].startswith("/") == phonemic and set(sound.get("tags") or []) & set(tags):
                return learner_ipa(sound["ipa"])
        return None
    # Received Pronunciation first; a bare "UK" tag often marks a regional accent, so it comes last.
    rp = first(["Received-Pronunciation"]) or first(["Received-Pronunciation"], phonemic=False)
    us = first(["General-American"]) or first(["General-American"], phonemic=False) or first(["US"])
    return rp or us or first(["UK"]), us


def main() -> None:
    IPA_DICT.update(load_ipa_dict())
    ranked: dict[str, list[tuple[float, str, str, str]]] = {level: [] for level in LEVELS}
    seen: set[tuple[str, str]] = set()
    for headword, pos, level, source in candidates():
        if level not in LEVELS or pos not in POS_MAP or not re.fullmatch(r"[a-z]+(?:-[a-z]+)?", headword) or (pos == "adverb" and headword in FUNCTION_ADVERBS):
            continue
        if (headword, level) in seen:
            continue
        seen.add((headword, level))
        ranked[level].append((zipf_frequency(headword, "en"), headword, pos, source))
    every = [headword for level in LEVELS for _, headword, _, _ in sorted(ranked[level], reverse=True)]
    # Fetch in parallel (six at a time); the loop below then reads the cache.
    with ThreadPoolExecutor(max_workers=6) as pool:
        for index, _ in enumerate(pool.map(kaikki, every), start=1):
            if index % 500 == 0:
                print(f"  fetched {index}/{len(every)}", flush=True)
    out: list[dict] = []
    for level in LEVELS:
        kept = translated = 0
        for zipf, headword, pos, source in sorted(ranked[level], reverse=True):
            entries = [entry for entry in kaikki(headword) if entry.get("pos") == POS_MAP[pos] and entry.get("word") == headword]
            if not entries:
                continue
            entry, groups = next(((entry, vietnamese_groups(entry)) for entry in entries if vietnamese_groups(entry)), (entries[0], []))
            ipa, ipa_us = pick_ipa(entry)
            ipa_source = IPA_SOURCES["wiktionary"]
            if not ipa and headword in IPA_DICT:
                ipa, ipa_us, ipa_source = IPA_DICT[headword], None, IPA_SOURCES["ipa-dict"]
            if not ipa:
                continue
            gloss = next((g for s in entry.get("senses") or [] for g in s.get("glosses") or []), "")
            out.append({"headword": headword, "pos": pos, "level": level, "zipf": zipf, "ipa": ipa, "ipaUs": ipa_us, "ipaSource": ipa_source, "senseGroups": groups, "gloss": gloss, "levelSource": LEVEL_SOURCES[source]})
            kept += 1
            translated += bool(groups)
        print(f"{level}: {kept} candidates with IPA, {translated} with a Vietnamese translation", flush=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False) + "\n", encoding="utf8")
    print(f"wrote {len(out)} candidates to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
