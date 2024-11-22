import { Role } from "@prisma/client";
import Joi from "joi";
import { query } from "winston";

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    role: Joi.string().required().valid(Role.CUSTOMER, Role.ORGANIZER),
    phone: Joi.string().required(),
    birthday: Joi.string().required(),
    image: Joi.string(),
  }),
};

const createMetamaskUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    wallet: Joi.string().required(),
    name: Joi.string().required(),
    role: Joi.string().required().valid(Role.CUSTOMER, Role.ORGANIZER),
    birthday: Joi.string().required(),
    nameForNFT: Joi.string(),
    image: Joi.string(),
  }),
};

const logout = {
  body: Joi.object().keys({
    token: Joi.string(),
  }),
};

const createGoogleUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    picture: Joi.string().required(),
    name: Joi.string().required(),
    role: Joi.string().required().valid(Role.CUSTOMER, Role.ORGANIZER),
    nameForNFT: Joi.string(),
    image: Joi.string(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUserId = {
  query: Joi.object().keys({
    userId: Joi.string(),
  }),
};

const getOrganizerStatistics = {
  query: Joi.object().keys({
    userId: Joi.string(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string(),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};

const verify = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    userId: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const requestPasswordReset = {
  body: Joi.object().keys({
    email: Joi.string().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    token: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
};

const getOrganizerDashboardForMobile = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const createOrg = {
  body: Joi.object()
    .keys({
      name: Joi.string().required().label("Ad Soyad"),
      email: Joi.string().email().required().label("E-posta"),
      phone: Joi.string().required().label("Telefon Numarası"),
      birthday: Joi.date().required().label("Doğum Tarihi"),
      password: Joi.string().min(8).required().label("Şifre"),
      companyType: Joi.string().required().label("Şirket Tipi"),
      imzaSirkusu: Joi.any().optional().label("İmza Sirküleri"),
      vergiLevha: Joi.any().optional().label("Vergi Levhası"),
      ticaretSicilGazetesi: Joi.any()
        .optional()
        .label("Ticaret Sicil Gazetesi Yazısı"),
      tcFotokopi: Joi.any().optional().label("Nüfus Cüzdanı Fotokopisi"),
      imzaBeyannamesi: Joi.any().optional().label("İmza Beyannamesi"),
      companyAddress: Joi.string().optional().label("Şirket Adresi"),
      companyPhone: Joi.string().optional().label("Şirket Telefon Numarası"),
      bankAccount: Joi.string().optional().label("Banka Hesap Numarası"),
      bankBranch: Joi.string().optional().label("Banka Şube Adı"),
      iban: Joi.string().optional().label("IBAN Numarası"),
      accountName: Joi.string().optional().label("Hesap Adı"),
      accountantEmail: Joi.string()
        .email()
        .optional()
        .label("Muhasebeci E-posta Adresi"),
    })
    .or(
      "imzaSirkusu",
      "vergiLevha",
      "ticaretSicilGazetesi",
      "tcFotokopi",
      "imzaBeyannamesi",
    ),
};

export default {
  createUser,
  createMetamaskUser,
  createGoogleUser,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserId,
  verify,
  resetPassword,
  requestPasswordReset,
  logout,
  getOrganizerStatistics,
  getOrganizerDashboardForMobile,
  createOrg,
};
