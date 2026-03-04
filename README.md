# paketi-nbp

Projekat za predmet Napredne baze podataka

Ovaj projekat predstavlja aplikaciju za fiktivnu kurirsku službu Dev express.

## Funkcionalnosti aplikacije:

- pregled lokacija paketomata na početnoj stranici
- logovanje i registracija korisnika kao fizičko ili pravno lice
- posebni nalozi za kurire i dispečere
- slanje paketa
- pregled poslatih i primljenih paketa
- pregled paketa za isporuku preko naloga kurira
- dodeljivanje paketa kuririma preko naloga dispečera
- ažuriranje statusa paketa od strane kurira
- brisanje paketa iz sistema od strane korisnika

## Tehnologije

- HTML, CSS i JavaScript - frontend
- NodeJS i Express - backend
- MongoDB - baza podataka

U MongoDB-u se čuvaju podaci o fizičkim i pravnim licima, paketima ,paketomatima, kuririma i dispečerima.

## Pokretanje

Prvo klonirati repozitorijum:

```
git clone https://github.com/A-M-1203/paketi-nbp.git
```

Zatim napraviti fajl config.env u root folderu projekta i u njega ubaciti:

```
NODE_ENV=development
PORT=3000
DATABASE=mongodb://localhost:27017/paketi_nbp
DATABASE_PASSWORD=
JWT_SECRET=my-ultra-secure-and-ultra-long-secret
JWT_EXPIRES_IN=5m
JWT_COOKIE_EXPIRES_IN=5
REFRESH_TOKEN_EXPIRES_IN=14
EMAIL_USERNAME=6cb073a8a26400
EMAIL_PASSWORD=f766956eefaa03
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
```

Pokrenuti komandu iz root foldera projekta:

```
docker-compose up -d
```

Otvoriti frontend preko web pretraživača na adresi:

```
localhost:3000
```
