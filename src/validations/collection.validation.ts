import Joi from "joi";

const getOrgId = {
  query: Joi.object().keys({
    orgId: Joi.string().required(),
  }),
};

const getCustomerId = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const createCollection = {
  body: Joi.object().keys({
    orgId: Joi.string()
      .uuid({ version: "uuidv4" }) // Validate that orgId is a valid UUID v4
      .required()
      .messages({
        "string.empty": "Organizatör ID boş olamaz.",
        "string.guid": "Geçerli bir UUID olması gerekiyor.",
      }),

    name: Joi.string().min(3).max(100).required().messages({
      "string.empty": "Koleksiyon adı boş olamaz.",
      "string.min": "Koleksiyon adı en az 3 karakter olmalıdır.",
      "string.max": "Koleksiyon adı en fazla 100 karakter olabilir.",
    }),

    discountPercentage: Joi.number().min(0).max(100).required().messages({
      "number.base": "İndirim yüzdesi bir sayı olmalıdır.",
      "number.min": "İndirim yüzdesi 0'dan küçük olamaz.",
      "number.max": "İndirim yüzdesi 100'den büyük olamaz.",
    }),

    expireAt: Joi.date().iso().required().messages({
      "date.base": "Geçerli bir tarih formatı olmalıdır.",
      "date.iso": "Bitiş tarihi ISO formatında olmalıdır (YYYY-MM-DD).",
    }),
    image: Joi.string().required(),
    events: Joi.array()
      .items(Joi.string().uuid({ version: "uuidv4" }).required()) // Validate that each event ID is a UUID
      .min(1)
      .required()
      .messages({
        "array.base": "Etkinlikler geçerli bir dizi olmalıdır.",
        "array.min": "En az bir etkinlik seçilmelidir.",
        "string.guid": "Etkinlik ID'leri geçerli UUID olmalıdır.",
      }),

    eventsToUse: Joi.array()
      .items(Joi.string().uuid({ version: "uuidv4" }).required()) // Validate that each applicable event ID is a UUID
      .min(1)
      .required()
      .messages({
        "array.base":
          "Kuponun geçerli olduğu etkinlikler geçerli bir dizi olmalıdır.",
        "array.min": "Kupon için en az bir geçerli etkinlik seçilmelidir.",
        "string.guid": "Etkinlik ID'leri geçerli UUID olmalıdır.",
      }),
  }),
};

export default {
  getOrgId,
  getCustomerId,
  createCollection,
};
