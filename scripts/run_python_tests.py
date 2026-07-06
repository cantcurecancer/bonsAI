#!/usr/bin/env python3
"""Run unittest with py_modules on sys.path (matches Decky Loader)."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "py_modules"))

# Unix-only stdlib stubs for Windows dev hosts (main.py → screenshot_media imports pwd).
if "pwd" not in sys.modules:
    import types

    _pwd = types.ModuleType("pwd")
    _pwd.getpwuid = lambda _uid: types.SimpleNamespace(pw_dir="/tmp")
    sys.modules["pwd"] = _pwd

loader = unittest.TestLoader()
suite = loader.discover(str(ROOT / "tests"), pattern="test_*.py")
runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)
sys.exit(0 if result.wasSuccessful() else 1)
