function normalizePaymentStatus(status) {
  switch (status) {
    case "success":
      return "paid";
    case "failed":
      return "failed";
    case "processing":
    default:
      return "processing";
  }
}

function generateReferenceId(data) {
  console.log(data);
  // Create a timestamp component
  const timestamp = Date.now().toString(36);

  // Create initials from full name
  const initials = data.fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  // Create category prefix
  const categoryPrefix = data.category.substring(0, 3).toUpperCase();

  // Add a random component
  const number = data.phone.slice(-4);

  console.log(number);

  // Combine all components
  return `REF_${categoryPrefix}_${initials}_${timestamp}_${number}`;
}

module.exports = {
  normalizePaymentStatus,
  generateReferenceId,
};
