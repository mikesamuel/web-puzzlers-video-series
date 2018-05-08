((global) => {
let { apply } = Reflect
let { hasOwnProperty } = Object
let setHas = Set.prototype.has
let { test } = RegExp.prototype
let { replace, substring } = String.prototype

let whitelist = Object.assign(Object.create(null), {
  // create_trusted produces trusted string wrappers.
  'create_trusted': new Set([
    // The output of the HTML template is safe.
    'html',
    // Only bless constants.
    'legacy_names',
    'trusted_types',
  ])
})

let fragmentQuery = /\/?(?:[?][^#]*)?(?:#[\s\S]*)?$/;
let jsExtension = /(?!^)\.m?js$/;

global.moduleImportInterceptHook = function (base, importer, importee) {
  importee = importee + '';
  base = apply(replace, (base + ''), [fragmentQuery, '/']);
  importer = importer + '';

  // Relativize the import somehow.
  let relImportee = importee.length >= base.length
      ? apply(substring, importee, [base.length]) : null;
  // If we can't relativize the imported module, assume the worst
  // to if we have an https://example.com/ vs https://example.com:443/
  // style ambiguity in module specifier resolution.
  relImportee = apply(replace, relImportee, [jsExtension, '']);
  if (!relImportee) { return '/dev/null'; }

  // If it's not a sensitive module, let import proceed.
  if (!apply(hasOwnProperty, whitelist, [relImportee])) {
    return importee;
  }

  // Check the whitelist
  let relImporter = importer.length >= base.length
      ? apply(substring, importer, [base.length]) : null;
  relImporter = apply(replace, relImporter, [jsExtension, '']);
  if (relImporter && apply(setHas, whitelist[relImportee], [relImporter])) {
    return importee;
  }

  // Violation detected.  Use a naming convention to make it easy to substitute
  // a powerless but API equivalent module if there's no ambiguity.
  let substitute = apply(test, /[#?]/, [importee])
      ? '/dev/null' : apply(replace, importee, [/(?=[.][^/.]*$)|$/, '_fallback'])
  // TODO: Maybe generate a CSP violation to piggyback on their telemetry.
  console.warn(
     `Import denied: ${importer} access to ${importee} got ${substitute} instead`);
  return substitute;
};
})(global);
