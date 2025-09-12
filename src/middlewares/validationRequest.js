const Joi = require("joi");

const applicationSchema = Joi.object({
  fullName: Joi.string().min(2).max(200).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).max(18).required(),
  category: Joi.string()
    .valid("cetaa", "engineers_club", "delegate")
    .required(),
  batch: Joi.alternatives().conditional("category", {
    is: "cetaa",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
});

function validateApplication(req, res, next) {
  const { error, value } = applicationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ errors: error.details.map((d) => d.message) });
  }
  req.validatedBody = value;
  next();
}

module.exports = { validateApplication };
