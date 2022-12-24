Object.defineProperty(global, 'IsDuplicityVersion', {
  writable: true,
  value: () => true,
});

Object.defineProperty(global, 'GetCurrentResourceName', {
  writable: true,
  value: () => 'CURRENT_RESOURCE',
});

Object.defineProperty(global, 'on', {
  writable: true,
  value: () => null,
});

Object.defineProperty(global, 'onNet', {
  writable: true,
  value: () => null,
});

Object.defineProperty(global, 'exports', {
  writable: true,
  value: () => null,
});

Object.defineProperty(global, 'remoteExports', {
  writable: true,
  value: () => null,
});

Object.defineProperty(global, 'RegisterCommand', {
  writable: true,
  value: () => null,
});

Object.defineProperty(global, 'emit', {
  writable: true,
  value: () => null,
});

Object.defineProperty(global, 'emitNet', {
  writable: true,
  value: () => null,
});

Object.defineProperty(global, 'source', {
  writable: true,
  value: 1,
});
