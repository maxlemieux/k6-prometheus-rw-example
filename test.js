import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  duration: '1m',
  vus: 50,
};

export default function () {
  const res = http.get('https://quickpizza.grafana.com/');
  sleep(1);
}
