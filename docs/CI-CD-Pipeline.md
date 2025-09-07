# GitHub Actions CI/CD Pipeline

This repository uses a multi-stage GitHub Actions pipeline similar to GitLab CI/CD stages.

## Pipeline Stages

### 1. Build Backend (`build-backend`)
- Sets up Python 3.11 environment
- Installs backend dependencies from `requirements.txt`
- Performs syntax checking and basic import validation
- Caches pip dependencies for faster subsequent runs

### 2. Test Backend (`test-backend`)
- Depends on successful backend build
- Runs all backend tests using pytest
- Tests include:
  - Allergy analyzer tests
  - Chatbot functionality tests
  - Food classifier tests
  - Gemini NLP parser tests
  - Ingredient classifier tests
  - Nutrition database tests
  - Nutrition lookup tests
  - Substitution recommender tests

### 3. Build and Lint Frontend (`build-lint-frontend`)
- Sets up Node.js 18 environment
- Installs frontend dependencies
- Runs ESLint for code quality checks
- Builds the frontend application
- Uploads build artifacts for deployment

### 4. Deploy (`deploy`)
- **Only runs on main branch push** (not on PRs)
- Depends on all previous stages passing
- Downloads frontend build artifacts
- Deploys to VPS via SSH
- Updates environment variables from GitHub secrets
- Restarts Docker containers

## Workflow Triggers

- **Push to main**: Runs all stages including deployment
- **Pull Request**: Runs build, test, and lint stages (no deployment)

## Environment Variables Required

Set these as GitHub repository secrets:

### VPS Connection
- `VPS_HOST`: Your VPS hostname or IP
- `VPS_USER`: SSH username
- `VPS_SSH_KEY`: Private SSH key (recommended) OR `VPS_SSH_PASSWORD`
- `VPS_SSH_PORT`: SSH port (usually 22)
- `VPS_DEPLOY_PATH`: Path to your project on VPS (e.g., `/home/ubuntu/nutrichef`)
- `VPS_TMUX_SESSION`: Tmux session name (defaults to 'nutrichef')

### Application Configuration
- `MAIL_SERVER`: Email server configuration
- `MAIL_USERNAME`: Email username
- `MAIL_PASSWORD`: Email password
- `MAIL_DEFAULT_SENDER`: Default sender email
- `GEMINI_API_KEY`: Google Gemini AI API key
- `PROJECT_NUMBER`: Google Cloud project number
- `FRONTEND_URL`: Frontend URL for CORS
- `DOMAIN_URL`: Domain URL for the application

## Benefits of This Setup

1. **Quality Gates**: Code must pass all tests and linting before deployment
2. **Parallel Execution**: Frontend and backend stages can run simultaneously where possible
3. **Artifact Management**: Built frontend is passed to deployment stage
4. **Environment Protection**: Deployment only happens from main branch
5. **Caching**: Dependencies are cached for faster builds
6. **PR Validation**: Pull requests are tested without deploying

## Failure Handling

If any stage fails:
- Subsequent dependent stages are skipped
- Deployment is prevented
- GitHub will show which stage failed and why
- You can re-run failed jobs after fixing issues

## Local Development

To test your changes before pushing:

### Backend
```bash
cd backend
pip install -r requirements.txt
cd ../tests
python -m pytest -v
```

### Frontend
```bash
cd frontend
npm install
npm run lint
npm run build
```

This ensures your code will pass the CI pipeline before you push to GitHub.
