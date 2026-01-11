const SIERRA_LEONE_LOCATIONS = [
  // Western Area
  "Freetown",
  "Western Area Urban",
  "Western Area Rural",

  // Northern Province
  "Bombali",
  "Tonkolili",
  "Kambia",
  "Port Loko",
  "Koinadugu",
  "Falaba",
  "Karene",

  // Southern Province
  "Bo",
  "Bonthe",
  "Moyamba",
  "Pujehun",

  // Eastern Province
  "Kenema",
  "Kailahun",
  "Kono",
];


export const validateSierraLeoneAddress = (addressDetails) => {
  if (!addressDetails || typeof addressDetails !== "string") return false;

  const normalized = addressDetails.toLowerCase();

  return SIERRA_LEONE_LOCATIONS.some((location) =>
    normalized.includes(location.toLowerCase())
  );
};
