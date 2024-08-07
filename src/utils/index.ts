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

function dateNow() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm: any = today.getMonth() + 1; // Months start at 0!
  let dd: any = today.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  const date = dd + "/" + mm + "/" + yyyy;
  const dateNoTiles = `${dd}${mm}${yyyy}`;
  const yearNoTiles = `${yyyy}${mm}${dd}`;
  return { date, dateNoTiles, yearNoTiles, dd, mm, yyyy };
}

function hideEmailElement(email: string) {
  const emailMatch = email.split("@");
  const data: string[] = [];
  const nameEmail = emailMatch[0] as string;
  data.push(nameEmail.slice(0, 2));
  for (let i = 0; i < nameEmail.length; i++) {
    if (i >= 2) {
      data.push("*");
    }
  }

  return {
    domain: emailMatch[1],
    name: nameEmail,
    emailHide: `${data.join("")}@${emailMatch[1]}`,
  };
}
function hidePhoneElement(phone: string) {
  const data: string[] = [];

  for (let i = 0; i < phone.slice(0, -2).length; i++) {
    data.push("*");
  }
  data.push(phone.slice(-2));
  return {
    phone: phone,
    phoneHide: data.join(""),
  };
}
export {
  validateEmail,
  hideEmailElement,
  hidePhoneElement,
  validatePassword,
  removeKeyObject,
  isNullOrUndefined,
  isAnyNullOrUndefined,
  checkObjectMissingAnyKey,
  removeOptionalKeys,
  isEmptyObject,
  compareArrayToArray,
  dateNow,
};
