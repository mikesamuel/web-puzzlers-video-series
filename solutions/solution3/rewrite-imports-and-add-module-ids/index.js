let { URL } = require('url')
let policy = require('./policy')

let hook = global.moduleImportInterceptHook
let baseUrl = new URL('https://example.com:123/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/');

function relativizePaths(base, path) {
  let baseParts = base.split('/').map(decodeURIComponent)
  let pathParts = path.split('/').map(decodeURIComponent)
  if (baseParts[baseParts.length - 1] !== '') {
    baseParts[baseParts.length - 1] = '';
  }
  let i;
  let n = Math.min(baseParts.length - 1, pathParts.length)
  for (i = 0; i < n; ++i) {
    if (baseParts[i] !== pathParts[i]) { break; }
  }
  if (i === 0 && pathParts[0] === '') { return pathParts.join('/') }
  let nUp = baseParts.length - i - 1
  return (nUp > 0 ? '../'.repeat(nUp) : './') + pathParts.slice(i).join('/')
}

module.exports = function({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        let filename = state.file.opts.filename;
        let moduleSpecifier = path.node.source.value;

        let fileUrl = new URL(filename, baseUrl);
        let moduleUrl = new URL(moduleSpecifier, fileUrl);

        let fixed = hook(baseUrl.toString(), fileUrl.toString(), moduleUrl.toString());
        if (fixed !== moduleUrl.toString()) {
          let fixedUrl = new URL(fixed, baseUrl)
          if (fixedUrl.origin !== baseUrl.origin) {
            throw new Error(`${fixed} from ${moduleSpecifier} in ${filename}`);
          }
          fixed = relativizePaths(baseUrl.pathname, fixedUrl.pathname)
          path.node.source = t.stringLiteral(fixed)
        }
      },
    }
  }
};
