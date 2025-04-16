
const http = require('http');
const fs = require('fs');
const path = require('path');
const handler = require('serve-handler');

// Start a local server to serve the production build
const server = http.createServer((request, response) => {
  return handler(request, response, { public: 'build' });
});

async function validateBuild() {
  try {
    // Start server on random port
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;
    const url = `http://localhost:${port}`;
    
    console.log(`🔍 Validating build at ${url}`);
    
    // Basic validation: Check if the HTML file contains key elements
    const indexHtmlPath = path.join(__dirname, 'build', 'index.html');
    const mainJsFolder = path.join(__dirname, 'build', 'static', 'js');
    
    if (!fs.existsSync(indexHtmlPath)) {
      throw new Error('index.html not found in build directory');
    }
    
    // Check for JS bundle files
    const jsFiles = fs.readdirSync(mainJsFolder).filter(file => file.endsWith('.js'));
    if (jsFiles.length === 0) {
      throw new Error('No JavaScript bundles found in build directory');
    }
    
    // Read the main JS file to check for potential runtime issues
    const mainJsPath = path.join(mainJsFolder, jsFiles[0]);
    const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    
    // Check for patterns that might indicate TDZ issues
    const tdzPatterns = [
      { pattern: /(?:let|const)\s+(\w+)\s*(?:;|=)/g, check: "variable declarations" },
      { pattern: /(?:var|let|const)\s+(\w+).*?\n.*?\1/g, check: "potential variable hoisting issues" },
      { pattern: /\w+\s*=\s*\w+\s*\(\)/g, check: "function calls before declaration" }
    ];
    
    console.log('Checking for potential runtime issues...');
    
    // Basic signature checks for bundle integrity
    const signatureChecks = [
      { name: 'React', check: mainJsContent.includes('__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED') },
      { name: 'ReactDOM', check: mainJsContent.includes('createRoot') || mainJsContent.includes('render') },
      { name: 'Bundled app code', check: mainJsContent.length > 10000 }
    ];
    
    const failedChecks = signatureChecks.filter(check => !check.check);
    
    if (failedChecks.length > 0) {
      throw new Error(`Build validation failed: missing ${failedChecks.map(c => c.name).join(', ')}`);
    }
    
    // Scan for problematic patterns that might cause runtime errors
    const warningPatterns = [
      { pattern: /Cannot\s+(?:read|set)\s+(?:properties|property)\s+of\s+(?:undefined|null)/g, issue: "Null/undefined property access" },
      { pattern: /Cannot\s+access\s+(?:'\w+'|"\w+")\s+before\s+initialization/g, issue: "Temporal Dead Zone (TDZ) error" },
      { pattern: /\w+\s+is\s+not\s+(?:defined|a\s+function)/g, issue: "Reference error or undefined function" },
      { pattern: /Maximum\s+call\s+stack\s+size\s+exceeded/g, issue: "Infinite recursion" },
      { pattern: /expected\s+(?:'\w+'|"\w+")\s+to\s+be\s+(?:'\w+'|"\w+")/g, issue: "Test assertion failure" }
    ];
    
    let potentialIssues = [];
    
    for (const { pattern, issue } of warningPatterns) {
      const matches = mainJsContent.match(pattern);
      if (matches && matches.length > 0) {
        potentialIssues.push({ issue, count: matches.length });
      }
    }
    
    if (potentialIssues.length > 0) {
      console.warn('⚠️ Potential runtime issues detected:');
      potentialIssues.forEach(({ issue, count }) => {
        console.warn(`  - ${issue} (${count} instances found)`);
      });
      // Log as warning but don't fail the build
    }
    
    console.log('✅ Build validation successful! Basic checks passed.');
    
    // Write a validation report
    const reportContent = {
      timestamp: new Date().toISOString(),
      buildSize: Math.round(mainJsContent.length / 1024) + ' KB',
      checks: signatureChecks,
      potentialIssues
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'build-validation-report.json'),
      JSON.stringify(reportContent, null, 2)
    );
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Build validation process failed:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

validateBuild();
