import { ProfileInput } from "../types/ProfileInput";
import { hasProfanity } from "../services/offensiveWords";

const MIN_LENGTH = 2;

const profileFields: (keyof ProfileInput)[] = [
  "workplace",
  "from",
  "city",
  "relationship",
  "education",
];

export const validateProfileInput = (profileInput: ProfileInput) => {
  for (const field of profileFields) {
    const value = profileInput[field] as string;
    if (value.length <= MIN_LENGTH || hasProfanity(value)) {
      return {
        message: `Invalid ${field}`,
        errors: [
          {
            field,
            message: `${field} phải dài hơn ${MIN_LENGTH} ký tự và không chứa từ ngữ không phù hợp`,
          },
        ],
      };
    }
  }
  return null;
};
