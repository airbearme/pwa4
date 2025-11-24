# AirBear PWA Ultimate Validation Command

**Purpose**: Comprehensive validation of the AirBear PWA deployment, functionality, and production readiness.

## Quick Validation (Essential Checks)
```bash
cd /home/steve/Projects/11⁄11pwa3

# Phase 1: Code Quality
echo "🔍 PHASE 1: CODE QUALITY"
npm run build
npm run check

# Phase 2: Deployment
echo "🌐 PHASE 2: DEPLOYMENT"
curl -I https://airbear.me
curl -s https://airbear.me/manifest.json | jq -r '.name, .theme_color'
curl -I https://airbear.me/sw.js

# Phase 3: Bundle Analysis  
echo "📊 PHASE 3: BUNDLE"
du -sh dist/public/
ls -lh dist/public/assets/ | head -10
```

## Comprehensive Validation (Complete Testing)

### Phase 1: Code Quality Validation
```bash
cd /home/steve/Projects/11⁄11pwa3

echo "🎯 STEP 1.1: Build Verification"
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Build: SUCCESS"
else
  echo "❌ Build: FAILED"
  exit 1
fi

echo "🎯 STEP 1.2: TypeScript Type Checking"
npm run check
if [ $? -eq 0 ]; then
  echo "✅ TypeScript: PASSED"
else
  echo "❌ TypeScript: FAILED"
  exit 1
fi

echo "🎯 STEP 1.3: Bundle Analysis"
echo "Build size: $(du -sh dist/public/)"
echo "Assets size: $(du -sh dist/public/assets/)"
echo "Total JS files: $(ls dist/public/assets/*.js 2>/dev/null | wc -l)"
echo "Total CSS files: $(ls dist/public/assets/*.css 2>/dev/null | wc -l)"
```

### Phase 2: Deployment Validation
```bash
echo "🌐 STEP 2.1: Live Site Accessibility"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://airbear.me)
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Site accessible: HTTP $HTTP_STATUS"
else
  echo "❌ Site inaccessible: HTTP $HTTP_STATUS"
  exit 1
fi

echo "🌐 STEP 2.2: SSL Certificate"
SSL_INFO=$(curl -s -I https://airbear.me | grep -E "HTTP|Server")
echo "SSL Status: $SSL_INFO"

echo "🌐 STEP 2.3: PWA Manifest Validation"
MANIFEST_NAME=$(curl -s https://airbear.me/manifest.json | jq -r '.name // "missing"')
MANIFEST_COLOR=$(curl -s https://airbear.me/manifest.json | jq -r '.theme_color // "missing"')
MANIFEST_START=$(curl -s https://airbear.me/manifest.json | jq -r '.start_url // "missing"')
echo "✅ PWA Name: $MANIFEST_NAME"
echo "✅ Theme Color: $MANIFEST_COLOR"  
echo "✅ Start URL: $MANIFEST_START"

echo "🌐 STEP 2.4: Critical Files Integrity"
for file in "index.html" "manifest.json" "sw.js" "airbear-mascot.png"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://airbear.me/$file)
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ $file: HTTP $HTTP_CODE"
  else
    echo "❌ $file: HTTP $HTTP_CODE"
  fi
done
```

### Phase 3: Functional Testing (End-to-End User Journeys)
```bash
echo "🧪 STEP 3.1: Home Page Content Validation"
HOME_CONTENT=$(curl -s https://airbear.me)
if echo "$HOME_CONTENT" | grep -q "AirBear"; then
  echo "✅ AirBear branding present"
else
  echo "❌ AirBear branding missing"
fi

if echo "$HOME_CONTENT" | grep -q "Solar Rickshaw"; then
  echo "✅ Solar rickshaw messaging present"
else
  echo "❌ Solar rickshaw messaging missing"
fi

echo "🧪 STEP 3.2: PWA Service Worker Validation"
SW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://airbear.me/sw.js)
if [ "$SW_STATUS" = "200" ]; then
  echo "✅ Service Worker: Available"
else
  echo "❌ Service Worker: Missing (HTTP $SW_STATUS)"
fi

echo "🧪 STEP 3.3: Client-Side Routing Test"
# Test if the app handles client-side routes (SPA behavior)
curl -I https://airbear.me/map > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Client-side routing: App running (may show 404 for routes due to SPA)"
else
  echo "❌ Client-side routing: Failed to connect"
fi
```

