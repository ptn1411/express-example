import { ProfileInput } from "../types/ProfileInput";
import { hasProfanity } from "../services/offensiveWords";
export const validateProfileInput = (profileInput: ProfileInput) => {
  if (
    profileInput.workplace.length <= 2 ||
    hasProfanity(profileInput.workplace)
  ) {
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
  if (profileInput.from.length <= 2 || hasProfanity(profileInput.from)) {
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
  if (profileInput.city.length <= 2 || hasProfanity(profileInput.city)) {
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
  if (
    profileInput.relationship.length <= 2 ||
    hasProfanity(profileInput.relationship)
  ) {
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
  if (
    profileInput.education.length <= 2 ||
    hasProfanity(profileInput.education)
  ) {
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
