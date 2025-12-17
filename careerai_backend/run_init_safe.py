
import logging
logging.disable(logging.CRITICAL)  # Disable all logging
import sys
import traceback

try:
    print("STARTING_INIT_DB")
    import init_db
    init_db.init_db()
    print("FINISHED_INIT_DB")
except Exception:
    with open("traceback.txt", "w") as f:
        traceback.print_exc(file=f)
    print("ERROR_OCCURRED")
