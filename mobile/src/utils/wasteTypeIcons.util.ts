import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export const getWasteTypeIcon = (name: string): IoniconsName => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('papelão') || lowerName.includes('papelao')) {
    return 'cube-outline';
  }

  if (lowerName.includes('papel')) {
    return 'document-text-outline';
  }

  if (lowerName.includes('revista')) {
    return 'book-outline';
  }

  if (lowerName.includes('jornal')) {
    return 'newspaper-outline';
  }

  if (lowerName.includes('livro')) {
    return 'book';
  }

  if (lowerName.includes('cartão') || lowerName.includes('cartao')) {
    return 'card-outline';
  }

  if (lowerName.includes('garrafa pet') || (lowerName.includes('pet') && lowerName.includes('garrafa'))) {
    return 'cube-outline';
  }

  if (lowerName.includes('plástico') || lowerName.includes('plastico')) {
    return 'cube';
  }

  if (lowerName.includes('sacola')) {
    return 'bag-handle-outline';
  }

  if (lowerName.includes('lata')) {
    return 'beer-outline';
  }

  if (lowerName.includes('alumínio') || lowerName.includes('aluminio')) {
    return 'pint-outline';
  }

  if (lowerName.includes('metal')) {
    return 'hardware-chip-outline';
  }

  if (lowerName.includes('ferro')) {
    return 'magnet-outline';
  }

  if (lowerName.includes('aço')) {
    return 'construct-outline';
  }

  if (lowerName.includes('vidro')) {
    return 'wine-outline';
  }

  if (lowerName.includes('compost')) {
    return 'leaf-outline';
  }

  if (lowerName.includes('orgânico') || lowerName.includes('organico')) {
    return 'nutrition-outline';
  }

  if (lowerName.includes('alimento')) {
    return 'fast-food-outline';
  }

  if (lowerName.includes('bateria')) {
    return 'battery-charging-outline';
  }

  if (lowerName.includes('pilha')) {
    return 'battery-half-outline';
  }

  if (lowerName.includes('eletrônico') || lowerName.includes('eletronico')) {
    return 'hardware-chip-outline';
  }

  if (lowerName.includes('computador')) {
    return 'desktop-outline';
  }

  if (lowerName.includes('notebook')) {
    return 'laptop-outline';
  }

  if (lowerName.includes('celular') || lowerName.includes('smartphone')) {
    return 'phone-portrait-outline';
  }

  if (lowerName.includes('telefone')) {
    return 'call-outline';
  }

  if (lowerName.includes('monitor')) {
    return 'desktop-outline';
  }

  if (lowerName.includes('televisão') || lowerName.includes('tv')) {
    return 'tv-outline';
  }

  if (lowerName.includes('cabo')) {
    return 'cable-outline';
  }

  if (lowerName.includes('fio')) {
    return 'git-network-outline';
  }

  if (lowerName.includes('madeira')) {
    return 'log-outline';
  }

  if (lowerName.includes('tábua') || lowerName.includes('tabua')) {
    return 'grid-outline';
  }

  if (lowerName.includes('roupa')) {
    return 'shirt-outline';
  }

  if (lowerName.includes('vestuário') || lowerName.includes('vestuario')) {
    return 'person-outline';
  }

  if (lowerName.includes('têxtil') || lowerName.includes('textil')) {
    return 'prism-outline';
  }

  if (lowerName.includes('tecido')) {
    return 'layers-outline';
  }

  if (lowerName.includes('óleo') || lowerName.includes('oleo')) {
    return 'water-outline';
  }

  if (lowerName.includes('gordura')) {
    return 'flask-outline';
  }

  if (lowerName.includes('tóxico') || lowerName.includes('toxico')) {
    return 'skull-outline';
  }

  if (lowerName.includes('perigoso')) {
    return 'warning-outline';
  }

  if (lowerName.includes('químico') || lowerName.includes('quimico')) {
    return 'beaker-outline';
  }

  if (lowerName.includes('hospitalar')) {
    return 'medkit-outline';
  }

  if (lowerName.includes('médico') || lowerName.includes('medico')) {
    return 'medical-outline';
  }

  if (lowerName.includes('remédio') || lowerName.includes('medicamento')) {
    return 'bandage-outline';
  }

  if (lowerName.includes('borracha')) {
    return 'ellipse-outline';
  }

  if (lowerName.includes('pneu')) {
    return 'radio-button-on-outline';
  }

  if (lowerName.includes('entulho')) {
    return 'layers-outline';
  }

  if (lowerName.includes('construção') || lowerName.includes('construcao')) {
    return 'hammer-outline';
  }

  if (lowerName.includes('isopor')) {
    return 'square-outline';
  }

  if (lowerName.includes('espuma')) {
    return 'cube-outline';
  }

  if (lowerName.includes('lâmpada') || lowerName.includes('lampada')) {
    return 'bulb-outline';
  }

  if (lowerName.includes('embalagem')) {
    return 'archive-outline';
  }

  if (lowerName.includes('caixa')) {
    return 'file-tray-stacked-outline';
  }

  if (lowerName.includes('tetra')) {
    return 'prism-outline';
  }

  if (lowerName.includes('cartonado')) {
    return 'albums-outline';
  }

  if (lowerName.includes('spray')) {
    return 'color-wand-outline';
  }

  if (lowerName.includes('aerosol')) {
    return 'color-filter-outline';
  }

  if (lowerName.includes('tinta')) {
    return 'color-palette-outline';
  }

  if (lowerName.includes('verniz')) {
    return 'brush-outline';
  }

  return 'trash-outline';
};
