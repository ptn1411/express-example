import { UpdateUserInput } from "../types/UpdateUserInput";
import { hasProfanity } from "../services/offensiveWords";
export const validateUpdateUserInput = (updateUserInput: UpdateUserInput) => {
  if (updateUserInput.avatar.length <= 5) {
    return {
      message: "sai avatar",
      errors: [
        {
          field: "avatar",
          message: "do dai cua avatar phai dai 5 ",
        },
      ],
    };
  }
  if (
    updateUserInput.fullName.length <= 5 ||
    hasProfanity(updateUserInput.fullName)
  ) {
    return {
      message: "sai fullName",
      errors: [
        {
          field: "fullName",
          message: "do dai cua fullName phai dai 5 ",
        },
      ],
    };
  }
  if (updateUserInput.coverImage.length <= 5) {
    return {
      message: "sai coverImage",
      errors: [
        {
          field: "coverImage",
          message: "do dai cua username phai dai 5 ",
        },
      ],
    };
  }
  if (
    updateUserInput.firstName.length <= 2 ||
    hasProfanity(updateUserInput.firstName)
  ) {
    return {
      message: "sai firstName",
      errors: [
        {
          field: "firstName",
          message: "do dai cua username phai dai 5 ",
        },
      ],
    };
  }
  if (
    updateUserInput.lastName.length <= 2 ||
    hasProfanity(updateUserInput.lastName)
  ) {
    return {
      message: "sai lastName",
      errors: [
        {
          field: "lastName",
          message: "do dai cua username phai dai 5 ",
        },
      ],
    };
  }

  return null;
};
