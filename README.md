# ShutterProof

ShutterProof est une application décentralisée destinée aux photographes professionnels et leurs clients. Elle permet aux photographes de certifier la paternité de ses oeuvres et de gérer les droits d'auteur. Les droits d'autres sont divibles en deux grandes familles : les droits moraux (incessibles par l'auteur, donnant lieu à l'attribution d'un SBT), et les droits patrimoniaux cessibles par l'auteur, donnant lieu à l'attribution d'un NFT

## Démonstration

La vidéo de démonstration est consultable [ici](https://e.pcloud.link/publink/show?code=XZOpPSZpGhi2PWGX7Q3A7KFfKXSFY7JnSV0)

## Fonctionnement technique

![Schéma introuvable](https://ipfs.io/ipfs/QmcBECQvktGDByfSZEg8BgPjooBZotuV5Lxzq5y9ETcwbt)

## Déploiement
La dApp est déployée sur [Vercel](https://shutterproof.vercel.app/). Les smart contracts sont deployés sur Mumbai. Un seul contrat est déployé manuellement, ShutterProof. Celui ci déploie à son tour le contrat ExclusiveRightsNFT afin de gérer les droits patrimoniaux par NFT. Le contrat PaternitySBT, gérant la preuve de paternité, est déployé à la volée lors de l'enregistrement d'un photographe. La certification équivaut à l'obtention du SBT.

## Tests

Seuls l'utilisation du modifier nonReentrant de OpenZeppelin, ainsi que l'échec des transactions de transfert d'ether n'ont pas été incluses dans les tests automatisés. Le coverage total reste satisfaisant.

![Capture des tests introuvable](https://ipfs.io/ipfs/QmdpwaoYyg2uw5TzCXAc6Fw4BFzs549QsumXDPZNFJRPYc)

## Utilisation

- En tant que photographe
  - Certifier des photos
  - Consulter les photos dont je suis l'auteur
  - Mettre en vente les droits exclusifs de mes photos
  - Acheter les droits exclusifs de photos
- En tant que votant :
  - Mettre en vente les droits exclusifs de photos de photos achetés auparavant
  - Acheter les droits exclusifs de photos
  
Les invités ne peuvent pas agir sur l'application.

## Auteurs
- Olivia L
- Marc-André R
- Philippe V
- Adrien S
