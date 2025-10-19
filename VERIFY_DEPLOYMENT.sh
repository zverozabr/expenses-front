#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          📋 VERCEL DEPLOYMENT VERIFICATION SCRIPT           ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DEPLOYED_URL="https://expenses-front-weld.vercel.app"

echo "🔍 Step 1: Checking if site is deployed..."
if curl -s -o /dev/null -w "%{http_code}" "${DEPLOYED_URL}" | grep -q "200"; then
    echo -e "${GREEN}✅ Site is live${NC}"
else
    echo -e "${RED}❌ Site is not accessible${NC}"
    exit 1
fi
echo ""

echo "🔍 Step 2: Checking health endpoint..."
HEALTH_RESPONSE=$(curl -s "${DEPLOYED_URL}/api/health")
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

echo "🔍 Step 3: Getting latest deployment info..."
if command -v vercel &> /dev/null; then
    echo "Latest deployments:"
    vercel ls --token $VERCEL_TOKEN 2>/dev/null | head -5
    echo ""
    echo "Deployment logs:"
    vercel logs --token $VERCEL_TOKEN 2>/dev/null | tail -10
else
    echo -e "${YELLOW}⚠️  Vercel CLI not installed. Skipping detailed deployment info.${NC}"
    echo "   Install with: npm i -g vercel"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          🧪 READY TO RUN E2E TESTS                          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Run E2E tests with:"
echo ""
echo "  cd /Users/shamash/work/expences"
echo "  python tests/e2e/test_frontend_integration.py"
echo ""
echo "Expected result: 7/7 passing ✅"
echo ""

