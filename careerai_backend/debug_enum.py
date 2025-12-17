from models import ApplicationStatus
import sys

print(f"Enum: {ApplicationStatus}")
for member in ApplicationStatus:
    print(f"{member.name} -> {member.value!r}")

try:
    print(f"Attempting to load 'Pending': {ApplicationStatus('Pending')}")
except ValueError as e:
    print(f"Error loading 'Pending': {e}")

try:
    print(f"Attempting to load 'PENDING': {ApplicationStatus('PENDING')}")
except ValueError as e:
    print(f"Error loading 'PENDING': {e}")
