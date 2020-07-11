const deleteProp = (object, prop) => Object.keys(object).reduce((obj, key) => {
  console.log('object type', typeof object, typeof obj)
  if (key !== prop) {
    obj[key] = object[key]
  }
  return obj
}, {})

const range = (start, end) => { return (new Array(end - start + 1)).fill(null).map((_, i) => i + start) }

window.range = range
window.deleteProp = deleteProp
export default { 
  deleteProp,
  range,
}