const SimpleHash = require('./simple-hash');

async function testSimpleHash() {
    const password = 'Rakesh123$';
    
    console.log('🔍 Testing SimpleHash functionality...');
    console.log('Input password:', password);
    
    try {
        // Test async hash and compare
        console.log('\n🔍 Testing async hash and compare...');
        const hash1 = await SimpleHash.hash(password, 10);
        console.log('Hash 1:', hash1);
        
        const compare1 = await SimpleHash.compare(password, hash1);
        console.log('Compare 1 result:', compare1);
        
        // Test sync hash and compare
        console.log('\n🔍 Testing sync hash and compare...');
        const hash2 = SimpleHash.hashSync(password, 10);
        console.log('Hash 2:', hash2);
        
        const compare2 = SimpleHash.compareSync(password, hash2);
        console.log('Compare 2 result:', compare2);
        
        // Test cross-compatibility
        console.log('\n🔍 Testing cross-compatibility...');
        const compare3 = await SimpleHash.compare(password, hash2);
        console.log('Async compare with sync hash:', compare3);
        
        const compare4 = SimpleHash.compareSync(password, hash1);
        console.log('Sync compare with async hash:', compare4);
        
        // Test with wrong password
        console.log('\n🔍 Testing with wrong password...');
        const wrongCompare = await SimpleHash.compare('WrongPassword', hash1);
        console.log('Wrong password compare:', wrongCompare);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testSimpleHash(); 