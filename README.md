# GreenLogistics Sales Hub

Je fais partie de la société GreenLogistics, je veux créer une dashbord qui a pour objectif de visualiser les informations réservé aux Commerciaux  avec une authentification car par la suite on ajoutera d'autre user (authentification).
J'aurais besoin d'une base de donnée: table  client (iduuid PK

nom_entreprisetext

contact_emailtext

type_clienttext

statuttext

ca_annuelnumer)
une table devis (iduuid PK

numero_devistext

id_clientuuidFK

statuttext

montant_htnumeric

type_servicetext

optionsjsonb)
une table tarifs (iduuid PK

numero_devistext

id_clientuuidFK

statuttext

montant_htnumeric

type_servicetext

optionsjsonb)
Je voudrais un dashbord de style claire et épuré (en lien avec une charte écologique avec comme couleur dominante vert sapin), avec un fil d'ariane simple, une side barre

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hasna-dashboard-gl.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8142723b-c640-4210-965d-5df682fa5cc1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
