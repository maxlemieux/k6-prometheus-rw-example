import tempo from 'https://jslib.k6.io/http-instrumentation-tempo/1.0.0/index.js';
import http from 'k6/http';
import { check, sleep } from 'k6';

// Instrument HTTP requests with Tempo for distributed tracing
tempo.instrumentHTTP({
  propagator: 'w3c',  // Propagation format for tracing, possible values: "w3c", "jaeger"
});

export const options = {
  cloud: {
    distribution: {
      'amazon:jp:tokyo': { loadZone: 'amazon:jp:tokyo', percent: 33 },
      'amazon:us:portland': { loadZone: 'amazon:us:portland', percent: 34 },
      'amazon:de:frankfurt': { loadZone: 'amazon:de:frankfurt', percent: 33 },
    },
    apm: [],
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // No more than 1% of requests should fail
    http_req_duration: ['p(95)<22000'], // 95% of requests should complete within 22 seconds
  },
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '1m' },   // Ramp-up to 20 users in 1 minute
        { target: 20, duration: '1m30s' }, // Stay at 20 users for 1 minute 30 seconds
        { target: 0, duration: '1m' },    // Ramp-down to 0 users in 1 minute
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
};

export function scenario_1() {
  const url = `https://quickpizza.grafana.com/`;

  // Make the POST request with tracing
  const response = http.get(url);

  // Check the response for status 200 and expected content in the body
  const result = check(response, {
    'status is 200': (r) => r.status === 200,
    'response body is not empty': (r) => r.body && r.body.length > 0,
  });

  if (!result) {
    console.error(`Check failed for response with status ${response.status}`);
  }

  // Log the response status and body for debugging
  console.log(`Response status: ${response.status}`);
  console.log(`Response body: ${response.body}`);

  // Simulate user wait time
  sleep(1);
}

