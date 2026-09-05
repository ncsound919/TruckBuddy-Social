import re

def replace_in_file(filepath, old, new):
    try:
        with open(filepath, 'r') as f:
            code = f.read()
        code = code.replace(old, new)
        with open(filepath, 'w') as f:
            f.write(code)
    except FileNotFoundError:
        pass

replace_in_file('src/components/layout/AppHeader.tsx', 'Truckers Social', 'Truck Buddy Network')
replace_in_file('server.ts', 'Truckers Social', 'Truck Buddy Network')
replace_in_file('src/data.ts', 'Truckers Social', 'Truck Buddy Network')

with open('src/App.tsx', 'r') as f:
    app_code = f.read()
app_code = app_code.replace('TRUCKERS<span className="text-amber-500 font-normal">.</span>SOCIAL', 'TRUCK<span className="text-amber-500 font-normal">.</span>BUDDY')
with open('src/App.tsx', 'w') as f:
    f.write(app_code)
