import type { ImageSourcePropType } from 'react-native';
import type { Experience } from '../../domain/discover/types';

/* eslint-disable @typescript-eslint/no-require-imports */
/** PNGs locais (≈2–4 KB cada, paleta reduzida): sem rede, sem SVG. `require` estático é exigido pelo Metro. */
export const experienceImages: Record<Experience, ImageSourcePropType> = {
  praia: require('../../../assets/images/discover/exp-praia.png'),
  montanha: require('../../../assets/images/discover/exp-montanha.png'),
  cidade: require('../../../assets/images/discover/exp-cidade.png'),
  natureza: require('../../../assets/images/discover/exp-natureza.png'),
  neve: require('../../../assets/images/discover/exp-neve.png'),
};

export const destinationImages: Record<string, ImageSourcePropType> = {
  maldivas: require('../../../assets/images/discover/dest-maldivas.png'),
  noronha: require('../../../assets/images/discover/dest-noronha.png'),
  gramado: require('../../../assets/images/discover/dest-gramado.png'),
  jericoacoara: require('../../../assets/images/discover/dest-jericoacoara.png'),
  bariloche: require('../../../assets/images/discover/dest-bariloche.png'),
  lisboa: require('../../../assets/images/discover/dest-lisboa.png'),
  chapada: require('../../../assets/images/discover/dest-chapada.png'),
  rio: require('../../../assets/images/discover/dest-rio.png'),
  santiago: require('../../../assets/images/discover/dest-santiago.png'),
  cancun: require('../../../assets/images/discover/dest-cancun.png'),
  campos: require('../../../assets/images/discover/dest-campos.png'),
  bonito: require('../../../assets/images/discover/dest-bonito.png'),
};
/* eslint-enable @typescript-eslint/no-require-imports */
