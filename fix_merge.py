with open("scripts/reconstituer_voyage.py", "r") as f:
    content = f.read()

content = content.replace("<<<<<<< HEAD\n        \n=======\n\n>>>>>>> pr552", "")
content = content.replace("<<<<<<< HEAD\n    \n=======\n\n>>>>>>> pr552", "")

with open("scripts/reconstituer_voyage.py", "w") as f:
    f.write(content)
