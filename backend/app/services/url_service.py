"""
URL Analysis Service
---------------------
Supports two modes:

  MOCK MODE  (USE_MOCK_URL=true):
    Pattern-based URL scoring. Returns realistic canned results based on
    URL heuristics (domain age patterns, HTTPS presence, suspicious TLDs).
    No external API calls. Works offline.

  REAL MODE  (USE_MOCK_URL=false):
    - WHOIS lookup (domain age, registrar info)
    - SSL certificate validation
    - Google Safe Browsing API
    - VirusTotal API reputation check

Both modes return URLResult with the same schema.
"""
import re
import ssl
import socket
import logging
import hashlib
from urllib.parse import urlparse
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)


# ── Data Classes ──────────────────────────────────────────────────────────────

@dataclass
class URLFactor:
    factor: str
    weight: float       # 0.0–1.0 magnitude of concern
    description: str
    is_red_flag: bool
    category: str


@dataclass
class URLResult:
    score: float        # 0–100 risk score
    factors: list[URLFactor] = field(default_factory=list)
    domain_age_days: Optional[int] = None
    ssl_valid: Optional[bool] = None
    ssl_issuer: Optional[str] = None
    safe_browsing_clean: Optional[bool] = None
    virustotal_detections: Optional[int] = None


# ── Mock URL Scoring ──────────────────────────────────────────────────────────

# Suspicious TLDs often used in scam sites
SUSPICIOUS_TLDS = {
    ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".pw", ".cc",
    ".top", ".click", ".online", ".site", ".info", ".biz",
}

# Free hosting platforms sometimes abused for scam pages
SUSPICIOUS_HOSTS = {
    "wix.com", "weebly.com", "wordpress.com", "blogspot.com",
    "tripod.com", "jimdo.com", "yola.com", "webnode.com",
}

SCAM_URL_KEYWORDS = [
    "kittens4free", "freekitten", "adoptme", "petscam",
    "cheapcat", "freecat", "bestcat", "purekitten",
]

TRUSTED_INDICATORS = [
    "aspca", "petsmart", "petfinder", "adoptapet", "bestfriends",
    "humanesociety", "rspca", "cats.org", "catrescue",
]


