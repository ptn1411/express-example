import { validateEmail, validatePassword } from "./index";
import { RegisterInput } from "../types/RegisterInput";

export const validateRegisterInput = (registerInput: RegisterInput) => {
  if (!validateEmail(registerInput.email)) {
    return {
      message: "Sai email",
      errors: [
        {
          field: "email",
          message: "khong phai email",
        },
      ],
    };
  }
  if (registerInput.username.length <= 5) {
    return {
      message: "sai username",
      errors: [
        {
          field: "username",
          message: "do dai cua username phai dai 5 ",
        },
      ],
    };
  }
  if (registerInput.username.includes("@")) {
    return {
      message: "sai username",
      errors: [
        {
          field: "username",
          message: "username co ky tu @",
        },
      ],
    };
  }
  if (registerInput.phone.length <= 9) {
    return {
      message: "sai phone",
      errors: [
        {
          field: "phone",
          message: "do dai cua phone phai dai 9 ",
        },
      ],
    };
  }

  if (registerInput.lastName.length <= 1) {
    return {
      message: "sai lastName",
      errors: [
        {
          field: "lastName",
          message: "do dai cua lastName phai dai 9 ",
        },
      ],
    };
  }
  if (registerInput.firstName.length <= 1) {
    return {
      message: "sai firstName",
      errors: [
        {
          field: "firstName",
          message: "do dai cua firstName phai dai 9 ",
        },
      ],
    };
  }
  if (!validatePassword(registerInput.password)) {
    return {
      message: "sai password",
      errors: [
        {
          field: "password",
          message: "password phai co ky tu dawc biet 8 ky tu co in hoa",
        },
      ],
    };
  }

  return null;
};
