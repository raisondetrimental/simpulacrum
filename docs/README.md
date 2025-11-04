# Meridian Universal Dashboard - Documentation

This directory contains comprehensive documentation for the Meridian Universal Dashboard project. Documentation is organized by category for easy navigation.

## 📚 Documentation Structure

```
docs/
├── quickstart/          # Getting started guides
├── architecture/        # System architecture and design
├── deployment/          # Deployment guides and configurations
├── development/         # Development guides and practices
├── implementation/      # Implementation plans and historical records
├── reference/           # API references and technical specifications
└── README.md           # This file
```

---

## 🚀 Quick Start

**New to the project?** Start here:

1. **[CLAUDE.md](../CLAUDE.md)** - **START HERE!** Comprehensive project overview and quick reference
2. **[Quick Start Guide](quickstart/QUICK_START.md)** - Set up your development environment
3. **[Deal Pipeline Quick Start](quickstart/DEAL_PIPELINE_QUICK_START.md)** - Get started with deal management features

---

## 📖 Documentation by Category

### Quickstart Guides

Essential guides to get you up and running quickly.

- **[QUICK_START.md](quickstart/QUICK_START.md)** - Complete development setup guide
- **[DEAL_PIPELINE_QUICK_START.md](quickstart/DEAL_PIPELINE_QUICK_START.md)** - Deal pipeline feature overview

### Architecture Documentation

System architecture, design decisions, and project structure.

- **[PHASE_1_BACKEND_RESTRUCTURE_COMPLETE.md](architecture/PHASE_1_BACKEND_RESTRUCTURE_COMPLETE.md)** - Backend restructuring completion
- **[PHASE_2_FRONTEND_RESTRUCTURE_COMPLETE.md](architecture/PHASE_2_FRONTEND_RESTRUCTURE_COMPLETE.md)** - Frontend restructuring completion
- **[PHASE_3_DATA_STORAGE_COMPLETE.md](architecture/PHASE_3_DATA_STORAGE_COMPLETE.md)** - Data storage reorganization
- **[PHASE_4_INFRASTRUCTURE_COMPLETE.md](architecture/PHASE_4_INFRASTRUCTURE_COMPLETE.md)** - Infrastructure setup completion
- **[PHASE_5_SHARED_TYPES_COMPLETE.md](architecture/PHASE_5_SHARED_TYPES_COMPLETE.md)** - Shared types implementation
- **[migration-complete.md](architecture/migration-complete.md)** - Data migration records

### Deployment Guides

Deployment instructions for various environments.

- **[Azure_Deployment_Guide.md](deployment/Azure_Deployment_Guide.md)** - Azure deployment instructions
- **[CBONDS_AZURE_DEPLOYMENT.md](deployment/CBONDS_AZURE_DEPLOYMENT.md)** - CBonds-specific Azure deployment
- **[DEPLOYMENT_PROGRESS.md](deployment/DEPLOYMENT_PROGRESS.md)** - Deployment progress tracking

### Development Guides

Development practices, testing, and local setup.

- **[LOCAL_DEVELOPMENT.md](development/LOCAL_DEVELOPMENT.md)** - Local development environment setup
- **[TESTING.md](development/TESTING.md)** - Testing guide and best practices
- **[SHARED_TYPES.md](development/SHARED_TYPES.md)** - Shared type definitions guide
- **[modal-flow.md](development/modal-flow.md)** - UI modal implementation patterns
- **[testing-roadmap.md](development/testing-roadmap.md)** - Testing strategy and roadmap

### Implementation Documentation

Implementation plans, historical records, and strategy documents.

- **[IMPLEMENTATION_CHECKLIST.md](implementation/IMPLEMENTATION_CHECKLIST.md)** - Feature implementation checklist
- **[deal_pipeline_implementation.md](implementation/deal_pipeline_implementation.md)** - Deal pipeline implementation details
- **[DAMN_EFFECT_STRATEGY.md](implementation/DAMN_EFFECT_STRATEGY.md)** - Filtering strategy documentation
- **[LIQUIDITY_RESTRUCTURE_PLAN.md](implementation/LIQUIDITY_RESTRUCTURE_PLAN.md)** - Liquidity module restructuring plan
- **[MEETING_NOTES_MOCKUP.md](implementation/MEETING_NOTES_MOCKUP.md)** - Meeting notes feature design
- **[RESTRUCTURE_SUMMARY.md](implementation/RESTRUCTURE_SUMMARY.md)** - Overall restructure summary
- **[PHASE_1_COMPLETE.md](implementation/PHASE_1_COMPLETE.md)** - Phase 1 completion notes

### Reference Documentation

API documentation, data models, and technical specifications.

- **[API_ENDPOINTS_REFERENCE.md](reference/API_ENDPOINTS_REFERENCE.md)** - Complete API endpoint documentation
- **[API_Pricing_Comparison_and_Recommendations.md](reference/API_Pricing_Comparison_and_Recommendations.md)** - External API pricing analysis
- **[DATA_MODEL_DIAGRAM.md](reference/DATA_MODEL_DIAGRAM.md)** - Database schema and relationships
- **[unified_filtering_work_log.txt](reference/unified_filtering_work_log.txt)** - Filtering implementation work log

