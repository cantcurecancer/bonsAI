"""Title: Async task teardown

Purpose: Cancel a background asyncio task and wait for it to actually stop.
Used for: main.py — plugin unload and Clear-all-plugin-data, which tear down five long-lived tasks.
Solves: One correct version of cancel-then-await-then-swallow, instead of five hand-written copies.
Does not: Own the tasks, the locks, or the state each caller resets afterwards — those stay on Plugin.
"""

import asyncio
from typing import Any, Optional


async def cancel_and_await(task: Optional[Any]) -> bool:
    """Cancel `task` and wait for it to finish. Returns True if a cancel was actually issued.

    Awaiting after cancelling is the part that is easy to get wrong and easy to skip: without it
    the coroutine may not have reached its `finally` blocks by the time the caller resets the
    state the task is still writing to. `CancelledError` from the awaited task is expected and
    swallowed — it means the cancel worked.

    A `None` or already-finished task is a no-op, so callers do not need to guard first.
    """
    if task is None or task.done():
        return False
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    return True
