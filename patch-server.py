import re

with open('server.ts', 'r') as f:
    code = f.read()

# Change driver-chat error
code = code.replace("error: err.message", "error: 'Communication failure due to signal loss.'")

# Change route-advisor error
code = code.replace("error: 'Failed to evaluate route safety'", "error: 'Failed to evaluate route safety. Try again later.'")

with open('server.ts', 'w') as f:
    f.write(code)
