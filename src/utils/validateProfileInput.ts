import { ProfileInput } from "../types/ProfileInput";

export const validateProfileInput = (profileInput: ProfileInput) => {
  if (profileInput.workplace.length <= 2) {
    return {
      message: "sai workplace",
      errors: [
        {
          field: "workplace",
          message: "do dai cua username phai dai 5 ",
        },
      ],
    };
  }
  if (profileInput.from.length <= 2) {
    return {
      message: "sai from",
      errors: [
        {
          field: "from",
          message: "do dai cua username phai dai 5 ",
        },
      ],
    };
  }
  if (profileInput.city.length <= 2) {
    return {
      message: "sai city",
      errors: [
        {
          field: "city",
          message: "do dai cua username phai dai 5 ",
        },
      ],
    };
  }
  if (profileInput.relationship.length <= 2) {
    return {
      message: "sai relationship",
      errors: [
        {
          field: "relationship",
          message: "do dai cua username phai dai 5 ",
        },
      ],
    };
  }
  if (profileInput.education.length <= 2) {
    return {
      message: "sai education",
      errors: [
        {
          field: "education",
          message: "do dai cua username phai dai 5 ",
        },
      ],
    };
  }
  return null;
};
