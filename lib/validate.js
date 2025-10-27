export function validateBooking(b) {
  const errors = {};
  const required = ['tripType','pickup','drop','date','time','name','phone'];
  required.forEach((k) => {
    if (!b?.[k] || String(b[k]).trim() === '') errors[k] = 'Required';
  });

  if (b.tripType && !['airport_city','outstation','rental'].includes(b.tripType)) {
    errors.tripType = 'Invalid';
  }

  if (b.tripType === 'outstation' && (!b.approxKm || Number(b.approxKm) <= 0)) {
    errors.approxKm = 'Enter approx. distance in km';
  }
  if (b.tripType === 'rental' && (!b.hours || Number(b.hours) <= 0)) {
    errors.hours = 'Enter number of hours';
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, errors, data: b };
}
