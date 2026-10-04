function kClassToHTML(kClass) {
  return `${kClass.k}<sub>${kClass.d}</sub>`;
}

function kClassSetToHTML(kClassSet) {
  return kClassSet.kClasses.map(kClassToHTML).join(',');
}

export { kClassToHTML, kClassSetToHTML };
