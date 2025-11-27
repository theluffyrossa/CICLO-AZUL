export const getWasteTypeEmoji = (name: string): string => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('papelão') || lowerName.includes('papelao')) {
    return '📦';
  }

  if (lowerName.includes('papel') || lowerName.includes('revista') || lowerName.includes('jornal')) {
    return '📄';
  }

  if (lowerName.includes('livro')) {
    return '📚';
  }

  if (lowerName.includes('cartão') || lowerName.includes('cartao')) {
    return '🎴';
  }

  if (lowerName.includes('pet') || lowerName.includes('garrafa plástica') || lowerName.includes('garrafa plastica')) {
    return '🧴';
  }

  if (lowerName.includes('plástico') || lowerName.includes('plastico') || lowerName.includes('sacola')) {
    return '🛍️';
  }

  if (lowerName.includes('lata') || lowerName.includes('alumínio') || lowerName.includes('aluminio')) {
    return '🥫';
  }

  if (lowerName.includes('metal') || lowerName.includes('ferro') || lowerName.includes('aço')) {
    return '🔩';
  }

  if (lowerName.includes('vidro')) {
    return '🍾';
  }

  if (lowerName.includes('compostável') || lowerName.includes('compostavel') || lowerName.includes('composto')) {
    return '🌻';
  }

  if (lowerName.includes('orgânico') || lowerName.includes('organico') || lowerName.includes('alimento')) {
    return '🍂';
  }

  if (lowerName.includes('bateria') || lowerName.includes('pilha')) {
    return '🔋';
  }

  if (lowerName.includes('eletrônico') || lowerName.includes('eletronico') || lowerName.includes('e-lixo')) {
    return '💾';
  }

  if (lowerName.includes('computador') || lowerName.includes('notebook')) {
    return '💻';
  }

  if (lowerName.includes('celular') || lowerName.includes('smartphone') || lowerName.includes('telefone')) {
    return '📱';
  }

  if (lowerName.includes('monitor') || lowerName.includes('televisão') || lowerName.includes('tv')) {
    return '📺';
  }

  if (lowerName.includes('cabo') || lowerName.includes('fio')) {
    return '🔌';
  }

  if (lowerName.includes('madeira') || lowerName.includes('tábua') || lowerName.includes('tabua')) {
    return '🪵';
  }

  if (lowerName.includes('roupa') || lowerName.includes('vestuário') || lowerName.includes('vestuario')) {
    return '👕';
  }

  if (lowerName.includes('têxtil') || lowerName.includes('textil') || lowerName.includes('tecido')) {
    return '🧵';
  }

  if (lowerName.includes('óleo') || lowerName.includes('oleo') || lowerName.includes('gordura')) {
    return '🛢️';
  }

  if (lowerName.includes('tóxico') || lowerName.includes('toxico')) {
    return '☠️';
  }

  if (lowerName.includes('perigoso') || lowerName.includes('químico') || lowerName.includes('quimico')) {
    return '☢️';
  }

  if (lowerName.includes('hospitalar') || lowerName.includes('médico') || lowerName.includes('medico')) {
    return '🏥';
  }

  if (lowerName.includes('remédio') || lowerName.includes('medicamento')) {
    return '💊';
  }

  if (lowerName.includes('borracha') || lowerName.includes('pneu')) {
    return '⚫';
  }

  if (lowerName.includes('entulho') || lowerName.includes('construção') || lowerName.includes('construcao')) {
    return '🧱';
  }

  if (lowerName.includes('isopor') || lowerName.includes('espuma')) {
    return '⬜';
  }

  if (lowerName.includes('lâmpada') || lowerName.includes('lampada')) {
    return '💡';
  }

  if (lowerName.includes('embalagem')) {
    return '📦';
  }

  if (lowerName.includes('caixa')) {
    return '🗃️';
  }

  if (lowerName.includes('tetra') || lowerName.includes('cartonado')) {
    return '🧃';
  }

  if (lowerName.includes('spray') || lowerName.includes('aerosol')) {
    return '🧯';
  }

  if (lowerName.includes('tinta') || lowerName.includes('verniz')) {
    return '🎨';
  }

  if (lowerName.includes('vidro')) {
    return '🍾';
  }

  return '🗑️';
};
