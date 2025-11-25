import py_compile
try:
    py_compile.compile('day-7/dashboard.py', doraise=True)
    print("Syntax OK")
except Exception as e:
    print(f"Syntax Error: {e}")
