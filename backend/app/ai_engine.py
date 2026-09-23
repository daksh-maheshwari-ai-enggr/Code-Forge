import re
import math
from typing import Dict, List, Any, Tuple

# ==============================================================================
# AI CONTENT MODERATION ENGINE
# Categories: Spam, Toxicity, Hate Speech, Inappropriate, Suspicious Links, PII
# ==============================================================================

# 1. SPAM PATTERNS & DICTIONARY
SPAM_KEYWORDS = [
    "free crypto", "crypto airdrop", "guaranteed profit", "guaranteed return",
    "100% risk free", "act now", "limited time offer", "congratulations you won",
    "winner selected", "claim your prize", "make money fast", "work from home $",
    "wire transfer", "western union", "click here to claim", "exclusive deal",
    "cheap meds", "buy viagra", "casino bonus", "double your bitcoin", "telegram me @",
    "whatsapp me at", "dm for investment", "passive income opportunity", "no investment needed",
    "100x gem", "moonshot token", "presale bonus", "subscribe and win", "free bitcoin",
    "bitcoin giveaway", "crypto giveaway", "free giveaway", "claim now"
]

# 2. TOXICITY PATTERNS & DICTIONARY
TOXIC_TERMS = {
    "severe": [
        "kill yourself", "kys", "i hope you die", "go die", "choke and die",
        "i will murder you", "slit your throat", "beat the shit out of you",
        "break your neck", "shoot you", "put a bullet in", "burn in hell",
        "worthless trash", "waste of oxygen", "scum of the earth", "disgusting pig"
    ],
    "medium": [
        "shut the fuck up", "stfu", "fuck you", "fuck off", "motherfucker",
        "bitch", "bastard", "asshole", "dipshit", "piece of shit", "dickhead",
        "idiot", "moron", "retard", "pathetic loser", "ugly freak"
    ],
    "mild": [
        "stupid", "dumb", "clown", "garbage", "trash", "crap", "sucks",
        "annoying", "hate you", "loser", "shut up", "get lost"
    ]
}

# 3. HATE SPEECH PATTERNS
HATE_SPEECH_KEYWORDS = [
    # Racial & ethnic slurs / dehumanizing terms (patterns obfuscated/generalized for robust detection)
    "subhuman", "mongrel", "racial purity", "white supremacy", "ethnic cleansing",
    "send them back to their country", "all jews are", "all muslims are", "all blacks are",
    "all christians are", "inferior race", "genetic trash", "terrorist religion",
    "nigger", "nigga", "faggot", "dyke", "tranny", "kike", "spic", "chink", "wetback",
    "gook", "towelhead", "raghead", "abomination against nature", "filthy immigrants",
    "eradicate these people", "scourge on humanity"
]

# 4. INAPPROPRIATE / NSFW / ILLEGAL CONTENT
INAPPROPRIATE_KEYWORDS = [
    "cp link", "child porn", "underage sex", "loli hentai", "nonconsensual",
    "snuff video", "torture footage", "beheading", "suicide instruction",
    "how to hang yourself", "how to overdose", "buy fentanyl", "buy oxycodone online",
    "buy stolen cc", "darknet market vendor", "carding dump", "ghost gun blueprint",
    "homemade explosive", "bomb recipe", "hardcore porn", "xxx live cams",
    "escort service booking", "incest sex", "rape fantasy"
]

# 5. SUSPICIOUS LINKS & PHISHING
SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".click", ".buzz", ".club", ".work", ".gq", ".cf",
    ".ml", ".tk", ".ru", ".rest", ".cam", ".zip", ".mov", ".country", ".stream"
]

URL_SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "buff.ly", "adf.ly", "shorte.st", "cutt.ly", "rb.gy"
]

PHISHING_PATH_PATTERNS = [
    r"login[-_.]?verify", r"account[-_.]?update", r"security[-_.]?alert",
    r"wallet[-_.]?connect", r"auth[-_.]?portal", r"paypal[-_.]?security",
    r"bank[-_.]?confirm", r"crypto[-_.]?airdrop", r"metamask[-_.]?sync",
    r"apple[-_.]?support[-_.]?id", r"claim[-_.]?reward"
]

