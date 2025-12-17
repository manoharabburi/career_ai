from models import ApplicationStatus
import sys

print("--- ENUM DEBUG START ---")
print(f"Enum Name: {ApplicationStatus.__name__}")
for name, member in ApplicationStatus.__members__.items():
    print(f"Member: {name}, Value: '{member.value}'")

print("--- TEST LOADING ---")
try:
    val = ApplicationStatus('Pending')
    print(f"Loaded 'Pending': Success -> {val}")
except ValueError as e:
    print(f"Loaded 'Pending': FAILED -> {e}")

try:
    val = ApplicationStatus('PENDING')
    print(f"Loaded 'PENDING': Success -> {val}")
except ValueError as e:
    print(f"Loaded 'PENDING': FAILED -> {e}")
print("--- ENUM DEBUG END ---")
