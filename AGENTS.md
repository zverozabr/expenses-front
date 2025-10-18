# AGENTS.md - AI Agent Instructions

**Last Updated:** 2025-01-16

---

## ⚠️ CRITICAL ENFORCEMENT RULES
Используй MCP CONTEXT7 когда вопрос я задаю о архитектуре и лучшей структуре
### 1. Code Quality (MANDATORY)
- ✅ **SOLID** - Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
- ✅ **DRY** - Don't Repeat Yourself (no code duplication)
- ✅ **KISS** - Keep It Simple, Stupid (simple solutions first)

### 2. Task Completion (STRICT)
**NEVER say task is complete without:**
- ✅ Test created/optimized for new functionality
- ✅ All existing tests passing
- ✅ Code optimized and refactored
- ✅ Documentation updated

### 3. Development Rules
- ✅ **New feature?** → Look for optimization opportunities in related code
- ✅ **Bug fix?** → Optimize surrounding code
- ✅ **Refactor old code** when adding new code
- ✅ **Never increase codebase** without refactoring

### 4. Architecture Requirements (MANDATORY)
**ALWAYS follow these patterns for maintainable, scalable code:**

#### Layered Architecture:
- **Presentation Layer**: React components, hooks, UI logic
- **Application Layer**: Custom hooks, business logic coordination
- **Domain Layer**: Business entities, services, core logic
- **Infrastructure Layer**: External APIs, databases, frameworks

#### Service Layer Pattern:
- Create service classes for business operations (e.g., `SessionService`)
- Services should be single-responsibility and testable
- Use dependency injection for flexibility

#### Component Patterns:
- **Container/Presentational**: Separate logic from UI
- **Custom Hooks**: For reusable stateful logic
- **Composition over Inheritance**: Prefer props and composition

#### API Design:
- **RESTful endpoints** with clear responsibilities
- **Error handling**: Centralized error responses
- **Validation**: Input validation at API boundaries
- **Response types**: Consistent JSON structures

#### Type Safety:
- **Strict TypeScript**: No `any` types in production code
- **Interface segregation**: Minimal, focused interfaces
- **Generic types**: For reusable components

#### Performance:
- **Memoization**: Use `useMemo`, `useCallback`, `React.memo`
- **Lazy loading**: Code splitting for large components
- **Efficient re-renders**: Avoid unnecessary updates

#### Testing Strategy:
- **Unit tests**: For services, utilities, hooks
- **Integration tests**: For API routes, component interactions
- **E2E tests**: For critical user flows
- **Test doubles**: Mocks/stubs for external dependencies

#### Security:
- **Input validation**: Sanitize all user inputs
- **Error messages**: Don't leak sensitive information
- **Rate limiting**: For API endpoints
- **CORS**: Proper cross-origin policies

#### Scalability:
- **Stateless components**: Where possible
- **Database optimization**: Efficient queries, indexing
- **Caching**: For frequently accessed data
- **Monitoring**: Error tracking, performance metrics

---

**ENFORCEMENT**: Any code that violates these patterns must be refactored before commit.


