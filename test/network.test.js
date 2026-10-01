import test from 'node:test';
import assert from 'node:assert/strict';
import {publicAddress} from '../opencomputer/agents/quickstart-watch/network.ts';

test('accepts public IPv4 and IPv6 addresses', () => {
 assert.equal(publicAddress('8.8.8.8'), true);
 assert.equal(publicAddress('2606:4700:4700::1111'), true);
});

test('rejects private and special-purpose addresses', () => {
 for (const address of [
  '0.0.0.0', '10.0.0.1', '100.64.0.1', '127.0.0.1', '169.254.169.254',
  '172.16.0.1', '192.168.0.1', '198.51.100.1', '224.0.0.1',
  '::', '::1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1', 'ff02::1',
 ]) assert.equal(publicAddress(address), false, address);
 assert.equal(publicAddress('not-an-address'), false);
});