---

## 🎯 Common Tasks

### Setting Up Development Environment

1. Read [CLAUDE.md](../CLAUDE.md) for project overview
2. Follow [LOCAL_DEVELOPMENT.md](development/LOCAL_DEVELOPMENT.md) for setup
3. Review [TESTING.md](development/TESTING.md) for testing practices

### Understanding the Architecture

1. Start with [CLAUDE.md](../CLAUDE.md) - Project Structure section
2. Review [DATA_MODEL_DIAGRAM.md](reference/DATA_MODEL_DIAGRAM.md) for data relationships
3. Check [SHARED_TYPES.md](development/SHARED_TYPES.md) for type definitions

### Deploying to Azure

1. Read [Azure_Deployment_Guide.md](deployment/Azure_Deployment_Guide.md) for general deployment
2. Follow [CBONDS_AZURE_DEPLOYMENT.md](deployment/CBONDS_AZURE_DEPLOYMENT.md) for CBonds integration
3. Track progress in [DEPLOYMENT_PROGRESS.md](deployment/DEPLOYMENT_PROGRESS.md)

### Working with APIs

1. Reference [API_ENDPOINTS_REFERENCE.md](reference/API_ENDPOINTS_REFERENCE.md) for all endpoints
2. Check [API_Pricing_Comparison_and_Recommendations.md](reference/API_Pricing_Comparison_and_Recommendations.md) for external APIs
3. Review authentication section in [CLAUDE.md](../CLAUDE.md)

### Understanding Features

**CRM Modules:**
- Capital Partners (Liquidity)
- Sponsors (Corporates)
- Counsel (Legal Advisors)
- Agents (Transaction Agents)

**Deal Management:**
- See [deal_pipeline_implementation.md](implementation/deal_pipeline_implementation.md)
- Quick start: [DEAL_PIPELINE_QUICK_START.md](quickstart/DEAL_PIPELINE_QUICK_START.md)

**Investment Matching:**
- See [CLAUDE.md](../CLAUDE.md) - Investment Matching Engine section

---

## 📝 Contributing to Documentation

When adding new documentation:

1. **Choose the right category:**
   - `quickstart/` - Getting started guides
   - `architecture/` - Design and structure
   - `deployment/` - Deployment guides
   - `development/` - Development practices
   - `implementation/` - Implementation plans
   - `reference/` - API and technical specs

2. **Follow naming conventions:**
   - Use descriptive names: `feature_implementation.md`
   - Use underscores for spaces: `api_endpoints_reference.md`
   - Add to this README's table of contents

3. **Include:**
   - Clear title and purpose
   - Date created/updated
   - Prerequisites (if any)
   - Step-by-step instructions
   - Code examples
   - Links to related documentation

---

## 🔍 Finding What You Need

**Can't find what you're looking for?**

1. **Search CLAUDE.md first** - It's the comprehensive project guide
2. **Use grep to search docs:**
   ```bash
   grep -r "your search term" docs/
   ```
3. **Check the implementation history:**
   - Look in `implementation/` for feature-specific docs
   - Check `architecture/` for structural changes

**Still stuck?** Check the project's main [README.md](../README.md) or [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 📚 Key Documents Quick Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [CLAUDE.md](../CLAUDE.md) | Complete project guide | Always start here |
| [QUICK_START.md](quickstart/QUICK_START.md) | Development setup | First time setup |
| [API_ENDPOINTS_REFERENCE.md](reference/API_ENDPOINTS_REFERENCE.md) | API documentation | Building features |
| [LOCAL_DEVELOPMENT.md](development/LOCAL_DEVELOPMENT.md) | Dev environment | Setting up locally |
| [Azure_Deployment_Guide.md](deployment/Azure_Deployment_Guide.md) | Azure deployment | Deploying to cloud |
| [DATA_MODEL_DIAGRAM.md](reference/DATA_MODEL_DIAGRAM.md) | Database schema | Understanding data |
| [testing-roadmap.md](development/testing-roadmap.md) | Testing strategy | Writing tests |

---

## 📅 Documentation Updates

This documentation structure was reorganized on **October 29, 2025** to improve navigation and maintainability.

**Recent Changes:**
- Organized docs into categorical subdirectories
- Created this navigation guide
- Updated file references in CLAUDE.md
- Improved documentation discoverability

---

## 💡 Tips

- **Bookmark CLAUDE.md** - It's your primary reference
- **Keep docs up-to-date** - Update as you make changes
- **Link between docs** - Use relative links to connect related documentation
- **Add examples** - Code examples are invaluable
- **Date your docs** - Include creation/update dates

---

**Questions or suggestions for improving documentation?** Check [CONTRIBUTING.md](../CONTRIBUTING.md) for how to contribute.
