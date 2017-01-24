module.exports = {
  device : {
    name: 'Teleinfo Module',
    protocol: 'teleinfo',
    service: 'teleinfo',
    identifier: 'teleinfo'
  },
  deviceTypes : [
    {
      name: 'Intensité souscrite',
      type: 'teleinfo',
      identifier: 'isousc',
      tag: 'isousc',
      sensor: false,
      min: 0,
      max: 99,
      display: false
    },
    {
      name: 'Puissance Tarifaire En Cours',
      type: 'teleinfo',
      identifier: 'ptec',
      tag: 'ptec',
      sensor: true,
      min: 0,
      max: 9,
      display: false
    },
    {
      name: 'Puissance Apparente',
      type: 'teleinfo',
      identifier: 'papp',
      tag: 'papp',
      sensor: true,
      min: 0,
      max: 9999,
      display: false
    },
    {
      name: 'Intensité Instantanée',
      type: 'teleinfo',
      identifier: 'iinst',
      tag: 'iinst',
      sensor: true,
      min: 0,
      max: 999,
      display: false
    },
    {
      name: 'Couleur de demain (tarif Tempo)',
      type: 'teleinfo',
      identifier: 'tomorrow',
      tag: 'tomorrow',
      sensor: true,
      min: 0,
      max: 2,
      display: false
    }
  ],
  paramContract: {
    name: 'Contrat EDF',
    value: '00000000000'
  }
}
