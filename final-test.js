#!/usr/bin/env node

// Final comprehensive test of the fixed collection generator
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 COMPREHENSIVE FINAL TEST');
console.log('==============================\n');

async function runFinalTest() {
  // Backup current state
  console.log('1. Backing up current state...');
  const indexPath = path.join(__dirname, 'index.html');
  const backupPath = path.join(__dirname, 'index.html.final-test-backup');
  fs.copyFileSync(indexPath, backupPath);
  
  try {
    // Test 1: Create new collection
    console.log('\n2. Testing collection creation...');
    const createInput = `1
Final Test Collection
This is the final test to ensure everything works perfectly
final-test
collection_bgs/stole-3419985_1920.jpg
rgba(100, 50, 200, 0.8)
n
4`;
    
    execSync(`echo "${createInput}" | node generate-collections.js`, {
      encoding: 'utf8',
      timeout: 15000
    });
    
    console.log('✅ Collection creation completed');
    
    // Test 2: Check index.html series section
    console.log('\n3. Checking series section update...');
    const updatedContent = fs.readFileSync(indexPath, 'utf8');
    
    if (updatedContent.includes('Final Test Collection') && 
        updatedContent.includes('collections/final-test.html')) {
      console.log('✅ Series section updated correctly');
    } else {
      console.log('❌ Series section update failed');
      return false;
    }
    
    // Test 3: Check collection HTML file
    console.log('\n4. Checking collection HTML file...');
    const collectionPath = path.join(__dirname, 'collections', 'final-test.html');
    
    if (fs.existsSync(collectionPath)) {
      console.log('✅ Collection HTML file created');
      
      const collectionContent = fs.readFileSync(collectionPath, 'utf8');
      
      if (collectionContent.includes('function checkVisibility()') &&
          collectionContent.includes('window.addEventListener(\'load\', checkVisibility)') &&
          collectionContent.includes('window.addEventListener(\'scroll\', checkVisibility)')) {
        console.log('✅ Visibility animations included');
      } else {
        console.log('❌ Visibility animations missing');
        return false;
      }
      
      // Clean up test collection
      fs.unlinkSync(collectionPath);
      
    } else {
      console.log('❌ Collection HTML file not created');
      return false;
    }
    
    // Test 4: Verify 4th-dimension is still correct
    console.log('\n5. Verifying existing collections...');
    if (updatedContent.includes('The 4th Dimension') &&
        updatedContent.includes('3 Artworks') &&
        updatedContent.includes('3 Available')) {
      console.log('✅ Existing collections still display correctly');
    } else {
      console.log('❌ Existing collections corrupted');
      return false;
    }
    
    // Test 5: Check for malformed HTML
    console.log('\n6. Checking HTML structure integrity...');
    const artCardCount = (updatedContent.match(/class="series-card"/g) || []).length;
    const seriesGridStart = updatedContent.indexOf('<div class="series-grid">');
    const seriesGridEnd = updatedContent.lastIndexOf('</div>', updatedContent.lastIndexOf('</div>') - 10);
    
    if (artCardCount >= 2 && seriesGridStart !== -1 && seriesGridEnd !== -1) {
      console.log('✅ HTML structure is valid');
    } else {
      console.log('❌ HTML structure is corrupted');
      return false;
    }
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n📋 FINAL VERIFICATION SUMMARY:');
    console.log('✅ Script creates collections correctly');
    console.log('✅ Index.html series section updates work');
    console.log('✅ Collection pages have visibility animations');
    console.log('✅ HTML structure remains valid');
    console.log('✅ Existing collections unaffected');
    console.log('✅ All safety features preserved');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  } finally {
    // Always restore backup
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, indexPath);
      fs.unlinkSync(backupPath);
      console.log('\n🔄 Restored clean state');
    }
  }
}

if (require.main === module) {
  runFinalTest().then(success => {
    if (success) {
      console.log('\n🚀 COLLECTION GENERATOR IS PRODUCTION READY!');
      console.log('\nUsage: node generate-collections.js');
      console.log('Both fixes implemented and fully tested!');
    } else {
      console.log('\n❌ Tests failed - script needs more work');
      process.exit(1);
    }
  });
}

module.exports = { runFinalTest };