def _mock_url_score(url: str) -> URLResult:
    """Pattern-based mock URL scorer."""
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()
    tld = "." + hostname.split(".")[-1] if "." in hostname else ""
    scheme = parsed.scheme.lower()
    url_lower = url.lower()

    factors: list[URLFactor] = []
    raw_score = 0.0

    # ── HTTPS check ──────────────────────────────────────────────────────
    if scheme != "https":
        factors.append(URLFactor(
            factor="No HTTPS Encryption",
            weight=0.80,
            description="Site uses plain HTTP — no SSL/TLS encryption. Legitimate adoption sites always use HTTPS.",
            is_red_flag=True,
            category="ssl",
        ))
        raw_score += 0.80
        ssl_valid = False
    else:
        factors.append(URLFactor(
            factor="HTTPS Enabled",
            weight=0.50,
            description="Site uses HTTPS encryption with a valid SSL certificate.",
            is_red_flag=False,
            category="ssl",
        ))
        ssl_valid = True

    # ── Suspicious TLD ────────────────────────────────────────────────────
    if tld in SUSPICIOUS_TLDS:
        factors.append(URLFactor(
            factor="High-Risk Domain Extension",
            weight=0.75,
            description=f"Domain uses '{tld}' — a top-level domain frequently associated with spam and scam sites.",
            is_red_flag=True,
            category="domain",
        ))
        raw_score += 0.75

    # ── Suspicious hosting ────────────────────────────────────────────────
    for host in SUSPICIOUS_HOSTS:
        if host in hostname:
            factors.append(URLFactor(
                factor="Free Website Builder",
                weight=0.55,
                description=f"Hosted on {host}, a free website builder. Scam sites frequently use these to quickly create disposable pages.",
                is_red_flag=True,
                category="domain",
            ))
            raw_score += 0.55
            break

    # ── Scam URL keywords ─────────────────────────────────────────────────
    for keyword in SCAM_URL_KEYWORDS:
        if keyword in url_lower.replace("-", "").replace("_", ""):
            factors.append(URLFactor(
                factor="Suspicious URL Keywords",
                weight=0.70,
                description=f"URL contains keyword patterns commonly found in cat adoption scam domains.",
                is_red_flag=True,
                category="domain",
            ))
            raw_score += 0.70
            break

    # ── Trusted site indicators ────────────────────────────────────────────
    for indicator in TRUSTED_INDICATORS:
        if indicator in hostname:
            factors.append(URLFactor(
                factor="Recognized Rescue Organization",
                weight=0.90,
                description="Domain matches a known legitimate animal rescue or adoption platform.",
                is_red_flag=False,
                category="reputation",
            ))
            raw_score -= 0.90
            break

    # ── Very new domain pattern (mock: random-looking domains) ────────────
    # Heuristic: domains with lots of numbers or very long substrings are suspicious
    domain_name = hostname.replace("www.", "").split(".")[0]
    digit_ratio = sum(c.isdigit() for c in domain_name) / max(len(domain_name), 1)
    if digit_ratio > 0.3 or len(domain_name) > 20:
        factors.append(URLFactor(
            factor="Suspicious Domain Pattern",
            weight=0.65,
            description="Domain name contains unusual patterns (high digit ratio or excessive length) consistent with auto-generated scam domains.",
            is_red_flag=True,
            category="domain",
        ))
        raw_score += 0.65

    # Simulated domain age (mock)
    # Use a hash of the domain to get consistent but varied mock results
    domain_hash = int(hashlib.md5(hostname.encode()).hexdigest(), 16)
    mock_age_days = (domain_hash % 2000) + 1  # 1–2000 days

    if mock_age_days < 90:
        factors.append(URLFactor(
            factor="Very New Domain",
            weight=0.85,
            description=f"Domain appears to be less than 90 days old (est. {mock_age_days} days). Scam sites are often created shortly before campaigns.",
            is_red_flag=True,
            category="domain",
        ))
        raw_score += 0.85
    elif mock_age_days < 180:
        factors.append(URLFactor(
            factor="Recently Registered Domain",
            weight=0.45,
            description=f"Domain is relatively new (est. {mock_age_days} days). Exercise caution with recently registered sites.",
            is_red_flag=True,
            category="domain",
        ))
        raw_score += 0.45
    else:
        factors.append(URLFactor(
            factor="Established Domain",
            weight=0.40,
            description=f"Domain has been registered for over 6 months (est. {mock_age_days} days) — a positive trust signal.",
            is_red_flag=False,
            category="domain",
        ))

    # ── Normalize to 0–100 ────────────────────────────────────────────────
    MAX_RAW = 4.0
    normalized = max(5.0, min(100.0, (raw_score / MAX_RAW) * 100))

    # Sort factors: red flags first by weight, trust signals last
    factors.sort(key=lambda f: (-f.weight if f.is_red_flag else f.weight))

    return URLResult(
        score=round(normalized, 2),
        factors=factors,
        domain_age_days=mock_age_days,
        ssl_valid=ssl_valid,
        ssl_issuer="Mock CA" if ssl_valid else None,
        safe_browsing_clean=True,   # Mock: assume clean
        virustotal_detections=0,    # Mock: 0 detections
    )


# ── Real URL Analysis ─────────────────────────────────────────────────────────

async def _check_ssl(hostname: str) -> tuple[bool, Optional[str]]:
    """Check SSL certificate validity and issuer."""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                issuer = dict(x[0] for x in cert.get("issuer", []))
                issuer_name = issuer.get("organizationName", "Unknown")
                return True, issuer_name
    except Exception as e:
        logger.debug(f"SSL check failed for {hostname}: {e}")
        return False, None


async def _check_whois(hostname: str) -> Optional[int]:
    """Return domain age in days via WHOIS lookup."""
    try:
        import whois
        domain_info = whois.whois(hostname)
        creation = domain_info.creation_date
        if isinstance(creation, list):
            creation = creation[0]
        if creation:
            age = (datetime.now(timezone.utc) - creation.replace(tzinfo=timezone.utc)).days
            return max(0, age)
    except Exception as e:
        logger.debug(f"WHOIS failed for {hostname}: {e}")
    return None


