const key = "AIzaSyANccGIAbYbphTzQ1EgG1JzCUHmESqK1mY";
async function getModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
getModels();
