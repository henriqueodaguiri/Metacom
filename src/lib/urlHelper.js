export function getImageNameFromFireBaseUrl(firebaseUrl) {
  const regex = /\/o\/[^%]*%2F([^?]*)/;
  const match = firebaseUrl.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
}