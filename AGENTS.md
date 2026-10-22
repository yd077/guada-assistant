# Architecture

- Route existing backend import specifiers through exact Vite aliases to the project-backend adapters; this keeps generated Cloud files untouched while using one external project for browser sessions, authenticated calls, and privileged operations.
- Expose only the external URL and publishable key at build time; privileged credentials are read lazily on the server so they never enter the browser bundle.