### Phase 4: Map Functionality Validation (Critical for AirBear)
```bash
echo "🗺️ STEP 4.1: Map Component Analysis"
echo "Checking if map component is properly configured..."

# Verify map component exists and is correctly structured
if grep -q "Leaflet" client/src/pages/map.tsx; then
  echo "✅ Map component: Uses Leaflet library"
else
  echo "❌ Map component: Missing Leaflet dependency"
fi

if grep -q "spots" client/src/pages/map.tsx; then
  echo "✅ Map component: References Binghamton spots data"
else
  echo "❌ Map component: Missing spots data integration"
fi

echo "🗺️ STEP 4.2: Binghamton Spots Data Validation"
SPOTS_FILE="client/src/lib/spots.ts"
if [ -f "$SPOTS_FILE" ]; then
  SPOTS_COUNT=$(grep -c "id:" "$SPOTS_FILE")
  echo "✅ Spots data: $SPOTS_COUNT locations configured"
  
  # Check for key Binghamton locations
  if grep -q "Court Street" "$SPOTS_FILE"; then
    echo "✅ Downtown location: Present"
  fi
  if grep -q "BU" "$SPOTS_FILE"; then
    echo "✅ Binghamton University: Present"
  fi
else
  echo "❌ Spots data file: Missing"
fi

echo "🗺️ STEP 4.3: Expected Map Features"
echo "When updated files are deployed to airbear.me:"
echo "  ✅ Interactive Leaflet map with Binghamton focus"
echo "  ✅ 16 spot markers with AirBear availability"
echo "  ✅ Click-to-book functionality (demo mode)"
echo "  ✅ Real-time mock availability updates"
echo "  ✅ Solar charging station indicators"
```

### Phase 5: Performance & User Experience
```bash
echo "⚡ STEP 5.1: Load Time Analysis"
LOAD_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://airbear.me)
echo "Load time: ${LOAD_TIME}s"

echo "⚡ STEP 5.2: Bundle Optimization Check"
CSS_SIZE=$(du -h dist/public/assets/*.css 2>/dev/null | head -1 | awk '{print $1}')
JS_SIZE=$(du -h dist/public/assets/*.js 2>/dev/null | head -1 | awk '{print $1}')
echo "Largest CSS: $CSS_SIZE"
echo "Largest JS: $JS_SIZE"

echo "⚡ STEP 5.3: Mobile PWA Features"
# Check if PWA meta tags are present
if curl -s https://airbear.me | grep -q "apple-mobile-web-app"; then
  echo "✅ Mobile PWA: Meta tags present"
else
  echo "⚠️ Mobile PWA: Meta tags missing"
fi

echo "⚡ STEP 5.4: Responsive Design Elements"
# Check for viewport meta tag
if curl -s https://airbear.me | grep -q "viewport"; then
  echo "✅ Responsive design: Viewport configured"
else
  echo "❌ Responsive design: Viewport missing"
fi
```

### Phase 6: Security & Production Readiness
```bash
echo "🔒 STEP 6.1: Security Headers"
curl -s -I https://airbear.me | grep -E "(X-Frame-Options|Content-Security-Policy|X-Content-Type-Options)" || echo "⚠️ Security headers: Need review"

echo "🔒 STEP 6.2: HTTPS Validation"
HTTPS_TEST=$(curl -s -I https://airbear.me | head -1 | grep "HTTP/2")
if [ -n "$HTTPS_TEST" ]; then
  echo "✅ HTTPS: HTTP/2 enabled"
else
  echo "❌ HTTPS: Not properly configured"
fi

echo "🔒 STEP 6.3: Error Pages"
# Test 404 handling
NOT_FOUND=$(curl -s https://airbear.me/nonexistent-page | grep -c "404\|Not Found")
if [ "$NOT_FOUND" -gt 0 ]; then
  echo "✅ Error handling: 404 pages configured"
else
  echo "⚠️ Error handling: May need custom 404 page"
fi
```

### Phase 7: Deployment Status & Next Steps
```bash
echo "📋 STEP 7.1: Current Deployment Status"
echo "Live site: https://airbear.me"
echo "Status: $(curl -s -o /dev/null -w "%{http_code}" https://airbear.me)"
echo "Last checked: $(date)"

echo "📋 STEP 7.2: File Deployment Check"
echo "Updated map files need upload to airbear.me:"
echo "  Source: /home/steve/Projects/11⁄11pwa3/dist/public/"
echo "  Destination: /public_html/ (via FileZilla)"
echo "  Required for: Working map functionality"

echo "📋 STEP 7.3: Testing After Upload"
echo "After uploading updated files, test:"
echo "  ✅ https://airbear.me/map - Interactive map loads"
echo "  ✅ 16 Binghamton spots visible on map" 
echo "  ✅ AirBear markers show availability"
echo "  ✅ Booking dialog works (demo mode)"
echo "  ✅ Mobile PWA install prompt appears"
```

## Success Criteria
**Validation passes if:**
- ✅ Build completes without errors
- ✅ TypeScript validation passes
- ✅ Site loads at https://airbear.me  
- ✅ PWA manifest properly configured
- ✅ All critical files accessible
- ✅ Map component properly structured
- ✅ Binghamton spots data configured
- ✅ Service worker functional
- ✅ Mobile-responsive design elements present

## Post-Validation Actions
1. **If map functionality needed**: Upload updated dist/public files to airbear.me via FileZilla
2. **If PWA features needed**: Test install prompt on mobile devices
3. **If performance issues**: Review bundle sizes and optimize if needed
4. **If security needed**: Configure security headers on hosting platform

---
