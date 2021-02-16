/**
 * Here you can define helper functions to use across your app.
 */
export async function delay(seconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve(); }, seconds * 1000);
  });
}