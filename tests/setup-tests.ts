Object.defineProperty(global, 'IsDuplicityVersion', {
  value: () => true,
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
