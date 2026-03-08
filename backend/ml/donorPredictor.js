// ML Donor Availability Predictor
// Predicts which donors are most likely to respond based on multiple factors

function calculateDonorScore(donor) {
  let score = 100; // Start with perfect score
  const now = new Date();

  // FACTOR 1: Days since last donation (most important)
  if (donor.lastDonationDate) {
    const daysSinceLastDonation = Math.floor(
      (now - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastDonation < 56) {
      // Not eligible yet
      return { score: 0, eligible: false, reason: 'Not eligible — donated less than 56 days ago' };
    } else if (daysSinceLastDonation < 90) {
      score -= 10; // Recently donated, slightly less likely
    } else if (daysSinceLastDonation > 365) {
      score -= 5; // Long gap, might be inactive
    }
  }

  // FACTOR 2: Donation history (more donations = more reliable)
  if (donor.donationCount >= 10) score += 30;
  else if (donor.donationCount >= 5) score += 20;
  else if (donor.donationCount >= 1) score += 10;

  // FACTOR 3: Availability status
  if (!donor.isAvailable) {
    return { score: 0, eligible: false, reason: 'Donor marked as unavailable' };
  }

  // FACTOR 4: Verification status
  if (donor.isVerified) score += 15;

  // FACTOR 5: Blood type rarity bonus
  const rarityBonus = {
    'O-': 25, 'AB-': 20, 'B-': 15, 'A-': 15,
    'O+': 10, 'AB+': 5, 'B+': 0, 'A+': 0
  };
  score += (rarityBonus[donor.bloodType] || 0);

  // FACTOR 6: Badge bonus (engaged donors)
  score += (donor.badges?.length || 0) * 5;

  // Normalize to 0-100
  score = Math.min(100, Math.max(0, score));

  // Prediction label
  let prediction;
  if (score >= 80) prediction = 'Very Likely to Respond';
  else if (score >= 60) prediction = 'Likely to Respond';
  else if (score >= 40) prediction = 'Might Respond';
  else prediction = 'Less Likely to Respond';

  return { score, eligible: true, prediction };
}

function rankDonors(donors) {
  const scored = donors.map(donor => {
    const ml = calculateDonorScore(donor);
    return {
      _id: donor._id,
      name: donor.name,
      bloodType: donor.bloodType,
      city: donor.city,
      phone: donor.phone,
      email: donor.email,
      donationCount: donor.donationCount,
      isVerified: donor.isVerified,
      badges: donor.badges,
      mlScore: ml.score,
      eligible: ml.eligible,
      prediction: ml.prediction || ml.reason
    };
  });

  // Sort by ML score descending
  return scored
    .filter(d => d.eligible)
    .sort((a, b) => b.mlScore - a.mlScore);
}

module.exports = { calculateDonorScore, rankDonors };