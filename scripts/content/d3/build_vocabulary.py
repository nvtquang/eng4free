"""Builds the D3 vocabulary selection from open, attributed sources.

  python scripts/content/d3/build_vocabulary.py

Levels:   Words-CEFR dataset (A1–B2, MIT) and Octanove Vocabulary Profile C1/C2 (CC BY-SA 4.0).
Ranking:  wordfreq Zipf frequency, so each level starts with its most useful words.
Meaning:  Vietnamese translations from English Wiktionary (CC BY-SA 4.0), read through the
          kaikki.org extraction, for the entry whose part of speech matches the level list.
IPA:      Wiktionary pronunciation (Received Pronunciation first, General American kept too).

A word without a sourced Vietnamese translation or Wiktionary IPA is skipped, never filled in
by hand. Wiktionary does not order senses by frequency, so every Vietnamese translation group
is kept; content/packs/d3/vocabulary/sense-choices.json records which group(s) a reviewer chose
for the learner's sense (the words themselves are always Wiktionary's).
Per-word Wiktionary data is cached in .cache/kaikki so reruns work offline.
Writes content/packs/d3/vocabulary/selection.json.
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

ROOT = Path(__file__).resolve().parents[3]
CACHE = ROOT / ".cache"
OUT = ROOT / "content/packs/d3/vocabulary/selection.json"
QUOTAS = {"A1": 140, "A2": 140, "B1": 140, "B2": 140, "C1": 120, "C2": 120}
POS_MAP = {"noun": "noun", "verb": "verb", "adjective": "adj", "adverb": "adv"}
LEVEL_SOURCES = {
    "words-cefr": {"name": "Words-CEFR Dataset", "url": "https://github.com/Maximax67/Words-CEFR-Dataset", "license": "MIT"},
    "octanove": {"name": "Octanove Vocabulary Profile C1/C2 1.0", "url": "https://github.com/openlanguageprofiles/olp-en-cefrj", "license": "CC BY-SA 4.0"},
}
WIKTIONARY_LICENSE = "CC BY-SA 4.0"
LATIN = re.compile(r"^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF'’ ,.\-()]+$")
CHOICES = ROOT / "content/packs/d3/vocabulary/sense-choices.json"
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
        if word not in group:
            group.append(word)
    return [{"sense": sense, "words": words[:4]} for sense, words in groups.items() if words]


def learner_ipa(ipa: str) -> str:
    """Dictionary-style IPA: slashes, no tie bars, aspiration or non-syllabic marks."""
    ipa = ipa.strip()
    phonemic = re.match(r"/[^/]+/", ipa)
    if phonemic:
        ipa = phonemic.group(0)
    elif ipa.startswith("["):
        ipa = "/" + ipa[1:ipa.index("]")] + "/"
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
    choices = json.loads(CHOICES.read_text(encoding="utf8")) if CHOICES.exists() else {}
    ranked: dict[str, list[tuple[float, str, str, str]]] = {level: [] for level in QUOTAS}
    seen: set[tuple[str, str]] = set()
    for headword, pos, level, source in candidates():
        if level not in QUOTAS or pos not in POS_MAP or not re.fullmatch(r"[a-z]+(?:-[a-z]+)?", headword) or (pos == "adverb" and headword in FUNCTION_ADVERBS):
            continue
        if (headword, level) in seen:
            continue
        seen.add((headword, level))
        ranked[level].append((zipf_frequency(headword, "en"), headword, pos, source))
    # Fetch the likely candidates in parallel first (six at a time); the selection loop then reads the cache.
    likely = [headword for level, quota in QUOTAS.items() for _, headword, _, _ in sorted(ranked[level], reverse=True)[: quota * 2]]
    with ThreadPoolExecutor(max_workers=6) as pool:
        for index, _ in enumerate(pool.map(kaikki, likely), start=1):
            if index % 100 == 0:
                print(f"  fetched {index}/{len(likely)}", flush=True)
    selection = []
    used_headwords: set[str] = set()
    for level, quota in QUOTAS.items():
        chosen = 0
        for _, headword, pos, source in sorted(ranked[level], reverse=True):
            if chosen >= quota:
                break
            if headword in used_headwords:
                continue
            entries = [entry for entry in kaikki(headword) if entry.get("pos") == POS_MAP[pos] and entry.get("word") == headword]
            found = next(((entry, vietnamese_groups(entry)) for entry in entries if vietnamese_groups(entry)), None)
            if not found:
                continue
            entry, groups = found
            ipa, ipa_us = pick_ipa(entry)
            if not ipa:
                continue
            key = f"{headword}|{pos}"
            # A reviewer's choice: group indexes (2), single words within a group ("2.1"), or "skip"
            # when Wiktionary has no Vietnamese translation for the sense learners need.
            choice = choices.get(key, [0])
            if choice == "skip":
                continue
            words: list[str] = []
            picked: list[int] = []
            for pick in choice:
                group_index, _, word_index = str(pick).partition(".")
                if not group_index.isdigit() or int(group_index) >= len(groups):
                    raise ValueError(f"{key}: no sense group {pick}")
                group = groups[int(group_index)]
                chosen_words = [group["words"][int(word_index)]] if word_index else group["words"]
                words += [word for word in chosen_words if word not in words]
                if int(group_index) not in picked:
                    picked.append(int(group_index))
            gloss = "; ".join(groups[index]["sense"] for index in picked if groups[index]["sense"]) or next((g for s in entry.get("senses") or [] for g in s.get("glosses") or []), "")
            page = f"https://en.wiktionary.org/wiki/{urllib.parse.quote(headword)}"
            selection.append({
                "headword": headword, "pos": pos, "level": level,
                "ipa": ipa, "ipaUs": ipa_us, "meaningVi": "; ".join(words[:4]), "sense": gloss,
                "senseGroups": groups, "chosenGroups": picked,
                "sources": {
                    "level": LEVEL_SOURCES[source],
                    "meaning": {"name": "English Wiktionary (via kaikki.org)", "url": f"{page}#Translations", "license": WIKTIONARY_LICENSE},
                    "ipa": {"name": "English Wiktionary", "url": f"{page}#Pronunciation", "license": WIKTIONARY_LICENSE},
                },
            })
            used_headwords.add(headword)
            chosen += 1
        print(f"{level}: {chosen}/{quota}", flush=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(selection, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
    print(f"wrote {len(selection)} entries to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
