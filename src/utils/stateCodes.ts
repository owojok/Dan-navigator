export const stateCodes: { [key: string]: string } = {
  'Abia': '01',
  'Adamawa': '02',
  'Akwa Ibom': '03',
  'Anambra': '04',
  'Bauchi': '05',
  'Bayelsa': '06',
  'Benue': '07',
  'Borno': '08',
  'Cross River': '09',
  'Delta': '10',
  'Ebonyi': '11',
  'Edo': '12',
  'Ekiti': '13',
  'Enugu': '14',
  'Gombe': '15',
  'Imo': '16',
  'Jigawa': '17',
  'Kaduna': '18',
  'Kano': '19',
  'Katsina': '20',
  'Kebbi': '21',
  'Kogi': '22',
  'Kwara': '23',
  'Lagos': '24',
  'Nasarawa': '25',
  'Niger': '26',
  'Ogun': '27',
  'Ondo': '28',
  'Osun': '29',
  'Oyo': '30',
  'Plateau': '31',
  'Rivers': '32',
  'Sokoto': '33',
  'Taraba': '34',
  'Yobe': '35',
  'Zamfara': '36',
  'FCT - Abuja': '37',
};

export const getStateCode = (stateName: string): string | undefined => {
  return stateCodes[stateName];
};

export const getStateName = (stateCode: string): string | undefined => {
  return Object.keys(stateCodes).find(name => stateCodes[name] === stateCode);
};
