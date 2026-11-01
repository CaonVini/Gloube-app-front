import type { ImageSourcePropType } from 'react-native';

/**
 * ÚNICO arquivo de mapeamento das imagens do fluxo Descubra. Para usar fotos reais, substitua os JPGs em
 * assets/images/discover/photos/ (mesmo nome) ou aponte os `require` abaixo para os novos arquivos.
 * `require` estático é exigido pelo Metro. Tudo local: sem URLs externas, sem SVG.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
export const quizPhotos = {
  'clima-frio': require('../../../assets/images/discover/photos/q-clima-frio.jpg'),
  'clima-calor': require('../../../assets/images/discover/photos/q-clima-calor.jpg'),
  'clima-tanto-faz': require('../../../assets/images/discover/photos/q-clima-tanto-faz.jpg'),
  'exp-praia': require('../../../assets/images/discover/photos/q-exp-praia.jpg'),
  'exp-montanha': require('../../../assets/images/discover/photos/q-exp-montanha.jpg'),
  'exp-cidade': require('../../../assets/images/discover/photos/q-exp-cidade.jpg'),
  'exp-natureza': require('../../../assets/images/discover/photos/q-exp-natureza.jpg'),
  'exp-neve': require('../../../assets/images/discover/photos/q-exp-neve.jpg'),
  'alcance-perto': require('../../../assets/images/discover/photos/q-alcance-perto.jpg'),
  'alcance-brasil': require('../../../assets/images/discover/photos/q-alcance-brasil.jpg'),
  'alcance-internacional': require('../../../assets/images/discover/photos/q-alcance-internacional.jpg'),
  'comp-casal': require('../../../assets/images/discover/photos/q-comp-casal.jpg'),
  'comp-amigos': require('../../../assets/images/discover/photos/q-comp-amigos.jpg'),
  'comp-familia': require('../../../assets/images/discover/photos/q-comp-familia.jpg'),
  'comp-solo': require('../../../assets/images/discover/photos/q-comp-solo.jpg'),
} satisfies Record<string, ImageSourcePropType>;

export type QuizPhotoKey = keyof typeof quizPhotos;

export const destinationImages: Record<string, ImageSourcePropType> = {
  maldivas: require('../../../assets/images/discover/photos/d-maldivas.jpg'),
  noronha: require('../../../assets/images/discover/photos/d-noronha.jpg'),
  gramado: require('../../../assets/images/discover/photos/d-gramado.jpg'),
  jericoacoara: require('../../../assets/images/discover/photos/d-jericoacoara.jpg'),
  bariloche: require('../../../assets/images/discover/photos/d-bariloche.jpg'),
  lisboa: require('../../../assets/images/discover/photos/d-lisboa.jpg'),
  chapada: require('../../../assets/images/discover/photos/d-chapada.jpg'),
  rio: require('../../../assets/images/discover/photos/d-rio.jpg'),
  santiago: require('../../../assets/images/discover/photos/d-santiago.jpg'),
  cancun: require('../../../assets/images/discover/photos/d-cancun.jpg'),
  campos: require('../../../assets/images/discover/photos/d-campos.jpg'),
  bonito: require('../../../assets/images/discover/photos/d-bonito.jpg'),
};

export const avatarPhoto: ImageSourcePropType = require('../../../assets/images/discover/avatar.jpg');
/* eslint-enable @typescript-eslint/no-require-imports */
