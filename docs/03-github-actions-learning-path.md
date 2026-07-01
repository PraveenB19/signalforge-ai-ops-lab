# GitHub Actions Learning Path

## Core Syntax

Basic workflow shape:

```yaml
name: CI

on:
  push:
    branches:
      - main
      - develop
  pull_request:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "21"

      - name: Test
        run: mvn test
```

## Concepts To Learn In Order

1. `name`
2. `on`
3. `jobs`
4. `runs-on`
5. `steps`
6. `uses`
7. `run`
8. `with`
9. `env`
10. `secrets`
11. `vars`
12. `permissions`
13. `needs`
14. `if`
15. `strategy`
16. `matrix`
17. `artifacts`
18. `cache`
19. `environments`
20. `workflow_dispatch`
21. `schedule`

## Branching Strategy

```text
main
  production-ready code

develop
  integration branch

feature/*
  new work

release/*
  release preparation

hotfix/*
  urgent production fixes
```

## Environment Promotion

```text
feature branch
  -> CI only

develop
  -> deploy dev

release/*
  -> deploy stage

main
  -> deploy prod after approval
```

## Artifact Rule

Do not rebuild for each environment.

Correct flow:

```text
Build once
Test once
Scan once
Publish artifact once
Deploy same artifact to dev
Promote same artifact to stage
Promote same artifact to prod
```

## AWS OIDC Permissions

For OIDC, the workflow needs:

```yaml
permissions:
  id-token: write
  contents: read
```

This allows GitHub Actions to request an OIDC token that AWS can validate.

