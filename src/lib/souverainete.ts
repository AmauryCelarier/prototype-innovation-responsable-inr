export const SOUVERAINETE_REF = [
  {
    id: 'SOUV-1',
    titre: 'Conformité Réglementaire',
    question: 'Quel est votre degré de conformité aux réglementations (NIS2, DORA, RGPD) ?',
    description: 'Anticipation des exigences de sécurité et de résilience imposées par l\'UE.',
    recommandations: {
      0: 'Non-conforme ou non-évalué.',
      1: 'Mise en conformité RGPD de base effectuée.',
      3: 'Analyse d\'impact effectuée pour NIS2 / DORA.',
      5: 'Conformité totale et auditée régulièrement.'
    }
  },
  {
    id: 'SOUV-2',
    titre: 'Juridiction de l\'hébergement',
    question: 'L\'hébergement de vos données critiques est-il opéré sous juridiction européenne ?',
    description: 'Conformité aux lois de protection des données (RGPD) et protection contre les lois extra-européennes (Cloud Act).',
    recommandations: {
      0: 'Hébergement hors UE sans garantie de protection.',
      1: 'Hébergement mixte ou en cours de migration vers l\'UE.',
      3: 'Hébergement 100% UE (France ou Europe).',
      5: 'Hébergement certifié SecNumCloud ou équivalent souverain.'
    }
  },
  {
    id: 'SOUV-3',
    titre: 'Proportion de fournisseurs européens',
    question: 'Quelle est la part de vos fournisseurs techniques basés en Europe ?',
    description: 'L\'objectif est de diversifier les dépendances pour éviter un monopole de solutions extra-européennes.',
    recommandations: {
      0: 'Dépendance totale à des solutions extra-européennes.',
      1: 'Quelques solutions locales pour des services non-critiques.',
      3: 'Majorité de fournisseurs européens pour les services clés.',
      5: 'Indépendance stratégique : alternatives locales identifiées et prêtes.'
    }
  },
  {
    id: 'SOUV-4',
    titre: 'Clauses de réversibilité',
    question: 'Vos contrats incluent-ils des clauses de réversibilité claires ?',
    description: 'Capacité à récupérer vos données et à changer de fournisseur rapidement sans perte d\'activité.',
    recommandations: {
      0: 'Aucune clause de sortie prévue.',
      1: 'Clauses existantes mais complexes ou coûteuses.',
      3: 'Réversibilité contractuelle claire et documentée.',
      5: 'Tests de réversibilité effectués et validés avec succès.'
    }
  },
  {
    id: 'SOUV-5',
    titre: 'Interopérabilité & Standards Ouverts',
    question: 'Vos solutions évitent-elles l\'enfermement propriétaire (Vendor Lock-in) ?',
    description: 'Usage de standards ouverts, d\'APIs documentées ou de logiciels libres (Open Source).',
    recommandations: {
      0: 'Format propriétaire fermé (impossible de migrer).',
      1: 'Usage minoritaire de standards ouverts.',
      3: 'Architecture basée sur des APIs ouvertes et formats standards.',
      5: 'Logiciels Libres / Open Source favorisés systématiquement.'
    }
  },
  {
    id: 'SOUV-6',
    titre: 'Maîtrise des données sensibles',
    question: 'Avez-vous cartographié et protégé vos données sensibles/critiques ?',
    description: 'Identification précise de ce qui doit être protégé en priorité absolue.',
    recommandations: {
      0: 'Aucune cartographie des données.',
      1: 'Inventaire partiel des données stockées.',
      3: 'Cartographie complète et mesures de protection adaptées.',
      5: 'Gouvernance des données active (Chiffrement, cloisonnement).'
    }
  }
];