# 6. PII REGEXES
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
PHONE_REGEX = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
SSN_REGEX = re.compile(r'\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b')
CREDIT_CARD_REGEX = re.compile(r'\b(?:\d{4}[-\s]?){3}\d{4}\b')
IPV4_REGEX = re.compile(r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b')
URL_REGEX = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')

def luhn_checksum(card_number_str: str) -> bool:
    """Validates credit card number with standard Luhn algorithm."""
    digits = [int(c) for c in card_number_str if c.isdigit()]
    if len(digits) not in [13, 14, 15, 16, 19]:
        return False
    checksum = 0
    reverse_digits = digits[::-1]
    for i, d in enumerate(reverse_digits):
        if i % 2 == 1:
            doubled = d * 2
            checksum += doubled - 9 if doubled > 9 else doubled
        else:
            checksum += d
    return checksum % 10 == 0


class AIModerationEngine:
    """Enterprise AI Content Moderation & Risk Scoring Engine."""

    def __init__(self):
        pass

    def detect_spam(self, text: str) -> Tuple[float, List[Dict[str, Any]]]:
        snippets = []
        score = 0.0
        text_lower = text.lower()

        # Keyword matching
        matched_keywords = []
        for kw in SPAM_KEYWORDS:
            if kw in text_lower:
                matched_keywords.append(kw)
                snippets.append({
                    "category": "Spam",
                    "term": kw,
                    "severity": "Medium",
                    "reason": f"Spam trigger phrase detected: '{kw}'"
                })

        if matched_keywords:
            score += min(len(matched_keywords) * 28.0, 75.0)

        # Excessive Capitalization (>40% of alphas)
        letters = [c for c in text if c.isalpha()]
        if len(letters) >= 15:
            upper_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
            if upper_ratio > 0.45:
                score += 25.0
                snippets.append({
                    "category": "Spam",
                    "term": f"{int(upper_ratio * 100)}% Uppercase",
                    "severity": "Low",
                    "reason": "Excessive capitalization indicates shouting/unsolicited promotion"
                })

        # Excessive Punctuation (e.g. !!!!, $$$$, ???)
        if re.search(r'([!$?%*]){3,}', text):
            score += 20.0
            snippets.append({
                "category": "Spam",
                "term": "Punctuation Stacking",
                "severity": "Low",
                "reason": "Excessive repeating punctuation marks"
            })

        # Repeated characters (e.g. freeeee, cliiiick)
        if re.search(r'([a-zA-Z])\1{4,}', text):
            score += 15.0

        # Repeated identical words
        word_repeats = re.findall(r'\b(\w+)\s+\1\s+\1\b', text_lower)
        if word_repeats:
            score += 25.0
            snippets.append({
                "category": "Spam",
                "term": f"Repeated '{word_repeats[0]}'",
                "severity": "Medium",
                "reason": "Repetitive word flood detected"
            })

        return min(round(score, 1), 100.0), snippets

    def detect_toxicity(self, text: str) -> Tuple[float, List[Dict[str, Any]]]:
        snippets = []
        score = 0.0
        text_lower = text.lower()

        # Severe hostility
        for term in TOXIC_TERMS["severe"]:
            if term in text_lower:
                score += 85.0
                snippets.append({
                    "category": "Toxicity",
                    "term": term,
                    "severity": "High",
                    "reason": f"Severe harassment / threat detected: '{term}'"
                })

        # Medium hostility
        for term in TOXIC_TERMS["medium"]:
            # word boundary matching where feasible
            pattern = rf"\b{re.escape(term)}\b"
            if re.search(pattern, text_lower):
                score += 35.0
                snippets.append({
                    "category": "Toxicity",
                    "term": term,
                    "severity": "Medium",
                    "reason": f"Abusive / toxic language detected: '{term}'"
                })

        # Mild hostility
        for term in TOXIC_TERMS["mild"]:
            pattern = rf"\b{re.escape(term)}\b"
            if re.search(pattern, text_lower):
                score += 12.0
                snippets.append({
                    "category": "Toxicity",
                    "term": term,
                    "severity": "Low",
                    "reason": f"Potentially uncivil remark: '{term}'"
                })

        return min(round(score, 1), 100.0), snippets

    def detect_hate_speech(self, text: str) -> Tuple[float, List[Dict[str, Any]]]:
        snippets = []
        score = 0.0
        text_lower = text.lower()

        for phrase in HATE_SPEECH_KEYWORDS:
            pattern = rf"\b{re.escape(phrase)}\b"
            if re.search(pattern, text_lower):
                score += 90.0
                snippets.append({
                    "category": "Hate Speech",
                    "term": phrase,
                    "severity": "Critical",
                    "reason": f"Discriminatory hate speech / slur targeting protected group: '{phrase}'"
                })

        return min(round(score, 1), 100.0), snippets

    def detect_inappropriate(self, text: str) -> Tuple[float, List[Dict[str, Any]]]:
        snippets = []
        score = 0.0
        text_lower = text.lower()

        for phrase in INAPPROPRIATE_KEYWORDS:
            pattern = rf"\b{re.escape(phrase)}\b"
            if re.search(pattern, text_lower):
                score += 88.0
                snippets.append({
                    "category": "Inappropriate Content",
                    "term": phrase,
                    "severity": "Critical",
                    "reason": f"Extreme NSFW / illicit / dangerous content trigger: '{phrase}'"
                })

        return min(round(score, 1), 100.0), snippets

    def detect_suspicious_links(self, text: str) -> Tuple[float, List[Dict[str, Any]]]:
        snippets = []
        score = 0.0
        urls = URL_REGEX.findall(text)

        for raw_url in urls:
            url_clean = raw_url.strip(".,()[]'\"")
            url_lower = url_clean.lower()

            # 1. Check URL shorteners
            for shortener in URL_SHORTENERS:
                if shortener in url_lower:
                    score += 45.0
                    snippets.append({
                        "category": "Suspicious Links",
                        "term": url_clean,
                        "severity": "Medium",
                        "reason": f"Obfuscated link via URL shortener ({shortener})"
                    })

            # 2. Check Suspicious TLDs
            for tld in SUSPICIOUS_TLDS:
                if tld in url_lower:
                    score += 55.0
                    snippets.append({
                        "category": "Suspicious Links",
                        "term": url_clean,
                        "severity": "High",
                        "reason": f"High-risk spam/malware domain extension ({tld})"
                    })

            # 3. Check Raw IP in URL
            if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url_lower):
                score += 70.0
                snippets.append({
                    "category": "Suspicious Links",
                    "term": url_clean,
                    "severity": "High",
                    "reason": "Direct IP-based URL detected (common phishing vector)"
                })

            # 4. Check Phishing URI paths
            for phish_pat in PHISHING_PATH_PATTERNS:
                if re.search(phish_pat, url_lower):
                    score += 80.0
                    snippets.append({
                        "category": "Suspicious Links",
                        "term": url_clean,
                        "severity": "Critical",
                        "reason": f"Deceptive credential-harvesting phishing path pattern ({phish_pat})"
                    })

        # Excessive link density (> 3 links in short text)
        if len(urls) >= 3 and len(text) < 300:
            score += 35.0
            snippets.append({
                "category": "Suspicious Links",
                "term": f"{len(urls)} links present",
                "severity": "Medium",
                "reason": "Excessive link density in short content"
            })

        return min(round(score, 1), 100.0), snippets

    def detect_pii(self, text: str) -> Tuple[float, List[Dict[str, Any]]]:
        snippets = []
        score = 0.0

        # 1. Emails
        emails = EMAIL_REGEX.findall(text)
        for email in emails:
            score += 45.0
            snippets.append({
                "category": "PII",
                "term": email,
                "severity": "Medium",
                "reason": "Personal email address exposed"
            })

        # 2. Phone Numbers
        phones = PHONE_REGEX.findall(text)
        for phone in phones:
            cleaned_phone = re.sub(r'\D', '', phone)
            if 10 <= len(cleaned_phone) <= 12:
                score += 50.0
                snippets.append({
                    "category": "PII",
                    "term": phone,
                    "severity": "Medium",
                    "reason": "Direct telephone number exposed"
                })

        # 3. Social Security Numbers (SSN)
        ssns = SSN_REGEX.findall(text)
        for ssn in ssns:
            score += 85.0
            snippets.append({
                "category": "PII",
                "term": ssn,
                "severity": "Critical",
                "reason": "Social Security Number (SSN) detected"
            })

        # 4. Credit Cards
        potential_cards = CREDIT_CARD_REGEX.findall(text)
        for card in potential_cards:
            if luhn_checksum(card):
                score += 90.0
                snippets.append({
                    "category": "PII",
                    "term": card,
                    "severity": "Critical",
                    "reason": "Valid Credit/Debit Card Number (Luhn verified) detected"
                })

        # 5. IP Addresses
        ips = IPV4_REGEX.findall(text)
        for ip in ips:
            # exclude localhost
            if not ip.startswith("127.") and not ip.startswith("0."):
                score += 25.0
                snippets.append({
                    "category": "PII",
                    "term": ip,
                    "severity": "Low",
                    "reason": "Public IPv4 address exposed"
                })

        return min(round(score, 1), 100.0), snippets

    def analyze(self, text: str) -> Dict[str, Any]:
        """Performs full AI moderation analysis across all 6 categories and computes composite risk."""
        if not text or not text.strip():
            return {
                "spam_score": 0.0,
                "toxicity_score": 0.0,
                "hate_speech_score": 0.0,
                "inappropriate_score": 0.0,
                "suspicious_link_score": 0.0,
                "pii_score": 0.0,
                "overall_risk_score": 0.0,
                "risk_level": "LOW",
                "detected_categories": [],
                "flagged_snippets": [],
                "ai_decision": "AUTO_APPROVE",
                "explanation": "Content is empty or whitespace."
            }

        # 1. Run all 6 detection modules
        spam_score, spam_snips = self.detect_spam(text)
        toxicity_score, tox_snips = self.detect_toxicity(text)
        hate_speech_score, hate_snips = self.detect_hate_speech(text)
        inappropriate_score, inapp_snips = self.detect_inappropriate(text)
        suspicious_link_score, link_snips = self.detect_suspicious_links(text)
        pii_score, pii_snips = self.detect_pii(text)

        all_snippets = spam_snips + tox_snips + hate_snips + inapp_snips + link_snips + pii_snips

        # 2. Collect detected categories
        detected = []
        if spam_score >= 35.0: detected.append("Spam")
        if toxicity_score >= 35.0: detected.append("Toxicity")
        if hate_speech_score >= 35.0: detected.append("Hate Speech")
        if inappropriate_score >= 35.0: detected.append("Inappropriate Content")
        if suspicious_link_score >= 35.0: detected.append("Suspicious Links")
        if pii_score >= 35.0: detected.append("PII Exposure")

        # 3. Weighted composite formula
        # Weights: Hate Speech (0.25), Toxicity (0.20), Inappropriate (0.20), PII (0.15), Links (0.10), Spam (0.10)
        base_risk = (
            hate_speech_score * 0.25 +
            toxicity_score * 0.20 +
            inappropriate_score * 0.20 +
            pii_score * 0.15 +
            suspicious_link_score * 0.10 +
            spam_score * 0.10
        )

        # High-severity floor: If any high-danger category is triggered, elevate overall risk
        max_critical_category = max(hate_speech_score, inappropriate_score, toxicity_score, pii_score, suspicious_link_score)
        if max_critical_category >= 80.0:
            overall_risk = max(base_risk, max_critical_category * 0.92)
        elif max_critical_category >= 50.0:
            overall_risk = max(base_risk, max_critical_category * 0.75)
        elif spam_score >= 70.0:
            # High spam elevates to at least Medium risk
            overall_risk = max(base_risk, spam_score * 0.65)
        elif spam_score >= 40.0:
            overall_risk = max(base_risk, spam_score * 0.45)
        else:
            overall_risk = base_risk

        overall_risk = min(round(overall_risk, 1), 100.0)

        # 4. Classify Risk Level & Recommendation
        if overall_risk >= 75.0:
            risk_level = "HIGH"
            ai_decision = "AUTO_BLOCK"
            explanation = f"Critical risk detected ({overall_risk}/100) due to severe violations in: {', '.join(detected) if detected else 'Content Analysis'}."
        elif overall_risk >= 35.0:
            risk_level = "MEDIUM"
            ai_decision = "SEND_TO_REVIEW"
            explanation = f"Moderate risk detected ({overall_risk}/100). Content queued for human moderator inspection. Flagged categories: {', '.join(detected)}."
        else:
            risk_level = "LOW"
            ai_decision = "AUTO_APPROVE"
            explanation = f"Content evaluated safe with low risk ({overall_risk}/100). No significant violations found."

        return {
            "spam_score": spam_score,
            "toxicity_score": toxicity_score,
            "hate_speech_score": hate_speech_score,
            "inappropriate_score": inappropriate_score,
            "suspicious_link_score": suspicious_link_score,
            "pii_score": pii_score,
            "overall_risk_score": overall_risk,
            "risk_level": risk_level,
            "detected_categories": detected,
            "flagged_snippets": all_snippets,
            "ai_decision": ai_decision,
            "explanation": explanation
        }


# Singleton engine instance
engine = AIModerationEngine()
