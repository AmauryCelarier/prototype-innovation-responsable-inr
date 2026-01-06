export function calculateScores(questions: any[], responses: Record<number, string>) {
  const stats: Record<string, { totalWeightedNote: number; totalWeight: number; answered: number; total: number }> = {};

  questions.forEach((q) => {
    // Initialiser la dimension si elle n'existe pas
    if (!stats[q.dimension]) {
      stats[q.dimension] = { totalWeightedNote: 0, totalWeight: 0, answered: 0, total: 0 };
    }

    stats[q.dimension].total++;

    const response = responses[q.id];
    // On ne calcule que si c'est un chiffre (on ignore N/A et les questions ouvertes textuelles)
    if (response && !isNaN(parseInt(response))) {
      const note = parseInt(response);
      const weight = q.niveau === 1 ? 1 : q.niveau === 2 ? 0.75 : 0.5;

      stats[q.dimension].totalWeightedNote += note * weight;
      stats[q.dimension].totalWeight += weight;
      stats[q.dimension].answered++;
    }
  });

  // Calculer le pourcentage global de progression
  const totalQuestions = questions.length;
  const totalAnswered = Object.keys(responses).length;
  const progressPercent = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  return { stats, progressPercent };
}