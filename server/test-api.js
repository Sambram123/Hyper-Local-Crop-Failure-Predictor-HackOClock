// Quick API test script
const http = require('http');

const payload = JSON.stringify({
  district: { id: 'KA_03', name: 'Belagavi', state: 'Karnataka', lat: 15.8497, lon: 74.4977 },
  crop: { id: 'wheat', name: 'Wheat' },
  stage: { id: 'flowering', name: 'Flowering' },
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/analyze',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log('Status:', res.statusCode);
    console.log('Success:', parsed.success);
    console.log('Composite Score:', parsed.data?.riskScores?.composite?.score);
    console.log('Drought:', parsed.data?.riskScores?.droughtStress?.score, parsed.data?.riskScores?.droughtStress?.level);
    console.log('Pest:', parsed.data?.riskScores?.pestPressure?.score, parsed.data?.riskScores?.pestPressure?.level);
    console.log('Nutrient:', parsed.data?.riskScores?.nutrientDeficiency?.score, parsed.data?.riskScores?.nutrientDeficiency?.level);
    console.log('Forecast days:', parsed.data?.forecast7Day?.length);
    console.log('\n✅ API is working!');
  });
});

req.on('error', (err) => {
  console.error('❌ Connection failed:', err.message);
});

req.write(payload);
req.end();
