#!/bin/bash
echo "Please run these commands manually:"
echo ""
echo "cd /Users/shamash/work/exp_front/telegram-bot-json-editor"
echo ""
echo "git add src/lib/sessionService.ts src/types/index.ts src/app/api/session/route.ts"
echo ""
echo 'git commit -m "fix: Implement UPSERT for session persistence (SOLID/DRY/KISS)

- Added upsertSession() method to SessionService
- Uses PostgreSQL ON CONFLICT for atomic create/update
- Updated ISessionService interface with upsertSession
- POST /api/session now uses upsert instead of update
- Added centralized handleError() method (DRY)

SOLID: Single Responsibility, Interface Segregation
DRY: Reuses validation, centralized error handling
KISS: Single method for create/update

Fixes: Session not found after POST /api/session

Co-authored-by: factory-droid[bot]"'
echo ""
echo "git push origin main"
