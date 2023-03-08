function isNullOrUndefined(value: string) {
  return value === null || value === undefined;
}

function isAnyNullOrUndefined<T extends string>(...values: T[]) {
  for (const value of values) {
    if (isNullOrUndefined(value)) {
      return true;
    }
  }
  return false;
}

function checkObjectMissingAnyKey(obj: { [key: string]: any }) {
  for (const key in obj) {
    if (isNullOrUndefined(obj[key])) {
      return key;
    }
  }
  return null;
}

function removeOptionalKeys(obj: { [key: string]: any }) {
  const result: { [key: string]: any } = {};
  for (const key in obj) {
    if (!isNullOrUndefined(obj[key])) {
      result[key] = obj[key];
    }
  }
  return result;
}

function isEmptyObject(obj: { [key: string]: any }) {
  return Object.keys(obj).length === 0;
}

function removeKeyObject(obj: { [key: string]: any }, exclude: string[]) {
  for (const key of exclude) {
    delete obj[key];
  }
  return obj;
}

function validateEmail(email: string) {
  let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return !!email.match(regexEmail);
}

function validatePassword(password: string) {
  let regexPassword = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );
  return !!password.match(regexPassword);
}

function compareArrayToArray(array1: string[], array2: string[]) {
  if (Array.isArray(array1) && Array.isArray(array2)) {
    return array1.filter((i) => {
      return array2.includes(i);
    });
  }
  return undefined;
}

export {
  validateEmail,
  validatePassword,
  removeKeyObject,
  isNullOrUndefined,
  isAnyNullOrUndefined,
  checkObjectMissingAnyKey,
  removeOptionalKeys,
  isEmptyObject,
  compareArrayToArray,
};
