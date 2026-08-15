"""Title: TLS certificate fallback for urllib

Purpose: Retry a urllib.request.urlopen() HTTPS call with an explicit CA bundle when the
interpreter's default SSL context has no root certificates loaded.
Used for: every module that calls urllib.request.urlopen() against an external https host
(RAG corpus download, Pull Models overlay, Ollama installer/registry, Whisper model
download, Steam VAC lookups).
Solves: CERTIFICATE_VERIFY_FAILED: unable to get local issuer certificate — observed live
on a Deck running Decky Loader's PyInstaller-frozen Python (SteamOS holo 3.8.25). The
plugin backend runs inside that frozen interpreter, confirmed via /proc/<pid>/environ: no
SSL_CERT_FILE, no SSL_CERT_DIR, only a PyInstaller LD_LIBRARY_PATH pointing at its own
extracted /tmp/_MEI* bundle. That bundled OpenSSL cannot find root certificates even though
the OS has a perfectly good bundle on disk at /etc/ssl/certs/ca-certificates.crt — a plain
`python3` process on the same Deck is unaffected, since it resolves the OS path by default.
Does not: touch http:// (non-TLS) calls — those are unaffected (Ollama/LAN daemons).
"""

from __future__ import annotations

import os
import ssl
import urllib.error
import urllib.request
from typing import Any, Optional

# Common Linux CA bundle locations, checked in order. SteamOS/Arch/Debian/Ubuntu ship the
# first; Fedora/RHEL the second; the third is a common symlink target on several distros
# (it is what SteamOS itself resolves to by default, confirmed on-device).
_FALLBACK_CAFILE_CANDIDATES = (
    "/etc/ssl/certs/ca-certificates.crt",
    "/etc/pki/tls/certs/ca-bundle.crt",
    "/etc/ssl/cert.pem",
)


def _fallback_ssl_context() -> Optional[ssl.SSLContext]:
    for candidate in _FALLBACK_CAFILE_CANDIDATES:
        if os.path.isfile(candidate):
            try:
                return ssl.create_default_context(cafile=candidate)
            except (ssl.SSLError, OSError):
                # OSError (e.g. FileNotFoundError) covers a candidate that stopped existing
                # between the isfile() check and load — ssl.create_default_context(cafile=)
                # opens and reads the file immediately, it does not defer to first use.
                continue
    return None


def _is_cert_verification_failure(exc: BaseException) -> bool:
    # urllib.request.AbstractHTTPHandler.do_open() catches every OSError the socket layer
    # raises — ssl.SSLCertVerificationError is a subclass of ssl.SSLError is a subclass of
    # OSError — and re-raises it as `urllib.error.URLError(err)`, with the original
    # exception preserved as `.reason`. So the raw SSLCertVerificationError never actually
    # escapes a real urlopen() call; only URLError does, wrapping it. Confirmed on-device:
    # the first version of this function caught ssl.SSLCertVerificationError directly and
    # never fired — the live traceback was `URLError: <urlopen error [SSL:
    # CERTIFICATE_VERIFY_FAILED] ...>`. Checking both here is deliberate: URLError is what
    # a real urlopen() raises, direct SSLCertVerificationError is kept as a defensive
    # fallback in case a future Python version or a non-http:// caller raises it unwrapped.
    if isinstance(exc, ssl.SSLCertVerificationError):
        return True
    if isinstance(exc, urllib.error.URLError) and isinstance(exc.reason, ssl.SSLCertVerificationError):
        return True
    return False


def urlopen_with_ca_fallback(request: urllib.request.Request, *, timeout: float) -> Any:
    """Drop-in replacement for urllib.request.urlopen(request, timeout=timeout).

    Tries the interpreter's default SSL context first — correct and sufficient on every
    normal install. Only on a certificate-verification failure does it retry once against a
    known system CA bundle path. A Deck (or any Linux host) with none of the candidate paths,
    or any other kind of failure (timeout, connection refused, HTTP error), re-raises the
    original exception unchanged rather than silently disabling verification or masking an
    unrelated error.
    """
    try:
        return urllib.request.urlopen(request, timeout=timeout)
    except Exception as exc:
        if not _is_cert_verification_failure(exc):
            raise
        ctx = _fallback_ssl_context()
        if ctx is None:
            raise
        return urllib.request.urlopen(request, timeout=timeout, context=ctx)