async def _check_safe_browsing(url: str, api_key: str) -> bool:
    """Google Safe Browsing API check. Returns True if clean."""
    endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
    payload = {
        "client": {"clientId": "scampurr-ai", "clientVersion": "1.0.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(endpoint, json=payload)
            data = response.json()
            return len(data.get("matches", [])) == 0
    except Exception as e:
        logger.warning(f"Safe Browsing check failed: {e}")
        return True  # Assume clean on failure


async def _check_virustotal(url: str, api_key: str) -> int:
    """VirusTotal URL scan. Returns number of detections."""
    import base64
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    headers = {"x-apikey": api_key}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/urls/{url_id}",
                headers=headers,
            )
            if resp.status_code == 200:
                data = resp.json()
                stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                return stats.get("malicious", 0) + stats.get("suspicious", 0)
    except Exception as e:
        logger.warning(f"VirusTotal check failed: {e}")
    return 0


async def _real_url_score(url: str) -> URLResult:
    """Full real URL analysis using WHOIS, SSL, Safe Browsing, VirusTotal."""
    from app.config import get_settings
    settings = get_settings()

    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    factors: list[URLFactor] = []
    raw_score = 0.0

    # SSL check
    ssl_valid, ssl_issuer = await _check_ssl(hostname)
    if not ssl_valid:
        factors.append(URLFactor(
            factor="No HTTPS / Invalid SSL Certificate",
            weight=0.80,
            description="SSL certificate is missing or invalid. Legitimate sites always use valid HTTPS.",
            is_red_flag=True,
            category="ssl",
        ))
        raw_score += 0.80
    else:
        factors.append(URLFactor(
            factor="Valid SSL Certificate",
            weight=0.50,
            description=f"Valid SSL certificate issued by {ssl_issuer}.",
            is_red_flag=False,
            category="ssl",
        ))

    # WHOIS domain age
    domain_age_days = await _check_whois(hostname)
    if domain_age_days is not None:
        if domain_age_days < 90:
            factors.append(URLFactor(
                factor="Very New Domain",
                weight=0.85,
                description=f"Domain is only {domain_age_days} days old. Scam sites are often newly registered.",
                is_red_flag=True,
                category="domain",
            ))
            raw_score += 0.85
        elif domain_age_days < 180:
            factors.append(URLFactor(
                factor="Recently Registered Domain",
                weight=0.45,
                description=f"Domain is {domain_age_days} days old — relatively new.",
                is_red_flag=True,
                category="domain",
            ))
            raw_score += 0.45
        else:
            factors.append(URLFactor(
                factor="Established Domain",
                weight=0.40,
                description=f"Domain is {domain_age_days} days old — an established presence.",
                is_red_flag=False,
                category="domain",
            ))

    # Safe Browsing
    safe_browsing_clean = True
    if settings.GOOGLE_SAFE_BROWSING_API_KEY:
        safe_browsing_clean = await _check_safe_browsing(url, settings.GOOGLE_SAFE_BROWSING_API_KEY)
        if not safe_browsing_clean:
            factors.append(URLFactor(
                factor="Google Safe Browsing Flagged",
                weight=0.95,
                description="URL is flagged by Google Safe Browsing as phishing, malware, or social engineering.",
                is_red_flag=True,
                category="reputation",
            ))
            raw_score += 0.95

    # VirusTotal
    virustotal_detections = 0
    if settings.VIRUSTOTAL_API_KEY:
        virustotal_detections = await _check_virustotal(url, settings.VIRUSTOTAL_API_KEY)
        if virustotal_detections > 0:
            weight = min(0.95, 0.50 + (virustotal_detections * 0.05))
            factors.append(URLFactor(
                factor=f"VirusTotal: {virustotal_detections} Detection(s)",
                weight=weight,
                description=f"{virustotal_detections} antivirus engine(s) flagged this URL as malicious or suspicious.",
                is_red_flag=True,
                category="reputation",
            ))
            raw_score += weight

    # Pattern-based additions (from mock scorer)
    mock_result = _mock_url_score(url)
    for f in mock_result.factors:
        if f.category in ("domain",) and f.is_red_flag:
            if not any(ef.factor == f.factor for ef in factors):
                factors.append(f)
                raw_score += f.weight * 0.5

    MAX_RAW = 4.0
    normalized = max(5.0, min(100.0, (raw_score / MAX_RAW) * 100))
    factors.sort(key=lambda f: (-f.weight if f.is_red_flag else f.weight))

    return URLResult(
        score=round(normalized, 2),
        factors=factors,
        domain_age_days=domain_age_days,
        ssl_valid=ssl_valid,
        ssl_issuer=ssl_issuer,
        safe_browsing_clean=safe_browsing_clean,
        virustotal_detections=virustotal_detections,
    )


# ── Public Interface ───────────────────────────────────────────────────────────

async def analyze_url(url: str) -> URLResult:
    """
    Analyze a shelter/listing URL for scam signals.
    Automatically uses mock or real mode based on settings.
    """
    from app.config import get_settings
    settings = get_settings()

    if settings.USE_MOCK_URL:
        return _mock_url_score(url)
    else:
        return await _real_url_score(url)
