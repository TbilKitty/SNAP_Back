# Maryland Wage-Shortfall Tax Model

An interactive, static website that demonstrates the math behind a proposed Maryland large-employer compensation-shortfall excise tax.

## What it models

- A statewide gross living-wage floor plus a limited regional supplement.
- A tax on the positive difference between that benchmark and an employer's wage.
- The employer's choice between raising wages and paying the excise tax.
- Estimated worker take-home gains using editable payroll- and income-tax assumptions.
- Partial employer wage responses.
- The location incentive created by moving actual jobs to a lower-cost region.
- A sourced Maryland public-cost pipeline connecting employment among SNAP recipients, benefit spending, authorized retailers, and the federal-to-State SNAP cost shift.

This is an illustrative policy model, not an official fiscal estimate or tax calculator.

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.

GitHub will display the public URL after deployment.

## Run locally

Open `index.html` in a browser. No build tools, packages, API keys, or server are required.

## Core equations

```text
regional benchmark = statewide floor × (1 + regional supplement)
annual wage gap = max(benchmark − current wage, 0) × weekly hours × 52
excise tax = annual wage gap × covered employees × tax multiplier
full-raise employer cost = annual wage gap × covered employees × (1 + employer payroll-tax rate)
worker take-home gain = gross raise × (1 − worker payroll-tax rate − effective income-tax rate)
```

## Data sources used in the pipeline

- Maryland Department of Legislative Services, *Analysis of the FY 2027 Maryland Executive Budget: Family Investment Administration*.
- USDA Food and Nutrition Administration, *SNAP Retailer Management Year End Summary FY 2025*.
- University of Maryland School of Social Work, *Maryland SNAP Households, 2025*.
- USDA Food and Nutrition Service participation data, presented by USAFacts.

The site deliberately does not assign Maryland SNAP redemption dollars to a named company. Public data show aggregate retailer redemption, but not a reliable Maryland-by-chain allocation.

## Files

- `index.html` — page structure and content
- `styles.css` — responsive design
- `app.js` — calculations and interactions
