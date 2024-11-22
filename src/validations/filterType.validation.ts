import Joi from "joi";

const getCategoryTypeById = {
  query: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
};

const searchCategoryEventOrganizer = {
  query: Joi.object().keys({
    value: Joi.string().required(),
  }),
};

export default {
  getCategoryTypeById,
  searchCategoryEventOrganizer,
};
