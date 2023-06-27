
const DATA = {
  subscribers: {},
  publishers: {}
};

const METHODS = [
  { name: 'on', collection: DATA.subscribers },
  { name: 'subscribe', collection: DATA.subscribers },
  { name: 'emit', collection: DATA.publishers },
  { name: 'publish', collection: DATA.publishers },
];

window.ee_explore = DATA;

const handle = ({ source, eventName, data, collection }) => {
  collection[eventName] = collection[eventName] || { source };

  if (data) {
    collection[eventName].data = collection[eventName].data || [];
    collection[eventName].data.push(data);
  }
};

const parceSource = (error) => {
  const rows = error.stack.split('\n');
  return rows[2].trim()
    .replace('at new ', '')
    .replace('at ', '')
    .replace('/./', '/');
};

const monitor = (lib, method, collection) => {
  const fn = lib.prototype[method];

  Object.defineProperty(lib.prototype, method, {
    value: function (...args) {
      try {
        throw new Error();
      } catch (error) {
        const source = parceSource(error);
        const eventName = args[0];
        const data = typeof args[1] === 'function' ? null : args[1];

        handle({ source, eventName, method, data, collection });
      }

      fn.apply(this, [...args]);
    }
  });
};

export const explore = (lib) => {
  METHODS.forEach(({ name, collection }) => monitor(lib, name, collection));
};

