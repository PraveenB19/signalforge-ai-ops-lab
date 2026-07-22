# Python Virtual Environment — Daily Reference

> Think of a venv like a Docker container for Python packages.
> Isolated. Disposable. Won't touch your global Python or other projects.

---

## THE MENTAL MODEL

```
Global Python (system)
│
├── Project A/.venv   ← only Project A's packages live here
├── Project B/.venv   ← only Project B's packages live here
└── Project C/.venv   ← only Project C's packages live here
```

Just like each ECS task has its own container image — each project has its own venv.

---

## DAILY WORKFLOW (in order)

### 1. Navigate to your project
```bash
cd ~/your-project
```

### 2. Create the venv (ONE TIME only, per project)
```bash
python3 -m venv .venv
```

### 3. Activate it (EVERY session)
```bash
source .venv/bin/activate          # Mac / Linux
# .venv\Scripts\activate           # Windows
```
Your prompt changes to: `(.venv) user@machine $` ← you're inside now

### 4. Do your work — install, run, test
```bash
pip install requests boto3 pandas   # installs ONLY into this venv
python my_script.py
python -m pytest                    # run tests
```

### 5. Snapshot your dependencies
```bash
pip freeze > requirements.txt       # always do this after installing anything new
```

### 6. Exit when done
```bash
deactivate                          # back to global Python
```

---

## STATUS CHECKS (run these anytime you're confused)

```bash
# Am I in a venv right now?
echo $VIRTUAL_ENV
# empty = NOT in a venv | shows a path = you're inside one

# Where is Python coming from?
which python
which pip

# What Python version?
python --version

# What's installed in current env?
pip list

# Is this pointing to .venv or global?
python -c "import sys; print(sys.prefix)"
```

---

## INSTALL COMMANDS

```bash
pip install <package>               # install one package
pip install requests boto3 pandas   # install multiple
pip install -r requirements.txt     # install everything from a file
pip install --upgrade <package>     # upgrade a package
pip uninstall <package>             # remove a package
```

---

## INSPECTION COMMANDS

```bash
pip list                            # all installed packages
pip show requests                  # info about one specific package
pip freeze                          # all packages with pinned versions
pip freeze > requirements.txt       # save to file
```

---

## RESTORE / SHARE WITH OTHERS

```bash
# On a new machine or new venv:
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt     # restores exact versions
```

---

## RUN YOUR SCRIPT

```bash
# Always activate first, then run
source .venv/bin/activate
python docs/testing_python.py

# Or run directly using venv's python (no activation needed)
.venv/bin/python docs/testing_python.py
```

---

## GITIGNORE — NEVER COMMIT THE VENV FOLDER

Add this to your `.gitignore`:
```
.venv/
__pycache__/
*.pyc
*.pyo
.env
```

Commit `requirements.txt` instead — that's your lockfile (like package.json for Node).

---

## NUKE AND REBUILD (when things go wrong)

```bash
deactivate                          # exit first
rm -rf .venv                        # delete the venv
python3 -m venv .venv               # recreate
source .venv/bin/activate
pip install -r requirements.txt     # reinstall
```

---

## MULTIPLE PYTHON VERSIONS (advanced)

```bash
# Check what Python versions you have
ls /usr/bin/python*
python3 --version
python3.11 --version

# Create venv with a specific version
python3.11 -m venv .venv
```

---

## COMMON MISTAKES & FIXES

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Forgot to activate | `pip install` goes to global | Run `source .venv/bin/activate` |
| Wrong pip | `pip3` installs to wrong place | Use `pip` after activating, not `pip3` |
| ModuleNotFoundError | Package not found at runtime | Activate venv, then `pip install <package>` |
| Committed .venv folder | Huge git repo, OS-specific errors | Delete from git: `git rm -r --cached .venv` |
| Two projects conflict | Package version clash | Each project needs its OWN `.venv` |

---

## QUICK REFERENCE CARD

```
python3 -m venv .venv          # create
source .venv/bin/activate      # activate
echo $VIRTUAL_ENV              # verify
pip install <pkg>              # install
pip freeze > requirements.txt  # save deps
deactivate                     # exit
rm -rf .venv                   # nuke it
```

---

## AWS ANALOGY MAP

| Python venv concept | AWS/DevOps equivalent |
|--------------------|-----------------------|
| `.venv` folder | Container image layer |
| `activate` | `docker exec -it container bash` |
| `requirements.txt` | `package.json` or `Dockerfile` |
| `pip install` | `npm install` / `apt-get install` |
| `deactivate` | `exit` from container |
| `pip freeze` | Pinning image tags in ECR |

---

*Last updated: 2026-07-21 | Stack: Python 3.x + pip + venv (stdlib, no extras needed)*
