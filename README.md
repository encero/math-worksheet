# Math Worksheet Generator

A small Next.js app that generates printable A4 **addition/subtraction worksheets** for a first grader.

- Choose number of problems and largest number.
- Choose operation: addition, subtraction, or mixed.
- Optionally ensure that **results never exceed the largest number**.
- Settings are **saved in localStorage** with a reset button.
- Layout is optimized for **printing on A4** (controls are hidden in print view).

---

## Getting started (local development)

Requirements:
- Node.js 20+
- pnpm

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000 in your browser.

Run lint and tests:

```bash
pnpm lint
pnpm test
```

---

## Production build

```bash
pnpm install
pnpm build
pnpm start
```

By default the app runs on port **3000**.

---

## Docker

A multi-stage Dockerfile is provided.

Build the image:

```bash
docker build -t ghcr.io/<OWNER>/math-worksheet:latest .
```

Run the container:

```bash
docker run --rm -p 3000:3000 ghcr.io/<OWNER>/math-worksheet:latest
```

Then open http://localhost:3000.

---

## GitHub Actions (build & publish to GHCR)

GitHub Actions workflow lives at:

- `.github/workflows/docker-ghcr.yml`

It:
- Builds the Docker image using the `Dockerfile` in this repo.
- Pushes it to **GitHub Container Registry (GHCR)** as:
  - `ghcr.io/<OWNER>/math-worksheet:<branch-or-tag>`.

The workflow uses the built-in `GITHUB_TOKEN` and does not need extra secrets in most setups.

---

## Kubernetes deployment

Manifests are under `k8s/` and assume a **`nextjs` namespace**:

- `k8s/namespace.yaml` – Namespace definition (`nextjs`).
- `k8s/deployment.yaml` – Next.js Deployment.
- `k8s/service.yaml` – ClusterIP Service on port 80.
- `k8s/ingress.yaml` – nginx Ingress with cert-manager TLS.

Basic deployment flow:

1. Make sure you have a Docker image in GHCR, e.g.:
   - `ghcr.io/<OWNER>/math-worksheet:latest`
   and update `k8s/deployment.yaml` `image:` field accordingly.
2. Install **nginx ingress controller** and **cert-manager** in your cluster.
3. Create/verify a `ClusterIssuer` for Let’s Encrypt (e.g. `letsencrypt-prod`).
4. Set your real domain in `k8s/ingress.yaml` (replace `math-worksheet.example.com`).

Apply:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

Once DNS for your domain points to the nginx ingress controller, cert-manager will
obtain a TLS certificate and your worksheet app will be available over HTTPS.
