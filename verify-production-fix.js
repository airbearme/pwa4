#!/usr/bin/env node

/**
 * Production Fix Verification Script
 * Checks if the deployed version has the fixes applied
 */

async function checkProductionFixes() {
  console.log('🔍 Checking production fixes...\n');
  
  const url = 'https://pwa41.vercel.app';
  
  try {
    // Fetch the production HTML
    const response = await fetch(url);
    const html = await response.text();
    
    // Check 1: CSP Policy includes vercel.live
    const cspCheck = html.includes('https://vercel.live');
    console.log(`${cspCheck ? '✅' : '❌'} CSP Policy updated for Vercel scripts`);
    
    // Check 2: SVG paths are fixed (look for clean Google SVG)
    const googleSvgCheck = html.includes('M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z');
    console.log(`${googleSvgCheck ? '✅' : '❌'} Google SVG paths fixed`);
    
    // Check 3: Apple SVG paths are fixed
    const appleSvgCheck = html.includes('M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z');
    console.log(`${appleSvgCheck ? '✅' : '❌'} Apple SVG paths fixed`);
    
    console.log('\n📊 Summary:');
    if (cspCheck && googleSvgCheck && appleSvgCheck) {
      console.log('✅ All frontend fixes are deployed!');
      console.log('\n🔧 Next Steps:');
      console.log('1. Add Supabase environment variables in Vercel dashboard');
      console.log('2. Configure OAuth redirect URLs in Supabase');
      console.log('3. Test authentication flows');
    } else {
      console.log('⏳ Some fixes may still be deploying...');
      console.log('Wait a few minutes and check again.');
    }
    
  } catch (error) {
    console.error('❌ Error checking production:', error.message);
  }
}

// Run the check
checkProductionFixes();
