const validator = (schema, request) => {
  const result = schema.validate(request, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (result.error) {
    const error = result.error.details.map((detail) => detail.message);
    return { error, value: null };
  } else {
    return { error: null, value: result.value };
  }
};

export default validator;
